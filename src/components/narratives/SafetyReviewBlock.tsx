"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Lock,
  MessageSquare,
  RotateCcw,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { roleLabel, rolePersona } from "@/lib/roles";
import type { Patient } from "@/lib/types";
import { useAuditStore, useNarrativesStore, useRoleStore } from "@/store";

interface SafetyReviewBlockProps {
  patient: Patient;
  className?: string;
}

export function SafetyReviewBlock({ patient, className = "" }: SafetyReviewBlockProps) {
  const role = useRoleStore((s) => s.role);
  const setRole = useRoleStore((s) => s.setRole);
  const appendAudit = useAuditStore((s) => s.append);

  const status = useNarrativesStore((s) => s.statuses[patient.id]) ?? patient.status;
  const review = useNarrativesStore((s) => s.reviews[patient.id]);
  const setReview = useNarrativesStore((s) => s.setReview);
  const setStatus = useNarrativesStore((s) => s.setStatus);

  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [returnComment, setReturnComment] = useState("");

  const persona = rolePersona(role);
  const reviewerName = role === "writer" ? `${persona.name} (Safety Reviewer)` : persona.name;
  const isWriterRole = role === "writer";
  const isException = patient.status === "exception";

  const handleApprove = () => {
    const timestamp = new Date().toISOString();
    setReview(patient.id, {
      decision: "approved",
      reviewer: reviewerName,
      role,
      at: timestamp,
    });

    appendAudit({
      actor: reviewerName,
      role,
      action: "sign_off",
      objectId: patient.id,
      detail: `Safety physician sign-off approved for patient ${patient.id} (ICH E3 Section 14.3.3)`,
    });

    toast.success(`Narrative for ${patient.id} approved by Safety Reviewer`);
  };

  const handleConfirmReturn = () => {
    if (!returnComment.trim()) return;

    const timestamp = new Date().toISOString();
    const comment = returnComment.trim();

    setReview(patient.id, {
      decision: "returned",
      comment,
      reviewer: reviewerName,
      role,
      at: timestamp,
    });

    appendAudit({
      actor: reviewerName,
      role,
      action: "edit",
      objectId: patient.id,
      detail: `Safety review returned for patient ${patient.id}: "${comment}"`,
    });

    toast.info(`Narrative for ${patient.id} returned with comment`);
    setReturnDialogOpen(false);
    setReturnComment("");
  };

  const handleResetReview = () => {
    setStatus(patient.id, "drafted");
    toast.info(`Review state reset to Drafted for ${patient.id}`);
  };

  // If patient has an open data exception, review is blocked
  if (isException) {
    return (
      <div
        className={`bg-critical-tint/40 border border-critical/30 rounded-xl p-5 shadow-xs space-y-3 ${className}`}
      >
        <div className="flex items-center gap-2 text-critical font-bold text-sm">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>GCP Regulatory Safeguard · Review Blocked by Open Data Exception</span>
        </div>
        <p className="text-xs text-body leading-relaxed">
          In compliance with GCP and ICH E3 Section 14.3.3 guidelines, safety review and sign-off
          are refused while source data discrepancies exist. This narrative cannot be approved until
          Data Management resolves the query.
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-card border border-critical/20 text-xs">
          <div>
            <span className="text-subtle font-semibold">Data issue: </span>
            <span className="text-critical font-medium">{patient.dataIssue}</span>
          </div>
          <div className="text-subtle font-mono text-[11px]">
            Owner: <strong>Data management</strong>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-card rounded-xl border border-line p-5 shadow-xs space-y-4 ${className}`}>
      {/* Block Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-line">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-teal" />
          <h3 className="text-sm font-bold text-ink">
            Safety Physician Review (ICH E3 Section 14.3.3)
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-subtle">Reviewer Jurisdiction:</span>
          <span className="font-semibold text-ink">Medical Safety & Pharmacovigilance</span>
        </div>
      </div>

      {/* Reviewer Persona & Role Gate Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-paper-2/60 border border-line text-xs">
        <div className="flex items-center gap-2">
          <UserCheck className="h-4 w-4 text-teal shrink-0" />
          <span className="text-subtle">Active Reviewer:</span>
          <strong className="font-semibold text-ink">{reviewerName}</strong>
          <span className="text-subtle font-mono">({persona.title})</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-subtle">
          <span>Role: {roleLabel(role)}</span>
          {!isWriterRole && (
            <span className="text-critical flex items-center gap-1 font-sans">
              <Lock className="h-3 w-3" /> View only
            </span>
          )}
        </div>
      </div>

      {/* Non-Writer Role Gate Notice */}
      {!isWriterRole && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-amber-tint/60 border border-amber/30 text-xs text-amber-dark">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 shrink-0 text-amber" />
            <span>
              Safety review actions are role-gated to the <strong>Medical Writer / Safety Reviewer</strong> persona.
              You are currently viewing as <strong>{roleLabel(role)}</strong>.
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setRole("writer")}
            className="h-7 text-xs border-amber/40 bg-card hover:bg-amber-tint text-amber-dark font-medium"
          >
            Switch to Medical Writer
          </Button>
        </div>
      )}

      {/* Decision State Display */}
      {status === "reviewed" ? (
        <div className="p-4 rounded-lg bg-teal-tint/60 border border-teal/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-teal font-bold text-sm">
              <CheckCircle2 className="h-5 w-5 text-ok" />
              <span>Safety Physician Approved · Signed (prototype)</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetReview}
              className="h-7 text-xs text-subtle hover:text-ink gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              Re-open review
            </Button>
          </div>
          <p className="text-xs text-body leading-relaxed">
            I confirm the narrative text and clinical chronology accurately reflect the patient
            record and source data, following the ICH E3 Section 14.3.3 narrative structure.
          </p>
          <div className="flex flex-wrap items-center justify-between text-[11px] text-subtle pt-2 border-t border-teal/20 font-mono">
            <span>Signed by: {review?.reviewer ?? reviewerName}</span>
            <span>Recorded at: {review ? new Date(review.at).toLocaleString() : "Just now"}</span>
          </div>
        </div>
      ) : status === "returned" ? (
        <div className="p-4 rounded-lg bg-amber-tint/60 border border-amber/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber font-bold text-sm">
              <AlertTriangle className="h-5 w-5 text-amber" />
              <span>Returned with Safety Comments</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleApprove}
              disabled={!isWriterRole}
              className="h-7 text-xs border-amber/40 bg-card text-ink"
            >
              Approve Narrative
            </Button>
          </div>
          <div className="p-3 rounded-lg bg-card border border-amber/20 text-xs text-ink space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-subtle block">
              Reviewer Comment:
            </span>
            <p className="font-medium italic">
              &ldquo;{review?.comment ?? "Please review timeline sequence."}&rdquo;
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-between text-[11px] text-subtle pt-2 border-t border-amber/20 font-mono">
            <span>Returned by: {review?.reviewer ?? reviewerName}</span>
            <span>At: {review ? new Date(review.at).toLocaleString() : "Just now"}</span>
          </div>
        </div>
      ) : (
        /* Pending Review Actions */
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <p className="text-xs text-subtle max-w-md">
            Review the assembled clinical narrative and chronology against the patient record. Sign
            off to approve for regulatory submission, or return with comments.
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!isWriterRole}
              onClick={() => setReturnDialogOpen(true)}
              className="h-9 gap-1.5 text-xs text-ink"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Return with comment
            </Button>

            <Button
              size="sm"
              disabled={!isWriterRole}
              onClick={handleApprove}
              className="h-9 gap-1.5 text-xs bg-teal hover:bg-teal-dark text-white font-medium"
            >
              <CheckCircle2 className="h-4 w-4" />
              Approve Narrative
            </Button>
          </div>
        </div>
      )}

      {/* Return Dialog */}
      <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
        <DialogContent className="max-w-md bg-card text-ink border-line">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-ink flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-amber" />
              Return Narrative with Safety Comment
            </DialogTitle>
            <DialogDescription className="text-xs text-subtle">
              Specify the clinical observation, date discrepancy, or inquiry for the medical writing team.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 space-y-2">
            <label htmlFor="return-comment" className="text-xs font-semibold text-ink block">
              Safety Physician Note / Clarification Request:
            </label>
            <textarea
              id="return-comment"
              rows={4}
              value={returnComment}
              onChange={(e) => setReturnComment(e.target.value)}
              placeholder="e.g. Please clarify timing of IV fluid administration relative to hospital discharge on Day 22."
              className="w-full text-xs p-2.5 rounded-lg border border-line bg-paper focus:outline-teal focus:ring-1 focus:ring-teal"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReturnDialogOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!returnComment.trim()}
              onClick={handleConfirmReturn}
              className="text-xs bg-amber hover:bg-amber-dark text-white font-semibold"
            >
              Confirm Return
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
