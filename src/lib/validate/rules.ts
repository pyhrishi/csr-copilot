import type { StatRule } from "@/lib/data/seed-types";
import type { Finding } from "@/lib/types";

export interface CompiledRule extends StatRule {
  /** Global, case-insensitive version of `pattern`. */
  regex: RegExp;
}

export interface RuleSet {
  /** NUM-001 from rules.json: severity and message. Detection is implemented in num.ts. */
  num: StatRule;
  /** STAT-* rules from rules.json, compiled. */
  stat: CompiledRule[];
}

/** CITE-001 is not in rules.json: it checks the sentence's citations, not its wording. */
export const CITE_001 = {
  id: "CITE-001",
  severity: "major" as Finding["severity"],
  message:
    "A number slot is not in the sentence's citations, so it cannot be traced from the citation marker.",
};

/** Compiles the seed's rules. Throws if NUM-001 is missing: the numeral rule is not optional. */
export function loadRules(rules: readonly StatRule[]): RuleSet {
  const num = rules.find((r) => r.id === "NUM-001");
  if (!num) throw new Error("rules.json must define NUM-001");
  const stat = rules
    .filter((r) => r.id.startsWith("STAT-"))
    .map((r) => ({ ...r, regex: new RegExp(r.pattern, "gi") }));
  return { num, stat };
}
