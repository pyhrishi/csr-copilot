# Seed data: FICTIONAL

Everything in `data/seed/` is invented for a product prototype: study CRD-301 "CARDIA-3", the drug "velorantib", the sponsor "Meridian Biopharma", all patients, sites and results. None of it describes a real study, product, company or person.

- Regenerate with `python3 scripts/generate-seed.py` (percentages are computed from counts).
- Validate with `node scripts/validate-seed.mjs` (consistency, traceability, no numerals outside slots).
- Don't hand-edit the JSON. Change the generator and regenerate. The project hooks block direct edits.

| File | Contents |
|---|---|
| `study.json` | Study metadata, arms, populations, milestones |
| `tlfs.json` | 5 TLFs (disposition, demographics, AE overview, common AEs, primary efficacy) |
| `facts.json` | 52 facts, one per TLF cell, with source coordinates |
| `tlf-14.3.1.2-v2.json` | A re-run of the common-AE table after a data correction (dizziness 22 → 23) |
| `patients.json` | 12 patients with serious TEAEs (7 velorantib, 5 placebo), 2 with data issues |
| `sections.json` | Section templates with slots, plus the narrative template |
| `rules.json` | Statistical-language and numeral rules used by the validator |
