import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createLlmClient, getLlmConfig } from "./llm-client";

describe("llm-client", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.GROQ_API_KEY;
    delete process.env.GROQ_BASE_URL;
    delete process.env.GROQ_MODEL;
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.OPENROUTER_MODEL;
    delete process.env.OLLAMA_BASE_URL;
    delete process.env.OLLAMA_MODEL;
    delete process.env.HF_TOKEN;
    delete process.env.HF_MODEL;
    delete process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_BASE_URL;
    delete process.env.OPENAI_MODEL;
    delete process.env.LLM_API_KEY;
    delete process.env.LLM_BASE_URL;
    delete process.env.LLM_MODEL;
    delete process.env.OPEN_SOURCE_MODEL;
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_MODEL;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("returns unconfigured when no env variables are set", () => {
    const config = getLlmConfig();
    expect(config.configured).toBe(false);
    expect(createLlmClient(config)).toBeNull();
  });

  it("configures Groq when GROQ_API_KEY is present", () => {
    process.env.GROQ_API_KEY = "gsk_test";
    const config = getLlmConfig();
    expect(config.configured).toBe(true);
    expect(config.provider).toBe("groq");
    expect(config.model).toBe("llama-3.3-70b-versatile");
    expect(createLlmClient(config)).not.toBeNull();
  });

  it("configures OpenRouter when OPENROUTER_API_KEY is present", () => {
    process.env.OPENROUTER_API_KEY = "sk-or-test";
    const config = getLlmConfig();
    expect(config.configured).toBe(true);
    expect(config.provider).toBe("openrouter");
    expect(config.model).toBe("meta-llama/llama-3.3-70b-instruct");
  });

  it("configures Ollama when OLLAMA_BASE_URL is present with /v1 handling", () => {
    process.env.OLLAMA_BASE_URL = "http://localhost:11434";
    const config = getLlmConfig();
    expect(config.configured).toBe(true);
    expect(config.provider).toBe("ollama");
    expect(config.baseURL).toBe("http://localhost:11434/v1");

    // When /v1 is already present
    process.env.OLLAMA_BASE_URL = "http://localhost:11434/v1";
    const config2 = getLlmConfig();
    expect(config2.baseURL).toBe("http://localhost:11434/v1");
  });

  it("configures Hugging Face when HF_TOKEN is present", () => {
    process.env.HF_TOKEN = "hf_test";
    const config = getLlmConfig();
    expect(config.configured).toBe(true);
    expect(config.provider).toBe("huggingface");
    expect(config.model).toBe("meta-llama/Llama-3.3-70B-Instruct");
  });

  it("configures OpenAI-compatible provider with OPENAI_API_KEY or LLM_API_KEY", () => {
    process.env.OPENAI_API_KEY = "sk-test";
    process.env.OPEN_SOURCE_MODEL = "qwen2.5-coder-32b";
    const config = getLlmConfig();
    expect(config.configured).toBe(true);
    expect(config.provider).toBe("openai-compatible");
    expect(config.model).toBe("qwen2.5-coder-32b");

    delete process.env.OPENAI_API_KEY;
    process.env.LLM_API_KEY = "llm_key";
    const config2 = getLlmConfig();
    expect(config2.configured).toBe(true);
  });

  it("configures Anthropic when ANTHROPIC_API_KEY is present", () => {
    process.env.ANTHROPIC_API_KEY = "sk-ant-test";
    const config = getLlmConfig();
    expect(config.configured).toBe(true);
    expect(config.provider).toBe("anthropic");
    expect(config.model).toBe("claude-sonnet-5-5");
  });

  it("returns null when createLlmClient called with unconfigured client", () => {
    expect(createLlmClient({ configured: false, model: "test" })).toBeNull();
  });
});
