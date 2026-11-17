import type { KeyboardEvent } from "react";

interface CitationMarkerProps {
  sourceId: string;
  onClick?: (sourceId: string) => void;
  className?: string;
}

/** Formats a source ID (like "14.3.1.1" or "14.3.1.1.any_teae.velo") into a compact tag like "T14.3.1.1". */
export function formatCitationLabel(sourceId: string): string {
  // If it's a fact id like "14.3.1.1.any_teae.velo" or table id like "14.3.1.1"
  const match = sourceId.match(/^(1[46]\.\d+(\.\d+)*)/);
  const tableId = match ? match[1] : sourceId;

  return tableId.startsWith("14.") || tableId.startsWith("16.")
    ? `T${tableId}`
    : tableId;
}

/**
 * CitationMarker: a small superscript tag at the end of a sentence per docs/design-system.md.
 * - e.g. T14.3.1.1
 * - Keyboard focusable
 * - Click opens SourceDrawer
 */
export function CitationMarker({
  sourceId,
  onClick,
  className = "",
}: CitationMarkerProps) {
  const label = formatCitationLabel(sourceId);

  const handleClick = () => {
    onClick?.(sourceId);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLSpanElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.(sourceId);
    }
  };

  return (
    <span
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      title={`Cited source: ${sourceId} (Click to open in Source Drawer)`}
      aria-label={`Citation ${label}, click to open source`}
      className={`inline-flex items-center align-super text-[10px] font-semibold text-teal bg-teal-tint/80 hover:bg-teal-tint border border-teal/30 px-1 py-0.2 rounded-xs select-none tabular cursor-pointer ml-1 transition-colors focus-visible:outline-2 focus-visible:outline-teal ${className}`}
    >
      {label}
    </span>
  );
}
