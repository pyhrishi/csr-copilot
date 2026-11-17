import { describe, expect, it } from "vitest";

import { getFacts, getRules, getSections } from "@/lib/data/seed";
import { renderSlots } from "@/lib/slots";
import type { Fact } from "@/lib/types";
import { CITE_001, applyFix, loadRules, validateSentence } from ".";

const facts = getFacts();
const rules = loadRules(getRules());
const ctx = { facts, rules };
const sentences = getSections().flatMap((s) => s.sentences);
const sentence = (id: string) => {
  const s = sentences.find((x) => x.id === id);
  if (!s) throw new Error(`seed is missing ${id}`);
  return s;
};
const validate = (template: string, cites: readonly string[] = []) =>
  validateSentence({ template, cites }, ctx);
const ids = (findings: { ruleId: string }[]) => findings.map((f) => f.ruleId);

const countFact = facts.find((f) => f.kind === "n_pct")!;
const pFact = facts.find((f) => f.kind === "p_value")!;

describe("NUM-001 (numerals outside slots)", () => {
  it('flags "in 201 patients" typed by a human, as critical, with the span of the numeral', () => {
    const template = "Hypotension was reported in 201 patients.";
    const [finding, ...rest] = validate(template);
    expect(rest).toEqual([]);
    expect(finding).toMatchObject({ ruleId: "NUM-001", severity: "critical" });
    expect(template.slice(...finding.span!)).toBe("201");
    expect(finding.suggestion).toMatch(/fact slot/);
    expect(finding.fix).toBeUndefined();
  });

  it('passes "(Table 14.3.1.1)" and other table, section, listing, figure and rule references', () => {
    expect(validate("Hypotension was the most frequent TEAE (Table 14.3.1.1).")).toEqual([]);
    expect(validate("Narratives are provided in Section 14.3.3.")).toEqual([]);
    expect(validate("See Listings 16.2.7 and 16.2.8, Figure 14.2.1 and ICH E3.")).toEqual([]);
    expect(validate("This wording was flagged by STAT-001.")).toEqual([]);
  });

  it("still flags a numeral next to an allowed reference", () => {
    const template = "In Table 14.3.1.1, 12 patients were reported.";
    const findings = validate(template);
    expect(ids(findings)).toEqual(["NUM-001"]);
    expect(template.slice(...findings[0].span!)).toBe("12");
  });

  it("never absorbs a count that follows a reference into the reference", () => {
    for (const [template, numeral] of [
      ["In Table 14.3.1.1, 12.5% of patients had an event.", "12.5%"],
      ["Table 14.3.1.1 and 12.5% of patients.", "12.5%"],
      ["See Section 12.2 and 30 patients.", "30"],
    ] as const) {
      const findings = validate(template);
      expect(ids(findings), template).toEqual(["NUM-001"]);
      expect(template.slice(...findings[0].span!)).toBe(numeral);
    }
  });

  it("accepts lists of references", () => {
    expect(validate("Shown in Tables 14.1.1, 14.1.2 and 14.1.3.")).toEqual([]);
    expect(validate("Described in Sections 12.2 and 12.3.")).toEqual([]);
    expect(validate("Shown in Tables 14.3.1.1–14.3.1.2.")).toEqual([]);
  });

  it("flags percentages and decimals as one numeral each", () => {
    const template = "The rate was 7.4% overall.";
    const findings = validate(template);
    expect(findings).toHaveLength(1);
    expect(template.slice(...findings[0].span!)).toBe("7.4%");
  });

  it("flags counts written as words, case-insensitively", () => {
    const template = "One death occurred, and twelve patients discontinued twice.";
    const findings = validate(template);
    expect(findings.map((f) => template.slice(...f.span!))).toEqual(["One", "twelve", "twice"]);
    expect(findings.every((f) => f.ruleId === "NUM-001" && /word/.test(f.message))).toBe(true);
  });

  it("does not look inside slots", () => {
    expect(validate(`In {F:${countFact.id}} patients.`, [countFact.id])).toEqual([]);
  });
});

describe("CITE-001 (slot not cited)", () => {
  it("flags each slot whose fact is not in cites, as major", () => {
    const template = `In {F:${countFact.id}|n} patients.`;
    const [finding] = validate(template, []);
    expect(finding).toMatchObject({ ruleId: CITE_001.id, severity: "major" });
    expect(template.slice(...finding.span!)).toBe(`{F:${countFact.id}|n}`);
    expect(finding.suggestion).toContain(countFact.id);
    expect(validate(template, [countFact.id])).toEqual([]);
  });
});

