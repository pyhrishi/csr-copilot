# First prompt for Claude Code

Paste this as your first message after running `claude` in this folder:

---

Read CLAUDE.md, docs/prototype-brief.md and docs/build-plan.md. We're building the CSR Copilot clickable prototype.

Start milestone M0. Scaffold Next.js 16 with create-next-app into a temporary folder (it refuses non-empty folders) and move the result here, merging .gitignore and without overwriting CLAUDE.md, README.md, docs/, data/, scripts/ or .claude/. Set up Tailwind v4 with the design tokens and fonts from docs/design-system.md, shadcn/ui, Vitest, Playwright and Prettier, plus the scripts listed in the build plan. Build the app shell with the fiction banner, role switcher, Simulated/Live toggle and left nav with all 11 routes stubbed. Add the typed seed loader.

Then do M1, the trust core in src/lib, with all the unit tests from docs/data-model.md. Show me the plan for M0 before you start, then work through both milestones, ticking the build plan as you go and committing after each item.

---

## Later prompts that work well
- `/new-screen S3` builds the section workspace (the hero screen). Repeat for S1–S11 in build-plan order.
- "Use the biostat-checker and regulatory-reviewer subagents on what we've built so far."
- "Implement Live AI mode per the deterministic-numbers skill. Keep Simulated as the default."
- `/demo-ready`, then `/deploy-vercel preview`, then `/deploy-vercel prod`.
