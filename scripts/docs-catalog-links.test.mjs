import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

import docsSidebar from "../packages/docs/sidebar.mjs";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const docsPackageRoot = path.join(repositoryRoot, "packages/docs");
const contentRoot = path.join(docsPackageRoot, "src/content/docs");
const publicRoot = path.join(docsPackageRoot, "public");
const docsRequire = createRequire(
  pathToFileURL(path.join(docsPackageRoot, "package.json")),
);
const canonicalOrigin = "https://sapporta.com";
const explicitRoutes = new Set([
  "/",
  "/grid",
  "/grid/",
  "/llms.txt",
  "/.well-known/llms.txt",
  "/api-reference/llms.txt",
  "/docs/llms.txt",
  "/docs/llms-full.txt",
  "/grid/llms.txt",
  "/grid/llms-full.txt",
  "/sitemap-index.xml",
  "/sitemap-0.xml",
]);
const allowedHttpHosts = new Set([
  "127.0.0.1",
  "::1",
  "example.com",
  "localhost",
  "www.example.com",
]);

test("documentation sidebar and sources stay bijective", async () => {
  const sourceFiles = await documentationSourceFiles();
  const sourceSlugs = sourceFiles.map(slugForSourceFile);
  const sidebarSlugs = collectSidebarSlugs(docsSidebar);
  const sourceSet = new Set(sourceSlugs);
  const sidebarSet = new Set(sidebarSlugs);

  assert.equal(
    sidebarSet.size,
    sidebarSlugs.length,
    "documentation sidebar contains duplicate slugs",
  );
  assert.equal(
    sourceSet.size,
    sourceSlugs.length,
    "documentation sources contain duplicate normalized slugs",
  );
  assert.deepEqual(
    [...sidebarSet].filter((slug) => !sourceSet.has(slug)).sort(),
    [],
    "sidebar pages without Markdown sources",
  );
  assert.deepEqual(
    [...sourceSet].filter((slug) => !sidebarSet.has(slug)).sort(),
    [],
    "Markdown sources missing from the sidebar",
  );

  const docsCount = sourceSlugs.filter(
    (slug) => slug === "docs" || slug.startsWith("docs/"),
  ).length;
  const gridCount = sourceSlugs.filter((slug) =>
    slug.startsWith("grid/"),
  ).length;

  assert.equal(sidebarSlugs.length, 150);
  assert.equal(sidebarSet.size, 150);
  assert.equal(sourceSlugs.length, 150);
  assert.equal(sourceSet.size, 150);
  assert.equal(docsCount, 117);
  assert.equal(gridCount, 33);
});

test("root agent retrieval keeps the approved direct entry pages", () => {
  assert.deepEqual(rootStartingSlugs(docsSidebar), [
    "docs",
    "docs/getting-started/introduction",
    "docs/getting-started/create-a-project",
    "docs/getting-started/tour-the-generated-project",
    "docs/guides/discovery/develop-with-a-coding-agent",
    "docs/guides",
    "docs/guides/discovery/choose-an-application-interface",
    "docs/reference",
    "grid/start/install-and-render-the-first-grid",
  ]);
});

test("documentation links, fragments, generated Markdown targets, and public assets resolve", async () => {
  const { createMarkdownProcessor, parseFrontmatter } =
    await loadMarkdownTools();
  let collectedLinks = [];
  const collectLinks = () => (tree) => {
    collectedLinks = [];
    walk(tree, (node) => {
      if (
        (node.type === "link" ||
          node.type === "image" ||
          node.type === "definition") &&
        typeof node.url === "string"
      ) {
        collectedLinks.push({
          line: node.position?.start?.line,
          rawUrl: node.url,
        });
      }
    });
  };
  const renderer = await createMarkdownProcessor({
    syntaxHighlight: false,
    remarkPlugins: [collectLinks],
  });
  const sourceFiles = await documentationSourceFiles();
  const records = [];
  const headingsBySlug = new Map();

  for (const sourceFile of sourceFiles) {
    const markdown = await readFile(sourceFile, "utf8");
    const { content, frontmatter } = parseFrontmatter(markdown, {
      frontmatter: "empty-with-lines",
    });
    const result = await renderer.render(content, {
      fileURL: pathToFileURL(sourceFile),
      frontmatter,
    });
    const sourceSlug = slugForSourceFile(sourceFile);
    headingsBySlug.set(
      sourceSlug,
      new Set(result.metadata.headings.map((heading) => heading.slug)),
    );
    for (const link of collectedLinks) {
      records.push({
        ...link,
        sourceFile,
        sourceSlug,
      });
    }
  }

  const catalog = new Set(collectSidebarSlugs(docsSidebar));
  const errors = [];
  for (const record of records) {
    await validateDocumentationUrl(record, {
      catalog,
      errors,
      headingsBySlug,
    });
  }
  assert.deepEqual(
    errors,
    [],
    `invalid documentation links:\n${errors.join("\n")}`,
  );
});