describe("STAT-001 (significance without a test)", () => {
  const seeded = sentence("12.2-s3");

  it("flags the seeded sentence 12.2-s3 as critical", () => {
    expect(seeded.seededIssue).toMatch(/^STAT-001/);
    const findings = validateSentence({ template: seeded.text, cites: seeded.cites }, ctx);
    expect(ids(findings)).toEqual(["STAT-001"]);
    expect(findings[0].severity).toBe("critical");
    expect(seeded.text.slice(...findings[0].span!)).toBe("significantly");
  });

  it('suggests "more frequent", and applying the fix removes the finding', () => {
    const [finding] = validateSentence({ template: seeded.text, cites: seeded.cites }, ctx);
    expect(finding.fix?.replacement).toBe("more frequent");
    expect(seeded.text.slice(...finding.fix!.span)).toBe("significantly more common");
    expect(finding.suggestion).toBe('Replace "significantly more common" with "more frequent".');

    const fixed = applyFix(seeded.text, finding);
    expect(fixed).toContain("which was more frequent with velorantib");
    expect(validateSentence({ template: fixed, cites: seeded.cites }, ctx)).toEqual([]);
    expect(() => renderSlots(fixed, { facts })).not.toThrow();
  });

  it("offers descriptive replacements for other significance phrases", () => {
    const cases: [string, string][] = [
      [
        "Rates were significantly higher with velorantib.",
        "Rates were numerically higher with velorantib.",
      ],
      ["Significantly fewer patients discontinued.", "Numerically fewer patients discontinued."],
      ["The groups significantly differed in exposure.", "The groups differed in exposure."],
      ["There was a significant imbalance.", "There was a numerical imbalance."],
    ];
    for (const [input, expected] of cases) {
      const [finding] = validate(input);
      expect(finding.ruleId, input).toBe("STAT-001");
      expect(applyFix(input, finding)).toBe(expected);
    }
  });

  it("gives advice without an automatic fix when no safe rewrite exists", () => {
    const [finding] = validate("The groups differed significantly.");
    expect(finding.ruleId).toBe("STAT-001");
    expect(finding.fix).toBeUndefined();
    expect(finding.suggestion).toMatch(/without implying/);
    expect(() => applyFix("x", finding)).toThrow(/no automatic fix/);
  });

  it("passes when the sentence cites a p-value fact below its alpha", () => {
    const template = `The difference was significant (p={F:${pFact.id}}).`;
    expect(validate(template, [pFact.id])).toEqual([]);
  });

  it("still fires when the cited p-value is not below alpha", () => {
    const { alpha } = pFact.value as { alpha: number };
    const notSignificant: Fact = { ...pFact, value: { ...pFact.value, p: alpha } };
    const store = new Map(facts.map((f) => [f.id, f]));
    store.set(pFact.id, notSignificant);
    const findings = validateSentence(
      { template: `The difference was significant (p={F:${pFact.id}}).`, cites: [pFact.id] },
      { facts: store, rules },
    );
    expect(ids(findings)).toEqual(["STAT-001"]);
  });

  it("is not satisfied by a non-p-value fact or an unknown fact", () => {
    expect(ids(validate(`Significantly more in {F:${countFact.id}}.`, [countFact.id]))).toEqual([
      "STAT-001",
    ]);
    expect(ids(validate("Significantly more in {F:no.such.fact}.", ["no.such.fact"]))).toEqual([
      "STAT-001",
    ]);
  });
});

describe("STAT-002 and STAT-003", () => {
  it("flags causal language as major, with investigator-causality advice", () => {
    const [finding] = validate("Hypotension was caused by velorantib.");
    expect(finding).toMatchObject({ ruleId: "STAT-002", severity: "major" });
    expect(finding.suggestion).toMatch(/considered related to study drug by the investigator/);
    expect(ids(validate("Discontinuations due to adverse events were rare."))).toEqual([
      "STAT-002",
    ]);
  });

  it('flags "trend" as major', () => {
    const [finding] = validate("There was a trend towards fewer events.");
    expect(finding).toMatchObject({ ruleId: "STAT-003", severity: "major" });
    expect(finding.suggestion).toMatch(/pre-specifies/);
  });
});

describe("validateSentence", () => {
  it("finds nothing in any seed sentence except the seeded issue", () => {
    for (const s of sentences) {
      const findings = validateSentence({ template: s.text, cites: s.cites }, ctx);
      if (s.seededIssue) expect(ids(findings), s.id).toEqual([s.seededIssue.split(":")[0]]);
      else expect(findings, s.id).toEqual([]);
    }
  });

  it("sorts findings by severity, then position", () => {
    const findings = validate(`It was caused by drug in 201 patients ({F:${countFact.id}}).`);
    // Critical first; then the two majors in template order ("caused" precedes the uncited slot).
    expect(findings.map((f) => [f.ruleId, f.severity])).toEqual([
      ["NUM-001", "critical"],
      ["STAT-002", "major"],
      ["CITE-001", "major"],
    ]);
    const majors = findings.filter((f) => f.severity === "major");
    expect(majors[0].span![0]).toBeLessThan(majors[1].span![0]);
  });
});

describe("loadRules", () => {
  it("compiles the STAT rules and requires NUM-001", () => {
    expect(rules.stat.map((r) => r.id)).toEqual(
      getRules()
        .filter((r) => r.id.startsWith("STAT-"))
        .map((r) => r.id),
    );
    expect(rules.num.id).toBe("NUM-001");
    expect(() => loadRules(getRules().filter((r) => r.id !== "NUM-001"))).toThrow(/NUM-001/);
  });
});
