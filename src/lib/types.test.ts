import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(join(process.cwd(), path), "utf8");

describe("src/lib/types.ts", () => {
  it("is a verbatim copy of the Core types block in docs/data-model.md", () => {
    const doc = read("docs/data-model.md");
    const block = doc.match(/^```ts\n([\s\S]*?)^```$/m)?.[1];
    expect(block, "Core types block not found in docs/data-model.md").toBeDefined();
    const body = read("src/lib/types.ts").replace(/^(\/\/.*\n)+\n/, "");
    expect(body).toBe(block);
  });
});
