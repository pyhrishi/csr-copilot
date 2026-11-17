---
name: synthetic-data
description: Rules and workflow for the prototype's fictional study data (study CRD-301, drug velorantib). Use when adding or changing TLFs, facts, patients, section templates or validator rules, or when a screen needs data that doesn't exist yet.
allowed-tools: Bash(python3 scripts/*) Bash(node scripts/*)
---

# Synthetic data workflow

The seed in `data/seed/` is generated, consistent and fictional. Keep it that way.

## Rules
1. **Never hand-edit `data/seed/*.json`.** The `protect-files` hook blocks it. Edit `scripts/generate-seed.py`, then:
   ```bash
   python3 scripts/generate-seed.py && node scripts/validate-seed.mjs
   ```
2. **Compute, don't type, derived numbers.** Percentages come from `pct(n, N)` in the generator. Totals must add up (the validator checks disposition sums, SAE patients against the SAE fact, and deaths against the death fact).
3. **Fiction only:** invented drug and sponsor names, patient ids `CRD301-####`, sites "Site ###". No real products, companies, investigators or anything that looks like real patient data. Keep the `_synthetic` marker in every file.
4. **Facts are one per TLF cell** with `cell` coordinates pointing back to the table. If you add a TLF row, the generator creates the facts and the validator checks the coordinates.
5. **Section template sentences** may contain numerals only inside slots and in "Table/Section x.y" references. The validator enforces this.
6. **Keep demo anchors intact.** These must survive any regeneration, or `docs/demo-script.md` breaks:
   - sentence `12.2-s3` with "significantly" (`seededIssue` STAT-001)
   - the TLF 14.3.1.2 v2 dizziness change 22 → 23 affecting `12.2-s4`
   - the 2 narrative exceptions (CRD301-1402, CRD301-2190)
   - 7 vs 5 SAE patients, and 1 death per arm

## Adding something new
- A new TLF: add an `add_tlf(...)` call, map it in a section's `tlfs`, regenerate, validate, then add a test.
- A new patient: append to `patients`, then update the SAE fact counts in 14.3.1.1 in the same change so totals still match.
- A new rule: append to `stat_rules` with id, severity, pattern, `requires` and a message that tells the writer what to write instead.
