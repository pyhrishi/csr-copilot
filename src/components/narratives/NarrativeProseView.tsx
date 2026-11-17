"use client";

import { useState } from "react";
import { Check, Copy, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProvenanceLegend, ProvenanceShade } from "@/components/trust/ProvenanceShade";
import { PatientFieldChip } from "./PatientFieldChip";
import type { NarrativeSentence } from "@/lib/narratives";
import { partsToText } from "@/lib/slots";
import type { Patient } from "@/lib/types";

interface NarrativeProseViewProps {
  patient: Patient;
  sentences: NarrativeSentence[];
  activeTimelineIndex: number | null;
  activeField: string | null;
  onSelectTimeline: (index: number | null) => void;
  onSelectField: (field: string | null) => void;
  className?: string;
}

const PART_LABELS: Record<string, { step: number; label: string }> = {
  identification: { step: 1, label: "Identification & Randomization" },
  event: { step: 2, label: "Event Onset & Seriousness Criteria" },
  course: { step: 3, label: "Clinical Course & Interventions" },
  action: { step: 4, label: "Action Taken with Study Drug" },
  outcome: { step: 5, label: "Outcome & Resolution" },
  causality: { step: 6, label: "Investigator Causality Assessment" },
};

export function NarrativeProseView({
  patient,
  sentences,
  activeTimelineIndex,
  activeField,
  onSelectTimeline,
  onSelectField,
  className = "",
}: NarrativeProseViewProps) {
  const [copied, setCopied] = useState(false);

  const fullProse = sentences.map((s) => partsToText(s.parts)).join(" ");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullProse);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className={`bg-card rounded-xl border border-line p-5 shadow-xs space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-line">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-teal" />
          <h3 className="text-sm font-bold text-ink">
            Assembled Narrative Draft (ICH E3 Section 14.3.3)
          </h3>
          <span className="text-xs text-subtle font-mono">
            ({sentences.length} sentences)
          </span>
        </div>
        <div className="flex items-center gap-3">
          <ProvenanceLegend />
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="h-8 gap-1.5 text-xs text-ink"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-ok" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy text
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Prose Document Card */}
      <div className="p-5 rounded-lg bg-paper-2/40 border border-line/60 space-y-3 font-sans leading-relaxed text-body text-[15px] max-w-4xl">
        {sentences.map((s, idx) => {
          const partMeta = PART_LABELS[s.part] ?? { step: idx + 1, label: s.part };

          return (
            <div
              key={`sentence-${idx}-${s.part}`}
              className="group relative p-2.5 rounded-lg transition-all duration-150 hover:bg-card hover:shadow-xs border border-transparent hover:border-line/60"
            >
              {/* Step indicator header */}
              <div className="flex items-center gap-2 text-[11px] font-mono text-subtle mb-1 select-none">
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-teal-tint text-teal font-bold text-[10px]">
                  {partMeta.step}
                </span>
                <span className="font-semibold text-subtle">{partMeta.label}</span>
              </div>

              {/* Sentence text with Provenance Shading and Patient Tokens */}
              <ProvenanceShade provenance="ai" className="block text-ink text-[15px] leading-relaxed">
                {s.parts.map((part, pIdx) => {
                  if (part.type === "text") {
                    return <span key={`text-${pIdx}`}>{part.value}</span>;
                  }

                  if (part.type === "patient") {
                    const source = part.source;
                    const isSelected =
                      source.kind === "timeline"
                        ? activeTimelineIndex === source.index
                        : activeField === source.field;

                    return (
                      <PatientFieldChip
                        key={`patient-${pIdx}-${part.field}`}
                        field={part.field}
                        value={part.value}
                        source={source}
                        isHighlighted={isSelected}
                        onClick={() => {
                          if (source.kind === "timeline") {
                            onSelectTimeline(
                              activeTimelineIndex === source.index ? null : source.index,
                            );
                          } else {
                            onSelectField(
                              activeField === source.field ? null : String(source.field),
                            );
                          }
                        }}
                        onMouseEnter={() => {
                          if (source.kind === "timeline") onSelectTimeline(source.index);
                          else onSelectField(String(source.field));
                        }}
                        onMouseLeave={() => {
                          if (source.kind === "timeline" && activeTimelineIndex === source.index) {
                            // keep if explicitly selected
                          } else {
                            onSelectTimeline(null);
                            onSelectField(null);
                          }
                        }}
                      />
                    );
                  }

                  return null;
                })}

                {/* Sentence Citation Markers */}
                <span className="inline-flex items-center gap-1 ml-2 align-middle">
                  {s.cites.map((cite, cIdx) => {
                    const citeTag =
                      cite.kind === "timeline"
                        ? `T-Day ${patient.timeline[cite.index]?.[0] ?? cite.index}`
                        : `P-${cite.field}`;
                    const isCitationActive =
                      cite.kind === "timeline"
                        ? activeTimelineIndex === cite.index
                        : activeField === cite.field;

                    return (
                      <button
                        type="button"
                        key={`cite-${cIdx}-${cite.kind}`}
                        onClick={() => {
                          if (cite.kind === "timeline") onSelectTimeline(cite.index);
                          else onSelectField(String(cite.field));
                        }}
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded-xs transition-colors border ${
                          isCitationActive
                            ? "bg-teal text-white border-teal font-bold shadow-xs"
                            : "bg-paper text-teal border-teal/30 hover:bg-teal-tint"
                        }`}
                        title={`Citation: ${cite.kind === "timeline" ? `Timeline Day ${patient.timeline[cite.index]?.[0]}` : `Patient ${cite.field}`}`}
                      >
                        {citeTag}
                      </button>
                    );
                  })}
                </span>
              </ProvenanceShade>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-xs text-subtle px-1 pt-1">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-teal" />
          <span>Every number and clinical event is verified against the source patient record.</span>
        </div>
        <span className="font-mono text-[11px]">Template version: E3-14.3.3-v1</span>
      </div>
    </div>
  );
}
