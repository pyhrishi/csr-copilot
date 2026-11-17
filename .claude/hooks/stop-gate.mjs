#!/usr/bin/env node
// Stop: before Claude finishes a turn that changed code, run the quality gate.
// Seed validation, typecheck and unit tests must pass; otherwise Claude is asked to keep working.
// Guards: skips when nothing relevant changed, when the app isn't installed yet,
// and when this Stop was already triggered by this hook (stop_hook_active), so it can never loop.
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { readInput, projectDir, emit, exists } from "./lib.mjs";

const input = readInput();
if (input.stop_hook_active) process.exit(0);

const run = (cmd, timeout = 240000) => {
  try {
    execSync(cmd, { cwd: projectDir(), stdio: ["ignore", "pipe", "pipe"], timeout });
    return null;
  } catch (e) {
    const out = `${e.stdout || ""}${e.stderr || ""}`.toString().trim().split("\n").slice(-25).join("\n");
    return out || String(e.message);
  }
};

let changed = "";
try {
  changed = execSync("git status --porcelain", { cwd: projectDir(), stdio: ["ignore", "pipe", "ignore"] }).toString();
} catch {
  process.exit(0); // not a git repo yet: nothing to compare against
}
const relevant = changed.split("\n").some((l) => /\.(tsx?|jsx?|mjs|css|json|py)$/.test(l.trim()));
if (!relevant) process.exit(0);

const failures = [];
const seedErr = run("node scripts/validate-seed.mjs", 60000);
if (seedErr) failures.push(`Seed validation failed:\n${seedErr}`);

if (exists("package.json") && exists("node_modules")) {
  let scripts = {};
  try { scripts = JSON.parse(readFileSync(join(projectDir(), "package.json"), "utf8")).scripts || {}; } catch {}
  if (scripts.typecheck) {
    const err = run("npm run -s typecheck");
    if (err) failures.push(`Typecheck failed:\n${err}`);
  }
  if (scripts.test) {
    const err = run("npm run -s test");
    if (err) failures.push(`Unit tests failed:\n${err}`);
  }
}

if (failures.length) {
  emit({ decision: "block", reason: `Quality gate failed. Fix these before finishing:\n\n${failures.join("\n\n")}` });
}
process.exit(0);
