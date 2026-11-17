import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  getFact,
  getFacts,
  getNarrativeTemplate,
  getPatient,
  getPatients,
  getRules,
  getSection,
  getSections,
  getStudy,
  getTlf,
  getTlfRevision,
  getTlfs,
} from "./seed";

// Expected values are read from the raw seed files, never hard-coded here.
const raw = (file: string) =>
  JSON.parse(readFileSync(join(process.cwd(), "data", "seed", file), "utf8"));

describe("seed loaders", () => {
  it("unwrap every seed file and return all of its records", () => {
    expect(getStudy().id).toBe(raw("study.json").id);
    expect(getFacts()).toHaveLength(raw("facts.json").facts.length);
    expect(getTlfs()).toHaveLength(raw("tlfs.json").tlfs.length);
    expect(getSections()).toHaveLength(raw("sections.json").sections.length);
    expect(getPatients()).toHaveLength(raw("patients.json").patients.length);
    expect(getRules()).toHaveLength(raw("rules.json").statisticalLanguageRules.length);
    expect(getNarrativeTemplate().structure).toEqual(
      raw("sections.json").narrativeTemplate.structure,
    );
    expect(getTlfRevision().tlf.id).toBe(raw("tlf-14.3.1.2-v2.json").tlf.id);
  });

  it("resolve every sentence citation to a fact", () => {
    for (const section of getSections()) {
      for (const sentence of section.sentences) {
        for (const factId of sentence.cites) {
          expect(getFact(factId), `${sentence.id} cites ${factId}`).toBeDefined();
        }
      }
    }
  });

  it("point every fact's cell back into its TLF", () => {
    for (const fact of getFacts()) {
      const tlf = getTlf(fact.tlf);
      expect(tlf, fact.id).toBeDefined();
      expect(tlf!.rows[fact.cell.row].cells[fact.cell.col].factId).toBe(fact.id);
    }
  });

  it("map every section's TLFs to a loaded TLF", () => {
    for (const section of getSections()) {
      for (const tlfId of section.tlfs)
        expect(getTlf(tlfId), `${section.id} → ${tlfId}`).toBeDefined();
    }
  });

  it("find records by id and return undefined for unknown ids", () => {
    const [firstSection] = getSections();
    const [firstPatient] = getPatients();
    expect(getSection(firstSection.id)).toBe(firstSection);
    expect(getPatient(firstPatient.id)).toBe(firstPatient);
    expect(getSection("no-such-section")).toBeUndefined();
    expect(getPatient("no-such-patient")).toBeUndefined();
    expect(getFact("no.such.fact")).toBeUndefined();
    expect(getTlf("no-such-tlf")).toBeUndefined();
  });

  it("compile every rule pattern as a RegExp", () => {
    for (const rule of getRules()) expect(() => new RegExp(rule.pattern), rule.id).not.toThrow();
  });
});