async function loadMarkdownTools() {
  const modulePath = docsRequire.resolve("@astrojs/markdown-remark");
  return import(pathToFileURL(modulePath).href);
}

async function documentationSourceFiles() {
  return (await filesBelow(contentRoot))
    .filter((file) => file.endsWith(".md") || file.endsWith(".mdx"))
    .sort();
}

async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await filesBelow(entryPath)));
    if (entry.isFile()) files.push(entryPath);
  }
  return files;
}

function slugForSourceFile(sourceFile) {
  const relativeFile = path.relative(contentRoot, sourceFile);
  const withoutExtension = relativeFile.replace(/\.mdx?$/, "");
  const normalized = withoutExtension.endsWith(`${path.sep}index`)
    ? withoutExtension.slice(0, -`${path.sep}index`.length)
    : withoutExtension;
  return normalized.split(path.sep).join("/");
}

function collectSidebarSlugs(items) {
  const slugs = [];
  for (const item of items) {
    if (item.slug) slugs.push(item.slug);
    if (item.items) slugs.push(...collectSidebarSlugs(item.items));
  }
  return slugs;
}

function rootStartingSlugs(groups) {
  return groups.flatMap((group) => {
    const directSlugs = (group.items ?? []).flatMap((item) =>
      item.slug ? [item.slug] : [],
    );
    if (directSlugs.length > 0) return directSlugs;
    const firstDescendant = collectSidebarSlugs([group])[0];
    return firstDescendant ? [firstDescendant] : [];
  });
}

function walk(node, visitor) {
  visitor(node);
  for (const child of node.children ?? []) walk(child, visitor);
}

async function validateDocumentationUrl(
  record,
  { catalog, errors, headingsBySlug },
) {
  const { line, rawUrl, sourceFile, sourceSlug } = record;
  const location = `${path.relative(repositoryRoot, sourceFile)}:${line ?? "?"}`;
  let parsed;
  try {
    parsed = new URL(rawUrl, `${canonicalOrigin}/${sourceSlug}/`);
  } catch {
    errors.push(`${location} ${rawUrl} -> invalid URL syntax`);
    return;
  }

  if (parsed.protocol === "http:") {
    if (!allowedHttpHosts.has(parsed.hostname)) {
      errors.push(`${location} ${rawUrl} -> external links must use HTTPS`);
    }
    return;
  }
  if (
    parsed.protocol === "mailto:" ||
    parsed.protocol === "tel:" ||
    (parsed.protocol === "https:" && parsed.origin !== canonicalOrigin)
  ) {
    return;
  }
  if (parsed.protocol !== "https:") {
    errors.push(`${location} ${rawUrl} -> unsupported URL scheme`);
    return;
  }
  if (parsed.origin !== canonicalOrigin) return;

  const pathname = decodeURIComponent(parsed.pathname);
  if (explicitRoutes.has(pathname)) return;

  const publicPath = path.join(publicRoot, pathname.replace(/^\/+/, ""));
  if (await isFile(publicPath)) return;

  const targetSlug = pathname.replace(/^\/+|\/+$/g, "").replace(/\.md$/, "");
  if (!catalog.has(targetSlug)) {
    errors.push(
      `${location} ${rawUrl} -> ${targetSlug || "/"} is not a catalog page, explicit route, or public asset`,
    );
    return;
  }

  if (parsed.hash) {
    const fragment = decodeURIComponent(parsed.hash.slice(1));
    if (!headingsBySlug.get(targetSlug)?.has(fragment)) {
      errors.push(
        `${location} ${rawUrl} -> missing heading #${fragment} in ${targetSlug}`,
      );
    }
  }
}

async function isFile(file) {
  try {
    return (await stat(file)).isFile();
  } catch {
    return false;
  }
}
