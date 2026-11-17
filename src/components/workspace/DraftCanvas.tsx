import { Loader2, RefreshCw, Sparkles } from "lucide-react";

import {
  AutonomyPill,
  CitationMarker,
  NumberChip,
  ProvenanceLegend,
  ProvenanceShade,
  ReleaseBadge,
} from "@/components/trust";
import { Button } from "@/components/ui/button";
import type { DraftSentence, Fact, Section } from "@/lib/types";

interface DraftCanvasProps {
  section: Section;
  sentences: readonly DraftSentence[];
  facts: readonly Fact[];
  isGenerating: boolean;
  onGenerate: () => void;
  onFactClick: (factId: string) => void;
  onCitationClick: (sourceId: string) => void;
}

export function DraftCanvas({
  section,
  sentences,
  facts,
  isGenerating,
  onGenerate,
  onFactClick,
  onCitationClick,
}: DraftCanvasProps) {
  const factMap = new Map(facts.map((f) => [f.id, f]));
  const hasDraft = sentences.length > 0;

  return (
    <main className="flex-1 overflow-y-auto p-8 flex flex-col bg-paper">
      {/* Editor Header */}
      <div className="border-b border-line pb-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="rounded-md bg-ink px-2 py-0.5 text-xs font-bold text-teal-light tabular">
                Section {section.id}
              </span>
              <ReleaseBadge release={section.release} />
              <AutonomyPill level={section.autonomy} />
            </div>

            <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-ink">
              {section.title}
            </h1>
          </div>

          {/* Primary Action: Generate / Regenerate draft */}
          <div className="flex items-center gap-3 shrink-0">
            <Button
              onClick={onGenerate}
              disabled={isGenerating}
              className="bg-teal hover:bg-teal/90 text-white font-semibold text-xs h-9 px-4 shadow-xs flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                  <span>Streaming draft...</span>
                </>
              ) : hasDraft ? (
                <>
                  <RefreshCw className="size-3.5" aria-hidden="true" />
                  <span>Regenerate draft</span>
                </>
              ) : (
                <>
                  <Sparkles className="size-3.5" aria-hidden="true" />
                  <span>Generate draft</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Provenance Legend (Always visible in editor header) */}
        <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between">
          <ProvenanceLegend />
          <span className="text-xs text-subtle tabular">
            {sentences.length} of {section.sentences.length} sentences
          </span>
        </div>
      </div>

      {/* Editor Canvas */}
      <div className="flex-1">
        {!hasDraft && !isGenerating ? (
          /* Empty State */
          <div className="rounded-xl border border-dashed border-line bg-card/60 p-12 text-center max-w-2xl mx-auto my-12">
            <div className="size-12 rounded-full bg-teal-tint text-teal flex items-center justify-center mx-auto mb-4">
              <Sparkles className="size-6" aria-hidden="true" />
            </div>
            <h2 className="font-heading text-xl font-semibold text-ink">
              Section Draft Canvas
            </h2>
            <p className="text-xs text-subtle mt-2 leading-relaxed max-w-md mx-auto">
              No draft generated yet for Section {section.id}. Click below to stream{" "}
              {section.sentences.length} sentences with deterministic number chips linked to source
              tables.
            </p>
            <div className="mt-6">
              <Button
                onClick={onGenerate}
                className="bg-teal hover:bg-teal/90 text-white text-xs font-semibold px-4 shadow-xs"
              >
                <Sparkles className="size-3.5 mr-1.5" aria-hidden="true" />
                <span>Generate draft</span>
              </Button>
            </div>
          </div>
        ) : (
          /* Document Canvas (Public Sans 16px/1.7, max width 72ch) */
          <article className="max-w-[72ch] text-[16px] leading-[1.7] text-body font-sans space-y-4 pb-16">
            {sentences.map((draft, idx) => {
              return (
                <p key={draft.id || idx} className="relative group">
                  <ProvenanceShade provenance={draft.provenance}>
                    {/* Rendered parts: text and slots */}
                    {draft.rendered.map((part, pIdx) => {
                      if (part.type === "text") {
                        return <span key={pIdx}>{part.value}</span>;
                      }

                      if (part.type === "slot") {
                        const fact = factMap.get(part.factId);
                        return (
                          <NumberChip
                            key={pIdx}
                            factId={part.factId}
                            value={part.value}
                            fact={fact}
                            onClick={onFactClick}
                          />
                        );
                      }

                      return null;
                    })}
                  </ProvenanceShade>

                  {/* Citation Markers at sentence end */}
                  {draft.cites && draft.cites.length > 0 && (
                    <span className="inline-flex items-center">
                      {draft.cites.map((cite) => (
                        <CitationMarker
                          key={cite}
                          sourceId={cite}
                          onClick={onCitationClick}
                        />
                      ))}
                    </span>
                  )}
                </p>
              );
            })}

            {isGenerating && (
              <div className="flex items-center gap-2 text-xs text-teal font-medium animate-pulse pt-2">
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                <span>Streaming next sentence from template...</span>
              </div>
            )}
          </article>
        )}
      </div>
    </main>
  );
}
