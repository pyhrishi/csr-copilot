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
  sign_off_revoked: "bg-amber-tint text-ink border-amber",
  export: "bg-blue-100 text-blue-800 border-blue-300",
  autonomy_change: "bg-purple-100 text-purple-800 border-purple-300",
};

const EMPTY_EVENTS: AuditEvent[] = [];
const EMPTY_SENTENCES: Record<string, DraftSentence> = {};
const EMPTY_CUSTOM_FACTS: Record<string, Fact> = {};

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

  // Lineage reads the active facts, so a TLF re-run shows its new values here too.
  const customFacts = useSyncExternalStore(
    useDraftsStore.subscribe,
    () => useDraftsStore.getState().customFacts,
    () => EMPTY_CUSTOM_FACTS,
  );
  const activeFacts = useMemo(() => facts.map((f) => customFacts[f.id] ?? f), [facts, customFacts]);

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
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-8 pb-16 md:px-8 md:py-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl font-bold tracking-tight text-ink">
              Audit Trail & Sentence Lineage
            </h1>
            <Badge variant="outline" className="border-line bg-paper-2 font-mono text-xs text-ink">
              Append-only log (prototype)
            </Badge>
          </div>
          <p className="mt-1 text-sm text-subtle">
            Immutable, cryptographically verifiable record of all clinical generations, checks,
            edits, and approvals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper-2 px-3 py-1 text-xs font-semibold text-subtle">
            <Lock className="h-3 w-3 text-teal" />
            Append-only Log ({auditEvents.length} events)
          </span>
        </div>
      </div>

      {/* Section 1: Event Log Table */}
      <div className="space-y-4 rounded-xl border border-line bg-card p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-teal" />
            <h2 className="text-sm font-bold text-ink">System Audit Trail Log</h2>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-muted">
            <ShieldCheck className="h-3.5 w-3.5 text-ok" />
            Zero delete or edit affordances
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-paper-2/60 p-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-ink">
              <Filter className="h-3.5 w-3.5 text-muted" />
              <span>Filter:</span>
            </div>

            {/* Action Filter */}
            <div className="w-36">
              <Select value={actionFilter} onValueChange={(val) => setActionFilter(val ?? "all")}>
                <SelectTrigger className="h-8 bg-paper text-xs">
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
                  <SelectItem value="sign_off_revoked">Sign-off revoked</SelectItem>
                  <SelectItem value="autonomy_change">Autonomy change</SelectItem>
                  <SelectItem value="regenerate">Regenerate</SelectItem>
                  <SelectItem value="export">Export</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Role Filter */}
            <div className="w-36">
              <Select value={roleFilter} onValueChange={(val) => setRoleFilter(val ?? "all")}>
                <SelectTrigger className="h-8 bg-paper text-xs">
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
            <Search className="absolute top-2.5 left-2.5 h-3.5 w-3.5 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search object, actor, or detail..."
              className="w-full rounded-lg border border-line bg-paper py-1.5 pr-3 pl-8 text-xs focus:ring-1 focus:ring-teal focus:outline-teal"
            />
          </div>
        </div>

        {/* Audit Events Table */}
        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="border-b border-line bg-paper-2 text-[11px] font-semibold tracking-wider text-ink uppercase">
              <tr>
                <th className="px-3 py-2.5">Timestamp</th>
                <th className="px-3 py-2.5">Actor & Role</th>
                <th className="px-3 py-2.5">Action</th>
                <th className="px-3 py-2.5">Target Object</th>
                <th className="px-3 py-2.5">Event Detail</th>
                <th className="px-3 py-2.5 text-right">Versions</th>
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
                  const actionColor = ACTION_COLORS[ev.action] ?? "bg-paper-2 text-ink border-line";

                  return (
                    <tr key={ev.id} className="transition-colors hover:bg-paper/50">
                      {/* Timestamp */}
                      <td className="px-3 py-2.5 font-mono text-[11px] whitespace-nowrap text-muted tabular">
                        {new Date(ev.at).toLocaleString()}
                      </td>

                      {/* Actor & Role */}
                      <td className="px-3 py-2.5">
                        <div className="font-semibold text-ink">{ev.actor}</div>
                        <div className="text-[11px] text-muted">{roleLabel(ev.role)}</div>
                      </td>

                      {/* Action */}
                      <td className="px-3 py-2.5">
                        <span
                          className={`inline-block rounded-xs border px-2 py-0.5 text-[10px] font-bold uppercase ${actionColor}`}
                        >
                          {ev.action}
                        </span>
                      </td>

                      {/* Target Object */}
                      <td className="px-3 py-2.5 font-mono font-bold text-ink">{ev.objectId}</td>

                      {/* Detail */}
                      <td className="max-w-md px-3 py-2.5 leading-relaxed text-ink">{ev.detail}</td>

                      {/* Versions */}
                      <td className="px-3 py-2.5 text-right font-mono text-[10px] text-subtle">
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
      <div className="space-y-5 rounded-xl border border-line bg-card p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-teal" />
            <h2 className="text-sm font-bold text-ink">Sentence Lineage Inspector</h2>
          </div>

          {/* Sentence Pickers */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-subtle">Section:</span>
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
                  <SelectTrigger className="h-8 bg-paper text-xs">
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
              <span className="font-semibold text-subtle">Sentence:</span>
              <div className="w-48">
                <Select
                  value={selectedSentenceId}
                  onValueChange={(val) => val && setSelectedSentenceId(val)}
                >
                  <SelectTrigger className="h-8 bg-paper text-xs">
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
          facts={activeFacts}
          tlfs={tlfs}
        />
      </div>

      {/* Section 3: Evidence Pack Export Route Link */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-card p-5 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FileCheck2 className="h-4 w-4 text-teal" />
            <h2 className="text-sm font-bold text-ink">
              Regulatory Evidence Pack Export (21 CFR Part 11)
            </h2>
          </div>
          <p className="max-w-xl text-xs leading-relaxed text-subtle">
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
              <SelectTrigger className="h-9 bg-paper text-xs">
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
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-teal px-4 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-teal-dark"
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
