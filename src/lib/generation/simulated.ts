import { renderSlots } from "@/lib/slots";
import type { Fact, Section, Tlf } from "@/lib/types";
import type { DraftSentence } from "@/lib/types";
import { buildReferenceIndex, loadRules, validateSentence } from "@/lib/validate";
import type { StatRule } from "@/lib/data/seed-types";

export interface SimulatedDraftOptions {
  section: Section;
  facts: readonly Fact[];
  tlfs: readonly Tlf[];
  rules: readonly StatRule[];
  allSections: readonly Section[];
  delayMs?: number;
  onSentence?: (sentence: DraftSentence, index: number, total: number) => void;
  signal?: AbortSignal;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Generates section drafts in simulated mode by streaming template sentences
 * one by one with a typing delay (~400ms), applying deterministic slot rendering,
 * and running the full NUM-001, CITE-001 and STAT-001..003 validation suite.
 */
export async function generateSimulatedDraft({
  section,
  facts,
  tlfs,
  rules: rawRules,
  allSections,
  delayMs = 400,
  onSentence,
  signal,
}: SimulatedDraftOptions): Promise<DraftSentence[]> {
  const factMap = new Map(facts.map((f) => [f.id, f]));
  const compiledRules = loadRules(rawRules);
  const references = buildReferenceIndex({ tlfs, sections: allSections });
  const validationCtx = { facts: factMap, rules: compiledRules, references };

  const total = section.sentences.length;
  const results: DraftSentence[] = [];

  for (let i = 0; i < total; i++) {
    if (signal?.aborted) break;

    if (delayMs > 0) {
      await sleep(delayMs);
    }

    if (signal?.aborted) break;

    const sentence = section.sentences[i];
    const rendered = renderSlots(sentence.text, { facts: factMap });
    const findings = validateSentence(
      { template: sentence.text, cites: sentence.cites },
      validationCtx,
    );

    const draft: DraftSentence = {
      id: sentence.id,
      sectionId: section.id,
      template: sentence.text,
      rendered,
      provenance: "ai",
      state: "pending",
      cites: sentence.cites,
      generation: {
        mode: "simulated",
        promptVersion: "v1.0",
        templateVersion: "v1.0",
        at: new Date().toISOString(),
      },
      findings,
    };

    results.push(draft);
    onSentence?.(draft, i, total);
  }

  return results;
}
