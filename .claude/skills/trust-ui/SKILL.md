---
name: trust-ui
description: CSR Copilot's visual design system and trust components (NumberChip, CitationMarker, ProvenanceShade, SourceDrawer, ValidatorBadge, MatchStatus, SignOffBlock, LineageTimeline, ReleaseBadge, AutonomyPill). Use when building or changing any screen, component, layout, colour, typography or UI copy.
paths:
  - "src/app/**"
  - "src/components/**"
---

# Trust UI

Read `docs/design-system.md` for tokens and the component table before building UI. The rules below are the ones most often broken.

## Ten rules
1. Build each trust component **once** in `src/components/trust/` and reuse it. Never inline a one-off number or citation style.
2. Numbers in UI render through `NumberChip` (draft text) or a `factId`-driven table cell. Never write `{fact.display}` loose in JSX outside these. The `check-numbers` hook flags literal figures.
3. Every status has **icon + word + colour**, e.g. ✓ Matched, ✗ Mismatch, ▲ Major, ⬢ Critical.
4. Provenance is always visible: sentence shading plus a legend in the editor header.
5. Locked or unavailable states **explain why** in one sentence and say what unlocks them (release, role, open finding).
6. Disabled actions show a reason on hover and focus, e.g. "Sign-off needs the Biostatistician role" or "1 critical finding open".
7. Tables use tabular numbers, right-aligned numeric columns, a sticky header and the `--paper-2` header row.
8. Headings in EB Garamond; everything else in Public Sans. No other fonts, and no emoji.
9. Keep the fiction banner on every page, in the root layout only.
10. Copy is plain and evidential ("12 of 12 numbers match their source tables"). Never "accurate", "compliant" or "validated".

## Layout recipes
- **Workspace (S3):** CSS grid `260px 1fr 360px`; SourceDrawer is a shadcn `Sheet` from the right, 560px wide.
- **Queues (S5):** a table with filters above and bulk actions in a sticky footer that shows a count, e.g. "10 ready · 2 exceptions".
- **Dashboards (S9, S11):** 4 stat cards in a row, one chart, and a "simulated data" label next to the title.
- **Risk matrix (S10):** an SVG 2×2 with labelled axes, arrowheads and quadrant names; sections are dots coloured by release, with a legend. Mirror the deck's slide 6.

## Accessibility checklist
Keyboard reaches every chip, marker and action; focus rings use teal at 2px; drawers trap focus and close on Esc; colour contrast is ≥ 4.5:1 for text; motion respects `prefers-reduced-motion`.
