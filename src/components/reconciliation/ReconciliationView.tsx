"use client";

import * as React from "react";
import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Table2,
} from "lucide-react";
import { toast } from "sonner";

import { AutonomyPill, ReleaseBadge } from "@/components/trust";
import type { StatRule } from "@/lib/data/seed-types";
import { reconcileSection } from "@/lib/reconcile";
import { rolePersona } from "@/lib/roles";
import type { DraftSentence, Fact, RenderedPart, Section, Tlf } from "@/lib/types";
import { buildReferenceIndex, loadRules, validateSentence } from "@/lib/validate";
import { useAuditStore } from "@/store/audit";
import { useDraftsStore } from "@/store/drafts";
import { useRoleStore } from "@/store/role";

import { ReconciliationTable } from "./ReconciliationTable";
import { SignOffBlock } from "./SignOffBlock";

interface ReconciliationViewProps {
  section: Section;
  allSections: readonly Section[];
  facts: readonly Fact[];
  tlfs: readonly Tlf[];
  rules: readonly StatRule[];
}

const EMPTY_SENTENCES: Record<string, DraftSentence> = {};
const EMPTY_STATUSES: Record<string, "not_started" | "drafted" | "in_review" | "signed_off"> = {};
const EMPTY_FACTS: Record<string, Fact> = {};
const EMPTY_TLFS: Record<string, Tlf> = {};

