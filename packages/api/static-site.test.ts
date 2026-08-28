import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Hono } from "hono";
import type { SapportaEnv } from "@sapporta/server";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { mountStaticSite } from "./static-site.js";

describe("crawler-facing static routes", () => {
  let app: Hono<SapportaEnv>;
  let testRoot: string;

  beforeAll(async () => {
    testRoot = await mkdtemp(join(tmpdir(), "sapporta-static-site-"));
    const docsDistDir = join(testRoot, "docs");
    const frontendDistDir = join(testRoot, "frontend");
    await mkdir(docsDistDir);
    await mkdir(frontendDistDir);
    await mkdir(join(docsDistDir, "docs"));
    await mkdir(join(docsDistDir, "api-reference", "server"), {
      recursive: true,
    });
    await Promise.all([
      writeFile(join(docsDistDir, "index.html"), "<h1>Homepage</h1>"),
      writeFile(join(docsDistDir, "docs.md"), "# Documentation\n"),
      writeFile(
        join(docsDistDir, "docs", "index.html"),
        "<h1>Documentation</h1>",
      ),
      writeFile(
        join(docsDistDir, "robots.txt"),
        "User-agent: OAI-SearchBot\nAllow: /\n",
      ),
      writeFile(
        join(docsDistDir, "sitemap-index.xml"),
        '<?xml version="1.0"?><sitemapindex><loc>/sitemap-0.xml</loc></sitemapindex>',
      ),
      writeFile(
        join(docsDistDir, "sitemap-0.xml"),
        '<?xml version="1.0"?><urlset><url><loc>/</loc></url></urlset>',
      ),
      writeFile(join(docsDistDir, "og.png"), "not-really-a-png"),
      writeFile(join(frontendDistDir, "index.html"), "<h1>SPA fallback</h1>"),
      writeFile(
        join(docsDistDir, "api-reference", "index.md"),
        "# Sapporta API reference\n",
      ),
      writeFile(
        join(docsDistDir, "api-reference", "symbols.md"),
        "# Every symbol\n",
      ),
      writeFile(
        join(docsDistDir, "api-reference", "server", "index.md"),
        "# @sapporta/server\n",
      ),
      writeFile(
        join(docsDistDir, "api-reference", "llms.txt"),
        "# Sapporta API reference\n",
      ),
    ]);

    app = new Hono<SapportaEnv>();
    mountStaticSite(app, { docsDistDir, frontendDistDir });
  });

  afterAll(async () => {
    await rm(testRoot, { recursive: true, force: true });
  });

  it("serves robots.txt as plain text before the SPA fallback", async () => {
    const response = await app.request("/robots.txt");

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(
      "text/plain; charset=utf-8",
    );
    expect(await response.text()).toContain("User-agent: OAI-SearchBot");
  });

  it("serves the generated sitemap index as XML before the SPA fallback", async () => {
    // robots.txt advertises /sitemap-index.xml; /sitemap.xml is the path a
    // crawler probes on its own. Both read the one generated index.
    for (const path of ["/sitemap-index.xml", "/sitemap.xml"]) {
      const response = await app.request(path);

      expect(response.status, path).toBe(200);
      expect(response.headers.get("Content-Type"), path).toBe(
        "application/xml; charset=utf-8",
      );
      expect(await response.text(), path).toContain("<sitemapindex>");
    }
  });

  it("serves the sitemap URL set as XML before the SPA fallback", async () => {
    const response = await app.request("/sitemap-0.xml");

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(
      "application/xml; charset=utf-8",
    );
    expect(await response.text()).toContain("<urlset>");
  });

  it("serves og.png as an image before the SPA fallback", async () => {
    // The homepage names this file in og:image. Reaching the SPA fallback
    // hands a crawler the React shell with a 200, and the social preview
    // degrades to no image with nothing in the build reporting a failure.
    const response = await app.request("/og.png");

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("image/png");
    expect(await response.text()).not.toContain("SPA fallback");
  });

  it("serves the documentation index as Markdown before the SPA fallback", async () => {
    const response = await app.request("/docs.md");

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(
      "text/markdown; charset=utf-8",
    );
    expect(await response.text()).toContain("# Documentation");
  });

  it("advertises the Markdown form of the documentation index", async () => {
    const response = await app.request("/docs");

    expect(response.status).toBe(200);
    expect(response.headers.get("Link")).toContain(
      '</docs.md>; rel="alternate"; type="text/markdown"',
    );
    // One middleware pattern claims /docs, so Accept is appended to Vary once.
    expect(response.headers.get("Vary")).toBe("Accept");
    expect(await response.text()).toContain("<h1>Documentation</h1>");
  });

  it("serves the documentation index as Markdown when Accept asks for it", async () => {
    const response = await app.request("/docs", {
      headers: { Accept: "text/markdown" },
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(
      "text/markdown; charset=utf-8",
    );
    expect(await response.text()).toContain("# Documentation");
  });

  it("serves an API reference page as Markdown before the SPA fallback", async () => {
    const response = await app.request("/api-reference/symbols.md");

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(
      "text/markdown; charset=utf-8",
    );
    expect(await response.text()).toContain("# Every symbol");
  });

  it("serves a nested API reference page as Markdown", async () => {
    const response = await app.request("/api-reference/server/index.md");

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(
      "text/markdown; charset=utf-8",
    );
    expect(await response.text()).toContain("# @sapporta/server");
  });

  it("reads the API reference index from every form of its path", async () => {
    for (const path of [
      "/api-reference",
      "/api-reference/",
      "/api-reference.md",
      "/api-reference/index.md",
    ]) {
      const response = await app.request(path);

      expect(response.status, path).toBe(200);
      expect(response.headers.get("Content-Type"), path).toBe(
        "text/markdown; charset=utf-8",
      );
      expect(await response.text(), path).toContain("# Sapporta API reference");
    }
  });

  it("serves the API reference llms.txt index as plain text", async () => {
    const response = await app.request("/api-reference/llms.txt");

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(
      "text/plain; charset=utf-8",
    );
  });

  it("404s a missing API reference page instead of the SPA shell", async () => {
    const response = await app.request("/api-reference/no-such-package.md");

    expect(response.status).toBe(404);
    expect(await response.text()).not.toContain("SPA fallback");
  });

  it("404s a docs-root file missing from the build instead of the SPA shell", async () => {
    // LICENSE.txt is mounted but absent from this fixture, standing in for any
    // root file the Astro build stops emitting.
    const response = await app.request("/LICENSE.txt");

    expect(response.status).toBe(404);
    expect(await response.text()).not.toContain("SPA fallback");
  });

  it("advertises the Markdown index from the homepage", async () => {
    const response = await app.request("/");

    expect(response.status).toBe(200);
    expect(response.headers.get("Link")).toBe(
      '</llms.txt>; rel="alternate"; type="text/markdown"',
    );
    expect(await response.text()).toContain("<h1>Homepage</h1>");
  });
});
