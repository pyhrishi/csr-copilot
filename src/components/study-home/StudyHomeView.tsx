"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CircleDashed,
  Clock,
  FileText,
  Sparkles,
  UserCheck,
} from "lucide-react";

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

const EMPTY_MAP = {};

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
    () => EMPTY_MAP,
  );

  const sectionStatuses = useSyncExternalStore(
    useDraftsStore.subscribe,
    () => useDraftsStore.getState().sectionStatuses,
    () => EMPTY_MAP,
  );

  const sectionAutonomy = useSyncExternalStore(
    useDraftsStore.subscribe,
    () => useDraftsStore.getState().sectionAutonomy,
    () => EMPTY_MAP,
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
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-8 md:px-8 md:py-10">
      {/* Page Title & Persona Context */}
      <div className="flex flex-col gap-4 border-b border-line pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-semibold text-ink sm:text-4xl">Study Home</h1>
          <p className="mt-1 text-sm text-subtle">
            Clinical study status, ICH E3 authoring sections, and clinical data readiness.
          </p>
        </div>

        {/* Current Active Persona Banner */}
        <div className="flex shrink-0 items-center gap-2 rounded-lg border border-line bg-card px-3 py-1.5 shadow-xs">
          <UserCheck className="size-4 text-teal" aria-hidden="true" />
          <div className="text-xs">
            <span className="text-subtle">Viewing as </span>
            <strong className="font-semibold text-ink">{roleLabel(role)}</strong>
          </div>
        </div>
      </div>

      {/* Role-specific callout */}
      {isWriter && (
        <div className="flex flex-col justify-between gap-3 rounded-lg border border-teal/30 bg-teal-tint/40 p-4 text-xs sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-teal text-white">
              <FileText className="size-4" aria-hidden="true" />
            </div>
            <div>
              <strong className="text-sm font-semibold text-ink">
                Medical Writer Priority Workspace
              </strong>
              <p className="mt-0.5 text-body">
                Your assigned Release 1 safety sections (10.1, 12.2, 12.3) are ready for authoring
                and review.
              </p>
            </div>
          </div>
          <Link
            href="/sections/12.2"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-teal px-3 py-1.5 font-semibold text-white shadow-xs hover:bg-teal/90"
          >
            <span>Open Hero Section 12.2</span>
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      )}

      {role === "biostat" && (
        <div className="flex flex-col justify-between gap-3 rounded-lg border border-teal/30 bg-teal-tint/40 p-4 text-xs sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-teal text-white">
              <CheckCircle2 className="size-4" aria-hidden="true" />
            </div>
            <div>
              <strong className="text-sm font-semibold text-ink">
                Biostatistician Verification Workspace
              </strong>
              <p className="mt-0.5 text-body">
                {`TLF tables parsed into ${facts.length} structured facts. `}
                {metrics.numbersReconciled.total === 0
                  ? "Nothing drafted yet, so there are no numbers to reconcile."
                  : `${metrics.numbersReconciled.matched} of ${metrics.numbersReconciled.total} numbers in drafted sentences match their source tables (${metrics.numbersReconciled.percent}%).`}
              </p>
            </div>
          </div>
          <Link
            href="/sections/12.2/reconciliation"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-teal px-3 py-1.5 font-semibold text-white shadow-xs hover:bg-teal/90"
          >
            <span>Review Reconciled Numbers (12.2)</span>
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      )}

      {isExec && (
        <div className="flex flex-col justify-between gap-3 rounded-lg border border-line bg-card p-4 text-xs sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-ink text-teal-light">
              <Sparkles className="size-4" aria-hidden="true" />
            </div>
            <div>
              <strong className="text-sm font-semibold text-ink">
                Executive CSR Readiness Overview
              </strong>
              <p className="mt-0.5 text-subtle">
                Target final CSR submission in 66 days (22 Jan 2027). All {totalInputs} input
                packages parsed; 2 open data management queries.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold tabular">
            {metrics.numbersReconciled.total === 0 ? (
              <span className="flex items-center gap-1 text-subtle">
                <CircleDashed className="size-3.5" aria-hidden="true" />
                No numbers drafted yet
              </span>
            ) : (
              <span
                className={`flex items-center gap-1 ${
                  metrics.numbersReconciled.allMatched ? "text-teal" : "text-amber"
                }`}
              >
                {metrics.numbersReconciled.allMatched ? (
                  <CheckCircle2 className="size-3.5" aria-hidden="true" />
                ) : (
                  <Clock className="size-3.5" aria-hidden="true" />
                )}
                {metrics.numbersReconciled.percent}% Numeric Match
              </span>
            )}
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
        sectionAutonomy={sectionAutonomy}
        highlightWriter={isWriter}
      />
    </div>
  );
}
