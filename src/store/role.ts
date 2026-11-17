import { create } from "zustand";
import { persist } from "zustand/middleware";

import { DEFAULT_ROLE } from "@/lib/roles";
import type { Role } from "@/lib/types";
import { STORE_PREFIX, persistStorage } from "./storage";

interface RoleState {
  role: Role;
  setRole: (role: Role) => void;
}

export const useRoleStore = create<RoleState>()(
  persist(
    (set) => ({
      role: DEFAULT_ROLE,
      setRole: (role) => set({ role }),
    }),
    { name: `${STORE_PREFIX}role`, storage: persistStorage, skipHydration: true },
  ),
);
