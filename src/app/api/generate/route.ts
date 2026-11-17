import "server-only";

import factsData from "@/../data/seed/facts.json";
import rulesData from "@/../data/seed/rules.json";
import sectionsData from "@/../data/seed/sections.json";
import tlfsData from "@/../data/seed/tlfs.json";
import type { StatRule } from "@/lib/data/seed-types";
import { generateLiveSectionDraft } from "@/lib/generation/live";
import { getLlmConfig } from "@/lib/generation/llm-client";
import type { DraftSentence, Fact, Section, Tlf } from "@/lib/types";

const allFacts = factsData.facts as unknown as Fact[];
const allTlfs = tlfsData.tlfs as unknown as Tlf[];
const allRules = rulesData.statisticalLanguageRules as unknown as StatRule[];
const allSections = sectionsData.sections as unknown as Section[];

export async function POST(request: Request): Promise<Response> {
  const config = getLlmConfig();

  if (!config.configured) {
    return Response.json(
      {
        error:
          "Live AI mode requires an API key or local open-source model endpoint (e.g. GROQ_API_KEY, OPENROUTER_API_KEY, or local Ollama).",
      },
      { status: 400 },
    );
  }

  let body: { sectionId?: string } = {};
  try {
    body = await request.json();
  } catch {
    // defaults to 12.2
  }

  const sectionId = body.sectionId || "12.2";
  const section = allSections.find((s) => s.id === sectionId);

  if (!section) {
    return Response.json(
      { error: `Section with ID "${sectionId}" not found.` },
      { status: 404 },
    );
  }

  // Check if client prefers streaming SSE
  const acceptsSSE =
    request.headers.get("accept")?.includes("text/event-stream") ?? false;

  if (acceptsSSE) {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const sentences = await generateLiveSectionDraft({
            section,
            facts: allFacts,
            tlfs: allTlfs,
            rules: allRules,
            allSections,
            onSentence: (sentence: DraftSentence, index: number, total: number) => {
              const payload = JSON.stringify({
                type: "sentence",
                sentence,
                index,
                total,
              });
              controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
            },
          });

          const donePayload = JSON.stringify({
            type: "done",
            sentences,
            model: config.model,
          });
          controller.enqueue(encoder.encode(`data: ${donePayload}\n\n`));
          controller.close();
        } catch (err) {
          const errPayload = JSON.stringify({
            type: "error",
            error: (err as Error).message,
          });
          controller.enqueue(encoder.encode(`data: ${errPayload}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }

  // Non-streaming JSON response
  try {
    const sentences = await generateLiveSectionDraft({
      section,
      facts: allFacts,
      tlfs: allTlfs,
      rules: allRules,
      allSections,
    });

    return Response.json({
      sentences,
      model: config.model,
      mode: "live",
      sectionId,
    });
  } catch (err) {
    return Response.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
}
