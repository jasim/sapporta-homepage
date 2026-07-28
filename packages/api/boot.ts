/**
 * Application entry point.
 *
 * Start here when you need to change how the app is hosted. This file chooses
 * the database, loads your table/report definitions, installs auth, mounts
 * `/api/...` routes, exposes `/api/openapi.json` for CLI discovery, and finally
 * mounts the prebuilt Astro site and Vite application for single-process
 * deployments. Route registration order matters: the static host is last so it
 * cannot take a request away from an API or health route.
 */
import { join } from "node:path";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import {
  connectProject,
  findProjectRootFrom,
  fromProjectRoot,
  setProjectRoot,
  installExactOriginCors,
  installRequestLogging,
  installSapportaRequestContext,
  installSapportaErrorHandler,
  assertAuthSchemaDefinitions,
  loadSapportaProject,
  mountHealth,
  mountOpenApi,
  mountSapportaFramework,
  TsRestApi,
  type SapportaEnv,
} from "@sapporta/server";
import { loadApp } from "./app.js";
import { publicApiRoutes } from "./app.js";
import { buildAbility } from "./authz/ability.js";
import { resolveRequestDataAuthority } from "./authz/request-data-authority.js";
import { createSapportaMailer } from "./mailer.js";
import { createProjectAuth, readProjectAuthEnv } from "./project-auth/index.js";
import { mountStaticSite } from "./static-site.js";

// Find the project root first so the app can start from any working directory.
const projectRoot = findProjectRootFrom(import.meta.dirname);
if (!projectRoot) {
  throw new Error(
    `Could not find sapporta.json walking up from ${import.meta.dirname}`,
  );
}
setProjectRoot(projectRoot);
const { apiDistDir, frontendDistDir, databasePath } =
  fromProjectRoot(projectRoot);
const docsDistDir = join(projectRoot, "packages/docs/dist");

// Astro renders files in packages/docs/src/pages at build time, not while this
// server is handling a request. Keep the small set of top-level marketing pages
// explicit here: each URL points at the HTML file emitted by `astro build`.
// Documentation routes such as /docs/* and /grid/* are mounted as groups by
// mountStaticSite(), while every remaining non-API GET becomes a Vite SPA route.
const astroPageRoutes = [
  { path: "/", file: "index.html" },
  { path: "/index.html", file: "index.html" },
] as const;

const conn = connectProject(databasePath);
const sapporta = await loadSapportaProject({
  name: "sapporta-homepage-app",
  slug: "sapporta-homepage-app",
  projectRoot,
  apiDistDir,
  conn,
});

// Auth needs the loaded table catalog so every request can apply row security
// before a handler reads or writes table-backed data.
assertAuthSchemaDefinitions(sapporta.catalog.tables);
const projectEnv = readProjectAuthEnv();
const mailer = createSapportaMailer(projectEnv.mail);
const projectAuth = createProjectAuth({
  conn,
  env: projectEnv,
  catalog: sapporta.catalog,
  mailer,
  buildAbility,
  resolveRequestDataAuthority,
  publicRoutes: publicApiRoutes,
});

// All HTTP behavior for this app is mounted on one Hono server.
const app = new Hono<SapportaEnv>();

// Browser sign-in lives under /api/auth/*. All other /api routes receive a
// Sapporta auth context and are private unless explicitly allow-listed.
installRequestLogging(app);
installExactOriginCors(app, {
  origins: projectAuth.env.trustedOrigins,
  credentials: true,
});
installSapportaErrorHandler(app);
if (projectAuth.env.healthPolicy === "authenticated") {
  app.use("/health", projectAuth.resolveMiddleware);
}
mountHealth(
  app,
  projectAuth.env.healthPolicy,
  projectAuth.requirePrincipalUser,
);
app.on(["GET", "POST"], "/api/auth/*", (c) =>
  projectAuth.auth.handler(c.req.raw),
);
installSapportaRequestContext(app, conn);
app.use("/api/*", projectAuth.resolveMiddleware);
app.use("/api/*", projectAuth.rejectAnonymousMiddleware);

// Built-in app APIs: table metadata, CRUD rows, and SQL tools.
const sapportaApi = mountSapportaFramework(app, sapporta, {
  conn,
  auth: {
    requireAuthContext: projectAuth.requireAuthContext,
  },
});

// Custom app APIs. `loadApp()` registers paths like "/bank"; mounting under
// /api serves them at /api/bank.
const apiApp = new TsRestApi<SapportaEnv>();
loadApp(apiApp, { conn, mailer });
app.route("/api", apiApp);
app.route("/api", projectAuth.routes);

// CLI clients use this contract to discover the live API. Because /api routes
// above are private by default, protected apps require the same credentials for
// discovery that they require for data commands.
mountOpenApi(app, sapporta, sapportaApi, apiApp, projectAuth.routes);

// This is the final HTTP layer:
//   1. Serve the explicit Astro pages above from packages/docs/dist.
//   2. Serve the /docs/* and /grid/* Astro documentation trees.
//   3. Serve real Vite assets, then use its index.html as the React Router
//      fallback for every other GET.
// nginx/CDN deployments can replace this call while continuing to proxy the
// dynamic /api/* and /health routes mounted above.
mountStaticSite(app, { docsDistDir, frontendDistDir, astroPageRoutes });

// Start the API server.
const port = projectEnv.apiPort;
const server = serve({ fetch: app.fetch, port }, () => {
  console.log(`sapporta-homepage-app API server ready (port ${port})`);
});

// Close SQLite cleanly when the process receives a termination signal.
const shutdown = (signal: NodeJS.Signals) => {
  server.close();
  conn.sqlite.close();
  process.kill(process.pid, signal);
};
process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
