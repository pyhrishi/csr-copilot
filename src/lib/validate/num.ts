// NUM-001: the model never writes a number. Any numeral (in any script), or a count written as a
// word, in a text part is critical. The only numerals allowed are references to real document ids
// (the study's TLFs, ICH E3 sections and listings; see references.ts) and rule ids. When in doubt
// this check flags: a false positive is a click; a missed number is a clinical error.
import type { TemplateSegment } from "@/lib/slots";
import type { Finding } from "@/lib/types";
import type { ReferenceIndex } from "./references";
import type { RuleSet } from "./rules";

/** "Table ", "Sections " … followed by a list of ids. */
const KEYWORD = /\b(Table|Listing|Figure|Section)s?\s+/gu;
/** One dotted id, read at a fixed position. */
const ID = /\d+(?:\.\d+)*/uy;
/** A list or range separator between ids, read at a fixed position. */
const SEP = /\s*,\s*(?:and\s+)?|\s+(?:and|to)\s+|\s*[–-]\s*/uy;
/** An id must not run into more digits, a decimal part or a percent sign. */
const RUNS_ON = /^(?:[\p{N}%]|\.\p{N})/u;
/**
 * A real id followed by a count noun is read as a count: "Section 12 patients" is twelve patients,
 * even though Section 12 exists.
 */
const COUNT_NOUN =
  /^\s*(?:%|per\s?cent\b|patients?\b|subjects?\b|participants?\b|people\b|events?\b|deaths?\b|cases?\b)/iu;
const OTHER_REFERENCES = [/\bICH\s+E\d+\b/gu, /\b(?:NUM|STAT|CITE)-\d+\b/gu];

/** Any Unicode number character: ASCII and other-script digits (Nd), Roman numerals (Nl), superscripts and fractions (No). */
const NUMERALS = /\p{N}+(?:[.,]\p{N}+)*%?/gu;
const COUNT_WORDS = new RegExp(
  String.raw`\b(?:zero|none|single|once|twice|thrice|half|quarter|both|several|couple|pair|double|triple|` +
    String.raw`one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|` +
    String.raw`sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|` +
    String.raw`hundreds?|thousands?|dozens?|percent|per\s?cent)\b`,
  "giu",
);

const allowedFor = (keyword: string, refs: ReferenceIndex): ReadonlySet<string> =>
  keyword === "Section" ? refs.section : keyword === "Listing" ? refs.listing : refs.tlf;

/** [start, end) ranges of real document ids in the text. */
function referenceRanges(text: string, refs: ReferenceIndex): [number, number][] {
  const ranges: [number, number][] = [];
  for (const m of text.matchAll(KEYWORD)) {
    const allowed = allowedFor(m[1], refs);
    const accepted: [number, number][] = [];
    let pos = m.index + m[0].length;
    for (;;) {
      ID.lastIndex = pos;
      const id = ID.exec(text);
      if (!id) break;
      const end = pos + id[0].length;
      if (RUNS_ON.test(text.slice(end)) || !allowed.has(id[0])) break;
      accepted.push([pos, end]);
      SEP.lastIndex = end;
      const sep = SEP.exec(text);
      if (!sep) break;
      pos = end + sep[0].length;
    }
    const last = accepted.at(-1);
    if (last && COUNT_NOUN.test(text.slice(last[1]))) accepted.pop();
    ranges.push(...accepted);
  }
  for (const re of OTHER_REFERENCES) {
    for (const m of text.matchAll(re)) ranges.push([m.index, m.index + m[0].length]);
  }
  return ranges;
}

/** Replaces allowed references with spaces so offsets are preserved. */
function maskReferences(text: string, refs: ReferenceIndex): string {
  // Offsets are UTF-16 code units throughout (matchAll indexes and String#slice agree).
  let masked = text;
  for (const [start, end] of referenceRanges(text, refs)) {
    masked = masked.slice(0, start) + " ".repeat(end - start) + masked.slice(end);
  }
  return masked;
}

export function checkNumerals(
  segments: readonly TemplateSegment[],
  rules: RuleSet,
  refs: ReferenceIndex,
): Finding[] {
  const findings: Finding[] = [];
  for (const seg of segments) {
    if (seg.kind !== "text") continue;
    const masked = maskReferences(seg.value, refs);
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
