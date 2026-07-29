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
    await Promise.all([
      writeFile(join(docsDistDir, "index.html"), "<h1>Homepage</h1>"),
      writeFile(
        join(docsDistDir, "robots.txt"),
        "User-agent: OAI-SearchBot\nAllow: /\n",
      ),
      writeFile(
        join(docsDistDir, "sitemap.xml"),
        '<?xml version="1.0"?><sitemapindex></sitemapindex>',
      ),
      writeFile(join(frontendDistDir, "index.html"), "<h1>SPA fallback</h1>"),
    ]);

    app = new Hono<SapportaEnv>();
    mountStaticSite(app, {
      docsDistDir,
      frontendDistDir,
      astroPageRoutes: [
        { path: "/", file: "index.html" },
        { path: "/index.html", file: "index.html" },
      ],
    });
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

  it("serves sitemap.xml as XML before the SPA fallback", async () => {
    const response = await app.request("/sitemap.xml");

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(
      "application/xml; charset=utf-8",
    );
    expect(await response.text()).toContain("<sitemapindex>");
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
