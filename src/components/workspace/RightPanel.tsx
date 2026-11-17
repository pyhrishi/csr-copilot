"use client";

import * as React from "react";
import {
  CheckCircle2,
  Database,
  ExternalLink,
  Plus,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { NumberChip, ValidatorBadge } from "@/components/trust";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DraftSentence, Fact, Finding, Section, Tlf } from "@/lib/types";

interface RightPanelProps {
  section: Section;
  facts: readonly Fact[];
  tlfs?: readonly Tlf[];
  sentences: readonly DraftSentence[];
  editingSentenceId?: string | null;
  onFactClick: (factId: string) => void;
  onInsertFact?: (fact: Fact) => void;
  onSelectSentence?: (sentenceId: string) => void;
  onApplySuggestion?: (sentenceId: string, finding: Finding) => void;
}

export function RightPanel({
  section,
  facts,
  tlfs = [],
  sentences,
  editingSentenceId,
  onFactClick,
  onInsertFact,
  onSelectSentence,
  onApplySuggestion,
}: RightPanelProps) {
  // Filter facts belonging to this section's TLFs
  const sectionFacts = facts.filter((f) => section.tlfs.includes(f.tlf));
  const displayFacts = sectionFacts.length > 0 ? sectionFacts : facts.slice(0, 12);

  // Group facts by TLF
  const factsByTlf = React.useMemo(() => {
    const map = new Map<string, Fact[]>();
    for (const f of displayFacts) {
      const list = map.get(f.tlf) ?? [];
      list.push(f);
      map.set(f.tlf, list);
    }
    return map;
  }, [displayFacts]);

  // Aggregate findings across drafted sentences
  const allFindings = React.useMemo(() => {
    return sentences.flatMap((s) =>
      s.findings.map((f) => ({ ...f, sentenceId: s.id })),
    );
  }, [sentences]);

  // Group findings by severity
  const criticalFindings = allFindings.filter((f) => f.severity === "critical");
  const majorFindings = allFindings.filter((f) => f.severity === "major");
  const minorFindings = allFindings.filter((f) => f.severity === "minor");

  const tlfMap = React.useMemo(() => new Map(tlfs.map((t) => [t.id, t])), [tlfs]);

  return (
    <aside className="w-[360px] shrink-0 border-l border-line bg-paper-2/30 flex flex-col h-full overflow-hidden">
      <Tabs defaultValue="facts" className="flex flex-col h-full">
        {/* Tabs Header */}
        <div className="p-3 border-b border-line bg-card shrink-0">
          <TabsList className="grid w-full grid-cols-2 h-9 p-1 bg-paper-2">
            <TabsTrigger
              value="facts"
              className="text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-ink shadow-none flex items-center gap-1.5"
            >
              <Database className="size-3.5 text-teal" aria-hidden="true" />
              <span>Fact Panel</span>
              <span className="ml-1 text-[10px] tabular px-1.5 py-0.2 rounded-full bg-paper-2 text-subtle">
                {displayFacts.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="checks"
              className="text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-ink shadow-none flex items-center gap-1.5"
            >
              <ShieldCheck className="size-3.5 text-teal" aria-hidden="true" />
              <span>Checks</span>
              {allFindings.length > 0 && (
                <span className="ml-1 text-[10px] tabular px-1.5 py-0.2 rounded-full bg-critical text-white font-bold">
                  {allFindings.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Facts Tab */}
        <TabsContent value="facts" className="flex-1 overflow-y-auto p-4 m-0 space-y-4">
          <div className="flex items-center justify-between text-xs text-subtle pb-1 border-b border-line/60">
            <span className="font-semibold uppercase tracking-wider text-teal text-[11px]">
              Available Facts
            </span>
            <span className="tabular">{displayFacts.length} mapped across {factsByTlf.size} tables</span>
          </div>

          {editingSentenceId && (
            <div className="rounded-md bg-teal-tint/60 border border-teal/40 p-2 text-xs text-teal font-medium flex items-center gap-2">
              <span className="size-2 rounded-full bg-teal animate-pulse" />
              <span>Editing {editingSentenceId}. Click &quot;+ Insert&quot; to add a chip.</span>
            </div>
          )}

          {/* Grouped by TLF */}
          <div className="space-y-4">
            {Array.from(factsByTlf.entries()).map(([tlfId, groupFacts]) => {
              const tlf = tlfMap.get(tlfId);
              return (
                <div key={tlfId} className="space-y-2">
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="font-bold text-ink flex items-center gap-1.5">
                      <span className="rounded bg-paper-2 px-1.5 py-0.5 text-[10px] font-mono tabular text-subtle">
                        Table {tlfId}
                      </span>
                      {tlf && (
                        <span className="text-[11px] text-muted truncate max-w-[170px]" title={tlf.title}>
                          {tlf.title}
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-subtle tabular">{groupFacts.length} facts</span>
                  </div>

                  <div className="space-y-2">
                    {groupFacts.map((fact) => (
                      <div
                        key={fact.id}
                        draggable={true}
                        onDragStart={(e) => {
                          e.dataTransfer.setData("application/x-fact-id", fact.id);
                          e.dataTransfer.setData("text/plain", `{F:${fact.id}}`);
                          e.dataTransfer.effectAllowed = "copy";
                        }}
                        className="rounded-lg border border-line bg-card p-2.5 shadow-xs hover:border-teal/50 transition-colors space-y-1.5 cursor-grab active:cursor-grabbing"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <NumberChip
                            factId={fact.id}
                            value={fact.display}
                            fact={fact}
                            onClick={onFactClick}
                          />

                          {onInsertFact && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => onInsertFact(fact)}
                              title={editingSentenceId ? `Insert into ${editingSentenceId}` : "Edit a sentence to insert this chip"}
                              className="text-[11px] h-6 px-2 text-teal border-teal/30 hover:bg-teal-tint hover:text-teal font-semibold"
                            >
                              <Plus className="size-3 mr-0.5" aria-hidden="true" />
                              <span>Insert</span>
                            </Button>
                          )}
                        </div>

                        <div className="text-xs font-semibold text-ink leading-snug">
                          {fact.rowLabel}
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-subtle">
                          <span>{fact.columnLabel}</span>
                          <span className="font-mono text-[10px] truncate max-w-[120px]" title={fact.id}>
                            {fact.id}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* Checks Tab */}
        <TabsContent value="checks" className="flex-1 overflow-y-auto p-4 m-0 space-y-4">
          <div className="flex items-center justify-between text-xs text-subtle pb-1 border-b border-line/60">
            <span className="font-semibold uppercase tracking-wider text-teal text-[11px]">
              Validator Results
            </span>
            <span className="tabular">{allFindings.length} open</span>
          </div>

          {allFindings.length === 0 ? (
            <div className="rounded-lg border border-teal/30 bg-teal-tint/30 p-4 text-center text-xs space-y-1.5">
              <CheckCircle2 className="size-5 text-teal mx-auto" aria-hidden="true" />
              <strong className="text-teal font-semibold block">All Checks Passed</strong>
              <p className="text-subtle text-[11px]">
                NUM-001, CITE-001 and STAT rules passed with zero critical or major findings.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Critical Findings */}
              {criticalFindings.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-critical uppercase text-[11px] tracking-wider">
                      Critical Findings ({criticalFindings.length})
                    </span>
                  </div>

                  <div className="space-y-2">
                    {criticalFindings.map((finding, idx) => (
                      <div
                        key={`crit-${idx}`}
                        className="rounded-lg border border-critical/40 bg-critical-tint/30 p-3 text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <ValidatorBadge severity="critical" ruleId={finding.ruleId} />
                          {onSelectSentence && (
                            <button
                              type="button"
                              onClick={() => onSelectSentence(finding.sentenceId)}
                              className="text-teal hover:underline text-[11px] font-semibold flex items-center gap-1"
                            >
                              <span>Sentence {finding.sentenceId}</span>
                              <ExternalLink className="size-3" aria-hidden="true" />
                            </button>
                          )}
                        </div>

                        <p className="text-body text-[11px] leading-relaxed">
                          {finding.message}
                        </p>

                        {finding.suggestion && (
                          <div className="rounded bg-paper p-2 text-[11px] text-body border border-line space-y-1">
                            <span className="text-teal font-semibold block">Recommendation:</span>
                            <span>{finding.suggestion}</span>
                          </div>
                        )}

                        {/* Micro-diff preview for STAT-001 */}
                        {finding.ruleId === "STAT-001" && (
                          <div className="rounded bg-paper-2/60 p-1.5 text-[10px] font-mono border border-line flex items-center justify-between">
                            <span className="line-through text-critical">significantly more common</span>
                            <span className="text-muted">→</span>
                            <span className="font-semibold text-teal">more frequent</span>
                          </div>
                        )}

                        {/* One-click Apply Suggestion (e.g. STAT-001 on 12.2-s3) */}
                        {onApplySuggestion && (finding.ruleId === "STAT-001" || finding.fix) && (
                          <div className="pt-1">
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => onApplySuggestion(finding.sentenceId, finding)}
                              className="w-full bg-teal hover:bg-teal/90 text-white font-semibold text-xs h-7 shadow-xs flex items-center justify-center gap-1.5"
                            >
                              <Sparkles className="size-3.5" aria-hidden="true" />
                              <span>Apply suggestion</span>
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Major Findings */}
              {majorFindings.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber uppercase text-[11px] tracking-wider">
                      Major Findings ({majorFindings.length})
                    </span>
                  </div>

                  <div className="space-y-2">
                    {majorFindings.map((finding, idx) => (
                      <div
                        key={`maj-${idx}`}
                        className="rounded-lg border border-amber/40 bg-amber-tint/30 p-3 text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <ValidatorBadge severity="major" ruleId={finding.ruleId} />
                          {onSelectSentence && (
                            <button
                              type="button"
                              onClick={() => onSelectSentence(finding.sentenceId)}
                              className="text-teal hover:underline text-[11px] font-semibold flex items-center gap-1"
                            >
                              <span>Sentence {finding.sentenceId}</span>
                              <ExternalLink className="size-3" aria-hidden="true" />
                            </button>
                          )}
                        </div>

                        <p className="text-body text-[11px] leading-relaxed">
                          {finding.message}
                        </p>

                        {finding.suggestion && (
                          <div className="rounded bg-paper p-2 text-[11px] text-body border border-line">
                            <span className="text-amber font-semibold block">Recommendation:</span>
                            <span>{finding.suggestion}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Minor Findings */}
              {minorFindings.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-subtle uppercase text-[11px] tracking-wider">
                      Minor Findings ({minorFindings.length})
                    </span>
                  </div>

                  <div className="space-y-2">
                    {minorFindings.map((finding, idx) => (
                      <div
                        key={`min-${idx}`}
                        className="rounded-lg border border-line bg-card p-3 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <ValidatorBadge severity="minor" ruleId={finding.ruleId} />
                          {onSelectSentence && (
                            <button
                              type="button"
                              onClick={() => onSelectSentence(finding.sentenceId)}
                              className="text-teal hover:underline text-[11px] font-semibold flex items-center gap-1"
                            >
                              <span>Sentence {finding.sentenceId}</span>
                              <ExternalLink className="size-3" aria-hidden="true" />
                            </button>
                          )}
                        </div>

                        <p className="text-body text-[11px] leading-relaxed">
                          {finding.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </aside>
  );
}
