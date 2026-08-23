/**
 * Compatibility static host for single-process deployments.
 *
 * Every response mounted here comes from an Astro or Vite build artifact. No
 * documentation or application page is rendered by Hono. Reverse-proxy and
 * split deployments can replace this entire module with nginx/CDN rules while
 * leaving the dynamic API mounts in boot.ts unchanged.
 */
import { existsSync } from "node:fs";
import { join, relative } from "node:path";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono, type MiddlewareHandler } from "hono";
import type { SapportaEnv } from "@sapporta/server";
import {
  alternateMarkdownPath,
  explicitlyPrefersMarkdown,
  markdownVariantPath,
} from "./docs-negotiation.js";

type AppServer = Hono<SapportaEnv>;

export interface StaticSiteOptions {
  docsDistDir: string;
  frontendDistDir: string;
  astroPageRoutes: ReadonlyArray<{
    path: string;
    file: string;
  }>;
}

const markdownContentType = "text/markdown; charset=utf-8";
const plainTextContentType = "text/plain; charset=utf-8";
const xmlContentType = "application/xml; charset=utf-8";
const llmsIndexPaths = new Set([
  "/llms.txt",
  "/.well-known/llms.txt",
  "/docs/llms.txt",
  "/docs/llms-full.txt",
  "/grid/llms.txt",
  "/grid/llms-full.txt",
]);
const noCache = cacheControl("no-cache");
const immutableCache = cacheControl("public, max-age=31536000, immutable");

