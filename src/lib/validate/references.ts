// The document references a CSR sentence may cite with numerals: real TLF ids from the study, ICH E3
// section numbers, and ICH E3 patient-data listings. NUM-001 allows these and nothing else, so a
// count can never pass as a made-up reference ("Section 201 patients", "Table 14.200.3").
import type { Section, Tlf } from "@/lib/types";

/** ICH E3 sections used in the prototype (.claude/skills/csr-domain/ich-e3-map.md). */
export const ICH_E3_SECTIONS = [
  ...Array.from({ length: 16 }, (_, i) => String(i + 1)),
  "10.1",
  "10.2",
  "10.4",
  "11.4",
  "12.2",
  "12.3",
  "12.4",
  "14.3.3",
  "16.2",
] as const;

/** ICH E3 16.2 patient data listings (16.2.1 discontinued patients … 16.2.8 laboratory values). */
export const ICH_E3_LISTINGS = Array.from({ length: 8 }, (_, i) => `16.2.${i + 1}`);

export interface ReferenceIndex {
  /** Ids a Table or Figure may cite: the study's TLFs. */
  tlf: ReadonlySet<string>;
  /** Ids a Section may cite. */
  section: ReadonlySet<string>;
  /** Ids a Listing may cite. */
  listing: ReadonlySet<string>;
}

export function buildReferenceIndex(data: {
  tlfs: readonly Tlf[];
  sections: readonly Section[];
}): ReferenceIndex {
  const tlf = new Set(data.tlfs.map((t) => t.id));
  return {
    tlf,
    section: new Set([...ICH_E3_SECTIONS, ...data.sections.map((s) => s.id)]),
    listing: new Set([...ICH_E3_LISTINGS, ...tlf]),
  };
}
