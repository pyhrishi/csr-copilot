"use client";

import { useState } from "react";
import { Check, GitCommitHorizontal, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { roleLabel } from "@/lib/roles";
import type { Section, Tlf } from "@/lib/types";
import { useAuditStore } from "@/store/audit";
import { useRoleStore } from "@/store/role";

interface TlfMappingTableProps {
  tlfs: readonly Tlf[];
  sections: readonly Section[];
}

// Default mapping per section in sections.json
const DEFAULT_MAPPINGS: Record<string, string> = {
  "14.1.1": "10.1",
  "14.1.2": "10.1",
  "14.3.1.1": "12.2",
  "14.3.1.2": "12.2",
  "14.2.1": "11.4",
};

export function TlfMappingTable({ tlfs, sections }: TlfMappingTableProps) {
  const [mappings, setMappings] = useState<Record<string, string>>(DEFAULT_MAPPINGS);
  const appendAudit = useAuditStore((state) => state.append);
  const role = useRoleStore((state) => state.role);

  const handleOverride = (tlfId: string, newSectionId: string) => {
    const oldSectionId = mappings[tlfId] ?? DEFAULT_MAPPINGS[tlfId] ?? "none";
    if (oldSectionId === newSectionId) return;

    setMappings((prev) => ({ ...prev, [tlfId]: newSectionId }));

    const actor = roleLabel(role);
    const targetSection = sections.find((s) => s.id === newSectionId);
    const sectionTitle = targetSection ? `${targetSection.id} (${targetSection.title})` : newSectionId;

    appendAudit({
      actor: `${actor} (${role})`,
      role,
      action: "edit",
      objectId: tlfId,
      detail: `TLF ${tlfId} remapped from section ${oldSectionId} to section ${sectionTitle} (manual override)`,
    });

    toast.success("TLF Mapping Updated", {
      description: `Table ${tlfId} remapped to Section ${sectionTitle}. Event logged to audit trail.`,
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="label text-teal flex items-center gap-1.5">
          <GitCommitHorizontal className="size-4" aria-hidden="true" />
          <span>TLF-to-Section Mapping</span>
        </h3>
        <span className="text-xs text-subtle flex items-center gap-1">
          <SlidersHorizontal className="size-3" aria-hidden="true" />
          Overrides log an immutable audit event
        </span>
      </div>

      <div className="rounded-xl border border-line bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-paper-2 hover:bg-paper-2 border-b border-line">
              <TableHead className="w-[110px] font-bold text-ink">TLF Number</TableHead>
              <TableHead className="min-w-[240px] font-bold text-ink">Table Title</TableHead>
              <TableHead className="w-[180px] font-bold text-ink">Default Section</TableHead>
              <TableHead className="min-w-[240px] font-bold text-ink">Target Section (Override)</TableHead>
              <TableHead className="w-[120px] font-bold text-ink">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tlfs.map((tlf) => {
              const defaultSectionId = DEFAULT_MAPPINGS[tlf.id] ?? "none";
              const defaultSection = sections.find((s) => s.id === defaultSectionId);
              const currentSectionId = mappings[tlf.id] ?? defaultSectionId;
              const isOverridden = currentSectionId !== defaultSectionId;

              return (
                <TableRow key={tlf.id} className="border-b border-line/70 hover:bg-paper/60">
                  {/* Table ID */}
                  <TableCell className="font-bold tabular text-ink">
                    Table {tlf.id}
                  </TableCell>

                  {/* Table Title */}
                  <TableCell className="text-sm font-medium text-ink">
                    {tlf.title}
                  </TableCell>

                  {/* Default Section */}
                  <TableCell className="text-xs text-subtle font-medium">
                    {defaultSection ? `${defaultSection.id} · ${defaultSection.title}` : "Unmapped"}
                  </TableCell>

                  {/* Override Select */}
                  <TableCell>
                    <div className="max-w-xs">
                      <Select
                        value={currentSectionId}
                        onValueChange={(val) => {
                          if (val) handleOverride(tlf.id, val);
                        }}
                      >
                        <SelectTrigger
                          aria-label={`Override mapping for Table ${tlf.id}`}
                          className={`h-8 text-xs font-medium ${
                            isOverridden
                              ? "border-amber bg-amber-tint/30 text-amber"
                              : "border-line bg-card"
                          }`}
                        >
                          <SelectValue placeholder="Select section" />
                        </SelectTrigger>
                        <SelectContent>
                          {sections.map((s) => (
                            <SelectItem key={s.id} value={s.id} className="text-xs">
                              {s.id} · {s.title} ({s.release})
                            </SelectItem>
                          ))}
                          <SelectItem value="none" className="text-xs text-subtle">
                            None (Supplemental only)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    {isOverridden ? (
                      <span className="inline-flex items-center gap-1 rounded-[6px] border border-amber/30 bg-amber-tint px-2 py-0.5 text-xs font-semibold text-amber tabular">
                        <SlidersHorizontal className="size-3 shrink-0" aria-hidden="true" />
                        <span>Overridden</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-[6px] border border-teal/30 bg-teal-tint px-2 py-0.5 text-xs font-semibold text-teal tabular">
                        <Check className="size-3 shrink-0" aria-hidden="true" />
                        <span>Default</span>
                      </span>
                    )}
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
