import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { DraftSentence, Fact, Section, SentenceState, Tlf } from "@/lib/types";
import type { SectionDraftStatus } from "@/lib/study-readiness";
import type { TlfUpdate } from "@/lib/tlf-change";
import { reopenSignedSections, sentenceContentChanged } from "@/lib/signoff";
import { rolePersona } from "@/lib/roles";
import { useAuditStore } from "./audit";
import { useRoleStore } from "./role";
import { STORE_PREFIX, persistStorage } from "./storage";

// Draft state per sentence id. Generation, accept/edit/reject and fills arrive in M1/M3.
interface DraftsState {
  sentences: Record<string, DraftSentence>;
  sectionStatuses: Record<string, SectionDraftStatus>;
  sectionAutonomy: Record<string, "L0" | "L1" | "L2" | "L3">;
  tlfRevisionApplied: boolean;
  updatedSentenceIds: Record<string, boolean>;
  customFacts: Record<string, Fact>;
  customTlfs: Record<string, Tlf>;
  customSections: Record<string, Section>;
  setSentence: (sentence: DraftSentence) => void;
  setSentences: (sentences: DraftSentence[]) => void;
  setSentenceState: (id: string, state: SentenceState) => void;
  setSectionStatus: (sectionId: string, status: SectionDraftStatus) => void;
  setSectionAutonomy: (sectionId: string, level: "L0" | "L1" | "L2" | "L3") => void;
  addCustomSection: (section: Section) => void;
  setCustomFact: (fact: Fact) => void;
  setCustomTlf: (tlf: Tlf) => void;
  applyTlfUpdate: (update: TlfUpdate, reRenderedSentences: DraftSentence[]) => void;
  revertTlfUpdate: () => void;
  reset: () => void;
}

/** Logs each revoked sign-off after the store update that caused it. */
function logRevocations(sectionIds: readonly string[], cause: string) {
  if (sectionIds.length === 0) return;
  const role = useRoleStore.getState().role;
  const actor = rolePersona(role).name;
  for (const sectionId of sectionIds) {
    useAuditStore.getState().append({
      actor,
      role,
      action: "sign_off_revoked",
      objectId: sectionId,
      detail: `Sign-off on Section ${sectionId} revoked: ${cause}. The section is back In Review and needs a new sign-off.`,
    });
  }
}

export const useDraftsStore = create<DraftsState>()(
  persist(
    (set, get) => ({
      sentences: {},
      sectionStatuses: {},
      sectionAutonomy: {},
      tlfRevisionApplied: false,
      updatedSentenceIds: {},
      customFacts: {},
      customTlfs: {},
      customSections: {},
      addCustomSection: (section) =>
        set((state) => ({
          customSections: { ...state.customSections, [section.id]: section },
        })),
      setCustomFact: (fact) =>
        set((state) => ({
          customFacts: { ...state.customFacts, [fact.id]: fact },
        })),
      setCustomTlf: (tlf) =>
        set((state) => ({
          customTlfs: { ...state.customTlfs, [tlf.id]: tlf },
        })),
      setSentence: (sentence) => {
        const changed = sentenceContentChanged(get().sentences[sentence.id], sentence);
        const { statuses, reopened } = reopenSignedSections(
          get().sectionStatuses,
          changed ? [sentence.sectionId] : [],
        );
        set((state) => ({
          sentences: { ...state.sentences, [sentence.id]: sentence },
          sectionStatuses: statuses,
        }));
        logRevocations(reopened, `sentence ${sentence.id} changed after sign-off`);
      },
      setSentences: (sentences) => {
        const current = get().sentences;
        const changedSections = sentences
          .filter((s) => sentenceContentChanged(current[s.id], s))
          .map((s) => s.sectionId);
        const { statuses, reopened } = reopenSignedSections(get().sectionStatuses, changedSections);
        set((state) => {
          const updated = { ...state.sentences };
          for (const s of sentences) {
            updated[s.id] = s;
          }
          return { sentences: updated, sectionStatuses: statuses };
        });
        logRevocations(reopened, "sentences regenerated after sign-off");
      },
      setSentenceState: (id, sentenceState) => {
        const existing = get().sentences[id];
        if (!existing || existing.state === sentenceState) return;
        const { statuses, reopened } = reopenSignedSections(get().sectionStatuses, [
          existing.sectionId,
        ]);
        set((state) => ({
          sentences: {
            ...state.sentences,
            [id]: { ...existing, state: sentenceState },
          },
          sectionStatuses: statuses,
        }));
        logRevocations(reopened, `sentence ${id} marked ${sentenceState} after sign-off`);
      },
      setSectionStatus: (sectionId, status) =>
        set((state) => ({
          sectionStatuses: {
            ...state.sectionStatuses,
            [sectionId]: status,
          },
        })),
      setSectionAutonomy: (sectionId, level) =>
        set((state) => ({
          sectionAutonomy: {
            ...state.sectionAutonomy,
            [sectionId]: level,
          },
        })),
      applyTlfUpdate: (update, reRenderedSentences) => {
        const { statuses, reopened } = reopenSignedSections(
          get().sectionStatuses,
          reRenderedSentences.map((s) => s.sectionId),
        );
        set((state) => {
          const newCustomFacts = { ...state.customFacts };
          for (const f of update.facts) {
            newCustomFacts[f.id] = f;
          }
          const newCustomTlfs = { ...state.customTlfs };
          for (const t of update.tlfs) {
            newCustomTlfs[t.id] = t;
          }
          const newSentences = { ...state.sentences };
          const newUpdatedSentenceIds = { ...state.updatedSentenceIds };
          for (const s of reRenderedSentences) {
            newSentences[s.id] = s;
            newUpdatedSentenceIds[s.id] = true;
          }
          return {
            tlfRevisionApplied: true,
            updatedSentenceIds: newUpdatedSentenceIds,
            customFacts: newCustomFacts,
            customTlfs: newCustomTlfs,
            sentences: newSentences,
            sectionStatuses: statuses,
          };
        });
        logRevocations(reopened, `Table ${update.tlfId} re-run changed a cited number`);
      },
      revertTlfUpdate: () =>
        set({
          tlfRevisionApplied: false,
          updatedSentenceIds: {},
          customFacts: {},
          customTlfs: {},
        }),
      reset: () =>
        set({
          sentences: {},
          sectionStatuses: {},
          sectionAutonomy: {},
          tlfRevisionApplied: false,
          updatedSentenceIds: {},
          customFacts: {},
          customTlfs: {},
          customSections: {},
        }),
    }),
    { name: `${STORE_PREFIX}drafts`, storage: persistStorage, skipHydration: true },
  ),
);
