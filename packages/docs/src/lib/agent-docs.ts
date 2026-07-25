import { getCollection, type CollectionEntry } from "astro:content";
import { fromMarkdown } from "mdast-util-from-markdown";
import { visit } from "unist-util-visit";
import docsSidebar from "../../sidebar.mjs";
import { gettingStartedEnv, replaceGettingStartedEnvTokens } from "./getting-started-env.mjs";

const CANONICAL_SITE_ORIGIN = gettingStartedEnv.docsCanonicalOrigin;
const RETRIEVAL_SITE_ORIGIN = gettingStartedEnv.docsOrigin;
const ROOT_INDEX_URL = `${RETRIEVAL_SITE_ORIGIN}/llms.txt`;

type DocsEntry = CollectionEntry<"docs">;
type DocScope = "docs" | "grid";

type SidebarItem = {
  label?: string;
  slug?: string;
  link?: string;
  items?: readonly SidebarItem[];
};

export type AgentDoc = {
  slug: string;
  title: string;
  description: string;
  body: string;
};

type AgentDocCatalog = {
  docs: readonly AgentDoc[];
  bySlug: ReadonlyMap<string, AgentDoc>;
  slugs: ReadonlySet<string>;
};

type PositionedLink = {
  type: "link" | "definition";
  url: string;
  position?: {
    start: { offset?: number };
    end: { offset?: number };
  };
};

type Replacement = {
  start: number;
  end: number;
  value: string;
};

let catalogPromise: Promise<AgentDocCatalog> | undefined;

export function getAgentDocCatalog() {
  catalogPromise ??= buildAgentDocCatalog();
  return catalogPromise;
}

export function markdownPathForSlug(slug: string) {
  return `/${slug}.md`;
}

export function markdownUrlForSlug(slug: string) {
  return `${RETRIEVAL_SITE_ORIGIN}${markdownPathForSlug(slug)}`;
}

export function canonicalUrlForSlug(slug: string) {
  return `${CANONICAL_SITE_ORIGIN}/${slug}/`;
}

export function renderAgentMarkdown(doc: AgentDoc, slugs: ReadonlySet<string>) {
  const frontmatter = [
    "---",
    `title: ${JSON.stringify(doc.title)}`,
    `description: ${JSON.stringify(doc.description)}`,
    `canonical: ${JSON.stringify(canonicalUrlForSlug(doc.slug))}`,
    "---",
  ].join("\n");
  const body = rewriteDocumentationLinks(doc.body, slugs).trim();

  return `${frontmatter}\n\n> Documentation index: ${ROOT_INDEX_URL}\n\n${body}\n`;
}

export async function renderScopedIndex(scope: DocScope) {
  const catalog = await getAgentDocCatalog();
  const sections = sidebarSections(scope, catalog.bySlug);
  const isDocs = scope === "docs";
  const title = isDocs ? "Sapporta application framework documentation" : "Sapporta Grid documentation";
  const summary = isDocs
    ? "Documentation for building database applications with Sapporta."
    : "Documentation for the standalone @sapporta/grid React data grid.";
  const fullUrl = `${RETRIEVAL_SITE_ORIGIN}/${scope}/llms-full.txt`;

  const lines = [
    `# ${title}`,
    "",
    `> ${summary}`,
    "",
    "Use the linked Markdown pages for retrieval. HTML versions are the canonical human-readable pages.",
  ];

  for (const section of sections) {
    lines.push("", `## ${section.label}`, "");
    for (const doc of section.docs) {
      lines.push(`- [${doc.title}](${markdownUrlForSlug(doc.slug)}): ${singleLine(doc.description)}`);
    }
  }

  lines.push(
    "",
    "## Optional",
    "",
    `- [Complete ${isDocs ? "framework" : "Grid"} documentation bundle](${fullUrl}): Concatenated Markdown for offline indexing and large-context retrieval.`,
    "",
  );

  return lines.join("\n");
}

