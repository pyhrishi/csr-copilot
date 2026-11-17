import { Lock, PenLine, ShieldAlert } from "lucide-react";

import { AutonomyPill, ReleaseBadge } from "@/components/trust";
import { RightPanel } from "@/components/workspace/RightPanel";
import type { DraftSentence, Fact, Section } from "@/lib/types";

interface LockedSectionViewProps {
  section: Section;
  facts: readonly Fact[];
  sentences: readonly DraftSentence[];
  onFactClick: (factId: string) => void;
}

export function LockedSectionView({
  section,
  facts,
  sentences,
  onFactClick,
}: LockedSectionViewProps) {
  const isR2 = section.release === "R2" || section.id === "11.4";
  const isHuman = section.release === "human" || section.id === "13";

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden">
      {/* Locked Canvas Message */}
      <main className="flex-1 overflow-y-auto p-8 flex flex-col justify-center items-center bg-paper">
        <div className="max-w-xl w-full rounded-xl border border-line bg-card p-8 shadow-xs text-center space-y-4">
          <div className="size-12 rounded-full mx-auto flex items-center justify-center bg-paper-2 text-ink border border-line">
            {isR2 ? (
              <Lock className="size-6 text-subtle" aria-hidden="true" />
            ) : (
              <PenLine className="size-6 text-amber" aria-hidden="true" />
            )}
          </div>

          <div className="flex items-center justify-center gap-2">
            <span className="rounded-md bg-ink px-2 py-0.5 text-xs font-bold text-teal-light tabular">
              Section {section.id}
            </span>
            <ReleaseBadge release={section.release} />
            <AutonomyPill level={section.autonomy} />
          </div>

          <h1 className="font-heading text-2xl font-semibold text-ink">
            {section.title}
          </h1>

          <div className="p-4 rounded-lg border border-line/80 bg-paper-2/40 text-xs text-body leading-relaxed max-w-md mx-auto">
            {isR2 ? (
              <p>
                <strong>Locked for Release 2:</strong> Efficacy results arrive in Release 2 with
                biostatistician sign-off.
              </p>
            ) : isHuman ? (
              <p>
                <strong>Human-Authored Section:</strong> Conclusions stay human-authored; AI
                supplies a fact panel only.
              </p>
            ) : (
              <p>This section is currently locked from automated AI generation.</p>
            )}
          </div>

          <div className="text-[11px] text-subtle flex items-center justify-center gap-1.5 pt-2 border-t border-line/60">
            <ShieldAlert className="size-3.5 text-teal" aria-hidden="true" />
            <span>Regulated CSR Boundary: Clinical judgment strictly preserved</span>
          </div>
        </div>
      </main>

      {/* For human-authored Section 13, show the Fact Panel so writer can reference facts */}
      {isHuman && (
        <RightPanel
          section={section}
          facts={facts}
          sentences={sentences}
          onFactClick={onFactClick}
        />
      )}
    </div>
  );
}
