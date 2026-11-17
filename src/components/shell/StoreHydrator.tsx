"use client";

import { useEffect } from "react";

import { persistedStores } from "@/store";

/** Restores persisted client state after mount, so server and first client render match. */
export function StoreHydrator() {
  useEffect(() => {
    for (const store of persistedStores) void store.persist.rehydrate();
  }, []);
  return null;
}
