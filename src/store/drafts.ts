import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { DraftSentence, SentenceState } from "@/lib/types";
import { STORE_PREFIX, persistStorage } from "./storage";

// Draft state per sentence id. Generation, accept/edit/reject and fills arrive in M1/M3.
interface DraftsState {
  sentences: Record<string, DraftSentence>;
  setSentence: (sentence: DraftSentence) => void;
  setSentences: (sentences: DraftSentence[]) => void;
  setSentenceState: (id: string, state: SentenceState) => void;
  reset: () => void;
}

export const useDraftsStore = create<DraftsState>()(
  persist(
    (set) => ({
      sentences: {},
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
      reset: () => set({ sentences: {} }),
    }),
    { name: `${STORE_PREFIX}drafts`, storage: persistStorage, skipHydration: true },
  ),
);
