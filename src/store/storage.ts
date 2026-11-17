import { createJSONStorage } from "zustand/middleware";

/** Prefix for every persisted store key in localStorage. */
export const STORE_PREFIX = "csr-copilot:";

/** localStorage-backed JSON storage. Stores use skipHydration and are rehydrated after mount by StoreHydrator. */
export const persistStorage = createJSONStorage(() => localStorage);
