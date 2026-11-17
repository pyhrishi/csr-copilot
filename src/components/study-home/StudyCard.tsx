import { Calendar, CheckCircle2, Clock, FileSpreadsheet, Layers, ShieldCheck } from "lucide-react";

import type { SeedStudy } from "@/lib/data/seed-types";

interface StudyCardProps {
  study: SeedStudy;
}

export function StudyCard({ study }: StudyCardProps) {
  const milestones = [
    {
      key: "lplv",
      label: "Last Patient Last Visit",
      date: study.milestones.lastPatientLastVisit,
      formatted: "18 Sep 2026",
      status: "completed",
    },
    {
      key: "dbl",
      label: "Database Lock",
      date: study.milestones.databaseLock,
      formatted: "30 Oct 2026",
      status: "completed",
    },
    {
      key: "topline",
      label: "Topline Results",
      date: study.milestones.toplineResults,
      formatted: "27 Nov 2026",
      status: "upcoming",
    },
    {
      key: "csr",
      label: "CSR Target Final",
      date: study.milestones.csrTargetFinal,
      formatted: "22 Jan 2027",
      status: "target",
    },
  ];

  return (
    <div className="rounded-xl border border-line bg-card p-5 shadow-xs">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-ink px-2.5 py-1 text-xs font-bold text-teal-light tabular">
              {study.id}
            </span>
            <span className="text-xs font-semibold text-subtle tracking-wide">
              {study.shortName} · Phase {study.phase}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-teal-tint px-2.5 py-0.5 text-xs font-medium text-teal border border-teal/20">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              {study.status}
            </span>
          </div>

          <h2 className="font-heading text-2xl lg:text-3xl font-semibold leading-tight text-ink max-w-4xl">
            {study.title}
          </h2>

          <p className="text-sm text-subtle">
            Sponsor: <span className="text-body font-medium">{study.sponsor}</span> · Indication:{" "}
            <span className="text-body font-medium">{study.indication}</span>
          </p>
        </div>
      </div>

      {/* Study Parameters */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 border-t border-line/60 pt-3 text-xs">
        <div>
          <div className="label text-teal">Study Design</div>
          <div className="mt-0.5 text-body font-medium">{study.design}</div>
        </div>
        <div>
          <div className="label text-teal">Populations</div>
          <div className="mt-0.5 text-body font-medium">
            Randomized (N=600) · Safety (N=597)
          </div>
        </div>
        <div>
          <div className="label text-teal">CSR Template</div>
          <div className="mt-0.5 text-body font-medium flex items-center gap-1.5">
            <FileSpreadsheet className="size-3.5 text-teal shrink-0" aria-hidden="true" />
            <span>{study.template}</span>
          </div>
        </div>
        <div>
          <div className="label text-teal">Therapeutic Area Pack</div>
          <div className="mt-0.5 text-body font-medium flex items-center gap-1.5">
            <Layers className="size-3.5 text-teal shrink-0" aria-hidden="true" />
            <span>{study.therapeuticAreaPack}</span>
          </div>
        </div>
      </div>

      {/* Milestones Tracker */}
      <div className="mt-4 border-t border-line/60 pt-3">
        <div className="flex items-center justify-between mb-2">
          <div className="label text-teal flex items-center gap-1.5">
            <Calendar className="size-3.5" aria-hidden="true" />
            <span>Study Milestones</span>
          </div>
          <span className="text-xs text-subtle">
            Target CSR final submission: <strong className="text-ink tabular">22 Jan 2027</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {milestones.map((m) => {
            const isCompleted = m.status === "completed";
            const isTarget = m.status === "target";

            return (
              <div
                key={m.key}
                className={`rounded-lg border px-3 py-2 flex items-center gap-2.5 transition-colors ${
                  isCompleted
                    ? "border-teal/30 bg-teal-tint/40"
                    : isTarget
                      ? "border-line bg-paper-2/60"
                      : "border-line bg-card"
                }`}
              >
                <div className="shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="size-4 text-teal" aria-hidden="true" />
                  ) : (
                    <Clock className="size-4 text-subtle" aria-hidden="true" />
                  )}
                </div>
                <div className="min-w-0 flex-1 flex items-baseline justify-between gap-1">
                  <div className="text-xs font-semibold text-ink truncate">{m.label}</div>
                  <div className="text-xs font-bold tabular text-body whitespace-nowrap">
                    {m.formatted}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
