import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { parseBoundedInteger } from "@sapporta/shared/validation";

// Dev topology: Hono on SAPPORTA_API_PORT is the only origin the browser uses,
// in development as in production. It serves /api/* itself and proxies every
// other URL to a dev server — Astro's for the marketing site and docs, this one
// for the React application — using the same route table it serves the builds
// with in production (packages/api/site-routes.ts). Frontend code uses relative
// URLs and never sees a port. No VITE_API_URL is needed unless production
// splits the SPA and API across different origins.
//
// `base` is why this server can sit behind that shared origin. Both dev servers
// are Vite servers, and both want /@vite/, /@id/, /src/ and /node_modules/ for
// their dev module graphs. While serving, this one moves its whole graph under
// /app-assets/ — the prefix production already gives its built assets — leaving
// the root unambiguous. A `vite build`, and a `vite preview` of what it built,
// keep base "/": there is no second dev server to share the origin with.
//
// HMR cannot travel through the Hono front door: it is a WebSocket, and the
// proxy there forwards with fetch(). `hmr.clientPort` points the browser at
// this server directly for that one socket, which is the only time it does.
//
// Multi-project on one machine: give each project its own SAPPORTA_API_PORT,
// SAPPORTA_FRONTEND_PORT and SAPPORTA_DOCS_PORT in .env.development. boot.ts
// reads SAPPORTA_API_PORT to bind Hono; this config reads it for the standalone
// `pnpm dev:ui` proxy and reads SAPPORTA_FRONTEND_PORT as Vite's own port.
// strictPort keeps the port Hono proxies to exact.
//
// sapporta-homepage-app-shared is aliased to its source so HMR works without rebuilding
// the shared package's dist/ on every edit. Backend imports the same
// package via the pnpm symlink and reads dist/ (Node can't run TS).
const apiPort = parseIntegerEnv("SAPPORTA_API_PORT", 3000);
const frontendPort = parseIntegerEnv("SAPPORTA_FRONTEND_PORT", 5173);

export default defineConfig(({ command, isPreview }) => ({
  base: command === "serve" && !isPreview ? "/app-assets/" : "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    dedupe: [
      "@sapporta/rest-core",
      "@tanstack/react-form",
      "@tanstack/react-query",
      "@js-temporal/polyfill",
      "zod",
      "react",
      "react-dom",
      "react-router-dom",
      "zustand",
    ],
    alias: {
      "sapporta-homepage-app-shared": path.resolve(
        __dirname,
        "../shared/src/index.ts",
      ),
    },
  },
  server: {
    port: frontendPort,
    strictPort: true,
    hmr: { clientPort: frontendPort },
    // Only used when this server is opened directly with `pnpm dev:ui`; through
    // the Hono front door, /api/* never reaches Vite.
    proxy: {
      "/api": `http://localhost:${apiPort}`,
    },
  },
  build: {
    assetsDir: "app-assets",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("@js-temporal/polyfill")) return "temporal";
        },
      },
    },
  },
}));

function parseIntegerEnv(name: string, fallback: number): number {
  const value = process.env[name];
  if (value === undefined || value === "") return fallback;
  return parseBoundedInteger(value, {
    name,
    min: 0,
    defaultValue: fallback,
    makeError: () => new Error(`${name} must be an integer.`),
  });
}
