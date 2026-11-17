import { beforeEach, describe, expect, it } from "vitest";

import { DEFAULT_ROLE } from "@/lib/roles";
import {
  STORE_PREFIX,
  persistedStores,
  useAuditStore,
  useDraftsStore,
  useModeStore,
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
    expect(useModeStore.getState().setMode("live")).toBe(false);
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

  it("expose every persisted store for rehydration", () => {
    for (const store of persistedStores) expect(typeof store.persist.rehydrate).toBe("function");
  });
});
