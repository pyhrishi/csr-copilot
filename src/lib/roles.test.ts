import { describe, expect, it } from "vitest";

import { DEFAULT_ROLE, ROLES, roleLabel } from "./roles";

describe("roles", () => {
  it("labels every role, defaults to Medical Writer and falls back to the id", () => {
    expect(ROLES.map((r) => roleLabel(r.id))).toEqual(ROLES.map((r) => r.label));
    expect(roleLabel(DEFAULT_ROLE)).toBe("Medical Writer");
    expect(roleLabel("auditor" as never)).toBe("auditor");
  });
});
