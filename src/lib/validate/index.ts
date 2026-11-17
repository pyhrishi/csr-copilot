import { parseTemplate } from "@/lib/slots";
import type { Finding } from "@/lib/types";
import { checkCitations } from "./cite";
import type { SentenceInput, ValidationContext } from "./context";
import { checkNumerals } from "./num";
import { checkStatisticalLanguage } from "./stat";

export { CITE_001, loadRules, type CompiledRule, type RuleSet } from "./rules";
export type { SentenceInput, ValidationContext } from "./context";

const SEVERITY_ORDER: Record<Finding["severity"], number> = { critical: 0, major: 1, minor: 2 };

/**
 * Runs NUM-001, CITE-001 and STAT-001..003 on a sentence template. Validators look at text
 * segments only (slots are rendered by code), so the same check covers generated and human-edited
 * sentences. Findings are sorted by severity, then position.
 */
export function validateSentence(sentence: SentenceInput, ctx: ValidationContext): Finding[] {
  const segments = parseTemplate(sentence.template);
  return [
    ...checkNumerals(segments, ctx.rules),
    ...checkCitations(segments, sentence.cites),
    ...checkStatisticalLanguage(segments, ctx.rules.stat, ctx.facts),
  ].sort(
    (a, b) =>
      SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] ||
      (a.span?.[0] ?? 0) - (b.span?.[0] ?? 0),
  );
}

/** Applies a finding's machine-applicable fix to the template. Throws if the finding has none. */
export function applyFix(template: string, finding: Finding): string {
  if (!finding.fix) throw new Error(`${finding.ruleId} has no automatic fix`);
  const [start, end] = finding.fix.span;
  return template.slice(0, start) + finding.fix.replacement + template.slice(end);
}
