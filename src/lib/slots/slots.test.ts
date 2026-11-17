import { describe, expect, it } from "vitest";

import { getFact, getFacts, getPatient, getPatients, getSections } from "@/lib/data/seed";
import type { Fact, Patient, RenderedPart } from "@/lib/types";
import {
  SlotError,
  courseEntries,
  factIdsIn,
  formatFact,
  formatFactChange,
  lowerFirst,
  lowerWords,
  parseTemplate,
  partsToText,
  renderPatientField,
  renderSlots,
} from ".";

const facts = getFacts();
const must = <T>(v: T | undefined, what: string): T => {
  if (v === undefined) throw new Error(`seed is missing ${what}`);
  return v;
};
const countFact = must(
  facts.find((f) => f.kind === "n_pct"),
  "a count fact",
);
const countValue = countFact.value as { n: number; N: number; pct: number };
const nonCountFact = must(
  facts.find((f) => f.kind !== "n_pct"),
  "a non-count fact",
);
const textParts = (parts: RenderedPart[]) => parts.filter((p) => p.type === "text");
const DIGIT = /\d/;

describe("parseTemplate", () => {
  it("splits text and slots with offsets into the template", () => {
    const template = `A {F:${countFact.id}|n} b {P:age}.`;
    const segments = parseTemplate(template);
    expect(segments.map((s) => s.kind)).toEqual(["text", "fact", "text", "patient", "text"]);
    for (const s of segments) {
      const raw = s.kind === "text" ? s.value : s.raw;
      expect(template.slice(s.start, s.end)).toBe(raw);
    }
    expect(segments[1]).toMatchObject({ factId: countFact.id, format: "n" });
  });

  it("defaults the format to display and lists fact ids", () => {
    expect(parseTemplate(`{F:${countFact.id}}`)[0]).toMatchObject({ format: "display" });
    expect(factIdsIn(`{F:a.b} and {F:c.d|pct} and {P:age}`)).toEqual(["a.b", "c.d"]);
  });
});

describe("formatFact", () => {
  it("renders display as the TLF's canonical text", () => {
    expect(formatFact(countFact, "display")).toBe(countFact.display);
    expect(formatFact(nonCountFact, "display")).toBe(nonCountFact.display);
  });

  it("renders n as the count only", () => {
    expect(formatFact(countFact, "n")).toBe(String(countValue.n));
  });

  it("renders pct as the percentage with one decimal and a % sign", () => {
    const pct = formatFact(countFact, "pct");
    expect(pct).toMatch(/^\d+\.\d%$/);
    expect(Number.parseFloat(pct)).toBe(countValue.pct);
    expect(countFact.display).toContain(`(${pct})`);
  });

  it("reproduces the TLF display for every count fact with n_pct", () => {
    for (const f of facts.filter((x) => x.kind === "n_pct")) {
      expect(formatFact(f, "n_pct"), f.id).toBe(f.display);
    }
  });

  it("refuses count formats on facts that are not counts", () => {
    for (const format of ["n", "pct", "n_pct"] as const) {
      expect(() => formatFact(nonCountFact, format)).toThrow(SlotError);
    }
  });

  it("refuses a count format when a count fact's value is malformed", () => {
    const broken = { ...countFact, value: { label: "x" } } as Fact;
    expect(() => formatFact(broken, "n")).toThrow(SlotError);
  });
});

