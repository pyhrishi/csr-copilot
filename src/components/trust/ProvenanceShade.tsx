import type { ReactNode } from "react";

import type { Provenance } from "@/lib/types";

interface ProvenanceShadeProps {
  provenance: Provenance;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

const SHADE_CLASSES: Record<Provenance, string> = {
  ai: "bg-teal-tint/45 hover:bg-teal-tint/70 border-l-2 border-teal",
  ai_edited: "bg-amber-tint/55 hover:bg-amber-tint/80 border-l-2 border-amber",
  human: "bg-transparent border-l-2 border-transparent",
};

/**
 * ProvenanceShade: wraps a sentence and applies sentence background by origin per docs/design-system.md.
 * - AI-generated = teal-tint
 * - AI-edited = amber-tint
 * - Human = none
 */
export function ProvenanceShade({
  provenance,
  children,
  className = "",
  onClick,
}: ProvenanceShadeProps) {
  const shade = SHADE_CLASSES[provenance] ?? SHADE_CLASSES.ai;

  return (
    <span
      onClick={onClick}
      className={`inline transition-colors rounded-xs px-1 py-0.5 ${shade} ${className}`}
    >
      {children}
    </span>
  );
}

/**
 * ProvenanceLegend: always-visible legend in the editor header per docs/design-system.md.
 */
export function ProvenanceLegend({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center gap-3 text-xs text-subtle select-none ${className}`}
      aria-label="Provenance legend"
    >
      <span className="font-semibold text-ink text-[11px] uppercase tracking-wider">
        Provenance:
      </span>
      <div className="flex items-center gap-1.5">
        <span className="size-2.5 rounded-xs bg-teal-tint border border-teal/40" />
        <span className="text-body font-medium">AI-generated</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="size-2.5 rounded-xs bg-amber-tint border border-amber/40" />
        <span className="text-body font-medium">AI-edited</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="size-2.5 rounded-xs bg-card border border-line" />
        <span className="text-body font-medium">Human</span>
      </div>
    </div>
  );
}
