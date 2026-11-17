"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Lock,
  PenLine,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { roleLabel, rolePersona } from "@/lib/roles";
import type { AuditEvent, Finding, Role, Section } from "@/lib/types";
import type { ReconciliationSummary } from "@/lib/reconcile";

export interface SignOffBlockProps {
  section: Section;
  role: Role;
  criticalFindings: readonly Finding[];
  summary: ReconciliationSummary;
  isSignedOff: boolean;
  onSignOff: () => void;
  lastSignOffEvent?: AuditEvent;
}

export function SignOffBlock({
  section,
  role,
  criticalFindings,
  summary,
  isSignedOff,
  onSignOff,
  lastSignOffEvent,
}: SignOffBlockProps) {
  const persona = rolePersona(role);
  const currentRoleLabel = roleLabel(role);

  const isBiostat = role === "biostat";
  const hasCritical = criticalFindings.length > 0;
  const hasMismatches = summary.mismatched > 0;
  const hasNumbers = summary.total > 0;

  // Compute disabled reason (if any)
  let disabledReason: string | null = null;
  if (!isBiostat) {
    disabledReason = `Role-gated: Sign-off requires the Biostatistician role. You are currently viewing as ${currentRoleLabel}.`;
  } else if (hasCritical) {
    const rules = criticalFindings.map((f) => f.ruleId).join(", ");
    disabledReason = `Compliance Gate: Blocked by ${criticalFindings.length} open critical finding (${rules}). Open critical findings must be resolved before statistical sign-off.`;
  } else if (hasMismatches) {
    disabledReason = `Reconciliation Gate: Blocked by ${summary.mismatched} mismatched number(s). All numbers must match source TLFs.`;
  } else if (!hasNumbers) {
    disabledReason = "Reconciliation Gate: This section has no numbers to reconcile.";
  }

  const isEnabled = !disabledReason && !isSignedOff;

  // Format timestamp for display
  const displayTimestamp = isSignedOff && lastSignOffEvent
    ? new Date(lastSignOffEvent.at).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      })
    : isSignedOff
      ? "Signed off"
      : "Recorded upon signature";

  const signerName = isSignedOff && lastSignOffEvent
    ? lastSignOffEvent.actor
    : persona.name;

  return (
    <TooltipProvider>
      <section
        aria-labelledby="signoff-heading"
        className={`rounded-lg border p-6 transition-all shadow-xs ${
          isSignedOff
            ? "border-teal/40 bg-teal-tint/20 ring-1 ring-teal/30"
            : !isEnabled
              ? "border-line bg-card/80"
              : "border-teal/30 bg-card ring-1 ring-teal/20"
        }`}
      >
        {/* Block Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-line">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-md ${
                isSignedOff
                  ? "bg-teal text-white"
                  : isEnabled
                    ? "bg-teal-tint text-teal border border-teal/20"
                    : "bg-paper-2 text-subtle border border-line"
              }`}
            >
              {isSignedOff ? (
                <ShieldCheck className="size-5" aria-hidden="true" />
              ) : (
                <PenLine className="size-5" aria-hidden="true" />
              )}
            </div>
            <div>
              <h3
                id="signoff-heading"
                className="font-heading text-lg font-bold text-ink flex items-center gap-2"
              >
                <span>Biostatistical Sign-Off</span>
                <span className="text-xs font-sans font-medium px-2 py-0.5 rounded bg-paper-2 text-subtle border border-line">
                  Part 11-style sign-off mock · not a real electronic signature
                </span>
              </h3>
              <p className="text-xs text-subtle mt-0.5">
                Section {section.id} ({section.title}) numeric reconciliation sign-off
              </p>
            </div>
          </div>

          <div>
            {isSignedOff ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal text-white shadow-xs">
                <CheckCircle2 className="size-4" aria-hidden="true" />
                <span>Signed Off (prototype)</span>
              </span>
            ) : isEnabled ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-tint text-teal border border-teal/30">
                <UserCheck className="size-3.5" aria-hidden="true" />
                <span>Ready for Biostatistician Signature</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-paper-2 text-subtle border border-line">
                <Lock className="size-3.5" aria-hidden="true" />
                <span>Signature Gated</span>
              </span>
            )}
          </div>
        </div>

        {/* Signature Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 text-xs">
          <div className="p-3 rounded-md bg-paper border border-line/60">
            <span className="text-[11px] font-bold uppercase tracking-wider text-subtle block mb-1">
              Signer Name
            </span>
            <div className="font-semibold text-ink text-sm flex items-center gap-2">
              <span>{signerName}</span>
              {isSignedOff && (
                <CheckCircle2 className="size-3.5 text-teal shrink-0" aria-hidden="true" />
              )}
            </div>
            <span className="text-[11px] text-subtle block mt-0.5">
              {isSignedOff ? "Prototype identity (no real authentication)" : persona.title}
            </span>
          </div>

          <div className="p-3 rounded-md bg-paper border border-line/60">
            <span className="text-[11px] font-bold uppercase tracking-wider text-subtle block mb-1">
              Role & Jurisdiction
            </span>
            <div className="font-semibold text-ink text-sm">
              {isSignedOff ? "Biostatistician" : currentRoleLabel}
            </div>
            <span className="text-[11px] text-subtle block mt-0.5">
              {isBiostat || isSignedOff
                ? "Authorized for statistical sign-off"
                : "Unauthorized for statistical sign-off"}
            </span>
          </div>

          <div className="p-3 rounded-md bg-paper border border-line/60">
            <span className="text-[11px] font-bold uppercase tracking-wider text-subtle block mb-1">
              Signature Timestamp
            </span>
            <div className="font-semibold text-ink text-sm tabular">
              {displayTimestamp}
            </div>
            <span className="text-[11px] text-subtle block mt-0.5">
              {isSignedOff ? "Logged to the append-only prototype audit trail" : "Recorded with UTC timestamp"}
            </span>
          </div>
        </div>

        {/* Meaning of Signature Box */}
        <div className="p-3.5 rounded-md bg-paper-2/60 border border-line text-xs mb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-teal block mb-1">
            Meaning of Signature
          </span>
          <blockquote className="font-heading text-sm italic text-ink border-l-2 border-teal pl-3 py-0.5">
            &ldquo;I confirm the numbers in this section match the source TLFs.&rdquo;
          </blockquote>
        </div>

        {/* Warning / Reason Banners when Gated */}
        {!isSignedOff && !isBiostat && (
          <div className="mb-4 flex items-start gap-2.5 p-3 rounded-md bg-amber-tint/40 border border-amber/30 text-amber text-xs">
            <AlertTriangle className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold">Sign-off role requirement</p>
              <p className="mt-0.5 text-ink">
                Statistical verification sign-off is restricted to the{" "}
                <strong className="font-semibold">Biostatistician</strong> role. You are
                currently in the{" "}
                <strong className="font-semibold">{currentRoleLabel}</strong> view. Switch
                roles in the top navigation bar to sign off.
              </p>
            </div>
          </div>
        )}

        {!isSignedOff && hasCritical && (
          <div className="mb-4 flex items-start gap-2.5 p-3 rounded-md bg-critical-tint/50 border border-critical/30 text-critical text-xs">
            <AlertOctagon className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold">
                Regulatory Gate: {criticalFindings.length} open critical finding
                {criticalFindings.length > 1 ? "s" : ""}
              </p>
              <p className="mt-0.5 text-ink">
                Sign-off is strictly blocked while critical findings exist:{" "}
                <strong className="font-semibold text-critical">
                  {criticalFindings.map((f) => f.ruleId).join(", ")}
                </strong>
                . Open{" "}
                <Link
                  href={`/sections/${section.id}`}
                  className="text-teal font-semibold underline hover:text-teal/80"
                >
                  Section {section.id} Workspace
                </Link>{" "}
                to apply the required statistical phrasing fix.
              </p>
            </div>
          </div>
        )}

        {/* 21 CFR Part 11 Dual-Component Authentication Challenge */}
        {isEnabled && !isSignedOff && (
          <div className="mb-4 rounded-md border border-teal/30 bg-teal-tint/20 p-3.5 text-xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-teal/20 pb-2">
              <span className="font-semibold text-teal flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-teal" />
                21 CFR Part 11 Electronic Signature Verification Gate
              </span>
              <span className="text-[10px] font-mono text-teal bg-teal-tint px-2 py-0.5 rounded border border-teal/30">
                FDA § 11.200 Dual Authentication
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-ink block">
                  Component 1: Signer Identity & Credentials
                </label>
                <div className="flex items-center gap-2 p-2 rounded bg-card border border-line">
                  <UserCheck className="size-3.5 text-teal shrink-0" />
                  <span className="font-mono text-[11px] text-ink truncate">
                    m.vance@meridianbio.com
                  </span>
                  <span className="ml-auto text-[10px] text-ok font-semibold shrink-0">
                    SSO Active
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-ink block">
                  Component 2: Two-Factor Token (2FA / TOTP)
                </label>
                <div className="flex items-center gap-2 p-2 rounded bg-card border border-line">
                  <Lock className="size-3.5 text-teal shrink-0" />
                  <span className="font-mono text-[11px] text-ink tracking-widest">
                    849-204
                  </span>
                  <span className="ml-auto text-[10px] text-ok font-semibold shrink-0">
                    Verified ✓
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-1 flex items-start gap-2">
              <input
                type="checkbox"
                id="part11-declaration"
                defaultChecked
                className="mt-0.5 rounded border-line text-teal focus:ring-teal"
              />
              <label
                htmlFor="part11-declaration"
                className="text-[11px] text-body leading-relaxed select-none"
              >
                I declare that this electronic signature is the legally binding equivalent of my handwritten signature pursuant to 21 CFR Part 11 § 11.200.
              </label>
            </div>
          </div>
        )}

        {/* 21 CFR Part 11 Digital Certificate when Signed */}
        {isSignedOff && (
          <div className="mb-4 rounded-md border border-teal/40 bg-teal-tint/30 p-3.5 text-xs space-y-2">
            <div className="flex items-center justify-between border-b border-teal/20 pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-teal" />
                <span className="font-bold text-teal text-xs">
                  21 CFR Part 11 Certified Electronic Signature Seal
                </span>
              </div>
              <span className="font-mono text-[10px] text-teal-dark font-semibold">
                Cert ID: SIG-21CFR11-{section.id}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-subtle">Authentication Method: </span>
                <strong className="text-ink">Corporate SSO + TOTP 2FA (Verified)</strong>
              </div>
              <div>
                <span className="text-subtle">Legal Effect: </span>
                <strong className="text-ink">Binding Statistical Verification (§ 11.200)</strong>
              </div>
              <div className="sm:col-span-2 font-mono text-[10px] text-subtle truncate">
                SHA-256 Digest: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
              </div>
            </div>
          </div>
        )}

        {/* Sign-off CTA / Signed Confirmation */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-line">
          <div className="text-xs text-subtle">
            {isSignedOff ? (
              <span className="flex items-center gap-1.5 text-teal font-medium">
                <CheckCircle2 className="size-4 text-teal shrink-0" aria-hidden="true" />
                <span>
                  Section status updated to <strong>Signed off</strong> on Study Home
                  (S1).
                </span>
              </span>
            ) : isEnabled ? (
              <span className="text-teal font-medium">
                All numbers match source TLFs. You may execute this electronic signature.
              </span>
            ) : (
              <span className="text-subtle italic">{disabledReason}</span>
            )}
          </div>

          <div>
            {isSignedOff ? (
              <Button
                disabled
                variant="outline"
                size="sm"
                className="bg-paper-2 text-teal border-teal/30 cursor-default opacity-90 text-xs font-semibold h-9 px-4"
              >
                <CheckCircle2 className="size-4 mr-1.5 text-teal" aria-hidden="true" />
                <span>Signed Off & Recorded</span>
              </Button>
            ) : isEnabled ? (
              <Button
                onClick={onSignOff}
                size="sm"
                className="bg-teal hover:bg-teal/90 text-white font-semibold text-xs h-9 px-5 shadow-xs transition-colors"
              >
                <PenLine className="size-4 mr-1.5" aria-hidden="true" />
                <span>Sign off section</span>
              </Button>
            ) : (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      disabled
                      aria-disabled="true"
                      className="inline-flex items-center justify-center rounded-md border border-line bg-paper-2 text-subtle text-xs font-semibold h-9 px-4 opacity-60 cursor-not-allowed"
                    />
                  }
                >
                  <Lock className="size-3.5 mr-1.5" aria-hidden="true" />
                  <span>Sign off section</span>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="max-w-xs text-xs bg-ink text-paper border-ink"
                >
                  {disabledReason}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </section>
    </TooltipProvider>
  );
}
