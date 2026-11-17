export { useAuditStore, type NewAuditEvent } from "./audit";
export { useDraftsStore } from "./drafts";
export { LIVE_MODE_AVAILABLE, useModeStore, type AiMode } from "./mode";
export { useRoleStore } from "./role";
export {
  useNarrativesStore,
  type NarrativeDraft,
  type NarrativePatientStatus,
  type NarrativeReview,
} from "./narratives";
export { STORE_PREFIX } from "./storage";

import { useAuditStore } from "./audit";
import { useDraftsStore } from "./drafts";
import { useModeStore } from "./mode";
import { useNarrativesStore } from "./narratives";
import { useRoleStore } from "./role";

/** Every persisted store, for rehydration after mount (see StoreHydrator). */
export const persistedStores = [
  useRoleStore,
  useModeStore,
  useDraftsStore,
  useAuditStore,
  useNarrativesStore,
] as const;