export function ReconciliationView({
  section,
  allSections,
  facts,
  tlfs,
  rules,
}: ReconciliationViewProps) {
  // Store subscriptions
  const draftSentences = useSyncExternalStore(
    useDraftsStore.subscribe,
    () => useDraftsStore.getState().sentences,
    () => EMPTY_SENTENCES,
  );

  const sectionStatuses = useSyncExternalStore(
    useDraftsStore.subscribe,
    () => useDraftsStore.getState().sectionStatuses,
    () => EMPTY_STATUSES,
  );

  const customFacts = useSyncExternalStore(
    useDraftsStore.subscribe,
    () => useDraftsStore.getState().customFacts,
    () => EMPTY_FACTS,
  );

  const customTlfs = useSyncExternalStore(
    useDraftsStore.subscribe,
    () => useDraftsStore.getState().customTlfs,
    () => EMPTY_TLFS,
  );

  const role = useSyncExternalStore(
    useRoleStore.subscribe,
    () => useRoleStore.getState().role,
    () => "writer" as const,
  );

  const auditEvents = useSyncExternalStore(
    useAuditStore.subscribe,
    () => useAuditStore.getState().events,
    () => [],
  );

  const appendAudit = useAuditStore((state) => state.append);
  const setSectionStatus = useDraftsStore((state) => state.setSectionStatus);

  const activeFacts = useMemo(() => {
    return facts.map((f) => customFacts[f.id] ?? f);
  }, [facts, customFacts]);

  const activeTlfs = useMemo(() => {
    return tlfs.map((t) => customTlfs[t.id] ?? t);
  }, [tlfs, customTlfs]);

  // Sentences belonging to this section
  const currentSentences = useMemo(() => {
    return section.sentences
      .map((s) => draftSentences[s.id])
      .filter(Boolean) as DraftSentence[];
  }, [section.sentences, draftSentences]);

  // Validation context to determine active critical findings
  const validationCtx = useMemo(() => {
    const factMap = new Map(activeFacts.map((f) => [f.id, f]));
    const compiledRules = loadRules(rules);
    const references = buildReferenceIndex({ tlfs: activeTlfs, sections: allSections });
    return { facts: factMap, rules: compiledRules, references };
  }, [activeFacts, rules, activeTlfs, allSections]);

  // Active findings: if sentences are drafted in store, read their findings;
  // otherwise, validate base template sentences.
  const activeFindings = useMemo(() => {
    if (currentSentences.length > 0) {
      return currentSentences.flatMap((s) => s.findings ?? []);
    }
    return section.sentences.flatMap((s) =>
      validateSentence({ template: s.text, cites: s.cites }, validationCtx),
    );
  }, [currentSentences, section.sentences, validationCtx]);

  const criticalFindings = useMemo(
    () => activeFindings.filter((f) => f.severity === "critical"),
    [activeFindings],
  );

  // Rendered drafts map for reconciliation
  const renderedMap = useMemo(() => {
    const map: Record<string, readonly RenderedPart[]> = {};
    for (const s of currentSentences) {
      if (s.rendered) {
        map[s.id] = s.rendered;
      }
    }
    return map;
  }, [currentSentences]);

  // Execute numeric reconciliation
  const report = useMemo(() => {
    return reconcileSection(section.id, activeFacts, activeTlfs, {
      sections: allSections,
      rendered: renderedMap,
    });
  }, [section.id, activeFacts, activeTlfs, allSections, renderedMap]);

  const { rows, summary } = report;

  // Sign-off status
  const isSignedOff = sectionStatuses[section.id] === "signed_off";

  // Last sign-off audit event (if any)
  const lastSignOffEvent = useMemo(() => {
    return [...auditEvents]
      .reverse()
      .find((e) => e.objectId === section.id && e.action === "sign_off");
  }, [auditEvents, section.id]);

  // Handle Sign-Off execution
  const handleSignOff = () => {
    const persona = rolePersona(role);

    // 1. Update section status to signed_off in drafts store
    setSectionStatus(section.id, "signed_off");

    // 2. Append immutable audit event
    appendAudit({
      actor: `${persona.name} (${persona.title})`,
      role,
      action: "sign_off",
      objectId: section.id,
      detail: `Biostatistician electronic sign-off: verified ${summary.matched}/${summary.total} numbers against source TLFs with 0 open critical findings. Meaning of signature: "I confirm the numbers in this section match the source TLFs" (21 CFR Part 11).`,
    });

    // 3. Confirm with toast notification
    toast.success("Section Signed Off", {
      description: `Section ${section.id} signed off by ${persona.name}. Status updated to Signed off on Study Home.`,
    });
  };

  // Computed summary share percentage
  const share =
    summary.total > 0
      ? Math.floor((summary.matched * 100) / summary.total)
      : 100;
  const computedSummaryText = `${summary.matched} of ${summary.total} numbers reconciled (${share}%)`;

  return (
    <div data-hydrated="true" className="min-h-screen bg-paper pb-16">
      {/* Top Header & Breadcrumbs */}
      <div className="border-b border-line bg-card px-8 py-5">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Breadcrumb & Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-subtle">
              <Link
                href="/sections"
                className="hover:text-ink transition-colors"
              >
                Sections
              </Link>
              <span>/</span>
              <Link
                href={`/sections/${section.id}`}
                className="hover:text-ink transition-colors font-medium text-ink"
              >
                Section {section.id}
              </Link>
              <span>/</span>
              <span className="text-teal font-medium">Reconciliation Report</span>
            </div>

            <Link
              href={`/sections/${section.id}`}
              className="inline-flex items-center justify-center rounded-md border border-line bg-card hover:bg-paper-2 text-ink text-xs font-medium h-8 px-3 transition-colors shadow-2xs"
            >
              <ArrowLeft className="size-3.5 mr-1.5" aria-hidden="true" />
              <span>Return to Section Workspace</span>
            </Link>
          </div>

          {/* Title Row */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold text-teal bg-teal-tint px-2 py-0.5 rounded border border-teal/20">
                  ICH E3 Section {section.id}
                </span>
                <ReleaseBadge release={section.release} />
                <AutonomyPill level={section.autonomy} />
                {isSignedOff && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded bg-teal text-white">
                    <ShieldCheck className="size-3.5" aria-hidden="true" />
                    <span>Signed off</span>
                  </span>
                )}
              </div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-ink">
                {section.title} · Numeric Reconciliation
              </h1>
              <p className="text-xs text-subtle mt-1">
                Every extracted numeral compared against underlying locked clinical TLF tables (FR-QC-01, FR-WF-01/02).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-8 pt-8 space-y-8">
        {/* Computed Summary Banner */}
        <section
          aria-label="Reconciliation summary metrics"
          className="rounded-lg border border-line bg-card p-6 shadow-xs"
        >
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div
                className={`p-3.5 rounded-full ${
                  summary.allMatched
                    ? "bg-teal-tint text-teal ring-1 ring-teal/30"
                    : "bg-critical-tint text-critical ring-1 ring-critical/30"
                }`}
              >
                {summary.allMatched ? (
                  <CheckCircle2 className="size-7 stroke-[2.2]" aria-hidden="true" />
                ) : (
                  <Table2 className="size-7" aria-hidden="true" />
                )}
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal block mb-0.5">
                  Reconciliation Fidelity
                </span>
                <h2 className="text-xl md:text-2xl font-bold font-heading text-ink tracking-tight">
                  {computedSummaryText}
                </h2>
                <p className="text-xs text-subtle mt-0.5">
                  {summary.allMatched
                    ? "100% concordance: every rendered numeral in Section 12.2 matches the corresponding TLF cell."
                    : `${summary.mismatched} discrepancy detected between draft text and source tables.`}
                </p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-6 border-l border-line pl-6">
              <div className="text-center">
                <span className="text-[11px] uppercase tracking-wider text-subtle block">
                  Total Numbers
                </span>
                <span className="font-heading text-2xl font-bold text-ink tabular">
                  {summary.total}
                </span>
              </div>

              <div className="text-center">
                <span className="text-[11px] uppercase tracking-wider text-subtle block">
                  Matched
                </span>
                <span className="font-heading text-2xl font-bold text-teal tabular">
                  {summary.matched}
                </span>
              </div>

              <div className="text-center">
                <span className="text-[11px] uppercase tracking-wider text-subtle block">
                  Concordance
                </span>
                <span className="font-heading text-2xl font-bold text-ink tabular">
                  {share}%
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 1: Reconciliation Table */}
        <section aria-label="Numeric reconciliation table" className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-lg font-bold text-ink">
                Extracted Numbers vs Source TLF Cells
              </h2>
              <p className="text-xs text-subtle">
                Click any number chip or table row to inspect highlighted source cells in the Source Drawer.
              </p>
            </div>
          </div>

          <ReconciliationTable
            section={section}
            rows={rows}
            summary={summary}
            facts={activeFacts}
            tlfs={activeTlfs}
          />
        </section>

        {/* Section 2: Part 11 Mock SignOffBlock */}
        <SignOffBlock
          section={section}
          role={role}
          criticalFindings={criticalFindings}
          summary={summary}
          isSignedOff={isSignedOff}
          onSignOff={handleSignOff}
          lastSignOffEvent={lastSignOffEvent}
        />
      </main>
    </div>
  );
}
