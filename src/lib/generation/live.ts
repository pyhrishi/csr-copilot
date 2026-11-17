import fs from "node:fs";
import path from "node:path";
import OpenAI from "openai";

import type { StatRule } from "@/lib/data/seed-types";
import { renderSlots } from "@/lib/slots";
import type { DraftSentence, Fact, Section, Tlf } from "@/lib/types";
import { buildReferenceIndex, loadRules, validateSentence } from "@/lib/validate";

import { parseModelOutput } from "./live-parser";
import { createLlmClient, getLlmConfig } from "./llm-client";

export interface LiveDraftOptions {
  section: Section;
  facts: Fact[];
  tlfs: Tlf[];
  rules: readonly StatRule[];
  allSections?: Section[];
  client?: OpenAI;
  model?: string;
  systemPrompt?: string;
  onSentence?: (sentence: DraftSentence, index: number, total: number) => void;
  signal?: AbortSignal;
}

export function buildUserPrompt(section: Section, facts: Fact[]): string {
  const tlfSet = new Set(section.tlfs);
  const sectionFacts = facts.filter((f) => tlfSet.has(f.tlf));
  const factsToUse = sectionFacts.length > 0 ? sectionFacts : facts;

  // IMPORTANT: deterministic-numbers contract: Send fact IDs and labels only, NEVER values!
  const factsList = factsToUse
    .map((f) => `- ${f.id}: ${f.rowLabel}, ${f.columnLabel}`)
    .join("\n");

  return [
    `Section ID: ${section.id}`,
    `Title: ${section.title}`,
    `Release: ${section.release}`,
    "",
    "Available Facts (IDs and labels only; do not invent digits, use {F:id} slots for numbers):",
    factsList,
    "",
    `Draft the regulatory text for Section ${section.id} now following all rules.`,
  ].join("\n");
}

export function buildRetryPrompt(
  offending: { sentence: string; findings: string[] }[],
): string {
  const issues = offending
    .map(
      (item) =>
        `- Sentence: "${item.sentence}"\n  Issues: ${item.findings.join("; ")}`,
    )
    .join("\n");

  return [
    "Your drafted output violated NUM-001 by containing raw numerals in the text:",
    issues,
    "",
    "Strict requirement: The model writes words; code writes numbers.",
    "Rewrite every sentence using {F:fact_id} slots instead of raw digits.",
    "Output exactly one sentence per line ending with cites: [fact_id, ...].",
  ].join("\n");
}

export function loadDefaultSystemPrompt(): string {
  try {
    const promptPath = path.join(
      process.cwd(),
      "src/lib/generation/prompts/section.md",
    );
    return fs.readFileSync(promptPath, "utf-8");
  } catch {
    return "# Role: Expert ICH E3 Regulatory Medical Writer\nrule: deterministic-numbers\nOutput one sentence per line ending with cites: [fact_id, ...].";
  }
}

/**
 * Generates section drafts in live AI mode using an open-source model.
 * Adheres strictly to the deterministic numbers contract:
 * - Fact IDs and labels only sent to model (never values)
 * - Output parsed into slot templates
 * - NUM-001 triggers exactly one retry
 * - On second failure, raw template is kept with NUM-001 finding (never auto-fixed)
 */
export async function generateLiveSectionDraft({
  section,
  facts,
  tlfs,
  rules: rawRules,
  allSections,
  client,
  model,
  systemPrompt,
  onSentence,
}: LiveDraftOptions): Promise<DraftSentence[]> {
  const config = getLlmConfig();
  const activeModel = model || config.model;
  const activeClient = client || createLlmClient(config);

  if (!activeClient) {
    throw new Error(
      "Live AI mode requires an API key or local open-source model endpoint.",
    );
  }

  const factMap = new Map(facts.map((f) => [f.id, f]));
  const compiledRules = loadRules(rawRules);
  const references = buildReferenceIndex({ tlfs, sections: allSections ?? [] });
  const validationCtx = { facts: factMap, rules: compiledRules, references };

  const sysPrompt = systemPrompt || loadDefaultSystemPrompt();
  const userPrompt = buildUserPrompt(section, facts);

  // 1. Initial completion
  const firstResponse = await activeClient.chat.completions.create({
    model: activeModel,
    messages: [
      { role: "system", content: sysPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.1,
  });

  const firstText = firstResponse.choices[0]?.message?.content || "";
  let parsed = parseModelOutput(firstText);

  // 2. Validate for NUM-001
  const offending: { sentence: string; findings: string[] }[] = [];
  for (const p of parsed) {
    const findings = validateSentence(
      { template: p.template, cites: p.cites },
      validationCtx,
    );
    const numFindings = findings.filter((f) => f.ruleId === "NUM-001");
    if (numFindings.length > 0) {
      offending.push({
        sentence: p.template,
        findings: numFindings.map((f) => f.message),
      });
    }
  }

  // 3. If NUM-001 fires, retry once with findings appended
  if (offending.length > 0) {
    const retryPrompt = buildRetryPrompt(offending);
    const retryResponse = await activeClient.chat.completions.create({
      model: activeModel,
      messages: [
        { role: "system", content: sysPrompt },
        { role: "user", content: userPrompt },
        { role: "assistant", content: firstText },
        { role: "user", content: retryPrompt },
      ],
      temperature: 0.1,
    });

    const retryText = retryResponse.choices[0]?.message?.content || "";
    const retryParsed = parseModelOutput(retryText);
    if (retryParsed.length > 0) {
      parsed = retryParsed;
    }
    // On second failure, do not retry again or auto-fix; show raw template with findings
  }

  // Fallback to section template sentences if model output was empty
  if (parsed.length === 0) {
    parsed = section.sentences.map((s) => ({
      template: s.text,
      cites: s.cites,
    }));
  }

  // 4. Final render and validation
  const results: DraftSentence[] = [];
  const total = parsed.length;

  for (let idx = 0; idx < total; idx++) {
    const p = parsed[idx];
    const rendered = renderSlots(p.template, { facts: factMap });
    const findings = validateSentence(
      { template: p.template, cites: p.cites },
      validationCtx,
    );

    const draft: DraftSentence = {
      id: section.sentences[idx]?.id || `${section.id}-s${idx + 1}`,
      sectionId: section.id,
      template: p.template,
      rendered,
      provenance: "ai",
      state: "pending",
      cites: p.cites,
      generation: {
        mode: "live",
        model: activeModel,
        promptVersion: "v1.0",
        templateVersion: "v1.0",
        at: new Date().toISOString(),
      },
      findings,
    };

    results.push(draft);
    onSentence?.(draft, idx, total);
  }

  return results;
}
