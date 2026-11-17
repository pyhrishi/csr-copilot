#!/usr/bin/env node
// PostToolUse (Edit|Write|MultiEdit): enforce "the model never writes a number".
// 1) Prompt templates in src/lib/generation/prompts/ must not contain numerals outside slots.
// 2) UI components must not hard-code clinical-looking figures such as "201 (67.4%)".
// Exit 2 sends the message back to Claude so it fixes the file.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { readInput, filePathsFrom, projectDir } from "./lib.mjs";

const input = readInput();
const problems = [];

for (const p of filePathsFrom(input)) {
  let text;
  try { text = readFileSync(join(projectDir(), p), "utf8"); } catch { continue; }

  if (/^src\/lib\/generation\/prompts\/.+\.(md|txt)$/.test(p)) {
    text.split("\n").forEach((line, i) => {
      if (/^\s*(#|<!--|rule:|version:)/i.test(line)) return; // headings, comments, metadata
      const prose = line
        .replace(/\{[FP]:[^}]+\}/g, "")
        .replace(/\b(ICH\s+E\d+|Section|Table|Listing|Figure)\s+[\d.]+/gi, "")
        .replace(/\b(NUM|STAT|CITE)-\d+\b/g, "");
      if (/\d/.test(prose)) problems.push(`${p}:${i + 1} numeral outside a slot -> ${line.trim().slice(0, 120)}`);
    });
  }

  if (/^src\/(app|components)\/.+\.(tsx|jsx)$/.test(p)) {
    const re = />[^<{]*\b\d+\s*\(\d+(\.\d+)?%\)[^<]*</g; // literal "201 (67.4%)" inside JSX text
    let m;
    while ((m = re.exec(text))) problems.push(`${p}: hard-coded clinical figure in JSX -> ${m[0].slice(1, -1).trim().slice(0, 80)}`);
  }
}

if (problems.length) {
  console.error(
    "Numbers must come from the fact store via src/lib/slots (CLAUDE.md non-negotiable 1). Fix these:\n- " +
      problems.join("\n- ") +
      "\nUse a slot such as {F:14.3.1.1.any_teae.velo} or render a <NumberChip factId=...> instead."
  );
  process.exit(2);
}
process.exit(0);
