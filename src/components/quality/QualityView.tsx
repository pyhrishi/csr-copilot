"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  ExternalLink,
  FileCheck2,
  GitCompare,
  Link as LinkIcon,
  Percent,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import { MatchStatus } from "@/components/trust";
import { Badge } from "@/components/ui/badge";
import { runCrossSectionConsistency } from "@/lib/consistency";
import { computeQualityMetrics } from "@/lib/mock/gold-set";
import type { AuditEvent, DraftSentence, Fact, Patient } from "@/lib/types";
import { useAuditStore, useDraftsStore } from "@/store";

interface QualityViewProps {
  facts: Fact[];
  patients: Patient[];
}

const EMPTY_SENTENCES: Record<string, DraftSentence> = {};

const SEVERITY_STYLES = {
  critical: {
    bg: "bg-critical-tint/60",
    text: "text-critical",
    border: "border-critical/30",
    barBg: "bg-critical",
  },
  major: {
    bg: "bg-amber-tint/60",
    text: "text-amber-dark",
    border: "border-amber/30",
    barBg: "bg-amber",
  },
  minor: {
    bg: "bg-teal-tint/60",
    text: "text-teal-dark",
    border: "border-teal/30",
    barBg: "bg-teal",
  },
};

const EMPTY_EVENTS: AuditEvent[] = [];

function getSectionHref(text: string): string | null {
  if (text.includes("12.3")) return "/sections/12.3";
  if (text.includes("10.1")) return "/sections/10.1";
  if (text.includes("14.3.3") || text.toLowerCase().includes("narrative")) return "/narratives";
  return null;
}

