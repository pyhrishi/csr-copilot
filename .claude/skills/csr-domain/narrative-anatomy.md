# Narrative anatomy

Template (from `data/seed/sections.json` → `narrativeTemplate`), in order:

1. **identification:** `Patient {P:id}, a {P:age}-year-old {P:sexWord} randomized to {P:armLabel}, experienced a serious adverse event of {P:eventLower}.`
2. **event:** `The event began on Day {P:onsetDay} and met the seriousness criterion of {P:seriousnessLower}; its severity was {P:severityLower}.`
3. **course:** `{P:timelineSummary}`. Code builds this from `timeline`: for each entry after the first-dose entry, write "On Day N, " and then the entry text verbatim, with the first letter lowercased and a full stop. Never paraphrase source text.
4. **action:** `Action taken with study drug: {P:actionLower}.`
5. **outcome:** `The outcome was reported as {P:outcomeLower}{P:resolvedClause}.`
6. **causality:** `The investigator assessed the event as {P:relatedLower} to study drug.`

Wording fixes code must handle: "related" → "related", "Not related" → "not related", "Possibly related" → "possibly related". For deaths, replace sentence 1's "experienced a serious adverse event of" with "died of" and omit the resolved clause.

## Worked example: CRD301-1042 (rendered)

> Patient CRD301-1042, a 71-year-old man randomized to Velorantib 20 mg, experienced a serious adverse event of hypotension. The event began on Day 18 and met the seriousness criterion of hospitalization; its severity was severe. On Day 18, dizziness and systolic BP 82 mmHg at home; admitted to hospital. On Day 19, study drug interrupted; IV fluids given. On Day 22, BP stable; discharged. On Day 29, study drug restarted at same dose without recurrence. Action taken with study drug: dose interrupted. The outcome was reported as recovered, resolving on Day 22. The investigator assessed the event as related to study drug.

Every number above (71, 18, 22, 29, and 82 mmHg inside the timeline text) comes from the patient record. Timeline text is source data, so it's quoted, not generated, and is cited to the timeline entry.

## Exceptions
Patients with `status: "exception"` (CRD301-1402, CRD301-2190) are skipped in batch generation. The queue shows the `dataIssue` text and an owner ("Data management").
