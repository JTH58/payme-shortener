import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig({
  test: {
    poolOptions: {
      workers: {
        wrangler: { configPath: "./wrangler.toml" },
        miniflare: {
          bindings: {
            FPE_KEY: "test-fpe-key-for-unit-tests-only",
          },
        },
      },
    },
  },
});
