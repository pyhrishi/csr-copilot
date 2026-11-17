import { create } from "zustand";
import { persist } from "zustand/middleware";

import { EMPTY_LOG, appendEvent, restoreLog, type AuditLog, type NewAuditEvent } from "@/lib/audit";
import type { AuditEvent } from "@/lib/types";
import { STORE_PREFIX, persistStorage } from "./storage";

export type { NewAuditEvent } from "@/lib/audit";

// Append-only: `append` is the only mutator; the log itself lives in src/lib/audit.
interface AuditState {
  events: AuditLog;
  append: (event: NewAuditEvent) => AuditEvent;
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
