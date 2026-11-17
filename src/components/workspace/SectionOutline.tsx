"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  CircleDashed,
  Clock,
  FileText,
  Lock,
  PanelLeftClose,
  PanelLeftOpen,
  PenLine,
  Plus,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { computeSectionStatus, type SectionDraftStatus } from "@/lib/study-readiness";
import type { DraftSentence, Section } from "@/lib/types";
import { useAuditStore, useDraftsStore, useRoleStore } from "@/store";

interface SectionOutlineProps {
  sections: readonly Section[];
  activeSectionId: string;
  draftSentences: Record<string, DraftSentence>;
  sectionStatuses?: Record<string, SectionDraftStatus>;
}

const EMPTY_CUSTOM_SECTIONS: Record<string, Section> = {};

export function SectionOutline({
  sections,
  activeSectionId,
  draftSentences,
  sectionStatuses,
}: SectionOutlineProps) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSectionId, setNewSectionId] = useState("");
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [newSectionRelease, setNewSectionRelease] = useState<"R1" | "R2">("R1");

  const customSections = useSyncExternalStore(
    useDraftsStore.subscribe,
    () => useDraftsStore.getState().customSections,
    () => EMPTY_CUSTOM_SECTIONS,
  );
  const addCustomSection = useDraftsStore((s) => s.addCustomSection);
  const appendAudit = useAuditStore((s) => s.append);
  const role = useRoleStore((s) => s.role);

  const mergedSections = useMemo(() => {
    const list = [...sections];
    const existing = new Set(sections.map((s) => s.id));
    for (const custom of Object.values(customSections)) {
      if (!existing.has(custom.id)) {
        list.push(custom);
      }
    }
    return list;
  }, [sections, customSections]);

  const handleCreateSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionId.trim() || !newSectionTitle.trim()) {
      toast.error("Please enter a section number and title.");
      return;
    }

    const cleanId = newSectionId.trim();
    const newSection: Section = {
      id: cleanId,
      title: newSectionTitle.trim(),
      release: newSectionRelease,
      autonomy: "L2",
      tlfs: ["14.1.1"],
      sentences: [
        {
          id: `${cleanId}-s1`,
          text: `Study results for Section ${cleanId}: safety population evaluated in {F:14.1.1.safety.all} subjects.`,
          cites: ["14.1.1"],
        },
      ],
    };

    addCustomSection(newSection);
    appendAudit({
      actor: role,
      role,
      action: "edit",
      objectId: cleanId,
      detail: `Created custom CSR Section ${cleanId}: "${newSection.title}" with initial template.`,
    });

    toast.success(`Section ${cleanId} created!`);
    setIsAddModalOpen(false);
    setNewSectionId("");
    setNewSectionTitle("");
    router.push(`/sections/${encodeURIComponent(cleanId)}`);
  };

  return (
    <aside
      className={
        "shrink-0 border-r border-line bg-paper-2/30 flex flex-col gap-3 h-full overflow-y-auto overflow-x-hidden transition-[width] duration-300 ease-in-out select-none " +
        (collapsed ? "w-[60px] p-2" : "w-[260px] p-4")
      }
    >
      {/* Header & Collapse Toggle */}
      <div className="flex items-center justify-between pb-1 border-b border-line/50">
        {!collapsed && (
          <div>
            <div className="label text-teal text-[11px]">ICH E3 Outline</div>
            <div className="text-xs text-subtle mt-0.5">Study Sections</div>
          </div>
        )}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand section outline" : "Collapse section outline"}
          className={
            "p-1.5 rounded-md text-subtle hover:text-ink hover:bg-paper-2 transition-all duration-200 " +
            (collapsed ? "mx-auto" : "")
          }
          title={collapsed ? "Expand outline" : "Collapse outline"}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4 text-teal transition-transform duration-300" aria-hidden="true" />
          ) : (
            <PanelLeftClose className="size-4 transition-transform duration-300" aria-hidden="true" />
          )}
        </button>
      </div>

      <nav aria-label="Section outline" className="space-y-1">
        {mergedSections.map((s) => {
          const isActive = s.id === activeSectionId;
          const statusInfo = computeSectionStatus(s, draftSentences, sectionStatuses);
          const isR2Locked = s.release === "R2" || s.autonomy === "locked";
          const isHumanOnly = s.release === "human";

          const StatusIcon =
            statusInfo.status === "signed_off"
              ? CheckCircle2
              : statusInfo.status === "in_review"
                ? Clock
                : statusInfo.status === "drafted"
                  ? FileText
                  : isHumanOnly
                    ? PenLine
                    : isR2Locked
                      ? Lock
                      : CircleDashed;

          const statusColor =
            statusInfo.status === "signed_off"
              ? "text-teal"
              : statusInfo.status === "in_review"
                ? "text-amber"
                : statusInfo.status === "drafted"
                  ? "text-ink"
                  : isHumanOnly
                    ? "text-amber"
                    : isR2Locked
                      ? "text-subtle"
                      : "text-subtle";

          const linkEl = (
            <Link
              key={s.id}
              href={`/sections/${s.id}`}
              className={`flex items-start rounded-lg text-xs transition-all duration-200 ${
                collapsed
                  ? "justify-center p-2.5 "
                  : "gap-2.5 p-2.5 "
              }${
                isActive
                  ? "bg-card border border-line shadow-xs font-semibold text-ink ring-1 ring-teal/20"
                  : "text-body hover:bg-paper-2 hover:text-ink hover:translate-x-0.5"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                <StatusIcon className={`size-3.5 ${statusColor}`} aria-hidden="true" />
              </div>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold tabular text-ink">{s.id}</span>
                    {isR2Locked && (
                      <span className="text-[10px] text-subtle font-normal italic">
                        (R2)
                      </span>
                    )}
                    {isHumanOnly && (
                      <span className="text-[10px] text-amber font-normal italic">
                        (Human)
                      </span>
                    )}
                  </div>
                  <div className="truncate text-subtle text-[11px] mt-0.5">
                    {s.title}
                  </div>
                </div>
              )}
            </Link>
          );

          if (collapsed) {
            return (
              <Tooltip key={s.id}>
                <TooltipTrigger render={linkEl} />
                <TooltipContent side="right" sideOffset={8} className="bg-card text-ink border border-line shadow-md p-2">
                  <div className="font-semibold text-xs flex items-center gap-1.5">
                    <span className="tabular font-bold text-teal">Section {s.id}</span>
                    {isR2Locked && <span className="text-[10px] text-subtle italic">(R2)</span>}
                    {isHumanOnly && <span className="text-[10px] text-amber italic">(Human)</span>}
                  </div>
                  <div className="text-[11px] text-subtle mt-0.5 max-w-[200px] truncate">{s.title}</div>
                  <div className="text-[10px] text-muted-foreground mt-1 capitalize">
                    Status: {statusInfo.status.replace("_", " ")}
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          }

          return linkEl;
        })}

        {/* Add Custom Section Button */}
        <div className="pt-2 border-t border-line/40">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className={`w-full text-xs text-teal hover:bg-teal-tint/50 h-8 ${
              collapsed ? "px-0 justify-center" : "px-2.5 justify-start"
            }`}
            title="Add Custom CSR Section"
          >
            <Plus className="size-3.5 shrink-0" />
            {!collapsed && <span className="ml-1.5 font-semibold">Add Section</span>}
          </Button>
        </div>
      </nav>

      {/* Add Section Modal Dialog */}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div className="w-full max-w-md rounded-xl bg-card border border-line p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-teal" />
                <h3 className="font-heading text-lg font-semibold text-ink">Add Custom CSR Section</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-subtle hover:text-ink p-1 rounded-md"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSection} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-ink block mb-1">ICH E3 Section Number</label>
                <input
                  type="text"
                  placeholder="e.g. 11.1, 14.1, 16.2"
                  value={newSectionId}
                  onChange={(e) => setNewSectionId(e.target.value)}
                  className="w-full h-8 px-2.5 rounded bg-paper border border-line text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-ink block mb-1">Section Title</label>
                <input
                  type="text"
                  placeholder="e.g. Demographics and Baseline Characteristics"
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  className="w-full h-8 px-2.5 rounded bg-paper border border-line text-xs"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-ink block mb-1">Release Stage</label>
                <select
                  value={newSectionRelease}
                  onChange={(e) => setNewSectionRelease(e.target.value as "R1" | "R2")}
                  className="w-full h-8 px-2 rounded bg-paper border border-line text-xs"
                >
                  <option value="R1">Release 1 (Interactive Authoring Enabled)</option>
                  <option value="R2">Release 2 (Locked / Future Scope)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-line">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
                  className="h-8 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="h-8 text-xs bg-teal hover:bg-teal/90 text-white font-semibold"
                >
                  Create & Open Section
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
}
