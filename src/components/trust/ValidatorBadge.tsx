import * as React from "react";
import { AlertOctagon, AlertTriangle, Info } from "lucide-react";

import { cn } from "@/lib/utils";

export interface ValidatorBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  severity: "critical" | "major" | "minor";
  ruleId?: string;
  message?: string;
}

const SEVERITY_CONFIG = {
  critical: {
    label: "Critical",
    icon: AlertOctagon,
    badgeClass: "bg-critical text-white border-critical",
    tintClass: "bg-critical-tint text-critical border-critical/30",
    iconClass: "text-critical",
  },
  major: {
    label: "Major",
    icon: AlertTriangle,
    badgeClass: "bg-amber text-white border-amber",
    tintClass: "bg-amber-tint text-amber border-amber/30",
    iconClass: "text-amber",
  },
  minor: {
    label: "Minor",
    icon: Info,
    badgeClass: "bg-paper-2 text-subtle border-line",
    tintClass: "bg-paper-2 text-subtle border-line",
    iconClass: "text-muted",
  },
} as const;

export function ValidatorBadge({
  severity,
  ruleId,
  message,
  className,
  ...props
}: ValidatorBadgeProps) {
  const config = SEVERITY_CONFIG[severity] ?? SEVERITY_CONFIG.minor;
  const Icon = config.icon;

  return (
    <span
      data-severity={severity}
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold border tabular",
        config.tintClass,
        className,
      )}
      {...props}
    >
      <Icon className={cn("size-3.5 shrink-0", config.iconClass)} aria-hidden="true" />
      <span className="uppercase tracking-wider text-[10px] font-bold">{config.label}</span>
      {ruleId && (
        <>
          <span className="text-line mx-0.5">·</span>
          <span className="font-mono text-[11px] font-medium text-ink">{ruleId}</span>
        </>
      )}
      {message && <span className="sr-only">: {message}</span>}
    </span>
  );
}
