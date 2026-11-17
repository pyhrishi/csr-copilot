import type { ComponentPropsWithoutRef } from "react";
import { Check, X } from "lucide-react";

import { cn } from "@/lib/utils";

interface MatchStatusProps extends ComponentPropsWithoutRef<"span"> {
  matched: boolean;
  expected?: string | null;
  actual?: string | null;
  /** When true, omits the expected/actual comparison subtext. */
  compact?: boolean;
}

/**
 * MatchStatus: renders reconciliation result per docs/design-system.md.
 * ✓ Matched (teal) or ✗ Mismatch (critical) with the expected and actual values.
 * Every status has icon + word + colour.
 */
export function MatchStatus({
  matched,
  expected,
  actual,
  compact = false,
  className,
  ...props
}: MatchStatusProps) {
  const Icon = matched ? Check : X;
  const label = matched ? "Matched" : "Mismatch";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[6px] border px-2 py-0.5 text-xs font-semibold tabular",
        matched
          ? "bg-teal-tint text-teal border-teal/30"
          : "bg-critical-tint text-critical border-critical/30",
        className,
      )}
      {...props}
    >
      <Icon className="size-3.5 shrink-0 stroke-[2.5]" aria-hidden="true" />
      <span>{label}</span>
      {!compact && !matched && expected && actual && (
        <span className="font-normal text-muted-foreground ml-1">
          (got {actual}, expected {expected})
        </span>
      )}
    </span>
  );
}
