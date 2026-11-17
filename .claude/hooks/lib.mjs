// Shared helpers for CSR Copilot hooks. Hooks receive JSON on stdin.
import { readFileSync, existsSync } from "node:fs";
import { join, relative, isAbsolute } from "node:path";

export function readInput() {
  try {
    const raw = readFileSync(0, "utf8");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export const projectDir = () => process.env.CLAUDE_PROJECT_DIR || process.cwd();

export function relPath(p) {
  if (!p) return "";
  const abs = isAbsolute(p) ? p : join(projectDir(), p);
  return relative(projectDir(), abs).split("\\").join("/");
}

export function filePathsFrom(input) {
  const ti = input.tool_input || {};
  const paths = [];
  if (ti.file_path) paths.push(ti.file_path);
  if (ti.notebook_path) paths.push(ti.notebook_path);
  if (Array.isArray(ti.edits)) for (const e of ti.edits) if (e.file_path) paths.push(e.file_path);
  return paths.map(relPath);
}

// Emit a JSON decision on stdout and exit 0 (Claude Code parses a single JSON object on exit 0).
export function emit(obj) {
  process.stdout.write(JSON.stringify(obj));
  process.exit(0);
}

export function denyPreTool(reason) {
  emit({ hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: reason } });
}

export function askPreTool(reason) {
  emit({ hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "ask", permissionDecisionReason: reason } });
}

export const exists = (p) => existsSync(join(projectDir(), p));
