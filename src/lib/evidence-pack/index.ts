// Evidence Pack: aggregates input file hashes, reconciliation report, audit trail slice,
// versions and electronic sign-offs for an ICH E3 section into an inspection-ready bundle.
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

export const DEFAULT_EVIDENCE_INPUTS: readonly EvidencePackInput[] = [
  {
    name: "CRD-301 Clinical Study Protocol",
    version: "v3.0",
    sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  },
  {
    name: "Statistical Analysis Plan (SAP)",
    version: "v2.1",
    sha256: "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb",
  },
  {
    name: "TLF Package (Post-Lock Initial Run)",
    version: "v1.0",
    sha256: "872983764f4c5691d3e16b680f5fa329472532418f4ba8e291f81f6d30d0fb8a",
  },
  {
    name: "ADaM Analysis Datasets",
    version: "v1.0",
    sha256: "6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b",
  },
  {
    name: "Patient Profile & Narrative Source Listings",
    version: "v1.0",
    sha256: "d4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35",
  },
];

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
  inputs?: readonly EvidencePackInput[];
  clock?: () => Date;
}

export function buildEvidencePack(
  sectionId: string,
  {
    sections,
    facts,
    tlfs,
    auditEvents = [],
    inputs,
    clock = () => new Date(),
  }: BuildEvidencePackOptions,
): EvidencePack {
  const section = sections.find((s) => s.id === sectionId);
  if (!section) throw new Error(`Unknown section "${sectionId}" for evidence pack`);

  const packInputs = inputs ? [...inputs] : [...DEFAULT_EVIDENCE_INPUTS];

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
    inputs: packInputs,
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
