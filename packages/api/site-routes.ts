/**
 * The route table that decides which build surface owns a URL.
 *
 * Production answers these paths from `packages/docs/dist` (`mountStaticSite`);
 * development proxies the same paths to `astro dev` (`mountDevSite`). Both
 * modes import this one table and register it on the same Hono router, so a URL
 * cannot belong to Astro in one mode and to the React application in the other,
 * and adding a documentation surface needs a single edit here.
 *
 * Anything not listed belongs to the React application: its assets in
 * production, its Vite dev server in development.
 */

export interface AstroPageRoute {
  /** URL this server answers. */
  path: string;
  /** File `astro build` emits for it, relative to `packages/docs/dist`. */
  file: string;
}

export interface DocsRootFile {
  /** URL this server answers. */
  path: string;
  /** Emitted file, when it is not the last segment of `path`. */
  file?: string;
  /** Media type to state, for extensions Hono's static handler cannot map. */
  contentType?: string;
}

export const markdownContentType = "text/markdown; charset=utf-8";
export const plainTextContentType = "text/plain; charset=utf-8";
export const xmlContentType = "application/xml; charset=utf-8";

// Astro renders files in packages/docs/src/pages at build time, not while this
// server is handling a request. Keep the small set of top-level marketing pages
// explicit here: each URL points at the HTML file emitted by `astro build`.
// Documentation routes such as /docs/* and /grid/* are whole groups below.
export const astroPageRoutes: ReadonlyArray<AstroPageRoute> = [
  { path: "/", file: "index.html" },
  { path: "/index.html", file: "index.html" },
];

// Every file the Astro build emits at the site root: whatever
// packages/docs/public carries through verbatim, plus the generated sitemap and
// llms.txt indexes. One list feeds both the static mount and the 404 guard,
// because a file that reaches only the guard 404s and a file that reaches
// neither is answered with the React shell and a 200 -- which is how a social
// preview image can break with nothing in the build failing.
export const docsRootFiles: ReadonlyArray<DocsRootFile> = [
  { path: "/favicon.svg" },
  { path: "/LICENSE.txt" },
  { path: "/og.png" },
  { path: "/robots.txt", contentType: plainTextContentType },
  // robots.txt advertises /sitemap-index.xml, the name @astrojs/sitemap emits.
  // /sitemap.xml is the conventional path a crawler probes without being told,
  // so it reads the same generated index rather than a hand-maintained copy.
  {
    path: "/sitemap.xml",
    file: "sitemap-index.xml",
    contentType: xmlContentType,
  },
  { path: "/sitemap-index.xml", contentType: xmlContentType },
  { path: "/sitemap-0.xml", contentType: xmlContentType },
  { path: "/llms.txt" },
  { path: "/.well-known/llms.txt" },
];

// `/api-reference`, with or without a trailing slash, and `/api-reference.md`
// all read the reference index rather than a page of their own, the way `/docs`
// and `/docs.md` both read the documentation index.
export const apiReferenceIndexPaths: ReadonlyArray<string> = [
  "/api-reference",
  "/api-reference/",
  "/api-reference.md",
];

/** The page those three paths read, relative to `packages/docs/dist`. */
export const apiReferenceIndexFile = "api-reference/index.md";

// Documentation and asset trees, as URL patterns rather than single files. A
// trailing wildcard also matches the bare path, so "/docs/*" covers "/docs"
// itself; the bare paths are named anyway because the static host answers them
// from an index file whose name the URL does not carry.
export const astroGroupPatterns: ReadonlyArray<string> = [
  "/docs",
  "/docs.md",
  "/docs/*",
  "/grid",
  "/grid/",
  "/grid/*",
  ...apiReferenceIndexPaths,
  "/api-reference/*",
  "/_astro/*",
  "/assets/*",
  "/pagefind/*",
];

/** Every URL pattern the Astro build owns, in one list. */
export const astroOwnedPatterns: ReadonlyArray<string> = [
  ...astroPageRoutes.map((route) => route.path),
  ...docsRootFiles.map((rootFile) => rootFile.path),
  ...astroGroupPatterns,
];
