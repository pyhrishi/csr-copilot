/**
 * Parser for live model output adhering to the deterministic-numbers contract.
 *
 * The model outputs one sentence per line, each containing {F:<factId>} slots
 * and ending with `cites: [factId1, factId2]`.
 */

export interface ParsedTemplateSentence {
  template: string;
  cites: string[];
}

/**
 * Extracts slot IDs referenced in a template string ({F:id} or {F:id|format}).
 */
export function extractSlotIds(template: string): string[] {
  const matches = template.matchAll(/\{F:([^|}]+)(?:\|[^}]+)?\}/g);
  const ids: string[] = [];
  for (const m of matches) {
    if (m[1] && !ids.includes(m[1].trim())) {
      ids.push(m[1].trim());
    }
  }
  return ids;
}

/**
 * Parses raw LLM text output into an array of template sentences with citations.
 */
export function parseModelOutput(rawText: string): ParsedTemplateSentence[] {
  if (!rawText || typeof rawText !== "string") {
    return [];
  }

  const lines = rawText.split("\n");
  const parsed: ParsedTemplateSentence[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Ignore markdown headers, code fences, blockquotes, or chat intro lines
    if (/^(#|```|>|\*|\/\/)/.test(trimmed)) continue;
    if (/^(here (is|are)|in summary|section\s+\d+:)/i.test(trimmed) && !trimmed.includes("{F:")) {
      continue;
    }

    // Strip leading list numbering or bullets: e.g. "1. ", "- ", "* "
    const cleanedLine = trimmed.replace(/^(\d+[\.\)]|\*|-|\+)\s+/, "");

    // Look for cites: [...] or cites: id1, id2 at the end of the line
    const citeMatch = cleanedLine.match(/\s*cites:\s*\[?([^\]\n]+)\]?\.?$/i);

    let template = cleanedLine;
    const explicitCites: string[] = [];

    if (citeMatch) {
      template = cleanedLine.slice(0, citeMatch.index).trim();
      const citeStr = citeMatch[1];
      const items = citeStr
        .split(",")
        .map((c) => c.replace(/["'\[\]]/g, "").replace(/\.+$/, "").trim())
        .filter(Boolean);
      for (const item of items) {
        if (!explicitCites.includes(item)) {
          explicitCites.push(item);
        }
      }
    }

    // Ensure all fact IDs actually present in slots are in cites list
    const slotIds = extractSlotIds(template);
    const mergedCites = [...explicitCites];
    for (const sid of slotIds) {
      if (!mergedCites.includes(sid)) {
        mergedCites.push(sid);
      }
    }

    // If template has slots or meaningful prose, keep it
    if (template.length > 5) {
      parsed.push({
        template,
        cites: mergedCites,
      });
    }
  }

  return parsed;
}
