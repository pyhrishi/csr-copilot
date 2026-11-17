import type { ComponentPropsWithoutRef } from "react";
import { Bot, Cpu, Database, Lightbulb, Lock } from "lucide-react";

import { cn } from "@/lib/utils";

export type AutonomyLevel = "L0" | "L1" | "L2" | "L3" | "locked";

interface AutonomyPillProps extends ComponentPropsWithoutRef<"span"> {
  level: AutonomyLevel;
  /** When true, shows an abbreviated label (e.g., "L2" instead of "L2 · Draft"). */
  short?: boolean;
}

const CONFIG: Record<
  AutonomyLevel,
  {
    code: string;
    label: string;
    description: string;
    className: string;
    icon: typeof Bot;
  }
> = {
  L0: {
    code: "L0",
    label: "L0 · Retrieve",
    description: "Fact retrieval only; human drafting",
    className: "bg-paper-2 text-subtle border-line",
    icon: Database,
  },
  L1: {
    code: "L1",
    label: "L1 · Suggest",
    description: "AI suggests edits and phrasing",
    className: "bg-paper-2 text-body border-line",
    icon: Lightbulb,
  },
  L2: {
    code: "L2",
    label: "L2 · Draft",
    description: "AI drafts from template with slot filling",
    className: "bg-teal-tint text-teal border-teal/30",
    icon: Bot,
  },
  L3: {
    code: "L3",
    label: "L3 · Assemble",
    description: "Autonomous batch assembly with QC gates",
    className: "bg-teal-tint text-teal border-teal/40 font-bold",
    icon: Cpu,
  },
  locked: {
    code: "Locked",
    label: "Locked",
    description: "Autonomy locked to human authoring",
    className: "bg-paper-2 text-subtle border-line",
    icon: Lock,
  },
};

/**
 * AutonomyPill: renders L0–L3 or locked states per docs/design-system.md.
 * Every status has icon + word + colour.
 */
export function AutonomyPill({
  level,
  short = false,
  className,
  ...props
}: AutonomyPillProps) {
  const cfg = CONFIG[level] ?? CONFIG.locked;
  const Icon = cfg.icon;
  const text = short ? cfg.code : cfg.label;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tabular",
        cfg.className,
        className,
      )}
      title={cfg.description}
      {...props}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      <span>{text}</span>
    </span>
  );
}
