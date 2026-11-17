// Patient narratives (ICH E3 14.3.3), assembled from the template in sections.json.
// This module only chooses template sentences; every value is rendered by src/lib/slots.
import type { NarrativePart, NarrativeTemplate } from "@/lib/data/seed-types";
import { isDeath, renderSlots } from "@/lib/slots";
import type { Patient, PatientSource, RenderedPart } from "@/lib/types";

/** A narrative clause cites a field of the patient record or one timeline entry. */
export type NarrativeCitation = { patientId: string } & PatientSource;

export interface NarrativeSentence {
  part: NarrativePart;
  template: string;
  parts: RenderedPart[];
  cites: NarrativeCitation[];
}

export type NarrativeResult =
  | { ok: true; patientId: string; type: "SAE" | "Death"; sentences: NarrativeSentence[] }
  | { ok: false; patientId: string; reason: string };

const SAE_PHRASE = "experienced a serious adverse event of";
const DEATH_PHRASE = "died of";

function templateFor(part: NarrativePart, template: NarrativeTemplate, death: boolean): string {
  const text = template.sentences[part];
  if (part !== "identification" || !death) return text;
  if (!text.includes(SAE_PHRASE)) {
    throw new Error(
      `Narrative template identification sentence no longer contains "${SAE_PHRASE}"`,
    );
  }
  return text.replace(SAE_PHRASE, DEATH_PHRASE);
}

function citationsOf(patientId: string, parts: readonly RenderedPart[]): NarrativeCitation[] {
  const seen = new Map<string, NarrativeCitation>();
  for (const p of parts) {
    if (p.type !== "patient") continue;
    const key =
      p.source.kind === "field" ? `field:${p.source.field}` : `timeline:${p.source.index}`;
    if (!seen.has(key)) seen.set(key, { patientId, ...p.source });
  }
  return [...seen.values()];
}

/**
 * Assembles a narrative in the template's order. Patients with a data exception are refused with
 * their data issue: a narrative is never drafted over a known gap in the source data.
 */
export function assembleNarrative(patient: Patient, template: NarrativeTemplate): NarrativeResult {
  if (patient.status === "exception") {
    return {
      ok: false,
      patientId: patient.id,
      reason: patient.dataIssue ?? "Open data exception.",
    };
  }
  const death = isDeath(patient);
  const sentences = template.structure.flatMap((part): NarrativeSentence[] => {
    const text = templateFor(part, template, death);
    const parts = renderSlots(text, { facts: [], patient });
    if (parts.every((p) => p.type === "text" && !p.value.trim())) return [];
    return [{ part, template: text, parts, cites: citationsOf(patient.id, parts) }];
  });
  return { ok: true, patientId: patient.id, type: death ? "Death" : "SAE", sentences };
}
