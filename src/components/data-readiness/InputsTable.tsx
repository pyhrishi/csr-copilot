"use client";

import { useState } from "react";
import { Check, CheckCircle2, Copy, FileText } from "lucide-react";
import { toast } from "sonner";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { InputSource } from "@/lib/data/inputs";

interface InputsTableProps {
  inputs: readonly InputSource[];
}

export function InputsTable({ inputs }: InputsTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyHash = (id: string, hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedId(id);
    toast.success("SHA-256 hash copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="label text-teal flex items-center gap-1.5">
          <FileText className="size-4" aria-hidden="true" />
          <span>Ingested Study Inputs</span>
        </h3>
        <span className="text-xs text-subtle">
          {inputs.length} of {inputs.length} inputs parsed · Deterministic SHA-256
        </span>
      </div>

      <div className="rounded-xl border border-line bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-paper-2 hover:bg-paper-2 border-b border-line">
              <TableHead className="min-w-[200px] font-bold text-ink">Source Input</TableHead>
              <TableHead className="w-[140px] font-bold text-ink">Category</TableHead>
              <TableHead className="w-[100px] font-bold text-ink">Format</TableHead>
              <TableHead className="w-[90px] font-bold text-ink">Version</TableHead>
              <TableHead className="min-w-[260px] font-bold text-ink">SHA-256 Hash</TableHead>
              <TableHead className="w-[130px] font-bold text-ink">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inputs.map((input) => {
              const isCopied = copiedId === input.id;

              return (
                <TableRow key={input.id} className="border-b border-line/70 hover:bg-paper/60">
                  {/* Name & Details */}
                  <TableCell>
                    <div className="font-semibold text-ink text-sm">{input.name}</div>
                    <div className="text-xs text-subtle mt-0.5">{input.details}</div>
                  </TableCell>

                  {/* Category */}
                  <TableCell className="text-xs font-medium text-body">
                    {input.category}
                  </TableCell>

                  {/* Format */}
                  <TableCell>
                    <span className="inline-flex rounded-md bg-paper-2 px-2 py-0.5 text-xs font-semibold tabular text-subtle border border-line">
                      {input.format}
                    </span>
                  </TableCell>

                  {/* Version */}
                  <TableCell className="text-xs font-bold tabular text-ink">
                    {input.version}
                  </TableCell>

                  {/* SHA-256 Hash */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code
                        className="font-mono text-xs text-subtle bg-paper-2/70 px-2 py-0.5 rounded border border-line/60 truncate max-w-[220px]"
                        title={input.sha256}
                      >
                        {input.sha256.slice(0, 16)}...{input.sha256.slice(-8)}
                      </code>
                      <button
                        type="button"
                        onClick={() => handleCopyHash(input.id, input.sha256)}
                        className="rounded p-1 text-subtle hover:text-ink hover:bg-paper-2 transition-colors"
                        title="Copy full SHA-256 hash"
                        aria-label={`Copy SHA-256 hash for ${input.name}`}
                      >
                        {isCopied ? (
                          <Check className="size-3.5 text-teal" aria-hidden="true" />
                        ) : (
                          <Copy className="size-3.5" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </TableCell>

                  {/* Status (Icon + Word + Colour) */}
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 rounded-[6px] border border-teal/30 bg-teal-tint px-2 py-0.5 text-xs font-semibold text-teal tabular">
                      <CheckCircle2 className="size-3.5 shrink-0" aria-hidden="true" />
                      <span>Parsed</span>
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
