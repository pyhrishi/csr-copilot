# CSR Copilot — PRD & TRD

Nov 17, 2026 · @Hrishikesh

## 1. Decision memo

**The bet:** CSR Copilot can be live on a real study within 90 days. Over the following year it can take 2–4 weeks off the roughly 12 weeks from database lock (DBL) to an approved Clinical Study Report (CSR). It starts with the most repetitive, most verifiable content, patient narratives and safety results, and never lets a language model invent a number.

**The problem.** A CSR is the ICH E3 report of a trial's methods and results. A review of 78 industry CSRs counted 144,610 pages, about 1,850 pages per report on average, most of it attached tables and listings. Writers assemble it from the protocol, the statistical analysis plan (SAP) and hundreds of tables, listings and figures (TLFs). One vendor puts DBL to approved CSR at about 83 days on average. A single patient narrative takes at least 4 hours of data consolidation and writing, and a Phase III study can need hundreds.

**Why now.**

- **The approach works in production elsewhere.** Lilly reported eliminating 10,000 hours of writing and review in year one with Yseop. Pfizer reported 76% time savings on narratives with Narrativa. Merck and McKinsey cut first-draft CSR time from 2–3 weeks to 3–4 days. These figures are vendor-reported, but they consistently show that narratives and results sections are automatable.
- **Regulators have set expectations.** The FDA issued draft guidance on AI for regulatory decision-making in January 2025. In January 2026, the FDA and EMA jointly published 10 Guiding Principles of Good AI Practice in Drug Development. The design must meet both.
- **The partner is greenfield** with a Phase III program coming, so it can adopt a standard from the start.

**What goes live at day 90 (Release 1).**

- Patient narratives (ICH E3 section 14.3.3), safety results (section 12) and study patients (section 10). They are drafted from structured data, with numbers inserted deterministically and every sentence linked to its source.
- Intended use: a **drafting aid**. Every output still passes the partner's existing human review and QC. Approvals stay in the partner's validated document management system.

**What follows.** Release 2 (month 6): descriptive efficacy results (section 11) with biostatistician sign-off, TLF change propagation, synopsis consistency checks and native e-signatures. The tool is ready for Phase III by month 9, ahead of an assumed DBL at month 12.

**What we will not do.** Generate interpretation, benefit–risk discussion or conclusions. Let AI text reach a final document without named human approval.

**How 90 days is possible.**

1. **Buy commodity, build the moat.** Use an enterprise LLM endpoint, proven document parsers and an editor framework. Build only the fact store, traceability and checks.
2. **Remove the riskiest technical work.** Require structured TLF output from statistical programming from day 1, instead of parsing PDFs.
3. **Narrow the intended use.** A drafting aid with 100% human verification allows risk-based, proportionate validation.
4. **Run in parallel.** Discovery, build and validation all start in week 1, with weekly evaluation against completed CSRs.
5. **Fund in stages.** A 6-person learning team runs until G1 (week 2), at about 13% of Release 1 spend. The full 12-person team is funded only if G1 passes, so learning still comes before significant engineering investment.

**Stage gates the executive sponsor signs.**

| Gate | Evidence required | Kill or pivot if |
| --- | --- | --- |
| G1 — Problem and data confirmed (week 2) | Effort baseline from 2 completed CSRs; structured TLF export confirmed; data access live | Narratives and results drafting are under 25% of post-DBL writer effort, or no data access |
| G2 — Quality parity on past data (week 6) | 100% numeric fidelity; ≥80% of sentences accepted with minor or no edits; no critical errors in blind review | Critical error rate not falling after 2 iterations |
| G3 — Workflow fit in shadow (week 10) | ≥30% writer-time reduction on a recently completed study; Biostatistics and Regulatory accept the evidence pack | Reviewers spend longer checking than they save drafting |
| G4 — Go-live (week 12) | Risk-based validation complete; work instruction and training done; QA approval | Any open critical validation deviation |
| G5 — Scale (after the Phase III CSR, \~month 14) | Outcomes against baseline; business case | Value case under 2x investment within 3 years |

**The ask.** A 90-day design partnership, funded in two stages. Stage 1 (weeks −2 to 2): a 6-person learning team, about 13% of Release 1 spend, produces the G1 evidence. Stage 2 (weeks 3–13): ramp to 12 PharmaSense FTE only if G1 passes. The partner embeds \~2.5 FTE of experts. Before day 1 it provides a signed data-processing agreement (DPA), data access, 2–3 completed CSR packages, and one study that reaches DBL around month 3 to be the first live study.

## How this document answers the brief

The brief's 11 topics map to these sections. The PRD is Section 8 and the TRD is Section 9.

| Brief topic | Where it is answered |
| --- | --- |
| Product Discovery & Opportunity Validation | 3 Assumption register · 4 Discovery · 5 Personas · 6 Section risk matrix |
| Product Strategy | 7 Vision, platform vs specific capabilities, roadmap, competition |
| Implementation Plan | 12 The 90-day plan, release scope, dependencies · 1 Stage gates |
| Prioritization Framework | 13 Prioritization · 6 Section risk matrix |
| Resource Allocation | 14.1–14.3 Team, staged funding, collaboration by phase, RACI |
| Adoption & Trust Strategy | 11 Adoption · 5.2 Fear to mechanism to requirement |
| Quality, Governance & Regulatory Readiness | 10 Quality, validation, regulatory landscape · 9.5 Evaluation |
| Team & Operating Model | 14 Team and operating model |
| Stakeholder Management | 15 Stakeholder map and engagement by stage |
| Tooling & Product Operations | 16 Tools, analytics, experimentation |
| Additional Considerations | 2 Context · 17 Metrics, business case, market size · 18 Risks · 19 Open questions |

## 2. Context & problem framing

PharmaSense is the vendor. A mid-sized biopharma is the first design partner, and its upcoming Phase III program is both the opportunity and the constraint.

**What the case tells us**

| Fact from the brief | Implication for the product |
| --- | --- |
| Greenfield: no AI authoring tool, workflows largely manual | No incumbent to displace; also no data pipeline, template discipline or AI governance to build on |
| Upcoming Phase III program | A hard deadline; a pivotal CSR cannot be put at risk by an unproven tool |
| Writers: optimistic about less repetition, cautious about nuance | Start with repetitive sections; keep writers as authors, not editors of machine text |
| Biostatisticians doubt that narrative captures complex statistics | Numbers and statistical claims must be deterministic and verifiable |
| Regulatory needs transparency, reproducibility, governance | Traceability, audit trail and versioning are MVP scope, not later features |
| Executives see a strategic capability but need proof first | Stage gates, kill criteria and a measured business case |

**What is ambiguous and must be resolved early**

- The Phase III timeline: we assume database lock in \~12 months and top-line results \~4 weeks after DBL.
- The partner's source formats: we assume SAS-generated RTF/PDF TLFs, CDISC ADaM datasets, and protocol and SAP in Word.
- Template maturity: we assume a company CSR template exists but is applied inconsistently across therapeutic areas.
- Who writes CSRs today: we assume a mix of in-house writers and contract/CRO writers.
- IT and security posture: we assume cloud is acceptable with data processing in-region and no training on partner data.

**Scope of this document.** One combined PRD (what and why) and TRD (how) for the CSR Copilot MVP and its path to an enterprise platform. Every assumption is logged in Section 3 with its validation test. Stakeholder decks and a clickable prototype will be derived from this document.

## 3. Assumption register

Twelve assumptions carry the plan. They are tested riskiest-first, across four risk types (value, feasibility, trust, viability), and most are resolved before significant engineering spend.

| # | Assumption | Evidence today | Risk type | Risk if wrong | Validation test | By | Owner | If wrong, we… |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A1 | Narratives and results drafting are ≥30% of post-DBL writer effort | External: ≥4 h per narrative (Lilly/Yseop); 83 days DBL-to-final (Certara). Not yet measured at the partner | Value | High | Version-history analysis and writer interviews on 2 completed CSRs | Wk 2 (G1) | PM + Medical Writing lead | Pivot to review acceleration (consistency checks, comment triage) |
| A2 | Statistical programming can export TLFs as structured data (e.g., SAS ODS XML/JSON or datasets behind each output) | Common capability of SAS; partner setup unknown | Feasibility | High | Programming lead exports 20 TLFs in week 1 | Wk 2 (G1) | Eng lead + Biostatistics | Fall back to RTF parsing with confidence scoring; narrow R1 to narratives (built from datasets, not TLFs) |
| A3 | Writers accept AI first drafts when every sentence is sourced | Vendor case studies report adoption at Lilly, Pfizer, Merck | Trust | High | Blind side-by-side review; think-aloud sessions with 6 writers | Wk 6 (G2) | Design + PM | Shift from "draft" to "suggest" mode; invest more in review UX |
| A4 | Biostatisticians accept deterministic numbers plus a reconciliation report as verification | None yet | Trust | High | Co-design the report with 2 biostatisticians in weeks 2–5 | Wk 6 (G2) | Biostatistics lead | Add a biostatistician sign-off step per table-to-text block |
| A5 | QA accepts "drafting aid with 100% human verification" as the intended use, enabling risk-based validation in 12 weeks | Draft EU GMP Annex 22 confines generative AI to non-critical use with human oversight (GMP, not GCP); the FDA AI draft guidance excludes operational efficiencies that don't affect study reliability | Viability | High | Intended-use and risk assessment reviewed with partner QA in week 1 | Wk 2 | Validation lead | Keep R1 output outside the GxP record as a working draft; extend validation to month 5 |
| A6 | The partner's CSR and narrative templates are stable enough to configure | Unknown | Feasibility | Med | Template audit across the last 3 CSRs | Wk 2 | Medical Writing | 1-week template harmonization for R1 sections only |
| A7 | SAE narratives follow a fixed structure per event type | Industry practice; Lilly and Pfizer cases automate them | Feasibility | Low | Analyze 50 historical narratives for structural variance | Wk 3 | ML Engineer + Medical Writing | Template-plus-slot approach rather than free generation |
| A8 | The partner shares completed CSR packages under a DPA before day 1 | Unknown | Viability | High | DPA in pre-start week −2 | Day 0 | PM + Legal | Use public CSRs (EMA clinical data publication, Policy 0070) for evaluation while legal completes |
| A9 | An enterprise LLM endpoint (zero retention, in-region) passes security review | Standard offering from major cloud providers | Viability | Med | Security review in weeks −2 to 2 | Wk 2 | Eng lead | Self-host an open-weight model for patient-level steps |
| A10 | Time saved is redeployed, not used to cut headcount | None | Trust | Med | Executive sponsor commitment in the charter | Day 0 | Exec sponsor | Expect writer resistance; adoption plan must change |
| A11 | A study reaches DBL around month 3 to serve as the first live study | Unknown | Viability | High | Confirm the study portfolio in pre-start | Day 0 | Exec sponsor + PM | Go live on a recently completed study still in CSR authoring, or on Phase III dry-run outputs |
| A12 | The partner will pay for a licence after a successful pilot | None | Viability | Med | Commercial terms agreed at G3 | Wk 10 | PharmaSense commercial | Re-scope to a services-led model |

## 4. Product discovery & opportunity validation

We validate the opportunity in the first 2 weeks, then keep validating weekly while we build. The goal is to prove three things fast: the time sink is real, AI can address it with acceptable quality, and the people who must trust it will.

### 4.1 Discovery plan (pre-start to week 10, compressed)

| Week | Activity | Who | Output |
| --- | --- | --- | --- |
| −2 to 0 | Charter, DPA, security pre-review, data access, first live study confirmed | PM, exec sponsor, Legal, IT | Signed charter; access to 2–3 completed CSR packages |
| 1–2 | 12 stakeholder interviews; shadow 3 writers and 2 biostatisticians for one day each | PM, Design | Journey map; pain-point inventory |
| 1–2 | Version-history and effort analysis on 2 completed CSRs | PM, analyst | Baseline: hours per section, review cycles, QC findings, DBL-to-final days |
| 1–2 | Template, TLF-export and narrative-data audit | Medical Writing, Eng | Data readiness verdict (G1) |
| 1–2 | Wizard-of-Oz: 20 narratives drafted offline with the target pipeline design, reviewed blind | ML, Medical Writing | First acceptance rate and error taxonomy |
| 2–6 | Weekly blind evaluation on gold sets as the build progresses | Evaluation lead, writers | Quality trend (G2 at week 6) |
| 3–5 | Clickable prototype tests with all personas, run in parallel with the build | Design | Trust UX findings fed straight into the build |
| 7–10 | Shadow use on a recently completed study | Writers, biostatisticians | Time saved and workflow fit (G3 at week 10) |

