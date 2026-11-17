import { describe, expect, it } from "vitest";

import { runCrossSectionConsistency } from "./index";
import { getFacts, getPatients } from "@/lib/data/seed";

describe("cross-section consistency checks", () => {
  const facts = getFacts();
  const patients = getPatients();

  it("evaluates all cross-section checks as matched against real study seed data", () => {
    const checks = runCrossSectionConsistency(facts, patients);

    expect(checks).toHaveLength(4);

    // Deaths check
    const deathsCheck = checks.find((c) => c.id === "chk-deaths");
    expect(deathsCheck?.status).toBe("matched");
    expect(deathsCheck?.sourceA.value).toContain("2 patients");
    expect(deathsCheck?.sourceB.value).toContain("2 profiles");

    // SAE check
    const saeCheck = checks.find((c) => c.id === "chk-sae");
    expect(saeCheck?.status).toBe("matched");
    expect(saeCheck?.sourceA.value).toContain("12 patients");
    expect(saeCheck?.sourceB.value).toContain("12 patient profiles");

    // Disposition identity check
    const dispCheck = checks.find((c) => c.id === "chk-disposition-treated");
    expect(dispCheck?.status).toBe("matched");
    expect(dispCheck?.sourceA.value).toContain("597 patients accounted for");
    expect(dispCheck?.sourceB.value).toContain("597 patients treated");

    // Reasons check
    const reasonsCheck = checks.find((c) => c.id === "chk-disposition-reasons");
    expect(reasonsCheck?.status).toBe("matched");
    expect(reasonsCheck?.sourceA.value).toContain("60 reasons");
  });

  it("detects mismatch when data discrepancies exist", () => {
    // 1. SAE mismatch: trimmed patients list
    const trimmedPatients = patients.slice(0, 10);
    const checks1 = runCrossSectionConsistency(facts, trimmedPatients);
    const saeCheck = checks1.find((c) => c.id === "chk-sae");
    expect(saeCheck?.status).toBe("mismatch");
    expect(saeCheck?.detail).toContain("does not equal narrative queue roster");

    // 2. Deaths mismatch: no deaths in patients list
    const nonFatalPatients = patients.filter((p) => p.seriousness !== "Death");
    const checks2 = runCrossSectionConsistency(facts, nonFatalPatients);
    const deathsCheck = checks2.find((c) => c.id === "chk-deaths");
    expect(deathsCheck?.status).toBe("mismatch");
    expect(deathsCheck?.detail).toContain("Discrepancy detected between Section 12.3 death count");

    // 3. Disposition treated mismatch: facts with altered completed count
    const corruptedFacts = facts.map((f) =>
      f.id === "14.1.1.completed.velo"
        ? { ...f, value: { ...f.value, n: 999 } }
        : f,
    );
    const checks3 = runCrossSectionConsistency(corruptedFacts, patients);
    const dispCheck = checks3.find((c) => c.id === "chk-disposition-treated");
    expect(dispCheck?.status).toBe("mismatch");
    expect(dispCheck?.detail).toContain("Patient disposition discrepancy");

    // 4. Discontinuation reasons mismatch
    const corruptedFacts2 = facts.map((f) =>
      f.id === "14.1.1.disc_ae.velo"
        ? { ...f, value: { ...f.value, n: 999 } }
        : f,
    );
    const checks4 = runCrossSectionConsistency(corruptedFacts2, patients);
    const reasonsCheck = checks4.find((c) => c.id === "chk-disposition-reasons");
    expect(reasonsCheck?.status).toBe("mismatch");
    expect(reasonsCheck?.detail).toContain("Primary discontinuation reason breakdown does not equal");
  });
});
