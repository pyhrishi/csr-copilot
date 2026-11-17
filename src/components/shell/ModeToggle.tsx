"use client";

import { FlaskConical, Lock, Sparkles } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { LIVE_MODE_AVAILABLE, useModeStore } from "@/store";

const LIVE_UNAVAILABLE_REASON = "Live AI mode arrives in M8 and needs an API key.";

/** Simulated / Live AI switch. Live stays disabled (with its reason on hover and focus) until M8. */
export function ModeToggle() {
  const mode = useModeStore((s) => s.mode);
  const setMode = useModeStore((s) => s.setMode);

  const base =
    "inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-sm font-semibold transition-colors";

  return (
    <div className="flex items-center gap-2">
      <span id="mode-label" className="label">
        AI mode
      </span>
      <div
        role="radiogroup"
        aria-labelledby="mode-label"
        className="inline-flex items-center gap-0.5 rounded-lg border border-line bg-paper-2 p-0.5"
      >
        <button
          type="button"
          role="radio"
          aria-checked={mode === "simulated"}
          onClick={() => setMode("simulated")}
          className={
            base +
            (mode === "simulated" ? " bg-card text-teal shadow-xs" : " text-subtle hover:text-ink")
          }
        >
          <FlaskConical aria-hidden className="size-4" />
          Simulated
        </button>
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                role="radio"
                aria-checked={mode === "live"}
                aria-disabled={!LIVE_MODE_AVAILABLE}
                aria-describedby={LIVE_MODE_AVAILABLE ? undefined : "live-mode-reason"}
                onClick={() => setMode("live")}
                className={
                  base +
                  (mode === "live"
                    ? " bg-card text-teal shadow-xs"
                    : LIVE_MODE_AVAILABLE
                      ? " text-subtle hover:text-ink"
                      : " cursor-not-allowed text-subtle")
                }
              />
            }
          >
            {LIVE_MODE_AVAILABLE ? (
              <Sparkles aria-hidden className="size-4" />
            ) : (
              <Lock aria-hidden className="size-4" />
            )}
            Live
          </TooltipTrigger>
          {!LIVE_MODE_AVAILABLE && <TooltipContent>{LIVE_UNAVAILABLE_REASON}</TooltipContent>}
        </Tooltip>
        {!LIVE_MODE_AVAILABLE && (
          <span id="live-mode-reason" className="sr-only">
            {LIVE_UNAVAILABLE_REASON}
          </span>
        )}
      </div>
    </div>
  );
}
