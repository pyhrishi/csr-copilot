# CSR Copilot — Clickable Prototype

We're building a clickable web prototype of **CSR Copilot**, an AI-assisted Clinical Study Report authoring platform, for a product case-study presentation and design-partner demos. It runs on **fictional** study data and deploys to Vercel.

## Read first
- @docs/prototype-brief.md: what to build (11 screens, roles, definition of done)
- @docs/build-plan.md: milestones; work on the first unticked one and tick boxes as you finish
- `docs/PRD-TRD.md`: full product and technical requirements. Read the relevant section when a screen cites a journey (J1–J6) or a requirement ID (FR-*, NFR-*).
- `docs/design-system.md`, `docs/data-model.md`, `docs/demo-script.md`, `docs/glossary.md`: read when you work on UI, data or the demo.

## Non-negotiables
1. **The model never writes a number.** Generated prose contains slots like `{F:14.3.1.1.any_teae.velo}`. Only `src/lib/slots` renders values. Never format or hard-code a clinical figure in a component, prompt or test fixture string.
2. **Every number and sentence is traceable** to a fact or patient field, with citations. If you can't trace it, don't show it.
3. **Synthetic data only.** Use `data/seed/*.json` (study CRD-301, drug velorantib, fictional sponsor). Never add real drug names, real sponsors or anything resembling real patient data. Change data only through `scripts/generate-seed.py`, then run `node scripts/validate-seed.mjs`.
4. **Works offline by default.** Simulated AI mode needs no API key. Live mode is optional (`ANTHROPIC_API_KEY`) and goes through the same fill → validate → reconcile path.
5. **Fiction banner on every page:** "Prototype · fictional study data · not for clinical use".
6. **Don't overclaim in UI copy.** Never say the AI is "accurate", "compliant" or "validated". Show evidence instead: matches, citations, sign-offs.

## Stack
Next.js 16 (App Router, Turbopack) · TypeScript strict · Tailwind CSS v4 · shadcn/ui · lucide-react · Zustand for client state (persisted to localStorage) · Vitest · Playwright · `docx` for export · `@anthropic-ai/sdk` for live mode only. Node ≥ 20.9.

## Commands
- `npm run dev`: local dev at http://localhost:3000
- `npm run typecheck` · `npm run lint` · `npm test` (Vitest) · `npm run e2e` (Playwright)
- `npm run validate:seed` → `node scripts/validate-seed.mjs`
- `python3 scripts/generate-seed.py`: regenerate seed data (then validate)

## Code layout
```
src/app/                 routes (one folder per screen in the brief)
src/components/trust/    NumberChip, CitationMarker, ProvenanceShade, SourceDrawer, ValidatorBadge, MatchStatus, SignOffBlock, LineageTimeline …
src/components/ui/       shadcn/ui
src/lib/data/            seed loaders (server) + types
src/lib/slots/           renderSlots + formats + patient fields   ← the only place numbers become text
src/lib/validate/        NUM-001, STAT-*, CITE-001
src/lib/reconcile/       reconciliation reports
src/lib/narratives/      narrative assembly
src/lib/generation/      simulated + live generators; prompts in prompts/*.md
src/lib/audit/           append-only audit log
src/store/               Zustand stores (draft state, role, mode, audit)
```

## Conventions
- Server Components by default; `"use client"` only for interactive pieces.
- Keep components small; trust components are shared, never re-implemented per screen.
- Accessibility: every status has an icon and text, never colour alone; keyboard-reachable chips and actions.
- Write unit tests with every `src/lib` change. Keep UI tests to Playwright smoke paths.
- Commit after each completed build-plan item with a clear message. Don't push or deploy without asking.

## Helpers in this repo
- Skills: `csr-domain`, `deterministic-numbers`, `synthetic-data`, `trust-ui` (auto-loaded when relevant); `/new-screen`, `/demo-ready`, `/deploy-vercel` (run them explicitly).
- Subagents: `biostat-checker` (numbers trace to facts), `regulatory-reviewer` (traceability and copy), `ux-critic` (screens against the design system). Use them before ticking a milestone.
- Hooks (`.claude/hooks/`): session status on start; blocks edits to `.env*` and to seed JSON; flags numerals in prompt templates; formats changed files; runs typecheck, unit tests and the seed validator before Claude finishes a turn that changed code.
