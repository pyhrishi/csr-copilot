import type { Role } from "@/lib/types";

/** Display labels for the header role switcher, in switcher order. Medical Writer is the default. */
export const ROLES: readonly { id: Role; label: string }[] = [
  { id: "writer", label: "Medical Writer" },
  { id: "biostat", label: "Biostatistician" },
  { id: "regulatory", label: "Regulatory" },
  { id: "qa", label: "QA" },
  { id: "exec", label: "Executive" },
];

export const DEFAULT_ROLE: Role = "writer";

export function roleLabel(role: Role): string {
  return ROLES.find((r) => r.id === role)?.label ?? role;
}
