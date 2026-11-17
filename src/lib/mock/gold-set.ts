// Mock Gold-Set Evaluation & Quality Analytics
// Labeled clearly as benchmark gold-set data for the prototype evaluation.

import type { AuditEvent, DraftSentence } from "@/lib/types";

export interface QualityStat {
  id: string;
  label: string;
  value: string;
  subtext: string;
  benchmark: string;
  status: "exceptional" | "pass" | "attention";
  source: "live_session" | "gold_set";
}

export interface ErrorTaxonomyItem {
  ruleId: string;
  ruleName: string;
  severity: "critical" | "major" | "minor";
  count: number;
  description: string;
  preventionMechanism: string;
}

export interface GoldSetSummary {
  evaluatedStudies: number;
  totalSentences: number;
  totalClinicalNumbers: number;
  numericFidelityPct: number;
  citationPrecisionPct: number;
  acceptanceRatePct: number;
  criticalErrorsCaught: number;
  errorTaxonomy: ErrorTaxonomyItem[];
}

export const MOCK_GOLD_SET_DATA: GoldSetSummary = {
  evaluatedStudies: 5,
  totalSentences: 240,
  totalClinicalNumbers: 1420,
  numericFidelityPct: 100.0,
  citationPrecisionPct: 100.0,
  acceptanceRatePct: 88.5,
  criticalErrorsCaught: 14,
  errorTaxonomy: [
    {
      ruleId: "NUM-001",
      ruleName: "Unverified Raw Numeral",
      severity: "critical",
      count: 6,
      description: "Direct typed numeral not backed by deterministic clinical fact slot.",
      preventionMechanism: "Deterministic slot binding & numeral regex gate.",
    },
    {
      ruleId: "STAT-001",
      ruleName: "Unsupported Significance Claim",
      severity: "critical",
      count: 8,
      description: "Text states 'significantly' without formal inferential hypothesis test / p-value.",
      preventionMechanism: "Statistical rule engine & dictionary validation.",
    },
    {
      ruleId: "CITE-001",
      ruleName: "Missing Source TLF Citation",
      severity: "major",
      count: 11,
      description: "Sentence contains clinical figures lacking bibliographic table reference.",
      preventionMechanism: "Citation validator & ICH E3 cross-reference map.",
    },
    {
      ruleId: "STAT-002",
      ruleName: "Denominator Rounding Discrepancy",
      severity: "major",
      count: 7,
      description: "Rendered percentage deviates from row/column total by >0.1%.",
      preventionMechanism: "Biostatistical floating point rounding rules.",
    },
    {
      ruleId: "STAT-003",
      ruleName: "Missing Confidence Interval Bounds",
      severity: "minor",
      count: 15,
      description: "Treatment effect estimate presented without 95% CI bounds.",
      preventionMechanism: "SAP estimand completeness template checks.",
    },
    {
      ruleId: "CITE-002",
      ruleName: "Citation Format Inconsistency",
      severity: "minor",
      count: 9,
      description: "Non-standard citation bracket formatting.",
      preventionMechanism: "Style guide regex linter.",
    },
  ],
};

/**
 * Computes live session quality metrics combined with gold-set reference benchmarks.
 */
export function computeQualityMetrics(
  liveSentences: readonly DraftSentence[] = [],
  auditEvents: readonly AuditEvent[] = [],
): { stats: QualityStat[]; taxonomy: ErrorTaxonomyItem[] } {
  const hasLive = liveSentences.length > 0;

  // 1. Sentence Acceptance Rate
  let acceptanceRate = MOCK_GOLD_SET_DATA.acceptanceRatePct;
  let acceptanceSource: "live_session" | "gold_set" = "gold_set";
  let acceptanceSubtext = "212 of 240 gold-set sentences accepted on first pass";

  if (hasLive) {
    const accepted = liveSentences.filter((s) => s.state === "accepted").length;
    const total = liveSentences.length;
    const livePct = Math.round((accepted / total) * 100);
    acceptanceRate = livePct;
    acceptanceSource = "live_session";
    acceptanceSubtext = `${accepted} of ${total} session sentences accepted (${livePct}%)`;
  }

  // 2. Critical findings caught before QC
  // Count open/cleared critical findings in session
  const sessionCriticalFindings = liveSentences.flatMap((s) =>
    s.findings.filter((f) => f.severity === "critical"),
  ).length;

  const resolvedCriticalEvents = auditEvents.filter(
    (e) => e.detail.includes("STAT-001") || e.detail.includes("NUM-001"),
  ).length;

  const totalCriticalCaught = sessionCriticalFindings + resolvedCriticalEvents;
  const criticalCountDisplay = totalCriticalCaught > 0
    ? `${totalCriticalCaught} in session (${MOCK_GOLD_SET_DATA.criticalErrorsCaught} in gold set)`
    : `${MOCK_GOLD_SET_DATA.criticalErrorsCaught}`;

  const stats: QualityStat[] = [
    {
      id: "numeric-fidelity",
      label: "Numeric Fidelity",
      value: "100%",
      subtext: "0 hallucinations across 1,420 clinical values (slots)",
      benchmark: "Target: 100% · numbers come only from deterministic slots",
      status: "exceptional",
      source: "gold_set",
    },
    {
      id: "citation-precision",
      label: "Citation Precision",
      value: "100%",
      subtext: "All numbers linked to source TLF table and cell coordinates",
      benchmark: "Target: 100% · Traceable to CSR source appendices",
      status: "exceptional",
      source: "gold_set",
    },
    {
      id: "acceptance-rate",
      label: "Sentence Acceptance Rate",
      value: `${acceptanceRate}%`,
      subtext: acceptanceSubtext,
      benchmark: "Target: ≥85% first-pass medical writer acceptance",
      status: acceptanceRate >= 85 ? "pass" : "attention",
      source: acceptanceSource,
    },
    {
      id: "critical-caught",
      label: "Critical Findings Caught Pre-QC",
      value: criticalCountDisplay,
      subtext: "Intercepted by real-time rules engine prior to biostat sign-off",
      benchmark: "Target: 100% critical language & numeric errors caught",
      status: "pass",
      source: totalCriticalCaught > 0 ? "live_session" : "gold_set",
    },
  ];

  return {
    stats,
    taxonomy: MOCK_GOLD_SET_DATA.errorTaxonomy,
  };
}
