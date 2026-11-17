import { beforeEach, describe, expect, it } from "vitest";

import { DEFAULT_ROLE } from "@/lib/roles";
import {
  STORE_PREFIX,
  persistedStores,
  useAuditStore,
  useDraftsStore,
  useModeStore,
  useNarrativesStore,
  useRoleStore,
} from "@/store";

describe("client stores", () => {
  beforeEach(() => {
    localStorage.clear();
    useRoleStore.setState({ role: DEFAULT_ROLE });
    useModeStore.setState({ mode: "simulated" });
    useDraftsStore.setState({ sentences: {} });
    useAuditStore.setState({ events: [] });
  });

  it("start with the Medical Writer role, Simulated mode and empty drafts and audit", () => {
    expect(useRoleStore.getState().role).toBe("writer");
    expect(useModeStore.getState().mode).toBe("simulated");
    expect(useDraftsStore.getState().sentences).toEqual({});
    expect(useAuditStore.getState().events).toEqual([]);
  });

  it("persist the role to localStorage under the app prefix", () => {
    useRoleStore.getState().setRole("biostat");
    const saved = JSON.parse(localStorage.getItem(`${STORE_PREFIX}role`) ?? "{}");
    expect(saved.state.role).toBe("biostat");
  });

  it("refuse Live mode until it is available", () => {
    useModeStore.getState().setLiveAvailable(false);
    expect(useModeStore.getState().setMode("live")).toBe(false);
    expect(useModeStore.getState().mode).toBe("simulated");
  });

  it("enables Live mode when live status is set to available", () => {
    useModeStore.getState().setLiveAvailable(true, "llama-3.3-70b-versatile", "groq");
    expect(useModeStore.getState().setMode("live")).toBe(true);
    expect(useModeStore.getState().mode).toBe("live");
    expect(useModeStore.getState().liveModel).toBe("llama-3.3-70b-versatile");
    expect(useModeStore.getState().liveProvider).toBe("groq");

    // Falls back to simulated if live availability is revoked
    useModeStore.getState().setLiveAvailable(false);
    expect(useModeStore.getState().mode).toBe("simulated");
  });

  it("never rehydrate Live mode from storage while it is unavailable", async () => {
    localStorage.setItem(
      `${STORE_PREFIX}mode`,
      JSON.stringify({ state: { mode: "live" }, version: 0 }),
    );
    await useModeStore.persist.rehydrate();
    expect(useModeStore.getState().mode).toBe("simulated");
  });

  it("append audit events with an id and timestamp, and freeze them", () => {
    const event = useAuditStore.getState().append({
      actor: "Demo user",
      role: "writer",
      action: "generate",
      objectId: "12.2-s1",
      detail: "Simulated generation",
    });
    expect(event.id).toBeTruthy();
    expect(Date.parse(event.at)).not.toBeNaN();
    expect(Object.isFrozen(event)).toBe(true);
    expect(useAuditStore.getState().events).toEqual([event]);
  });

  it("stores and updates sentences in useDraftsStore", () => {
    const sentence = {
      id: "12.2-s1",
      sectionId: "12.2",
      template: "Test sentence",
      rendered: [],
      provenance: "ai" as const,
      state: "pending" as const,
      cites: [],
      generation: { mode: "simulated" as const, promptVersion: "v1", templateVersion: "v1", at: "" },
      findings: [],
    };
    useDraftsStore.getState().setSentence(sentence);
    expect(useDraftsStore.getState().sentences["12.2-s1"]).toEqual(sentence);

    useDraftsStore.getState().setSentenceState("12.2-s1", "accepted");
    expect(useDraftsStore.getState().sentences["12.2-s1"].state).toBe("accepted");
  });

  it("stores narratives drafts and reviews in useNarrativesStore", () => {
    useNarrativesStore.getState().setDraft("CRD301-1042", {
      patientId: "CRD301-1042",
      type: "SAE",
      sentences: [],
      generatedAt: new Date().toISOString(),
    });
    expect(useNarrativesStore.getState().drafts["CRD301-1042"]).toBeDefined();
    expect(useNarrativesStore.getState().statuses["CRD301-1042"]).toBe("drafted");

    useNarrativesStore.getState().setReview("CRD301-1042", {
      decision: "approved",
      reviewer: "Dr. Sarah Chen",
      role: "writer",
      at: new Date().toISOString(),
    });
    expect(useNarrativesStore.getState().statuses["CRD301-1042"]).toBe("reviewed");
  });

  it("expose every persisted store for rehydration", () => {
    for (const store of persistedStores) expect(typeof store.persist.rehydrate).toBe("function");
  });
});
