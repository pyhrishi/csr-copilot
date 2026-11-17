import type { ComponentPropsWithoutRef } from "react";
import { CheckCircle2, Clock, Lock, PenLine } from "lucide-react";

import { cn } from "@/lib/utils";

export type ReleaseType = "R1" | "R2" | "human" | "locked";

interface ReleaseBadgeProps extends ComponentPropsWithoutRef<"span"> {
  release: ReleaseType;
  /** When true, shows an abbreviated label (e.g., "R1" instead of "Release 1"). */
  short?: boolean;
}

const CONFIG: Record<
  ReleaseType,
  {
    label: string;
    shortLabel: string;
    className: string;
    icon: typeof CheckCircle2;
  }
> = {
  R1: {
    label: "Release 1",
    shortLabel: "R1",
    className: "bg-teal-tint text-teal border-teal/30",
    icon: CheckCircle2,
  },
  R2: {
    label: "Release 2",
    shortLabel: "R2",
    className: "bg-[#EAEFF5] text-[#334B68] border-[#CAD5E2]",
    icon: Clock,
  },
  human: {
    label: "Human authored",
    shortLabel: "Human",
    className: "bg-amber-tint text-amber border-amber/30",
    icon: PenLine,
  },
  locked: {
    label: "Locked",
    shortLabel: "Locked",
    className: "bg-paper-2 text-subtle border-line",
    icon: Lock,
  },
};

/**
 * ReleaseBadge: renders R1 / R2 / Human / Locked states per docs/design-system.md.
 * Every status has icon + word + colour.
 */
export function ReleaseBadge({
  release,
  short = false,
  className,
  ...props
}: ReleaseBadgeProps) {
  const cfg = CONFIG[release] ?? CONFIG.locked;
  const Icon = cfg.icon;
  const text = short ? cfg.shortLabel : cfg.label;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[6px] border px-2 py-0.5 text-xs font-semibold tabular",
        cfg.className,
        className,
      )}
      {...props}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      <span>{text}</span>
    </span>
  );
}
