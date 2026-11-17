import { describe, expect, it } from "vitest";

import { getPatient, getSection } from "@/lib/data/seed";
import { DEMO_PATIENT_ID, DEMO_SECTION_ID, SCREENS, screenForPath } from "./nav";

describe("screen registry", () => {
  it("lists every screen from the brief once, S1 to S11 in order", () => {
    expect(SCREENS.map((s) => s.id)).toEqual(
      Array.from({ length: SCREENS.length }, (_, i) => `S${i + 1}`),
    );
    expect(SCREENS.map((s) => s.id).at(-1)).toBe("S11");
    expect(new Set(SCREENS.map((s) => s.href)).size).toBe(SCREENS.length);
  });

  it("matches each screen's own href to that screen only", () => {
    for (const screen of SCREENS) {
      expect(screenForPath(screen.href)?.id, screen.href).toBe(screen.id);
      expect(
        SCREENS.filter((s) => s.match.test(screen.href)),
        screen.href,
      ).toHaveLength(1);
    }
  });

  it("links dynamic screens to records that exist in the seed", () => {
    expect(getSection(DEMO_SECTION_ID)).toBeDefined();
    expect(getPatient(DEMO_PATIENT_ID)).toBeDefined();
  });

  it("names a milestone for every stubbed screen", () => {
    for (const screen of SCREENS) expect(screen.milestone).toMatch(/^M\d$/);
  });
});
