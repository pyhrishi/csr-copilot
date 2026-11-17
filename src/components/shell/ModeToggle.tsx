"use client";

import { useEffect } from "react";
import { FlaskConical, Lock, Sparkles } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { LIVE_MODE_AVAILABLE, useModeStore } from "@/store";

const LIVE_UNAVAILABLE_REASON =
  "Live AI mode requires an API key or local model (e.g. GROQ_API_KEY for free Llama 3.3, OPENROUTER_API_KEY, or local Ollama).";

/** Simulated / Live AI switch. Enabled when server reports an open-source model or key is configured. */
export function ModeToggle() {
  const mode = useModeStore((s) => s.mode);
  const setMode = useModeStore((s) => s.setMode);
  const liveAvailable = useModeStore((s) => s.liveAvailable);
  const liveModel = useModeStore((s) => s.liveModel);
  const checkLiveStatus = useModeStore((s) => s.checkLiveStatus);

  useEffect(() => {
    checkLiveStatus();
  }, [checkLiveStatus]);

  const isAvailable = liveAvailable || LIVE_MODE_AVAILABLE;

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
                aria-disabled={!isAvailable}
                aria-describedby={isAvailable ? undefined : "live-mode-reason"}
                onClick={() => isAvailable && setMode("live")}
                className={
                  base +
                  (mode === "live"
                    ? " bg-card text-teal shadow-xs"
                    : isAvailable
                      ? " text-subtle hover:text-ink"
                      : " cursor-not-allowed text-subtle opacity-60")
                }
              />
            }
          >
            {isAvailable ? (
              <Sparkles aria-hidden className="size-4" />
            ) : (
              <Lock aria-hidden className="size-4" />
            )}
            Live
          </TooltipTrigger>
          {!isAvailable ? (
            <TooltipContent>{LIVE_UNAVAILABLE_REASON}</TooltipContent>
          ) : (
            <TooltipContent>
              Live AI mode active ({liveModel || "open-source Llama 3.3"})
            </TooltipContent>
          )}
        </Tooltip>
        {!isAvailable && (
          <span id="live-mode-reason" className="sr-only">
            {LIVE_UNAVAILABLE_REASON}
          </span>
        )}
      </div>
    </div>
  );
}
