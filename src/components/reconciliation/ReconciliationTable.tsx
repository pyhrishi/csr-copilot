"use client";

import * as React from "react";
import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ExternalLink,
  FileSpreadsheet,
  Play,
  RotateCw,
} from "lucide-react";
import { toast } from "sonner";

import { MatchStatus, NumberChip, SourceDrawer } from "@/components/trust";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Fact, Section, Tlf } from "@/lib/types";
import type { ReconciliationRow, ReconciliationSummary } from "@/lib/reconcile";

export interface ReconciliationTableProps {
  section: Section;
  rows: readonly ReconciliationRow[];
  summary: ReconciliationSummary;
  facts: readonly Fact[];
  tlfs: readonly Tlf[];
}

export function ReconciliationTable({
  section,
  rows,
  summary,
  facts,
  tlfs,
}: ReconciliationTableProps) {
  // SourceDrawer state
  const [selectedFactId, setSelectedFactId] = useState<string | null>(null);

  // Map of facts for quick lookup
  const factsMap = useMemo(() => new Map(facts.map((f) => [f.id, f])), [facts]);

  // Map of sentences by id
  const sentencesMap = useMemo(
    () => new Map(section.sentences.map((s) => [s.id, s.text])),
    [section.sentences],
  );

  // Active Fact & TLF for SourceDrawer
  const selectedFact = selectedFactId ? factsMap.get(selectedFactId) : undefined;
  const activeTlf = selectedFact ? tlfs.find((t) => t.id === selectedFact.tlf) : undefined;

  // Animated row-by-row reconciliation state
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCount, setScannedCount] = useState<number>(rows.length);

  const runReconciliation = useCallback(() => {
    if (rows.length === 0) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setScannedCount(rows.length);
      setIsScanning(false);
      toast.success("Reconciliation Pass Complete", {
        description: `${summary.matched} of ${summary.total} numbers verified against source TLFs (reduced motion enabled).`,
      });
      return;
    }

    // Run animated row-by-row scan
    setIsScanning(true);
    setScannedCount(0);

    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setScannedCount(current);

      if (current >= rows.length) {
        clearInterval(interval);
        setIsScanning(false);
        toast.success("Reconciliation Pass Complete", {
          description: `${summary.matched} of ${summary.total} numbers verified against source TLF cells.`,
        });
      }
    }, 60);
  }, [rows.length, summary.matched, summary.total]);

  // Strip slot templates like {F:...} from preview text for cleaner sentence excerpt
  const formatSentencePreview = (rawText: string) => {
    return rawText
      .replace(/\{F:[^}]+\}/g, "...")
      .replace(/\{P:[^}]+\}/g, "...")
      .trim();
  };

  return (
    <div className="space-y-4">
      {/* Table Controls & Run Reconciliation button */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-paper-2/50 border border-line p-3 rounded-lg text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-ink">Reconciliation Status:</span>
          <span className="tabular text-teal font-medium flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-teal" aria-hidden="true" />
            <span>
              {scannedCount} of {rows.length} verified
            </span>
          </span>
          {isScanning && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal animate-pulse">
              <RotateCw className="size-3 animate-spin" aria-hidden="true" />
              <span>Scanning row {scannedCount + 1}...</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={runReconciliation}
            disabled={isScanning || rows.length === 0}
            variant="outline"
            size="sm"
            className="text-xs h-8 px-3 font-semibold border-teal/40 text-teal hover:bg-teal-tint bg-card"
          >
            {isScanning ? (
              <>
                <RotateCw className="size-3.5 mr-1.5 animate-spin" aria-hidden="true" />
                <span>Reconciling...</span>
              </>
            ) : (
              <>
                <Play className="size-3.5 mr-1.5 fill-teal text-teal" aria-hidden="true" />
                <span>Run reconciliation</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Reconciliation Table */}
      <div className="rounded-lg border border-line bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-paper-2/60 hover:bg-paper-2/60">
              <TableHead className="w-[80px] text-xs font-bold text-ink">#</TableHead>
              <TableHead className="min-w-[200px] text-xs font-bold text-ink">
                Sentence (ICH E3)
              </TableHead>
              <TableHead className="w-[120px] text-xs font-bold text-ink">
                Rendered Value
              </TableHead>
              <TableHead className="w-[150px] text-xs font-bold text-ink">
                Fact ID
              </TableHead>
              <TableHead className="min-w-[180px] text-xs font-bold text-ink">
                Source TLF & Cell
              </TableHead>
              <TableHead className="w-[130px] text-xs font-bold text-ink">
                Source Value
              </TableHead>
              <TableHead className="w-[130px] text-xs font-bold text-ink">
                Match Status
              </TableHead>
              <TableHead className="w-[70px] text-right text-xs font-bold text-ink">
                Source
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-sm text-subtle italic"
                >
                  No numbers mapped or found for Section {section.id}.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, idx) => {
                const fact = factsMap.get(row.factId);
                const rawSentence = sentencesMap.get(row.sentenceId) ?? "";
                const preview = formatSentencePreview(rawSentence);

                const isRowScanned = idx < scannedCount;
                const isCurrentActive = isScanning && idx === scannedCount;

                return (
                  <TableRow
                    key={`${row.sentenceId}-${row.factId}-${idx}`}
                    className={`transition-colors ${
                      isCurrentActive
                        ? "bg-teal-tint/50 ring-1 ring-inset ring-teal"
                        : isRowScanned
                          ? "hover:bg-paper-2/40"
                          : "opacity-40 hover:opacity-100"
                    }`}
                  >
                    {/* Index */}
                    <TableCell className="font-mono text-xs text-subtle tabular">
                      {idx + 1}
                    </TableCell>

                    {/* Sentence Truncated & Linked to S3 */}
                    <TableCell className="text-xs">
                      <div className="flex flex-col gap-0.5">
                        <Link
                          href={`/sections/${section.id}#sentence-${row.sentenceId}`}
                          className="font-mono text-[11px] font-semibold text-teal hover:underline inline-flex items-center gap-1"
                          title={`Jump to sentence ${row.sentenceId} in Section Workspace`}
                        >
                          <span>{row.sentenceId}</span>
                          <ExternalLink className="size-2.5 opacity-70" aria-hidden="true" />
                        </Link>
                        <span
                          className="text-subtle line-clamp-1 max-w-[280px]"
                          title={rawSentence}
                        >
                          {preview || rawSentence}
                        </span>
                      </div>
                    </TableCell>

                    {/* Rendered Value as NumberChip */}
                    <TableCell>
                      <NumberChip
                        factId={row.factId}
                        value={row.renderedValue}
                        fact={fact}
                        onClick={(id) => setSelectedFactId(id)}
                      />
                    </TableCell>

                    {/* Fact ID */}
                    <TableCell>
                      <span className="font-mono text-[11px] text-subtle bg-paper-2 px-1.5 py-0.5 rounded border border-line">
                        {row.factId}
                      </span>
                    </TableCell>

                    {/* Source TLF & Cell */}
                    <TableCell className="text-xs">
                      {row.tlf ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-ink">
                            Table {row.tlf}
                          </span>
                          <span className="text-[11px] text-subtle">
                            {row.cell
                              ? `Row ${row.cell.row + 1}, Col ${row.cell.col + 1}`
                              : "Cell unmapped"}
                            {row.columnLabel ? ` (${row.columnLabel})` : ""}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted italic">No TLF linked</span>
                      )}
                    </TableCell>

                    {/* Source Value */}
                    <TableCell className="text-xs font-mono font-medium text-ink tabular">
                      <div className="flex items-center gap-1.5">
                        <span>{row.sourceDisplay ?? "—"}</span>
                        {row.tlfVersion && (
                          <span className="text-[10px] font-sans px-1 rounded bg-paper-2 text-subtle border border-line">
                            v{row.tlfVersion}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Match Status */}
                    <TableCell>
                      <MatchStatus
                        matched={row.matched}
                        expected={row.expectedValue}
                        actual={row.renderedValue}
                      />
                    </TableCell>

                    {/* Inspect SourceDrawer Button */}
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedFactId(row.factId)}
                        className="h-7 w-7 p-0 text-subtle hover:text-ink hover:bg-paper-2"
                        title="View cell in Source Drawer"
                      >
                        <FileSpreadsheet className="size-3.5" aria-hidden="true" />
                        <span className="sr-only">Inspect source table cell</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Source Drawer for selected cell inspection */}
      {activeTlf && selectedFact && (
        <SourceDrawer
          open={Boolean(selectedFactId)}
          onOpenChange={(open) => !open && setSelectedFactId(null)}
          tlf={activeTlf}
          highlightFactId={selectedFact.id}
          highlightCell={selectedFact.cell}
        />
      )}
    </div>
  );
}