export function mountStaticSite(app: AppServer, options: StaticSiteOptions) {
  const { astroPageRoutes, docsDistDir, frontendDistDir } = options;
  const docsDist = relative(process.cwd(), docsDistDir) || ".";
  const frontendDist = relative(process.cwd(), frontendDistDir) || ".";

  const documentationDiscoveryHeaders: MiddlewareHandler<SapportaEnv> = async (
    c,
    next,
  ) => {
    const alternatePath = alternateMarkdownPath(c.req.path);
    const alternateExists =
      alternatePath !== undefined &&
      existsSync(join(docsDistDir, alternatePath.replace(/^\//, "")));
    const isLlmsIndex = llmsIndexPaths.has(c.req.path);
    const isDocumentationSurface =
      c.req.path === "/docs" ||
      c.req.path === "/docs.md" ||
      c.req.path.startsWith("/docs/") ||
      c.req.path === "/grid" ||
      c.req.path.startsWith("/grid/");
    const isHomepage = c.req.path === "/" || c.req.path === "/index.html";

    if (isHomepage) {
      c.header("Link", '</llms.txt>; rel="alternate"; type="text/markdown"');
    } else if (isDocumentationSurface || isLlmsIndex) {
      const links = ['</llms.txt>; rel="llms-txt"'];
      if (alternateExists) {
        links.push(`<${alternatePath}>; rel="alternate"; type="text/markdown"`);
      }
      c.header("Link", links.join(", "));
      c.header("X-Llms-Txt", "/llms.txt");
    }
    if (alternateExists && !c.req.path.endsWith(".md")) {
      c.header("Vary", "Accept", { append: true });
    }

    await next();

    if (
      alternateExists &&
      c.req.path.endsWith(".md") &&
      c.res.status >= 200 &&
      c.res.status < 400
    ) {
      c.res.headers.set("Content-Type", markdownContentType);
    }
  };

  // A trailing wildcard also matches the bare path, so "/docs/*" covers "/docs"
  // itself. "/docs.md" sits beside that group rather than under it.
  for (const pattern of [
    "/",
    "/index.html",
    "/llms.txt",
    "/.well-known/llms.txt",
    "/docs.md",
    "/docs/*",
    "/grid/*",
  ]) {
    app.use(pattern, documentationDiscoveryHeaders);
  }

  const negotiatedMarkdown = serveStatic({
    root: docsDist,
    rewriteRequestPath: (path) => markdownVariantPath(path) ?? path,
  });
  const negotiateDocumentationMarkdown: MiddlewareHandler<SapportaEnv> = async (
    c,
    next,
  ) => {
    const variantPath = markdownVariantPath(c.req.path);
    if (
      variantPath &&
      explicitlyPrefersMarkdown(c.req.header("Accept")) &&
      existsSync(join(docsDistDir, variantPath.replace(/^\//, "")))
    ) {
      const response = await negotiatedMarkdown(c, next);
      if (response) {
        response.headers.set("Cache-Control", "no-cache");
        response.headers.set("Content-Type", markdownContentType);
      }
      return response;
    }
    await next();
  };

  app.use("/docs/*", negotiateDocumentationMarkdown);
  app.use("/grid/*", negotiateDocumentationMarkdown);

  // Astro marketing and documentation build.
  serveStaticUse(app, "/_astro/*", docsDist, { cache: immutableCache });
  serveStaticUse(app, "/assets/*", docsDist);
  serveStaticUse(app, "/pagefind/*", docsDist);
  serveStaticGet(app, "/favicon.svg", docsDist);
  serveStaticGet(app, "/LICENSE.txt", docsDist);
  serveStaticGet(app, "/robots.txt", docsDist, {
    contentType: plainTextContentType,
  });
  serveStaticGet(app, "/sitemap.xml", docsDist, {
    contentType: xmlContentType,
  });
  serveStaticGet(app, "/sitemap-index.xml", docsDist, {
    contentType: xmlContentType,
  });
  serveStaticGet(app, "/sitemap-0.xml", docsDist, {
    contentType: xmlContentType,
  });
  serveStaticGet(app, "/llms.txt", docsDist);
  serveStaticGet(app, "/.well-known/llms.txt", docsDist);
  for (const route of astroPageRoutes) {
    serveStaticGet(app, route.path, docsDist, {
      file: route.file,
      cache: noCache,
    });
  }
  serveStaticGet(app, "/docs.md", docsDist, { cache: noCache });
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

  // A missing file under an Astro-owned path is a real 404. Claim these paths
  // before the React fallback so a typo in a documentation or asset URL cannot
  // return the unrelated application shell with a misleading 200 response.
  for (const pattern of [
    ...astroPageRoutes.map((route) => route.path),
    "/favicon.svg",
    "/LICENSE.txt",
    "/robots.txt",
    "/sitemap.xml",
    "/sitemap-index.xml",
    "/sitemap-0.xml",
    "/llms.txt",
    "/.well-known/llms.txt",
    "/docs",
    "/docs.md",
    "/docs/*",
    "/grid",
    "/grid/*",
    "/_astro/*",
    "/assets/*",
    "/pagefind/*",
  ]) {
    app.get(pattern, (c) => c.notFound());
  }

  // Vite React application build. API routes and Astro-owned paths have
  // already matched; all remaining GETs fall back to the SPA entrypoint for
  // React Router.
  serveStaticUse(app, "/app-assets/*", frontendDist, {
    cache: immutableCache,
  });
  app.get("/app-assets/*", (c) => c.notFound());
  serveStaticUse(app, "/*", frontendDist, { cache: noCache });
  serveStaticGet(app, "/*", frontendDist, { file: "index.html" });
}

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
  options: {
    file?: string;
    cache?: MiddlewareHandler<SapportaEnv>;
    contentType?: string;
  } = {},
) {
  if (options.cache) app.get(path, options.cache);
  if (options.contentType) {
    app.get(path, responseContentType(options.contentType));
  }
  app.get(path, serveStatic({ root, path: options.file }));
}

function responseContentType(value: string): MiddlewareHandler<SapportaEnv> {
  return async (c, next) => {
    await next();
    if (c.res.status >= 200 && c.res.status < 400) {
      c.res.headers.set("Content-Type", value);
    }
  };
}
