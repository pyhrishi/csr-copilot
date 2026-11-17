#!/usr/bin/env node
// PreToolUse (Bash): block destructive or secret-leaking commands; ask before publishing anything.
import { readInput, denyPreTool, askPreTool } from "./lib.mjs";

const input = readInput();
const cmd = String(input.tool_input?.command || "");

const deny = [
  [/\brm\s+-[a-z]*r[a-z]*f?\s+(\/|~|\$HOME|\.\.?\s*$|\*)/i, "Recursive delete of a root, home, parent or wildcard path is blocked."],
  [/\bgit\s+push\b.*--force(?!-with-lease)/i, "Force push is blocked. Use --force-with-lease after confirming with the user."],
  [/\bgit\s+reset\s+--hard\b/i, "git reset --hard discards work. Ask the user first, or use git stash."],
  [/(cat|less|more|head|tail|type|bat|grep|source)\s+[^|;&]*\.env(?!\.example\b)(\.[\w-]+)?\b/i, "Reading .env files is blocked: secrets must not enter the transcript. Use .env.example for structure."],
  [/\b(printenv|env)\b\s*(\||$)/i, "Dumping the environment can leak secrets. Read a single non-secret variable instead."],
];
for (const [re, why] of deny) if (re.test(cmd)) denyPreTool(why);

const ask = [
  [/\bvercel\b.*(--prod|\bdeploy\b|\bpromote\b)/i, "This publishes the prototype to Vercel. Confirm before deploying."],
  [/\bgit\s+push\b/i, "Pushing to a remote. Confirm before publishing code."],
  [/\bnpm\s+publish\b/i, "Publishing a package. Confirm first."],
];
for (const [re, why] of ask) if (re.test(cmd)) askPreTool(why);

process.exit(0);
