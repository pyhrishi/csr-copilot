import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { AuditEvent } from "@/lib/types";
import { STORE_PREFIX, persistStorage } from "./storage";

export type NewAuditEvent = Omit<AuditEvent, "id" | "at">;

// Append-only: `append` is the only mutator. There is deliberately no edit or delete.
// (src/lib/audit adds richer helpers in M1.)
interface AuditState {
  events: readonly AuditEvent[];
  append: (event: NewAuditEvent) => AuditEvent;
}

export const useAuditStore = create<AuditState>()(
  persist(
    (set) => ({
      events: [],
      append: (event) => {
        const stored: AuditEvent = Object.freeze({
          ...event,
          id: crypto.randomUUID(),
          at: new Date().toISOString(),
        });
        set((state) => ({ events: [...state.events, stored] }));
        return stored;
      },
    }),
    { name: `${STORE_PREFIX}audit`, storage: persistStorage, skipHydration: true },
  ),
);
