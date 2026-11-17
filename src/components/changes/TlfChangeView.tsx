"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  GitCompare,
  RotateCcw,
  Sparkles,
  Table2,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TlfRevision } from "@/lib/data/seed-types";
import { roleLabel, rolePersona } from "@/lib/roles";
import { partsToText, renderSlots } from "@/lib/slots";
import { applyTlfVersion } from "@/lib/tlf-change";
import type { DraftSentence, Fact, Section, Tlf } from "@/lib/types";
import { useAuditStore, useDraftsStore, useRoleStore } from "@/store";

interface TlfChangeViewProps {
  currentFacts: Fact[];
  currentTlfs: Tlf[];
  sections: Section[];
  revision: TlfRevision;
}

const EMPTY_SENTENCES: Record<string, DraftSentence> = {};

export function TlfChangeView({
  currentFacts,
  currentTlfs,
  sections,
  revision,
}: TlfChangeViewProps) {
  const role = useRoleStore((s) => s.role);
  const persona = rolePersona(role);
  const appendAudit = useAuditStore((s) => s.append);

  const tlfRevisionApplied = useSyncExternalStore(
    useDraftsStore.subscribe,
    () => useDraftsStore.getState().tlfRevisionApplied,
    () => false,
  );

  const draftSentences = useSyncExternalStore(
    useDraftsStore.subscribe,
    () => useDraftsStore.getState().sentences,
    () => EMPTY_SENTENCES,
  );

  const applyTlfUpdate = useDraftsStore((s) => s.applyTlfUpdate);
  const revertTlfUpdate = useDraftsStore((s) => s.revertTlfUpdate);

  // Compute the diff using applyTlfVersion
  const tlfUpdate = useMemo(() => {
    return applyTlfVersion(
      { facts: currentFacts, tlfs: currentTlfs, sections },
      revision,
    );
  }, [currentFacts, currentTlfs, sections, revision]);

  // Find the changed dizziness fact
  const changedFact = tlfUpdate.changes.find(
    (c) => c.factId === "14.3.1.2.dizziness.velo",
  );

  // Section 12.2 and sentence 12.2-s4
  const section122 = sections.find((s) => s.id === "12.2");
  const sentence122s4 = section122?.sentences.find((s) => s.id === "12.2-s4");

  // Renders before and after
  const beforeRender = useMemo(() => {
    if (!sentence122s4) return "";
    const factMap = new Map(currentFacts.map((f) => [f.id, f]));
    return partsToText(renderSlots(sentence122s4.text, { facts: factMap }));
  }, [sentence122s4, currentFacts]);

  const afterRenderParts = useMemo(() => {
    if (!sentence122s4) return [];
    const factMap = new Map(tlfUpdate.facts.map((f) => [f.id, f]));
    return renderSlots(sentence122s4.text, { facts: factMap });
  }, [sentence122s4, tlfUpdate.facts]);

  const afterRender = useMemo(() => {
    return partsToText(afterRenderParts);
  }, [afterRenderParts]);

  const handleApplyUpdate = () => {
    const persona = rolePersona(role);

    // Re-render affected sentences
    const reRenderedSentences: DraftSentence[] = [];
    const factMap = new Map(tlfUpdate.facts.map((f) => [f.id, f]));

    for (const sentenceId of tlfUpdate.affectedSentenceIds) {
      const sentenceTemplate = section122?.sentences.find((s) => s.id === sentenceId);
      if (sentenceTemplate) {
        const existing = draftSentences[sentenceId];
        const newRendered = renderSlots(sentenceTemplate.text, { facts: factMap });

        const updatedDraft: DraftSentence = {
          id: sentenceId,
          sectionId: "12.2",
          template: sentenceTemplate.text,
          rendered: newRendered,
          provenance: existing?.provenance ?? "ai",
          state: existing?.state ?? "accepted",
          cites: sentenceTemplate.cites,
          generation: existing?.generation ?? {
            mode: "simulated",
            promptVersion: "v1.2",
            templateVersion: "12.2-v1",
            at: new Date().toISOString(),
          },
          findings: existing?.findings ?? [],
        };
        reRenderedSentences.push(updatedDraft);
      }
    }

    applyTlfUpdate(tlfUpdate, reRenderedSentences);

    appendAudit({
      actor: persona.name,
      role,
      action: "tlf_update",
      objectId: "14.3.1.2",
      detail: `Applied Table 14.3.1.2 revision v1 → v2: dizziness (velorantib) updated from 22 (7.4%) to 23 (7.7%). Re-rendered Section 12.2.`,
      versions: { tlf: "v2" },
    });

    toast.success("Applied Table 14.3.1.2 v2 update to clinical fact store and Section 12.2.");
  };

  const handleRevert = () => {
    revertTlfUpdate();
    toast.info("Reverted Table 14.3.1.2 back to v1.");
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-serif text-ink tracking-tight">
              TLF Change Impact Analysis
            </h1>
            <Badge variant="outline" className="font-mono text-xs bg-paper-2 text-ink border-line">
              Table 14.3.1.2 · v1 → v2
            </Badge>
          </div>
          <p className="text-sm text-subtle mt-1">
            Detect affected clinical numbers and CSR prose across database updates and TLF re-runs.
          </p>
        </div>

        {tlfRevisionApplied && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRevert}
            className="text-xs text-muted hover:text-ink gap-1.5 h-8"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Revert to Table v1
          </Button>
        )}
      </div>

      {/* Rerun Trigger Callout */}
      <div className="p-4 rounded-xl bg-card border border-line shadow-xs flex items-start gap-3">
        <GitCompare className="h-5 w-5 text-teal shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <div className="font-bold text-ink text-sm">
            Ingested Rerun: Table 14.3.1.2 (Revision 2)
          </div>
          <p className="text-body leading-relaxed">
            Following database lock (DBL), an investigator query resolution at Site 104 verified an
            additional case of dizziness in the velorantib group. Biostatistics delivered a re-run of{" "}
            <strong>Table 14.3.1.2</strong> (v2). One fact changed; 49 facts remain unchanged.
          </p>
        </div>
      </div>

      {/* Side-by-side Cell Diff */}
      <div className="bg-card rounded-xl border border-line p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <Table2 className="h-4 w-4 text-teal" />
            <h3 className="text-sm font-bold text-ink">
              Table 14.3.1.2 Cell Diff (TEAEs ≥ 5% by Preferred Term)
            </h3>
          </div>
          <span className="font-mono text-xs text-subtle">
            Population: Safety (N=298 velo, N=299 placebo)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-paper-2 text-ink uppercase tracking-wider font-semibold border-b border-line text-[11px]">
              <tr>
                <th className="py-2.5 px-4">Preferred Term</th>
                <th className="py-2.5 px-4">Treatment Arm</th>
                <th className="py-2.5 px-4">v1 Baseline Value</th>
                <th className="py-2.5 px-4">v2 Rerun Value</th>
                <th className="py-2.5 px-4">Delta / Change</th>
                <th className="py-2.5 px-4 text-right">Fact ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-body">
              {/* Changed row: Dizziness */}
              <tr className="bg-teal-tint/30 font-medium">
                <td className="py-3 px-4 font-bold text-ink flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal shrink-0" />
                  Dizziness
                </td>
                <td className="py-3 px-4">Velorantib 20 mg (N=298)</td>
                <td className="py-3 px-4 font-mono line-through text-muted tabular">
                  {changedFact?.before?.display ?? "22 (7.4%)"}
                </td>
                <td className="py-3 px-4 font-mono font-bold text-teal tabular">
                  {changedFact?.after?.display ?? "23 (7.7%)"}
                </td>
                <td className="py-3 px-4 text-teal font-semibold">
                  +1 patient (+0.3%)
                </td>
                <td className="py-3 px-4 text-right font-mono text-[11px] text-subtle">
                  14.3.1.2.dizziness.velo
                </td>
              </tr>

              {/* Unchanged sample rows for context */}
              <tr className="text-muted/80">
                <td className="py-2.5 px-4">Dizziness</td>
                <td className="py-2.5 px-4">Placebo (N=299)</td>
                <td className="py-2.5 px-4 font-mono tabular">15 (5.0%)</td>
                <td className="py-2.5 px-4 font-mono tabular">15 (5.0%)</td>
                <td className="py-2.5 px-4 italic text-subtle">No change</td>
                <td className="py-2.5 px-4 text-right font-mono text-[11px] text-subtle">
                  14.3.1.2.dizziness.pbo
                </td>
              </tr>

              <tr className="text-muted/80">
                <td className="py-2.5 px-4">Hypotension</td>
                <td className="py-2.5 px-4">Velorantib 20 mg (N=298)</td>
                <td className="py-2.5 px-4 font-mono tabular">27 (9.1%)</td>
                <td className="py-2.5 px-4 font-mono tabular">27 (9.1%)</td>
                <td className="py-2.5 px-4 italic text-subtle">No change</td>
                <td className="py-2.5 px-4 text-right font-mono text-[11px] text-subtle">
                  14.3.1.2.hypotension.velo
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Affected CSR Sentences Comparison */}
      <div className="bg-card rounded-xl border border-line p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-teal" />
            <h3 className="text-sm font-bold text-ink">
              Affected CSR Prose: Section 12.2 (Sentence 12.2-s4)
            </h3>
          </div>
          <Badge variant="outline" className="text-xs bg-paper-2 text-ink">
            1 sentence affected
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Before render */}
          <div className="p-4 rounded-lg bg-paper-2/50 border border-line space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-muted uppercase font-bold text-[10px]">
                v1 Current Render
              </span>
              <span className="text-[11px] text-subtle">Table 14.3.1.2 v1</span>
            </div>
            <p className="text-xs text-body leading-relaxed">{beforeRender}</p>
          </div>

          {/* After render */}
          <div className="p-4 rounded-lg bg-teal-tint/40 border border-teal/30 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-teal uppercase font-bold text-[10px] flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Proposed v2 Render
              </span>
              <span className="text-[11px] text-teal font-semibold">Table 14.3.1.2 v2</span>
            </div>
            <p className="text-xs text-ink font-medium leading-relaxed">
              {afterRender}
            </p>
          </div>
        </div>
      </div>

      {/* Action / Applied Status Bar */}
      <div className="p-5 rounded-xl bg-card border border-line shadow-xs flex flex-wrap items-center justify-between gap-4">
        {tlfRevisionApplied ? (
          <>
            <div className="flex items-center gap-2.5 text-xs text-ok font-semibold">
              <FileCheck2 className="h-5 w-5 text-ok shrink-0" />
              <div>
                <span className="text-sm font-bold text-ink block">
                  Table 14.3.1.2 v2 is active and reconciled
                </span>
                <span className="text-subtle font-normal">
                  Sentence 12.2-s4 updated with &ldquo;Source updated&rdquo; tag. All 12 numbers in Section 12.2 remain 100% matched.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/sections/12.2/reconciliation"
                className="inline-flex items-center bg-teal hover:bg-teal-dark text-white text-xs h-9 px-3.5 rounded-lg gap-1.5 shadow-xs font-semibold transition-colors"
              >
                <Table2 className="h-4 w-4" />
                View Section 12.2 Reconciliation Report
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-0.5 text-xs text-subtle max-w-xl">
              <div className="font-semibold text-ink text-sm">
                Ready to Apply Table 14.3.1.2 Revision
              </div>
              <p>
                Applying update swaps facts to v2, re-renders sentence 12.2-s4, logs an immutable
                audit trail event, and triggers automatic re-reconciliation.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-muted">
                Actor: {persona.name} ({roleLabel(role)})
              </span>
              <Button
                onClick={handleApplyUpdate}
                className="bg-teal hover:bg-teal-dark text-white text-xs h-9 px-4 gap-1.5 shadow-xs font-semibold"
              >
                <Sparkles className="h-4 w-4" />
                Apply update
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
