import Link from "next/link";
import { CheckCircle2, CircleDashed, Clock, FileText, Lock, PenLine } from "lucide-react";

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
  return (
    <aside className="w-[260px] shrink-0 border-r border-line bg-paper-2/30 p-4 flex flex-col gap-3 h-full overflow-y-auto">
      <div>
        <div className="label text-teal text-[11px]">ICH E3 Outline</div>
        <div className="text-xs text-subtle mt-0.5">Study Sections</div>
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

          return (
            <Link
              key={s.id}
              href={`/sections/${s.id}`}
              className={`flex items-start gap-2.5 rounded-lg p-2.5 text-xs transition-colors ${
                isActive
                  ? "bg-card border border-line shadow-xs font-semibold text-ink"
                  : "text-body hover:bg-paper-2 hover:text-ink"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                <StatusIcon className={`size-3.5 ${statusColor}`} aria-hidden="true" />
              </div>
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
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
