"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  CircleDashed,
  Clock,
  FileText,
  Lock,
  PanelLeftClose,
  PanelLeftOpen,
  PenLine,
} from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { computeSectionStatus, type SectionDraftStatus } from "@/lib/study-readiness";
import type { DraftSentence, Section } from "@/lib/types";

interface SectionOutlineProps {
  sections: readonly Section[];
  activeSectionId: string;
  draftSentences: Record<string, DraftSentence>;
  sectionStatuses?: Record<string, SectionDraftStatus>;
}

export function SectionOutline({
  sections,
  activeSectionId,
  draftSentences,
  sectionStatuses,
}: SectionOutlineProps) {
  const [collapsed, setCollapsed] = useState(false);

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
        {sections.map((s) => {
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
      </nav>
    </aside>
  );
}