describe("renderSlots", () => {
  it("renders every slot format from the fact store", () => {
    const parts = renderSlots(
      `{F:${countFact.id}} / {F:${countFact.id}|n} / {F:${countFact.id}|pct} / {F:${countFact.id}|n_pct}`,
      { facts },
    );
    const slots = parts.filter((p) => p.type === "slot");
    expect(slots.map((s) => s.format)).toEqual(["display", "n", "pct", "n_pct"]);
    expect(slots.map((s) => s.value)).toEqual([
      countFact.display,
      formatFact(countFact, "n"),
      formatFact(countFact, "pct"),
      countFact.display,
    ]);
    expect(slots.every((s) => s.factId === countFact.id)).toBe(true);
  });

  it("accepts the fact store as a Map", () => {
    const parts = renderSlots(`{F:${countFact.id}}`, {
      facts: new Map(facts.map((f) => [f.id, f])),
    });
    expect(parts).toEqual([
      { type: "slot", factId: countFact.id, format: "display", value: countFact.display },
    ]);
  });

  it("throws on an unknown fact id and never guesses", () => {
    expect(() => renderSlots("in {F:14.3.1.1.no_such_row.velo} patients", { facts })).toThrow(
      /Unknown fact id/,
    );
    expect(() => renderSlots("{F:x}", { facts: [] })).toThrow(SlotError);
  });

  it("throws on a count format applied to a non-count fact", () => {
    expect(() => renderSlots(`{F:${nonCountFact.id}|n}`, { facts })).toThrow(SlotError);
  });

  it("throws on malformed slot syntax instead of passing it through", () => {
    expect(() => renderSlots("in {F:} patients", { facts })).toThrow(/Malformed slot/);
    expect(() => renderSlots("in {P:age-x} years", { facts })).toThrow(/Malformed slot/);
  });

  it("throws on a patient slot without a patient, or an unknown patient field", () => {
    const patient = getPatients()[0];
    expect(() => renderSlots("aged {P:age}", { facts })).toThrow(/needs a patient/);
    expect(() => renderSlots("{P:favouriteColour}", { facts, patient })).toThrow(
      /Unknown patient field/,
    );
  });

  it("never emits a digit in a text part for any section sentence", () => {
    for (const section of getSections()) {
      for (const sentence of section.sentences) {
        const parts = renderSlots(sentence.text, { facts });
        // Table/Section references are allowed in prose; strip them before checking.
        for (const t of textParts(parts)) {
          const prose = t.value.replace(/\b(Table|Section|Listing|Figure) [\d.]+/g, "");
          expect(prose, sentence.id).not.toMatch(DIGIT);
        }
        expect(parts.filter((p) => p.type === "slot")).toHaveLength(
          factIdsIn(sentence.text).length,
        );
      }
    }
  });

  it("merges adjacent text and drops empty text", () => {
    const parts = renderSlots("Before{P:resolvedClause} after.", {
      facts,
      patient: { ...getPatients()[0], resolvedDay: null },
    });
    expect(parts).toEqual([{ type: "text", value: "Before after." }]);
  });

  it("joins parts back into plain text", () => {
    const parts = renderSlots(`In {F:${countFact.id}|n} patients.`, { facts });
    expect(partsToText(parts)).toBe(`In ${formatFact(countFact, "n")} patients.`);
  });
});

