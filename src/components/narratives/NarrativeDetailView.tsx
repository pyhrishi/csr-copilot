"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  FileCheck2,
  FileText,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { NarrativeTemplate } from "@/lib/data/seed-types";
import { assembleNarrative } from "@/lib/narratives";
import type { Patient } from "@/lib/types";
import { useNarrativesStore } from "@/store";
import { NarrativeProseView } from "./NarrativeProseView";
import { PatientSummaryCard } from "./PatientSummaryCard";
import { PatientTimelineSvg } from "./PatientTimelineSvg";
import { SafetyReviewBlock } from "./SafetyReviewBlock";

interface NarrativeDetailViewProps {
  patient: Patient;
  template: NarrativeTemplate;
  allPatients: Patient[];
}

export function NarrativeDetailView({
  patient,
  template,
  allPatients,
}: NarrativeDetailViewProps) {
  const [activeTimelineIndex, setActiveTimelineIndex] = useState<number | null>(null);
  const [activeField, setActiveField] = useState<string | null>(null);

  const drafts = useNarrativesStore((s) => s.drafts);
  const statuses = useNarrativesStore((s) => s.statuses);
  const generatePatientNarrative = useNarrativesStore((s) => s.generatePatientNarrative);

  const currentStatus =
    statuses[patient.id] ?? (patient.status === "exception" ? "exception" : "ready");

  const isException = patient.status === "exception";

  // Get or compute sentences
  const narrativeSentences = useMemo(() => {
    if (isException) return null;

    // Check store first
    if (drafts[patient.id]?.sentences) {
      return drafts[patient.id].sentences;
    }

    // Otherwise assemble deterministically
    const result = assembleNarrative(patient, template);
    if (result.ok) {
      return result.sentences;
    }
    return null;
  }, [patient, template, drafts, isException]);

  // Next and previous patient links
  const currentIndex = allPatients.findIndex((p) => p.id === patient.id);
  const prevPatient = currentIndex > 0 ? allPatients[currentIndex - 1] : null;
  const nextPatient =
    currentIndex >= 0 && currentIndex < allPatients.length - 1
      ? allPatients[currentIndex + 1]
      : null;

  const handleGenerateSingle = () => {
    generatePatientNarrative(patient, template);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/narratives"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal hover:text-teal-dark hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Narratives Queue
          </Link>
          <span className="text-muted text-xs">/</span>
          <span className="text-xs font-mono font-semibold text-ink">{patient.id}</span>
        </div>

        {/* Previous / Next Patient Stepper */}
        <div className="flex items-center gap-2">
          {prevPatient && (
            <Link href={`/narratives/${prevPatient.id}`}>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1 text-ink">
                <ChevronLeft className="h-3.5 w-3.5" />
                {prevPatient.id}
              </Button>
            </Link>
          )}
          {nextPatient && (
            <Link href={`/narratives/${nextPatient.id}`}>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1 text-ink">
                {nextPatient.id}
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Main Patient Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-card border border-line shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-serif text-ink tracking-tight">
              Patient Narrative · {patient.id}
            </h1>
            <Badge
              variant="outline"
              className={
                patient.arm === "velo"
                  ? "bg-teal-tint text-teal-dark border-teal/30 font-semibold"
                  : "bg-paper-2 text-ink border-line font-medium"
              }
            >
              {patient.armLabel}
            </Badge>
          </div>
          <p className="text-xs text-subtle mt-1">
            ICH E3 Section 14.3.3 · Patient Demographics, Clinical Course and Event Attribution
          </p>
        </div>

        {/* Live Status Pill */}
        <div className="flex items-center gap-2">
          {currentStatus === "ready" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-tint text-teal border border-teal/20">
              <Sparkles className="h-3.5 w-3.5" />
              Ready to Draft
            </span>
          )}
          {currentStatus === "drafted" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal text-white">
              <FileText className="h-3.5 w-3.5" />
              Drafted · Awaiting Review
            </span>
          )}
          {currentStatus === "reviewed" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-ok text-white">
              <FileCheck2 className="h-3.5 w-3.5" />
              ✓ Reviewed & Approved
            </span>
          )}
          {currentStatus === "returned" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber text-white">
              <AlertTriangle className="h-3.5 w-3.5" />
              Returned with Comment
            </span>
          )}
          {currentStatus === "exception" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-critical-tint text-critical border border-critical/30">
              <AlertTriangle className="h-3.5 w-3.5" />
              Data Exception Refusal
            </span>
          )}
        </div>
      </div>

      {/* 1. Patient Demographics Summary Card */}
      <PatientSummaryCard patient={patient} activeField={activeField} />

      {/* 2. Interactive Clinical Study-Day Timeline */}
      <PatientTimelineSvg
        timeline={patient.timeline}
        onsetDay={patient.onsetDay}
        resolvedDay={patient.resolvedDay}
        event={patient.event}
        activeTimelineIndex={activeTimelineIndex}
        onSelectEntry={(index) =>
          setActiveTimelineIndex(activeTimelineIndex === index ? null : index)
        }
      />

      {/* 3. Narrative Prose or Exception Refusal Notice */}
      {isException ? (
        <div className="bg-critical-tint/30 border border-critical/30 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 text-critical font-bold text-base">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span>GCP Regulatory Refusal · Narrative Assembly Blocked</span>
          </div>
          <p className="text-sm text-body leading-relaxed max-w-3xl">
            Under ICH E3 Section 14.3.3 and Good Clinical Practice (GCP) compliance standards, patient
            narratives cannot be generated over unverified or conflicting clinical source data.
            Drafting is halted to prevent false or inaccurate regulatory submissions.
          </p>
          <div className="p-4 rounded-lg bg-card border border-critical/20 text-xs space-y-2 max-w-2xl">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-ink">Identified Data Issue:</span>
              <span className="font-mono text-muted text-[11px]">
                Query Assigned to: <strong>Data management</strong>
              </span>
            </div>
            <p className="font-mono text-critical font-medium text-xs bg-critical-tint/50 p-2.5 rounded-md">
              &ldquo;{patient.dataIssue}&rdquo;
            </p>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <Link href="/narratives">
              <Button variant="outline" size="sm" className="text-xs">
                ← Return to Narratives Queue
              </Button>
            </Link>
          </div>
        </div>
      ) : narrativeSentences ? (
        <NarrativeProseView
          patient={patient}
          sentences={narrativeSentences}
          activeTimelineIndex={activeTimelineIndex}
          activeField={activeField}
          onSelectTimeline={setActiveTimelineIndex}
          onSelectField={setActiveField}
        />
      ) : (
        <div className="p-8 rounded-xl bg-card border border-line text-center space-y-3">
          <p className="text-sm text-muted">
            This narrative has not been drafted yet.
          </p>
          <Button
            size="sm"
            onClick={handleGenerateSingle}
            className="bg-teal hover:bg-teal-dark text-white text-xs gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Generate Narrative Draft
          </Button>
        </div>
      )}

      {/* 4. Safety Physician Review Block */}
      <SafetyReviewBlock patient={patient} />
    </div>
  );
}
