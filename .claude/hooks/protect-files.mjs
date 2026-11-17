#!/usr/bin/env node
// PreToolUse (Read|Edit|Write|MultiEdit|NotebookEdit): protect secrets, generated seed data and the source-of-truth PRD.
import { readInput, filePathsFrom, denyPreTool, askPreTool } from "./lib.mjs";

const input = readInput();
const tool = input.tool_name || "";
const paths = filePathsFrom(input);
const writing = tool !== "Read";

for (const p of paths) {
  if (/(^|\/)\.env(\.(?!example$)[\w.-]+)?$/.test(p)) {
    denyPreTool(`${p} holds secrets and is off-limits to Claude. Edit .env.example for structure; the user sets real values.`);
  }
  if (writing && /^data\/seed\/.+\.json$/.test(p)) {
    denyPreTool(`${p} is generated. Change scripts/generate-seed.py, run it, then run node scripts/validate-seed.mjs (see the synthetic-data skill).`);
  }
  if (writing && p === "docs/PRD-TRD.md") {
    askPreTool("docs/PRD-TRD.md is the product source of truth exported from the PRD/TRD doc. Confirm the user wants it changed here.");
  }
}
process.exit(0);
