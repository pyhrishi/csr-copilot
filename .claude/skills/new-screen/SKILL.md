---
name: new-screen
description: Scaffold one prototype screen from docs/prototype-brief.md with the right route, data loading, trust components, empty/loading states and a Playwright smoke test.
disable-model-invocation: true
argument-hint: "[screen id, e.g. S5] [optional notes]"
---

# Build screen $0

1. Read the **$0** entry in `docs/prototype-brief.md` and every PRD journey or requirement ID it cites in `docs/PRD-TRD.md` (Section 8.1 journeys, 8.2 requirements).
2. Check `docs/build-plan.md` for the milestone this belongs to and any prerequisite in `src/lib` that's missing. If something is missing, build and test it first.
3. Create the route under `src/app/` exactly as named in the brief. Load data server-side from `src/lib/data`; put interactive parts in small client components.
4. Use existing trust components (`src/components/trust/`). If one is missing, create it there, following `docs/design-system.md`.
5. Add loading (`loading.tsx`), empty and error states. Locked states say why and what unlocks them.
6. Wire role-based behaviour from the brief's role table, using the role store.
7. Log user actions that change state to the audit store (see `AuditEvent` in `docs/data-model.md`).
8. Add or extend `e2e/smoke.spec.ts` so this route renders and its primary action works.
9. Run `npm run typecheck && npm test && npm run lint`, then ask the `ux-critic` subagent to review the screen and the `biostat-checker` subagent if it shows numbers.
10. Tick the matching items in `docs/build-plan.md` and commit with message `feat($0): <short summary>`.

Notes from the user: $ARGUMENTS
