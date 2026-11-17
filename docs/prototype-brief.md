# CSR Copilot — Clickable Prototype Brief

**One line:** a working, clickable web prototype of CSR Copilot that shows, on fictional study data, how AI drafts Clinical Study Report sections while *code* inserts every number and every sentence stays traceable to its source.

**Audience:** a product interview panel, then a pharma design partner's Medical Writing, Biostatistics, Regulatory and QA leads, and executives. They will click through it live, so it has to feel real and survive skeptical questions.

**Source of truth:** `docs/PRD-TRD.md`. This brief turns its Release 1 scope (plus selected Release 2 previews) into screens. If the two disagree, ask the user. Don't silently pick one.

---

## 1. What the prototype must prove (in this order)

1. **Numbers are never generated.** Every figure in a draft comes from the fact store through a slot, and anyone can see that.
2. **Every sentence is traceable.** Clicking a sentence or number opens the exact TLF cell or patient record behind it.
3. **Humans stay in control.** Accept, edit or reject per sentence; role-based sign-offs; nothing is "final" without a named approver.
4. **Problems are caught by rules, not luck.** The statistical-language validator flags the seeded "significantly" sentence, and a numeral typed by a human outside a slot is flagged too.
5. **It scales to the boring work.** Twelve SAE narratives are generated in a batch; two are flagged as data exceptions.
6. **Change is safe.** When a TLF is re-run, affected sentences are found and updated, and the reconciliation report re-runs.
7. **It's inspection-ready.** An audit trail and an exportable evidence pack exist for every section.
8. **It's worth it.** An executive value view shows time saved and quality against the baseline.

## 2. Non-negotiables

- **Synthetic data only.** Use `data/seed/*.json` (study CRD-301 "CARDIA-3", drug "velorantib", fictional sponsor). Never use real patient data, real drug names or real sponsor branding.
- **Deterministic numbers.** Generated prose contains typed placeholders such as `{F:14.3.1.1.any_teae.velo}`. The slot filler in `src/lib/slots` renders values. Generation code never formats or writes numerals itself (see the `deterministic-numbers` skill).
- **Works with no API key.** The default "Simulated AI" mode streams pre-written placeholder sentences from `sections.json` with realistic timing. "Live AI" mode (optional, `ANTHROPIC_API_KEY`) asks Claude for placeholder prose only, then runs the same slot filler and validators.
- **A visible fiction banner.** A thin persistent bar reads "Prototype · fictional study data · not for clinical use".
- **Design system.** Follow `docs/design-system.md`. The look should match the CSR Copilot decks: EB Garamond headings, Public Sans text, navy / warm paper / teal.

## 3. Personas and the role switcher

A header role switcher changes what's emphasized and which actions are enabled. There's no real auth.

| Role | Sees first | Can do |
|---|---|---|
| Medical Writer (default) | Section workspace | Generate, accept/edit/reject sentences, send to review |
| Biostatistician | Reconciliation report | Sign off numbers, comment on statistical language |
| Regulatory reviewer | Audit and lineage | Inspect lineage, run consistency checks, export the evidence pack |
| QA | Autonomy and quality | Change section autonomy levels (with reason), view validation status |
| Executive | Value dashboard | Read-only |

## 4. Screens (routes)

Each screen lists the PRD journey (J1–J6) and requirement IDs (FR-*) it demonstrates.

### S1 · Study home `/`
- Study card: CRD-301 milestones (database lock 30 Oct 2026, target final CSR 22 Jan 2027), template, therapeutic-area pack.
- **Section board:** ICH E3 sections as rows, showing release badge (R1 / R2 / Human), autonomy level (L0–L3), status (Not started → Drafted → In review → Signed off), owner and progress.
- Readiness tiles: inputs parsed, open exceptions, sentences awaiting review, numbers reconciled.
- Fiction banner and role switcher in the shell.

### S2 · Data readiness `/setup` (J1 · FR-ING-01..04, FR-MAP-01)
- Input list: protocol, SAP, TLF package, ADaM, narrative source data. Each has a version, a fake SHA-256 hash and a parsed status.
- TLF parse results: 5 TLFs, each with confidence and number of facts extracted.
- TLF → section mapping table with an "override" select.
- Exceptions list, such as the two narrative data issues, with an owner.

### S3 · Section workspace `/sections/[id]` (J2 · FR-GEN-01/03, FR-TRC-01/02, FR-EDT-01/02/04, FR-NUM-01..04)
The hero screen. Three panes:
- **Left:** section outline, with ICH E3 numbering and status dots.
- **Center:** the draft. A "Generate draft" button streams sentences in. Each sentence shows:
  - provenance shading: AI-generated (teal tint), AI-edited (amber tint), human (none);
  - inline **number chips** rendered by the slot filler, which on hover show the fact id, TLF and cell;
  - a **citation marker** at the sentence end, which opens the source drawer;
  - hover actions: Accept · Edit · Reject · Regenerate (with reason).

  Editing a sentence inline keeps chips as non-editable tokens. If the user types a raw numeral, the validator flags it (NUM-001).