export async function renderRootIndex() {
  const catalog = await getAgentDocCatalog();
  const startingDocs = rootStartingDocs(catalog.bySlug);

  const lines = [
    "# Sapporta documentation",
    "",
    "> Documentation for Sapporta and the standalone Sapporta Grid.",
    "",
    "Use the scoped indexes to retrieve focused Markdown pages. HTML remains the canonical human-readable representation.",
    "",
    "## Documentation sets",
    "",
    `- [Sapporta application framework](${RETRIEVAL_SITE_ORIGIN}/docs/llms.txt): Guides and reference for building and operating Sapporta applications.`,
    `- [Sapporta Grid](${RETRIEVAL_SITE_ORIGIN}/grid/llms.txt): Guides and reference for the standalone React data grid.`,
    "",
    "## Start here",
    "",
  ];

  for (const doc of startingDocs) {
    lines.push(`- [${doc.title}](${markdownUrlForSlug(doc.slug)}): ${singleLine(doc.description)}`);
  }

  lines.push(
    "",
    "## Optional",
    "",
    `- [Complete framework documentation](${RETRIEVAL_SITE_ORIGIN}/docs/llms-full.txt): Concatenated framework Markdown for offline indexing and large-context retrieval.`,
    `- [Complete Grid documentation](${RETRIEVAL_SITE_ORIGIN}/grid/llms-full.txt): Concatenated Grid Markdown for offline indexing and large-context retrieval.`,
    "",
  );

  return lines.join("\n");
}

export async function renderFullBundle(scope: DocScope) {
  const catalog = await getAgentDocCatalog();
  const docs = catalog.docs.filter((doc) => doc.slug.startsWith(`${scope}/`));
  const title = scope === "docs" ? "Sapporta application framework documentation" : "Sapporta Grid documentation";
  const chunks = [
    `# ${title} — complete Markdown bundle`,
    "",
    `> Page index: ${RETRIEVAL_SITE_ORIGIN}/${scope}/llms.txt`,
  ];

  for (const doc of docs) {
    chunks.push(
      "",
      "---",
      "",
      `# ${doc.title}`,
      "",
      `Canonical: ${canonicalUrlForSlug(doc.slug)}`,
      "",
      rewriteDocumentationLinks(doc.body, catalog.slugs).trim(),
    );
  }

  chunks.push("");
  return chunks.join("\n");
}

export function textResponse(body: string, contentType: string) {
  return new Response(body, {
    headers: {
      "Content-Type": contentType,
    },
  });
}

async function buildAgentDocCatalog(): Promise<AgentDocCatalog> {
  const entries = await getCollection("docs");
  const sidebarSlugs = collectSidebarSlugs(docsSidebar as readonly SidebarItem[]);
  const sidebarSlugSet = new Set(sidebarSlugs);
  const entryIds = new Set(entries.map((entry) => entry.id));
  const errors: string[] = [];

  for (const slug of sidebarSlugs) {
    if (!entryIds.has(slug)) errors.push(`Sidebar page has no source entry: ${slug}`);
  }
  for (const entry of entries) {
    if (!sidebarSlugSet.has(entry.id)) {
      errors.push(`Documentation source is missing from the sidebar: ${entry.id}`);
    }
  }
  if (sidebarSlugSet.size !== sidebarSlugs.length) {
    errors.push("The documentation sidebar contains duplicate slugs.");
  }

  const byEntryId = new Map(entries.map((entry) => [entry.id, entry]));
  const docs = sidebarSlugs.flatMap((slug) => {
    const entry = byEntryId.get(slug);
    if (!entry) return [];
    const doc = agentDocFromEntry(entry, errors);
    return doc ? [doc] : [];
  });

  if (errors.length > 0) {
    throw new Error(`Agent documentation validation failed:\n- ${errors.join("\n- ")}`);
  }

  return {
    docs,
    bySlug: new Map(docs.map((doc) => [doc.slug, doc])),
    slugs: new Set(docs.map((doc) => doc.slug)),
  };
}

function agentDocFromEntry(entry: DocsEntry, errors: string[]) {
  const title = entry.data.title?.trim();
  const description = entry.data.description?.trim();
  const body =
    typeof entry.body === "string" ? replaceGettingStartedEnvTokens(entry.body, gettingStartedEnv) : entry.body;

  if (!title) errors.push(`Documentation page has no title: ${entry.id}`);
  if (!description) errors.push(`Documentation page has no description: ${entry.id}`);
  if (typeof body !== "string") {
    errors.push(`Documentation page has no retained Markdown body: ${entry.id}`);
  }
  if (!title || !description || typeof body !== "string") return undefined;

  return { slug: entry.id, title, description, body } satisfies AgentDoc;
}

