import type { Fact, Patient, RenderedPart } from "@/lib/types";
import { SlotError } from "./errors";
import { formatFact } from "./format";
import { hasMalformedSlot, parseTemplate } from "./parse";
import { renderPatientField } from "./patient";

export interface SlotContext {
  /** The fact store. Values are always re-read from here; nothing is cached between calls. */
  facts: ReadonlyMap<string, Fact> | readonly Fact[];
  /** Required for {P:...} slots (narratives). */
  patient?: Patient;
}

function lookup(facts: SlotContext["facts"], id: string): Fact | undefined {
  return "get" in facts ? facts.get(id) : facts.find((f) => f.id === id);
}

/**
 * The only function that turns data into displayed digits. Returns text and slot parts so the UI
 * can render slots as NumberChips. Throws on an unknown fact id, an unknown patient field, a
 * patient slot without a patient, a format that does not fit the fact, or malformed slot syntax.
 */
export function renderSlots(template: string, ctx: SlotContext): RenderedPart[] {
  const parts: RenderedPart[] = [];
  const push = (p: RenderedPart) => {
    const prev = parts.at(-1);
    if (p.type === "text") {
      if (!p.value) return;
      if (prev?.type === "text") {
        parts[parts.length - 1] = { type: "text", value: prev.value + p.value };
        return;
      }
    }
    parts.push(p);
  };

  for (const seg of parseTemplate(template)) {
    if (seg.kind === "text") {
      if (hasMalformedSlot(seg.value))
        throw new SlotError(`Malformed slot near "${seg.value.trim()}"`);
      push({ type: "text", value: seg.value });
    } else if (seg.kind === "fact") {
      const fact = lookup(ctx.facts, seg.factId);
      if (!fact) throw new SlotError(`Unknown fact id "${seg.factId}"`);
      push({
        type: "slot",
        factId: fact.id,
        format: seg.format,
        value: formatFact(fact, seg.format),
      });
    } else {
      if (!ctx.patient) throw new SlotError(`Patient slot ${seg.raw} needs a patient`);
      for (const p of renderPatientField(seg.field, ctx.patient)) push(p);
    }
  }
  return parts;
}

/** Plain text of rendered parts (for export and tests). */
export function partsToText(parts: readonly RenderedPart[]): string {
  return parts.map((p) => p.value).join("");
}
