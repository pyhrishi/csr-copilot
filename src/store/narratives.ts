import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { NarrativeSentence } from "@/lib/narratives";
import { assembleNarrative } from "@/lib/narratives";
import type { NarrativeTemplate } from "@/lib/data/seed-types";
import type { Patient, Role } from "@/lib/types";
import { STORE_PREFIX, persistStorage } from "./storage";

export type NarrativePatientStatus = "ready" | "exception" | "drafted" | "reviewed" | "returned";

export interface NarrativeDraft {
  patientId: string;
  type: "SAE" | "Death";
  sentences: NarrativeSentence[];
  generatedAt: string;
}

export interface NarrativeReview {
  decision: "approved" | "returned";
  comment?: string;
  reviewer: string;
  role: Role;
  at: string;
}

interface NarrativesState {
  drafts: Record<string, NarrativeDraft>;
  statuses: Record<string, NarrativePatientStatus>;
  reviews: Record<string, NarrativeReview>;
  isGeneratingBatch: boolean;
  batchProgress: { current: number; total: number; currentPatientId?: string };
  setDraft: (patientId: string, draft: NarrativeDraft) => void;
  setStatus: (patientId: string, status: NarrativePatientStatus) => void;
  setReview: (patientId: string, review: NarrativeReview) => void;
  generatePatientNarrative: (patient: Patient, template: NarrativeTemplate) => boolean;
  generateAllReady: (
    patients: Patient[],
    template: NarrativeTemplate,
    onStep?: (current: number, total: number, patientId: string) => void,
  ) => Promise<{ drafted: number; skipped: number }>;
  reset: () => void;
}

export const useNarrativesStore = create<NarrativesState>()(
  persist(
    (set, get) => ({
      drafts: {},
      statuses: {},
      reviews: {},
      isGeneratingBatch: false,
      batchProgress: { current: 0, total: 0 },

      setDraft: (patientId, draft) =>
        set((state) => ({
          drafts: { ...state.drafts, [patientId]: draft },
          statuses: {
            ...state.statuses,
            [patientId]: state.statuses[patientId] === "reviewed" ? "reviewed" : "drafted",
          },
        })),

      setStatus: (patientId, status) =>
        set((state) => ({
          statuses: { ...state.statuses, [patientId]: status },
        })),

      setReview: (patientId, review) =>
        set((state) => ({
          reviews: { ...state.reviews, [patientId]: review },
          statuses: {
            ...state.statuses,
            [patientId]: review.decision === "approved" ? "reviewed" : "returned",
          },
        })),

      generatePatientNarrative: (patient, template) => {
        const result = assembleNarrative(patient, template);
        if (!result.ok) {
          set((state) => ({
            statuses: { ...state.statuses, [patient.id]: "exception" },
          }));
          return false;
        }

        const draft: NarrativeDraft = {
          patientId: patient.id,
          type: result.type,
          sentences: result.sentences,
          generatedAt: new Date().toISOString(),
        };

        set((state) => ({
          drafts: { ...state.drafts, [patient.id]: draft },
          statuses: { ...state.statuses, [patient.id]: "drafted" },
        }));
        return true;
      },

      generateAllReady: async (patients, template, onStep) => {
        const readyPatients = patients.filter((p) => {
          const currentStatus = get().statuses[p.id] ?? (p.status === "exception" ? "exception" : "ready");
          return currentStatus === "ready" && p.status !== "exception";
        });

        const total = readyPatients.length;
        set({ isGeneratingBatch: true, batchProgress: { current: 0, total } });

        let draftedCount = 0;
        const newDrafts: Record<string, NarrativeDraft> = {};
        const newStatuses: Record<string, NarrativePatientStatus> = {};

        // Also ensure exceptions have explicit exception status
        for (const p of patients) {
          if (p.status === "exception") {
            newStatuses[p.id] = "exception";
          }
        }

        for (let i = 0; i < readyPatients.length; i++) {
          const p = readyPatients[i];
          set({ batchProgress: { current: i + 1, total, currentPatientId: p.id } });
          onStep?.(i + 1, total, p.id);

          // Small delay for streaming feel during batch generation
          await new Promise((resolve) => setTimeout(resolve, 80));

          const result = assembleNarrative(p, template);
          if (result.ok) {
            newDrafts[p.id] = {
              patientId: p.id,
              type: result.type,
              sentences: result.sentences,
              generatedAt: new Date().toISOString(),
            };
            newStatuses[p.id] = "drafted";
            draftedCount++;
          }
        }

        set((state) => ({
          drafts: { ...state.drafts, ...newDrafts },
          statuses: { ...state.statuses, ...newStatuses },
          isGeneratingBatch: false,
          batchProgress: { current: total, total },
        }));

        const skipped = patients.length - draftedCount;
        return { drafted: draftedCount, skipped };
      },

      reset: () =>
        set({
          drafts: {},
          statuses: {},
          reviews: {},
          isGeneratingBatch: false,
          batchProgress: { current: 0, total: 0 },
        }),
    }),
    {
      name: `${STORE_PREFIX}narratives`,
      storage: persistStorage,
      skipHydration: true,
    },
  ),
);
