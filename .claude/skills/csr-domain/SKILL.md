---
name: csr-domain
description: Clinical Study Report (ICH E3) domain knowledge for CSR Copilot. Covers section structure, how results and safety sections are written, patient narrative anatomy, statistical-language rules and CSR vocabulary. Use when writing or reviewing draft text, section templates, narrative logic, validator rules or any UI copy that names CSR concepts.
---

# CSR domain knowledge

Use this so the prototype reads like it was built by people who have written CSRs. Everything domain-specific in the UI and the seed data should follow it.

## The essentials
- A CSR follows **ICH E3**. Section numbers matter and appear in the UI: 9 Investigational plan, 10 Study patients, 11 Efficacy evaluation, 12 Safety evaluation, 13 Discussion and overall conclusions, 14 Tables/figures referenced, 14.3.3 Narratives, 16 Appendices. See [ich-e3-map.md](ich-e3-map.md).
- Results text is **descriptive**: it reports what the tables show, by arm, with the population named. Interpretation belongs in Section 13 and stays human-authored in CSR Copilot.
- Counts are written `n (%)` with the denominator implied by the population header, e.g. "201 (67.4%) patients". Always say which arm ("velorantib group", "placebo group") and use "respectively" for paired values.
- Safety sections cite TLF numbers, such as "(Table 14.3.1.1)". Citations to tables are allowed numerals; clinical values never appear outside slots.

## Statistical language (what the validator enforces)
- **"Significant/significantly"** only with a p-value below the pre-specified alpha from an SAP-defined test (STAT-001). Otherwise write "more frequent", "numerically higher" or "similar".
- **No causal claims** in results: write "considered related to study drug by the investigator", never "caused by" (STAT-002).
- **"Trend"** only for a pre-specified trend analysis (STAT-003).
- Efficacy uses estimand language from the SAP. That's Release 2 and locked in the prototype.

## Patient narratives (ICH E3 14.3.3)
Order: identification → event → course (from the timeline, day-relative) → action taken with study drug → outcome → investigator causality. Use study day ("Day 18"), never calendar dates. Use neutral clinical wording. See [narrative-anatomy.md](narrative-anatomy.md) for the template and a fully worked example built from the seed.

## Vocabulary to get right
TEAE, SAE, preferred term (MedDRA), safety population, randomized population, discontinuation, investigator causality, database lock, TLF, SAP, data query. Never mention real drugs or sponsors. The seed's study is CRD-301 "CARDIA-3", with velorantib against placebo.
