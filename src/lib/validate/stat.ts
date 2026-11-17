// STAT-001..003: statistical-language rules from rules.json, applied to text parts only.
import type { TemplateSegment } from "@/lib/slots";
import type { Finding } from "@/lib/types";
import { lookupFact, type ValidationContext } from "./context";
import type { CompiledRule } from "./rules";

/** STAT-001 is satisfied only by a p-value fact below its alpha cited in the same sentence. */
function hasSignificantPValue(
  segments: readonly TemplateSegment[],
  facts: ValidationContext["facts"],
): boolean {
  return segments.some((seg) => {
    if (seg.kind !== "fact") return false;
    const fact = lookupFact(facts, seg.factId);
    if (fact?.kind !== "p_value") return false;
    const { p, alpha } = fact.value as { p?: unknown; alpha?: unknown };
    return typeof p === "number" && typeof alpha === "number" && p < alpha;
  });
}

/** Descriptive replacements for "significant(ly)" phrases, longest first. Matched at the rule's hit. */
const STAT_001_FIXES: [RegExp, (m: RegExpMatchArray) => string][] = [
  [/^significantly more (?:common|frequent)\b/i, () => "more frequent"],
  [
    /^significantly (higher|lower|greater|fewer|smaller|larger)\b/i,
    (m) => `numerically ${m[1].toLowerCase()}`,
  ],
  [/^significantly\s+/i, () => ""],
  [/^significant\b/i, () => "numerical"],
];

const matchCase = (original: string, replacement: string) =>
  /^[A-Z]/.test(original) && replacement
    ? replacement[0].toUpperCase() + replacement.slice(1)
    : replacement;

function stat001Fix(
  text: string,
  at: number,
  segStart: number,
): Pick<Finding, "fix" | "suggestion"> {
  const rest = text.slice(at);
  for (const [re, replace] of STAT_001_FIXES) {
    const m = rest.match(re);
    if (!m) continue;
    const replacement = matchCase(m[0], replace(m));
    return {
      fix: { span: [segStart + at, segStart + at + m[0].length], replacement },
      suggestion: replacement
        ? `Replace "${m[0].trim()}" with "${replacement}".`
        : `Remove "${m[0].trim()}".`,
    };
  }
  return {
    suggestion: "Describe the difference without implying a statistical test.",
  };
}

const SUGGESTIONS: Record<string, string> = {
  "STAT-002":
    'Use "considered related to study drug by the investigator" instead of a causal claim.',
  "STAT-003": 'Remove "trend" unless the SAP pre-specifies a trend analysis.',
};

export function checkStatisticalLanguage(
  segments: readonly TemplateSegment[],
  rules: readonly CompiledRule[],
  facts: ValidationContext["facts"],
): Finding[] {
  const findings: Finding[] = [];
  for (const rule of rules) {
    if (rule.id === "STAT-001" && hasSignificantPValue(segments, facts)) continue;
    for (const seg of segments) {
      if (seg.kind !== "text") continue;
      for (const m of seg.value.matchAll(rule.regex)) {
        const start = seg.start + m.index;
        const advice =
          rule.id === "STAT-001"
            ? stat001Fix(seg.value, m.index, seg.start)
            : { suggestion: SUGGESTIONS[rule.id] ?? rule.message };
        findings.push({
          ruleId: rule.id,
          severity: rule.severity,
          message: rule.message,
          span: [start, start + m[0].length],
          ...advice,
        });
      }
    }
  }
  return findings;
}
