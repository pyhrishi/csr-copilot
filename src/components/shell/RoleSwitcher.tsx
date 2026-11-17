"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLES } from "@/lib/roles";
import type { Role } from "@/lib/types";
import { useRoleStore } from "@/store";

const items = ROLES.map((r) => ({ value: r.id, label: r.label }));

export function RoleSwitcher() {
  const role = useRoleStore((s) => s.role);
  const setRole = useRoleStore((s) => s.setRole);

  return (
    <div className="flex items-center gap-2">
      <span id="role-label" className="label">
        Role
      </span>
      <Select items={items} value={role} onValueChange={(value) => value && setRole(value as Role)}>
        <SelectTrigger aria-labelledby="role-label" className="h-9 min-w-44 bg-card">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
