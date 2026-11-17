import type { SlotFormat } from "@/lib/types";

// Slot syntax from docs/data-model.md:
//   {F:<factId>}  {F:<factId>|n}  {F:<factId>|pct}  {F:<factId>|n_pct}  {P:<field>}
const SLOT = /\{F:([^}|]+)(?:\|(n|pct|n_pct))?\}|\{P:([a-zA-Z]+)\}/g;
/** Anything that looks like the start of a slot but did not parse as one. */
const MALFORMED = /\{\s*[FP]\s*:/;

/** A piece of a sentence template, with [start, end) offsets into the template string. */
export type TemplateSegment =
  | { kind: "text"; value: string; start: number; end: number }
  | { kind: "fact"; factId: string; format: SlotFormat; raw: string; start: number; end: number }
  | { kind: "patient"; field: string; raw: string; start: number; end: number };

/** Splits a template into text and slot segments. Pure; never throws. */
export function parseTemplate(template: string): TemplateSegment[] {
  const segments: TemplateSegment[] = [];
  let last = 0;
  for (const m of template.matchAll(SLOT)) {
    const start = m.index;
    const end = start + m[0].length;
    if (start > last)
      segments.push({ kind: "text", value: template.slice(last, start), start: last, end: start });
    if (m[1] !== undefined) {
      segments.push({
        kind: "fact",
        factId: m[1],
        format: (m[2] as SlotFormat | undefined) ?? "display",
        raw: m[0],
        start,
        end,
      });
    } else {
      segments.push({ kind: "patient", field: m[3], raw: m[0], start, end });
    }
    last = end;
  }
  if (last < template.length) {
    segments.push({ kind: "text", value: template.slice(last), start: last, end: template.length });
  }
  return segments;
}

/** True when a text segment contains something that looks like a slot but is not valid syntax. */
export function hasMalformedSlot(text: string): boolean {
  return MALFORMED.test(text);
}

/** Fact ids used by {F:} slots in a template, in order of appearance (may repeat). */
export function factIdsIn(template: string): string[] {
  return parseTemplate(template).flatMap((s) => (s.kind === "fact" ? [s.factId] : []));
}
