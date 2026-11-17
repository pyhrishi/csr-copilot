// Server-side seed loaders. Components never import seed JSON directly: they get typed objects from here.
// Reads are synchronous and cached per process, so pages that use them prerender as static content.
import "server-only";

import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { Fact, Patient, Section, Tlf } from "@/lib/types";
import type { NarrativeTemplate, SeedStudy, StatRule, TlfRevision } from "./seed-types";

const SEED_DIR = join(process.cwd(), "data", "seed");

const cache = new Map<string, unknown>();

function readSeed<T>(file: string): T {
  if (!cache.has(file)) {
    cache.set(file, JSON.parse(readFileSync(join(SEED_DIR, file), "utf8")));
  }
  return cache.get(file) as T;
}

// --- Study ---------------------------------------------------------------------------------
export function getStudy(): SeedStudy {
  return readSeed<SeedStudy>("study.json");
}

// --- Facts ---------------------------------------------------------------------------------
export function getFacts(): Fact[] {
  return readSeed<{ facts: Fact[] }>("facts.json").facts;
}

export function getFact(id: string): Fact | undefined {
  return getFacts().find((f) => f.id === id);
}

// --- TLFs ----------------------------------------------------------------------------------
export function getTlfs(): Tlf[] {
  return readSeed<{ tlfs: Tlf[] }>("tlfs.json").tlfs;
}

export function getTlf(id: string): Tlf | undefined {
  return getTlfs().find((t) => t.id === id);
}

/** The re-run of TLF 14.3.1.2 used by the change-impact screen (S7). */
export function getTlfRevision(): TlfRevision {
  return readSeed<TlfRevision>("tlf-14.3.1.2-v2.json");
}

// --- Sections ------------------------------------------------------------------------------
export function getSections(): Section[] {
  return readSeed<{ sections: Section[] }>("sections.json").sections;
}

export function getSection(id: string): Section | undefined {
  return getSections().find((s) => s.id === id);
}

export function getNarrativeTemplate(): NarrativeTemplate {
  return readSeed<{ narrativeTemplate: NarrativeTemplate }>("sections.json").narrativeTemplate;
}

// --- Patients ------------------------------------------------------------------------------
export function getPatients(): Patient[] {
  return readSeed<{ patients: Patient[] }>("patients.json").patients;
}

export function getPatient(id: string): Patient | undefined {
  return getPatients().find((p) => p.id === id);
}

// --- Rules ---------------------------------------------------------------------------------
export function getRules(): StatRule[] {
  return readSeed<{ statisticalLanguageRules: StatRule[] }>("rules.json").statisticalLanguageRules;
}

// --- Inputs --------------------------------------------------------------------------------
export { getInputSources, type InputSource } from "./inputs";

