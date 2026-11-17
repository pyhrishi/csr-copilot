import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { DraftSentence } from "@/lib/types";
import { STORE_PREFIX, persistStorage } from "./storage";

// Draft state per sentence id. Generation, accept/edit/reject and fills arrive in M1/M3.
interface DraftsState {
  sentences: Record<string, DraftSentence>;
  reset: () => void;
}

export const useDraftsStore = create<DraftsState>()(
  persist(
    (set) => ({
      sentences: {},
      reset: () => set({ sentences: {} }),
    }),
    { name: `${STORE_PREFIX}drafts`, storage: persistStorage, skipHydration: true },
  ),
);
