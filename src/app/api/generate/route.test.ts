import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as liveModule from "@/lib/generation/live";

import { POST } from "./route";

describe("POST /api/generate", () => {
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
    vi.restoreAllMocks();
  });

  it("returns 400 when live AI is not configured", async () => {
    const req = new Request("http://localhost/api/generate", {
      method: "POST",
      body: JSON.stringify({ sectionId: "12.2" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("requires an API key");
  });

  it("returns 404 when sectionId does not exist", async () => {
    process.env.GROQ_API_KEY = "gsk_test";
    const req = new Request("http://localhost/api/generate", {
      method: "POST",
      body: JSON.stringify({ sectionId: "999.9" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  it("returns generated sentences in JSON mode", async () => {
    process.env.GROQ_API_KEY = "gsk_test";

    vi.spyOn(liveModule, "generateLiveSectionDraft").mockResolvedValueOnce([
      {
        id: "12.2-s1",
        sectionId: "12.2",
        template: "TEAEs occurred in {F:14.3.1.1.any_teae.velo} patients.",
        rendered: [
          { type: "text", value: "TEAEs occurred in " },
          {
            type: "slot",
            factId: "14.3.1.1.any_teae.velo",
            format: "display",
            value: "201 (67.4%)",
          },
          { type: "text", value: " patients." },
        ],
        provenance: "ai",
        state: "pending",
        cites: ["14.3.1.1.any_teae.velo"],
        findings: [],
        generation: {
          mode: "live",
          model: "llama-3.3-70b-versatile",
          promptVersion: "v1.0",
          templateVersion: "v1.0",
          at: new Date().toISOString(),
        },
      },
    ]);

    const req = new Request("http://localhost/api/generate", {
      method: "POST",
      body: JSON.stringify({ sectionId: "12.2" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.sentences).toHaveLength(1);
    expect(data.mode).toBe("live");
    expect(data.model).toBe("llama-3.3-70b-versatile");
  });

  it("streams generated sentences in text/event-stream mode", async () => {
    process.env.GROQ_API_KEY = "gsk_test";

    vi.spyOn(liveModule, "generateLiveSectionDraft").mockImplementationOnce(
      async ({ onSentence }) => {
        const sentence = {
          id: "12.2-s1",
          sectionId: "12.2",
          template: "TEAEs occurred in {F:14.3.1.1.any_teae.velo} patients.",
          rendered: [],
          provenance: "ai" as const,
          state: "pending" as const,
          cites: ["14.3.1.1.any_teae.velo"],
          findings: [],
          generation: {
            mode: "live" as const,
            model: "llama-3.3-70b-versatile",
            promptVersion: "v1.0",
            templateVersion: "v1.0",
            at: new Date().toISOString(),
          },
        };
        onSentence?.(sentence, 0, 1);
        return [sentence];
      },
    );

    const req = new Request("http://localhost/api/generate", {
      method: "POST",
      headers: { Accept: "text/event-stream" },
      body: JSON.stringify({ sectionId: "12.2" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/event-stream");

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let text = "";
    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;
      text += decoder.decode(value);
    }

    expect(text).toContain('"type":"sentence"');
    expect(text).toContain('"type":"done"');
  });
});
