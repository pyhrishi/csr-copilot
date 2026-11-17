import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CircleDashed,
  Clock,
  FileCheck2,
} from "lucide-react";

import type { ReadinessMetrics } from "@/lib/study-readiness";

interface ReadinessTilesProps {
  metrics: ReadinessMetrics;
  highlight?: boolean;
}

export function ReadinessTiles({ metrics, highlight = false }: ReadinessTilesProps) {
  const { inputsParsed, openExceptions, sentencesAwaitingReview, numbersReconciled } = metrics;
  const noNumbersYet = numbersReconciled.total === 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 label text-teal">
          <span>Clinical Data Readiness</span>
          {highlight && (
            <span className="rounded-full bg-teal-tint px-2 py-0.5 text-[10px] font-bold text-teal">
              Executive Priority
            </span>
          )}
        </h3>
        <Link
          href="/setup"
          className="inline-flex items-center gap-1 text-xs font-medium text-teal hover:underline"
        >
          <span>View source data & mappings</span>
          <ArrowRight className="size-3" aria-hidden="true" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Tile 1: Inputs Parsed */}
        <div className="flex flex-col justify-between rounded-xl border border-line bg-card p-4">
          <div>
            <div className="flex items-center justify-between text-subtle">
              <span className="text-xs font-semibold tracking-wider uppercase">Inputs Parsed</span>
              <FileCheck2 className="size-4 text-teal" aria-hidden="true" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-ink tabular">
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
          <div className="mt-3 flex items-center justify-between border-t border-line/60 pt-3 text-[11px]">
            <span className="flex items-center gap-1 font-medium text-teal">
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
          className={`flex flex-col justify-between rounded-xl border p-4 ${
            openExceptions.count > 0 ? "border-amber/40 bg-card" : "border-line bg-card"
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-subtle">
              <span className="text-xs font-semibold tracking-wider uppercase">
                Open Exceptions
              </span>
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
          <div className="mt-3 flex items-center justify-between border-t border-line/60 pt-3 text-[11px]">
            <span className="flex items-center gap-1 font-medium text-amber">
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
        <div className="flex flex-col justify-between rounded-xl border border-line bg-card p-4">
          <div>
            <div className="flex items-center justify-between text-subtle">
              <span className="text-xs font-semibold tracking-wider uppercase">
                Awaiting Review
              </span>
              <Clock className="size-4 text-teal" aria-hidden="true" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-ink tabular">
                {sentencesAwaitingReview.pendingCount}
              </span>
              <span className="text-xs font-semibold text-subtle tabular">
                of {sentencesAwaitingReview.draftedCount} drafted
              </span>
            </div>
            <p className="mt-1 text-xs text-subtle">
              {sentencesAwaitingReview.draftedCount === 0
                ? `Nothing drafted yet · ${sentencesAwaitingReview.totalTemplateCount} sentences ready to generate`
                : `${sentencesAwaitingReview.pendingCount} sentences awaiting writer or biostat review.`}
            </p>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-line/60 pt-3 text-[11px]">
            <span className="font-medium text-subtle">
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
        <div className="flex flex-col justify-between rounded-xl border border-line bg-card p-4">
          <div>
            <div className="flex items-center justify-between text-subtle">
              <span className="text-xs font-semibold tracking-wider uppercase">
                Numbers Reconciled
              </span>
              <CheckCircle2 className="size-4 text-teal" aria-hidden="true" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-ink tabular">
                {numbersReconciled.matched} of {numbersReconciled.total}
              </span>
              {noNumbersYet ? (
                <span className="text-xs font-semibold text-subtle">· nothing drafted yet</span>
              ) : (
                <span className="text-xs font-semibold text-teal tabular">
                  ({numbersReconciled.percent}%)
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-subtle">
              {noNumbersYet
                ? "Numbers in drafted sentences are checked against their source tables."
                : `${numbersReconciled.matched} of ${numbersReconciled.total} numbers in drafted sentences match their source tables.`}
            </p>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-line/60 pt-3 text-[11px]">
            {noNumbersYet ? (
              <span className="flex items-center gap-1 font-medium text-subtle">
                <CircleDashed className="size-3" aria-hidden="true" />
                No numbers to check yet
              </span>
            ) : numbersReconciled.allMatched ? (
              <span className="flex items-center gap-1 font-medium text-teal">
                <CheckCircle2 className="size-3" aria-hidden="true" />
                100% table match
              </span>
            ) : (
              <span className="flex items-center gap-1 font-medium text-amber">
                <Clock className="size-3" aria-hidden="true" />
                {numbersReconciled.percent}% table match
              </span>
            )}
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
