# Glossary

| Term | Meaning |
|---|---|
| CSR | Clinical Study Report: the full report of a trial's methods and results, structured per ICH E3 |
| ICH E3 | International guideline for the structure and content of CSRs (sections 1–16) |
| DBL | Database lock: trial data is final and analysis begins |
| TLF | Tables, listings and figures: the statistical outputs the CSR is written from |
| SAP | Statistical analysis plan |
| ADaM / SDTM | CDISC data standards for analysis datasets and tabulation datasets |
| TEAE | Treatment-emergent adverse event |
| SAE | Serious adverse event (death, hospitalization, life-threatening, disability, congenital anomaly, other important medical event) |
| Narrative | A per-patient write-up of a death, SAE or other significant AE (ICH E3 section 14.3.3) |
| Safety population | Patients who received at least one dose of study drug |
| Preferred term (PT) | MedDRA coding level used to group adverse events |
| Fact store | CSR Copilot's structured store of every TLF value, with source coordinates |
| Slot | A typed placeholder like `{F:14.3.1.1.any_teae.velo}` that code fills from the fact store |
| Reconciliation report | A list of every number in a section with its source and match status |
| Autonomy ladder | L0 Retrieve, L1 Suggest, L2 Draft for review, L3 Auto-assemble: the AI's allowed role per section |
| Release 1 / 2 | R1 is live at week 13 (narratives, sections 10 and 12); R2 is at month 6 (efficacy results) |
| G1–G5 | Stage gates with evidence and kill criteria (see PRD Section 1) |
| Part 11 | US FDA 21 CFR Part 11: rules for electronic records and signatures |
| GAMP 5 | Industry framework for risk-based validation of computerized systems |
| Evidence pack | Exportable bundle per section: reconciliation, lineage, sign-offs, versions |
