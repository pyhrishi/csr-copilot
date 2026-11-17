# CSR Copilot — Design System

The prototype should look like the CSR Copilot decks: calm, institutional and evidence-first. It's a regulated-work tool, not a consumer app. That means dense where people work, generous where people decide, with no gradients, no glassmorphism and no emoji.

## Tokens

Put these in `src/app/globals.css` as CSS variables and map them into Tailwind v4 with `@theme`.

| Token | Hex | Use |
|---|---|---|
| `--ink` | `#14213D` | Primary text, headings, dark surfaces (shell nav, banner) |
| `--paper` | `#F7F5F0` | App background |
| `--paper-2` | `#ECE8DF` | Secondary surfaces, table header rows, sidebars |
| `--card` | `#FDFCF9` | Cards and panels |
| `--line` | `#D8D1C3` | Borders and dividers |
| `--muted` | `#5F6470` | Secondary text (≥ 4.5:1 on paper) |
| `--body` | `#3D4656` | Body text |
| `--teal` | `#0E6E6A` | Primary accent: actions, AI provenance, Release 1, "verified" |
| `--teal-tint` | `#E3F0EE` | AI-generated sentence shading, selected states |
| `--teal-light` | `#5EC4B6` | Accent on dark surfaces only |
| `--amber` | `#B45309` | Warnings, human-only areas, AI-edited marker |
| `--amber-tint` | `#FBEFE6` | AI-edited sentence shading, warning backgrounds |
| `--critical` | `#B42318` | Critical validator findings (always with an icon and text) |
| `--critical-tint` | `#FDECEA` | Critical finding background |
| `--ok` | `#0E6E6A` | Reconciled or matched. Reuse teal and always pair it with a ✓ icon and the word "Matched" |

Colour never carries meaning alone: every status has an icon and a word.

## Type

- **Headings:** `EB Garamond` 600 via `next/font/google`. Page titles 40px, section titles 28px.
- **UI and body:** `Public Sans` 400/600/700. Body 15px/1.55 in dense work areas, 16px elsewhere. Labels are 12px, uppercase, letter-spacing 0.08em, weight 700, in teal.
- **Numbers:** `font-variant-numeric: tabular-nums` everywhere a number appears, especially number chips and tables.
- **CSR draft text** in the editor: Public Sans 16px/1.7, max width 72ch, so it reads like a document.

## Layout

- App shell: a 64px top bar (study switcher, role switcher, mode toggle Simulated/Live, Demo button), a 240px left nav, content on `--paper`.
- Fiction banner: a 28px bar above the top bar, in `--ink` with `--teal-light` text.
- Spacing scale: 4, 8, 12, 16, 24, 32, 48. Card radius 12px, chip radius 6px, 1px `--line` borders. No shadows except a subtle one on floating drawers.
- Workspace (S3): a three-pane grid of `260px | 1fr | 360px`, with the source drawer sliding over the right pane at 560px.

## Trust components (build these once, in `src/components/trust/`)

| Component | What it shows | Rules |
|---|---|---|
| `NumberChip` | A slot-rendered value such as `201 (67.4%)` | Tabular nums, teal underline dotted. Hover tooltip: fact id, TLF, row/column labels, version. Click opens SourceDrawer. Not editable as text. |
| `CitationMarker` | A small superscript tag such as `T14.3.1.1` at the end of a sentence | One per cited source. Keyboard focusable. |
| `ProvenanceShade` | A sentence background by origin | AI = teal-tint; AI-edited = amber-tint; human = none. A legend is always visible in the editor header. |
| `ValidatorBadge` | A finding's severity | Critical (red, octagon icon), Major (amber, triangle), Minor (muted, info). Shows the rule id and message. |
| `MatchStatus` | Reconciliation result | ✓ Matched (teal) or ✗ Mismatch (critical) with the expected and actual values. |
| `SignOffBlock` | Who signed, as which role, when, and what the signature means | Disabled state explains why, e.g. "1 critical finding open". |
| `ReleaseBadge` | R1 / R2 / Human / Locked | R1 teal, R2 slate, Human amber, Locked muted with a lock icon. |
| `AutonomyPill` | L0–L3 | L0 Retrieve, L1 Suggest, L2 Draft, L3 Assemble. |
| `SourceDrawer` | The TLF table with the cited cell highlighted, or the patient record | Shows the TLF id, title, population, version, hash and footnotes. |
| `LineageTimeline` | Sources → generation → slot fill → validation → edits → approvals | A vertical stepper with timestamps and actors. |

## Motion

Keep it subtle and purposeful: sentences fade and rise in as they stream (150ms each), drawers slide (200ms), and a reconciliation pass ticks row by row. Respect `prefers-reduced-motion`.

## Voice

- Plain, specific and calm, for example: "12 of 12 numbers match their source tables."
- Never claim the AI is "accurate" or "compliant". Show the evidence instead.
- Use CSR vocabulary correctly: TEAE, SAE, TLF, safety population, preferred term, ICH E3 section numbers.
