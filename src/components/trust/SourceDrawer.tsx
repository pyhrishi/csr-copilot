"use client";

import { useState } from "react";
import { Check, Copy, FileSpreadsheet, Hash, Layers } from "lucide-react";
import { toast } from "sonner";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Tlf } from "@/lib/types";

interface SourceDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tlf?: Tlf;
  highlightFactId?: string;
  highlightCell?: { row: number; col: number };
  tlfHash?: string;
}

export function SourceDrawer({
  open,
  onOpenChange,
  tlf,
  highlightFactId,
  highlightCell,
  tlfHash = "8d3e21a0f9bc4892c571e06fa9d8b13c72e519aa0182fc6e7db29c8e14620f3a",
}: SourceDrawerProps) {
  const [copied, setCopied] = useState(false);

  if (!tlf) return null;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(tlfHash);
    setCopied(true);
    toast.success("TLF SHA-256 hash copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[560px] sm:max-w-[560px] p-0 flex flex-col h-full bg-card border-l border-line shadow-2xl"
      >
        {/* Drawer Header */}
        <SheetHeader className="p-6 pb-4 border-b border-line bg-paper-2/40">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-ink px-2 py-0.5 text-xs font-bold text-teal-light tabular">
              Table {tlf.id}
            </span>
            <span className="rounded-md bg-teal-tint px-2 py-0.5 text-xs font-semibold text-teal border border-teal/20">
              v{tlf.version}
            </span>
            <span className="text-xs text-subtle font-medium">
              {tlf.population}
            </span>
          </div>

          <SheetTitle className="font-heading text-xl font-semibold text-ink leading-tight mt-1.5">
            Table {tlf.id} · {tlf.title}
          </SheetTitle>

          <SheetDescription className="sr-only">
            Source TLF viewer displaying Table {tlf.id} with cited cell highlighted.
          </SheetDescription>

          {/* Hash & Metadata */}
          <div className="mt-3 flex items-center justify-between pt-2 border-t border-line/60 text-xs">
            <div className="flex items-center gap-1.5 text-subtle">
              <Hash className="size-3.5" aria-hidden="true" />
              <span className="font-mono text-[11px] text-body">
                {tlfHash.slice(0, 12)}...{tlfHash.slice(-6)}
              </span>
              <button
                type="button"
                onClick={handleCopyHash}
                className="text-subtle hover:text-ink transition-colors p-0.5"
                title="Copy SHA-256 hash"
                aria-label="Copy SHA-256 hash"
              >
                {copied ? (
                  <Check className="size-3 text-teal" aria-hidden="true" />
                ) : (
                  <Copy className="size-3" aria-hidden="true" />
                )}
              </button>
            </div>
            {highlightFactId && (
              <span className="text-[11px] text-teal font-semibold flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-teal" aria-hidden="true" />
                Cited cell highlighted
              </span>
            )}
          </div>
        </SheetHeader>

        {/* Scrollable Table Canvas */}
        <div className="flex-1 overflow-auto p-6">
          <div className="rounded-lg border border-line bg-card overflow-hidden shadow-xs">
            <Table>
              <TableHeader>
                <TableRow className="bg-paper-2 hover:bg-paper-2 border-b border-line">
                  <TableHead className="font-bold text-ink min-w-[180px] text-xs">
                    Parameter / Preferred Term
                  </TableHead>
                  {tlf.columns.map((col, idx) => (
                    <TableHead
                      key={idx}
                      className="font-bold text-ink text-right text-xs whitespace-normal"
                    >
                      {col}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {tlf.rows.map((row, rowIdx) => {
                  return (
                    <TableRow
                      key={row.key}
                      className="border-b border-line/60 hover:bg-paper/50"
                    >
                      {/* Row Label */}
                      <TableCell className="text-xs font-medium text-ink py-2">
                        {row.label}
                      </TableCell>

                      {/* Numeric cells */}
                      {row.cells.map((cell, colIdx) => {
                        const isMatchByFactId =
                          Boolean(highlightFactId) && cell.factId === highlightFactId;
                        const isMatchByCell =
                          Boolean(highlightCell) &&
                          highlightCell?.row === rowIdx &&
                          highlightCell?.col === colIdx;
                        const isHighlighted = isMatchByFactId || isMatchByCell;

                        return (
                          <TableCell
                            key={colIdx}
                            className={`text-right text-xs tabular font-medium py-2 transition-all ${
                              isHighlighted
                                ? "bg-teal-tint font-bold text-teal ring-2 ring-teal ring-inset rounded-xs"
                                : "text-body"
                            }`}
                            title={
                              isHighlighted
                                ? `Cited cell (${cell.factId}): ${cell.display}`
                                : cell.factId
                            }
                          >
                            {cell.display}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Footnotes */}
          {tlf.footnotes && tlf.footnotes.length > 0 && (
            <div className="mt-4 p-3 rounded-lg border border-line/60 bg-paper-2/40 space-y-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-teal">
                Footnotes
              </div>
              <ul className="text-xs text-subtle space-y-0.5 list-disc list-inside">
                {tlf.footnotes.map((fn, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {fn}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-line bg-paper-2/40 flex items-center justify-between text-xs text-subtle">
          <div className="flex items-center gap-1.5">
            <FileSpreadsheet className="size-3.5 text-teal" aria-hidden="true" />
            <span>Structured fact store record</span>
          </div>
          <div className="flex items-center gap-1.5 text-ink font-semibold">
            <Layers className="size-3.5 text-teal" aria-hidden="true" />
            <span>{tlf.rows.length} rows</span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