### 4.2 How we decide whether AI meaningfully improves CSR authoring

AI earns a place in a section only if it passes all three tests:

1. **Material:** the section accounts for ≥5% of total writer hours, or sits on the critical path after DBL.
2. **Feasible:** content is predominantly derived from structured sources (TLFs, protocol, SAP), so output is verifiable.
3. **Trustworthy:** in blind review, AI-assisted drafts match or beat human first drafts on errors, with less total time (draft + review).

### 4.3 The 20 core questions, answered as working assumptions

Each answer gives our current position and how we will validate it. Answers marked *assumption* are not yet confirmed with the partner.

**A. Is the problem real, and where?**

1. **Where does DBL-to-final CSR time go?** *Assumption:* about 35% drafting, 15% waiting on TLF reruns, 50% review, QC and comment resolution. Validate with version history and time-and-motion (A1). If review dominates, the MVP must also speed up review: consistency checks and comment triage. This split is the first input to the business case (Section 17.2): the larger the review share, the more value comes from the reconciliation report and the less from drafting speed.
2. **Which sections are high-volume, low-judgment?** Sections 10 (disposition, demographics, protocol deviations), 12 (adverse events, labs, vitals), 14.3.3 (narratives) and the descriptive parts of 11. High-judgment sections are the efficacy discussion (11.4.x interpretation), section 13 (discussion and conclusions), and the synopsis framing. See Section 6.
3. **What would make each persona say no?** Writers: losing authorship and voice. Biostatisticians: misstated estimands, p-values or confidence intervals. Regulatory: being unable to show how a sentence was produced. Each maps to a mechanism in Section 5.
4. **What is "submission-ready" today?** *Assumption:* 100% QC of numbers against TLFs, a medical review, and a regulatory review; 3–5 review cycles. This becomes the quality baseline we must match.

**B. What do we build first?**

5. **MVP wedge:** results sections (10, 11 descriptive, 12) plus SAE narratives. Highest volume, most verifiable, and narratives alone can run to hundreds of pages in Phase III.
6. **Does the model ever generate a number?** No. Numbers flow from parsed TLFs into slots. The model writes prose around typed placeholders, and a validator rejects any numeral not traceable to the fact store.
7. **Platform vs configuration:** platform = ingestion, fact store, generation engine, traceability, evaluation, audit and access control. Configuration = templates, style guide, TA conventions, narrative structures. See Section 7.
8. **Autonomy ladder:** L0 retrieve → L1 suggest → L2 draft-for-review → L3 auto-assemble with exception review. Every section starts at L1 or L2. Moving up needs 3 consecutive studies at gate quality.

**C. How do we protect the Phase III timeline?**

9. **Backward plan:** first live use at week 13 on a study reaching DBL in that window. Release 2 by month 6 and Phase III readiness by month 9, ahead of an assumed Phase III DBL at month 12. See Section 12.
10. **Retrospective then shadow:** yes. Completed CSRs give ground truth (weeks 2–6); a recently completed study still in authoring gives a realistic shadow environment (weeks 7–10). The Phase III dry run (dummy TLFs) is used for a second shadow round in months 4–8.
11. **Stage gates and kill criteria:** G1–G5 in the decision memo, signed by the executive sponsor.
12. **Source material:** protocol, SAP, TLFs (RTF/PDF plus SAS datasets where possible), ADaM datasets, CRF data for narratives, prior CSRs, template and style guide. All under a DPA, with least-privilege access.

**D. How do we earn trust and stay inspection-ready?**

13. **Evidence pack per output:** a source link per sentence, a numeric reconciliation report, model/prompt/template versions, the input file hashes, and reviewer sign-offs with timestamps.
14. **Quality bar:** 100% numeric fidelity (hard gate), 0 unsupported claims, ≥80% of sentences accepted with minor or no edit, critical error rate below the human first-draft baseline.
15. **Who validates:** PharmaSense ships a supplier validation package (requirements, risk assessment, test evidence, traceability matrix). The partner performs fit-for-intended-use validation under its QMS (GAMP 5 supplier model).
16. **AI governance and disclosure:** an internal AI-use SOP; AI involvement recorded in the audit trail. External disclosure follows partner regulatory policy and current FDA and EMA guidance.

**E. Does it scale into a business?**

17. **Executive metric:** days from DBL to final CSR (north star), plus writer hours per CSR and QC findings per 100 pages.
18. **Embedded partner time:** during the 90-day sprint: 1 senior writer at 60%, 1 writer at 40%, 1 biostatistician at 40%, 1 regulatory reviewer at 20%, a QA contact at 40%, a safety physician at 20%, a statistical programmer at 30% (about 2.5 FTE).
19. **Commercial model:** a paid design-partnership pilot, converting to a per-study or platform licence at G5. The partner gets preferential pricing and roadmap influence; PharmaSense gets a reference customer and anonymized learnings.
20. **Learning loop:** user edits are captured as structured diffs and classified by error type. They improve prompts, templates and rules within the partner's tenant only; nothing trains shared models without explicit consent.

## 5. Personas, jobs-to-be-done and trust requirements

Five personas decide whether CSR Copilot succeeds. Medical Writers are the primary users. Biostatisticians and Regulatory reviewers are the gatekeepers. QA is the validator. Executives are the funders.

### 5.1 Personas

| Persona | Role in the CSR | Job to be done | Today's pain | Success looks like |
| --- | --- | --- | --- | --- |
| **Maya — Senior Medical Writer** (primary user) | Owns the CSR end to end; drafts, coordinates reviews, resolves comments | "Turn TLFs into a coherent, accurate, compliant narrative fast, so I can spend time on interpretation." | Hours transcribing numbers from tables; repetitive narratives; version chaos across reviewers | First draft of results sections in days not weeks; more time on the discussion section |
| **Dev — Biostatistician** (gatekeeper) | Produces the SAP and TLFs; checks the statistical accuracy of text | "Make sure every statistical statement matches the analysis exactly." | Re-checking writers' transcriptions; misused terms (e.g., "significant" without a test) | Fewer review rounds; a machine-checkable reconciliation instead of line-by-line checks |
| **Priya — Regulatory Affairs reviewer** (gatekeeper) | Ensures ICH E3 compliance and submission readiness | "Be able to defend every sentence to a regulator." | Inconsistencies between synopsis, body and appendices; late-found gaps | Full traceability; consistent terminology; an audit trail she can show an inspector |
| **Quality Assurance lead** (validator) | Approves systems used for GxP records; owns SOPs | "Ensure the tool is fit for intended use and inspection-ready." | No precedent for validating an LLM-based tool | A clear intended use, a risk-based validation package, and controlled change management |
| **VP Clinical Development** (executive sponsor) | Accountable for submission timelines and budget | "Get to submission faster without increasing regulatory risk." | CSR is on the critical path after DBL; CRO costs | Measurable days saved; a repeatable capability across programs |

Secondary users: contract/CRO writers (same needs as Maya, less context), Medical Monitors and Safety physicians (review narratives), and Publishing/eCTD teams (consume the final document).

### 5.2 From fear to mechanism to requirement

Every trust requirement in the PRD traces back to a fear stated in the brief. This is the spine of the product.

| Persona | Fear (from the brief) | Trust mechanism | Product requirement |
| --- | --- | --- | --- |
| Medical Writer | AI can't handle scientifically nuanced content | Scoped autonomy: AI drafts only the sections where it is reliable; writers own interpretation | FR-GEN-03: high-judgment sections are locked to "suggest" mode or excluded |
| Medical Writer | Losing authorship and voice | Writer-in-control editor; style learned from partner guide; every AI sentence editable and marked | FR-EDT-01/02: track AI vs human provenance per sentence; accept/edit/reject |
| Biostatistician | Narrative misstates complex statistics | Numbers never generated; statistical phrasing rules (e.g., no "significant" without a p-value under the alpha) | FR-NUM-01–04: deterministic slots; numeric validator; statistical language rules engine |
| Biostatistician | Can't verify at scale | Automatic reconciliation report: every number → TLF cell | FR-QC-01: reconciliation report with pass/fail per number |
| Regulatory | Outputs not transparent | Sentence-level citations, click to open the source at the exact cell or paragraph | FR-TRC-01/02: source link per sentence; source viewer |
| Regulatory | Outputs not reproducible | Versioned model, prompt, template and inputs; regenerate any draft identically or explain the difference | FR-AUD-01–03: immutable audit trail; version pinning; regeneration log |
| QA | Tool cannot be validated | Defined intended use; risk-based validation; change control on models and prompts | NFR-VAL-01–04 |
| Executive | No measurable value; reputational risk | Stage gates; live dashboard of time, quality and risk metrics | FR-ANL-01: value dashboard |

## 6. CSR section risk matrix and MVP scope

The MVP covers the sections where AI suitability is high and the cost of an error is containable through deterministic checks: sections 10, 12, the descriptive parts of 11, and SAE narratives. Interpretation stays human.

**How sections are scored.** *AI suitability* (1–5) = how much of the content is derived from structured sources, plus how repetitive and templatable it is. *Error cost* (1–5) = regulatory and scientific impact if wrong, adjusted for how detectable errors are by automated checks. *Effort share* = assumed % of writer hours (to be validated, A1).

| ICH E3 section | Content | AI suitability | Error cost | Effort share (assumed) | Autonomy at launch | Phase |
| --- | --- | --- | --- | --- | --- | --- |
| 14.3.3 Narratives of deaths, SAEs and significant AEs | Per-patient narratives from CRF, AE and lab data | 5 | 3 | 15–25% | L2 draft-for-review | MVP |
| 10 Study patients | Disposition, protocol deviations, demographics and baseline | 5 | 2 | 8% | L2 draft-for-review | MVP |
| 12 Safety evaluation | Extent of exposure, AEs, deaths, SAEs, labs, vitals | 5 | 3 | 20% | L2 draft-for-review | MVP |
| 11 Efficacy evaluation (descriptive results) | Primary and secondary endpoint results as reported in TLFs | 4 | 4 | 12% | L2 with mandatory biostatistician sign-off | MVP |
| 9 Investigational plan | Design, population, treatments, endpoints, statistical methods (from protocol and SAP) | 4 | 2 | 8% | L2 | Phase 3 (Full CSR) |
| 2 Synopsis | Condensed summary of the full CSR | 3 | 4 | 3% | L1 suggest (consistency-checked against body) | Phase 3 (Full CSR) |
| 16 Appendices assembly | Lists, TLF compilation, cross-references | 4 | 2 | 5% | L3 auto-assemble | Phase 3 (Full CSR) |
| 11.4 Efficacy interpretation | Clinical meaning, subgroup interpretation | 2 | 5 | 6% | L1 suggest only (outline, related facts) | Phase 4+ |
| 13 Discussion and overall conclusions | Benefit–risk, clinical relevance | 1 | 5 | 5% | L0 retrieve (fact panel only) | Not planned |
| 1, 3–8 Title page, ethics, investigators, introduction | Administrative and boilerplate | 4 | 1 | 3% | L3 template fill | Phase 3 (quick win) |

&#91;embedded content: Section risk matrix · 10 ICH E3 sections by AI suitability and cost of an error\]

Release 1 takes the bottom-right quadrant; section 11 needs a sign-off workflow first; interpretation and conclusions stay with writers.

**Decision.** The MVP (Releases 1 and 2) covers sections 10, 11 (descriptive), 12 and 14.3.3, roughly 55–65% of writer drafting effort (assumed; measured at G1), with containable risk. Release 1 at week 13 ships narratives and sections 10 and 12. Section 11 follows in Release 2 because it needs the biostatistician sign-off workflow. Administrative sections are a quick win in Phase 3. Interpretation and conclusions stay human-authored; the AI supplies a fact panel only.

**Why not start with the synopsis?** It is visible to executives, but it depends on the body being right, and errors there are highly visible to regulators. It becomes a consistency checker first, and a drafter later.

## 7. Product vision & strategy

**Vision:** *Every number in a regulatory document is traceable to its source, and every writer spends their time on science, not transcription.*

**Positioning:** CSR Copilot is the source-grounded authoring layer between the statistical outputs and the submission document. It is not a general writing assistant. Its moat is the structured fact store and the traceability graph, which make AI output defensible.

