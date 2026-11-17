#!/usr/bin/env node
// PostToolUse (Edit|Write|MultiEdit): format the changed file with the project's Prettier, if installed.
// Silent and non-blocking: formatting must never stop the work.
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { readInput, filePathsFrom, projectDir, exists } from "./lib.mjs";

const input = readInput();
const bin = join(projectDir(), "node_modules", ".bin", process.platform === "win32" ? "prettier.cmd" : "prettier");
if (!exists("node_modules/.bin/prettier")) process.exit(0);

for (const p of filePathsFrom(input)) {
  if (!/\.(tsx?|jsx?|mjs|css|json|md)$/.test(p) || p.startsWith("data/seed/") || p === "docs/PRD-TRD.md") continue;
  try {
    execFileSync(bin, ["--write", "--log-level", "silent", p], { cwd: projectDir(), stdio: "ignore", timeout: 20000 });
  } catch {
    /* ignore formatting failures */
  }
}
process.exit(0);
