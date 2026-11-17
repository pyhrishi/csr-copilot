# CSR Copilot — Claude Code Starter Kit

Everything Claude Code needs to build the **CSR Copilot clickable prototype** (Next.js 16 on Vercel) from the PRD/TRD: project memory, a screen-by-screen brief, consistent fictional study data, domain skills, reviewer subagents and quality-gate hooks.

## Quick start
```bash
unzip csr-copilot-kit.zip && cd csr-copilot-kit
git init && git add -A && git commit -m "chore: starter kit"
python3 scripts/generate-seed.py        # optional: data is already generated
node scripts/validate-seed.mjs          # should print "Seed OK"
claude                                   # start Claude Code here
```
Then paste the prompt in **START-HERE.md**. Approve the project hooks and MCP server when Claude Code asks; it does this the first time a project defines them.

**Requirements:** Node.js ≥ 20.9 (hooks and app), Python 3 (seed generator only), git, and Claude Code (current version). A Vercel account is needed only for deploying. An Anthropic API key is needed only for the optional Live AI mode.

## What's inside
```
CLAUDE.md                     project memory: goal, non-negotiables, stack, commands, layout
START-HERE.md                 the first prompt to paste
docs/
  PRD-TRD.md                  the full product and technical requirements (exported)
  prototype-brief.md          11 screens, roles, demo goals, definition of done
  build-plan.md               milestones M0–M8 with checkboxes (drives the session-start hook)
  design-system.md            tokens, type, layout, trust components (matches the decks)
  data-model.md               types, slot syntax, pipeline, required unit tests
  demo-script.md              the 7-minute demo the guided tour follows
  glossary.md                 CSR / ICH E3 vocabulary
data/seed/                    FICTIONAL study CRD-301: 5 TLFs, 52 facts, 12 SAE patients, templates, rules
scripts/
  generate-seed.py            regenerates seed data (percentages computed from counts)
  validate-seed.mjs           consistency + traceability + "no numerals outside slots" checks
.claude/
  settings.json               permissions + hooks
  hooks/                      Node hooks (cross-platform)
  skills/                     csr-domain, deterministic-numbers, synthetic-data, trust-ui,
                              new-screen, demo-ready, deploy-vercel
  agents/                     biostat-checker, regulatory-reviewer, ux-critic
.mcp.json                     Playwright MCP for browser checks
.env.example                  optional live-mode settings
```

## Hooks: what runs automatically
| Event | Hook | Effect |
|---|---|---|
| SessionStart | `session-start.mjs` | Tells Claude the current milestone, next items, git status and the non-negotiables |
| PreToolUse · Bash | `guard-bash.mjs` | Blocks destructive commands, force-push and reading `.env`; asks before `git push` and Vercel deploys |
| PreToolUse · Read/Edit/Write | `protect-files.mjs` | Blocks `.env*` access and hand-edits to generated seed JSON; asks before changing the PRD |
| PostToolUse · Edit/Write | `check-numbers.mjs` | Fails if a prompt template or JSX hard-codes clinical numbers ("the model never writes a number") |
| PostToolUse · Edit/Write | `format.mjs` | Runs Prettier on the changed file (silent, once Prettier is installed) |
| Stop | `stop-gate.mjs` | Before Claude finishes a turn that changed code: seed validation, typecheck and unit tests must pass (it can't loop) |

## Skills and subagents
- Auto-loaded when relevant: **csr-domain**, **deterministic-numbers**, **synthetic-data**, **trust-ui**.
- Run by you: **/new-screen S3**, **/demo-ready**, **/deploy-vercel preview|prod**.
- Subagents: **biostat-checker** (numbers trace to facts), **regulatory-reviewer** (traceability, accountability, honest copy), **ux-critic** (screens against the design system).

## The idea the prototype must show
The model writes the words; code inserts every number; every sentence links to its source; humans approve everything. See `docs/prototype-brief.md` §1.

*All study data in this kit is fictional and for demonstration only.*
