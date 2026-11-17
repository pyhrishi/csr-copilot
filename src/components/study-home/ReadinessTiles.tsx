import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock, FileCheck2 } from "lucide-react";

import type { ReadinessMetrics } from "@/lib/study-readiness";

interface ReadinessTilesProps {
  metrics: ReadinessMetrics;
  highlight?: boolean;
}

export function ReadinessTiles({ metrics, highlight = false }: ReadinessTilesProps) {
  const { inputsParsed, openExceptions, sentencesAwaitingReview, numbersReconciled } = metrics;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="label text-teal flex items-center gap-1.5">
          <span>Clinical Data Readiness</span>
          {highlight && (
            <span className="rounded-full bg-teal-tint px-2 py-0.5 text-[10px] font-bold text-teal">
              Executive Priority
            </span>
          )}
        </h3>
        <Link
          href="/setup"
          className="text-xs font-medium text-teal hover:underline inline-flex items-center gap-1"
        >
          <span>View source data & mappings</span>
          <ArrowRight className="size-3" aria-hidden="true" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tile 1: Inputs Parsed */}
        <div className="rounded-xl border border-line bg-card p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-subtle">
              <span className="text-xs font-semibold uppercase tracking-wider">Inputs Parsed</span>
              <FileCheck2 className="size-4 text-teal" aria-hidden="true" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tabular text-ink">
                {inputsParsed.count} of {inputsParsed.total}
              </span>
              <span className="text-xs font-semibold text-teal tabular">
                ({inputsParsed.percent}%)
              </span>
            </div>
            <p className="mt-1 text-xs text-subtle">
              Protocol, SAP, TLF package, ADaM, and narrative listings hashed.
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-line/60 flex items-center justify-between text-[11px]">
            <span className="text-teal font-medium flex items-center gap-1">
              <CheckCircle2 className="size-3" aria-hidden="true" />
              All inputs parsed
            </span>
            <Link
              href="/setup"
              className="text-subtle hover:text-ink hover:underline"
              aria-label="Inspect ingested study inputs on Data Readiness screen"
            >
              Inspect →
            </Link>
          </div>
        </div>

        {/* Tile 2: Open Exceptions */}
        <div
          className={`rounded-xl border p-4 flex flex-col justify-between ${
            openExceptions.count > 0 ? "border-amber/40 bg-card" : "border-line bg-card"
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-subtle">
              <span className="text-xs font-semibold uppercase tracking-wider">Open Exceptions</span>
              <AlertTriangle
                className={`size-4 ${openExceptions.count > 0 ? "text-amber" : "text-subtle"}`}
                aria-hidden="true"
              />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span
                className={`text-2xl font-bold tabular ${
                  openExceptions.count > 0 ? "text-amber" : "text-ink"
                }`}
              >
                {openExceptions.count}
              </span>
              <span className="text-xs font-semibold text-subtle">
                {openExceptions.count === 1 ? "query open" : "queries open"}
              </span>
            </div>
            <p className="mt-1 text-xs text-subtle">
              Narrative source discrepancies flagged for Data Management.
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-line/60 flex items-center justify-between text-[11px]">
            <span className="text-amber font-medium flex items-center gap-1">
              <AlertTriangle className="size-3" aria-hidden="true" />
              Owner: Data Management
            </span>
            <Link
              href="/setup#exceptions"
              className="text-subtle hover:text-ink hover:underline"
              aria-label="Resolve open data queries on Data Readiness screen"
            >
              Resolve →
            </Link>
          </div>
        </div>

        {/* Tile 3: Sentences Awaiting Review */}
        <div className="rounded-xl border border-line bg-card p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-subtle">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Awaiting Review
              </span>
              <Clock className="size-4 text-teal" aria-hidden="true" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tabular text-ink">
                {sentencesAwaitingReview.pendingCount}
              </span>
              <span className="text-xs font-semibold text-subtle tabular">
                of {sentencesAwaitingReview.draftedCount} drafted
              </span>
            </div>
            <p className="mt-1 text-xs text-subtle">
              {sentencesAwaitingReview.draftedCount === 0
                ? `${sentencesAwaitingReview.totalTemplateCount} template sentences ready for authoring.`
                : `${sentencesAwaitingReview.pendingCount} sentences awaiting writer or biostat review.`}
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-line/60 flex items-center justify-between text-[11px]">
            <span className="text-subtle font-medium">
              {sentencesAwaitingReview.totalTemplateCount} sentences in R1
            </span>
            <Link
              href="/sections/12.2"
              className="text-subtle hover:text-ink hover:underline"
              aria-label="Open authoring workspace for Section 12.2"
            >
              Author →
            </Link>
          </div>
        </div>

        {/* Tile 4: Numbers Reconciled */}
        <div className="rounded-xl border border-line bg-card p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-subtle">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Numbers Reconciled
              </span>
              <CheckCircle2 className="size-4 text-teal" aria-hidden="true" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tabular text-ink">
                {numbersReconciled.matched} of {numbersReconciled.total}
              </span>
              <span className="text-xs font-semibold text-teal tabular">
                ({numbersReconciled.percent}%)
              </span>
            </div>
            <p className="mt-1 text-xs text-subtle">
              {numbersReconciled.matched} of {numbersReconciled.total} numbers match their source
              tables.
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-line/60 flex items-center justify-between text-[11px]">
            <span className="text-teal font-medium flex items-center gap-1">
              <CheckCircle2 className="size-3" aria-hidden="true" />
              100% table match
            </span>
            <Link
              href="/sections/12.2/reconciliation"
              className="text-subtle hover:text-ink hover:underline"
              aria-label="Open numbers reconciliation report for Section 12.2"
            >
              Report →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
