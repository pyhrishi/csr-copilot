"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, FileText, Sparkles, UserCheck } from "lucide-react";

import { ReadinessTiles } from "@/components/study-home/ReadinessTiles";
import { SectionBoard } from "@/components/study-home/SectionBoard";
import { StudyCard } from "@/components/study-home/StudyCard";
import type { SeedStudy } from "@/lib/data/seed-types";
import { roleLabel } from "@/lib/roles";
import { computeReadinessMetrics } from "@/lib/study-readiness";
import type { Fact, Patient, Section, Tlf } from "@/lib/types";
import { useDraftsStore } from "@/store/drafts";
import { useRoleStore } from "@/store/role";

interface StudyHomeViewProps {
  study: SeedStudy;
  sections: readonly Section[];
  facts: readonly Fact[];
  tlfs: readonly Tlf[];
  patients: readonly Patient[];
  totalInputs: number;
  parsedInputs: number;
}

export function StudyHomeView({
  study,
  sections,
  facts,
  tlfs,
  patients,
  totalInputs,
  parsedInputs,
}: StudyHomeViewProps) {
  // Sync with client stores safely
  const role = useSyncExternalStore(
    useRoleStore.subscribe,
    () => useRoleStore.getState().role,
    () => "writer" as const,
  );

  const draftSentences = useSyncExternalStore(
    useDraftsStore.subscribe,
    () => useDraftsStore.getState().sentences,
    () => ({}),
  );

  const sectionStatuses = useSyncExternalStore(
    useDraftsStore.subscribe,
    () => useDraftsStore.getState().sectionStatuses,
    () => ({}),
  );

  const metrics = computeReadinessMetrics({
    totalInputs,
    parsedInputs,
    patients,
    sections,
    facts,
    tlfs,
    draftSentences,
  });

  const isWriter = role === "writer";
  const isExec = role === "exec";

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Title & Persona Context */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-line pb-4">
        <div>
          <h1 className="font-heading text-3xl sm:text-4xl font-semibold text-ink">
            Study Home
          </h1>
          <p className="text-sm text-subtle mt-1">
            Clinical study status, ICH E3 authoring sections, and clinical data readiness.
          </p>
        </div>

        {/* Current Active Persona Banner */}
        <div className="flex items-center gap-2 rounded-lg border border-line bg-card px-3 py-1.5 shadow-xs shrink-0">
          <UserCheck className="size-4 text-teal" aria-hidden="true" />
          <div className="text-xs">
            <span className="text-subtle">Viewing as </span>
            <strong className="text-ink font-semibold">{roleLabel(role)}</strong>
          </div>
        </div>
      </div>

      {/* Role-specific callout */}
      {isWriter && (
        <div className="rounded-lg border border-teal/30 bg-teal-tint/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full bg-teal text-white flex items-center justify-center shrink-0">
              <FileText className="size-4" aria-hidden="true" />
            </div>
            <div>
              <strong className="text-ink text-sm font-semibold">
                Medical Writer Priority Workspace
              </strong>
              <p className="text-body mt-0.5">
                Your assigned Release 1 safety sections (10.1, 12.2, 12.3) are ready for authoring and review.
              </p>
            </div>
          </div>
          <Link
            href="/sections/12.2"
            className="inline-flex items-center gap-1.5 rounded-md bg-teal px-3 py-1.5 font-semibold text-white hover:bg-teal/90 shadow-xs shrink-0"
          >
            <span>Open Hero Section 12.2</span>
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      )}

      {role === "biostat" && (
        <div className="rounded-lg border border-teal/30 bg-teal-tint/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full bg-teal text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="size-4" aria-hidden="true" />
            </div>
            <div>
              <strong className="text-ink text-sm font-semibold">
                Biostatistician Verification Workspace
              </strong>
              <p className="text-body mt-0.5">
                TLF tables parsed into {facts.length} structured facts. {metrics.numbersReconciled.matched} of {metrics.numbersReconciled.total} numbers match their source tables ({metrics.numbersReconciled.percent}%).
              </p>
            </div>
          </div>
          <Link
            href="/sections/12.2/reconciliation"
            className="inline-flex items-center gap-1.5 rounded-md bg-teal px-3 py-1.5 font-semibold text-white hover:bg-teal/90 shadow-xs shrink-0"
          >
            <span>Review Reconciled Numbers (12.2)</span>
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      )}

      {isExec && (
        <div className="rounded-lg border border-line bg-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full bg-ink text-teal-light flex items-center justify-center shrink-0">
              <Sparkles className="size-4" aria-hidden="true" />
            </div>
            <div>
              <strong className="text-ink text-sm font-semibold">
                Executive CSR Readiness Overview
              </strong>
              <p className="text-subtle mt-0.5">
                Target final CSR submission in 66 days (22 Jan 2027). All {totalInputs} input packages parsed; 2 open data management queries.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold tabular">
            <span className="text-teal flex items-center gap-1">
              <CheckCircle2 className="size-3.5" aria-hidden="true" />
              {metrics.numbersReconciled.percent}% Numeric Match
            </span>
          </div>
        </div>
      )}

      {/* Primary Study Overview Card */}
      <StudyCard study={study} />

      {/* Readiness tiles rendered above section board for above-the-fold visibility across viewports */}
      <ReadinessTiles metrics={metrics} highlight={isExec} />

      {/* Section board with role-specific writer emphasis */}
      <SectionBoard
        sections={sections}
        draftSentences={draftSentences}
        sectionStatuses={sectionStatuses}
        highlightWriter={isWriter}
      />
    </div>
  );
}
