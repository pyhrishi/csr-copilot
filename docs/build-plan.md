# Build Plan

Work top to bottom. Tick boxes as you finish. The SessionStart hook reads this file and tells Claude the current milestone, which is the first one with an unticked box. Keep each milestone shippable: the app builds and runs after every one.

## M0 · Scaffold
- [x] Scaffold Next.js 16 (App Router, TypeScript, Tailwind CSS, ESLint, `src/` dir, Turbopack) with `npx create-next-app@latest` into a temporary folder (it refuses non-empty folders), then move its files here: merge its `.gitignore` into ours, keep our `README.md` and `CLAUDE.md`, and don't overwrite `docs/`, `data/`, `scripts/` or `.claude/`
- [x] Add Prettier, Vitest (+ @vitest/coverage-v8), Playwright; scripts: `dev`, `build`, `lint`, `typecheck` (`tsc --noEmit`), `test` (`vitest run`), `e2e` (`playwright test`), `validate:seed`
- [x] shadcn/ui init; add button, card, tabs, table, dialog, sheet, tooltip, badge, select, dropdown-menu, progress, separator, toast (sonner)
- [x] Fonts (EB Garamond, Public Sans via `next/font/google`) and design tokens from `docs/design-system.md`
- [x] App shell: fiction banner, top bar (role switcher, Simulated/Live toggle, Demo button), left nav with all 11 routes stubbed
- [x] Seed loader in `src/lib/data` with types from `docs/data-model.md`; `npm run validate:seed` passes

## M1 · The trust core (no UI)
- [x] `src/lib/slots`: `renderSlots`, formats, patient-field derivations
- [x] `src/lib/validate`: NUM-001, STAT-001..003 from `rules.json`, CITE-001, with suggestions
- [x] `src/lib/reconcile`: per-section reconciliation report
- [x] `src/lib/narratives`: assemble a narrative from template + patient
- [x] `src/lib/audit`: append-only event log (client store), with versions
- [x] All unit tests listed in `docs/data-model.md` pass

## M2 · Study home and data readiness
- [x] S1 Study home with section board, readiness tiles, release and autonomy badges
- [x] S2 Data readiness: inputs with versions and hashes, TLF parse results, mapping table, exceptions

## M3 · Section workspace (hero screen)
- [x] Three-pane layout; outline; Generate draft with streaming (simulated)
- [x] NumberChip, CitationMarker, ProvenanceShade, SourceDrawer with highlighted cell
- [x] Accept / Edit / Reject / Regenerate with keyboard shortcuts; inline edit keeps chips atomic
- [x] Fact panel with drag-to-insert chips
- [x] Checks tab: STAT-001 on 12.2-s3 with one-click fix; NUM-001 when a raw numeral is typed
- [x] Locked states for 11.4 (R2) and 13 (human)

## M4 · Reconciliation and sign-off
- [x] S4 reconciliation table and computed summary
- [x] Biostatistician sign-off (role-gated, blocked by open critical findings), written to audit

## M5 · Narratives
- [ ] S5 queue with filters and batch generation (exceptions skipped with reason)
- [ ] S6 detail: patient timeline, cited narrative, safety physician review

## M6 · Change, audit, export
- [ ] S7 TLF change impact (v1 → v2 dizziness), apply update, re-reconcile
- [ ] S8 audit log, sentence lineage, evidence pack (print view + JSON)
- [ ] DOCX export of a section with the `docx` package

## M7 · Quality, autonomy, value
- [ ] S9 quality view (mock gold-set metrics, clearly labelled) and cross-section consistency check
- [ ] S10 risk matrix 2×2 and autonomy ladder; QA-only change with reason → audit
- [ ] S11 value dashboard (simulated, labelled)

## M8 · Live mode, demo polish, deploy
- [ ] Optional Live AI mode: `/api/generate` route using `@anthropic-ai/sdk`, prompt in `src/lib/generation/prompts/section.md`; returns placeholder prose only; same fill and validate path
- [ ] Guided demo tour following `docs/demo-script.md`
- [ ] Empty, loading and error states; `prefers-reduced-motion`; Lighthouse accessibility ≥ 90 on S1 and S3
- [ ] Playwright smoke test: every route renders; the demo path completes
- [ ] Run `/demo-ready`, then `/deploy-vercel`

## Polish backlog (checkpoint 1)
- [ ] NumberChip tooltip: include explicit cell coordinate indices (`Cell: R{fact.cell.row + 1}:C{fact.cell.col + 1}`) alongside row/column labels (regulatory-reviewer)
- [ ] Audit log: distinguish section review submission (`setSectionStatus("in_review")`) with dedicated workflow action in audit event (regulatory-reviewer)
- [ ] Data readiness KPI strip: add "Simulated seed" pill to emphasize mock ingestion metrics (regulatory-reviewer)
- [ ] Validator micro-diff preview: generalize diff preview in RightPanel by reading dynamically from `finding.span` and `finding.fix.replacement` (biostat-checker)
- [ ] TLF parse results: bind confidence display cell directly to parser telemetry attribute (biostat-checker)
- [ ] Reconciliation table alignment: right-align numeric columns (Rendered Value and Source Value) (ux-critic)
- [ ] Reconciliation table: wrap SourceDrawer inspection button in `<Tooltip>` (ux-critic)
