import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("seed validator", () => {
  it("node scripts/validate-seed.mjs exits 0", () => {
    // execFileSync throws on a non-zero exit, failing the test with the validator's output.
    const out = execFileSync(process.execPath, [join(process.cwd(), "scripts/validate-seed.mjs")], {
      encoding: "utf8",
    });
    expect(out).toMatch(/^Seed OK/);
  });
});
