// NUM-001: the model never writes a number. Any digit, or a count written as a word, in a text
// part is critical. References to tables, sections, listings and figures, and rule ids, are allowed.
import type { TemplateSegment } from "@/lib/slots";
import type { Finding } from "@/lib/types";
import type { RuleSet } from "./rules";

const ALLOWED_REFERENCES = [
  // A reference, optionally followed by more references in a list ("Tables 14.1.1, 14.1.2 and
  // 14.1.3", "Sections 12.2 and 12.3"). After a comma an item must look like a TLF id (two or more
  // dots); after "and"/"to"/a dash one dot is enough. No item may be followed by a digit, a decimal part or %,
  // so a count after a reference ("Table 14.3.1.1, 12.5% of patients") is never absorbed.
  /\b(?:Tables?|Sections?|Listings?|Figures?)\s+\d+(?:\.\d+)*(?:(?:\s*,\s*(?:and\s+)?\d+(?:\.\d+){2,}|(?:\s+(?:and|to)\s+|\s*[–-]\s*)\d+(?:\.\d+)+)(?![\d%]|\.\d))*/g,
  /\bICH\s+E\d+\b/g,
  /\b(?:NUM|STAT|CITE)-\d+\b/g,
];
const DIGITS = /\d+(?:[.,]\d+)*%?/g;
const COUNT_WORDS =
  /\b(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|dozen|twice|half)\b/gi;

/** Replaces allowed references with spaces so offsets are preserved. */
function maskReferences(text: string): string {
  return ALLOWED_REFERENCES.reduce((t, re) => t.replace(re, (m) => " ".repeat(m.length)), text);
}

export function checkNumerals(segments: readonly TemplateSegment[], rules: RuleSet): Finding[] {
  const findings: Finding[] = [];
  for (const seg of segments) {
    if (seg.kind !== "text") continue;
    const masked = maskReferences(seg.value);
    for (const [re, wording] of [
      [DIGITS, "numeral"],
      [COUNT_WORDS, "count written as a word"],
    ] as const) {
      for (const m of masked.matchAll(re)) {
        const start = seg.start + m.index;
        findings.push({
          ruleId: rules.num.id,
          severity: rules.num.severity,
          message: `${rules.num.message} Found a ${wording}: "${m[0]}".`,
          span: [start, start + m[0].length],
          suggestion: `Replace "${m[0]}" with a fact slot from the fact panel.`,
        });
      }
    }
  }
  return findings;
}