export function QualityView({ facts, patients }: QualityViewProps) {
  const auditEvents = useSyncExternalStore(
    useAuditStore.subscribe,
    () => useAuditStore.getState().events,
    () => EMPTY_EVENTS,
  );

  const draftSentencesMap = useSyncExternalStore(
    useDraftsStore.subscribe,
    () => useDraftsStore.getState().sentences,
    () => EMPTY_SENTENCES,
  );

  const draftSentences = useMemo(
    () => Object.values(draftSentencesMap),
    [draftSentencesMap],
  );

  // Compute 4 quality stat cards
  const { stats, taxonomy } = useMemo(
    () => computeQualityMetrics(draftSentences, auditEvents),
    [draftSentences, auditEvents],
  );

  // Cross-section consistency checks
  const consistencyChecks = useMemo(
    () => runCrossSectionConsistency(facts, patients),
    [facts, patients],
  );

  const maxErrorCount = useMemo(
    () => Math.max(...taxonomy.map((t) => t.count), 15),
    [taxonomy],
  );

  const allChecksMatched = consistencyChecks.every((c) => c.status === "matched");

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold font-serif text-ink tracking-tight">
              Quality & Consistency Assurance
            </h1>
            <Badge
              variant="outline"
              className="font-mono text-xs bg-paper-2 text-ink border-line"
            >
              Mock Gold-Set + Live Session
            </Badge>
          </div>
          <p className="text-sm text-subtle mt-1">
            Comprehensive statistical verification of numeric fidelity, citation precision, error
            taxonomies, and inter-section consistency.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-tint text-teal-dark border border-teal/30">
            <ShieldCheck className="h-3.5 w-3.5 text-teal" />
            Zero Generative Hallucinations Gate
          </span>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const isFidelity = stat.id === "numeric-fidelity";
          const isCitation = stat.id === "citation-precision";
          const isAcceptance = stat.id === "acceptance-rate";
          const isCritical = stat.id === "critical-caught";

          return (
            <div
              key={stat.id}
              className="p-5 rounded-xl bg-card border border-line shadow-xs flex flex-col justify-between space-y-3 relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-subtle uppercase tracking-wider block">
                    {stat.label}
                  </span>
                  <div className="text-2xl font-bold font-mono text-ink tabular tracking-tight">
                    {stat.value}
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-paper-2 border border-line text-teal shrink-0">
                  {isFidelity && <Database className="h-4 w-4" />}
                  {isCitation && <LinkIcon className="h-4 w-4" />}
                  {isAcceptance && <Percent className="h-4 w-4" />}
                  {isCritical && <ShieldAlert className="h-4 w-4" />}
                </div>
              </div>

              <div className="space-y-1.5 text-xs border-t border-line/60 pt-2.5">
                <p className="text-body leading-snug">{stat.subtext}</p>
                <div className="flex items-center justify-between text-[11px] text-muted font-mono">
                  <span>{stat.source === "live_session" ? "Source: Live Session" : "Source: Gold Set"}</span>
                  <span className="text-ok font-semibold">Verified</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cross-Section Consistency Check Table */}
      <div className="bg-card rounded-xl border border-line p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <GitCompare className="h-4 w-4 text-teal" />
            <h2 className="text-sm font-bold text-ink">
              Cross-Section Consistency Checks (ICH E3 Cross-Verification)
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {allChecksMatched ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ok bg-ok-tint/50 px-2.5 py-0.5 rounded-full border border-ok/30">
                <CheckCircle2 className="h-3.5 w-3.5 text-ok" />
                All 4 Inter-Section Checks Matched
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-critical bg-critical-tint/50 px-2.5 py-0.5 rounded-full border border-critical/30">
                <AlertTriangle className="h-3.5 w-3.5 text-critical" />
                Inter-Section Discrepancies Detected
              </span>
            )}
          </div>
        </div>

        <p className="text-xs text-subtle leading-relaxed">
          Automated cross-check comparing Section 12.3 safety mortality & serious adverse events
          against the Section 14.3.3 narratives queue, and auditing Section 10.1 disposition cohort
          balances.
        </p>

        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-paper-2 text-ink uppercase font-semibold text-[11px] border-b border-line">
              <tr>
                <th className="py-2.5 px-4">Inter-Section Metric</th>
                <th className="py-2.5 px-4">Primary Source (Section A)</th>
                <th className="py-2.5 px-4">Corroborating Source (Section B)</th>
                <th className="py-2.5 px-4">Consistency Finding</th>
                <th className="py-2.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-body">
              {consistencyChecks.map((row) => {
                const isMatched = row.status === "matched";
                const hrefA = getSectionHref(row.sourceA.section);
                const hrefB = getSectionHref(row.sourceB.section);

                return (
                  <tr key={row.id} className="hover:bg-paper/40 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-ink block">{row.metric}</span>
                      <span className="text-[10px] uppercase font-mono text-muted">{row.category}</span>
                    </td>

                    <td className="py-3 px-4 space-y-0.5">
                      {hrefA ? (
                        <Link
                          href={hrefA}
                          className="text-[11px] font-semibold text-teal hover:underline inline-flex items-center gap-1"
                        >
                          {row.sourceA.section}
                          <ExternalLink className="size-2.5 opacity-70" aria-hidden="true" />
                        </Link>
                      ) : (
                        <span className="text-[11px] font-semibold text-ink block">
                          {row.sourceA.section}
                        </span>
                      )}
                      <span className="text-xs font-mono text-teal block">{row.sourceA.value}</span>
                      <span className="text-[10px] text-muted">{row.sourceA.label}</span>
                    </td>

                    <td className="py-3 px-4 space-y-0.5">
                      {hrefB ? (
                        <Link
                          href={hrefB}
                          className="text-[11px] font-semibold text-teal hover:underline inline-flex items-center gap-1"
                        >
                          {row.sourceB.section}
                          <ExternalLink className="size-2.5 opacity-70" aria-hidden="true" />
                        </Link>
                      ) : (
                        <span className="text-[11px] font-semibold text-ink block">
                          {row.sourceB.section}
                        </span>
                      )}
                      <span className="text-xs font-mono text-teal block">{row.sourceB.value}</span>
                      <span className="text-[10px] text-muted">{row.sourceB.label}</span>
                    </td>

                    <td className="py-3 px-4 max-w-xs text-xs text-subtle leading-relaxed">
                      {row.detail}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <MatchStatus matched={isMatched} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Error Taxonomy Bar Chart */}
      <div className="bg-card rounded-xl border border-line p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <FileCheck2 className="h-4 w-4 text-teal" />
            <h2 className="text-sm font-bold text-ink">
              Error Taxonomy & Prevention Engine (Gold-Set Distribution)
            </h2>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-critical font-medium">
              <span className="w-2.5 h-2.5 rounded-xs bg-critical" /> Critical ({taxonomy.filter((t) => t.severity === "critical").reduce((a, b) => a + b.count, 0)})
            </span>
            <span className="flex items-center gap-1.5 text-amber-dark font-medium">
              <span className="w-2.5 h-2.5 rounded-xs bg-amber" /> Major ({taxonomy.filter((t) => t.severity === "major").reduce((a, b) => a + b.count, 0)})
            </span>
            <span className="flex items-center gap-1.5 text-teal-dark font-medium">
              <span className="w-2.5 h-2.5 rounded-xs bg-teal" /> Minor ({taxonomy.filter((t) => t.severity === "minor").reduce((a, b) => a + b.count, 0)})
            </span>
          </div>
        </div>

        <p className="text-xs text-subtle leading-relaxed">
          Distribution of pre-QC findings identified across 240 gold-set clinical sentences. In CSR Copilot,
          deterministic gates catch these defects in real time before statistical QC or medical writing sign-off.
        </p>

        {/* Visual Bar Breakdown */}
        <div className="space-y-4 pt-2">
          {taxonomy.map((item) => {
            const style = SEVERITY_STYLES[item.severity];
            const pct = Math.round((item.count / maxErrorCount) * 100);

            return (
              <div
                key={item.ruleId}
                className="p-3.5 rounded-lg bg-paper-2/50 border border-line space-y-2 hover:bg-paper-2 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-ink">{item.ruleId}</span>
                    <span className="font-semibold text-body">{item.ruleName}</span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.2 ${style.bg} ${style.text} ${style.border}`}
                    >
                      {item.severity}
                    </Badge>
                  </div>

                  <span className="font-mono font-bold text-ink">
                    {item.count} findings caught
                  </span>
                </div>

                {/* Bar representation */}
                <div className="w-full bg-paper rounded-full h-2 overflow-hidden border border-line">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${style.barBg}`}
                    style={{ width: `${Math.max(pct, 6)}%` }}
                    role="progressbar"
                    aria-label={`${item.ruleId}: ${item.count} findings caught`}
                    aria-valuenow={item.count}
                    aria-valuemin={0}
                    aria-valuemax={maxErrorCount}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted">
                  <span>Defect: {item.description}</span>
                  <span className="font-medium text-teal">Gate: {item.preventionMechanism}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
