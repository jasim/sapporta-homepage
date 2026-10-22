import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { buildDocsIndex as buildIndex, docsIndexFile, runDocsIndexCli } from "nuaj-agent-docs/docs-index";
import docsSidebar from "../packages/docs/sidebar.mjs";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const contentRoot = path.join(repositoryRoot, "packages/docs/src/content/docs");

/** The documentation landing page: `/docs/` in HTML, `/docs.md` for agents. */
export const INDEX_SLUG = "docs";
export const OUTPUT_FILE = docsIndexFile({ contentRoot, indexSlug: INDEX_SLUG });

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

const options = {
  sidebar: docsSidebar,
  contentRoot,
  indexSlug: INDEX_SLUG,
  frontmatter: FRONTMATTER,
  introduction: INTRODUCTION,
};

/** Build the page without touching disk. */
export function buildDocsIndex(sidebar = docsSidebar) {
  return buildIndex({ ...options, sidebar });
}

async function main(argv = process.argv.slice(2)) {
  await runDocsIndexCli(options, { argv, regenerateCommand: "pnpm generate:docs-index" });
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
