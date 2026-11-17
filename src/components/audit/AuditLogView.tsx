"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  ArrowRight,
  FileCheck2,
  FileText,
  Filter,
  History,
  Lock,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { LineageTimeline } from "@/components/trust/LineageTimeline";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { roleLabel } from "@/lib/roles";
import type { AuditEvent, DraftSentence, Fact, Section, Tlf } from "@/lib/types";
import { useAuditStore, useDraftsStore } from "@/store";

interface AuditLogViewProps {
  sections: Section[];
  facts: Fact[];
  tlfs: Tlf[];
}

const ACTION_COLORS: Record<string, string> = {
  generate: "bg-teal-tint text-teal-dark border-teal/30",
  accept: "bg-teal text-white",
  edit: "bg-amber-tint text-amber-dark border-amber/30",
  reject: "bg-critical-tint text-critical border-critical/30",
  regenerate: "bg-paper-2 text-ink border-line",
  sign_off: "bg-ok text-white font-semibold",
  tlf_update: "bg-indigo-100 text-indigo-800 border-indigo-300",
  export: "bg-blue-100 text-blue-800 border-blue-300",
  autonomy_change: "bg-purple-100 text-purple-800 border-purple-300",
};

const EMPTY_EVENTS: AuditEvent[] = [];
const EMPTY_SENTENCES: Record<string, DraftSentence> = {};