- **Right:** tabbed **Fact panel** (facts mapped to this section, draggable into the text as chips) and **Checks** (validator results with severity, rule id, message and a one-click suggested fix).
- **Source drawer:** the TLF rendered as a table with the cited cell highlighted, plus the table footnotes, TLF version and hash.
- The seeded issue in sentence 12.2-s3 ("significantly more common") must appear as a critical STAT-001 finding, with the fix "more frequent with velorantib".
- Sections 11.4 (R2) and 13 (human) render as locked states that explain why: "Efficacy results arrive in Release 2 with biostatistician sign-off" and "Conclusions stay human-authored; AI supplies a fact panel only".

### S4 · Reconciliation report `/sections/[id]/reconciliation` (J3 · FR-QC-01, FR-WF-01/02)
- One row per number in the section: sentence, rendered value, fact id, TLF and cell, source value, match status.
- Summary computed from the section, e.g. for 12.2: "12 of 12 numbers reconciled (100%)". Never hard-code this count.
- Biostatistician sign-off with a name, timestamp and "meaning of signature" text (a Part 11 style mock). It's disabled unless the role is Biostatistician and there are no open critical findings.

### S5 · Narratives queue `/narratives` (J4 · FR-GEN-02)
- 12 patients (7 velorantib, 5 placebo): id, arm, event, seriousness, status chip (Ready / Exception / Drafted / Reviewed).
- "Generate all ready narratives" runs a batch with a progress bar. The 2 exceptions are skipped with their data-issue reason.
- Filters by arm, event type and status.

### S6 · Narrative detail `/narratives/[patientId]`
- A patient timeline (day axis) built deterministically from `timeline`.
- The narrative, assembled from the template in `sections.json` using `{P:...}` slots, with each clause cited to a timeline entry or patient field.
- Safety physician review: Approve / Return with comment.

### S7 · TLF change impact `/changes` (J6 · FR-QC-04)
- Loads `tlf-14.3.1.2-v2.json`: Dizziness, velorantib 22 → 23.
- Diff of changed facts, then the affected sentences (12.2-s4) with before/after renders.
- "Apply update" re-renders the sentence, logs an audit event and re-runs reconciliation.

### S8 · Audit and lineage `/audit` (J5 · FR-AUD-01..04, FR-TRC-03, FR-EXP-02)
- An immutable-looking event log: time, actor, role, action, object, model/prompt/template version.
- Pick a sentence to see its **lineage**: sources → generation (mode, model, prompt version) → slot fill → validator results → edits → approvals.
- "Export evidence pack": a print-styled page or JSON download with the reconciliation report, lineage and sign-offs.

### S9 · Quality `/quality` (FR-QC-02/03, NFR-ACC-*)
- Gold-set evaluation summary (mocked but labelled as mock): numeric fidelity 100%, citation precision, acceptance rate, error taxonomy chart.
- Consistency check across sections, such as the death count in 12.3 versus the narratives queue.

### S10 · Autonomy and risk `/settings/autonomy` (FR-GEN-03)
- The section risk matrix as a 2×2: AI suitability against cost of an error, with sections plotted.
- An autonomy ladder per section (L0–L3). QA can change a level only with a reason, which goes to the audit log.

### S11 · Value dashboard `/value` (FR-ANL-01)
- Baseline against current: days from DBL to CSR draft, writer hours on R1 sections, sentence acceptance rate, critical errors caught before QC.
- Clearly labelled as simulated values for the prototype.

### Cross-cutting
- **DOCX export** of a section (FR-EXP-01) with the `docx` npm package, numbers already rendered.
- **Guided demo mode:** a small "Demo" button opens a step-by-step tour that follows `docs/demo-script.md`.
- **Keyboard:** `A` accept, `E` edit, `R` reject on the focused sentence; `?` shows shortcuts.

## 5. Out of scope

Real auth, real document storage, real Part 11 signatures, real TLF parsing, multi-tenant, a mobile layout beyond "doesn't break", and efficacy drafting (shown locked as Release 2).

## 6. Definition of done for the prototype

- [ ] All 11 screens reachable from the shell nav. No dead links.
- [ ] `node scripts/validate-seed.mjs` passes; unit tests for slots, validator and narrative assembly pass.
- [ ] Every number on every screen comes from the seed through `src/lib/slots`. `biostat-checker` finds no hard-coded figures.
- [ ] The demo script runs end to end in under 8 minutes in Simulated AI mode with no API key.
- [ ] Lighthouse accessibility score ≥ 90 on S1 and S3.
- [ ] Deployed to Vercel with a shareable URL. The fiction banner is visible on every page.