function collectSidebarSlugs(items: readonly SidebarItem[]) {
  const slugs: string[] = [];
  for (const item of items) {
    if (item.slug) slugs.push(item.slug);
    if (item.items) slugs.push(...collectSidebarSlugs(item.items));
  }
  return slugs;
}

function rootStartingDocs(bySlug: ReadonlyMap<string, AgentDoc>) {
  const startingSlugs = (docsSidebar as readonly SidebarItem[]).flatMap((group) => {
    const directSlugs = (group.items ?? []).flatMap((item) => (item.slug ? [item.slug] : []));
    if (directSlugs.length > 0) return directSlugs;

    const firstDescendant = firstSidebarSlug(group);
    return firstDescendant ? [firstDescendant] : [];
  });

  return startingSlugs.map((slug) => {
    const doc = bySlug.get(slug);
    if (!doc) throw new Error(`Missing root llms.txt starting page: ${slug}`);
    return doc;
  });
}

function firstSidebarSlug(item: SidebarItem): string | undefined {
  if (item.slug) return item.slug;
  for (const child of item.items ?? []) {
    const slug = firstSidebarSlug(child);
    if (slug) return slug;
  }
  return undefined;
}

function sidebarSections(scope: DocScope, bySlug: ReadonlyMap<string, AgentDoc>) {
  const sections: Array<{ label: string; docs: AgentDoc[] }> = [];

  const walk = (items: readonly SidebarItem[], labels: readonly string[]) => {
    const docs = items.flatMap((item) => {
      if (!item.slug || !item.slug.startsWith(`${scope}/`)) return [];
      const doc = bySlug.get(item.slug);
      if (!doc) throw new Error(`Missing sidebar documentation entry: ${item.slug}`);
      return [doc];
    });
    if (docs.length > 0 && labels.length > 0) {
      sections.push({ label: labels.join(" — "), docs });
    }
    for (const item of items) {
      if (item.items && item.label) walk(item.items, [...labels, item.label]);
    }
  };

  walk(docsSidebar as readonly SidebarItem[], []);
  return sections;
}

function rewriteDocumentationLinks(markdown: string, validSlugs: ReadonlySet<string>) {
  const tree = fromMarkdown(markdown);
  const replacements: Replacement[] = [];

  visit(tree, (node) => {
    if (node.type !== "link" && node.type !== "definition") return;
    const link = node as PositionedLink;
    const rewritten = rewriteDocumentationUrl(link.url, validSlugs);
    const start = link.position?.start.offset;
    const end = link.position?.end.offset;
    if (rewritten === link.url || start === undefined || end === undefined) return;

    const source = markdown.slice(start, end);
    const relativeStart = source.lastIndexOf(link.url);
    if (relativeStart < 0) {
      throw new Error(`Could not locate Markdown link destination: ${link.url}`);
    }
    replacements.push({
      start: start + relativeStart,
      end: start + relativeStart + link.url.length,
      value: rewritten,
    });
  });

  let result = markdown;
  for (const replacement of replacements.sort((a, b) => b.start - a.start)) {
    result = result.slice(0, replacement.start) + replacement.value + result.slice(replacement.end);
  }
  return result;
}

function rewriteDocumentationUrl(url: string, validSlugs: ReadonlySet<string>) {
  let parsed: URL;
  try {
    parsed = new URL(url, CANONICAL_SITE_ORIGIN);
  } catch {
    return url;
  }
  if (parsed.origin !== CANONICAL_SITE_ORIGIN && parsed.origin !== RETRIEVAL_SITE_ORIGIN) {
    return url;
  }

  const slug = parsed.pathname.replace(/^\/+|\/+$/g, "");
  if (!validSlugs.has(slug)) return url;

  const markdownPath = markdownPathForSlug(slug);
  if (url.startsWith(CANONICAL_SITE_ORIGIN) || url.startsWith(RETRIEVAL_SITE_ORIGIN)) {
    return `${RETRIEVAL_SITE_ORIGIN}${markdownPath}${parsed.search}${parsed.hash}`;
  }
  if (url.startsWith("/")) {
    return `${markdownPath}${parsed.search}${parsed.hash}`;
  }
  return url;
}

function singleLine(value: string) {
  return value.replace(/\s+/g, " ").trim();
}
