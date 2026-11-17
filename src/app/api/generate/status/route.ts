import "server-only";

import { getLlmConfig } from "@/lib/generation/llm-client";

/**
 * Reports whether live AI generation is configured on the server.
 * Never leaks the actual API key or authorization token to the client.
 */
export async function GET(): Promise<Response> {
  const config = getLlmConfig();

  return Response.json({
    configured: config.configured,
    model: config.configured ? config.model : undefined,
    provider: config.configured ? config.provider : undefined,
  });
}
