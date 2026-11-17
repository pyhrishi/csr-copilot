// Patient-field derivations for {P:...} slots in narratives (.claude/skills/csr-domain/narrative-anatomy.md).
// Values come from the patient record; timeline text is quoted verbatim, never paraphrased.
import type { Patient, PatientSource, RenderedPart } from "@/lib/types";
import { SlotError } from "./errors";

type PatientPart = Extract<RenderedPart, { type: "patient" }>;

const FIRST_DOSE = /^first dose of study drug$/i;

/** All-caps abbreviation such as "BP", "ECG", "IV". */
const isAbbreviation = (word: string) => /[A-Z]/.test(word) && word === word.toUpperCase();

/** Lowercases the first letter unless the first word is an abbreviation ("BP stable" stays). */
export function lowerFirst(text: string): string {
  const first = text.match(/^\S+/)?.[0] ?? "";
  if (!first || isAbbreviation(first)) return text;
  return text.charAt(0).toLowerCase() + text.slice(1);
}

/** Lowercases each word that is not an abbreviation ("Not related" → "not related"). */
export function lowerWords(text: string): string {
  return text
    .split(" ")
    .map((w) => (isAbbreviation(w) ? w : w.toLowerCase()))
    .join(" ");
}

export function isDeath(patient: Patient): boolean {
  return (
    patient.seriousness === "Death" ||
    patient.outcome === "Fatal" ||
    patient.narrativeType === "Death"
  );
}

const part = (field: string, value: string, source: PatientSource): PatientPart => ({
  type: "patient",
  field,
  value,
  source,
});
const text = (value: string): RenderedPart => ({ type: "text", value });
const fieldSource = (field: keyof Patient): PatientSource => ({ kind: "field", field });

/** Raw fields that may be quoted as they are. */
const RAW_FIELDS = [
  "id",
  "age",
  "site",
  "armLabel",
  "event",
  "seriousness",
  "severity",
  "onsetDay",
  "outcome",
  "related",
  "action",
] as const satisfies readonly (keyof Patient)[];

/** Derived fields: field name → [source field, derivation]. */
const DERIVED: Record<string, [keyof Patient, (p: Patient) => string]> = {
  sexWord: ["sex", (p) => (p.sex === "M" ? "man" : "woman")],
  eventLower: ["event", (p) => lowerWords(p.event)],
  seriousnessLower: ["seriousness", (p) => lowerWords(p.seriousness)],
  severityLower: ["severity", (p) => lowerWords(p.severity)],
  actionLower: ["action", (p) => lowerWords(p.action)],
  outcomeLower: ["outcome", (p) => lowerWords(p.outcome)],
  relatedLower: ["related", (p) => lowerWords(p.related)],
};

/** Timeline entries the course sentence reports: everything after the first-dose entry. */
export function courseEntries(patient: Patient): { index: number; day: number; text: string }[] {
  return patient.timeline
    .map(([day, entry], index) => ({ index, day, text: entry }))
    .filter((e) => !FIRST_DOSE.test(e.text.trim()));
}

/**
 * Renders one {P:field} slot as parts. Most fields give a single patient part; `resolvedClause`
 * and `timelineSummary` expand into text and patient parts (code-written text never has a digit).
 */
export function renderPatientField(field: string, patient: Patient): RenderedPart[] {
  if ((RAW_FIELDS as readonly string[]).includes(field)) {
    const key = field as (typeof RAW_FIELDS)[number];
    return [part(field, String(patient[key]), fieldSource(key))];
  }
  if (field in DERIVED) {
    const [source, derive] = DERIVED[field];
    return [part(field, derive(patient), fieldSource(source))];
  }
  if (field === "resolvedClause") {
    if (patient.resolvedDay === null || isDeath(patient)) return [];
    return [
      text(", resolving on Day "),
      part("resolvedDay", String(patient.resolvedDay), fieldSource("resolvedDay")),
    ];
  }
  if (field === "timelineSummary") {
    return courseEntries(patient).flatMap((entry, i) => {
      const source: PatientSource = { kind: "timeline", index: entry.index };
      const quoted = lowerFirst(entry.text.trim());
      const end = /[.!?]$/.test(quoted) ? "" : ".";
      return [
        text(i === 0 ? "On Day " : " On Day "),
        part("timelineDay", String(entry.day), source),
        text(", "),
        part("timelineText", quoted, source),
        ...(end ? [text(end)] : []),
      ];
    });
  }
  throw new SlotError(`Unknown patient field "${field}"`);
}
