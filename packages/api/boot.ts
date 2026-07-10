/**
 * Application entry point.
 *
 * Start here when you need to change how the app is hosted. This file chooses
 * the database, loads your table/report definitions, installs auth, mounts
 * `/api/...` routes, exposes `/api/openapi.json` for CLI discovery, and serves
 * the built frontend.
 */
import { join, relative } from "node:path";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono, type MiddlewareHandler } from "hono";
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

type AppServer = Hono<SapportaEnv>;

const noCache = cacheControl("no-cache");
const immutableCache = cacheControl("public, max-age=31536000, immutable");

function cacheControl(value: string): MiddlewareHandler<SapportaEnv> {
  return async (c, next) => {
    c.header("Cache-Control", value);
    await next();
  };
}

function serveStaticUse(
  app: AppServer,
  pattern: string,
  root: string,
  options: { cache?: MiddlewareHandler<SapportaEnv> } = {},
) {
  if (options.cache) app.use(pattern, options.cache);
  app.use(pattern, serveStatic({ root }));
}

function serveStaticGet(
  app: AppServer,
  path: string,
  root: string,
  options: { file?: string; cache?: MiddlewareHandler<SapportaEnv> } = {},
) {
  if (options.cache) app.get(path, options.cache);
  app.get(path, serveStatic({ root, path: options.file }));
}

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

// Static marketing/docs output from the Astro docs package. These routes stay
// ahead of Sapporta assets and the SPA fallback so "/" is a real static
// homepage, "/docs/*" is documentation, and marketing pages are not
// client-side routes.
const docsDist = relative(process.cwd(), docsDistDir) || ".";
serveStaticUse(app, "/_astro/*", docsDist, { cache: immutableCache });
serveStaticUse(app, "/assets/*", docsDist);
serveStaticUse(app, "/pagefind/*", docsDist);
serveStaticGet(app, "/favicon.svg", docsDist);
serveStaticGet(app, "/sitemap-index.xml", docsDist);
serveStaticGet(app, "/sitemap-0.xml", docsDist);
serveStaticGet(app, "/", docsDist, { file: "index.html", cache: noCache });
serveStaticGet(app, "/index.html", docsDist, {
  file: "index.html",
  cache: noCache,
});
serveStaticGet(app, "/docs", docsDist, {
  file: "docs/index.html",
  cache: noCache,
});
serveStaticUse(app, "/docs/*", docsDist, { cache: noCache });
serveStaticGet(app, "/grid", docsDist, {
  file: "grid/index.html",
  cache: noCache,
});
serveStaticGet(app, "/grid/", docsDist, {
  file: "grid/index.html",
  cache: noCache,
});
serveStaticUse(app, "/grid/*", docsDist, { cache: noCache });

// Serve the frontend from the same process by default. Three deployment shapes work:
//   (a) same-origin via this Hono process (default; `pnpm start`)
//   (b) same-origin behind nginx - nginx serves packages/frontend/dist directly
//       and proxies /api/ here; this block becomes harmless dead code
//   (c) split - SPA on a CDN, API here. Delete this block, set VITE_API_URL
//       for the SPA build, set SAPPORTA_PUBLIC_APP_URL on the API host, and
//       route public /api/auth/* requests to this API process.
//
// API routes have already matched above. Remaining browser requests fall
// through to index.html so client-side routes survive hard reloads.
//
// Path is anchored to projectRoot (not "./packages/frontend/dist") so launching
// from any cwd works - systemd, Docker, test harnesses. serveStatic's
// root is relative to process.cwd(); `|| "."` covers the corner case
// where cwd is already inside packages/frontend/dist.
const frontendDist = relative(process.cwd(), frontendDistDir) || ".";
// Vite assets are content-hashed, so they can be cached for a year. They use a
// frontend-specific path so Astro's public `/assets/*` files do not compete with
// the SPA bundle.
serveStaticUse(app, "/app-assets/*", frontendDist, { cache: immutableCache });

// HTML must revalidate because it points at the latest asset hashes.
// Root files and SPA fallbacks stay fresh across deploys.
serveStaticUse(app, "/*", frontendDist, { cache: noCache });
// GET-only - a stray POST to /wat must 404, not return index.html.
serveStaticGet(app, "/*", frontendDist, { file: "index.html" });

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
