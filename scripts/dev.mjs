#!/usr/bin/env node

import { spawn } from "node:child_process";

/**
 * Start the development stack.
 *
 * Four processes, one front door. The Hono API on SAPPORTA_API_PORT is the only
 * origin a browser uses: it serves /api/* itself and proxies every other URL to
 * the dev server that owns it, using the same route table it serves the
 * production builds with (packages/api/site-routes.ts). Nothing here builds a
 * site or an application bundle, so a documentation edit costs an Astro hot
 * reload rather than a full `astro build`.
 *
 * Each process watches its own inputs:
 *   shared    tsc --watch, which the API's tsc-watch picks up
 *   api       tsc-watch, then node --watch restarts the server
 *   docs      astro dev
 *   frontend  vite
 */

const apiPort = readPort("SAPPORTA_API_PORT", 3000);
const docsPort = readPort("SAPPORTA_DOCS_PORT", 4321);
const frontendPort = readPort("SAPPORTA_FRONTEND_PORT", 5173);

// State the whole topology here and hand it to every child, so the ports the
// proxy dials and the ports the dev servers bind cannot disagree. Node's
// --env-file does not overwrite variables that are already set, so the API's
// own .env.development load leaves these alone.
const devEnv = {
  ...process.env,
  SAPPORTA_API_PORT: String(apiPort),
  SAPPORTA_DOCS_PORT: String(docsPort),
  SAPPORTA_FRONTEND_PORT: String(frontendPort),
  SAPPORTA_DEV_PROXY: "true",
};

const frontDoor = `http://localhost:${apiPort}`;
const children = new Set();

warnOnPublicAppUrlMismatch();

start(["--filter", "./packages/shared", "build:watch"], "Watch shared package");
start(["--filter", "./packages/docs", "dev"], `Start docs (:${docsPort})`);
start(
  ["--filter", "./packages/frontend", "dev"],
  `Start frontend (:${frontendPort})`,
);
start(
  ["--filter", "./packages/api", "dev"],
  `Start API and front door (:${apiPort})`,
);

console.log(`\n> Open ${frontDoor}`);

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    stopChildren(signal);
  });
}

await new Promise((resolve, reject) => {
  let settled = false;

  function finish(error) {
    if (settled) return;
    settled = true;
    stopChildren("SIGTERM");

    if (error) reject(error);
    else resolve();
  }

  for (const child of children) {
    child.on("exit", (code, signal) => {
      if (signal) {
        finish();
        return;
      }

      if (code !== 0) {
        finish(
          new Error(`A dev process exited with code ${code ?? "unknown"}`),
        );
      }
    });
  }
});

function start(args, label) {
  console.log(`\n> ${label}`);

  const child = spawn("pnpm", args, {
    stdio: "inherit",
    env: devEnv,
    shell: process.platform === "win32",
  });

  children.add(child);
  child.on("exit", () => {
    children.delete(child);
  });

  child.on("error", (error) => {
    console.error(error);
    stopChildren("SIGTERM");
    process.exitCode = 1;
  });

  return child;
}

function stopChildren(signal) {
  for (const child of children) {
    child.kill(signal);
  }
}

function readPort(name, fallback) {
  const value = process.env[name];
  if (value === undefined || value === "") return fallback;

  const port = Number(value);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(`${name} must be a port number; received ${value}.`);
  }

  return port;
}

// Sign-in is checked against SAPPORTA_PUBLIC_APP_URL. Now that the API is the
// front door, an app URL still pointing at the Vite port fails only later, as
// a rejected auth request, so say so here instead.
function warnOnPublicAppUrlMismatch() {
  const publicAppUrl = process.env.SAPPORTA_PUBLIC_APP_URL;
  if (!publicAppUrl || publicAppUrl === frontDoor) return;

  console.warn(
    `\n! SAPPORTA_PUBLIC_APP_URL is ${publicAppUrl}, but the development front door is ${frontDoor}.` +
      `\n  Set SAPPORTA_PUBLIC_APP_URL=${frontDoor} in .env.development unless something else fronts this server.`,
  );
}
