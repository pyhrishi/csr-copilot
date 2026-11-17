"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertOctagon,
  CheckCircle2,
  Clock,
  Send,
  Table2,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { DraftSentence, Finding } from "@/lib/types";

interface SectionStatusBarProps {
  sectionId: string;
  sentences: readonly DraftSentence[];
  findings: readonly Finding[];
  onSendToReview: () => void;
  status: "not_started" | "drafted" | "in_review" | "signed_off";
  isSubmittedToReview?: boolean;
}

export function SectionStatusBar({
  sectionId,
  sentences,
  findings,
  onSendToReview,
  isSubmittedToReview = false,
}: SectionStatusBarProps) {
  const acceptedCount = sentences.filter((s) => s.state === "accepted").length;
  const pendingCount = sentences.filter((s) => s.state === "pending").length;
  const rejectedCount = sentences.filter((s) => s.state === "rejected").length;

  const criticalFindings = findings.filter((f) => f.severity === "critical");
  const hasCritical = criticalFindings.length > 0;
  const hasDraft = sentences.length > 0;

  let disabledReason: string | null = null;
  if (!hasDraft) {
    disabledReason = "Generate draft before sending to review";
  } else if (hasCritical) {
    disabledReason = `Blocked: ${criticalFindings.length} critical finding${criticalFindings.length > 1 ? "s" : ""} must be resolved`;
  } else if (isSubmittedToReview) {
    disabledReason = "Section is already In Review";
  }

  return (
    <TooltipProvider>
      <div className="h-14 border-t border-line bg-card px-6 flex items-center justify-between shrink-0 shadow-xs z-10">
        {/* Left: Sentence & Finding counts */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <span className="text-[11px] font-bold uppercase tracking-wider text-teal">
            Section {sectionId} Status
          </span>

          <span className="h-4 w-px bg-line" aria-hidden="true" />

          {/* Counts */}
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-ink tabular" title="Accepted sentences">
              <CheckCircle2 className="size-3.5 text-teal" aria-hidden="true" />
              <span>{acceptedCount} accepted</span>
            </span>

            <span className="inline-flex items-center gap-1.5 text-subtle tabular" title="Pending sentences">
              <Clock className="size-3.5 text-muted" aria-hidden="true" />
              <span>{pendingCount} pending</span>
            </span>

            {rejectedCount > 0 && (
              <span className="inline-flex items-center gap-1.5 text-critical tabular" title="Rejected sentences">
                <XCircle className="size-3.5 text-critical" aria-hidden="true" />
                <span>{rejectedCount} rejected</span>
              </span>
            )}

            <span className="h-4 w-px bg-line" aria-hidden="true" />

            {/* Findings status */}
            {hasCritical ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-critical text-white tabular">
                <AlertOctagon className="size-3.5" aria-hidden="true" />
                <span>{criticalFindings.length} critical</span>
              </span>
            ) : findings.length > 0 ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-tint text-amber border border-amber/30 tabular">
                <span>{findings.length} findings</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal tabular">
                <CheckCircle2 className="size-3.5" aria-hidden="true" />
                <span>0 open findings</span>
              </span>
            )}
          </div>
        </div>

        {/* Right: Send to Review button with disabled reason tooltip */}
        <div className="flex items-center gap-3">
          {hasCritical ? (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-critical-tint border border-critical/30 text-critical text-[11px] font-semibold">
              <AlertOctagon className="size-3.5 shrink-0" aria-hidden="true" />
              <span>Regulatory Gate: {criticalFindings.length} critical finding{criticalFindings.length > 1 ? "s" : ""} block submission</span>
            </div>
          ) : hasDraft && !isSubmittedToReview ? (
            <span className="hidden sm:inline text-[11px] text-teal font-medium flex items-center gap-1">
              <CheckCircle2 className="size-3 text-teal" aria-hidden="true" />
              <span>Ready for Biostatistician review</span>
            </span>
          ) : disabledReason ? (
            <span className="text-[11px] text-muted italic max-w-xs truncate hidden sm:inline" title={disabledReason}>
              {disabledReason}
            </span>
          ) : null}

          <Link
            href={`/sections/${sectionId}/reconciliation`}
            className="inline-flex items-center justify-center rounded-md border border-line bg-card hover:bg-paper-2 text-ink text-xs font-medium h-8 px-3 transition-colors shadow-2xs"
          >
            <Table2 className="size-3.5 mr-1.5 text-teal" aria-hidden="true" />
            <span>Reconciliation</span>
          </Link>

          {disabledReason ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    disabled
                    aria-disabled="true"
                    className="inline-flex items-center justify-center rounded-md border border-line bg-paper-2 text-muted text-xs font-semibold h-8 px-3 opacity-60 cursor-not-allowed"
                  />
                }
              >
                <Send className="size-3.5 mr-1.5" aria-hidden="true" />
                <span>Send to review</span>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs bg-ink text-paper border-ink">
                {disabledReason}
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              onClick={onSendToReview}
              size="sm"
              className="bg-teal hover:bg-teal/90 text-white text-xs font-semibold h-8 px-4 shadow-xs"
            >
              <Send className="size-3.5 mr-1.5" aria-hidden="true" />
              <span>Send to review</span>
            </Button>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
