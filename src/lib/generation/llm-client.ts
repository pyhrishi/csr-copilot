import OpenAI from "openai";

export interface LlmConfig {
  configured: boolean;
  provider?: string;
  model: string;
  apiKey?: string;
  baseURL?: string;
}

/**
 * Resolves the configuration for open-source and OpenAI-compatible models.
 * Prioritizes accessible open-source providers (Groq, OpenRouter, local Ollama)
 * so anyone can use live AI without paid/proprietary lock-in.
 */
export function getLlmConfig(): LlmConfig {
  const openSourceModel =
    process.env.OPEN_SOURCE_MODEL ||
    process.env.LLM_MODEL ||
    process.env.GROQ_MODEL;

  // 1. Groq (Free, ultra-fast inference for Meta Llama 3.3 70B & Llama 3.1 8B)
  if (process.env.GROQ_API_KEY) {
    return {
      configured: true,
      provider: "groq",
      model: openSourceModel || "llama-3.3-70b-versatile",
      apiKey: process.env.GROQ_API_KEY,
      baseURL: process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1",
    };
  }

  // 2. OpenRouter (Hosts open-source models including free tiers)
  if (process.env.OPENROUTER_API_KEY) {
    return {
      configured: true,
      provider: "openrouter",
      model: openSourceModel || "meta-llama/llama-3.3-70b-instruct",
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
    };
  }

  // 3. Local Ollama (100% free, local open source runner, zero key needed)
  if (process.env.OLLAMA_BASE_URL) {
    return {
      configured: true,
      provider: "ollama",
      model: openSourceModel || "llama3.2",
      apiKey: "ollama",
      baseURL: process.env.OLLAMA_BASE_URL.replace(/\/$/, "") + (process.env.OLLAMA_BASE_URL.endsWith("/v1") ? "" : "/v1"),
    };
  }

  // 4. Hugging Face Inference API (Serverless open source models)
  if (process.env.HF_TOKEN) {
    return {
      configured: true,
      provider: "huggingface",
      model: openSourceModel || "meta-llama/Llama-3.3-70B-Instruct",
      apiKey: process.env.HF_TOKEN,
      baseURL: "https://api-inference.huggingface.co/v1",
    };
  }

  // 5. Generic OpenAI-compatible open-source endpoint
  if (process.env.OPENAI_API_KEY || process.env.LLM_API_KEY) {
    return {
      configured: true,
      provider: "openai-compatible",
      model: openSourceModel || process.env.OPENAI_MODEL || "llama-3.3-70b-versatile",
      apiKey: process.env.OPENAI_API_KEY || process.env.LLM_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL || process.env.LLM_BASE_URL,
    };
  }

  // 6. Anthropic API key fallback if configured
  if (process.env.ANTHROPIC_API_KEY) {
    return {
      configured: true,
      provider: "anthropic",
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5",
      apiKey: process.env.ANTHROPIC_API_KEY,
    };
  }

  return {
    configured: false,
    model: openSourceModel || "llama-3.3-70b-versatile",
  };
}

/**
 * Returns an OpenAI client configured for the detected open-source provider.
 */
export function createLlmClient(config?: LlmConfig): OpenAI | null {
  const resolved = config || getLlmConfig();
  if (!resolved.configured || !resolved.apiKey) {
    return null;
  }

  return new OpenAI({
    apiKey: resolved.apiKey,
    baseURL: resolved.baseURL,
    dangerouslyAllowBrowser: true,
  });
}
