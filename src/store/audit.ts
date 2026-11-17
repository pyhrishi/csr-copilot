import { create } from "zustand";
import { persist } from "zustand/middleware";

import { EMPTY_LOG, appendEvent, restoreLog, type AuditLog, type NewAuditEvent } from "@/lib/audit";
import type { AuditEvent } from "@/lib/types";
import { STORE_PREFIX, persistStorage } from "./storage";

export type { NewAuditEvent } from "@/lib/audit";

// Append-only in production: `append` adds events; `reset` is provided for demo walkthrough reset.
interface AuditState {
  events: AuditLog;
  append: (event: NewAuditEvent) => AuditEvent;
  reset: () => void;
}

export const useAuditStore = create<AuditState>()(
  persist(
    (set, get) => ({
      events: EMPTY_LOG,
      append: (event) => {
        const events = appendEvent(get().events, event);
        set({ events });
        return events.at(-1)!;
      },
      reset: () => {
        set({ events: EMPTY_LOG });
      },
    }),
    {
      name: `${STORE_PREFIX}audit`,
      storage: persistStorage,
      skipHydration: true,
      merge: (persisted, current) => ({
        ...current,
        events: restoreLog((persisted as Partial<AuditState> | undefined)?.events ?? []),
      }),
    },
  ),
);
