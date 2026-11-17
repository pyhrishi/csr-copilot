export { useAuditStore, type NewAuditEvent } from "./audit";
export { useDraftsStore } from "./drafts";
export { LIVE_MODE_AVAILABLE, useModeStore, type AiMode } from "./mode";
export { useRoleStore } from "./role";
export { STORE_PREFIX } from "./storage";

import { useAuditStore } from "./audit";
import { useDraftsStore } from "./drafts";
import { useModeStore } from "./mode";
import { useRoleStore } from "./role";

/** Every persisted store, for rehydration after mount (see StoreHydrator). */
export const persistedStores = [useRoleStore, useModeStore, useDraftsStore, useAuditStore] as const;
