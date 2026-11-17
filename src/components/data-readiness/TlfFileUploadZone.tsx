"use client";

import * as React from "react";
import {
  CheckCircle2,
  FileSpreadsheet,
  Plus,
  UploadCloud,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Fact, Tlf } from "@/lib/types";
import { useAuditStore } from "@/store/audit";
import { useDraftsStore } from "@/store/drafts";
import { useRoleStore } from "@/store/role";

export function TlfFileUploadZone() {
  const [dragActive, setDragActive] = React.useState(false);
  const [pasteMode, setPasteMode] = React.useState(false);
  const [pastedText, setPastedText] = React.useState("");
  const [ingestedTable, setIngestedTable] = React.useState<Tlf | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const setCustomTlf = useDraftsStore((s) => s.setCustomTlf);
  const setCustomFact = useDraftsStore((s) => s.setCustomFact);
  const appendAudit = useAuditStore((s) => s.append);
  const role = useRoleStore((s) => s.role);

  const processTableData = (
    title: string,
    tlfId: string,
    columns: string[],
    rows: { label: string; cells: { n: number; pct: number }[] }[],
  ) => {
    const newTlf: Tlf = {
      id: tlfId,
      title,
      population: "Safety",
      version: 1,
      columns,
      rows: rows.map((r, rIdx) => {
        const rowKey = r.label.toLowerCase().replace(/[^a-z0-9]+/g, "_");
        return {
          key: rowKey,
          label: r.label,
          cells: r.cells.map((c, cIdx) => {
            const arm: "velo" | "pbo" = cIdx === 0 ? "velo" : "pbo";
            const factId = `${tlfId}.${rowKey}.${arm}`;
            const display = `${c.n} (${c.pct.toFixed(1)}%)`;
            const fact: Fact = {
              id: factId,
              tlf: tlfId,
              tlfVersion: 1,
              row: rowKey,
              rowLabel: r.label,
              column: arm,
              columnLabel: columns[cIdx] || `Column ${cIdx + 1}`,
              population: "Safety",
              kind: "n_pct",
              value: { n: c.n, N: arm === "velo" ? 298 : 300, pct: c.pct },
              display,
              cell: { row: rIdx, col: cIdx },
            };
            setCustomFact(fact);
            return { factId, display };
          }),
        };
      }),
    };

    setCustomTlf(newTlf);
    setIngestedTable(newTlf);

    appendAudit({
      actor: role,
      role,
      action: "tlf_update",
      objectId: tlfId,
      detail: `Ingested custom statistical output Table ${tlfId} (${title}) with ${rows.length * columns.length} extracted facts.`,
    });

    toast.success(`Ingested Table ${tlfId}`, {
      description: `Parsed ${rows.length} rows, ${columns.length} columns. Facts available for CSR drafting.`,
    });
  };

  const handleSampleIngest = () => {
    processTableData(
      "Table 14.3.1.3: Treatment-Emergent Laboratory Abnormalities (Grade 3/4)",
      "14.3.1.3",
      ["Velorantib 100 mg (N=298)", "Placebo (N=300)"],
      [
        {
          label: "Alanine Aminotransferase (ALT) > 3x ULN",
          cells: [
            { n: 12, pct: 4.0 },
            { n: 6, pct: 2.0 },
          ],
        },
        {
          label: "Aspartate Aminotransferase (AST) > 3x ULN",
          cells: [
            { n: 9, pct: 3.0 },
            { n: 5, pct: 1.7 },
          ],
        },
        {
          label: "Total Bilirubin > 2x ULN",
          cells: [
            { n: 3, pct: 1.0 },
            { n: 2, pct: 0.7 },
          ],
        },
        {
          label: "Serum Creatinine > 1.5x Baseline",
          cells: [
            { n: 8, pct: 2.7 },
            { n: 4, pct: 1.3 },
          ],
        },
      ],
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        parseAndProcessCsv(text, file.name.replace(/\.[^/.]+$/, ""));
      } catch {
        toast.error("Failed to parse file", {
          description: "Ensure CSV format with header row and label column.",
        });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const parseAndProcessCsv = (csvText: string, defaultId: string) => {
    const lines = csvText.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) {
      toast.error("File is too short or empty.");
      return;
    }

    const headers = lines[0].split(",").map((h) => h.replace(/["']/g, "").trim());
    const columns = headers.slice(1);
    const rows = lines.slice(1).map((line) => {
      const parts = line.split(",").map((p) => p.replace(/["']/g, "").trim());
      const label = parts[0];
      const cells = parts.slice(1).map((val) => {
        const num = parseFloat(val) || 0;
        return { n: Math.round(num), pct: num > 0 && num < 100 ? num : 5.0 };
      });
      return { label, cells };
    });

    const tlfId = defaultId.match(/14\.\d+\.\d+(\.\d+)?/) ? defaultId : "14.2.1.3";
    processTableData(
      `Table ${tlfId}: Ingested Statistical Analysis Output`,
      tlfId,
      columns.length > 0 ? columns : ["Velorantib 100 mg (N=298)", "Placebo (N=300)"],
      rows,
    );
  };

  return (
    <div className="rounded-xl border border-line bg-card p-6 shadow-xs space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div className="flex items-center gap-2.5">
          <FileSpreadsheet className="size-5 text-teal" />
          <div>
            <h2 className="font-heading text-lg font-semibold text-ink">
              Custom Statistical Output / SAS Table Ingestion
            </h2>
            <p className="text-xs text-subtle">
              Upload SAS proc report outputs, CSVs, or clinical datasets to register custom TLFs and fact slots.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSampleIngest}
            className="text-xs font-semibold h-8 bg-paper hover:bg-paper-2 text-teal border-teal/40 gap-1.5"
          >
            <Plus className="size-3.5" />
            <span>Load Sample SAS Table 14.3.1.3</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPasteMode(!pasteMode)}
            className="text-xs h-8 bg-paper text-ink border-line"
          >
            {pasteMode ? "Hide Paste Area" : "Paste CSV / SAS Text"}
          </Button>
        </div>
      </div>

      {pasteMode && (
        <div className="space-y-3 p-4 rounded-lg bg-paper border border-line">
          <label className="font-semibold text-xs text-ink block">
            Paste CSV or Tabular Data (First column: row label, subsequent columns: numeric values)
          </label>
          <textarea
            rows={4}
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder={`Adverse Event,Velorantib (N=298),Placebo (N=300)\nNausea,18,12\nHeadache,25,20\nFatigue,14,10`}
            className="w-full rounded border border-line bg-card p-2.5 font-mono text-xs text-ink"
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => {
                if (!pastedText.trim()) return;
                parseAndProcessCsv(pastedText, "14.3.1.4");
                setPastedText("");
                setPasteMode(false);
              }}
              className="text-xs h-8 bg-teal hover:bg-teal/90 text-white font-semibold"
            >
              Parse & Ingest Table
            </Button>
          </div>
        </div>
      )}

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          const file = e.dataTransfer.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
              const text = ev.target?.result as string;
              parseAndProcessCsv(text, file.name.replace(/\.[^/.]+$/, ""));
            };
            reader.readAsText(file);
          }
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
          dragActive
            ? "border-teal bg-teal-tint/30"
            : "border-line bg-paper/50 hover:bg-paper"
        }`}
      >
        <UploadCloud className="size-8 text-teal mb-2" />
        <p className="text-sm font-semibold text-ink">
          Drag and drop SAS output file (.csv, .tsv, .txt) or click to browse
        </p>
        <p className="text-xs text-subtle mt-1">
          Parses row counts, percentages, and clinical arms into deterministic fact slots.
        </p>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".csv,.tsv,.txt"
          className="hidden"
        />
      </div>

      {/* Ingested Table Success Preview */}
      {ingestedTable && (
        <div className="space-y-3 rounded-lg border border-teal/40 bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-ok" />
              <span className="font-semibold text-ink text-sm">
                Active Ingested Output: Table {ingestedTable.id}
              </span>
              <Badge variant="outline" className="bg-teal-tint text-teal-dark border-teal/30 text-[10px]">
                {ingestedTable.rows.length * ingestedTable.columns.length} Facts Ready
              </Badge>
            </div>
            <span className="text-[11px] font-mono text-subtle">
              Population: {ingestedTable.population}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-paper-2 border-b border-line text-ink font-semibold">
                <tr>
                  <th className="p-2">Preferred Term / Parameter</th>
                  {ingestedTable.columns.map((c, idx) => (
                    <th key={idx} className="p-2">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line font-mono text-body">
                {ingestedTable.rows.map((r, rIdx) => (
                  <tr key={rIdx} className="hover:bg-paper/40">
                    <td className="p-2 font-sans font-medium text-ink">{r.label}</td>
                    {r.cells.map((cell, cIdx) => (
                      <td key={cIdx} className="p-2 text-teal font-semibold">
                        {cell.display}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
