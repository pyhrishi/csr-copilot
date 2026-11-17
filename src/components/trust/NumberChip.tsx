import type { KeyboardEvent } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Fact } from "@/lib/types";

interface NumberChipProps {
  factId: string;
  value: string;
  fact?: Fact;
  onClick?: (factId: string) => void;
  className?: string;
}

/**
 * NumberChip: renders a slot-filled clinical figure per docs/design-system.md.
 * - Tabular nums with teal dotted underline.
 * - Hover tooltip shows fact id, TLF, row/col labels, version.
 * - Click and keyboard (Enter/Space) opens SourceDrawer.
 * - Not editable as text.
 */
export function NumberChip({
  factId,
  value,
  fact,
  onClick,
  className = "",
}: NumberChipProps) {
  const handleClick = () => {
    onClick?.(factId);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLSpanElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.(factId);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={`Clinical number ${value}, source Table ${fact?.tlf ?? factId}`}
        className={`inline-block tabular cursor-pointer select-none font-semibold text-teal border-b-2 border-dotted border-teal px-0.5 rounded-xs transition-colors hover:bg-teal-tint/80 focus-visible:outline-2 focus-visible:outline-teal ${className}`}
      >
        {value}
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-xs space-y-1 bg-ink text-paper p-2.5 rounded-lg shadow-md border border-line/20">
        <div className="font-mono text-[11px] text-teal-light font-bold truncate">
          {factId}
        </div>
        {fact ? (
          <div className="space-y-0.5 text-paper/90 text-[11px]">
            <div>
              <span className="text-subtle text-paper/60">Source: </span>
              <strong>Table {fact.tlf}</strong> (v{fact.tlfVersion})
            </div>
            <div>
              <span className="text-paper/60">Row: </span>
              <span>{fact.rowLabel}</span>
            </div>
            <div>
              <span className="text-paper/60">Column: </span>
              <span>{fact.columnLabel}</span>
            </div>
            <div className="text-[10px] text-teal-light pt-1 border-t border-white/10 mt-1">
              Click to open Table {fact.tlf} cell in Source Drawer
            </div>
          </div>
        ) : (
          <div className="text-[11px] text-paper/70">
            Click to inspect source in Table {factId.split(".")[0]}
          </div>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
