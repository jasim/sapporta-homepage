/**
 * Development host: the production route table, proxied to dev servers.
 *
 * In production `mountStaticSite` answers Astro-owned URLs from
 * `packages/docs/dist` and everything else from `packages/frontend/dist`. In
 * development those two builds do not exist; `astro dev` and `vite` serve the
 * same surfaces incrementally instead, and this module forwards to them from
 * the same `astroOwnedPatterns` table registered on the same Hono router. Route
 * ownership is therefore decided by identical data in both modes: only the
 * thing behind each route changes, so a URL cannot resolve to one surface in
 * development and the other in production.
 *
 * The browser only ever talks to this server, on one origin, exactly as it does
 * in production. `scripts/dev.mjs` starts the two dev servers and sets the
 * environment variables read below; `pnpm start` never sets them, so a
 * production boot always takes the static path.
 */
import { Hono, type MiddlewareHandler } from "hono";
import type { SapportaEnv } from "@sapporta/server";
import {
  apiReferenceIndexFile,
  apiReferenceIndexPaths,
  astroOwnedPatterns,
} from "./site-routes.js";

type AppServer = Hono<SapportaEnv>;

export interface DevSiteOptions {
  /** Origin of the `astro dev` server for packages/docs. */
  docsOrigin: string;
  /** Origin of the `vite` dev server for packages/frontend. */
  frontendOrigin: string;
}

/**
 * Vite serves a dev module graph beside the application's own URLs, and both
 * dev servers are Vite servers wanting the same paths. `packages/frontend`
 * therefore runs with `base: "/app-assets/"` while serving, which moves its
 * whole dev graph under the prefix production already gives its assets. What is
 * left at the root belongs to Astro's dev server, and is listed here.
 */
const astroDevServerPatterns: ReadonlyArray<string> = [
  "/@vite/*",
  "/@id/*",
  "/@fs/*",
  "/@astro/*",
  "/@react-refresh",
  "/src/*",
  "/node_modules/*",
];

/**
 * Where `vite` serves the React application while `base` is "/app-assets/".
 * This is the development form of production's `index.html` SPA fallback.
 */
const frontendDevEntry = "/app-assets/index.html";

export function mountDevSite(app: AppServer, options: DevSiteOptions) {
  const { docsOrigin, frontendOrigin } = options;
  const toDocs = proxyTo(docsOrigin);
  const toFrontend = proxyTo(frontendOrigin);

  // Almost every Astro-owned URL is a page `astro dev` answers under that exact
  // name. The reference index is the exception: the static host copies one file
  // into place for three URLs, so name that page for the dev server too. These
  // are registered first, ahead of their own entries in the shared table.
  for (const path of apiReferenceIndexPaths) {
    app.get(path, proxyTo(docsOrigin, `/${apiReferenceIndexFile}`));
  }

  // The sitemaps in the shared table have no development form: @astrojs/sitemap
  // emits them from a completed build, so they 404 here until `astro build`.
  for (const pattern of [...astroOwnedPatterns, ...astroDevServerPatterns]) {
    app.get(pattern, toDocs);
  }

  // Vite's dev module graph, then the React Router fallback for every
  // remaining GET -- the same order and the same catch-all as the static host.
  app.get("/app-assets/*", toFrontend);
  app.get("/*", proxyTo(frontendOrigin, frontendDevEntry));
}

/**
 * Forward a GET to a dev server. Only GET is registered, matching the static
 * host, so there is no request body to carry across.
 */
function proxyTo(
  origin: string,
  rewritePath?: string,
): MiddlewareHandler<SapportaEnv> {
  return async (c) => {
    const upgrade = c.req.header("upgrade");
    if (upgrade) {
      // Hot module reload runs over a WebSocket, and `fetch` cannot forward a
      // protocol upgrade. Both dev servers are configured with an explicit
      // `hmr.clientPort` so the browser opens that socket against them
      // directly; nothing should reach this branch.
      return c.text(
        `Cannot proxy an "${upgrade}" upgrade in development.`,
        426,
      );
    }

    const target = new URL(rewritePath ?? c.req.path, origin);
    if (rewritePath === undefined) {
      target.search = new URL(c.req.url).search;
    }

    const headers = new Headers(c.req.raw.headers);
    // Ask for an identity body so the response can be streamed straight
    // through: `fetch` decodes a compressed body but keeps the header that
    // describes it, which would leave the browser decoding it a second time.
    headers.delete("accept-encoding");

    let upstream: Response;
    try {
      upstream = await fetch(target, {
        method: "GET",
        headers,
        redirect: "manual",
      });
    } catch (error) {
      return c.text(
        `Development server at ${origin} is not reachable: ${String(error)}`,
        502,
      );
    }

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: upstream.headers,
    });
  };
}

/**
 * Read the development topology, or return undefined for a production boot.
 * Both ports are required when the proxy is on: guessing one of them would let
 * a misconfigured shell start a server that quietly serves the wrong thing.
 */
export function readDevSiteEnv(
  env: NodeJS.ProcessEnv = process.env,
): DevSiteOptions | undefined {
  if (env.SAPPORTA_DEV_PROXY !== "true") return undefined;

  return {
    docsOrigin: readDevOrigin(env, "SAPPORTA_DOCS_PORT"),
    frontendOrigin: readDevOrigin(env, "SAPPORTA_FRONTEND_PORT"),
  };
}

function readDevOrigin(env: NodeJS.ProcessEnv, name: string): string {
  const value = env[name];
  if (!value) {
    throw new Error(`SAPPORTA_DEV_PROXY=true requires ${name}.`);
  }

  const port = Number(value);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(`${name} must be a port number; received ${value}.`);
  }

  return `http://localhost:${port}`;
}
