import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { DraftSentence, Fact, SentenceState, Tlf } from "@/lib/types";
import type { SectionDraftStatus } from "@/lib/study-readiness";
import type { TlfUpdate } from "@/lib/tlf-change";
import { STORE_PREFIX, persistStorage } from "./storage";

// Draft state per sentence id. Generation, accept/edit/reject and fills arrive in M1/M3.
interface DraftsState {
  sentences: Record<string, DraftSentence>;
  sectionStatuses: Record<string, SectionDraftStatus>;
  tlfRevisionApplied: boolean;
  updatedSentenceIds: Record<string, boolean>;
  customFacts: Record<string, Fact>;
  customTlfs: Record<string, Tlf>;
  setSentence: (sentence: DraftSentence) => void;
  setSentences: (sentences: DraftSentence[]) => void;
  setSentenceState: (id: string, state: SentenceState) => void;
  setSectionStatus: (sectionId: string, status: SectionDraftStatus) => void;
  applyTlfUpdate: (update: TlfUpdate, reRenderedSentences: DraftSentence[]) => void;
  revertTlfUpdate: () => void;
  reset: () => void;
}

export const useDraftsStore = create<DraftsState>()(
  persist(
    (set) => ({
      sentences: {},
      sectionStatuses: {},
      tlfRevisionApplied: false,
      updatedSentenceIds: {},
      customFacts: {},
      customTlfs: {},
      setSentence: (sentence) =>
        set((state) => ({
          sentences: { ...state.sentences, [sentence.id]: sentence },
        })),
      setSentences: (sentences) =>
        set((state) => {
          const updated = { ...state.sentences };
          for (const s of sentences) {
            updated[s.id] = s;
          }
          return { sentences: updated };
        }),
      setSentenceState: (id, sentenceState) =>
        set((state) => {
          const existing = state.sentences[id];
          if (!existing) return state;
          return {
            sentences: {
              ...state.sentences,
              [id]: { ...existing, state: sentenceState },
            },
          };
        }),
      setSectionStatus: (sectionId, status) =>
        set((state) => ({
          sectionStatuses: {
            ...state.sectionStatuses,
            [sectionId]: status,
          },
        })),
      applyTlfUpdate: (update, reRenderedSentences) =>
        set((state) => {
          const newCustomFacts = { ...state.customFacts };
          for (const f of update.facts) {
            newCustomFacts[f.id] = f;
          }
          const newCustomTlfs = { ...state.customTlfs };
          for (const t of update.tlfs) {
            newCustomTlfs[t.id] = t;
          }
          const newSentences = { ...state.sentences };
          const newUpdatedSentenceIds = { ...state.updatedSentenceIds };
          for (const s of reRenderedSentences) {
            newSentences[s.id] = s;
            newUpdatedSentenceIds[s.id] = true;
          }
          return {
            tlfRevisionApplied: true,
            updatedSentenceIds: newUpdatedSentenceIds,
            customFacts: newCustomFacts,
            customTlfs: newCustomTlfs,
            sentences: newSentences,
          };
        }),
      revertTlfUpdate: () =>
        set({
          tlfRevisionApplied: false,
          updatedSentenceIds: {},
          customFacts: {},
          customTlfs: {},
        }),
      reset: () =>
        set({
          sentences: {},
          sectionStatuses: {},
          tlfRevisionApplied: false,
          updatedSentenceIds: {},
          customFacts: {},
          customTlfs: {},
        }),
    }),
    { name: `${STORE_PREFIX}drafts`, storage: persistStorage, skipHydration: true },
  ),
);
