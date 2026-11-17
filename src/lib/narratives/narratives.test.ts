import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { getNarrativeTemplate, getPatient, getPatients, getRules, getSections, getTlfs, getFacts } from "@/lib/data/seed";
import { buildReferenceIndex, loadRules, validateSentence } from "@/lib/validate";
import { partsToText } from "@/lib/slots";
import type { Patient } from "@/lib/types";
import { assembleNarrative, type NarrativeResult } from ".";

const template = getNarrativeTemplate();
const patients = getPatients();
const ready = patients.filter((p) => p.status === "ready");
const deaths = ready.filter((p) => p.outcome === "Fatal");
const exceptions = patients.filter((p) => p.status === "exception");

const assemble = (p: Patient) => {
  const result = assembleNarrative(p, template);
  if (!result.ok) throw new Error(`${p.id} refused: ${result.reason}`);
  return result;
};
const text = (r: Extract<NarrativeResult, { ok: true }>) =>
  r.sentences.map((s) => partsToText(s.parts)).join(" ");

/** The worked example in the narrative anatomy (the blockquote after "## Worked example"). */
function workedExample(): { patientId: string; text: string } {
  const md = readFileSync(
    join(process.cwd(), ".claude/skills/csr-domain/narrative-anatomy.md"),
    "utf8",
  );
  const section = md.split("## Worked example")[1];
  const patientId = section.match(/^: (\S+)/)![1];
  const quote = section.match(/^> (.+)$/m)![1];
  return { patientId, text: quote };
}

describe("assembleNarrative", () => {
  it("reproduces the worked example in the narrative anatomy exactly", () => {
    const example = workedExample();
    expect(text(assemble(getPatient(example.patientId)!))).toBe(example.text);
  });

  it("puts no numeral outside a slot for CRD301-1042 or any other ready patient", () => {
    for (const p of ready) {
      for (const s of assemble(p).sentences) {
        for (const part of s.parts)
          if (part.type === "text") expect(part.value, `${p.id} ${s.part}`).not.toMatch(/\d/);
      }
    }
  });

  it("produces no NUM-001 findings across all 10 ready assembled narratives", () => {
    expect(ready).toHaveLength(10);
    const rules = loadRules(getRules());
    const references = buildReferenceIndex({ tlfs: getTlfs(), sections: getSections() });
    const ctx = { facts: getFacts(), rules, references };

    for (const patient of ready) {
      const result = assemble(patient);
      for (const s of result.sentences) {
        const findings = validateSentence({ template: s.template, cites: [] }, ctx);
        const numFindings = findings.filter((f) => f.ruleId === "NUM-001");
        expect(numFindings, `${patient.id} ${s.part}`).toEqual([]);
      }
    }
  });

  it("takes every day reference in the course from the timeline", () => {
    const p = getPatient("CRD301-1042")!;
    const course = assemble(p).sentences.find((s) => s.part === "course")!;
    const days = course.parts.filter((x) => x.type === "patient" && x.field === "timelineDay");
    expect(days.length).toBeGreaterThan(0);
    for (const d of days) {
      if (d.type !== "patient" || d.source.kind !== "timeline")
        throw new Error("day part must cite a timeline entry");
      expect(d.value).toBe(String(p.timeline[d.source.index][0]));
    }
    expect(course.cites.every((c) => c.kind === "timeline" && c.patientId === p.id)).toBe(true);
  });

  it("follows the template's order and cites a source for every sentence", () => {
    for (const p of ready) {
      const result = assemble(p);
      expect(result.sentences.map((s) => s.part)).toEqual(template.structure);
      for (const s of result.sentences)
        expect(s.cites.length, `${p.id} ${s.part}`).toBeGreaterThan(0);
    }
    const id = assemble(getPatient("CRD301-1042")!).sentences[0];
    expect(id.cites.map((c) => (c.kind === "field" ? c.field : c.index))).toEqual([
      "id",
      "age",
      "sex",
      "armLabel",
      "event",
    ]);
  });

  it("writes death narratives with 'died of' and no resolved clause", () => {
    expect(deaths.length).toBeGreaterThan(0);
    for (const p of deaths) {
      const result = assemble(p);
      expect(result.type).toBe("Death");
      const [identification] = result.sentences;
      expect(partsToText(identification.parts)).toContain(`died of ${p.event.toLowerCase()}`);
      expect(text(result)).not.toContain("experienced a serious adverse event");
      expect(text(result)).not.toContain("resolving on Day");
      const outcome = result.sentences.find((s) => s.part === "outcome")!;
      expect(partsToText(outcome.parts)).toBe(
        `The outcome was reported as ${p.outcome.toLowerCase()}.`,
      );
    }
  });

  it("treats a death by seriousness as a death even if the outcome field disagrees", () => {
    const p = { ...deaths[0], outcome: "Recovered", resolvedDay: deaths[0].onsetDay };
    expect(assemble(p).type).toBe("Death");
    expect(text(assemble(p))).not.toContain("resolving on Day");
  });

  it("refuses patients with a data exception, giving the data issue", () => {
    expect(exceptions.length).toBeGreaterThan(0);
    for (const p of exceptions) {
      expect(assembleNarrative(p, template)).toEqual({
        ok: false,
        patientId: p.id,
        reason: p.dataIssue,
      });
    }
    const withoutIssue: Patient = { ...exceptions[0], dataIssue: undefined };
    expect(assembleNarrative(withoutIssue, template)).toMatchObject({
      ok: false,
      reason: "Open data exception.",
    });
  });

  it("drops a course sentence when there is nothing after first dose", () => {
    const p = { ...ready[0], timeline: ready[0].timeline.slice(0, 1) };
    expect(assemble(p).sentences.map((s) => s.part)).not.toContain("course");
  });

  it("throws if the template no longer has the phrase a death narrative replaces", () => {
    const changed = {
      ...template,
      sentences: { ...template.sentences, identification: "Patient {P:id}." },
    };
    expect(() => assembleNarrative(deaths[0], changed)).toThrow(/no longer contains/);
    expect(() =>
      assembleNarrative(
        ready.find((p) => p.outcome !== "Fatal")!,
        changed,
      ),
    ).not.toThrow();
  });
});