describe("patient fields", () => {
  const patient = must(getPatient("CRD301-1042"), "CRD301-1042");
  const one = (field: string, p: Patient = patient) => {
    const parts = renderPatientField(field, p);
    expect(parts).toHaveLength(1);
    return parts[0] as Extract<RenderedPart, { type: "patient" }>;
  };

  it("quotes raw fields and cites them", () => {
    expect(one("age")).toEqual({
      type: "patient",
      field: "age",
      value: String(patient.age),
      source: { kind: "field", field: "age" },
    });
    expect(one("armLabel").value).toBe(patient.armLabel);
    expect(one("onsetDay").value).toBe(String(patient.onsetDay));
  });

  it("derives lowercase wording and cites the source field", () => {
    expect(one("sexWord")).toMatchObject({
      value: patient.sex === "M" ? "man" : "woman",
      source: { field: "sex" },
    });
    expect(one("sexWord", { ...patient, sex: "F" }).value).toBe("woman");
    expect(one("eventLower")).toMatchObject({
      value: patient.event.toLowerCase(),
      source: { field: "event" },
    });
    for (const [field, source] of [
      ["seriousnessLower", "seriousness"],
      ["severityLower", "severity"],
      ["actionLower", "action"],
      ["outcomeLower", "outcome"],
      ["relatedLower", "related"],
    ] as const) {
      expect(one(field)).toMatchObject({
        value: lowerWords(patient[source]),
        source: { field: source },
      });
    }
  });

  it("lowercases investigator causality wording per the narrative anatomy", () => {
    expect(lowerWords("Related")).toBe("related");
    expect(lowerWords("Not related")).toBe("not related");
    expect(lowerWords("Possibly related")).toBe("possibly related");
  });

  it("keeps abbreviations when lowercasing", () => {
    expect(lowerFirst("BP stable; discharged")).toBe("BP stable; discharged");
    expect(lowerFirst("ECG and telemetry unremarkable")).toBe("ECG and telemetry unremarkable");
    expect(lowerFirst("Study drug interrupted")).toBe("study drug interrupted");
    expect(lowerFirst("")).toBe("");
    expect(lowerWords("Worsening HF")).toBe("worsening HF");
  });

  it("renders the resolved clause from resolvedDay, and nothing when unresolved or fatal", () => {
    const parts = renderPatientField("resolvedClause", patient);
    expect(parts).toEqual([
      { type: "text", value: ", resolving on Day " },
      {
        type: "patient",
        field: "resolvedDay",
        value: String(patient.resolvedDay),
        source: { kind: "field", field: "resolvedDay" },
      },
    ]);
    expect(renderPatientField("resolvedClause", { ...patient, resolvedDay: null })).toEqual([]);
    const death = must(
      getPatients().find((p) => p.outcome === "Fatal"),
      "a fatal case",
    );
    expect(renderPatientField("resolvedClause", { ...death, resolvedDay: death.onsetDay })).toEqual(
      [],
    );
  });

  it("builds the timeline summary from every entry after first dose, quoting text verbatim", () => {
    const entries = courseEntries(patient);
    expect(entries.length).toBe(patient.timeline.length - 1);
    const parts = renderPatientField("timelineSummary", patient);
    const days = parts.filter((p) => p.type === "patient" && p.field === "timelineDay");
    const texts = parts.filter((p) => p.type === "patient" && p.field === "timelineText");
    expect(days.map((d) => d.value)).toEqual(entries.map((e) => String(e.day)));
    expect(texts.map((t) => t.value)).toEqual(entries.map((e) => lowerFirst(e.text)));
    for (const [i, e] of entries.entries()) {
      expect(days[i]).toMatchObject({ source: { kind: "timeline", index: e.index } });
      expect(texts[i]).toMatchObject({ source: { kind: "timeline", index: e.index } });
    }
    for (const t of textParts(parts)) expect(t.value).not.toMatch(DIGIT);
  });

  it("reports each same-day entry separately", () => {
    const sameDay = must(
      getPatients().find((p) => new Set(p.timeline.map(([d]) => d)).size < p.timeline.length),
      "a patient with two entries on one day",
    );
    const parts = renderPatientField("timelineSummary", sameDay);
    expect(parts.filter((p) => p.type === "patient" && p.field === "timelineDay")).toHaveLength(
      courseEntries(sameDay).length,
    );
  });

  it("does not add a second full stop when an entry already ends with one", () => {
    const p = { ...patient, timeline: [[patient.onsetDay, "Admitted."]] as Patient["timeline"] };
    expect(partsToText(renderPatientField("timelineSummary", p))).toBe(
      `On Day ${patient.onsetDay}, admitted.`,
    );
  });
});

describe("seed sanity for the slot filler", () => {
  it("every fact id in the seed resolves", () => {
    for (const f of facts) expect(getFact(f.id)).toBe(f);
  });
});

describe("formatFactChange", () => {
  const bump = (by: number): Fact => {
    const n = countValue.n + by;
    const pct = (n * 100) / countValue.N;
    return { ...countFact, value: { ...countValue, n, pct } };
  };
  const tenths = (f: Fact) => Math.round((f.value as { pct: number }).pct * 10);

  it("says No change when the count and shown percentage are the same", () => {
    expect(formatFactChange(countFact, countFact)).toBe("No change");
  });

  it("signs the patient count and the percentage-point change taken from the shown percentages", () => {
    const up = bump(1);
    const dp = ((tenths(up) - tenths(countFact)) / 10).toFixed(1);
    expect(formatFactChange(countFact, up)).toBe(`+1 patient (+${dp} percentage points)`);
    const down = bump(-2);
    const dd = ((tenths(countFact) - tenths(down)) / 10).toFixed(1);
    expect(formatFactChange(countFact, down)).toBe(`−2 patients (−${dd} percentage points)`);
  });

  it("only says whether a non-count fact changed", () => {
    expect(formatFactChange(nonCountFact, nonCountFact)).toBe("No change");
    expect(formatFactChange(nonCountFact, { ...nonCountFact, display: `${nonCountFact.display}*` })).toBe(
      "Value changed",
    );
  });
});
