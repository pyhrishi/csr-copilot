"use client";

import { User, AlertTriangle, Pill, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Patient } from "@/lib/types";

interface PatientSummaryCardProps {
  patient: Patient;
  activeField?: string | null;
  className?: string;
}

export function PatientSummaryCard({
  patient,
  activeField,
  className = "",
}: PatientSummaryCardProps) {
  const isDeath = patient.outcome === "Fatal" || patient.seriousness === "Death";

  const fieldHighlight = (field: string) =>
    activeField === field
      ? "bg-teal-tint ring-2 ring-teal font-semibold text-teal-dark"
      : "bg-paper/80 border-line/60";

  return (
    <div className={`bg-card rounded-xl border border-line p-5 shadow-xs space-y-4 ${className}`}>
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-line">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-teal-tint flex items-center justify-center text-teal font-bold border border-teal/20">
            <User className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold font-serif text-ink tracking-tight">
                {patient.id}
              </h2>
              <Badge
                variant="outline"
                className={
                  patient.arm === "velo"
                    ? "bg-teal-tint/60 text-teal border-teal/30 font-semibold"
                    : "bg-paper-2 text-ink border-line font-medium"
                }
              >
                {patient.armLabel}
              </Badge>
              {isDeath ? (
                <Badge className="bg-critical text-white font-semibold">
                  Fatal Outcome
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-amber-tint text-amber border-amber/30">
                  {patient.seriousness}
                </Badge>
              )}
            </div>
            <p className="text-xs text-subtle mt-0.5">
              Subject Profile · Protocol CRD-301 · {patient.site}
            </p>
          </div>
        </div>

        {patient.dataIssue && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-critical-tint border border-critical/20 text-critical text-xs">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>
              <strong>Open Exception:</strong> {patient.dataIssue}
            </span>
          </div>
        )}
      </div>

      {/* Demographics & Event Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <div className={`p-2.5 rounded-lg border transition-all ${fieldHighlight("age")}`}>
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted block">
            Age & Sex
          </span>
          <span className="text-sm font-semibold text-ink tabular">
            {patient.age} yrs · {patient.sex === "M" ? "Male" : "Female"}
          </span>
        </div>

        <div className={`p-2.5 rounded-lg border transition-all ${fieldHighlight("event")}`}>
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted block">
            Adverse Event (PT)
          </span>
          <span className="text-sm font-semibold text-critical truncate block" title={patient.event}>
            {patient.event}
          </span>
        </div>

        <div className={`p-2.5 rounded-lg border transition-all ${fieldHighlight("severity")}`}>
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted block">
            Severity
          </span>
          <span className="text-sm font-semibold text-ink">
            {patient.severity}
          </span>
        </div>

        <div className={`p-2.5 rounded-lg border transition-all ${fieldHighlight("onsetDay")}`}>
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted block">
            Onset / Resolution
          </span>
          <span className="text-sm font-semibold text-ink tabular">
            Day {patient.onsetDay} → {patient.resolvedDay ? `Day ${patient.resolvedDay}` : isDeath ? "Fatal" : "Ongoing"}
          </span>
        </div>

        <div className={`p-2.5 rounded-lg border transition-all ${fieldHighlight("outcome")}`}>
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted block">
            Reported Outcome
          </span>
          <span className={`text-sm font-semibold ${isDeath ? "text-critical" : "text-ink"}`}>
            {patient.outcome}
          </span>
        </div>

        <div className={`p-2.5 rounded-lg border transition-all ${fieldHighlight("action")}`}>
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted block">
            Drug Action Taken
          </span>
          <span className="text-sm font-semibold text-ink truncate block" title={patient.action}>
            {patient.action}
          </span>
        </div>
      </div>

      {/* Causality Assessment Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg bg-paper-2 border border-line text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-teal shrink-0" />
          <span className="text-subtle">Investigator Causality Assessment:</span>
          <strong className="font-semibold text-ink">{patient.related} to study drug</strong>
        </div>
        <div className="flex items-center gap-2">
          <Pill className="h-4 w-4 text-muted shrink-0" />
          <span className="text-subtle">Dose Cohort:</span>
          <span className="font-mono text-ink font-semibold">{patient.armLabel}</span>
        </div>
      </div>
    </div>
  );
}
