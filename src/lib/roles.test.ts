import { describe, expect, it } from "vitest";

import { DEFAULT_ROLE, ROLES, roleLabel, rolePersona } from "./roles";

describe("roles", () => {
  it("labels every role, defaults to Medical Writer and falls back to the id", () => {
    expect(ROLES.map((r) => roleLabel(r.id))).toEqual(ROLES.map((r) => r.label));
    expect(roleLabel(DEFAULT_ROLE)).toBe("Medical Writer");
    expect(roleLabel("auditor" as never)).toBe("auditor");
  });

  it("returns person name and title for every role and falls back gracefully", () => {
    expect(rolePersona("biostat").name).toBe("Marcus Vance, PhD");
    expect(rolePersona("biostat").title).toBe("Principal Biostatistician");
    expect(rolePersona("writer").name).toBe("Dr. Sarah Chen");
    expect(rolePersona("unknown" as never).name).toBe("unknown");
  });
});
