#!/usr/bin/env node
// SessionStart: tell Claude where the build stands, so every session resumes on the right milestone.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";
import { readInput, projectDir, emit, exists } from "./lib.mjs";

readInput();
const lines = [];

try {
  const plan = readFileSync(join(projectDir(), "docs/build-plan.md"), "utf8");
  const blocks = plan.split(/\n(?=## )/).filter((b) => b.startsWith("## "));
  const current = blocks.find((b) => /- \[ \]/.test(b));
  const done = (plan.match(/- \[x\]/gi) || []).length;
  const total = (plan.match(/- \[[ x]\]/gi) || []).length;
  if (current) {
    const title = current.split("\n")[0].replace(/^## /, "");
    const next = current.split("\n").filter((l) => l.startsWith("- [ ]")).slice(0, 3).map((l) => l.replace("- [ ] ", "  - "));
    lines.push(`Build progress: ${done}/${total} items done. Current milestone: ${title}.`, "Next items:", ...next);
  } else {
    lines.push(`Build plan complete (${done}/${total}). Next: run /demo-ready, then /deploy-vercel.`);
  }
} catch {
  lines.push("docs/build-plan.md not found.");
}

if (!exists("package.json")) lines.push("No package.json yet: the app is not scaffolded. Start with milestone M0.");
else if (!exists("node_modules")) lines.push("package.json exists but node_modules is missing: run npm install.");

try {
  const status = execSync("git status --short", { cwd: projectDir(), stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  lines.push(status ? `Uncommitted changes:\n${status.split("\n").slice(0, 15).join("\n")}` : "Working tree clean.");
} catch {
  lines.push("Not a git repository yet (run git init).");
}

lines.push("Reminder: numbers only via src/lib/slots; synthetic data only; fiction banner on every page.");

emit({ hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: lines.join("\n") } });
