import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CircleDashed,
  Clock,
  FileText,
  Lock,
  PenLine,
  User,
} from "lucide-react";

import { AutonomyPill, ReleaseBadge } from "@/components/trust";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { computeSectionStatus } from "@/lib/study-readiness";
import type { DraftSentence, Section } from "@/lib/types";

interface SectionBoardProps {
  sections: readonly Section[];
  draftSentences: Record<string, DraftSentence>;
  highlightWriter?: boolean;
}

const SECTION_METADATA: Record<
  string,
  {
    owner: string;
    lockedReason?: string;
  }
> = {
  "10.1": {
    owner: "Medical Writer",
  },
  "12.2": {
    owner: "Medical Writer",
  },
  "12.3": {
    owner: "Medical Writer",
  },
  "11.4": {
    owner: "Biostatistician",
    lockedReason: "Efficacy results arrive in Release 2 with biostatistician sign-off.",
  },
  "13": {
    owner: "Medical Writer",
    lockedReason: "Conclusions stay human-authored; AI supplies a fact panel only.",
  },
};

export function SectionBoard({
  sections,
  draftSentences,
  highlightWriter = false,
}: SectionBoardProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="label text-teal flex items-center gap-1.5">
          <span>ICH E3 Section Board</span>
          {highlightWriter && (
            <span className="rounded-full bg-teal-tint px-2 py-0.5 text-[10px] font-bold text-teal">
              Writer Priority View
            </span>
          )}
        </h3>
        <span className="text-xs text-subtle">
          {sections.length} total sections · 3 active in Release 1
        </span>
      </div>

      <div className="rounded-xl border border-line bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-paper-2 hover:bg-paper-2 border-b border-line">
              <TableHead className="w-[80px] font-bold text-ink">Section</TableHead>
              <TableHead className="min-w-[220px] font-bold text-ink">Title</TableHead>
              <TableHead className="w-[120px] font-bold text-ink">Release</TableHead>
              <TableHead className="w-[140px] font-bold text-ink">Autonomy</TableHead>
              <TableHead className="w-[130px] font-bold text-ink">Status</TableHead>
              <TableHead className="w-[140px] font-bold text-ink">Owner</TableHead>
              <TableHead className="w-[180px] text-right font-bold text-ink">Progress</TableHead>
              <TableHead className="w-[130px] text-right font-bold text-ink">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sections.map((section) => {
              const meta = SECTION_METADATA[section.id] ?? { owner: "Medical Writer" };
              const statusInfo = computeSectionStatus(section, draftSentences);
              const isR2Locked = section.release === "R2" || section.autonomy === "locked";
              const isHumanOnly = section.release === "human";
              const isLockedOrHuman = isR2Locked || isHumanOnly;
              const isWriterSection = meta.owner === "Medical Writer" && !isLockedOrHuman;

              const isHighlighted = highlightWriter && isWriterSection;

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

              return (
                <TableRow
                  key={section.id}
                  className={`border-b border-line/70 transition-colors ${
                    isHighlighted ? "bg-teal-tint/25 hover:bg-teal-tint/40" : "hover:bg-paper/60"
                  }`}
                >
                  {/* Section ID */}
                  <TableCell className="font-bold tabular text-ink">
                    {section.id}
                  </TableCell>

                  {/* Title & locked description */}
                  <TableCell>
                    <div className="font-medium text-ink flex items-center gap-2">
                      <span>{section.title}</span>
                      {isR2Locked && (
                        <span className="text-[11px] text-subtle font-normal italic">
                          (Locked)
                        </span>
                      )}
                      {isHumanOnly && (
                        <span className="text-[11px] text-amber font-normal italic">
                          (Human Authoring)
                        </span>
                      )}
                    </div>
                    {meta.lockedReason && (
                      <p className="text-xs text-subtle mt-0.5 max-w-md">
                        {meta.lockedReason}
                      </p>
                    )}
                  </TableCell>

                  {/* Release Badge */}
                  <TableCell>
                    <ReleaseBadge release={section.release} />
                  </TableCell>

                  {/* Autonomy Pill */}
                  <TableCell>
                    <AutonomyPill level={section.autonomy} />
                  </TableCell>

                  {/* Status from drafts store (Icon + Word + Colour) */}
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium tabular ${
                        statusInfo.status === "signed_off"
                          ? "bg-teal-tint text-teal border border-teal/20"
                          : statusInfo.status === "in_review"
                            ? "bg-amber-tint text-amber border border-amber/20"
                            : statusInfo.status === "drafted"
                              ? "bg-paper-2 text-ink border border-line"
                              : isHumanOnly
                                ? "bg-amber-tint text-amber border border-amber/20"
                                : "text-subtle bg-paper-2/60 border border-line/60"
                      }`}
                    >
                      <StatusIcon className="size-3 shrink-0" aria-hidden="true" />
                      <span>{statusInfo.label}</span>
                    </span>
                  </TableCell>

                  {/* Owner */}
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs text-body font-medium">
                      <User className="size-3.5 text-subtle" aria-hidden="true" />
                      <span>{meta.owner}</span>
                    </div>
                  </TableCell>

                  {/* Progress (Right-aligned numeric) */}
                  <TableCell className="text-right">
                    {section.sentences.length > 0 ? (
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs font-medium tabular text-ink">
                          {statusInfo.draftedCount} / {statusInfo.totalCount} sentences ({statusInfo.percent}%)
                        </span>
                        <Progress value={statusInfo.percent} className="h-1.5 w-24 bg-paper-2" />
                      </div>
                    ) : (
                      <span className="text-xs text-subtle tabular">—</span>
                    )}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    {isR2Locked ? (
                      <span
                        className="inline-flex items-center gap-1 text-xs text-subtle cursor-not-allowed font-medium"
                        title={meta.lockedReason}
                      >
                        <Lock className="size-3" aria-hidden="true" />
                        <span>Locked</span>
                      </span>
                    ) : isHumanOnly ? (
                      <span
                        className="inline-flex items-center gap-1 text-xs text-amber cursor-not-allowed font-medium"
                        title={meta.lockedReason}
                      >
                        <PenLine className="size-3" aria-hidden="true" />
                        <span>Human only</span>
                      </span>
                    ) : (
                      <Link
                        href={`/sections/${section.id}`}
                        className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                          isHighlighted
                            ? "bg-teal text-white hover:bg-teal/90 shadow-xs"
                            : "bg-paper-2 text-ink hover:bg-paper-2/80 border border-line"
                        }`}
                      >
                        <span>Workspace</span>
                        <ArrowRight className="size-3" aria-hidden="true" />
                      </Link>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
