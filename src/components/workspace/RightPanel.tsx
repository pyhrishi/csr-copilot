import { AlertOctagon, AlertTriangle, CheckCircle2, Database, Info, ShieldCheck } from "lucide-react";

import { NumberChip } from "@/components/trust";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DraftSentence, Fact, Section } from "@/lib/types";

interface RightPanelProps {
  section: Section;
  facts: readonly Fact[];
  sentences: readonly DraftSentence[];
  onFactClick: (factId: string) => void;
}

export function RightPanel({
  section,
  facts,
  sentences,
  onFactClick,
}: RightPanelProps) {
  // Filter facts belonging to this section's TLFs
  const sectionFacts = facts.filter((f) => section.tlfs.includes(f.tlf));
  // If section has no mapped TLFs (e.g. conclusions), show study facts
  const displayFacts = sectionFacts.length > 0 ? sectionFacts : facts.slice(0, 12);

  // Aggregate findings across drafted sentences
  const allFindings = sentences.flatMap((s) =>
    s.findings.map((f) => ({ ...f, sentenceId: s.id })),
  );

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
        <TabsContent value="facts" className="flex-1 overflow-y-auto p-4 m-0 space-y-3">
          <div className="flex items-center justify-between text-xs text-subtle pb-1">
            <span className="font-semibold uppercase tracking-wider text-teal text-[11px]">
              Available Facts
            </span>
            <span className="tabular">{displayFacts.length} mapped</span>
          </div>

          <div className="space-y-2.5">
            {displayFacts.map((fact) => (
              <div
                key={fact.id}
                className="rounded-lg border border-line bg-card p-3 shadow-xs hover:border-teal/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded bg-paper-2 px-1.5 py-0.5 text-[10px] font-bold tabular text-subtle">
                    Table {fact.tlf}
                  </span>
                  <NumberChip
                    factId={fact.id}
                    value={fact.display}
                    fact={fact}
                    onClick={onFactClick}
                  />
                </div>

                <div className="mt-2 text-xs font-semibold text-ink leading-snug">
                  {fact.rowLabel}
                </div>

                <div className="mt-1 flex items-center justify-between text-[11px] text-subtle">
                  <span>{fact.columnLabel}</span>
                  <span className="font-mono text-[10px] truncate max-w-[120px]" title={fact.id}>
                    {fact.id}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Checks Tab */}
        <TabsContent value="checks" className="flex-1 overflow-y-auto p-4 m-0 space-y-3">
          <div className="flex items-center justify-between text-xs text-subtle pb-1">
            <span className="font-semibold uppercase tracking-wider text-teal text-[11px]">
              Validator Results
            </span>
            <span className="tabular">{allFindings.length} open</span>
          </div>

          {allFindings.length === 0 ? (
            <div className="rounded-lg border border-teal/30 bg-teal-tint/30 p-4 text-center text-xs">
              <CheckCircle2 className="size-5 text-teal mx-auto mb-1.5" aria-hidden="true" />
              <strong className="text-teal font-semibold">All Checks Passed</strong>
              <p className="text-subtle text-[11px] mt-1">
                NUM-001, CITE-001 and STAT rules passed with zero critical or major findings.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {allFindings.map((finding, idx) => {
                const isCritical = finding.severity === "critical";
                const isMajor = finding.severity === "major";

                const Icon = isCritical
                  ? AlertOctagon
                  : isMajor
                    ? AlertTriangle
                    : Info;

                const borderClass = isCritical
                  ? "border-critical/40 bg-critical-tint/30"
                  : isMajor
                    ? "border-amber/40 bg-amber-tint/30"
                    : "border-line bg-card";

                const badgeClass = isCritical
                  ? "bg-critical text-white"
                  : isMajor
                    ? "bg-amber text-white"
                    : "bg-paper-2 text-subtle";

                return (
                  <div
                    key={idx}
                    className={`rounded-lg border p-3 text-xs space-y-1.5 ${borderClass}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-ink flex items-center gap-1.5">
                        <Icon className="size-3.5 text-critical" aria-hidden="true" />
                        <span>{finding.ruleId}</span>
                      </span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}>
                        {finding.severity}
                      </span>
                    </div>

                    <p className="text-body text-[11px] leading-relaxed">
                      {finding.message}
                    </p>

                    {finding.suggestion && (
                      <div className="text-[11px] text-teal font-medium pt-1 border-t border-line/60">
                        Suggestion: {finding.suggestion}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </aside>
  );
}
