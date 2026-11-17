import type { Fact } from "@/lib/types";
import type { ReferenceIndex } from "./references";
import type { RuleSet } from "./rules";

export interface ValidationContext {
  facts: ReadonlyMap<string, Fact> | readonly Fact[];
  rules: RuleSet;
  /** Real document ids that NUM-001 accepts as references (see buildReferenceIndex). */
  references: ReferenceIndex;
}

export interface SentenceInput {
  /** The sentence template, with slots (as generated or as edited by a human). */
  template: string;
  /** Fact ids the sentence cites. */
  cites: readonly string[];
}

export function lookupFact(facts: ValidationContext["facts"], id: string): Fact | undefined {
  return "get" in facts ? facts.get(id) : facts.find((f) => f.id === id);
}