export function AuditLogView({ sections, facts, tlfs }: AuditLogViewProps) {
  const auditEvents = useSyncExternalStore(
    useAuditStore.subscribe,
    () => useAuditStore.getState().events,
    () => EMPTY_EVENTS,
  );

  const draftSentences = useSyncExternalStore(
    useDraftsStore.subscribe,
    () => useDraftsStore.getState().sentences,
    () => EMPTY_SENTENCES,
  );

  // Filters state
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Sentence Lineage selector
  const [selectedSectionId, setSelectedSectionId] = useState<string>("12.2");
  const activeSection = sections.find((s) => s.id === selectedSectionId) ?? sections[0];
  const [selectedSentenceId, setSelectedSentenceId] = useState<string>(
    activeSection?.sentences[2]?.id ?? activeSection?.sentences[0]?.id ?? "12.2-s3",
  );

  // Evidence Pack target
  const [evidenceSectionId, setEvidenceSectionId] = useState<string>("12.2");

  // Filtered audit events
  const filteredEvents = useMemo(() => {
    return auditEvents.filter((e) => {
      if (actionFilter !== "all" && e.action !== actionFilter) return false;
      if (roleFilter !== "all" && e.role !== roleFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesObject = e.objectId.toLowerCase().includes(q);
        const matchesActor = e.actor.toLowerCase().includes(q);
        const matchesDetail = e.detail.toLowerCase().includes(q);
        if (!matchesObject && !matchesActor && !matchesDetail) return false;
      }
      return true;
    });
  }, [auditEvents, actionFilter, roleFilter, searchQuery]);

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-serif text-ink tracking-tight">
              Audit Trail & Sentence Lineage
            </h1>
            <Badge variant="outline" className="font-mono text-xs bg-paper-2 text-ink border-line">
              Designed for 21 CFR Part 11
            </Badge>
          </div>
          <p className="text-sm text-subtle mt-1">
            Immutable, cryptographically verifiable record of all clinical generations, checks, edits, and approvals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-paper-2 text-subtle border border-line">
            <Lock className="h-3 w-3 text-teal" />
            Append-only Log ({auditEvents.length} events)
          </span>
        </div>
      </div>

      {/* Section 1: Event Log Table */}
      <div className="bg-card rounded-xl border border-line p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-teal" />
            <h2 className="text-sm font-bold text-ink">
              System Audit Trail Log
            </h2>
          </div>

          <div className="text-[11px] text-muted flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-ok" />
            Zero delete or edit affordances
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-paper-2/60 border border-line">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-ink">
              <Filter className="h-3.5 w-3.5 text-muted" />
              <span>Filter:</span>
            </div>

            {/* Action Filter */}
            <div className="w-36">
              <Select value={actionFilter} onValueChange={(val) => setActionFilter(val ?? "all")}>
                <SelectTrigger className="h-8 text-xs bg-paper">
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="generate">Generate</SelectItem>
                  <SelectItem value="accept">Accept</SelectItem>
                  <SelectItem value="edit">Edit</SelectItem>
                  <SelectItem value="reject">Reject</SelectItem>
                  <SelectItem value="sign_off">Sign-Off</SelectItem>
                  <SelectItem value="tlf_update">TLF Update</SelectItem>
                  <SelectItem value="export">Export</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Role Filter */}
            <div className="w-36">
              <Select value={roleFilter} onValueChange={(val) => setRoleFilter(val ?? "all")}>
                <SelectTrigger className="h-8 text-xs bg-paper">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="writer">Medical Writer</SelectItem>
                  <SelectItem value="biostat">Biostatistician</SelectItem>
                  <SelectItem value="regulatory">Regulatory</SelectItem>
                  <SelectItem value="qa">QA</SelectItem>
                  <SelectItem value="exec">Executive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search Query */}
          <div className="relative min-w-[200px]">
            <Search className="h-3.5 w-3.5 text-muted absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search object, actor, or detail..."
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-line bg-paper focus:outline-teal focus:ring-1 focus:ring-teal"
            />
          </div>
        </div>

        {/* Audit Events Table */}
        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-paper-2 text-ink uppercase tracking-wider font-semibold border-b border-line text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Actor & Role</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Target Object</th>
                <th className="py-2.5 px-3">Event Detail</th>
                <th className="py-2.5 px-3 text-right">Versions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-body">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted">
                    No audit events match the current filter criteria.
                  </td>
                </tr>
              ) : (
                [...filteredEvents].reverse().map((ev) => {
                  const actionColor =
                    ACTION_COLORS[ev.action] ?? "bg-paper-2 text-ink border-line";

                  return (
                    <tr key={ev.id} className="hover:bg-paper/50 transition-colors">
                      {/* Timestamp */}
                      <td className="py-2.5 px-3 font-mono text-[11px] text-muted whitespace-nowrap tabular">
                        {new Date(ev.at).toLocaleString()}
                      </td>

                      {/* Actor & Role */}
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-ink">{ev.actor}</div>
                        <div className="text-[11px] text-muted">{roleLabel(ev.role)}</div>
                      </td>

                      {/* Action */}
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase border ${actionColor}`}
                        >
                          {ev.action}
                        </span>
                      </td>

                      {/* Target Object */}
                      <td className="py-2.5 px-3 font-mono font-bold text-ink">
                        {ev.objectId}
                      </td>

                      {/* Detail */}
                      <td className="py-2.5 px-3 max-w-md text-ink leading-relaxed">
                        {ev.detail}
                      </td>

                      {/* Versions */}
                      <td className="py-2.5 px-3 text-right font-mono text-[10px] text-subtle">
                        {ev.versions ? (
                          <div className="space-y-0.5">
                            {ev.versions.model && <div>M: {ev.versions.model}</div>}
                            {ev.versions.prompt && <div>P: {ev.versions.prompt}</div>}
                            {ev.versions.template && <div>T: {ev.versions.template}</div>}
                            {ev.versions.tlf && <div>TLF: {ev.versions.tlf}</div>}
                          </div>
                        ) : (
                          <span className="text-muted/60">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Sentence Lineage Inspector */}
      <div className="bg-card rounded-xl border border-line p-5 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-teal" />
            <h2 className="text-sm font-bold text-ink">
              Sentence Lineage Inspector
            </h2>
          </div>

          {/* Sentence Pickers */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-subtle font-semibold">Section:</span>
              <div className="w-32">
                <Select
                  value={selectedSectionId}
                  onValueChange={(val) => {
                    if (val) {
                      setSelectedSectionId(val);
                      const sec = sections.find((s) => s.id === val);
                      if (sec?.sentences[0]) {
                        setSelectedSentenceId(sec.sentences[0].id);
                      }
                    }
                  }}
                >
                  <SelectTrigger className="h-8 text-xs bg-paper">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        Section {s.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-subtle font-semibold">Sentence:</span>
              <div className="w-48">
                <Select
                  value={selectedSentenceId}
                  onValueChange={(val) => val && setSelectedSentenceId(val)}
                >
                  <SelectTrigger className="h-8 text-xs bg-paper">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {activeSection?.sentences.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.id}: {s.text.slice(0, 24)}…
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Lineage Timeline Render */}
        <LineageTimeline
          sentenceId={selectedSentenceId}
          section={activeSection}
          draft={draftSentences[selectedSentenceId]}
          auditEvents={auditEvents}
          facts={facts}
          tlfs={tlfs}
        />
      </div>

      {/* Section 3: Evidence Pack Export Route Link */}
      <div className="p-5 rounded-xl bg-card border border-line shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FileCheck2 className="h-4 w-4 text-teal" />
            <h2 className="text-sm font-bold text-ink">
              Regulatory Evidence Pack Export (21 CFR Part 11)
            </h2>
          </div>
          <p className="text-xs text-subtle max-w-xl leading-relaxed">
            Generate an inspection-ready evidence package for regulatory agencies (FDA/EMA),
            bundling the section draft, numeric reconciliation report, input hashes, lineage, and
            electronic sign-offs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-40">
            <Select
              value={evidenceSectionId}
              onValueChange={(val) => val && setEvidenceSectionId(val)}
            >
              <SelectTrigger className="h-9 text-xs bg-paper">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sections.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    Section {s.id} ({s.title.slice(0, 16)}…)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Link
            href={`/audit/evidence/${evidenceSectionId}`}
            className="inline-flex items-center bg-teal hover:bg-teal-dark text-white text-xs h-9 px-4 rounded-lg gap-1.5 shadow-xs font-semibold transition-colors"
          >
            <FileText className="h-4 w-4" />
            Export Evidence Pack
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
