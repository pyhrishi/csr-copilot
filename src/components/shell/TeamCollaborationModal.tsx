"use client";

import * as React from "react";
import {
  Check,
  Copy,
  Download,
  RotateCcw,
  Upload,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { SectionDraftStatus } from "@/lib/study-readiness";
import type { Fact, Section } from "@/lib/types";
import { useAuditStore } from "@/store/audit";
import { useDraftsStore } from "@/store/drafts";
import { useRoleStore } from "@/store/role";

interface TeamCollaborationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TeamCollaborationModal({
  isOpen,
  onClose,
}: TeamCollaborationModalProps) {
  const [copiedLink, setCopiedLink] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const draftsState = useDraftsStore();
  const auditState = useAuditStore();
  const roleState = useRoleStore();

  if (!isOpen) return null;

  const handleExportSnapshot = () => {
    const snapshot = {
      version: "1.0",
      studyId: "CRD-301",
      exportedAt: new Date().toISOString(),
      drafts: {
        sentences: draftsState.sentences,
        sectionStatuses: draftsState.sectionStatuses,
        sectionAutonomy: draftsState.sectionAutonomy,
        customSections: draftsState.customSections,
        customFacts: draftsState.customFacts,
        customTlfs: draftsState.customTlfs,
        tlfRevisionApplied: draftsState.tlfRevisionApplied,
      },
      audit: {
        events: auditState.events,
      },
      role: roleState.role,
    };

    const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `csr-copilot-snapshot-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    auditState.append({
      actor: roleState.role,
      role: roleState.role,
      action: "export",
      objectId: "study-snapshot",
      detail: "Exported complete study JSON snapshot for peer collaboration.",
    });

    toast.success("Study Snapshot Exported", {
      description: "Downloaded JSON snapshot file ready to share with your team.",
    });
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const snapshot = JSON.parse(content);

        if (!snapshot.drafts) {
          throw new Error("Invalid snapshot format: missing drafts property.");
        }

        // Hydrate stores
        if (snapshot.drafts.sentences) {
          draftsState.setSentences(Object.values(snapshot.drafts.sentences));
        }
        if (snapshot.drafts.sectionStatuses) {
          for (const [secId, status] of Object.entries(snapshot.drafts.sectionStatuses)) {
            draftsState.setSectionStatus(secId, status as SectionDraftStatus);
          }
        }
        if (snapshot.drafts.customSections) {
          for (const sec of Object.values(snapshot.drafts.customSections)) {
            draftsState.addCustomSection(sec as Section);
          }
        }
        if (snapshot.drafts.customFacts) {
          for (const f of Object.values(snapshot.drafts.customFacts)) {
            draftsState.setCustomFact(f as Fact);
          }
        }
        if (snapshot.audit?.events) {
          for (const ev of snapshot.audit.events) {
            auditState.append(ev);
          }
        }

        toast.success("Study Snapshot Imported Successfully", {
          description: `Loaded study snapshot from ${file.name}. All peer edits and sign-offs restored.`,
        });
        onClose();
      } catch (err) {
        toast.error("Failed to import snapshot", {
          description: err instanceof Error ? err.message : "Invalid JSON file.",
        });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleCopyShareLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.origin);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      toast.success("Shareable Link Copied", {
        description: "Colleagues can open the application URL or import your JSON snapshot.",
      });
    }
  };

  const handleResetStudy = () => {
    if (confirm("Reset all local drafts, sign-offs, and custom sections back to initial study seed?")) {
      draftsState.reset();
      auditState.reset();
      toast.info("Study reset to baseline seed state.");
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    >
      <div className="w-full max-w-lg rounded-xl bg-card border border-line p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <Users className="size-5 text-teal" />
            <div>
              <h3 className="font-heading text-lg font-semibold text-ink">
                Team Collaboration & Study Sync
              </h3>
              <p className="text-[11px] text-subtle">
                Cross-role multi-user sharing, session snapshots, and active team presence.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-subtle hover:text-ink p-1 rounded-md"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Active Team Presence */}
        <div className="space-y-2 rounded-lg border border-line bg-paper-2/40 p-3.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-teal block">
            Active Study Collaborators (Simulated Multi-User Presence)
          </span>
          <div className="space-y-2 pt-1 text-xs">
            <div className="flex items-center justify-between bg-card p-2 rounded border border-line/60">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-ok animate-pulse" />
                <span className="font-semibold text-ink">Dr. Marcus Vance, PhD</span>
                <span className="text-[11px] text-subtle font-mono">(Biostatistician)</span>
              </div>
              <span className="text-[11px] text-teal font-medium">Active in S4 Reconciliation</span>
            </div>

            <div className="flex items-center justify-between bg-card p-2 rounded border border-line/60">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-ok" />
                <span className="font-semibold text-ink">Elena Rostova, MS</span>
                <span className="text-[11px] text-subtle font-mono">(Lead Medical Writer)</span>
              </div>
              <span className="text-[11px] text-teal font-medium">Reviewing Section 12.2</span>
            </div>

            <div className="flex items-center justify-between bg-card p-2 rounded border border-line/60">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-amber" />
                <span className="font-semibold text-ink">Sarah Chen, RAC</span>
                <span className="text-[11px] text-subtle font-mono">(Regulatory & QA)</span>
              </div>
              <span className="text-[11px] text-subtle">Audit Trail Inspection</span>
            </div>
          </div>
        </div>

        {/* Sync & Snapshot Affordances */}
        <div className="space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-subtle block">
            Session Sharing & Snapshot Transfer
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <Button
              type="button"
              variant="outline"
              onClick={handleExportSnapshot}
              className="h-10 text-xs justify-start gap-2 bg-card hover:bg-paper text-ink border-line"
            >
              <Download className="size-4 text-teal shrink-0" />
              <span>Export Snapshot (.json)</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="h-10 text-xs justify-start gap-2 bg-card hover:bg-paper text-ink border-line"
            >
              <Upload className="size-4 text-teal shrink-0" />
              <span>Import Snapshot (.json)</span>
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json"
              className="hidden"
            />
          </div>

          <div className="flex items-center justify-between gap-3 p-3 rounded-lg border border-line bg-paper">
            <div className="min-w-0 flex-1 text-xs">
              <span className="font-semibold text-ink block">Shareable Study Link</span>
              <span className="text-[11px] text-subtle block truncate">
                Direct colleagues to this study instance to review active sections.
              </span>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={handleCopyShareLink}
              className="h-8 text-xs shrink-0 bg-teal hover:bg-teal/90 text-white gap-1.5"
            >
              {copiedLink ? (
                <>
                  <Check className="size-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-line text-xs">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResetStudy}
            className="text-xs text-critical hover:bg-critical-tint/50 h-8 gap-1.5"
          >
            <RotateCcw className="size-3.5" />
            <span>Reset to Fresh Seed</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-8 text-xs px-4"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
