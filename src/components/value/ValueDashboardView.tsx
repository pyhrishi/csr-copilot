"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Lightbulb,
  TrendingUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

export interface ValueKpi {
  id: string;
  label: string;
  baseline: string;
  baselineNum: number;
  current: string;
  currentNum: number;
  unit: string;
  delta: string;
  deltaType: "reduction" | "increase";
  description: string;
  benchmarkContext: string;
}

export const VALUE_KPIS: ValueKpi[] = [
  {
    id: "dbl-to-draft",
    label: "Days from Database Lock to CSR Draft",
    baseline: "42 days",
    baselineNum: 42,
    current: "3.5 days",
    currentNum: 3.5,
    unit: "Days",
    delta: "−91.7%",
    deltaType: "reduction",
    description: "Time from final locked tables to complete first-pass CSR safety & narratives draft.",
    benchmarkContext: "Traditional manual drafting requires 6 weeks; automated slot pipeline completes in days.",
  },
  {
    id: "writer-hours",
    label: "Medical Writer Hours (Release 1 Sections)",
    baseline: "110 hrs",
    baselineNum: 110,
    current: "14 hrs",
    currentNum: 14,
    unit: "Hours",
    delta: "−87.3%",
    deltaType: "reduction",
    description: "Writer time spent drafting Section 10, Section 12, and 12 patient narratives.",
    benchmarkContext: "Eliminates repetitive number transcription; shifts writer effort to scientific review.",
  },
  {
    id: "acceptance-rate",
    label: "Sentence Acceptance Rate",
    baseline: "45%",
    baselineNum: 45,
    current: "88%",
    currentNum: 88,
    unit: "%",
    delta: "+43%",
    deltaType: "increase",
    description: "Proportion of AI-generated sentences accepted without structural rewriting.",
    benchmarkContext: "Deterministic slots and domain templates achieve high first-pass consensus.",
  },
  {
    id: "errors-intercepted",
    label: "Critical Errors Caught Pre-QC",
    baseline: "18%",
    baselineNum: 18,
    current: "100%",
    currentNum: 100,
    unit: "%",
    delta: "+82%",
    deltaType: "increase",
    description: "Percentage of statistical phrasing and numeric discrepancies caught before formal Biostat QC.",
    benchmarkContext: "Pre-submission gate prevents ungrounded numerals and unsupported 'significantly' claims.",
  },
];