**North star:** days from database lock to final, approved CSR. Today's assumed baseline is 10–12 weeks; the target is 6–8 weeks by the end of Phase 2.

### 7.1 Strategic principles

1. **Numbers are data, not language.** The model never generates a figure.
2. **Trace everything.** No sentence without a source; no output without a version.
3. **Writers author; AI assembles.** Autonomy is earned per section, with evidence.
4. **Platform once, configure many.** Each new trial, template or therapeutic area should be configuration, not code.
5. **Validate continuously.** Validation evidence is produced in every sprint, not at the end.

### 7.2 Foundational platform vs specific capabilities

| Layer | Foundational platform (build once, reuse across customers) | Trial-, template- or TA-specific (configure per customer or study) |
| --- | --- | --- |
| Ingestion | Parsers for RTF/PDF/SAS TLFs, Word protocol and SAP, ADaM/SDTM readers | Mapping of a sponsor's TLF shells and naming conventions |
| Knowledge | Structured fact store; document graph; terminology service (MedDRA, CDISC) | Study-specific glossary, abbreviations, endpoint definitions |
| Generation | Slot-based generation engine; statistical language rules; section-agnostic prompt framework | Section templates, sponsor style guide, TA phrasing (e.g., oncology RECIST, CV MACE) |
| Trust | Sentence-level citation; numeric validator; reconciliation report; consistency checker | Sponsor-specific QC checklists and thresholds |
| Governance | Audit trail; versioning; role-based access; e-signatures (Part 11); validation package | Sponsor SOP alignment; approval workflow configuration |
| Evaluation | Evaluation harness; gold-set management; error taxonomy; monitoring | Gold sets per study and section; TA-specific rubrics |
| Experience | Authoring workspace; source viewer; review and comment workflow; Word export | Layout and styles for the sponsor's template |
| Integration | APIs; document management connectors (e.g., Veeva Vault); SSO | Sponsor-specific system integrations |

**Rule of thumb:** if a second customer would need it, it belongs in the platform. If a second study at the same customer would need it, it belongs in a reusable configuration pack.

### 7.3 Autonomy ladder

| Level | Name | What the AI does | What the human does | Entry criteria |
| --- | --- | --- | --- | --- |
| L0 | Retrieve | Shows relevant facts and sources | Writes everything | Default for high-judgment sections |
| L1 | Suggest | Proposes sentences inline | Accepts, edits or rejects each suggestion | Gold-set accuracy ≥90% |
| L2 | Draft for review | Produces a full section draft with citations and a reconciliation report | Edits and approves the section | 100% numeric fidelity; ≥80% sentence acceptance on 2 studies |
| L3 | Auto-assemble | Assembles and updates the section when TLFs change; flags exceptions | Reviews exceptions and signs off | 3 consecutive studies at L2 with zero critical errors; QA approval |

### 7.4 Phased roadmap: MVP to enterprise platform

| Phase | Timeline | Theme | Scope | Exit criteria |
| --- | --- | --- | --- | --- |
| 0 — Pre-start | Weeks −2 to 0 | Remove blockers | Charter, DPA, security pre-review, data access, first live study confirmed | All day-0 dependencies met |
| 1 — Release 1 (live) | Weeks 1–13 | Prove value and trust on a live study | Narratives (14.3.3), sections 10 and 12; fact store; deterministic numbers; citations; reconciliation report; audit log; DOCX export | G1–G4 passed; live on the first study at week 13 |
| 2 — Release 2 | Months 4–6 | Complete the results core | Section 11 (descriptive) with biostatistician sign-off; TLF change propagation; synopsis consistency checks; native Part 11 e-signatures; second shadow round on Phase III dry run | Two live studies; quality thresholds held |
| 3 — Full CSR | Months 7–15 | Cover the whole document | Phase III ready by month 9; sections 1–9, synopsis drafting, appendices; document management integration (e.g., Veeva Vault); Phase III CSR delivered | Phase III CSR delivered; G5 business case |
| 4 — Multi-document | Months 15–30 | Reuse the fact store across documents | CTD Module 2.5/2.7 summaries, investigator brochure updates, lay summaries, Policy 0070 anonymization support | 2+ document types in production; second therapeutic area live |
| 5 — Enterprise platform | Months 30+ | Strategic capability | Multi-program portfolio, multi-customer SaaS, configuration studio for templates, authoring analytics | Multiple customers; configuration-only onboarding under 6 weeks |

### 7.5 Competitive landscape and differentiation

This is a fast-moving market with credible vendors. That validates the problem, and it means PharmaSense must win on trust and speed of deployment rather than on drafting alone. All results below are vendor- or partner-reported, not independently verified.

