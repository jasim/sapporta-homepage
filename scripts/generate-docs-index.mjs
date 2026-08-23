import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import docsSidebar from "../packages/docs/sidebar.mjs";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const contentRoot = path.join(repositoryRoot, "packages/docs/src/content/docs");

/** The documentation landing page: `/docs/` in HTML, `/docs.md` for agents. */
export const INDEX_SLUG = "docs";
export const OUTPUT_FILE = path.join(contentRoot, `${INDEX_SLUG}.md`);

const FRONTMATTER = `---
title: "Documentation"
description:
  "Index of every Sapporta documentation page: getting started, the guides, the
  reference, and the standalone Sapporta Grid."
---`;

const INTRODUCTION = `Sapporta turns table definitions into a running database application: generated
CRUD endpoints, record screens, row-scoped access, reports, and a CLI to operate
the result. This page indexes every documentation page there is.

Coding agents can fetch the Markdown form of any page below by appending \`.md\`
to its path — \`/docs/reference.md\` for the reference index, and so on. The
[Sapporta API reference](/api-reference/llms.txt) names every exported symbol
and the specifier that publishes it; [llms.txt](/llms.txt) is the retrieval
index for the whole site.`;

/** Build the page without touching disk. */
export async function buildDocsIndex(sidebar = docsSidebar) {
  const titles = await readSidebarTitles(sidebar);
  const sections = sidebar.flatMap((group) => renderGroup(group, titles, 2));
  return [FRONTMATTER, "", INTRODUCTION, ...sections, ""].join("\n");
}

/**
 * A sidebar node becomes a heading down to `###`, and a bold list item below
 * that, so the deepest groups stay attached to the list they belong to.
 */
function renderGroup(group, titles, level) {
  const entries = (group.items ?? []).flatMap((item) => renderItem(item, titles, level + 1));
  if (entries.length === 0) return [];
  if (!group.label) return entries;

  if (level > 3) {
    return [`- **${group.label}**`, ...entries.map(indent)];
  }
  return ["", `${"#".repeat(level)} ${group.label}`, "", ...entries];
}

function renderItem(item, titles, level) {
  if (item.items) return renderGroup(item, titles, level);
  if (item.slug === INDEX_SLUG) return [];

  const href = item.slug ? `/${item.slug}/` : item.link;
  const label = item.label ?? titles.get(item.slug);
  if (!href || !label) {
    throw new Error(`Sidebar entry has no link or no title: ${JSON.stringify(item)}`);
  }
  return [`- [${label}](${href})`];
}

function indent(line) {
  return line === "" ? line : `  ${line}`;
}

async function readSidebarTitles(sidebar) {
  const titles = new Map();
  for (const slug of collectSidebarSlugs(sidebar)) {
    if (slug === INDEX_SLUG) continue;
    titles.set(slug, await readTitle(slug));
  }
  return titles;
}

function collectSidebarSlugs(items) {
  return items.flatMap((item) => [
    ...(item.slug ? [item.slug] : []),
    ...(item.items ? collectSidebarSlugs(item.items) : []),
  ]);
}

async function readTitle(slug) {
  const candidates = [`${slug}.md`, `${slug}/index.md`, `${slug}.mdx`, `${slug}/index.mdx`];
  for (const candidate of candidates) {
    const source = await readFileOrUndefined(path.join(contentRoot, candidate));
    if (source === undefined) continue;

    const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const title = frontmatter?.[1].match(/^title:[ \t]*(.+)$/m)?.[1].trim();
    if (!title) throw new Error(`Documentation page has no frontmatter title: ${candidate}`);
    return title.replace(/^"(.*)"$/s, "$1").replace(/\\"/g, '"');
  }
  throw new Error(`Sidebar page has no Markdown source: ${slug}`);
}

async function readFileOrUndefined(file) {
  try {
    return await readFile(file, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") return undefined;
    throw error;
  }
}

async function main(argv = process.argv.slice(2)) {
  const content = await buildDocsIndex();
  const relativeOutput = path.relative(process.cwd(), OUTPUT_FILE);

  if (argv.includes("--check")) {
    const existing = await readFileOrUndefined(OUTPUT_FILE);
    if (existing === content) {
      console.log(`Documentation index is current: ${relativeOutput}`);
      return;
    }
    console.error(
      `${relativeOutput} is ${existing === undefined ? "missing" : "out of date"}.\n` +
        "Run `pnpm generate:docs-index` and commit the result.",
    );
    process.exitCode = 1;
    return;
  }

  await writeFile(OUTPUT_FILE, content, "utf8");
  console.log(`Generated ${relativeOutput} from the documentation sidebar.`);
}

const isDirectExecution =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectExecution) {
  try {
    await main();
  } catch (error) {
    console.error(`Failed to generate the documentation index: ${error.message}`);
    process.exitCode = 1;
  }
}

export { main };
