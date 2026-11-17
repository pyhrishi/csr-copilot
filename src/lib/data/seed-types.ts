// Types for seed content that src/lib/types.ts (verbatim from docs/data-model.md) does not cover.
import type { Fact, Finding, Study, Tlf } from "@/lib/types";

/** study.json carries population definitions in addition to the core Study fields. */
export interface StudyPopulations {
  randomized: string;
  safety: string;
}
export type SeedStudy = Study & { populations: StudyPopulations };

/** A statistical-language (or numeral) rule from rules.json. `pattern` is a RegExp source string. */
export interface StatRule {
  id: string;
  severity: Finding["severity"];
  pattern: string;
  requires: string;
  message: string;
}

export type NarrativePart =
  "identification" | "event" | "course" | "action" | "outcome" | "causality";

/** The patient-narrative template in sections.json; sentences use {P:field} slots. */
export interface NarrativeTemplate {
  type: string;
  structure: NarrativePart[];
  sentences: Record<NarrativePart, string>;
}

/** tlf-14.3.1.2-v2.json: a re-run TLF with its replacement facts and a description of the change. */
export interface TlfRevision {
  tlf: Tlf;
  facts: Fact[];
  change: string;
}
