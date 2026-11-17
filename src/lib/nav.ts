// The 11 screens from docs/prototype-brief.md §4. Single source for the left nav and the screen stubs.
// Copy here is plain and numeral-free: counts and figures come from the seed on the screens themselves.

/** Section opened from the nav: the adverse-events section that the demo script walks through. */
export const DEMO_SECTION_ID = "12.2";
/** Patient opened from the nav: the example SAE narrative in docs/data-model.md. */
export const DEMO_PATIENT_ID = "CRD301-1042";

export type ScreenId = "S1" | "S2" | "S3" | "S4" | "S5" | "S6" | "S7" | "S8" | "S9" | "S10" | "S11";
export type NavIcon =
  | "home"
  | "setup"
  | "workspace"
  | "reconciliation"
  | "narratives"
  | "patient"
  | "changes"
  | "audit"
  | "quality"
  | "autonomy"
  | "value";

export interface Screen {
  id: ScreenId;
  /** Short label for the nav. */
  label: string;
  /** Page title. */
  title: string;
  href: string;
  /** Matches the pathnames that belong to this screen (for aria-current). */
  match: RegExp;
  icon: NavIcon;
  /** PRD journey (J1–J6), if the screen demonstrates one. */
  journey?: string;
  /** PRD requirement ids the screen demonstrates. */
  requirements: string[];
  /** Build-plan milestone that delivers the screen. */
  milestone: `M${number}`;
  /** One sentence on what the screen will show. */
  summary: string;
}

export const SCREENS: readonly Screen[] = [
  {
    id: "S1",
    label: "Study home",
    title: "Study home",
    href: "/",
    match: /^\/$/,
    icon: "home",
    requirements: [],
    milestone: "M2",
    summary:
      "Study milestones, the ICH E3 section board with release, autonomy and status, and readiness tiles.",
  },
  {
    id: "S2",
    label: "Data readiness",
    title: "Data readiness",
    href: "/setup",
    match: /^\/setup$/,
    icon: "setup",
    journey: "J1",
    requirements: ["FR-ING-01..04", "FR-MAP-01"],
    milestone: "M2",
    summary:
      "Source inputs with versions and hashes, TLF parse results, TLF-to-section mapping and open data exceptions.",
  },
  {
    id: "S3",
    label: "Section workspace",
    title: "Section workspace",
    href: `/sections/${DEMO_SECTION_ID}`,
    match: /^\/sections\/[^/]+$/,
    icon: "workspace",
    journey: "J2",
    requirements: ["FR-GEN-01/03", "FR-TRC-01/02", "FR-EDT-01/02/04", "FR-NUM-01..04"],
    milestone: "M3",
    summary:
      "Draft generation with slot-rendered number chips, citations, provenance shading, per-sentence review and validator checks.",
  },
  {
    id: "S4",
    label: "Reconciliation",
    title: "Reconciliation report",
    href: `/sections/${DEMO_SECTION_ID}/reconciliation`,
    match: /^\/sections\/[^/]+\/reconciliation$/,
    icon: "reconciliation",
    journey: "J3",
    requirements: ["FR-QC-01", "FR-WF-01/02"],
    milestone: "M4",
    summary:
      "Every number in the section matched against its source TLF cell, with a role-gated biostatistician sign-off.",
  },
  {
    id: "S5",
    label: "Narratives",
    title: "Narratives queue",
    href: "/narratives",
    match: /^\/narratives$/,
    icon: "narratives",
    journey: "J4",
    requirements: ["FR-GEN-02"],
    milestone: "M5",
    summary:
      "SAE and death narratives generated in a batch; patients with data exceptions are skipped with their reason.",
  },
  {
    id: "S6",
    label: "Narrative detail",
    title: "Narrative detail",
    href: `/narratives/${DEMO_PATIENT_ID}`,
    match: /^\/narratives\/[^/]+$/,
    icon: "patient",
    journey: "J4",
    requirements: ["FR-GEN-02"],
    milestone: "M5",
    summary:
      "A patient timeline and the assembled narrative, each clause cited to the patient record, with safety physician review.",
  },
  {
    id: "S7",
    label: "TLF changes",
    title: "TLF change impact",
    href: "/changes",
    match: /^\/changes$/,
    icon: "changes",
    journey: "J6",
    requirements: ["FR-QC-04"],
    milestone: "M6",
    summary:
      "A re-run TLF diffed against the previous version, the sentences it affects, and a re-run reconciliation after the update.",
  },
  {
    id: "S8",
    label: "Audit & lineage",
    title: "Audit and lineage",
    href: "/audit",
    match: /^\/audit$/,
    icon: "audit",
    journey: "J5",
    requirements: ["FR-AUD-01..04", "FR-TRC-03", "FR-EXP-02"],
    milestone: "M6",
    summary:
      "The event log, per-sentence lineage from source to approval, and an exportable evidence pack.",
  },
  {
    id: "S9",
    label: "Quality",
    title: "Quality",
    href: "/quality",
    match: /^\/quality$/,
    icon: "quality",
    requirements: ["FR-QC-02/03", "NFR-ACC-*"],
    milestone: "M7",
    summary:
      "Gold-set evaluation results (mock, labelled as such) and consistency checks across sections.",
  },
  {
    id: "S10",
    label: "Autonomy & risk",
    title: "Autonomy and risk",
    href: "/settings/autonomy",
    match: /^\/settings\/autonomy$/,
    icon: "autonomy",
    requirements: ["FR-GEN-03"],
    milestone: "M7",
    summary:
      "The section risk matrix and an autonomy ladder per section; QA changes levels with a reason that goes to the audit log.",
  },
  {
    id: "S11",
    label: "Value",
    title: "Value dashboard",
    href: "/value",
    match: /^\/value$/,
    icon: "value",
    requirements: ["FR-ANL-01"],
    milestone: "M7",
    summary:
      "Baseline against current for cycle time, writer hours, acceptance and errors caught (simulated values, labelled).",
  },
];

export function getScreen(id: ScreenId): Screen {
  const screen = SCREENS.find((s) => s.id === id);
  if (!screen) throw new Error(`Unknown screen ${id}`);
  return screen;
}

export function screenForPath(pathname: string): Screen | undefined {
  return SCREENS.find((s) => s.match.test(pathname));
}
