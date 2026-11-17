"use client";

import * as React from "react";
import {
  AlertOctagon,
  Check,
  CheckCircle2,
  FileDown,
  Keyboard,
  Loader2,
  Pencil,
  RefreshCw,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import {
  AutonomyPill,
  CitationMarker,
  NumberChip,
  ProvenanceLegend,
  ProvenanceShade,
  ReleaseBadge,
} from "@/components/trust";
import { Button } from "@/components/ui/button";
import { downloadDocxBlob, exportSectionToDocx } from "@/lib/export/docx";
import { rolePersona } from "@/lib/roles";
import type { DraftSentence, Fact, Section } from "@/lib/types";
import { useAuditStore } from "@/store/audit";
import { useDraftsStore } from "@/store/drafts";
import { useRoleStore } from "@/store/role";

import { SectionStatusBar } from "./SectionStatusBar";
import { SentenceInlineEditor } from "./SentenceInlineEditor";

interface DraftCanvasProps {
  section: Section;
  sentences: readonly DraftSentence[];
  facts: readonly Fact[];
  isGenerating: boolean;
  onGenerate: () => void;
  onFactClick: (factId: string) => void;
  onCitationClick: (sourceId: string) => void;
  focusedSentenceId: string | null;
  highlightedSentenceId?: string | null;
  onFocusSentence: (id: string | null) => void;
  editingSentenceId: string | null;
  onEdit: (id: string) => void;
  onSaveEdit: (sentenceId: string, newTemplate: string) => void;
  onCancelEdit: () => void;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onRegenerate: (id: string) => void;
  onSendToReview: () => void;
  sectionStatus: "not_started" | "drafted" | "in_review" | "signed_off";
  isSubmittedToReview?: boolean;
  onOpenShortcuts: () => void;
  activeFactToInsert?: Fact | null;
  onFactInserted?: () => void;
  isReadOnly?: boolean;
}

export function DraftCanvas({
  section,
  sentences,
  facts,
  isGenerating,
  onGenerate,
  onFactClick,
  onCitationClick,
  focusedSentenceId,
  highlightedSentenceId,
  onFocusSentence,
  editingSentenceId,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onAccept,
  onReject,
  onRegenerate,
  onSendToReview,
  sectionStatus,
  isSubmittedToReview,
  onOpenShortcuts,
  activeFactToInsert,
  onFactInserted,
  isReadOnly = false,
}: DraftCanvasProps) {
  const factMap = React.useMemo(() => new Map(facts.map((f) => [f.id, f])), [facts]);
  const hasDraft = sentences.length > 0;
  const allFindings = React.useMemo(
    () => sentences.flatMap((s) => s.findings),
    [sentences],
  );

  const [isExporting, setIsExporting] = React.useState(false);
  const appendAudit = useAuditStore((s) => s.append);
  const role = useRoleStore((s) => s.role);
  const updatedSentenceIds = useDraftsStore((s) => s.updatedSentenceIds);

  const handleExportDocx = async () => {
    try {
      setIsExporting(true);
      const sentenceMap: Record<string, DraftSentence> = {};
      for (const s of sentences) {
        sentenceMap[s.id] = s;
      }
      const blob = await exportSectionToDocx({
        section,
        sentences: sentenceMap,
        facts,
      });
      const filename = `${section.id}-${section.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.docx`;
      downloadDocxBlob(blob, filename);

      const persona = rolePersona(role);
      appendAudit({
        actor: persona.name,
        role,
        action: "export",
        objectId: section.id,
        detail: `Exported section ${section.id} ${section.title} to Word (.docx)`,
      });

      toast.success(`Section ${section.id} exported to Word (.docx)`);
    } catch {
      toast.error("Failed to export Word document");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <main className="flex-1 overflow-hidden flex flex-col bg-paper">
      {/* Scrollable Canvas Area */}
      <div className="flex-1 overflow-y-auto p-8 flex flex-col">
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

            {/* Header Actions: Shortcuts Help & Generate */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenShortcuts}
                className="text-xs h-9 px-3 border-line text-subtle hover:text-ink shadow-2xs flex items-center gap-1.5"
                title="Keyboard Shortcuts (?)"
              >
                <Keyboard className="size-3.5 text-teal" aria-hidden="true" />
                <span>Shortcuts</span>
                <kbd className="px-1 rounded bg-paper-2 border border-line text-[10px] font-mono">?</kbd>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportDocx}
                disabled={isExporting}
                className="text-xs h-9 px-3 border-line text-subtle hover:text-ink shadow-2xs flex items-center gap-1.5"
                title="Export section to Microsoft Word (.docx)"
              >
                <FileDown className="size-3.5 text-teal" aria-hidden="true" />
                <span>{isExporting ? "Exporting..." : "Export to Word"}</span>
              </Button>

              <Button
                onClick={onGenerate}
                disabled={isGenerating || isReadOnly}
                className="bg-teal hover:bg-teal/90 text-white font-semibold text-xs h-9 px-4 shadow-xs flex items-center gap-2"
                title={isReadOnly ? "Read-only mode for Executive role" : undefined}
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
            <div className="flex items-center gap-3">
              <ProvenanceLegend />
              {sentences.some((s) => s.generation?.mode === "live") && (
                <span
                  data-testid="live-ai-header-badge"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-tint text-teal border border-teal/30 shadow-2xs"
                >
                  <Sparkles className="size-3" aria-hidden="true" />
                  <span>
                    Live AI ({sentences.find((s) => s.generation?.mode === "live")?.generation?.model || "open-source"})
                  </span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-subtle tabular">
              <span>
                {sentences.length} of {section.sentences.length} sentences
              </span>
            </div>
          </div>
        </div>

        {/* Read-Only Notice for Executive Role */}
        {isReadOnly && (
          <div className="mb-4 flex items-center justify-between p-3 rounded-md bg-paper-2 border border-line text-xs font-medium text-subtle">
            <span>
              Viewing as <strong>Executive</strong> (read-only mode). Drafting, inline editing, and sentence actions are reserved for Medical Writers.
            </span>
          </div>
        )}

        {/* Editor Body */}
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
            <article className="max-w-[72ch] text-[16px] leading-[1.7] text-body font-sans space-y-5 pb-16">
              {sentences.map((draft, idx) => {
                const isEditing = editingSentenceId === draft.id;
                const isFocused = focusedSentenceId === draft.id;
                const isHighlighted = highlightedSentenceId === draft.id;
                const isAccepted = draft.state === "accepted";
                const isRejected = draft.state === "rejected";

                if (isEditing) {
                  return (
                    <div key={draft.id || idx} id={`sentence-${draft.id}`} className="my-3">
                      <SentenceInlineEditor
                        sentence={draft}
                        facts={facts}
                        onSave={(newTemplate) => onSaveEdit(draft.id, newTemplate)}
                        onCancel={onCancelEdit}
                        activeFactToInsert={activeFactToInsert}
                        onFactInserted={onFactInserted}
                      />
                    </div>
                  );
                }

                const hasCriticalFinding = draft.findings?.some((f) => f.severity === "critical");
                const criticalRule = draft.findings?.find((f) => f.severity === "critical");

                return (
                  <div
                    key={draft.id || idx}
                    id={`sentence-${draft.id}`}
                    tabIndex={0}
                    onFocus={() => onFocusSentence(draft.id)}
                    onClick={() => onFocusSentence(draft.id)}
                    className={`relative group rounded-md transition-all outline-none p-2 -m-2 ${
                      isHighlighted
                        ? "ring-2 ring-amber bg-amber-tint/40 animate-pulse"
                        : hasCriticalFinding
                          ? "border-l-2 border-critical bg-critical-tint/15 ring-1 ring-critical/30"
                          : isFocused
                            ? "ring-2 ring-teal/60 bg-card/60"
                            : "hover:bg-card/40"
                    }`}
                  >
                    <p className="relative">
                      {/* Critical finding inline badge */}
                      {hasCriticalFinding && (
                        <span
                          className="inline-flex items-center gap-1 mr-2 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-critical text-white align-middle tabular shadow-2xs"
                          title={criticalRule?.message}
                        >
                          <AlertOctagon className="size-2.5" aria-hidden="true" />
                          <span>{criticalRule?.ruleId ?? "Critical"}</span>
                        </span>
                      )}

                      {/* State badge if accepted or rejected */}
                      {isAccepted && (
                        <span className="inline-flex items-center gap-1 mr-2 px-1.5 py-0.2 rounded text-[10px] font-bold uppercase bg-teal text-white align-middle tabular">
                          <Check className="size-2.5" aria-hidden="true" />
                          <span>Accepted</span>
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center gap-1 mr-2 px-1.5 py-0.2 rounded text-[10px] font-bold uppercase bg-critical text-white align-middle tabular">
                          <X className="size-2.5" aria-hidden="true" />
                          <span>Rejected</span>
                        </span>
                      )}
                      {updatedSentenceIds?.[draft.id] && (
                        <span className="inline-flex items-center gap-1 mr-2 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-tint text-teal border border-teal/30 align-middle tabular">
                          <span>Source updated</span>
                        </span>
                      )}
                      {draft.generation?.mode === "live" && (
                        <span
                          data-testid={`live-badge-${draft.id}`}
                          className="inline-flex items-center gap-1 mr-2 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-tint text-teal border border-teal/30 align-middle tabular"
                          title={`Generated live with ${draft.generation.model || "open-source model"}`}
                        >
                          <Sparkles className="size-2.5" aria-hidden="true" />
                          <span>Live AI</span>
                        </span>
                      )}

                      <ProvenanceShade provenance={draft.provenance}>
                        {/* Rendered parts: text, slot chips */}
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
                        <span className="inline-flex items-center ml-1">
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

                    {/* Sentence Hover & Focus Actions Bar */}
                    <div
                      className={`mt-1.5 pt-1 border-t border-line/40 flex items-center justify-between text-xs transition-opacity ${
                        isFocused || isHighlighted
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-mono text-muted mr-1.5">
                          {draft.id}
                        </span>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAccept(draft.id);
                          }}
                          className={`text-xs h-6 px-2 font-medium ${
                            isAccepted
                              ? "bg-teal text-white hover:bg-teal/90"
                              : "text-teal hover:bg-teal-tint"
                          }`}
                          title="Accept sentence (A)"
                        >
                          <CheckCircle2 className="size-3 mr-1" aria-hidden="true" />
                          <span>Accept</span>
                          <kbd className="ml-1 text-[9px] font-mono opacity-70">A</kbd>
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(draft.id);
                          }}
                          className="text-xs h-6 px-2 text-subtle hover:text-ink hover:bg-paper-2 font-medium"
                          title="Edit inline (E)"
                        >
                          <Pencil className="size-3 mr-1" aria-hidden="true" />
                          <span>Edit</span>
                          <kbd className="ml-1 text-[9px] font-mono opacity-70">E</kbd>
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onReject(draft.id);
                          }}
                          className={`text-xs h-6 px-2 font-medium ${
                            isRejected
                              ? "bg-critical text-white hover:bg-critical/90"
                              : "text-critical hover:bg-critical-tint"
                          }`}
                          title="Reject sentence (R)"
                        >
                          <XCircle className="size-3 mr-1" aria-hidden="true" />
                          <span>Reject</span>
                          <kbd className="ml-1 text-[9px] font-mono opacity-70">R</kbd>
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRegenerate(draft.id);
                          }}
                          className="text-xs h-6 px-2 text-subtle hover:text-ink hover:bg-paper-2 font-medium"
                          title="Regenerate with reason"
                        >
                          <RefreshCw className="size-3 mr-1" aria-hidden="true" />
                          <span>Regenerate</span>
                        </Button>
                      </div>

                      {/* Line findings indicator if any */}
                      {draft.findings.length > 0 && (
                        <span className="text-[10px] font-bold text-critical tabular flex items-center gap-1">
                          <span>{draft.findings.length} finding{draft.findings.length > 1 ? "s" : ""}</span>
                        </span>
                      )}
                    </div>
                  </div>
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
      </div>

      {/* Pane Bottom: Section Status Bar */}
      <SectionStatusBar
        sectionId={section.id}
        sentences={sentences}
        findings={allFindings}
        onSendToReview={onSendToReview}
        status={sectionStatus}
        isSubmittedToReview={isSubmittedToReview}
      />
    </main>
  );
}
