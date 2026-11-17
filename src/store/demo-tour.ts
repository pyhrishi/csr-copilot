import { create } from "zustand";

import type { Role } from "@/lib/types";
import { useAuditStore } from "./audit";
import { useDraftsStore } from "./drafts";
import { useModeStore } from "./mode";
import { useNarrativesStore } from "./narratives";
import { useRoleStore } from "./role";

export interface DemoStep {
  step: number;
  screen: string;
  route: string;
  role: Role;
  title: string;
  action: string;
  whatToSay: string;
  targetSelector?: string;
}

export const DEMO_STEPS: DemoStep[] = [
  {
    step: 1,
    screen: "S1 Study home",
    route: "/",
    role: "writer",
    title: "Study Home & Section Board",
    action: "Point at the fiction banner and the section board",
    whatToSay:
      "A fictional Phase III heart-failure study, just after database lock. Release 1 covers narratives and safety sections; efficacy is locked for Release 2; conclusions stay human.",
    targetSelector: '[data-testid="section-board"]',
  },
  {
    step: 2,
    screen: "S2 Data readiness",
    route: "/setup",
    role: "writer",
    title: "Data Readiness & Provenance",
    action: "Show the 5 TLFs parsed and the 2 narrative exceptions",
    whatToSay:
      "Nothing is drafted until inputs are versioned and hashed. Exceptions are visible, not hidden.",
    targetSelector: '[data-testid="tlf-parse-table"]',
  },
  {
    step: 3,
    screen: "S3 Section 12.2",
    route: "/sections/12.2",
    role: "writer",
    title: "Section Workspace & Streaming",
    action: "Click Generate draft; sentences stream in",
    whatToSay:
      "The model writes the words. Watch the numbers: each is a chip filled by code from the fact store.",
    targetSelector: 'button:has-text("Generate draft"), [data-testid="generate-draft-button"]',
  },
  {
    step: 4,
    screen: "S3 Section 12.2",
    route: "/sections/12.2",
    role: "writer",
    title: "Provenance & Source Drawer",
    action: "Hover a number chip, then click it",
    whatToSay:
      "Every number opens the exact table cell it came from: Table 14.3.1.1, version 1.",
    targetSelector: '[data-testid="number-chip"], [role="button"][aria-label*="Clinical number"]',
  },
  {
    step: 5,
    screen: "S3 Checks tab",
    route: "/sections/12.2",
    role: "writer",
    title: "Deterministic Validation (STAT-001)",
    action: "Show STAT-001 on the hypotension sentence and apply the fix",
    whatToSay:
      "The AI said 'significantly' with no test behind it. A rule caught it; the writer fixes it in one click.",
    targetSelector: 'button:has-text("Apply suggestion")',
  },
  {
    step: 6,
    screen: "S3 Section 12.2",
    route: "/sections/12.2",
    role: "writer",
    title: "Inline Editing Guard (NUM-001)",
    action: 'Edit a sentence and type "in 201 patients"',
    whatToSay:
      '"If a human types a raw number, it\'s flagged too: numbers must come from the tables." Then undo.',
    targetSelector: 'button[title*="Edit sentence"], [data-testid="edit-sentence-btn"]',
  },
  {
    step: 7,
    screen: "S4 Reconciliation",
    route: "/sections/12.2/reconciliation",
    role: "biostat",
    title: "Reconciliation Report & Sign-Off",
    action: "Switch role to Biostatistician; show 12 of 12 matched; sign off",
    whatToSay:
      "The biostatistician checks a report, not 600 pages. Sign-off is blocked while critical findings are open.",
    targetSelector: '[data-testid="reconciliation-table"], [data-testid="sign-off-block"]',
  },
  {
    step: 8,
    screen: "S5 Narratives",
    route: "/narratives",
    role: "writer",
    title: "Narratives Batch Queue",
    action: "Click Generate all ready narratives",
    whatToSay:
      "Ten narratives drafted in seconds; two skipped with the exact data issue to resolve.",
    targetSelector: 'button:has-text("Generate all ready narratives")',
  },
  {
    step: 9,
    screen: "S6 Narrative",
    route: "/narratives/CRD301-1042",
    role: "writer",
    title: "Patient Narrative Detail & Timeline",
    action: "Open CRD301-1042; show the timeline and citations",
    whatToSay:
      "Each clause points back to the patient record. The safety physician approves or returns it.",
    targetSelector: '[data-testid="patient-timeline"], [data-testid="safety-review-card"]',
  },
  {
    step: 10,
    screen: "S7 Changes",
    route: "/changes",
    role: "writer",
    title: "TLF Change Impact Analysis",
    action: "Apply the dizziness 22 → 23 correction",
    whatToSay:
      "A TLF re-run used to mean hunting through the document. Here the one affected sentence is found, updated and re-reconciled.",
    targetSelector: 'button:has-text("Apply update")',
  },
  {
    step: 11,
    screen: "S8 Audit",
    route: "/audit",
    role: "regulatory",
    title: "Audit Trail & Lineage Timeline",
    action: "Switch to Regulatory; open the lineage for that sentence; export the evidence pack",
    whatToSay:
      "Sources, generation, slot fill, checks, edits, approvals: what an inspector would ask for.",
    targetSelector: 'a:has-text("Export evidence pack"), button:has-text("Evidence pack")',
  },
  {
    step: 12,
    screen: "S10 Autonomy",
    route: "/settings/autonomy",
    role: "qa",
    title: "Autonomy Ladder & Risk Matrix",
    action: "Switch to QA; show the risk matrix and the locked levels",
    whatToSay:
      "Autonomy is earned per section with evidence, and every change is logged with a reason.",
    targetSelector: '[data-testid="risk-matrix-svg"]',
  },
  {
    step: 13,
    screen: "S11 Value",
    route: "/value",
    role: "exec",
    title: "Value Dashboard & ROI",
    action: "Switch to Executive",
    whatToSay:
      "Simulated here; in the pilot these come from the partner's own baseline at G1.",
    targetSelector: '[data-testid="value-kpi-grid"]',
  },
];

interface DemoTourState {
  isOpen: boolean;
  currentStepIndex: number;
  startTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  exitTour: () => void;
  resetDemoData: () => void;
}

export const useDemoTourStore = create<DemoTourState>()((set, get) => ({
  isOpen: false,
  currentStepIndex: 0,
  startTour: () => {
    set({ isOpen: true, currentStepIndex: 0 });
  },
  nextStep: () => {
    const { currentStepIndex } = get();
    if (currentStepIndex < DEMO_STEPS.length - 1) {
      set({ currentStepIndex: currentStepIndex + 1 });
    }
  },
  prevStep: () => {
    const { currentStepIndex } = get();
    if (currentStepIndex > 0) {
      set({ currentStepIndex: currentStepIndex - 1 });
    }
  },
  goToStep: (index: number) => {
    if (index >= 0 && index < DEMO_STEPS.length) {
      set({ currentStepIndex: index });
    }
  },
  exitTour: () => {
    set({ isOpen: false });
  },
  resetDemoData: () => {
    useDraftsStore.getState().reset();
    useNarrativesStore.getState().reset();
    useAuditStore.getState().reset();
    useRoleStore.getState().setRole("writer");
    useModeStore.getState().setMode("simulated");
  },
}));
