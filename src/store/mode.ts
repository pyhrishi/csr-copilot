import { create } from "zustand";
import { persist } from "zustand/middleware";

import { STORE_PREFIX, persistStorage } from "./storage";

export type AiMode = "simulated" | "live";

/** Static default; dynamically overridden when server reports live AI status. */
export let LIVE_MODE_AVAILABLE = false;

interface ModeState {
  mode: AiMode;
  liveAvailable: boolean;
  liveModel?: string;
  liveProvider?: string;
  /** Returns false (and leaves the mode unchanged) when the requested mode is unavailable. */
  setMode: (mode: AiMode) => boolean;
  setLiveAvailable: (available: boolean, model?: string, provider?: string) => void;
  checkLiveStatus: () => Promise<boolean>;
}

export const useModeStore = create<ModeState>()(
  persist(
    (set, get) => ({
      mode: "simulated",
      liveAvailable: false,
      setMode: (mode) => {
        const isAvail = get().liveAvailable || LIVE_MODE_AVAILABLE;
        if (mode === "live" && !isAvail) return false;
        set({ mode });
        return true;
      },
      setLiveAvailable: (available, model, provider) => {
        LIVE_MODE_AVAILABLE = available;
        const currentMode = get().mode;
        set({
          liveAvailable: available,
          liveModel: model,
          liveProvider: provider,
          // If live mode became unavailable and current mode was live, fallback to simulated
          ...(currentMode === "live" && !available ? { mode: "simulated" } : {}),
        });
      },
      checkLiveStatus: async () => {
        try {
          const res = await fetch("/api/generate/status");
          if (!res.ok) {
            get().setLiveAvailable(false);
            return false;
          }
          const data = await res.json();
          const isConfigured = Boolean(data.configured);
          get().setLiveAvailable(isConfigured, data.model, data.provider);
          return isConfigured;
        } catch {
          get().setLiveAvailable(false);
          return false;
        }
      },
    }),
    {
      name: `${STORE_PREFIX}mode`,
      storage: persistStorage,
      skipHydration: true,
      // Never restore "live" from storage while it is unavailable.
      merge: (persisted, current) => {
        const mode = (persisted as Partial<ModeState> | undefined)?.mode;
        const isAvail = current.liveAvailable || LIVE_MODE_AVAILABLE;
        return {
          ...current,
          mode: mode === "live" && !isAvail ? "simulated" : (mode ?? current.mode),
        };
      },
    },
  ),
);
