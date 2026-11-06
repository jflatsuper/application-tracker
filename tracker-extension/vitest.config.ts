import { defineConfig } from "vitest/config";

export default defineConfig({
  define: {
    __API_BASE__: JSON.stringify("https://api.example.test/api"),
    __APP_URL__: JSON.stringify("https://app.example.test"),
  },
  test: { environment: "jsdom", include: ["src/**/*.test.ts"] },
});
