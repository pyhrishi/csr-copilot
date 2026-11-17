import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";

import { ExceptionsList } from "@/components/data-readiness/ExceptionsList";
import { InputsTable } from "@/components/data-readiness/InputsTable";
import { TlfMappingTable } from "@/components/data-readiness/TlfMappingTable";
import { TlfParseResultsTable } from "@/components/data-readiness/TlfParseResultsTable";
import type { InputSource } from "@/lib/data/inputs";
import type { Fact, Patient, Section, Tlf } from "@/lib/types";

interface DataReadinessViewProps {
  inputs: readonly InputSource[];
  tlfs: readonly Tlf[];
  facts: readonly Fact[];
  sections: readonly Section[];
  exceptions: readonly Patient[];
}

export function DataReadinessView({
  inputs,
  tlfs,
  facts,
  sections,
  exceptions,
}: DataReadinessViewProps) {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-line pb-4">
        <div>
          <h1 className="font-heading text-3xl sm:text-4xl font-semibold text-ink">
            Data Readiness
          </h1>
          <p className="text-sm text-subtle mt-1">
            Source document provenance, structured TLF parsing, section mappings, and clinical data exceptions.
          </p>
        </div>

        {/* Readiness Badges */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-teal/30 bg-teal-tint px-3 py-1.5 text-xs font-semibold text-teal shadow-xs">
            <CheckCircle2 className="size-4" aria-hidden="true" />
            <span>5 of 5 Inputs Parsed</span>
          </div>
          {exceptions.length > 0 && (
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-amber/30 bg-amber-tint px-3 py-1.5 text-xs font-semibold text-amber shadow-xs">
              <AlertTriangle className="size-4" aria-hidden="true" />
              <span>{exceptions.length} Open Exceptions</span>
            </div>
          )}
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-line bg-card p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-subtle">
            Ingestion Pipeline
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold tabular text-ink">100%</span>
            <span className="text-xs text-teal font-medium">Deterministic</span>
          </div>
          <div className="text-xs text-subtle mt-1">
            5 source packages with SHA-256 integrity hashes.
          </div>
        </div>

        <div className="rounded-xl border border-line bg-card p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-subtle">
            Parsed TLF Tables
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold tabular text-ink">{tlfs.length}</span>
            <span className="text-xs text-teal font-medium">Tables</span>
          </div>
          <div className="text-xs text-subtle mt-1">
            {facts.length} facts extracted at 100.0% confidence.
          </div>
        </div>

        <div className="rounded-xl border border-line bg-card p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-subtle">
            Section Coverage
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold tabular text-ink">3 of 5</span>
            <span className="text-xs text-subtle font-medium">Active (R1)</span>
          </div>
          <div className="text-xs text-subtle mt-1">
            Sections 10.1, 12.2, 12.3 mapped to TLF package.
          </div>
        </div>

        <div className="rounded-xl border border-amber/40 bg-card p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-subtle">
            Data Exceptions
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold tabular text-amber">{exceptions.length}</span>
            <span className="text-xs text-subtle font-medium">Patients</span>
          </div>
          <div className="text-xs text-subtle mt-1">
            Assigned to Data Management for resolution.
          </div>
        </div>
      </div>

      {/* 1. Inputs Table */}
      <InputsTable inputs={inputs} />

      {/* 2. TLF Parse Results Table */}
      <TlfParseResultsTable tlfs={tlfs} facts={facts} />

      {/* 3. TLF-to-Section Mapping Table */}
      <TlfMappingTable tlfs={tlfs} sections={sections} />

      {/* 4. Exceptions List */}
      <ExceptionsList exceptions={exceptions} />

      {/* Progression Hand-off Banner to Drafting (Demo Flow Step 2 -> Step 3) */}
      <div className="rounded-xl border border-line bg-card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5 text-xs text-body">
          <CheckCircle2 className="size-4 text-teal shrink-0" aria-hidden="true" />
          <span>
            <strong className="text-ink">Data Readiness Verified:</strong> 5 of 5 inputs parsed and hashed, 2 data exceptions quarantined. Ready to initiate deterministic drafting.
          </span>
        </div>
        <Link
          href="/sections/12.2"
          className="inline-flex items-center gap-1.5 rounded-md bg-teal px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-teal/90 shrink-0 shadow-xs"
        >
          <span>Proceed to Section 12.2 Workspace</span>
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
