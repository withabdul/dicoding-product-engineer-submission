import { defineConfig } from "@playwright/test";

// Backend must already run on :8000 with seeded data (see root README).
export default defineConfig({
  testDir: "./e2e",
  use: { baseURL: "http://localhost:3000" },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
  },
});
