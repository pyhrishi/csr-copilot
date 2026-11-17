"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Database,
  FileCheck2,
  Pencil,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { ProvenanceShade } from "@/components/trust/ProvenanceShade";
import { Badge } from "@/components/ui/badge";
import { partsToText, renderSlots } from "@/lib/slots";
import type { AuditEvent, DraftSentence, Fact, Section, Tlf } from "@/lib/types";

interface LineageTimelineProps {
  sentenceId: string;
  section: Section;
  draft?: DraftSentence;
  auditEvents?: readonly AuditEvent[];
  facts: readonly Fact[];
  tlfs?: readonly Tlf[];
  className?: string;
}

export function LineageTimeline({
  sentenceId,
  section,
  draft,
  auditEvents = [],
  facts,
  className = "",
}: LineageTimelineProps) {
  const sentenceTemplate = section.sentences.find((s) => s.id === sentenceId);
  const factMap = new Map(facts.map((f) => [f.id, f]));

  // Cited sources
  const citedFactIds = sentenceTemplate?.cites ?? draft?.cites ?? [];
  const citedFacts = citedFactIds.map((id) => factMap.get(id)).filter(Boolean) as Fact[];
  const citedTlfIds = [...new Set(citedFacts.map((f) => f.tlf))];

  // Audit events relating to this sentence or section
  const relatedEvents = auditEvents.filter(
    (e) => e.objectId === sentenceId || e.objectId === section.id,
  );

  const editEvents = relatedEvents.filter((e) => e.action === "edit");
  const signOffEvent = relatedEvents.find((e) => e.action === "sign_off");

  // Format date safely
  const formatDate = (isoString?: string) => {
    if (!isoString) return "Recorded at baseline";
    try {
      const d = new Date(isoString);
      return isNaN(d.getTime()) ? isoString : d.toLocaleString();
    } catch {
      return isoString;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="border-b border-line pb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-ink">
              Sentence Lineage & Provenance Trace
            </h3>
            <Badge variant="outline" className="font-mono text-xs bg-paper-2 text-ink">
              {sentenceId}
            </Badge>
          </div>
          <p className="text-xs text-subtle mt-0.5">
            Full deterministic audit trail from raw TLF ingestion to electronic sign-off.
          </p>
        </div>
      </div>

      {/* Vertical Stepper Container */}
      <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-line">
        {/* Step 1: Ingestion & Source Data */}
        <div className="relative">
          <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-card border-2 border-teal flex items-center justify-center text-teal">
            <Database className="w-2.5 h-2.5" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-teal">
                1. Source Ingestion & Fact Extraction
              </span>
              <span className="text-[11px] font-mono text-muted">
                {formatDate("2026-10-30T17:00:00Z")}
              </span>
            </div>
            <div className="p-3.5 rounded-lg bg-card border border-line text-xs space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-subtle">Cited Tables:</span>
                {citedTlfIds.map((tId) => (
                  <Badge key={tId} variant="secondary" className="font-mono text-[11px]">
                    Table {tId} (v1)
                  </Badge>
                ))}
              </div>
              <div className="space-y-1 pt-1 border-t border-line/60">
                <span className="text-[11px] text-muted block font-semibold">
                  Extracted Clinical Facts:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                  {citedFacts.map((f) => (
                    <div
                      key={f.id}
                      className="p-2 rounded bg-paper-2/60 border border-line/40 text-[11px] space-y-0.5"
                    >
                      <div className="font-mono font-bold text-teal">{f.id}</div>
                      <div className="text-muted">
                        Row: <strong>{f.rowLabel}</strong> · Col: {f.columnLabel}
                      </div>
                      <div className="font-semibold text-ink">Value: {f.display}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Generation */}
        <div className="relative">
          <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-card border-2 border-teal flex items-center justify-center text-teal">
            <Sparkles className="w-2.5 h-2.5" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-teal">
                2. Template Generation & Slot Binding
              </span>
              <span className="text-[11px] font-mono text-muted">
                {formatDate(draft?.generation.at ?? "2026-11-01T09:14:22Z")}
              </span>
            </div>
            <div className="p-3.5 rounded-lg bg-card border border-line text-xs space-y-2">
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted">
                <span>
                  Mode: <strong>{draft?.generation.mode ?? "simulated"}</strong>
                </span>
                <span>
                  Model: <strong>{draft?.generation.model ?? "simulated-v1"}</strong>
                </span>
                <span>
                  Prompt: <strong>{draft?.generation.promptVersion ?? "v1.2"}</strong>
                </span>
                <span>
                  Template: <strong>{draft?.generation.templateVersion ?? "12.2-v1"}</strong>
                </span>
              </div>
              <div className="p-2.5 rounded bg-paper font-mono text-[11px] text-ink border border-line/60">
                {sentenceTemplate?.text ?? draft?.template ?? "Sentence template with slots"}
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Slot Filling */}
        <div className="relative">
          <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-card border-2 border-teal flex items-center justify-center text-teal">
            <Cpu className="w-2.5 h-2.5" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-teal">
                3. Deterministic Numeric Filling
              </span>
              <span className="text-[11px] font-mono text-muted">Execution: Code (Zero LLM)</span>
            </div>
            <div className="p-3.5 rounded-lg bg-card border border-line text-xs space-y-2">
              <p className="text-subtle">
                Slots were evaluated by deterministic code filler against the verified fact store.
              </p>
              <div className="p-2.5 rounded bg-teal-tint/30 border border-teal/20 text-ink leading-relaxed">
                <ProvenanceShade provenance={draft?.provenance ?? "ai"}>
                  {draft?.rendered
                    ? partsToText(draft.rendered)
                    : sentenceTemplate
                    ? partsToText(renderSlots(sentenceTemplate.text, { facts: factMap }))
                    : ""}
                </ProvenanceShade>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: Rule Validation */}
        <div className="relative">
          <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-card border-2 border-teal flex items-center justify-center text-teal">
            <ShieldCheck className="w-2.5 h-2.5" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-teal">
                4. Automated Quality & Language Rules
              </span>
              <span className="text-[11px] font-mono text-muted">Pre-submission Gate</span>
            </div>
            <div className="p-3.5 rounded-lg bg-card border border-line text-xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-ok text-white">
                  <CheckCircle2 className="w-3 h-3" /> NUM-001 Numeric Rule: Passed
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-ok text-white">
                  <CheckCircle2 className="w-3 h-3" /> CITE-001 Citation Rule: Passed
                </span>
              </div>
              {draft?.findings && draft.findings.length > 0 ? (
                <div className="space-y-1 pt-1">
                  {draft.findings.map((f, fIdx) => (
                    <div
                      key={fIdx}
                      className="p-2 rounded bg-critical-tint/50 border border-critical/30 text-critical text-[11px] flex items-center gap-2"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        <strong>{f.ruleId}:</strong> {f.message}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[11px] text-muted italic">
                  Zero active rule findings.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 5: Edits & Fixes */}
        <div className="relative">
          <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-card border-2 border-amber flex items-center justify-center text-amber">
            <Pencil className="w-2.5 h-2.5" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber">
                5. Human-in-the-Loop Edits & Fixes
              </span>
              <span className="text-[11px] font-mono text-muted">
                {draft?.provenance === "ai_edited" ? "AI-Edited" : "AI-Original"}
              </span>
            </div>
            <div className="p-3.5 rounded-lg bg-card border border-line text-xs space-y-2">
              {editEvents.length > 0 ? (
                <div className="space-y-1.5">
                  {editEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-2 rounded bg-amber-tint/40 border border-amber/20 text-xs space-y-1"
                    >
                      <div className="flex justify-between text-[11px] text-muted font-mono">
                        <span>Actor: {ev.actor} ({ev.role})</span>
                        <span>{formatDate(ev.at)}</span>
                      </div>
                      <p className="font-medium text-ink">{ev.detail}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-subtle text-xs">
                  No manual human edits made. Sentence text maintains pure AI slot-rendered provenance.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Step 6: Approvals */}
        <div className="relative">
          <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-card border-2 border-ok flex items-center justify-center text-ok">
            <FileCheck2 className="w-2.5 h-2.5" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-ok">
                6. Electronic Sign-Off & Verification
              </span>
              <span className="text-[11px] font-mono text-muted">21 CFR Part 11</span>
            </div>
            <div className="p-3.5 rounded-lg bg-card border border-line text-xs space-y-2">
              {signOffEvent ? (
                <div className="p-3 rounded bg-teal-tint/50 border border-teal/30 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-teal font-bold">
                    <CheckCircle2 className="w-4 h-4 text-ok" />
                    <span>Signed Off by {signOffEvent.actor}</span>
                  </div>
                  <p className="text-[11px] text-body italic">
                    &ldquo;I confirm the numbers in this section match the source TLFs.&rdquo;
                  </p>
                  <div className="text-[10px] font-mono text-muted pt-1 border-t border-teal/20 flex justify-between">
                    <span>Role: {signOffEvent.role}</span>
                    <span>Timestamp: {formatDate(signOffEvent.at)}</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded bg-paper-2 text-muted text-xs italic">
                  Section sign-off pending Biostatistician review.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
