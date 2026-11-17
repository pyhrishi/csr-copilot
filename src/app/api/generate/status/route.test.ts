import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { GET } from "./route";

describe("GET /api/generate/status", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.GROQ_API_KEY;
    delete process.env.OPENAI_API_KEY;
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.LLM_API_KEY;
    delete process.env.HF_TOKEN;
    delete process.env.OLLAMA_BASE_URL;
    delete process.env.ANTHROPIC_API_KEY;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("returns configured: false when no key or local endpoint is set", async () => {
    const res = await GET();
    const data = await res.json();

    expect(data.configured).toBe(false);
    expect(data.model).toBeUndefined();
    expect(data.provider).toBeUndefined();
  });

  it("returns configured: true and open-source model when GROQ_API_KEY is present", async () => {
    process.env.GROQ_API_KEY = "gsk_secret_12345";
    const res = await GET();
    const data = await res.json();

    expect(data.configured).toBe(true);
    expect(data.provider).toBe("groq");
    expect(data.model).toBe("llama-3.3-70b-versatile");
    // CRITICAL: Ensure the actual secret is NEVER sent to the client!
    expect(JSON.stringify(data)).not.toContain("gsk_secret_12345");
  });

  it("returns configured: true when local Ollama is set", async () => {
    process.env.OLLAMA_BASE_URL = "http://localhost:11434";
    const res = await GET();
    const data = await res.json();

    expect(data.configured).toBe(true);
    expect(data.provider).toBe("ollama");
    expect(data.model).toBe("llama3.2");
  });
});
