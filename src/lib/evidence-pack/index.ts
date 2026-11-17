// Evidence Pack: aggregates input file hashes, reconciliation report, audit trail slice,
// versions and electronic sign-offs for an ICH E3 section into an inspection-ready bundle.
import { getInputSources } from "@/lib/data/inputs";
import { reconcileSection, type ReconciliationReport } from "@/lib/reconcile";
import type { AuditEvent, Fact, Section, Tlf } from "@/lib/types";

export interface EvidencePackSignOff {
  signerName: string;
  role: string;
  signedAt: string;
  meaningOfSignature: string;
  auditEventId: string;
}

export interface EvidencePackInput {
  name: string;
  version: string;
  sha256: string;
}

export interface EvidencePack {
  sectionId: string;
  sectionTitle: string;
  generatedAt: string;
  study: {
    protocolId: string;
    compound: string;
    phase: string;
  };
  inputs: EvidencePackInput[];
  reconciliation: ReconciliationReport;
  signOff: EvidencePackSignOff | null;
  auditTrail: readonly AuditEvent[];
  versions: {
    system: string;
    promptVersion: string;
    templateVersion: string;
  };
}

export interface BuildEvidencePackOptions {
  sections: readonly Section[];
  facts: readonly Fact[];
  tlfs: readonly Tlf[];
  auditEvents?: readonly AuditEvent[];
  clock?: () => Date;
}

export function buildEvidencePack(
  sectionId: string,
  {
    sections,
    facts,
    tlfs,
    auditEvents = [],
    clock = () => new Date(),
  }: BuildEvidencePackOptions,
): EvidencePack {
  const section = sections.find((s) => s.id === sectionId);
  if (!section) throw new Error(`Unknown section "${sectionId}" for evidence pack`);

  const inputs = getInputSources().map((inp) => ({
    name: inp.name,
    version: inp.version,
    sha256: inp.sha256,
  }));

  const reconciliation = reconcileSection(sectionId, facts, tlfs, {
    sections,
  });

  // Extract section-specific audit events
  const sectionAudit = auditEvents.filter(
    (e) => e.objectId === sectionId || e.objectId.startsWith(`${sectionId}-`),
  );

  // Extract latest sign-off event if available
  const signOffEvent = [...sectionAudit]
    .reverse()
    .find((e) => e.action === "sign_off");

  const signOff: EvidencePackSignOff | null = signOffEvent
    ? {
        signerName: signOffEvent.actor,
        role: signOffEvent.role,
        signedAt: signOffEvent.at,
        meaningOfSignature:
          "I confirm the numbers in this section match the source TLFs.",
        auditEventId: signOffEvent.id,
      }
    : null;

  return {
    sectionId: section.id,
    sectionTitle: section.title,
    generatedAt: clock().toISOString(),
    study: {
      protocolId: "CRD-301",
      compound: "velorantib",
      phase: "Phase III",
    },
    inputs,
    reconciliation,
    signOff,
    auditTrail: Object.freeze(sectionAudit),
    versions: {
      system: "CSR-Copilot-v1.0-simulated",
      promptVersion: "1.0",
      templateVersion: "1.0",
    },
  };
}
