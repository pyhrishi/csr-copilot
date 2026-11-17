import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { getFacts, getRules, getSections, getTlfs } from "@/lib/data/seed";
import { renderSlots } from "@/lib/slots/render";
import type { DraftSentence } from "@/lib/types";
import { buildReferenceIndex, loadRules, validateSentence } from "@/lib/validate";

import {
  applySuggestionToTemplate,
  createChipElement,
  extractTemplateFromDom,
  insertChipAtSelection,
} from "./editor-utils";
import { SentenceInlineEditor } from "./SentenceInlineEditor";

describe("SentenceInlineEditor & editor-utils", () => {
  const facts = getFacts();
  const tlfs = getTlfs();
  const rules = getRules();
  const sections = getSections();

  const factMap = new Map(facts.map((f) => [f.id, f]));
  const compiledRules = loadRules(rules);
  const references = buildReferenceIndex({ tlfs, sections });
  const validationCtx = { facts: factMap, rules: compiledRules, references };

  afterEach(() => {
    cleanup();
  });

  const template122s3 =
    "The most frequently reported TEAE was hypotension, which was significantly more common with velorantib ({F:14.3.1.2.hypotension.velo}) than with placebo ({F:14.3.1.2.hypotension.pbo}).";

  const testSentence: DraftSentence = {
    id: "12.2-s3",
    sectionId: "12.2",
    template: template122s3,
    rendered: renderSlots(template122s3, { facts }),
    provenance: "ai",
    state: "pending",
    cites: ["14.3.1.2"],
    generation: {
      mode: "simulated",
      promptVersion: "v1.0",
      templateVersion: "v1.0",
      at: new Date().toISOString(),
    },
    findings: [],
  };

  it("renders non-editable atomic chips for fact slots", () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();

    const { container } = render(
      <SentenceInlineEditor
        sentence={testSentence}
        facts={facts}
        onSave={onSave}
        onCancel={onCancel}
      />,
    );

    const chips = container.querySelectorAll("span[contenteditable='false']");
    expect(chips.length).toBeGreaterThanOrEqual(2);
    expect(chips[0]).toHaveAttribute("data-slot", "{F:14.3.1.2.hypotension.velo}");
    expect(chips[1]).toHaveAttribute("data-slot", "{F:14.3.1.2.hypotension.pbo}");
  });

  it("extracts template with atomic slots preserved", () => {
    const container = document.createElement("div");
    container.appendChild(document.createTextNode("Prefix text "));
    const chip = createChipElement("fact-123", "12 (3.4%)", "{F:fact-123}");
    container.appendChild(chip);
    container.appendChild(document.createTextNode(" suffix text."));

    const extracted = extractTemplateFromDom(container);
    expect(extracted).toBe("Prefix text {F:fact-123} suffix text.");
  });

  it("triggers NUM-001 critical finding when raw numeral is typed", () => {
    const rawNumeralTemplate =
      "Hypotension was observed in 201 patients in the velorantib group ({F:14.3.1.2.hypotension.velo}).";

    const findings = validateSentence(
      { template: rawNumeralTemplate, cites: ["14.3.1.2"] },
      validationCtx,
    );

    const numFinding = findings.find((f) => f.ruleId === "NUM-001");
    expect(numFinding).toBeDefined();
    expect(numFinding?.severity).toBe("critical");
    expect(numFinding?.message).toContain("201");
  });

  it("applySuggestionToTemplate rewrites STAT-001 text and clears finding", () => {
    // 1. Validate original sentence with STAT-001
    const originalFindings = validateSentence(
      { template: testSentence.template, cites: testSentence.cites },
      validationCtx,
    );
    const statFinding = originalFindings.find((f) => f.ruleId === "STAT-001");
    expect(statFinding).toBeDefined();

    // 2. Apply fix
    const fixedTemplate = applySuggestionToTemplate(testSentence.template, statFinding!);
    expect(fixedTemplate).toContain("more frequent with velorantib");
    expect(fixedTemplate).not.toContain("significantly");

    // 3. Re-validate fixed template
    const newFindings = validateSentence(
      { template: fixedTemplate, cites: testSentence.cites },
      validationCtx,
    );
    expect(newFindings.filter((f) => f.ruleId === "STAT-001")).toHaveLength(0);
  });

  it("inserts fact chip into selection or container", () => {
    const container = document.createElement("div");
    container.contentEditable = "true";
    document.body.appendChild(container);

    const testFact = facts[0];
    const inserted = insertChipAtSelection(container, testFact);

    expect(inserted).toBe(true);
    const chip = container.querySelector("span[data-fact-id]");
    expect(chip).not.toBeNull();
    expect(chip?.getAttribute("data-slot")).toBe(`{F:${testFact.id}}`);
    expect(chip?.textContent).toBe(testFact.display);

    document.body.removeChild(container);
  });

  it("fires onSave when Save button is clicked", () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();

    const { getByText } = render(
      <SentenceInlineEditor
        sentence={testSentence}
        facts={facts}
        onSave={onSave}
        onCancel={onCancel}
      />,
    );

    const saveText = getByText("Save sentence");
    const saveBtn = saveText.closest("button")!;
    expect(saveBtn).not.toBeNull();
    fireEvent.click(saveBtn);

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith(testSentence.template);
  });
});
