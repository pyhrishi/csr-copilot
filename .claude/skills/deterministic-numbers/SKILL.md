---
name: deterministic-numbers
description: How CSR Copilot keeps numbers out of AI output. Covers the slot syntax, renderSlots, the numeral validator, reconciliation and the live-mode prompt contract. Use whenever you touch src/lib/slots, src/lib/validate, src/lib/reconcile, src/lib/generation, NumberChip, or anything that turns data into text.
paths:
  - "src/lib/**"
  - "src/components/trust/**"
  - "src/app/api/**"
---

# Deterministic numbers: the core design rule

**The model writes words; code writes numbers.** This is the product's main idea and the answer to the Biostatistics persona. Treat any shortcut here as a critical bug.

## Contract
1. Generators (simulated or live) output **template text** with slots only: `{F:<factId>}`, `{F:<factId>|n}`, `{F:<factId>|pct}`, and `{P:<field>}` for narratives.
2. `renderSlots(template, ctx)` in `src/lib/slots` is the **only** function that turns data into displayed digits. It returns `RenderedPart[]` (text and slot parts) so the UI can render slots as `NumberChip`s.
3. An unknown fact id **throws**. Never fall back to a guessed or cached value.
4. Validators run on the **text parts** of the rendered output:
   - NUM-001 (critical): any digit in a text part, after removing `Table|Section|Listing|Figure x.y` references and rule ids.
   - CITE-001 (major): a slot whose fact id isn't in the sentence's `cites`.
   - STAT-001..003 from `data/seed/rules.json`. STAT-001 passes only if the sentence also contains a `p_value` fact below its `alpha`.
5. Reconciliation re-reads each slot's fact from the store, compares it with the TLF cell `display` at `fact.cell`, and returns Matched or Mismatch per slot. The summary is computed and never typed.

## Live mode prompt contract (`src/lib/generation/prompts/section.md`)
- Send fact **ids and labels only** (`14.3.1.1.any_teae.velo = "Any TEAE, Velorantib 20 mg"`), **never values**.
- The instructions require slots for every quantitative statement and forbid digits. Ask for one sentence per line with a `cites:` list.
- Post-process: parse, run `renderSlots`, run validators. Reject and retry once if NUM-001 fires. On a second failure, show the raw template with the finding rather than "fixing" it silently.
- Model id comes from env `ANTHROPIC_MODEL` (default `claude-sonnet-5-5`). The `/claude-api` bundled skill has SDK details.
- The `check-numbers` hook blocks numerals in prompt files outside slots.

## Tests you must keep green
See `docs/data-model.md` → "Required unit tests". Add a test for every bug you fix in this area.

## Worked example
Template: `Serious TEAEs were reported for {F:14.3.1.1.sae.velo} patients in the velorantib group and {F:14.3.1.1.sae.pbo} patients in the placebo group.`
Rendered parts: text "Serious TEAEs were reported for " · slot 14.3.1.1.sae.velo → "7 (2.3%)" · text " patients in the velorantib group and " · slot … → "5 (1.7%)" · text " patients in the placebo group."
Reconciliation: 2/2 Matched against Table 14.3.1.1 rows "Any serious TEAE".
