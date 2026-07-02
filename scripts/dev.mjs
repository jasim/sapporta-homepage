#!/usr/bin/env node

import { watch } from "node:fs";
import { mkdir, rm } from "node:fs/promises";
import { spawn } from "node:child_process";

const children = new Set();
const docsWatchPaths = [
  "packages/docs/astro.config.mjs",
  "packages/docs/src",
  "packages/docs/public",
];
let stopDocsBuildWatcher = () => {};

function start(command, args, label) {
  console.log(`\n> ${label}`);

  const child = spawn(command, args, {
    stdio: "inherit",
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

function run(command, args, label) {
  console.log(`\n> ${label}`);

  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: process.platform === "win32",
    });

    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (signal) {
        reject(new Error(`${label} stopped with signal ${signal}`));
        return;
      }

      if (code !== 0) {
        reject(new Error(`${label} exited with code ${code ?? "unknown"}`));
        return;
      }

      resolve();
    });
  });
}

function stopChildren(signal) {
  for (const child of children) {
    child.kill(signal);
  }
}

function delay(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function startDocsBuildWatcher() {
  let rebuildTimer = null;
  let buildRunning = false;
  let buildQueued = false;
  const watchers = [];

  async function rebuildDocs() {
    if (buildRunning) {
      buildQueued = true;
      return;
    }

    buildRunning = true;
    try {
      await run(
        "pnpm",
        ["--filter", "./packages/docs", "build"],
        "Rebuild docs",
      );
    } catch (error) {
      console.error(error);
    } finally {
      buildRunning = false;
      if (buildQueued) {
        buildQueued = false;
        void rebuildDocs();
      }
    }
  }

  for (const path of docsWatchPaths) {
    const watcher = watch(path, { recursive: true }, () => {
      if (rebuildTimer) {
        clearTimeout(rebuildTimer);
      }

      rebuildTimer = setTimeout(() => {
        rebuildTimer = null;
        void rebuildDocs();
      }, 200);
    });

    watcher.on("error", (error) => {
      console.error(error);
    });

    watchers.push(watcher);
  }

  return () => {
    if (rebuildTimer) {
      clearTimeout(rebuildTimer);
      rebuildTimer = null;
    }

    for (const watcher of watchers) {
      watcher.close();
    }
  };
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    stopChildren(signal);
  });
}

await rm("packages/frontend/dist", { force: true, recursive: true });
await mkdir("packages/frontend/dist", { recursive: true });

// The API dev server serves Astro from packages/docs/dist, so build it once
// after .env.development is loaded and before Hono starts serving the homepage.
await run("pnpm", ["--filter", "./packages/docs", "build"], "Build docs");
stopDocsBuildWatcher = startDocsBuildWatcher();

start(
  "pnpm",
  ["--filter", "./packages/shared", "build:watch"],
  "Watch shared package",
);
start("pnpm", ["--filter", "./packages/api", "dev"], "Start API");

await delay(1000);

start("pnpm", ["--filter", "./packages/frontend", "dev"], "Start frontend");

await new Promise((resolve, reject) => {
  let resolved = false;

  function finish(error) {
    if (resolved) {
      return;
    }

    resolved = true;
    stopDocsBuildWatcher();
    stopChildren("SIGTERM");

    if (error) {
      reject(error);
      return;
    }

    resolve();
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