| Player | Focus | Reported result |
| --- | --- | --- |
| [Yseop](https://yseop.com/case-study/eli-lilly-case-study-content-automation/) (Yseop Copilot) | Regulatory content automation; patient narratives | Lilly: 10,000 hours of writing and review eliminated in year one; 500 narratives completed |
| [Narrativa](https://www.narrativa.com/?p=39963) | Safety narratives, CSRs from TLFs | Pfizer: 76% time savings on narrative authoring |
| [Merck + McKinsey QuantumBlack](https://www.emarketer.com/content/ai-streamlines-health-report-filings-merck--mckinsey-collab) | Internal CSR generative AI platform | First-draft CSR time cut from 2–3 weeks to 3–4 days |
| [Peer AI](https://www.casestudies.com/company/peer-ai/case-study/how-a-public-biopharma-cut-csr-timelines-from-5-months-to-1-month) | Agentic regulatory authoring (CSRs, protocols, narratives) | Complex CSR writing time down 57% (40 to 17 working days) |
| [Certara CoAuthor](https://certara.com/wp-content/uploads/2024/11/2024-11-08-White-Paper-CoAuthor-and-GPTs.pdf) | Word-integrated structured content plus generative AI | Positions on GxP compliance and Word integration |
| [Saama](https://www.saama.com/the-post-dbl-data-trap-why-medical-writing-timelines-stall-at-the-finish-line/) | TLF analysis for post-DBL drafting | DBL to primary CSR draft: 3 weeks to 3–4 days |

**Where CSR Copilot differentiates**

1. **Numbers by construction, not by checking:** deterministic slots plus a reconciliation report the biostatistician designs.
2. **An inspection-ready evidence pack** per section, as a first-class output rather than a log.
3. **A supplier validation package and the 90-day deployment model** as part of the product.
4. **Configuration over customization**, so a mid-sized sponsor can onboard without a services-heavy project.

**Build vs buy (for the partner).** A mid-sized sponsor could license a vendor. Our pitch: a design partnership gives influence over the roadmap, preferential pricing, and a tool fitted to its templates. We should expect the partner to benchmark us against at least two of the vendors above, and plan the G2 evidence to win that comparison.

## 8. Product requirements (PRD)

The MVP has 41 functional requirements across 12 modules, plus 16 non-functional requirements. Release 1 (live at week 13) delivers a subset; see Section 12.2. In this document, "MVP" means Releases 1 and 2 together. Priority uses MoSCoW: **M** = must for MVP, **S** = should for MVP, **C** = a later release (Release 2 or 3; see Section 12.2).

### 8.1 Core user journeys

**J1 — Set up a study (Writer + Biostatistician, \~1 day)**

1. Writer creates a study workspace and selects the CSR template and TA configuration pack.
2. Writer uploads or connects the protocol, SAP, TLF package, ADaM datasets and narrative source data.
3. The system parses inputs and shows a **data readiness report**: parsed TLFs, failures, unmapped shells.
4. Biostatistician confirms the TLF-to-section mapping and resolves parse exceptions.

**J2 — Draft a results section (Writer, hours instead of days)**

1. Writer opens section 12.2 (Adverse events) and clicks Generate draft.
2. The system drafts prose with numbers in deterministic slots. Each sentence shows a citation chip.
3. Writer reviews: clicks a chip to see the source TLF cell highlighted, then accepts, edits or rejects each sentence.
4. Writer adds interpretation in human-authored blocks. Provenance marks show AI vs human text.
5. The system runs the numeric validator and the statistical language rules before the section can go to review.

**J3 — Verify statistics (Biostatistician)**

1. Biostatistician opens the reconciliation report: every number in the section is listed with its TLF source, value and match status.
2. Mismatches and rule violations are flagged first (e.g., "significant" used without a test).
3. Biostatistician signs off the section electronically, or returns it with comments.

**J4 — Generate patient narratives at scale (Writer + Safety physician)**

1. Writer selects the narrative population (e.g., all SAEs, deaths, discontinuations due to AEs: 180 patients).
2. The system generates narratives in batch from structured patient data using the TA narrative template.
3. A queue view shows status per narrative, with exceptions (missing data, conflicting dates) flagged.
4. Safety physician reviews medical content and signs off in batches.

**J5 — Regulatory review and audit (Regulatory reviewer, QA)**

1. Reviewer opens any sentence and sees its full lineage: sources, model and prompt versions, edits, approvers.
2. Reviewer runs a cross-document consistency check (synopsis vs body vs tables).
3. Reviewer exports the CSR to Word in the sponsor template, plus an audit package.

**J6 — TLFs change after rerun (Writer + Biostatistician)**

1. A new TLF version is uploaded after a data correction.
2. The system shows a diff of affected numbers and sentences, and proposes updates.
3. Writer accepts updates; the reconciliation report re-runs automatically.

### 8.2 Functional requirements

| ID | Module | Requirement | Persona | Priority |
| --- | --- | --- | --- | --- |
| FR-ING-01 | Ingestion | Upload or connect protocol, SAP (DOCX/PDF), TLFs (RTF/PDF), ADaM/SDTM (SAS7BDAT/XPT) | Writer | M |
| FR-ING-02 | Ingestion | Parse TLFs into a structured fact store (table, row, column, value, unit, population, analysis) | Biostat | M |
| FR-ING-03 | Ingestion | Data readiness report with parse confidence and exceptions | Writer, Biostat | M |
| FR-ING-04 | Ingestion | Version every input, with hash and timestamp | QA | M |
| FR-ING-05 | Ingestion | Connector to the sponsor's document management system (e.g., Veeva Vault) | Writer | C |
| FR-MAP-01 | Mapping | Map TLFs to CSR sections using the template, with manual override | Writer, Biostat | M |
| FR-MAP-02 | Mapping | Study glossary auto-extracted from protocol and SAP (endpoints, populations, treatment arms) | Writer | S |
| FR-GEN-01 | Generation | Generate section drafts from template, fact store and style guide | Writer | M |
| FR-GEN-02 | Generation | Batch generation of patient narratives from patient-level data | Writer | M |
| FR-GEN-03 | Generation | Section autonomy configured per level (L0–L3); high-judgment sections locked to L0/L1 | Writer, QA | M |
| FR-GEN-04 | Generation | Regenerate a single sentence, paragraph or section, with a reason captured | Writer | S |
| FR-GEN-05 | Generation | Inline suggestion mode (L1) inside human-authored text | Writer | S |
| FR-NUM-01 | Numbers | All numbers are inserted from the fact store into typed slots; the model never emits a numeral | Biostat | M |
| FR-NUM-02 | Numbers | Numeric validator blocks any numeral in prose not linked to a fact | Biostat | M |
| FR-NUM-03 | Numbers | Formatting rules per sponsor style (decimals, percentages, CIs, p-values) | Writer | M |
| FR-NUM-04 | Numbers | Statistical language rules engine (e.g., "significant" only with a p-value below alpha; estimand wording follows SAP) | Biostat | M |
| FR-TRC-01 | Traceability | Source citation on every generated sentence (one or more facts or document passages) | Regulatory | M |
| FR-TRC-02 | Traceability | Source viewer: click a citation to open the TLF cell or document passage, highlighted | All | M |
| FR-TRC-03 | Traceability | Lineage graph per sentence: sources → generation → edits → approvals | Regulatory, QA | S |
| FR-EDT-01 | Editor | Rich-text editor in the CSR template layout; accept, edit or reject per sentence | Writer | M |
| FR-EDT-02 | Editor | Provenance marking per sentence (AI-generated, AI-edited, human) | Writer, Regulatory | M |
| FR-EDT-03 | Editor | Comments, mentions and review assignment per section | All | M |
| FR-EDT-04 | Editor | Fact panel: relevant facts for the current section, insertable as slots | Writer | S |
| FR-QC-01 | Quality checks | Numeric reconciliation report per section: number, source, match status | Biostat | M |
| FR-QC-02 | Quality checks | Cross-document consistency check (synopsis, body, tables, abbreviations) | Regulatory | S |
| FR-QC-03 | Quality checks | ICH E3 completeness checklist per section | Regulatory | S |
| FR-QC-04 | Quality checks | TLF change impact: diff of affected numbers and sentences after a rerun | Writer, Biostat | S |
| FR-WF-01 | Workflow | Section status workflow: draft → writer review → biostat review → medical review → approved | All | M |
| FR-WF-02 | Workflow | Part 11-compliant electronic signatures on section approval | QA | M |
| FR-WF-03 | Workflow | Configurable approval routing per sponsor SOP | QA | C |
| FR-AUD-01 | Audit | Immutable, timestamped audit trail of every generation, edit, approval and export | QA, Regulatory | M |
| FR-AUD-02 | Audit | Version pinning of model, prompt, template and configuration per generation | QA | M |
| FR-AUD-03 | Audit | Regeneration log: reproduce any draft, or explain differences | Regulatory | S |
| FR-AUD-04 | Audit | Audit package export for inspections | QA | S |
| FR-EXP-01 | Export | Export to DOCX in the sponsor template with styles, TOC and cross-references | Writer | M |
| FR-EXP-02 | Export | Export the evidence pack (reconciliation reports, lineage, sign-offs) as PDF | Regulatory | S |
| FR-ANL-01 | Analytics | Value dashboard: time per section, acceptance rate, edit distance, errors found, cycle time | Exec, PM | M |
| FR-ANL-02 | Analytics | Edit classification: capture user edits as structured diffs with error-type tags | PM, AI/ML | M |
| FR-ADM-01 | Admin | Role-based access control per study and section | QA | M |
| FR-ADM-02 | Admin | SSO (SAML/OIDC) | IT | M |
| FR-ADM-03 | Admin | Template and style guide configuration UI | Writer | C |

### 8.3 Non-functional requirements

| ID | Category | Requirement |
| --- | --- | --- |
| NFR-ACC-01 | Accuracy | 100% numeric fidelity on gold sets (hard release gate) |
| NFR-ACC-02 | Accuracy | ≥0.99 citation precision (cited source supports the sentence) on gold sets |
| NFR-PERF-01 | Performance | Section draft in ≤2 minutes; narrative batch of 200 in ≤2 hours |
| NFR-PERF-02 | Performance | Source viewer opens in ≤2 seconds |
| NFR-REP-01 | Reproducibility | Same inputs and versions produce materially identical output (temperature 0; seeded; cached) |
| NFR-SEC-01 | Security | Data encrypted in transit (TLS 1.2+) and at rest (AES-256); tenant isolation |
| NFR-SEC-02 | Security | No partner data used to train shared or third-party models; zero-retention LLM endpoints |
| NFR-SEC-03 | Security | Data residency configurable (EU/US); ISO 27001/SOC 2 Type II controls |
| NFR-PRIV-01 | Privacy | Patient data pseudonymized; GDPR and HIPAA-aligned processing |
| NFR-VAL-01 | Validation | Documented intended use and GxP risk assessment |
| NFR-VAL-02 | Validation | Requirements traceability matrix linking every FR to test evidence |
| NFR-VAL-03 | Validation | Change control for model, prompt and template changes, with regression evidence |
| NFR-VAL-04 | Validation | 21 CFR Part 11 and EU Annex 11 controls: audit trail, e-signatures, access control |
| NFR-AVL-01 | Availability | 99.5% uptime in business hours across sponsor time zones; RPO ≤4 h, RTO ≤8 h |
| NFR-UX-01 | Usability | SUS ≥70; new writer productive in ≤2 hours of training |
| NFR-ACS-01 | Accessibility | WCAG 2.1 AA |

## 9. Technical requirements (TRD)

The architecture is built around one rule: **language models write language; deterministic code handles numbers, citations and checks.** Everything is versioned, so any output can be reproduced and explained.

### 9.1 Architecture overview

The system has seven layers. Data flows top to bottom; the audit layer records every step.

1. **Ingestion layer:** document parsers (DOCX, PDF, RTF), TLF parser, SAS dataset readers (ADaM/SDTM). Each input is stored immutably with a content hash.
2. **Knowledge layer:**
   - *Fact store* (PostgreSQL): every TLF value as a typed record: study, TLF ID, table title, population, treatment arm, parameter, statistic, value, unit, footnotes, source cell coordinates.
   - *Document index* (vector + keyword hybrid): chunked protocol, SAP, prior CSRs and style guide, with stable passage IDs.
   - *Study knowledge graph*: endpoints → analyses → TLFs → CSR sections; populations; arms; visit schedule.
3. **Orchestration layer:** section planner → retriever → generator → slot filler → validators → assembler. Implemented as a deterministic pipeline (not an autonomous agent) with explicit steps and logged inputs and outputs.
4. **Model layer:** an LLM gateway routing to approved models (a frontier model via a zero-retention, in-region endpoint, plus an optional self-hosted open-weight model for sensitive steps). Every call logs model ID, version, prompt template ID and hash, parameters, input and output.
5. **Validation layer:** numeric validator, citation verifier, statistical language rules engine, terminology checker, ICH E3 completeness checker, cross-document consistency checker.
6. **Application layer:** authoring editor, source viewer, reconciliation report, review workflow, dashboard, admin. REST/GraphQL API.
7. **Governance layer:** audit trail (append-only, WORM storage), e-signature service, RBAC, version registry (models, prompts, templates, configurations), validation evidence store.

&#91;embedded content: CSR Copilot architecture · sources to export, with the deterministic number path\]

The highlighted path is the core design choice: the fact store feeds numbers straight into the slot filler, so the language model never produces a figure.

### 9.2 The deterministic number pipeline (key design decision)

**Decision:** the model generates prose containing typed placeholders, never literal numbers. Code resolves placeholders from the fact store.

1. The section planner selects the relevant facts (e.g., TEAE incidence by arm from TLF 14.3.1.1).
2. The generator receives the facts as structured references with IDs and display labels, not raw values, and writes prose such as "TEAEs were reported in {F:14.3.1.1/R3/C2} of patients in the treatment arm".
3. The slot filler resolves each placeholder to the formatted value (e.g., "142 (71.0%)") using sponsor formatting rules.
4. The numeric validator scans the final text. Any numeral not produced by a slot is blocked; the exceptions are allow-listed tokens (dates from the fact store, protocol identifiers, section numbers).
5. The reconciliation report lists every slot: fact ID, rendered value, source cell, match status.

**Why:** it removes the largest class of LLM error (hallucinated or transposed numbers) by construction, rather than by detection. It is also the single most persuasive answer to the Biostatistics concern.

**Trade-off:** less fluent phrasing in edge cases, such as derived numbers (differences, ratios). Mitigation: derived values are computed by code in a *derivation library* with unit tests, never by the model.

### 9.3 Generation and retrieval

- **Section templates** define structure, required facts, mandatory statements and phrasing rules per ICH E3 section, configured per sponsor.
- **Retrieval** is scoped: each section retrieves only from its mapped TLFs and relevant protocol and SAP passages. This prevents cross-contamination between populations and analyses.
- **Prompting:** system prompt (role, rules) + section template + fact references + style exemplars from approved prior CSRs + negative rules (e.g., no causal claims, no efficacy interpretation in descriptive sections).
- **Citation binding:** each generated sentence must reference one or more fact IDs or passage IDs. The citation verifier checks entailment (does the source support the sentence?) with a separate verifier model plus rules. Sentences that fail are flagged, not silently removed.
- **Narratives:** a template-plus-slot approach per narrative type (death, SAE, discontinuation). A patient timeline is built deterministically from CRF data; the model writes only the connecting clinical prose.
- **Determinism:** temperature 0, fixed seeds where supported, and caching of model outputs keyed on the input hash for reproducibility.

### 9.4 TLF parsing

- **Preferred route:** obtain structured TLF output (e.g., SAS ODS to XML/JSON, or the ADaM Results Metadata) from statistical programming. This yields near-100% fidelity.
- **Fallback route:** parse RTF/PDF with a layout-aware parser and table-structure recognition, then cross-validate values against ADaM datasets where possible.
- **Confidence scoring:** each parsed table gets a confidence score. Tables below the threshold go to a biostatistician review queue before use.
- **Shell mapping:** TLF shells from the SAP are used to anticipate structure and validate parsed tables.

### 9.5 Evaluation harness

- **Gold sets:** for each MVP section, 2–3 completed CSRs, with source packages and the final approved text as reference. They are expanded with every study.
- **Automated metrics:** numeric fidelity (target 100%), citation precision and recall, unsupported-claim rate, ICH E3 completeness, terminology compliance, statistical-rule violations.
- **Human metrics:** blind rubric scoring by writers and biostatisticians (accuracy, completeness, clarity, regulatory tone) on a 1–5 scale; critical / major / minor error taxonomy.
- **LLM-as-judge:** used only for triage and only after being calibrated against human scores (agreement ≥0.8). It never acts as a release gate on its own.
- **Regression suite:** runs on every change to model, prompt, template or code. Results are stored as validation evidence.

### 9.6 Security, privacy and compliance

- Single-tenant deployment per sponsor (dedicated database and storage) on a GxP-qualified cloud, in-region.
- LLM access via a private endpoint with zero data retention and no training on inputs, contractually guaranteed.
- Patient-level data pseudonymized at ingestion; access limited by role; all access logged.
- Infrastructure as code; qualified environments (dev, test, validation, production) with controlled promotion.

### 9.7 ModelOps and change control

- **Version registry:** model, prompt, template, rules and configuration versions are pinned per study. A study stays on its pinned versions unless a change is deliberately approved.
- **Change classification:** minor (prompt wording; regression suite must pass) vs major (model upgrade; regression plus targeted re-validation and QA approval).
- **Monitoring:** acceptance rate, edit distance, validator failures, citation verifier failures and latency per section, with alerts on drift beyond thresholds.
- **Incident process:** an AI quality incident (e.g., a critical error found after approval) triggers root-cause analysis, a regression test added to the suite, and notification to affected studies.

### 9.8 Integrations

| System | Purpose | Phase |
| --- | --- | --- |
| SSO (Okta/Azure AD) | Authentication | MVP |
| SAS / statistical computing environment | Structured TLF export | MVP (manual upload) → Phase 2 (automated) |
| Document management (e.g., Veeva Vault RIM/Clinical) | Source retrieval; final document check-in | Phase 3 |
| Microsoft Word | Export; optional add-in for in-Word review | MVP export; add-in Phase 4 |
| Safety database (e.g., Argus) | Narrative source data | Phase 3 |
| eCTD publishing tools | Hand-off of the final document | Phase 3 |

### 9.9 Key technical decisions (ADR summary)

| Decision | Choice | Alternative rejected | Reason |
| --- | --- | --- | --- |
| Number handling | Deterministic slots | LLM generates and a checker verifies | Prevention beats detection for a hard 100% requirement |
| Orchestration | Fixed pipeline | Autonomous agent | Reproducibility and validation are simpler with explicit steps |
| Fine-tuning | Not in MVP; prompt + retrieval + rules | Fine-tuning on partner CSRs | Small data, validation burden, harder change control |
| Hosting | Single-tenant, in-region | Multi-tenant SaaS | Partner data sensitivity; GxP qualification |
| Editor | Web editor + DOCX export | Word add-in first | Faster to build traceability UX; add-in later for adoption |
| R1 approvals | In the partner's validated document management system | Native Part 11 e-signatures in R1 | Removes a build-and-validate workstream from the 90-day path; native signatures follow in R2 |
| TLF input | Structured export from statistical programming | Parsing RTF/PDF outputs | Near-100% fidelity and weeks saved; parsing becomes an R2 fallback |

## 10. Quality, governance & regulatory readiness

Quality is enforced in four layers: prevention by design, automated checks, accountable human review, and continuous monitoring. No layer is trusted alone.

### 10.1 Quality standards and thresholds

| Dimension | Measure | MVP release threshold | Production alert threshold |
| --- | --- | --- | --- |
| Numeric fidelity | % numbers matching source | 100% (hard gate) | Any mismatch triggers an incident |
| Unsupported claims | Sentences without entailing source, per 100 sentences | 0 in gold set | >0.5 |
| Citation precision | % citations that support their sentence | ≥99% | <98% |
| Completeness | ICH E3 required elements present | 100% of template-required elements | <100% |
| Statistical language | Rule violations per section | 0 critical | Any critical |
| Acceptance | % AI sentences accepted unchanged or with minor edits | ≥80% | <70% (signals drift or poor fit) |
| Critical error rate | Critical errors found in review, per 100 pages | Below human first-draft baseline | Above baseline for 2 consecutive studies |

**Error taxonomy.** *Critical:* a wrong number, a wrong direction of effect, a wrong population or arm, an omitted safety finding, or an unsupported efficacy claim. *Major:* a missing required element, inconsistency across sections, misuse of statistical terminology. *Minor:* style, terminology preference, verbosity.

### 10.2 Validating AI-assisted outputs

Every section passes through the same sequence before approval:

1. Automated validators (numeric, citation, statistical language, completeness, terminology) must all pass, or every failure must be explicitly dispositioned.
2. Writer review and acceptance per sentence.
3. Biostatistician sign-off using the reconciliation report (mandatory for sections 11 and 12).
4. Medical or safety review (mandatory for narratives).
5. Standard partner QC per SOP. The tool does not replace QC in the MVP; QC findings are logged to measure the tool's effect.

### 10.3 System validation (computer system validation)

- **Intended use statement:** "CSR Copilot generates draft text for defined CSR sections from approved source documents, for review and approval by qualified personnel. It does not make scientific or regulatory decisions."
- **Approach:** risk-based, following ISPE GAMP 5 (2nd edition) and the principles of the FDA's Computer Software Assurance (CSA) guidance. The CSA guidance, final since September 2025, formally covers device production and quality-system software; pharma applies its risk-based principles by analogy. Assurance effort is focused on high-risk functions: number handling, citations, audit trail, e-signatures.
- **Supplier package (PharmaSense):** user requirements, functional specification, design specification, risk assessment (FMEA), test protocols and results, traceability matrix, release notes.
- **Customer activities (partner):** intended-use validation, user acceptance testing on their study data, SOP updates, training records.
- **AI-specific evidence:** gold-set evaluation reports per release; model and prompt version records; drift-monitoring reports.

### 10.4 Transparency and scientific integrity

- Provenance is visible on every sentence, and exportable.
- AI is never presented as an author. Named humans approve every section.
- AI may not generate interpretation, causality assessments or benefit–risk conclusions in the MVP.
- Partner SOP defines AI-use disclosure. We recommend recording AI use in the CSR authoring records, and following FDA and EMA guidance on AI in regulatory submissions as it evolves.

### 10.5 Governance bodies

| Body | Members | Cadence | Decides |
| --- | --- | --- | --- |
| AI Quality Council | QA lead, Biostatistics lead, Medical Writing lead, AI/ML lead, PM | Monthly + per release | Release go/no-go; autonomy level changes; incident dispositions |
| Change Control Board | QA, Engineering lead, PM | Per change request | Classification and approval of model, prompt or template changes |
| Steering Committee | Exec sponsor, Clinical Development head, PharmaSense leadership | Monthly | Stage gates; scope; investment |

### 10.6 Continuous monitoring as adoption grows

- Production quality sampling: 10% of approved sections re-checked by an independent reviewer in the first 3 studies, falling to 5% once stable.
- Drift dashboards: acceptance rate, edit distance, validator failure rates, by section, study and model version.
- A quarterly quality review shared with the Steering Committee.
- Every critical error becomes a permanent regression test.

### 10.7 Regulatory landscape (verified November 2026)

No regulation prohibits AI-assisted CSR drafting. Every framework below points the same way: define the context of use, take a risk-based approach, keep humans accountable, and document everything.

| Instrument | Status | What it means for CSR Copilot |
| --- | --- | --- |
| [FDA draft guidance: AI to support regulatory decision-making for drugs and biologics](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/considerations-use-artificial-intelligence-support-regulatory-decision-making-drug-and-biological) | Draft, January 2025 | Sets a 7-step, risk-based credibility framework built on the model's context of use. It excludes operational-efficiency uses that don't affect patient safety, drug quality or study reliability. We still document a context of use and a credibility plan, because a CSR supports regulatory decisions. |
| [FDA–EMA Guiding Principles of Good AI Practice in Drug Development](https://www.raps.org/resource/ema-fda-issue-joint-ai-guiding-principles-for-drug.html) | Published 14 January 2026 | 10 principles, including human-centric design, a risk-based approach, adherence to GxP, a clear context of use, data governance, risk-based performance assessment, lifecycle management and plain-language information. These are mapped to the product in 10.8. |
| [EMA reflection paper on AI in the medicinal product lifecycle](https://www.nsf.org/life-science-regulatory-news/ema-reflection-paper-on-ai-in-the-medicinal-product-lifecycle) | Adopted by CHMP and CVMP, September 2024 | Expects risk-based management of AI in clinical development and engagement with regulators where AI affects evidence. |
| [ICH E6(R3) Good Clinical Practice](https://www.ema.europa.eu/en/scientific-guidelines/ich-e6-good-clinical-practice) | Adopted 6 January 2025; Annex 2 takes effect in the EU on 15 January 2027 | A risk-based, proportionate GCP framework; computerized systems used in trials must be fit for purpose. CSR authoring sits in the GCP domain. |
| ICH E3 Structure and Content of CSRs | In force (with Q&A) | Defines the section structure the templates and completeness checks follow. |
| [Draft EU GMP Annex 22 (Artificial Intelligence)](https://www.bioprocessonline.com/doc/ema-issues-revised-annex-new-annex-and-associated-documents-on-data-governance-0001) | Draft; consultation closed 7 October 2025 | GMP, not GCP, so not directly applicable. It says generative AI and LLMs should not be used in *critical* GMP applications; non-critical use with human oversight remains possible. It signals how inspectors think, and supports our design: deterministic numbers, a non-critical drafting role, human verification. |
| [FDA Computer Software Assurance guidance](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/computer-software-assurance-production-and-quality-system-software) | Final, 24 September 2025 | Device-focused; its risk-based assurance principles shape our validation approach. |
| 21 CFR Part 11 / EU GMP Annex 11 | In force (Annex 11 revision in draft) | Audit trail, access control and e-signature controls (NFR-VAL-04). |
| [EU AI Act](https://www.cliffordchance.com/insights/resources/blogs/healthcare-and-life-sciences-insights/2025/11/ai-meets-regulation-at-the-intersection-of-eu-ai-act-and-pharma-compliance-strategy.html) | In force since 1 August 2024; general-purpose AI model obligations since 2 August 2025 | A CSR drafting aid is unlikely to be a high-risk system under Annex III, but this needs legal confirmation. The model provider carries the general-purpose AI obligations; we keep AI-literacy training and transparency. |
| [EMA Policy 0070 (clinical data publication)](https://www.certara.com/blog/streamline-clinical-data-publication-under-ema-policy-0070/) | Relaunched September 2023; step 2 from May 2025 | CSRs submitted to EMA are published after anonymization, so provenance and anonymization-ready drafting become product opportunities (Phase 4). |

### 10.8 How CSR Copilot meets the FDA–EMA guiding principles

| Principle | How the product meets it |
| --- | --- |
| Human-centric by design | Writers author; AI drafts only within the autonomy ladder; named human approval on every section |
| Risk-based approach | Section risk matrix (Section 6); autonomy earned per section |
| Adherence to standards (GxP) | GAMP 5 validation, Part 11 controls, partner SOPs |
| Clear context of use | Written intended-use statement (10.3); scope locked per release |
| Multidisciplinary expertise | Embedded writers, biostatisticians, regulatory and QA in the core team |
| Data governance and documentation | Versioned inputs with hashes; DPA; tenant isolation; audit trail |
| Model design and development practices | Deterministic pipeline; slots; version pinning; ADRs |
| Risk-based performance assessment | Gold-set evaluation; error taxonomy; release thresholds (10.1) |
| Lifecycle management | Change control; drift monitoring; regression suite (9.7) |
| Clear, essential information | Provenance marks, plain-language evidence pack, user training |

## 11. Adoption & trust strategy

Trust is built in a fixed order: prove it on past data, let people see inside it, give them control, then expand autonomy only on evidence. Each persona gets a specific path.

### 11.1 Trust-building sequence

1. **Co-design (discovery):** 3–5 respected senior writers and 2 biostatisticians shape the workflow and the reconciliation report. They become the champions.
2. **Prove on the past (retrospective):** a blind side-by-side of AI-assisted vs human drafts on completed CSRs, with results shared openly, including failures.
3. **Shadow without risk:** the AI runs alongside a recently completed study (weeks 7–10), and later the Phase III dry run; humans compare but do not depend on it.
4. **Controlled live use:** start at L1/L2 in MVP sections; writers choose when to generate.
5. **Earned autonomy:** sections move up the autonomy ladder only with published evidence.

### 11.2 Persona-specific adoption plans

| Persona | What they need to believe | How we earn it | Adoption signal |
| --- | --- | --- | --- |
| Medical Writers | "It makes my job better and I'm still the author." | Co-design; provenance marks; writer controls generation; leadership commits time saved goes to higher-value work (A10) | Weekly active writers; voluntary use beyond MVP sections |
| Biostatisticians | "It can't misstate my numbers." | Deterministic numbers; reconciliation report they designed; statistical rules they own | Biostat review time per section down ≥40% |
| Regulatory | "I can defend every sentence." | Source viewer; lineage; audit package; a mock inspection exercise at G4 | Regulatory approves the evidence pack format |
| QA | "It's validated and controlled." | Early involvement in validation strategy; change control; supplier package | QA approval at G4 |
| Executives | "It's delivering measurable value without risk." | Monthly value dashboard; transparent gate reviews | Funding for Phase 2 at G5 |

### 11.3 Change management

- **Communication:** a narrative from the executive sponsor ("AI handles transcription, you handle science"), demo days every 6 weeks, and an open error log.
- **Training:** role-based training (2 hours for writers, 1 hour for reviewers), sandbox studies, and office hours. Training records are kept for GxP.
- **SOPs:** update the CSR authoring SOP and QC work instruction to define AI-assisted authoring, review responsibilities and documentation.
- **Champions network:** 1 champion per writing team; monthly feedback forum feeding the backlog.
- **Role evolution:** position writers as "scientific editors and narrative owners"; recognize champion contributions.

### 11.4 Measuring trust

Acceptance rate, edit distance, override reasons (tagged), regeneration frequency, repeat usage, a quarterly trust survey ("I would rely on this for my next CSR"), and the share of reviewers who stop line-by-line number checks once the reconciliation report has proven reliable.

## 12. Implementation plan: live in 90 days

Release 1 goes live on a real study in week 13. Four things make this achievable: scope is narrow (narratives plus sections 10 and 12), commodity components are bought, structured TLF export removes the parsing risk, and validation runs alongside the build from week 1. Phase III readiness follows by month 9.

### 12.1 The 90-day plan

| Weeks | Focus | Key deliverables | Gate |
| --- | --- | --- | --- |
| −2 to 0 | Pre-start | DPA signed; security pre-review; SSO and environments provisioned; data access; first live study confirmed; team staffed | — |
| 1–2 | Discover and set up | Baseline on 2 completed CSRs; interviews and shadowing; TLF-export and template audit; Wizard-of-Oz on 20 narratives; intended use and risk assessment agreed with QA; architecture locked | G1 (week 2) |
| 3–6 | Build the thin slice | Narrative pipeline end to end (patient timeline → slots → draft → review → DOCX); section 12.2 (adverse events); fact store; citations; numeric validator; weekly gold-set evaluation | G2 (week 6) |
| 7–10 | Broaden and harden | Rest of section 12 and section 10; reconciliation report; audit log; RBAC; shadow use on a recently completed study; validation test execution starts | G3 (week 10) |
| 11–12 | Validate and prepare | UAT with partner writers; validation summary report; work instruction for AI-assisted drafting; role-based training; hypercare plan | G4 (week 12) |
| 13 | Go live | First live study: narratives and sections 10 and 12 drafted with CSR Copilot; full human QC as normal | — |
| 14–17 | Hypercare | Daily triage; weekly quality review; fixes under change control | — |

**Funding in two stages.** Weeks −2 to 2 run with a 6-person learning team: PM, designer, engineering lead, one ML engineer, the Medical Writing SME and the validation specialist. They produce the G1 evidence and the technical spikes, about 4.5 of roughly 35 person-months (13% of Release 1 spend). The other six (four software engineers, a second ML engineer and the evaluation lead) join in week 3 only if G1 passes. If G1 fails, the investment stops or pivots there.

&#91;embedded content: 90-day plan · phases, stage gates G1–G4 and staged team funding\]

Only the 6-person learning team is funded until G1 at the end of week 2; the full team builds from week 3, and the first study goes live in week 13.

### 12.2 Release scope

| Capability (requirement IDs) | R1: week 13 | R2: month 6 | R3: month 9+ |
| --- | --- | --- | --- |
| Ingestion of TLFs, ADaM datasets, protocol and SAP (FR-ING-01–04) | Structured TLF export only | Adds RTF/PDF parsing fallback | Adds document management connector (FR-ING-05) |
| Patient narratives (FR-GEN-02) | Yes | Yes | Yes |
| Section drafts (FR-GEN-01, FR-GEN-03) | Sections 10 and 12 | Adds section 11 (descriptive) | Adds sections 1–9 and synopsis |
| Deterministic numbers, validator, formatting, statistical rules (FR-NUM-01–04) | Yes; safety-language rules | Adds efficacy and estimand rules | Yes |
| Citations and source viewer (FR-TRC-01/02) | Yes | Yes | Adds lineage graph (FR-TRC-03) |
| Editor with provenance and comments (FR-EDT-01–03) | Yes | Adds fact panel (FR-EDT-04) | Yes |
| Reconciliation report (FR-QC-01) | Yes | Yes | Yes |
| Consistency, completeness and TLF change impact (FR-QC-02–04) | — | Yes | Yes |
| Section workflow (FR-WF-01) | Simple statuses | Yes | Adds configurable routing (FR-WF-03) |
| Part 11 e-signatures (FR-WF-02) | — (approvals in partner's validated DMS) | Yes | Yes |
| Audit trail and version pinning (FR-AUD-01/02) | Yes | Adds regeneration log and audit export (FR-AUD-03/04) | Yes |
| DOCX export (FR-EXP-01) | Yes | Adds evidence pack PDF (FR-EXP-02) | Yes |
| Analytics (FR-ANL-01/02) | Edit capture and basic dashboard | Full dashboard | Yes |
| SSO and RBAC (FR-ADM-01/02) | Yes | Yes | Adds configuration UI (FR-ADM-03) |

### 12.3 What makes 90 days realistic

- **Enterprise LLM endpoint** (zero retention, in-region) instead of self-hosting: no model infrastructure to build.
- **Structured TLF export** from statistical programming instead of PDF parsing: removes the riskiest technical workstream.
- **Narratives first:** built from patient-level datasets with a fixed structure; the highest effort share and the cleanest data.
- **Open-source editor framework** (e.g., TipTap/ProseMirror) and a DOCX library: no editor built from scratch.
- **Approvals stay in the partner's validated document management system for R1:** defers building and validating Part 11 e-signatures.
- **Validation in the sprint:** requirements, risk assessment and test evidence are produced weekly, so the validation summary is assembled, not written, in weeks 11–12.
- **Pre-start weeks:** legal, security and data access are done before day 1, so build time is not lost waiting.

### 12.4 Day-0 dependencies

- Executed DPA and access to 2–3 completed CSR packages.
- Partner QA agreement on the intended use and validation approach (by week 2).
- Statistical programming able to export structured TLFs (confirmed by week 2).
- Committed partner SME time (about 2.5 FTE for 90 days).
- Security approval of LLM hosting.
- A first live study reaching DBL around week 13 (or a recent study still in CSR authoring).

### 12.5 Balancing speed with a first-time build

- **Fixed:** traceability, numeric fidelity, audit trail, validation evidence. These are never traded for speed.
- **Flexible:** breadth of sections, UI polish, integrations (manual upload is fine for R1), admin configuration UI.
- **Uncertainty first:** the riskiest assumptions (A1, A2, A4, A5, A8, A11) are resolved in weeks −2 to 2.
- **Thin vertical slices:** narratives run end to end before broadening to other sections.
- **Fallback always ready:** any CSR can be completed manually at any point. Our output is never a single point of failure.
- **Honest risk:** 90 days is aggressive. If G1 finds no structured TLF export, R1 narrows to narratives only (built from datasets, not TLFs) and still goes live in week 13.

### 12.6 Success criteria by phase

| Phase | Success criteria |
| --- | --- |
| R1 (week 13) | G1–G4 passed; live on the first study on time; 100% numeric fidelity on gold sets |
| R1 live (weeks 13–26) | ≥30% writer-time reduction in R1 sections; no critical errors in QC-approved text; SUS ≥70 |
| R2 (month 6) | Section 11 live with biostatistician sign-off; two live studies; thresholds held |
| Phase III (months 9–15) | ≥2 weeks off DBL-to-final CSR; Phase III CSR delivered; G5 business case |

## 13. Prioritization framework

We use a risk-adjusted RICE score inside fixed guardrails. Guardrails decide what must be built; the score ranks everything else.

### 13.1 Step 1: guardrails (not scored)

These items are table stakes and are never traded off against features: numeric fidelity, traceability, audit trail, access control, e-signatures, and validation evidence. If an item is required to pass a stage gate, it is in.

### 13.2 Step 2: risk-adjusted RICE for everything else

```latex
\text{Score} = \frac{\text{Reach} \times \text{Impact} \times \text{Confidence} \times \text{Strategic fit}}{\text{Effort} \times \text{Regulatory risk}}
```

| Factor | How it is measured |
| --- | --- |
| Reach | Writer hours affected per CSR (from the baseline) |
| Impact | Reduction in DBL-to-final days or review cycles (1 = minor, 3 = massive) |
| Confidence | Strength of evidence: 0.5 = assumption, 0.8 = qualitative evidence, 1.0 = measured |
| Strategic fit | 1.5 if it is a reusable platform capability; 1.0 if study-specific |
| Effort | Person-weeks across all functions, including validation |
| Regulatory risk | 1 = low (administrative), 2 = medium, 3 = high (interpretation or efficacy claims) |

### 13.3 How each investment type is treated

| Investment type | Treatment | Example |
| --- | --- | --- |
| Customer problems | Ranked by the baseline time sinks and the section risk matrix | Narratives before synopsis |
| Platform investments | Strategic-fit multiplier; funded as a fixed \~40% of capacity | Fact store, evaluation harness |
| UX improvements | Trust-building UX ranks above speed UX until G3 | Source viewer before keyboard shortcuts |
| Governance capabilities | Gate-required items are guardrails; others scored normally | Audit export scored; audit trail guarded |
| Long-term expansion | Requires evidence from current sections (confidence factor) | New document types only after G5 |

### 13.4 Capacity allocation

During the 90-day push: about 25% platform and governance (only what Release 1 needs), 50% Release 1 features, 20% evaluation and validation, 5% learning spikes. After go-live: about 40% platform and governance, 35% features, 15% evaluation and quality, 10% learning. Rebalanced at each gate.

### 13.5 Cadence and transparency

- Re-prioritize every 2 sprints, and at every gate, using new evidence.
- Publish a one-page priority stack with an explicit "not now" list to all stakeholders.
- Stakeholder requests enter through one intake and are scored the same way. The loudest voice does not win.

## 14. Team, operating model and resource allocation

Release 1 is delivered by 12 PharmaSense FTE funded in two stages: a 6-person learning team until G1 (week 2), then the full team from week 3. About 2.5 FTE of partner experts are embedded throughout. After go-live the team settles to about 9 FTE, and it splits into platform and solution teams only after G5.

### 14.1 Core team (MVP)

| Role | FTE | Joins | Side | Responsibilities |
| --- | --- | --- | --- | --- |
| Product Manager (lead) | 1 | Week −2 | PharmaSense | Strategy, discovery, prioritization, gates, stakeholder alignment |
| Engineering Lead / Architect | 1 | Week −2 | PharmaSense | Architecture, security review, technical spikes, GxP engineering practices |
| Validation / QA Specialist | 1 | Week −2 | PharmaSense | Intended use, risk assessment, test protocols, change control, Part 11 controls |
| Product Designer | 1 | Week 1 | PharmaSense | Research, trust UX, review interfaces, prototype testing |
| ML Engineer | 1 | Week 1 | PharmaSense | Wizard-of-Oz, narrative pipeline spike, prompts |
| Medical Writing SME | 1 | Week 1 | PharmaSense | Domain lead: templates, narrative structures, gold-set curation, writer onboarding |
| Software Engineers (2 backend, 1 frontend, 1 data) | 4 | Week 3, if G1 passes | PharmaSense | Ingestion, fact store, editor, workflow, audit, export |
| Second ML Engineer | 1 | Week 3, if G1 passes | PharmaSense | Section pipelines, retrieval, citation checks |
| Evaluation & AI Quality Lead | 1 | Week 3, if G1 passes | PharmaSense | Gold sets, evaluation harness, error taxonomy, monitoring |
| Senior Medical Writer (design partner) | 0.6 | Week 1 | Partner | Co-design, style guide, blind reviews, champion |
| Medical Writer | 0.4 | Week 1 | Partner | Usability testing, evaluation scoring, shadow use |
| Biostatistician | 0.4 | Week 1 | Partner | TLF mapping, reconciliation design, statistical rules |
| Statistical Programmer | 0.3 | Week 1 | Partner | Structured TLF export |
| Regulatory Affairs reviewer | 0.2 | Week 1 | Partner | ICH E3 requirements, evidence pack, disclosure policy |
| QA contact | 0.4 | Week 1 | Partner | Intended-use agreement, validation review, work instruction, UAT |
| Safety physician | 0.2 | Week 1 | Partner | Narrative templates and medical review |

### 14.2 How functions collaborate across the lifecycle

| Function | Discover | Build MVP | Validate & shadow | Scale |
| --- | --- | --- | --- | --- |
| Product | Leads research, defines problem | Prioritizes, runs gates | Measures outcomes | Portfolio and business case |
| Engineering | Feasibility spikes | Builds platform | Hardens, fixes | Integrations, multi-tenant |
| AI/ML | Wizard-of-Oz, spikes | Generation + evaluation | Shadow evaluation, tuning | New sections and documents |
| Medical Writing | Co-designs workflow | Templates, gold sets, testing | Shadow comparison | Champions, rollout |
| Biostatistics | Validates TLF feasibility | Statistical rules, reconciliation | Sign-off workflow proven | Programming integration |
| Regulatory Affairs | Defines defensibility bar | Evidence pack review | Mock inspection | Disclosure policy |
| Design | Journey maps, prototype | Trust UX | Usability on live data | Configuration studio |
| Quality | Validation strategy | Requirements, risk assessment | Test execution, UAT | Periodic review, change control |

### 14.3 RACI for key decisions

| Decision | Responsible | Accountable | Consulted | Informed |
| --- | --- | --- | --- | --- |
| MVP scope | PM | Exec sponsor | Med Writing, Biostat, Regulatory | QA, IT |
| Statistical language rules | Biostatistics | Biostat lead | Med Writing | PM |
| Section autonomy level changes | PM | AI Quality Council | Med Writing, Biostat, QA | Exec sponsor |
| Release go/no-go | QA specialist | Partner QA lead | Eng lead, AI Quality lead | Steering Committee |
| Model or prompt change | ML Engineer | Change Control Board | Evaluation lead | Users |
| Stage gate pass/fail | PM | Exec sponsor | All gatekeepers | Steering Committee |

### 14.4 Operating model

- **Dual-track agile:** a discovery track (research, prototypes, experiments) runs one or two sprints ahead of the delivery track.
- **Weekly sprints during the 90-day push (2-week sprints after go-live)** with a demo to partner SMEs every sprint; a validated release every quarter.
- **Validation in the sprint:** the definition of done includes tests, traceability and evidence updates.
- **Weekly learning review:** what we learned, what changed in the assumption register, what decisions follow.
- **Decision log (ADRs)** for product and technical decisions, visible to stakeholders.
- **Error review:** every two weeks, the team reviews AI errors by type and agrees fixes.

### 14.5 Scaling the team (after G5)

Split into a **Platform team** (ingestion, fact store, generation engine, evaluation, governance) and **Solution teams** per document type or therapeutic area, each configuring the platform. Add a Customer Implementation function for new sponsors. Roles new to the organization: Evaluation Lead, AI Quality Lead, and Regulatory AI specialist.

## 15. Stakeholder management

Alignment is managed through a stakeholder map, a fixed governance rhythm, and stage-specific engagement. Each stakeholder hears the story in terms of their own outcome.

### 15.1 Stakeholder map

| Stakeholder | Wins | Fears | Power | Strategy |
| --- | --- | --- | --- | --- |
| Executive leadership (VP Clinical Development) | Faster submissions; strategic capability | Reputational and regulatory risk; wasted investment | Funds; veto | Gate-based funding; monthly value dashboard |
| Clinical Development | Shorter critical path after DBL | Disruption to Phase III | High | Shadow mode first; manual fallback |
| Medical Writing | Less repetitive work | Job loss; loss of authorship | Adoption decides success | Co-design; champions; role framing |
| Biostatistics | Fewer checking cycles | Misrepresented statistics | Gatekeeper; can block | Own the rules and reconciliation report |
| Regulatory Affairs | Consistent, defensible documents | Lack of transparency; inspection findings | Gatekeeper | Evidence pack; mock inspection |
| Quality Assurance | Controlled, validated process | Unvalidatable tool | Veto on release | Agrees the intended use and validation approach in week 1 |
| IT / Security | Secure architecture | Data leakage to AI vendors | Veto on hosting | Early security review; zero-retention, in-region hosting |
| Legal / Privacy | Contractual protection | Patient data, IP, liability | Veto on DPA | DPA before kickoff; clear liability terms |
| CRO partners | Efficiency | Tool replacing their services | Influence on adoption | Include as users; contract updates |
| PharmaSense leadership | Reference customer; product-market fit | Custom-build trap | Funds PharmaSense side | Platform-vs-configuration discipline |

### 15.2 Stage-by-stage engagement map

This table is the basis for the stakeholder-specific decks: who comes in at each stage, and what they need to hear and decide.

| Stage | Stakeholders brought in | What they need to hear | What we need from them | Deck |
| --- | --- | --- | --- | --- |
| 0 — Kickoff | Exec sponsor, PharmaSense leadership, Legal | The bet, stage gates, the ask | Charter, funding, DPA | Executive pitch deck |
| 1 — Discovery | Medical Writing, Biostatistics, Regulatory, Clinical Development | We want to understand your work; you will co-design this | Time, data access, honest pain points | Discovery kickoff deck (per function) |
| 2 — Scope lock | All gatekeepers + QA | What we learned; what the MVP is and is not; how trust works | Scope sign-off; validation strategy agreement | MVP scope & trust deck |
| 3 — Build | Writers, biostatisticians (sprint demos) | Progress; what changed based on your feedback | Feedback, gold-set scoring | Sprint demo pack |
| 4 — Quality gate (G2) | Exec sponsor, Biostatistics, Regulatory | Retrospective evaluation results, including failures | Go to shadow mode | Evidence review deck |
| 5 — Shadow (G3) | Clinical Development, Medical Writing management | Time saved; workflow fit; risks | Go-live decision for the first live study (week 13) | Workflow fit deck |
| 6 — Validated release (G4) | QA, Regulatory, IT | Validation evidence; SOPs; training | Release approval | Validation readiness deck |
| 7 — Scale (G5) | Executive leadership, PharmaSense leadership | Outcomes vs baseline; business case; Phase 2 plan | Phase 2 funding; commercial terms | Business outcomes & scale deck |

### 15.3 Governance rhythm

- **Steering Committee (monthly):** stage gates, scope, investment, escalations.
- **Working group (weekly):** PM + functional leads; priorities, blockers, decisions.
- **Sprint demos (every 2 weeks):** open to all users.
- **One-page update (every 2 weeks):** progress vs plan, metrics, risks, decisions needed.

### 15.4 Handling conflict

Typical conflict: Clinical Development pushes for speed; Biostatistics pushes for rigor. Resolution: make the trade-off explicit with data (risk matrix + cost of delay), let the guardrails decide non-negotiables, and escalate unresolved conflicts to the Steering Committee within one week. Decisions are recorded in the decision log so alignment survives changes in personnel.

## 16. Tooling & product operations

The tooling has two jobs: help the team learn fast, and produce validation evidence as a by-product of normal work.

### 16.1 Recommended tools

| Need | Recommendation | Why |
| --- | --- | --- |
| Discovery research repository | Dovetail (or Condens) | Tag interview insights; link them to assumptions |
| Prototyping | Figma + a coded clickable prototype (Next.js on Vercel, synthetic data only) | Test trust UX with realistic interactions before building |
| Product management | Jira (delivery) + Productboard or Linear (discovery, roadmap) | Traceability from insight to requirement to ticket |
| Documentation and decisions | Confluence/Notion: PRD, ADRs, decision log | One source of truth for stakeholders |
| Validated document control | Partner QMS or a validated eQMS (e.g., Veeva Vault QualityDocs) | Validation deliverables under document control |
| Requirements traceability | Jira + Xray (or a validated ALM tool) | Requirement → test → evidence matrix for validation |
| LLM observability and prompt management | Langfuse (self-hosted) or LangSmith | Prompt versioning, trace logging, evaluation datasets |
| Evaluation | Custom harness (pytest-based) + human scoring app | Domain-specific metrics and rubric scoring |
| Product analytics | PostHog (self-hosted) or Amplitude | Event analytics within data-residency constraints |
| Engineering | GitHub + CI/CD with automated tests and evidence capture; infrastructure as code (Terraform) | Reproducible, qualified environments |
| Monitoring | Datadog or Grafana + custom AI quality dashboards | Uptime, latency and AI quality drift |

### 16.2 Product analytics events (MVP)

| Event | Properties | Answers |
| --- | --- | --- |
| `section_generated` | section, study, model version, duration | How often and how fast |
| `sentence_reviewed` | action (accept/edit/reject), edit distance, error tag | Draft quality; trust |
| `citation_opened` | section, source type | Is the evidence used? Does trust grow? |
| `validator_flag` | validator, severity, disposition | Where the system catches problems |
| `section_approved` | role, review cycles, elapsed time | Cycle time; workflow fit |
| `regenerate_requested` | scope, reason | Where generation falls short |
| `tlf_update_applied` | facts changed, sentences affected | Value of change propagation |

### 16.3 Experimentation practices

- **Offline first:** prompt and template changes are A/B tested on gold sets before they reach users.
- **Blind comparisons:** human vs AI-assisted drafts reviewed without labels.
- **Shadow mode:** new capabilities run invisibly alongside live work before release.
- **Feature flags:** per-study, per-section control of capabilities and autonomy levels.
- **No live A/B testing on GxP documents.** Experiments on live studies use sandbox copies only.

### 16.4 Continuous improvement loop

1. Users edit AI text; edits are captured as structured diffs.
2. Edits are classified by error type (automatically, then human-confirmed).
3. Weekly error review prioritizes fixes: prompt, template, rule or parser.
4. Fixes are tested on the regression suite and released under change control.
5. Acceptance rate and error rates are tracked to confirm improvement.

## 17. Success metrics and business case

Success is measured at four levels. Days from DBL to final CSR is the north star; the leading indicators tell us early whether we are on track.

### 17.1 Metric tree

| Level | Metric | Baseline (assumed) | MVP target | Phase 2 target |
| --- | --- | --- | --- | --- |
| North star | Days from DBL to final approved CSR | 70–85 days | −14 days | −28 days |
| Business | Writer hours per CSR (MVP sections) | 100% | −30 to −40% | −50% |
| Business | Biostatistician review hours per CSR | 100% | −40% | −50% |
| Quality | Critical errors reaching final CSR | Baseline from QC logs | 0 | 0 |
| Quality | QC findings per 100 pages | Baseline from QC logs | −25% | −40% |
| Quality | Review cycles per section | 3–5 | 2–3 | 2 |
| Adoption | Weekly active writers / eligible writers | — | ≥80% on pilot study | ≥70% across studies |
| Adoption | Sentence acceptance rate | — | ≥80% | ≥85% |
| Trust | "I would rely on this for my next CSR" | — | ≥70% agree | ≥80% agree |
| Usability | SUS score | — | ≥70 | ≥75 |

### 17.2 Business case (illustrative, USD; to be replaced with partner data at G1)

Effort savings alone are modest. The business case rests on time to submission and on capacity at the Phase III peak, so both must be validated with the partner at G1.

**Evidence-based inputs (replace with partner data at G1)**

| Input | Evidence | Assumption used |
| --- | --- | --- |
| Time per patient narrative | At least 4 hours of data consolidation and authoring ([Lilly/Yseop](https://yseop.com/case-study/eli-lilly-case-study-content-automation/)) | 4 hours; 150 narratives in a Phase III CSR |
| Writer effort on the CSR body | About 120 hours over four weeks ([Certara](https://certara.com/wp-content/uploads/2024/11/2024-11-08-White-Paper-CoAuthor-and-GPTs.pdf)); 40 working days to first draft for a complex CSR ([Peer AI](https://www.casestudies.com/company/peer-ai/case-study/how-a-public-biopharma-cut-csr-timelines-from-5-months-to-1-month)) | 200 hours for a Phase III body, half of it in R1/R2 sections |
| Writer cost | US medical writer average salary about $94k ([Zippia](https://www.zippia.com/medical-writer-jobs/how-to-hire-a-medical-writer)); contract regulatory writers roughly $50–220/hour by seniority ([Glassdoor posting](https://www.glassdoor.com/Job/remote-medical-writer-jobs-SRCH_KO0,21.htm), [Jobbers](https://www.jobbers.io/medical-writing-freelancing-pharma-healthcare-regulatory-content-2026/)) | Blended $100/hour |
| Savings rate | Narratives: 76% reported at Pfizer ([Narrativa](https://www.narrativa.com/?p=39963)); CSR authoring 30–50% reported ([Axtria](https://www.axtria.com/white-papers/transforming-clinical-study-reports-with-gen-ai-intelligence-powered-automation)) | Conservative: 50% on narratives, 35% on results sections |
| Value of a day | About $800,000 in lost prescription sales per day of delay, average drug, 2023 USD, based on 645 drugs ([Tufts CSDD, 2024](https://csdd.tufts.edu/sites/default/files/2025-02/Aug2024%20Day%20of%20Delay%20White%20Paper%20Final.pdf)) | Applied only if the CSR is on the submission critical path |

**1. Effort savings.** Per Phase III CSR: narratives 150 × 4 h × 50% = 300 h, plus results sections 200 h × 50% × 35% = 35 h. That is about 335 hours, or roughly $34k. For a portfolio of 2 Phase II/III and 6 Phase I CSRs a year, effort savings come to roughly $85–100k a year, before biostatistician review time.

**2. Capacity at peak.** About 335 hours is roughly 8 writer-weeks freed in the post-DBL crunch. That can replace CRO surge capacity, or let the same team absorb the Phase III CSR alongside other studies.

**3. Time to submission (the largest value).** If CSR Copilot takes 14 days off a pivotal CSR that sits on the submission critical path, about $11M in sales is pulled forward for an average drug (14 × $800k). Two caveats: the gain is real only if the CSR is the gating item for the submission, and critics argue that patent-life effects shrink the true value. Treat it as upside, confirmed against the partner's submission plan.

**Investment (PharmaSense, R1):** about 35 person-months, of which about 4.5 are committed before G1 and the rest only if G1 passes. Add infrastructure and LLM usage, which are small (17.3). **G5 threshold:** total value at least 2x investment within 3 years, counting time-to-submission value only where the partner confirms the CSR is on the critical path.

### 17.3 Commercial model, unit cost and market size

**Unit cost of AI is negligible next to people cost.** Estimated LLM usage for one Phase III CSR (150 narratives plus results sections, each drafted and verified once, with 2x headroom for regeneration and evaluation) is about 20M input and 2M output tokens. Current list prices for capable models run about $2–4 per million input tokens and $10–20 per million output tokens ([BenchLM, Oct 2026](https://benchlm.ai/anthropic/api-pricing)). That puts LLM cost at roughly $60–120 per CSR. Even at 5x this estimate, it is under 2% of the effort saved per Phase III CSR.

**Commercial model (proposed; tested with the partner at G3)**

| Option | Proposed price | Best fit |
| --- | --- | --- |
| Design-partner pilot | Fixed fee for the 90-day Release 1, credited against the year-1 licence | First customer |
| Per study | \~$15–25k per Phase II/III CSR; \~$3–5k per Phase I CSR | Sponsors with few studies a year |
| Platform licence | \~$150–250k a year for a mid-sized sponsor; unlimited CSRs, all releases | Sponsors with 8+ CSRs a year |

The per-study price sits below the effort and capacity value of a Phase III CSR (\~$34k effort alone, 17.2); time-to-submission value is the buyer's upside. These prices are a starting hypothesis, not market data.

**Market size**

- **Top-down:** the global medical writing market is estimated at about $3.9–5.0B in 2025 ([Mordor Intelligence via GII](https://www.giiresearch.com/report/moi2114697-medical-writing-market-share-analysis-industry.html), [Polaris](https://www.polarismarketresearch.com/industry-analysis/medical-writing-market)). Regulatory writing is about 42–45% of it, or roughly $1.7–2.2B. If AI authoring platforms capture 5–10% of that as software spend, the regulatory authoring software market is about $85–220M a year across all document types.
- **Bottom-up (CSRs only):** Citeline recorded 4,364 industry-sponsored trials that completed or reached their primary endpoints in 2025 ([Citeline, 2026](https://images.info.citeline.com/Web/Citeline/%7Bec575d64-69b0-4e10-bd49-3c2e6036d13b%7D_2026-completed-clinical-trials-report.pdf)), and roughly each needs a CSR. At a blended \~$10k per CSR, that is about $45M a year. With 7,048 industry-sponsored Phase I–III trials started in 2024 ([Citeline, 2025](https://www.citeline.com/-/media/283A7BEA5FCC4D3D9870A5DA1027284C)), supply of future CSRs is steady.

**Implication for PharmaSense:** CSR authoring alone is a niche of tens of millions a year. The platform thesis, reusing the fact store across CTD summaries, investigator brochures and protocols (Phase 4), is what reaches a $100M+ market. That is the strategic question for G5.

## 18. Risks and pre-mortem

Imagine it is 18 months from now and CSR Copilot has failed. The five most likely reasons, and how this plan prevents each, are below. The full risk register follows.

### 18.1 Pre-mortem

1. **"We sped up drafting, but review was the bottleneck."** Prevented by the time-and-motion baseline (A1) at G1, and by building the reconciliation report and consistency checks that speed up review.
2. **"A wrong number reached a draft and Biostatistics lost trust permanently."** Prevented by deterministic slots, the numeric validator, the reconciliation report, and a 100% numeric-fidelity release gate.
3. **"QA could not validate it, so it never went live on Phase III."** Prevented by agreeing the intended use with QA in week 1, a risk-based approach, and validation evidence built every sprint.
4. **"Writers quietly refused to use it."** Prevented by co-design, champions, provenance marks, writer control of generation, and an executive commitment on how time saved is used.
5. **"We built a custom tool for one customer."** Prevented by the platform-vs-configuration rule, the strategic-fit multiplier, and configuration packs.

### 18.2 Risk register

| Risk | Likelihood | Impact | Mitigation | Owner |
| --- | --- | --- | --- | --- |
| Hallucinated or misattributed content | Med | Critical | Slots, citation verifier, unsupported-claim gate, human review | AI Quality Lead |
| TLF parsing below accuracy target | Med | High | Structured export from SAS; confidence scoring; biostat review queue | Eng Lead |
| Phase III timeline slips or compresses | Med | High | Manual fallback always ready; shadow mode on dry run | PM |
| Partner SME time not available | High | High | Time committed in charter; executive escalation path | Exec sponsor |
| Data access or DPA delayed | Med | High | Public CSRs as fallback for the retrospective phase | PM + Legal |
| Template inconsistency across TAs | High | Med | Template audit; harmonization sprint | Medical Writing |
| Model provider change or deprecation | Med | Med | Version pinning; model gateway; regression suite; open-weight fallback | ML Engineer |
| Regulatory guidance on AI changes | Med | Med | Regulatory AI watch; conservative intended use; disclosure policy | Regulatory |
| Over-reliance: reviewers stop checking | Low–Med | Critical | Mandatory sign-offs; independent sampling; error-seeding audits | QA |
| Scope creep from stakeholder requests | High | Med | Single intake; scoring; published "not now" list | PM |
| Data security incident | Low | Critical | Single-tenant, zero-retention, encryption, pen testing | Eng Lead |
| 90-day timeline slips (data access, QA agreement or SME time) | Med | High | Pre-start weeks clear blockers; scope flexes (narratives-only R1) while the date holds; weekly gate reviews | PM |
| Partner chooses an established vendor instead | Med | High | Win the G2 blind comparison on numeric fidelity and evidence pack; design-partner terms (Section 7.5) | PharmaSense commercial |
| Validation shortcut questioned at inspection | Low | High | Documented intended use and risk assessment; 100% human verification; full validation for expanded use in R2 | Validation lead |

## 19. Open questions, next steps and glossary

### 19.1 Open questions for the partner

- [ ] Which study reaches DBL around week 13 and can be the first live study?
- [ ] What is the actual Phase III DBL date, and is there a dry run with dummy TLFs?
- [ ] Which therapeutic area is the Phase III program in, and how many narratives does it expect?
- [ ] Can statistical programming export TLFs as structured data (e.g., SAS ODS XML/JSON)?
- [ ] How many CSRs per year, and what share is written by CROs?
- [ ] Is there an AI-use policy, and will QA accept "drafting aid with full human verification" as the intended use?
- [ ] Which document management system holds CSRs (e.g., Veeva Vault), and can approvals stay there for R1?
- [ ] Is cloud hosting approved, and in which regions?
- [ ] Is the pivotal CSR on the submission critical path, or are other modules the gating item?
- [ ] What is the commitment on how saved writer time will be used?

### 19.2 Next steps (pre-start, weeks −2 to 0)

- [ ] Sign charter and DPA with the executive sponsor
- [ ] Confirm the first live study and partner SME names and time
- [ ] Staff the 12-person core team
- [ ] Obtain 2–3 completed CSR packages
- [ ] Start the security review of the LLM endpoint and environments
- [ ] Ask statistical programming for 20 structured TLF exports
- [ ] Draft the intended-use statement and risk assessment for QA review in week 1

### 19.3 Glossary

| Term | Meaning |
| --- | --- |
| CSR | Clinical Study Report: the full report of a clinical trial's methods and results, structured per ICH E3 |
| ICH E3 | International guideline defining the structure and content of CSRs |
| DBL | Database lock: the point after which trial data is final and analysis begins |
| TLFs | Tables, listings and figures: the statistical outputs that feed the CSR |
| SAP | Statistical analysis plan |
| ADaM / SDTM | CDISC data standards for analysis datasets and tabulation datasets |
| SAE / TEAE | Serious adverse event / treatment-emergent adverse event |
| GxP | Good practice regulations (GCP, GMP, etc.) covering regulated work |
| 21 CFR Part 11 / EU Annex 11 | US and EU rules for electronic records and signatures |
| GAMP 5 | Industry framework for a risk-based approach to computerized system validation |
| CSV / CSA | Computer system validation / computer software assurance (FDA's risk-based approach) |
| CTD / eCTD | Common technical document format for regulatory submissions, and its electronic version |
| DPA | Data processing agreement |
| Fact store | CSR Copilot's structured database of every value parsed from the TLFs |
| Autonomy ladder | The four levels (L0–L3) of AI involvement allowed per CSR section |
| MVP / R1 / R2 / R3 | MVP = Releases 1 and 2 together. R1 = live at week 13; R2 = month 6; R3 = month 9 onward (Section 12.2) |

### 19.4 Sources

Figures were checked against these pages in November 2026. Vendor results are self-reported and are labelled as such where used.

- [FDA — Considerations for the Use of AI to Support Regulatory Decision-Making for Drug and Biological Products (draft, Jan 2025)](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/considerations-use-artificial-intelligence-support-regulatory-decision-making-drug-and-biological)
- [Mondaq — summary of FDA AI draft guidance scope and exclusions](https://www.mondaq.com/unitedstates/life-sciences-biotechnology-nanotechnology/1578104/fda-publishes-its-first-draft-guidance-on-use-of-artificial-intelligence-in-the-development-of-drugs-and-biological-products)
- [RAPS — EMA and FDA issue joint AI guiding principles (14 Jan 2026)](https://www.raps.org/resource/ema-fda-issue-joint-ai-guiding-principles-for-drug.html)
- [Stephenson Harwood — the 10 FDA–EMA guiding principles](https://www.stephensonharwood.com/post/102mqoo/fda-and-ema-jointly-issue-guiding-principles-of-good-ai-practice-in-drug-developm/)
- [NSF — EMA reflection paper on AI in the medicinal product lifecycle (Sep 2024)](https://www.nsf.org/life-science-regulatory-news/ema-reflection-paper-on-ai-in-the-medicinal-product-lifecycle)
- [Bioprocess Online — draft EU GMP Annex 22 and Annex 11 revision](https://www.bioprocessonline.com/doc/ema-issues-revised-annex-new-annex-and-associated-documents-on-data-governance-0001)
- [EMA — ICH E6 Good Clinical Practice](https://www.ema.europa.eu/en/scientific-guidelines/ich-e6-good-clinical-practice)
- [FDA — Computer Software Assurance for Production and Quality System Software (final, Sep 2025)](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/computer-software-assurance-production-and-quality-system-software)
- [Clifford Chance — EU AI Act and pharma compliance](https://www.cliffordchance.com/insights/resources/blogs/healthcare-and-life-sciences-insights/2025/11/ai-meets-regulation-at-the-intersection-of-eu-ai-act-and-pharma-compliance-strategy.html)
- [Certara — EMA Policy 0070 clinical data publication](https://www.certara.com/blog/streamline-clinical-data-publication-under-ema-policy-0070/)
- [Tufts CSDD — Quantifying the Value of a Day of Delay in Drug Development (2024)](https://csdd.tufts.edu/sites/default/files/2025-02/Aug2024%20Day%20of%20Delay%20White%20Paper%20Final.pdf)
- [Certara — CoAuthor white paper (83 days DBL to CSR; \~120 writer hours)](https://certara.com/wp-content/uploads/2024/11/2024-11-08-White-Paper-CoAuthor-and-GPTs.pdf)
- [Doshi & Jefferson, BMJ Open 2013 — 78 CSRs, 144,610 pages; section-level median lengths](https://bmjopen.bmj.com/content/3/2/e002496.full)
- [Yseop — Eli Lilly case study](https://yseop.com/case-study/eli-lilly-case-study-content-automation/)
- [Narrativa — Pfizer safety narratives](https://www.narrativa.com/?p=39963)
- [eMarketer — Merck and McKinsey CSR generative AI](https://www.emarketer.com/content/ai-streamlines-health-report-filings-merck--mckinsey-collab)
- [Peer AI — CSR case study](https://www.casestudies.com/company/peer-ai/case-study/how-a-public-biopharma-cut-csr-timelines-from-5-months-to-1-month)
- [Saama — post-DBL medical writing](https://www.saama.com/the-post-dbl-data-trap-why-medical-writing-timelines-stall-at-the-finish-line/)
- [Axtria — 30–50% faster CSRs with generative AI](https://www.axtria.com/white-papers/transforming-clinical-study-reports-with-gen-ai-intelligence-powered-automation)
- [ACRP — Clinical Study Reports 101 (16.9 days from final TLFs to draft)](https://acrpnet.org/2020/09/clinical-study-reports-101-tips-and-tricks-for-the-novice/)
- [Zippia — medical writer salary](https://www.zippia.com/medical-writer-jobs/how-to-hire-a-medical-writer)

Added for the business case and market size (17.3):

- [Mordor Intelligence via GII — medical writing market, regulatory share](https://www.giiresearch.com/report/moi2114697-medical-writing-market-share-analysis-industry.html)
- [Polaris Market Research — medical writing market 2025](https://www.polarismarketresearch.com/industry-analysis/medical-writing-market)
- [Citeline — Annual Completed Clinical Trials Report 2026](https://images.info.citeline.com/Web/Citeline/%7Bec575d64-69b0-4e10-bd49-3c2e6036d13b%7D_2026-completed-clinical-trials-report.pdf)
- [Citeline — Annual Clinical Trials Roundup 2025 (2024 trial starts)](https://www.citeline.com/-/media/283A7BEA5FCC4D3D9870A5DA1027284C)
- [BenchLM — Claude API pricing, October 2026](https://benchlm.ai/anthropic/api-pricing)
