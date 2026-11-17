---
name: demo-ready
description: Pre-demo verification of the CSR Copilot prototype. Runs every check, walks the demo script in a browser, and reports anything that would embarrass us in front of a panel.
disable-model-invocation: true
allowed-tools: Bash(git status *) Bash(grep *) Bash(npm run *) Bash(node scripts/*) Bash(npx playwright *)
---

# Demo readiness check

Current state:
- Branch and status: !`git status --short --branch || true`
- Build plan open items: !`grep -c -- "- \[ \]" docs/build-plan.md || true`

Run each step, fix what's broken, and finish with a pass/fail table.

1. `node scripts/validate-seed.mjs`, `npm run typecheck`, `npm run lint` and `npm test` all pass.
2. `npm run build` succeeds with no warnings about dynamic usage on static pages.
3. Start the production server (`npm run start`), then run `npm run e2e`.
4. Walk `docs/demo-script.md` step by step in the browser, using the Playwright MCP if available or a Playwright script otherwise, in **Simulated AI** mode with no API key set. Take a screenshot at each step into `demo-screens/` (git-ignored). Confirm that:
   - the fiction banner is visible on every screen;
   - STAT-001 appears on 12.2-s3 and the fix clears it;
   - typing "in 201 patients" triggers NUM-001;
   - reconciliation shows a computed "N of N" with all Matched;
   - batch narratives produce 10 drafted and 2 exceptions;
   - the TLF v2 change updates 12.2-s4 and re-reconciles;
   - the evidence pack export downloads;
   - every role switch changes the emphasized screen.
5. Ask the `biostat-checker`, `regulatory-reviewer` and `ux-critic` subagents for a final pass. Fix critical findings.
6. Time the walkthrough: it must be under 8 minutes.
7. Report a table of check · result · fix applied, plus anything left open.
