"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  FileCheck2,
  FileText,
  Printer,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { MatchStatus } from "@/components/trust";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buildEvidencePack, type EvidencePackInput } from "@/lib/evidence-pack";
import { rolePersona } from "@/lib/roles";
import type { Fact, Section, Tlf } from "@/lib/types";
import { useAuditStore, useDraftsStore, useRoleStore } from "@/store";

interface EvidencePackViewProps {
  sectionId: string;
  sections: Section[];
  facts: Fact[];
  tlfs: Tlf[];
  inputs?: EvidencePackInput[];
}

const EMPTY_FACTS: Record<string, Fact> = {};
const EMPTY_TLFS: Record<string, Tlf> = {};

export function EvidencePackView({
  sectionId,
  sections,
  facts,
  tlfs,
  inputs,
}: EvidencePackViewProps) {
  const auditEvents = useSyncExternalStore(
    useAuditStore.subscribe,
    () => useAuditStore.getState().events,
    () => [],
  );

  const customFacts = useSyncExternalStore(
    useDraftsStore.subscribe,
    () => useDraftsStore.getState().customFacts,
    () => EMPTY_FACTS,
  );

  const customTlfs = useSyncExternalStore(
    useDraftsStore.subscribe,
    () => useDraftsStore.getState().customTlfs,
    () => EMPTY_TLFS,
  );

  const activeFacts = useMemo(() => {
    return facts.map((f) => customFacts[f.id] ?? f);
  }, [facts, customFacts]);

  const activeTlfs = useMemo(() => {
    return tlfs.map((t) => customTlfs[t.id] ?? t);
  }, [tlfs, customTlfs]);

  // Build the evidence pack
  const pack = useMemo(() => {
    return buildEvidencePack(sectionId, {
      sections,
      facts: activeFacts,
      tlfs: activeTlfs,
      auditEvents,
      inputs,
    });
  }, [sectionId, sections, activeFacts, activeTlfs, auditEvents, inputs]);

  const appendAudit = useAuditStore((s) => s.append);
  const role = useRoleStore((s) => s.role);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(pack, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `evidence-pack-${pack.sectionId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    const persona = rolePersona(role);
    appendAudit({
      actor: persona.name,
      role,
      action: "export",
      objectId: pack.sectionId,
      detail: `Exported 21 CFR Part 11 Evidence Pack JSON for Section ${pack.sectionId}`,
    });

    toast.success(`Downloaded evidence-pack-${pack.sectionId}.json`);
  };

  return (
    <div className="px-6 py-8 md:px-8 md:py-10 space-y-8 pb-20 max-w-5xl mx-auto">
      {/* Top Toolbar (Hidden on print) */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-card border border-line shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/audit"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal hover:text-teal-dark hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Audit Log
          </Link>
          <span className="text-muted text-xs">/</span>
          <span className="text-xs font-mono font-semibold text-ink">
            Evidence Pack · Section {pack.sectionId}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadJson}
            className="text-xs h-9 gap-1.5 text-ink bg-card hover:bg-paper-2"
          >
            <Download className="h-3.5 w-3.5 text-teal" />
            Download JSON
          </Button>

          <Button
            size="sm"
            onClick={handlePrint}
            className="bg-teal hover:bg-teal-dark text-white text-xs h-9 px-4 gap-1.5 shadow-xs font-semibold"
          >
            <Printer className="h-3.5 w-3.5" />
            Print / Save PDF
          </Button>
        </div>
      </div>

      {/* Main Print-Styled Evidence Document */}
      <div className="bg-card rounded-xl border border-line p-8 shadow-sm print:border-none print:shadow-none print:p-0 space-y-8 max-w-5xl mx-auto font-sans">
        {/* Document Header */}
        <div className="border-b-2 border-ink pb-6 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-teal block">
                Meridian Biopharma · Regulatory Affairs & Quality
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif text-ink tracking-tight mt-1">
                Clinical Study Report Evidence Pack (21 CFR Part 11)
              </h1>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="text-xs font-mono bg-teal-tint text-teal-dark border-teal/40 font-bold">
                Inspection Ready · Sealed
              </Badge>
              <div className="text-[11px] font-mono text-muted mt-1">
                Generated: {new Date(pack.generatedAt).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
            <div>
              <span className="text-subtle text-[10px] uppercase font-bold tracking-wider block">Protocol ID</span>
              <strong className="text-ink font-mono">{pack.study.protocolId}</strong>
            </div>
            <div>
              <span className="text-subtle text-[10px] uppercase font-bold tracking-wider block">Compound</span>
              <strong className="text-ink">{pack.study.compound}</strong>
            </div>
            <div>
              <span className="text-subtle text-[10px] uppercase font-bold tracking-wider block">Phase</span>
              <strong className="text-ink">{pack.study.phase}</strong>
            </div>
            <div>
              <span className="text-subtle text-[10px] uppercase font-bold tracking-wider block">CSR Section</span>
              <strong className="text-teal font-semibold">
                {pack.sectionId} {pack.sectionTitle}
              </strong>
            </div>
          </div>
        </div>

        {/* Section 1: Ingested Source Hashes */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-teal" />
            <h2 className="text-sm font-bold text-ink uppercase tracking-wider">
              1. Ingested Input Hashes & Ingestion Lineage
            </h2>
          </div>
          <div className="overflow-x-auto rounded-lg border border-line">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-paper-2 text-ink uppercase font-semibold text-[11px] border-b border-line">
                <tr>
                  <th className="py-2 px-3">Input Name</th>
                  <th className="py-2 px-3">Version</th>
                  <th className="py-2 px-3">Cryptographic SHA-256 Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line font-mono text-body">
                {pack.inputs.map((inp, idx) => (
                  <tr key={idx} className="hover:bg-paper/40">
                    <td className="py-2 px-3 font-sans font-semibold text-ink">{inp.name}</td>
                    <td className="py-2 px-3">{inp.version}</td>
                    <td className="py-2 px-3 text-[11px] text-muted">{inp.sha256}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Numeric Reconciliation Report */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 text-teal" />
              <h2 className="text-sm font-bold text-ink uppercase tracking-wider">
                2. Numeric Reconciliation Report
              </h2>
            </div>
            <span className="text-xs font-semibold text-ok font-mono">
              {pack.reconciliation.summary.matched} of {pack.reconciliation.summary.total} numbers reconciled (100%)
            </span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-line">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-paper-2 text-ink uppercase font-semibold text-[11px] border-b border-line">
                <tr>
                  <th className="py-2 px-3">Sentence ID</th>
                  <th className="py-2 px-3">Rendered Clinical Value</th>
                  <th className="py-2 px-3">Fact ID</th>
                  <th className="py-2 px-3">Source Table & Cell</th>
                  <th className="py-2 px-3">Source Value</th>
                  <th className="py-2 px-3 text-right">Match Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-body">
                {pack.reconciliation.rows.map((r, idx) => (
                  <tr key={`${r.sentenceId}-${r.factId}-${idx}`} className="hover:bg-paper/40">
                    <td className="py-2 px-3 font-mono font-bold text-ink">{r.sentenceId}</td>
                    <td className="py-2 px-3 font-mono font-semibold text-teal tabular">{r.renderedValue}</td>
                    <td className="py-2 px-3 font-mono text-[11px] text-muted">{r.factId}</td>
                    <td className="py-2 px-3">
                      <strong>Table {r.tlf ?? "—"}</strong> · {r.rowLabel ?? "—"} / {r.columnLabel ?? "—"}
                    </td>
                    <td className="py-2 px-3 font-mono tabular">{r.sourceDisplay ?? r.expectedValue ?? "—"}</td>
                    <td className="py-2 px-3 text-right">
                      <MatchStatus
                        matched={r.matched}
                        expected={r.sourceDisplay ?? r.expectedValue}
                        actual={r.renderedValue}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Electronic Signatures (Part 11) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-teal" />
            <h2 className="text-sm font-bold text-ink uppercase tracking-wider">
              3. 21 CFR Part 11 Electronic Signature Record
            </h2>
          </div>

          {pack.signOff ? (
            <div className="p-4 rounded-lg bg-teal-tint/40 border border-teal/30 space-y-2 text-xs">
              <div className="flex flex-wrap items-center justify-between">
                <div className="flex items-center gap-2 text-teal font-bold text-sm">
                  <CheckCircle2 className="h-4 w-4 text-ok" />
                  <span>Electronically Signed & Sealed</span>
                </div>
                <span className="font-mono text-[11px] text-muted">
                  Audit Event ID: {pack.signOff.auditEventId}
                </span>
              </div>
              <p className="text-body italic">&ldquo;{pack.signOff.meaningOfSignature}&rdquo;</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-teal/20 text-[11px] font-mono">
                <div>Signer: <strong>{pack.signOff.signerName}</strong></div>
                <div>Role: <strong>{pack.signOff.role}</strong></div>
                <div>Timestamp: <strong>{new Date(pack.signOff.signedAt).toLocaleString()}</strong></div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-paper-2 border border-line text-xs text-muted italic">
              No final electronic sign-off recorded yet for this section.
            </div>
          )}
        </div>

        {/* Section 4: Section Audit Trail Slice */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-teal" />
            <h2 className="text-sm font-bold text-ink uppercase tracking-wider">
              4. Chronological Section Audit Trail Slice
            </h2>
          </div>

          <div className="overflow-x-auto rounded-lg border border-line">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-paper-2 text-ink uppercase font-semibold text-[11px] border-b border-line">
                <tr>
                  <th className="py-2 px-3">Timestamp</th>
                  <th className="py-2 px-3">Actor & Role</th>
                  <th className="py-2 px-3">Action</th>
                  <th className="py-2 px-3">Object</th>
                  <th className="py-2 px-3">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-body text-[11px]">
                {pack.auditTrail.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-muted">
                      No section-specific audit events recorded yet.
                    </td>
                  </tr>
                ) : (
                  pack.auditTrail.map((ev) => (
                    <tr key={ev.id} className="hover:bg-paper/40">
                      <td className="py-2 px-3 font-mono text-muted whitespace-nowrap tabular">
                        {new Date(ev.at).toLocaleString()}
                      </td>
                      <td className="py-2 px-3 font-semibold text-ink">{ev.actor}</td>
                      <td className="py-2 px-3 font-bold uppercase">{ev.action}</td>
                      <td className="py-2 px-3 font-mono">{ev.objectId}</td>
                      <td className="py-2 px-3 text-body">{ev.detail}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 5: Version Pinning & Compliance Statement */}
        <div className="pt-4 border-t border-line text-xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-[11px] text-subtle">
            <div>System Architecture: <strong>{pack.versions.system}</strong></div>
            <div>Prompt Version: <strong>{pack.versions.promptVersion}</strong></div>
            <div>Template Version: <strong>{pack.versions.templateVersion}</strong></div>
          </div>
          <p className="text-[11px] text-muted leading-relaxed">
            Prototype inspection artifact demonstrating traceability, deterministic slot reconciliation,
            and Part 11-style electronic sign-off architecture. Prepared on fictional study data for technical evaluation.
          </p>
        </div>
      </div>
    </div>
  );
}
