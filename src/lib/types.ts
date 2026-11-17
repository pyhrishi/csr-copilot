// Core types — copied verbatim from docs/data-model.md ("Core types"). Keep in sync with that doc.

export type ArmId = "velo" | "pbo";

export interface Study {
  id: string;
  shortName: string;
  title: string;
  sponsor: string;
  phase: string;
  indication: string;
  design: string;
  arms: { id: ArmId; label: string; randomized: number; safetyN: number }[];
  milestones: Record<
    "lastPatientLastVisit" | "databaseLock" | "toplineResults" | "csrTargetFinal",
    string
  >;
  template: string;
  therapeuticAreaPack: string;
  status: string;
}

export type FactKind = "n_pct" | "mean_sd" | "hr_ci" | "p_value" | "ref" | "stat";

export interface Fact {
  id: string; // "<tlf>.<row>.<arm>", e.g. "14.3.1.1.any_teae.velo"
  tlf: string;
  tlfVersion: number;
  row: string;
  rowLabel: string;
  column: ArmId;
  columnLabel: string;
  population: "Randomized" | "Safety";
  kind: FactKind;
  value: { n: number; N: number; pct: number } | Record<string, number | string>;
  display: string; // canonical rendering, e.g. "201 (67.4%)"
  cell: { row: number; col: number }; // coordinates in the TLF table
}

export interface Tlf {
  id: string;
  title: string;
  population: string;
  version: number;
  columns: string[];
  rows: { key: string; label: string; cells: { factId: string; display: string }[] }[];
  footnotes?: string[];
}

export interface TemplateSentence {
  id: string;
  text: string;
  cites: string[];
  seededIssue?: string;
}

export interface Section {
  id: string;
  title: string;
  release: "R1" | "R2" | "human";
  autonomy: "L0" | "L1" | "L2" | "L3" | "locked";
  tlfs: string[];
  sentences: TemplateSentence[];
}

export interface Patient {
  id: string;
  arm: ArmId;
  armLabel: string;
  age: number;
  sex: "M" | "F";
  site: string;
  event: string;
  seriousness: "Hospitalization" | "Death";
  severity: string;
  onsetDay: number;
  resolvedDay: number | null;
  outcome: string;
  related: string;
  action: string;
  timeline: [day: number, text: string][];
  narrativeType: "SAE" | "Death";
  status: "ready" | "exception";
  dataIssue?: string;
}

// Runtime state (client store, persisted to localStorage per browser for the demo)
export type Provenance = "ai" | "ai_edited" | "human";
export type SentenceState = "pending" | "accepted" | "rejected";

export interface DraftSentence {
  id: string;
  sectionId: string;
  template: string; // text with slots, exactly as generated
  rendered: RenderedPart[]; // output of the slot filler
  provenance: Provenance;
  state: SentenceState;
  cites: string[];
  generation: {
    mode: "simulated" | "live";
    model?: string;
    promptVersion: string;
    templateVersion: string;
    at: string;
  };
  findings: Finding[];
}

export type RenderedPart =
  | { type: "text"; value: string }
  | { type: "slot"; factId: string; format: SlotFormat; value: string };
export type SlotFormat = "n_pct" | "n" | "pct" | "display";

export interface Finding {
  ruleId: string;
  severity: "critical" | "major" | "minor";
  message: string;
  span?: [number, number];
  suggestion?: string;
}

export interface AuditEvent {
  id: string;
  at: string;
  actor: string;
  role: Role;
  action:
    | "generate"
    | "accept"
    | "edit"
    | "reject"
    | "regenerate"
    | "sign_off"
    | "autonomy_change"
    | "tlf_update"
    | "export";
  objectId: string;
  detail: string;
  versions?: { model?: string; prompt?: string; template?: string; tlf?: string };
}
export type Role = "writer" | "biostat" | "regulatory" | "qa" | "exec";
