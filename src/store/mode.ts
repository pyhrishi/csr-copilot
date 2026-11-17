import { create } from "zustand";
import { persist } from "zustand/middleware";

import { STORE_PREFIX, persistStorage } from "./storage";

export type AiMode = "simulated" | "live";

/** Live AI mode is wired up in M8 (optional ANTHROPIC_API_KEY). Until then only Simulated is selectable. */
export const LIVE_MODE_AVAILABLE = false;

interface ModeState {
  mode: AiMode;
  /** Returns false (and leaves the mode unchanged) when the requested mode is unavailable. */
  setMode: (mode: AiMode) => boolean;
}

export const useModeStore = create<ModeState>()(
  persist(
    (set) => ({
      mode: "simulated",
      setMode: (mode) => {
        if (mode === "live" && !LIVE_MODE_AVAILABLE) return false;
        set({ mode });
        return true;
      },
    }),
    {
      name: `${STORE_PREFIX}mode`,
      storage: persistStorage,
      skipHydration: true,
      // Never restore "live" from storage while it is unavailable.
      merge: (persisted, current) => {
        const mode = (persisted as Partial<ModeState> | undefined)?.mode;
        return {
          ...current,
          mode: mode === "live" && !LIVE_MODE_AVAILABLE ? "simulated" : (mode ?? current.mode),
        };
      },
    },
  ),
);
