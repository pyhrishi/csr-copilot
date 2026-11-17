import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  resolve: {
    alias: {
      // `server-only` throws outside a React Server environment; tests load server modules directly.
      "server-only": fileURLToPath(new URL("./test/server-only-stub.ts", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./test/setup.ts"],
    coverage: {
      provider: "v8",
      include: ["src/lib/**"],
      // Type-only modules and non-code assets have no runtime code to cover.
      exclude: [
        "src/lib/**/*.test.{ts,tsx}",
        "src/lib/types.ts",
        "src/lib/data/seed-types.ts",
        "src/lib/**/*.md",
        "src/lib/generation/prompts/**",
      ],
      reporter: ["text-summary", "text"],
      // M1 definition of done: the trust core stays at or above 90% on every measure.
      thresholds: { lines: 90, statements: 90, functions: 90, branches: 90 },
    },
  },
});
