// NUM-001: the model never writes a number. Any numeral (in any script), or a count written as a
// word, in a text part is critical. Only document references with real CSR-style ids, and rule ids,
// are allowed. When in doubt this check flags: a false positive is a click; a missed number is a
// clinical error.
import type { TemplateSegment } from "@/lib/slots";
import type { Finding } from "@/lib/types";
import type { RuleSet } from "./rules";

/** A list or range separator between references. */
const SEP = String.raw`(?:\s*,\s*(?:and\s+)?|\s+(?:and|to)\s+|\s*[–-]\s*)`;
/** A reference may not run into more digits, a decimal part or a percent sign. */
const END = String.raw`(?![\p{N}%]|\.\p{N})`;

const ALLOWED_REFERENCES = [
  // Tables, listings and figures use dotted TLF ids with at least three parts (14.3.1, 16.2.7.1).
  // List and range items must share the head's first number and depth ("Tables 14.1.1 and
  // 14.1.2"), so "Table 14.1.1 to 12.5 patients" never hides a count.
  new RegExp(
    String.raw`\b(?:Tables?|Listings?|Figures?)\s+(\d+)(?:\.\d+){2,}${END}(?:${SEP}\1(?:\.\d+){2,}${END})*`,
    "gu",
  ),
  // ICH E3 sections are cited with at least two parts (12.2, 14.3.3). A bare "Section 13" is flagged:
  // it cannot be told apart from "Section 201 patients".
  new RegExp(String.raw`\bSections?\s+(\d+)(?:\.\d+)+${END}(?:${SEP}\1(?:\.\d+)+${END})*`, "gu"),
  /\bICH\s+E\d+\b/gu,
  /\b(?:NUM|STAT|CITE)-\d+\b/gu,
];

/** Any Unicode number character: ASCII and other-script digits (Nd), Roman numerals (Nl), superscripts and fractions (No). */
const NUMERALS = /\p{N}+(?:[.,]\p{N}+)*%?/gu;
const COUNT_WORDS = new RegExp(
  String.raw`\b(?:zero|none|single|once|twice|thrice|half|` +
    String.raw`one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|` +
    String.raw`sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|` +
    String.raw`hundreds?|thousands?|dozens?)\b`,
  "giu",
);

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
      [NUMERALS, "numeral"],
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
