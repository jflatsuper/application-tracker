import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { siteSeo } from "./vite/siteSeo.ts";

export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] }), siteSeo()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
