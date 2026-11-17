import "server-only";

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export interface InputSource {
  id: string;
  name: string;
  category: "Protocol" | "SAP" | "TLF Package" | "ADaM" | "Narrative Source Data";
  format: string;
  version: string;
  sha256: string;
  ingestedAt: string;
  status: "parsed";
  details: string;
}

const SEED_DIR = join(process.cwd(), "data", "seed");

function computeHash(content: string, salt: string): string {
  return createHash("sha256").update(`${salt}:${content}`).digest("hex");
}

let cachedInputs: InputSource[] | null = null;

/**
 * Returns the 5 ingested study inputs with version and deterministic SHA-256
 * derived from the underlying file content.
 */
export function getInputSources(): InputSource[] {
  if (cachedInputs) return cachedInputs;

  const studyRaw = readFileSync(join(SEED_DIR, "study.json"), "utf8");
  const tlfsRaw = readFileSync(join(SEED_DIR, "tlfs.json"), "utf8");
  const factsRaw = readFileSync(join(SEED_DIR, "facts.json"), "utf8");
  const patientsRaw = readFileSync(join(SEED_DIR, "patients.json"), "utf8");
  const sectionsRaw = readFileSync(join(SEED_DIR, "sections.json"), "utf8");

  cachedInputs = [
    {
      id: "protocol",
      name: "CRD-301 Clinical Study Protocol",
      category: "Protocol",
      format: "PDF",
      version: "v3.0",
      sha256: computeHash(studyRaw + sectionsRaw, "protocol-v3.0"),
      ingestedAt: "2026-10-15T14:30:00Z",
      status: "parsed",
      details: "ICH E3 protocol with primary endpoint specification and 2 arms",
    },
    {
      id: "sap",
      name: "Statistical Analysis Plan (SAP)",
      category: "SAP",
      format: "PDF",
      version: "v2.1",
      sha256: computeHash(studyRaw + factsRaw, "sap-v2.1"),
      ingestedAt: "2026-10-22T09:15:00Z",
      status: "parsed",
      details: "Efficacy and safety analysis sets, alpha levels and estimands",
    },
    {
      id: "tlf-package",
      name: "TLF Package (Post-Lock Initial Run)",
      category: "TLF Package",
      format: "RTF / JSON",
      version: "v1.0",
      sha256: computeHash(tlfsRaw + factsRaw, "tlfs-v1.0"),
      ingestedAt: "2026-10-30T18:45:00Z",
      status: "parsed",
      details: "5 standard tables parsed into 52 structured facts",
    },
    {
      id: "adam",
      name: "ADaM Analysis Datasets",
      category: "ADaM",
      format: "SAS7BDAT / XPT",
      version: "v1.0",
      sha256: computeHash(factsRaw, "adam-v1.0"),
      ingestedAt: "2026-10-30T17:20:00Z",
      status: "parsed",
      details: "ADSL, ADAE and ADTTE dataset sources for safety and efficacy",
    },
    {
      id: "narrative-source",
      name: "Patient Profile & Narrative Source Listings",
      category: "Narrative Source Data",
      format: "SAS7BDAT / JSON",
      version: "v1.0",
      sha256: computeHash(patientsRaw, "narrative-v1.0"),
      ingestedAt: "2026-10-30T19:00:00Z",
      status: "parsed",
      details: "12 patient safety records (2 queries flagged for data management)",
    },
  ];

  return cachedInputs;
}
