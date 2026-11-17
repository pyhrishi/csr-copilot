import { describe, expect, it } from "vitest";

import { getFacts, getRules, getSections, getTlfs } from "@/lib/data/seed";
import type { DraftSentence } from "@/lib/types";
import { generateSimulatedDraft } from "./simulated";

describe("generateSimulatedDraft", () => {
  const sections = getSections();
  const facts = getFacts();
  const tlfs = getTlfs();
  const rules = getRules();

  const section12_2 = sections.find((s) => s.id === "12.2")!;
  const section10_1 = sections.find((s) => s.id === "10.1")!;

  it("streams and renders all 5 sentences for Section 12.2 with zero delay in test", async () => {
    const streamed: DraftSentence[] = [];

    const drafts = await generateSimulatedDraft({
      section: section12_2,
      facts,
      tlfs,
      rules,
      allSections: sections,
      delayMs: 0,
      onSentence: (s) => streamed.push(s),
    });

    expect(drafts).toHaveLength(5);
    expect(streamed).toHaveLength(5);

    // Verify slots rendered
    for (const draft of drafts) {
      expect(draft.sectionId).toBe("12.2");
      expect(draft.provenance).toBe("ai");
      expect(draft.state).toBe("pending");
      expect(draft.generation.mode).toBe("simulated");
      expect(draft.generation.promptVersion).toBe("v1.0");
      expect(draft.rendered.length).toBeGreaterThan(0);
    }

    // Sentence 12.2-s3 has the seeded STAT-001 issue
    const s3 = drafts.find((d) => d.id === "12.2-s3");
    expect(s3).toBeDefined();
    expect(s3!.findings.some((f) => f.ruleId === "STAT-001")).toBe(true);
  });

  it("handles Section 10.1 with 3 sentences", async () => {
    const drafts = await generateSimulatedDraft({
      section: section10_1,
      facts,
      tlfs,
      rules,
      allSections: sections,
      delayMs: 0,
    });

    expect(drafts).toHaveLength(3);
  });

  it("aborts generation early when AbortSignal fires", async () => {
    const controller = new AbortController();
    controller.abort();

    const drafts = await generateSimulatedDraft({
      section: section12_2,
      facts,
      tlfs,
      rules,
      allSections: sections,
      delayMs: 10,
      signal: controller.signal,
    });

    expect(drafts).toHaveLength(0);
  });
});
