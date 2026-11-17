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

export interface RolePersona {
  name: string;
  title: string;
  email: string;
}

export const ROLE_PERSONAS: Record<Role, RolePersona> = {
  writer: {
    name: "Dr. Sarah Chen",
    title: "Lead Medical Writer",
    email: "s.chen@meridian-pharma.com",
  },
  biostat: {
    name: "Marcus Vance, PhD",
    title: "Principal Biostatistician",
    email: "m.vance@meridian-pharma.com",
  },
  regulatory: {
    name: "Rachel Adams",
    title: "Regulatory Affairs Director",
    email: "r.adams@meridian-pharma.com",
  },
  qa: {
    name: "David Kim",
    title: "Quality Assurance Lead",
    email: "d.kim@meridian-pharma.com",
  },
  exec: {
    name: "Dr. Arthur Pendelton",
    title: "VP Clinical Operations",
    email: "a.pendelton@meridian-pharma.com",
  },
};

export function rolePersona(role: Role): RolePersona {
  return (
    ROLE_PERSONAS[role] ?? {
      name: roleLabel(role),
      title: roleLabel(role),
      email: `${role}@meridian-pharma.com`,
    }
  );
}
