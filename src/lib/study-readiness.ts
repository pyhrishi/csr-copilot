import { reconcileSection } from "@/lib/reconcile";
import type { DraftSentence, Fact, Patient, Section, Tlf } from "@/lib/types";

export interface ReadinessMetrics {
  inputsParsed: { count: number; total: number; percent: number };
  openExceptions: { count: number; items: Patient[] };
  sentencesAwaitingReview: {
    pendingCount: number;
    draftedCount: number;
    totalTemplateCount: number;
  };
  numbersReconciled: {
    matched: number;
    total: number;
    percent: number;
    allMatched: boolean;
  };
}

/**
 * Computes the 4 readiness metrics strictly from seed data and runtime drafts state.
 * Never hard-coded.
 */
export function computeReadinessMetrics({
  totalInputs,
  parsedInputs,
  patients,
  sections,
  facts,
  tlfs,
  draftSentences,
}: {
  totalInputs: number;
  parsedInputs: number;
  patients: readonly Patient[];
  sections: readonly Section[];
  facts: readonly Fact[];
  tlfs: readonly Tlf[];
  draftSentences: Record<string, DraftSentence>;
}): ReadinessMetrics {
  // 1. Inputs parsed
  const inputsParsed = {
    count: parsedInputs,
    total: totalInputs,
    percent: totalInputs > 0 ? Math.round((parsedInputs * 100) / totalInputs) : 0,
  };

  // 2. Open exceptions (patients with status === "exception")
  const exceptionPatients = patients.filter((p) => p.status === "exception");
  const openExceptions = {
    count: exceptionPatients.length,
    items: exceptionPatients,
  };

  // 3. Sentences awaiting review
  const allTemplateSentences = sections.flatMap((s) => s.sentences);
  const totalTemplateCount = allTemplateSentences.length;

  const draftedEntries = Object.values(draftSentences);
  const draftedCount = draftedEntries.length;
  const pendingCount = draftedEntries.filter((s) => s.state === "pending").length;

  const sentencesAwaitingReview = {
    pendingCount,
    draftedCount,
    totalTemplateCount,
  };

  // 4. Numbers reconciled (via reconcileSection)
  let totalNumbers = 0;
  let matchedNumbers = 0;

  const renderedMap: Record<string, DraftSentence["rendered"]> = {};
  for (const [id, s] of Object.entries(draftSentences)) {
    if (s.rendered) renderedMap[id] = s.rendered;
  }

  for (const section of sections) {
    if (section.sentences.length === 0) continue;
    try {
      const report = reconcileSection(section.id, facts, tlfs, {
        sections,
        rendered: Object.keys(renderedMap).length > 0 ? renderedMap : undefined,
      });
      totalNumbers += report.summary.total;
      matchedNumbers += report.summary.matched;
    } catch {
      // Ignore sections that cannot be reconciled
    }
  }

  const numbersPercent =
    totalNumbers > 0 ? Math.floor((matchedNumbers * 100) / totalNumbers) : 0;

  const numbersReconciled = {
    matched: matchedNumbers,
    total: totalNumbers,
    percent: numbersPercent,
    allMatched: totalNumbers > 0 && matchedNumbers === totalNumbers,
  };

  return {
    inputsParsed,
    openExceptions,
    sentencesAwaitingReview,
    numbersReconciled,
  };
}

/** Section status computed from draft sentences. */
export type SectionDraftStatus = "not_started" | "drafted" | "in_review" | "signed_off";

export function computeSectionStatus(
  section: Section,
  draftSentences: Record<string, DraftSentence>,
): {
  status: SectionDraftStatus;
  label: string;
  draftedCount: number;
  totalCount: number;
  percent: number;
} {
  const totalCount = section.sentences.length;
  if (totalCount === 0) {
    return {
      status: "not_started",
      label: section.release === "R2" ? "Locked (R2)" : "Human Authoring",
      draftedCount: 0,
      totalCount: 0,
      percent: 0,
    };
  }

  const sectionDrafts = section.sentences
    .map((s) => draftSentences[s.id])
    .filter(Boolean) as DraftSentence[];

  const draftedCount = sectionDrafts.length;
  const percent = totalCount > 0 ? Math.round((draftedCount * 100) / totalCount) : 0;

  if (draftedCount === 0) {
    return { status: "not_started", label: "Not started", draftedCount, totalCount, percent: 0 };
  }

  const allAccepted = draftedCount === totalCount && sectionDrafts.every((s) => s.state === "accepted");
  if (allAccepted) {
    return { status: "signed_off", label: "Signed off", draftedCount, totalCount, percent: 100 };
  }

  const anyPendingOrRejected = sectionDrafts.some((s) => s.state === "pending" || s.state === "rejected");
  if (anyPendingOrRejected) {
    return { status: "in_review", label: "In review", draftedCount, totalCount, percent };
  }

  return { status: "drafted", label: "Drafted", draftedCount, totalCount, percent };
}
