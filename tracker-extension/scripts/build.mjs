// Builds the extension into dist/, ready to load unpacked in Chrome.
//   - popup/       the toolbar popup (a small React app)
//   - background.js  the service worker
//   - watch.js     the script that notices a finished application (injected
//                  only on sites the person has allowed)
//   - extract.js   reads the current page when the popup asks
//   - manifest.json, icons/
import react from "@vitejs/plugin-react";
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build, loadEnv } from "vite";
import { SITE_PATTERNS } from "./sites.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");
const env = loadEnv("production", root, "VITE_");
const clean = (value, fallback) =>
  (value?.trim() || fallback).replace(/\/+$/, "");

const apiBase = clean(env.VITE_API_BASE_URL, "http://localhost:8000/api");
const appUrl = clean(env.VITE_APP_URL, "http://localhost:5173");
const appOrigin = new URL(appUrl);
const define = {
  __API_BASE__: JSON.stringify(apiBase),
  __APP_URL__: JSON.stringify(appUrl),
};

rmSync(dist, { recursive: true, force: true });
const quiet = { logLevel: "warn", configFile: false, define };

await build({
  ...quiet,
  root: resolve(root, "src/popup"),
  base: "./",
  plugins: [react()],
  build: { outDir: resolve(dist, "popup"), emptyOutDir: true },
});

// Scripts can't share chunks: a content script must be one self-contained file.
const scripts = [
  ["background", "src/background/index.ts", "es"],
  ["watch", "src/content/watch.ts", "iife"],
  ["extract", "src/content/extract.ts", "iife"],
];
for (const [name, entry, format] of scripts) {
  await build({
    ...quiet,
    build: {
      outDir: dist,
      emptyOutDir: false,
      lib: {
        entry: resolve(root, entry),
        formats: [format],
        name: `refresha_${name}`,
        fileName: () => `${name}.js`,
      },
    },
  });
}

const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
const manifest = {
  manifest_version: 3,
  name: "Refresha",
  version: pkg.version,
  description:
    "Add job postings to Refresha, and have applications added for you as you apply. Part of Refresha Pro.",
  icons: {
    16: "icons/icon-16.png",
    32: "icons/icon-32.png",
    48: "icons/icon-48.png",
    128: "icons/icon-128.png",
  },
  action: {
    default_title: "Refresha",
    default_popup: "popup/index.html",
  },
  background: { service_worker: "background.js", type: "module" },
  // activeTab + scripting: read the page you click the icon on, nothing else.
  permissions: ["activeTab", "scripting", "storage", "notifications"],
  host_permissions: [`${new URL(apiBase).origin}/*`],
  // Asked for only when the person turns on automatic adding.
  optional_host_permissions: SITE_PATTERNS,
  // Lets the web app's "Connect the extension" page message us, and no other
  // site. (Match patterns take no port, so the worker checks the exact origin.)
  externally_connectable: {
    matches: [`${appOrigin.protocol}//${appOrigin.hostname}/*`],
  },
  // Pins the extension's ID (see .env.example). Leave unset for the Web Store.
  ...(env.VITE_EXTENSION_KEY?.trim()
    ? { key: env.VITE_EXTENSION_KEY.trim() }
    : {}),
};
writeFileSync(resolve(dist, "manifest.json"), JSON.stringify(manifest, null, 2));
mkdirSync(resolve(dist, "icons"), { recursive: true });
cpSync(resolve(root, "icons"), resolve(dist, "icons"), { recursive: true });

console.log(`Built ${dist}\n  API: ${apiBase}\n  App: ${appUrl}`);