export function ValueDashboardView() {
  return (
    <div className="px-6 py-8 md:px-8 md:py-10 space-y-8 pb-16 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold font-serif text-ink tracking-tight">
              Clinical Authoring Value & Impact Dashboard
            </h1>
            <Badge
              variant="outline"
              className="font-mono text-xs bg-amber-tint text-amber-dark border-amber/40 font-semibold px-2.5 py-0.5"
            >
              Simulated values for the prototype
            </Badge>
          </div>
          <p className="text-sm text-subtle mt-1">
            Quantifiable time savings, review velocity, and defect prevention across Phase III CSR
            authoring pipelines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-tint text-teal-dark border border-teal/30">
            <TrendingUp className="h-3.5 w-3.5 text-teal" />
            Projected 91% Critical Path Acceleration
          </span>
        </div>
      </div>

      {/* 4 Core Value Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {VALUE_KPIS.map((kpi) => {
          const isReduction = kpi.deltaType === "reduction";

          return (
            <div
              key={kpi.id}
              className="p-5 rounded-xl bg-card border border-line shadow-xs flex flex-col justify-between space-y-4 relative overflow-hidden"
            >
              <div className="space-y-1">
                <span className="text-xs font-semibold text-subtle uppercase tracking-wider block">
                  {kpi.label}
                </span>

                <div className="flex items-baseline justify-between pt-1">
                  <div className="text-2xl font-bold font-mono text-ink tabular tracking-tight">
                    {kpi.current}
                  </div>

                  <span
                    className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-xs font-bold font-mono ${
                      isReduction
                        ? "bg-teal-tint text-teal-dark border border-teal/30"
                        : "bg-ok-tint text-ok-dark border border-ok/30"
                    }`}
                  >
                    {isReduction ? (
                      <ArrowDownRight className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    )}
                    {kpi.delta}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs border-t border-line/60 pt-3">
                <div className="flex items-center justify-between text-[11px] font-mono text-muted">
                  <span>Traditional Baseline:</span>
                  <span className="line-through font-semibold text-body">
                    {kpi.baseline}
                  </span>
                </div>

                <p className="text-body leading-snug">{kpi.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Chart: Baseline vs CSR Copilot Comparison */}
      <div className="bg-card rounded-xl border border-line p-6 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-teal" />
            <h2 className="text-sm font-bold text-ink">
              Benchmark Comparison: Traditional Workflow vs CSR Copilot
            </h2>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-muted">
              <span className="w-3 h-3 rounded-xs bg-slate-300 border border-slate-400" />
              <span>Traditional Baseline</span>
            </div>
            <div className="flex items-center gap-1.5 text-teal-dark">
              <span className="w-3 h-3 rounded-xs bg-teal border border-teal-dark" />
              <span>CSR Copilot Pipeline</span>
            </div>
          </div>
        </div>

        {/* Comparison Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Chart 1: Time & Hours Savings */}
          <div className="p-4 rounded-xl bg-paper-2/40 border border-line space-y-4">
            <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
              Drafting Duration & Medical Writer Hours
            </h3>

            {/* DBL to Draft */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span>Database Lock to Draft (Days)</span>
                <span className="text-teal font-mono">38.5 Days Saved (−91.7%)</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[11px] font-mono">
                  <span className="w-16 text-muted">Baseline:</span>
                  <div className="flex-1 bg-paper rounded h-4 overflow-hidden border border-line flex items-center">
                    <div className="bg-slate-300 h-full rounded w-full flex items-center justify-end px-2 text-[10px] text-slate-700 font-bold">
                      42 days
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono">
                  <span className="w-16 text-teal font-semibold">Copilot:</span>
                  <div className="flex-1 bg-paper rounded h-4 overflow-hidden border border-line flex items-center">
                    <div
                      className="bg-teal h-full rounded flex items-center justify-end px-2 text-[10px] text-white font-bold"
                      style={{ width: "8.3%" }}
                    >
                      3.5d
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Writer Hours */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-semibold">
                <span>Writer Hours on R1 Sections</span>
                <span className="text-teal font-mono">96 Hours Saved (−87.3%)</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[11px] font-mono">
                  <span className="w-16 text-muted">Baseline:</span>
                  <div className="flex-1 bg-paper rounded h-4 overflow-hidden border border-line flex items-center">
                    <div className="bg-slate-300 h-full rounded w-full flex items-center justify-end px-2 text-[10px] text-slate-700 font-bold">
                      110 hours
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono">
                  <span className="w-16 text-teal font-semibold">Copilot:</span>
                  <div className="flex-1 bg-paper rounded h-4 overflow-hidden border border-line flex items-center">
                    <div
                      className="bg-teal h-full rounded flex items-center justify-end px-2 text-[10px] text-white font-bold"
                      style={{ width: "12.7%" }}
                    >
                      14h
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chart 2: Quality & Defect Prevention */}
          <div className="p-4 rounded-xl bg-paper-2/40 border border-line space-y-4">
            <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
              Draft Acceptance & Defect Prevention
            </h3>

            {/* Acceptance Rate */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span>First-Pass Sentence Acceptance</span>
                <span className="text-teal font-mono">+43% First-Pass Consensus</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[11px] font-mono">
                  <span className="w-16 text-muted">Baseline:</span>
                  <div className="flex-1 bg-paper rounded h-4 overflow-hidden border border-line flex items-center">
                    <div
                      className="bg-slate-300 h-full rounded flex items-center justify-end px-2 text-[10px] text-slate-700 font-bold"
                      style={{ width: "45%" }}
                    >
                      45%
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono">
                  <span className="w-16 text-teal font-semibold">Copilot:</span>
                  <div className="flex-1 bg-paper rounded h-4 overflow-hidden border border-line flex items-center">
                    <div
                      className="bg-teal h-full rounded flex items-center justify-end px-2 text-[10px] text-white font-bold"
                      style={{ width: "88%" }}
                    >
                      88%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Interception */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-semibold">
                <span>Critical Pre-QC Error Interception</span>
                <span className="text-teal font-mono">100% Intercepted (Zero Escape)</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[11px] font-mono">
                  <span className="w-16 text-muted">Baseline:</span>
                  <div className="flex-1 bg-paper rounded h-4 overflow-hidden border border-line flex items-center">
                    <div
                      className="bg-slate-300 h-full rounded flex items-center justify-end px-2 text-[10px] text-slate-700 font-bold"
                      style={{ width: "18%" }}
                    >
                      18%
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono">
                  <span className="w-16 text-teal font-semibold">Copilot:</span>
                  <div className="flex-1 bg-paper rounded h-4 overflow-hidden border border-line flex items-center">
                    <div
                      className="bg-teal h-full rounded flex items-center justify-end px-2 text-[10px] text-white font-bold"
                      style={{ width: "100%" }}
                    >
                      100%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Executive Sponsor Summary Callout */}
        <div className="p-4 rounded-xl bg-card border border-line flex items-start gap-3 text-xs leading-relaxed">
          <Lightbulb className="h-5 w-5 text-teal shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-ink text-sm block">
              Executive Sponsor Pilot Assumptions (Gate G1 Evaluation)
            </span>
            <p className="text-subtle">
              In production pilot engagements, baseline metrics are measured directly from the
              sponsor&apos;s two most recently completed Phase III CSR packages. Savings of 38.5 days on
              the post-lock critical path represent an estimated $1.2M in avoided study extension
              costs and earlier regulatory dossier submission (FDA NDA / EMA MAA).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
