"use client";

import type { KeyboardEvent } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { PatientSource } from "@/lib/types";

interface PatientFieldChipProps {
  field: string;
  value: string;
  source: PatientSource;
  isHighlighted?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  className?: string;
}

/**
 * PatientFieldChip: renders a patient data token with deterministic provenance
 * styled with NumberChip aesthetics (tabular numbers, teal dotted underline, tooltip).
 */
export function PatientFieldChip({
  field,
  value,
  source,
  isHighlighted = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
  className = "",
}: PatientFieldChipProps) {
  const isNumeric = /\d/.test(value);

  const handleKeyDown = (e: KeyboardEvent<HTMLSpanElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.();
    }
  };

  const tooltipTitle =
    source.kind === "field"
      ? `Patient record · ${String(source.field)}`
      : `Patient timeline · Entry #${source.index + 1}`;

  const tooltipDescription =
    source.kind === "field"
      ? `Derived deterministically from patient record field "${String(source.field)}"`
      : `Quoted verbatim from clinical study day timeline entry #${source.index + 1}`;

  return (
    <Tooltip>
      <TooltipTrigger
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        aria-label={`Patient field ${field}: ${value}`}
        className={`inline cursor-pointer select-none font-medium px-1 py-0.5 rounded-xs transition-all duration-150 ${
          isNumeric ? "tabular" : ""
        } ${
          isHighlighted
            ? "bg-teal text-white ring-2 ring-teal shadow-xs font-semibold"
            : "text-teal-dark border-b-2 border-dotted border-teal hover:bg-teal-tint/90"
        } ${className}`}
      >
        {value}
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-xs space-y-1 bg-ink text-paper p-2.5 rounded-lg shadow-md border border-line/20">
        <div className="font-mono text-[11px] text-teal-light font-bold truncate">
          {tooltipTitle}
        </div>
        <div className="text-[11px] text-paper/90 leading-relaxed">
          {tooltipDescription}
        </div>
        <div className="text-[10px] text-teal-light pt-1 border-t border-white/10 mt-1">
          {source.kind === "timeline"
            ? "Click to highlight matching event on timeline"
            : "Click to highlight matching demographic field"}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
