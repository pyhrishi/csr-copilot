"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileText,
  Filter,
  Layers,
  RotateCcw,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { NarrativeTemplate } from "@/lib/data/seed-types";
import { rolePersona } from "@/lib/roles";
import type { Patient } from "@/lib/types";
import { useAuditStore, useNarrativesStore, useRoleStore } from "@/store";

interface NarrativesQueueViewProps {
  patients: Patient[];
  template: NarrativeTemplate;
}

export function NarrativesQueueView({ patients, template }: NarrativesQueueViewProps) {
  const role = useRoleStore((s) => s.role);
  const appendAudit = useAuditStore((s) => s.append);

  const drafts = useNarrativesStore((s) => s.drafts);
  const statuses = useNarrativesStore((s) => s.statuses);
  const isGeneratingBatch = useNarrativesStore((s) => s.isGeneratingBatch);
  const batchProgress = useNarrativesStore((s) => s.batchProgress);
  const generateAllReady = useNarrativesStore((s) => s.generateAllReady);
  const resetNarratives = useNarrativesStore((s) => s.reset);

  // Filters state
  const [armFilter, setArmFilter] = useState<string>("all");
  const [seriousnessFilter, setSeriousnessFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Compute live patient statuses merged with store state
  const patientsWithStatus = useMemo(() => {
    return patients.map((p) => {
      let currentStatus = statuses[p.id];
      if (!currentStatus) {
        currentStatus = p.status === "exception" ? "exception" : "ready";
      }
      return {
        ...p,
        liveStatus: currentStatus,
        hasDraft: Boolean(drafts[p.id]),
      };
    });
  }, [patients, statuses, drafts]);

  // Counts
  const counts = useMemo(() => {
    let ready = 0;
    let drafted = 0;
    let reviewed = 0;
    let returned = 0;
    let exceptions = 0;

    for (const p of patientsWithStatus) {
      if (p.liveStatus === "exception") exceptions++;
      else if (p.liveStatus === "ready") ready++;
      else if (p.liveStatus === "drafted") drafted++;
      else if (p.liveStatus === "reviewed") reviewed++;
      else if (p.liveStatus === "returned") returned++;
    }

    return { total: patients.length, ready, drafted, reviewed, returned, exceptions };
  }, [patientsWithStatus, patients.length]);

  // Filtered patients
  const filteredPatients = useMemo(() => {
    return patientsWithStatus.filter((p) => {
      if (armFilter !== "all" && p.arm !== armFilter) return false;
      if (seriousnessFilter !== "all" && p.seriousness !== seriousnessFilter) return false;
      if (statusFilter !== "all" && p.liveStatus !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesId = p.id.toLowerCase().includes(q);
        const matchesEvent = p.event.toLowerCase().includes(q);
        if (!matchesId && !matchesEvent) return false;
      }
      return true;
    });
  }, [patientsWithStatus, armFilter, seriousnessFilter, statusFilter, searchQuery]);

  const handleGenerateAll = async () => {
    const readyList = patients.filter((p) => {
      const s = statuses[p.id] ?? (p.status === "exception" ? "exception" : "ready");
      return s === "ready" && p.status !== "exception";
    });

    if (readyList.length === 0) {
      toast.info("No ready narratives left to draft.");
      return;
    }

    const { drafted, skipped } = await generateAllReady(patients, template);

    const persona = rolePersona(role);
    appendAudit({
      actor: persona.name,
      role,
      action: "generate",
      objectId: "14.3.3",
      detail: `Batch generated ${drafted} patient narratives; ${skipped} exceptions skipped with reasons`,
      versions: { template: "14.3.3-v1", model: "simulated-v1" },
    });

    toast.success(
      `Generated ${drafted} ready narratives in batch. ${skipped} exceptions skipped with logged reasons.`,
    );
  };

  const handleReset = () => {
    resetNarratives();
    toast.info("Narratives queue reset to initial state.");
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-serif text-ink tracking-tight">
              Patient Narratives Queue
            </h1>
            <Badge variant="outline" className="font-mono text-xs bg-paper-2 text-ink border-line">
              ICH E3 14.3.3
            </Badge>
          </div>
          <p className="text-sm text-subtle mt-1">
            Batch assembly and safety review of patient-level narratives across treatment arms.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs text-muted hover:text-ink h-8 gap-1"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset queue
          </Button>
        </div>
      </div>

      {/* KPI Readiness Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl bg-card border border-line shadow-xs">
          <div className="flex items-center justify-between text-muted text-xs font-semibold">
            <span>Total Patients</span>
            <Users className="h-4 w-4 text-teal" />
          </div>
          <div className="mt-2 text-2xl font-bold font-serif text-ink tabular">
            {counts.total}
          </div>
          <div className="text-[11px] text-subtle mt-0.5">7 Velorantib · 5 Placebo</div>
        </div>

        <div className="p-4 rounded-xl bg-card border border-line shadow-xs">
          <div className="flex items-center justify-between text-muted text-xs font-semibold">
            <span>Ready to Draft</span>
            <Sparkles className="h-4 w-4 text-teal" />
          </div>
          <div className="mt-2 text-2xl font-bold font-serif text-teal tabular">
            {counts.ready}
          </div>
          <div className="text-[11px] text-subtle mt-0.5">Deterministic slots mapped</div>
        </div>

        <div className="p-4 rounded-xl bg-card border border-line shadow-xs">
          <div className="flex items-center justify-between text-muted text-xs font-semibold">
            <span>Drafted</span>
            <FileText className="h-4 w-4 text-teal" />
          </div>
          <div className="mt-2 text-2xl font-bold font-serif text-ink tabular">
            {counts.drafted}
          </div>
          <div className="text-[11px] text-subtle mt-0.5">Awaiting safety review</div>
        </div>

        <div className="p-4 rounded-xl bg-card border border-line shadow-xs">
          <div className="flex items-center justify-between text-muted text-xs font-semibold">
            <span>Reviewed & Signed</span>
            <CheckCircle2 className="h-4 w-4 text-ok" />
          </div>
          <div className="mt-2 text-2xl font-bold font-serif text-ok tabular">
            {counts.reviewed}
          </div>
          <div className="text-[11px] text-subtle mt-0.5">Approved by Safety</div>
        </div>

        <div className="p-4 rounded-xl bg-card border border-critical/30 bg-critical-tint/30 shadow-xs">
          <div className="flex items-center justify-between text-critical text-xs font-semibold">
            <span>Data Exceptions</span>
            <AlertTriangle className="h-4 w-4 text-critical" />
          </div>
          <div className="mt-2 text-2xl font-bold font-serif text-critical tabular">
            {counts.exceptions}
          </div>
          <div className="text-[11px] text-critical/80 mt-0.5">Owner: Data Management</div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-card border border-line shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted shrink-0" />
            <span className="text-xs font-semibold text-ink">Filters:</span>
          </div>

          {/* Arm Filter */}
          <div className="w-36">
            <Select value={armFilter} onValueChange={(val) => setArmFilter(val ?? "all")}>
              <SelectTrigger className="h-8 text-xs bg-paper">
                <SelectValue placeholder="Treatment Arm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Arms</SelectItem>
                <SelectItem value="velo">Velorantib 20 mg</SelectItem>
                <SelectItem value="pbo">Placebo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Seriousness Filter */}
          <div className="w-36">
            <Select value={seriousnessFilter} onValueChange={(val) => setSeriousnessFilter(val ?? "all")}>
              <SelectTrigger className="h-8 text-xs bg-paper">
                <SelectValue placeholder="Seriousness" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Seriousness</SelectItem>
                <SelectItem value="Hospitalization">Hospitalization</SelectItem>
                <SelectItem value="Death">Death (Fatal)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="w-36">
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val ?? "all")}>
              <SelectTrigger className="h-8 text-xs bg-paper">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="drafted">Drafted</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
                <SelectItem value="exception">Exception</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px]">
          <Search className="h-3.5 w-3.5 text-muted absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient ID or event..."
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-line bg-paper focus:outline-teal focus:ring-1 focus:ring-teal"
          />
        </div>
      </div>

      {/* Patient Narratives Table */}
      <div className="rounded-xl border border-line bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-paper-2 text-ink uppercase tracking-wider font-semibold border-b border-line text-[11px]">
              <tr>
                <th className="py-3 px-4">Patient ID</th>
                <th className="py-3 px-4">Treatment Arm</th>
                <th className="py-3 px-4">Adverse Event (PT)</th>
                <th className="py-3 px-4">Seriousness</th>
                <th className="py-3 px-4">Study Day</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-body">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted">
                    No patients match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((p) => {
                  const isException = p.liveStatus === "exception";
                  const isDeath = p.outcome === "Fatal" || p.seriousness === "Death";

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-paper/50 transition-colors ${
                        isException ? "bg-critical-tint/15" : ""
                      }`}
                    >
                      {/* Patient ID */}
                      <td className="py-3 px-4 font-mono font-bold text-ink">
                        <Link
                          href={`/narratives/${p.id}`}
                          className="hover:text-teal hover:underline flex items-center gap-1.5"
                        >
                          {p.id}
                        </Link>
                      </td>

                      {/* Arm */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-xs text-[11px] font-medium ${
                            p.arm === "velo"
                              ? "bg-teal-tint text-teal-dark font-semibold"
                              : "bg-paper-2 text-ink"
                          }`}
                        >
                          {p.armLabel}
                        </span>
                      </td>

                      {/* Event */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-ink">{p.event}</div>
                        <div className="text-[11px] text-muted">Severity: {p.severity}</div>
                      </td>

                      {/* Seriousness */}
                      <td className="py-3 px-4">
                        {isDeath ? (
                          <Badge className="bg-critical text-white font-semibold text-[10px]">
                            Fatal (Death)
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] bg-paper-2 text-ink">
                            {p.seriousness}
                          </Badge>
                        )}
                      </td>

                      {/* Study Day */}
                      <td className="py-3 px-4 font-mono tabular">
                        Day {p.onsetDay}
                        {p.resolvedDay && ` → Day ${p.resolvedDay}`}
                      </td>

                      {/* Status Chip */}
                      <td className="py-3 px-4">
                        {p.liveStatus === "ready" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-tint text-teal border border-teal/20">
                            Ready
                          </span>
                        )}
                        {p.liveStatus === "drafted" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal text-white">
                            Drafted
                          </span>
                        )}
                        {p.liveStatus === "reviewed" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-ok text-white">
                            ✓ Reviewed
                          </span>
                        )}
                        {p.liveStatus === "returned" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber text-white">
                            Returned
                          </span>
                        )}
                        {p.liveStatus === "exception" && (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-critical-tint text-critical border border-critical/30">
                              <AlertTriangle className="h-3 w-3" />
                              Exception
                            </span>
                            <div className="text-[11px] text-critical leading-tight">
                              {p.dataIssue}
                              <span className="block text-muted font-mono text-[10px]">
                                Owner: Data management
                              </span>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/narratives/${p.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-teal hover:text-teal-dark hover:underline"
                        >
                          {isException ? "View exception" : "Open narrative"}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sticky Bottom Batch Generation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-card/95 backdrop-blur-xs border-t border-line py-3.5 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Counts Indicator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Layers className="h-4 w-4 text-teal" />
              <span>
                {counts.ready} ready · {counts.exceptions} exceptions
              </span>
            </div>
            {counts.drafted > 0 && (
              <span className="text-xs text-subtle border-l border-line pl-3">
                {counts.drafted} drafted · {counts.reviewed} reviewed
              </span>
            )}
          </div>

          {/* Progress Bar (Visible while generating) */}
          {isGeneratingBatch && (
            <div className="flex-1 max-w-md mx-4 space-y-1">
              <div className="flex justify-between text-[11px] text-subtle font-mono">
                <span>Drafting {batchProgress.currentPatientId}…</span>
                <span>
                  {batchProgress.current} of {batchProgress.total}
                </span>
              </div>
              <Progress
                value={
                  batchProgress.total > 0
                    ? (batchProgress.current / batchProgress.total) * 100
                    : 0
                }
                className="h-2 bg-paper-2"
              />
            </div>
          )}

          {/* Action CTA */}
          <div className="flex items-center gap-3">
            <Button
              size="default"
              disabled={isGeneratingBatch || counts.ready === 0}
              onClick={handleGenerateAll}
              className="bg-teal hover:bg-teal-dark text-white font-semibold text-xs h-9 px-4 gap-2 shadow-xs"
            >
              <Sparkles className="h-4 w-4" />
              {isGeneratingBatch
                ? "Assembling narratives in batch…"
                : counts.ready === 0
                ? "All ready narratives drafted"
                : "Generate all ready narratives"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
