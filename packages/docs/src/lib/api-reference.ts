import { gettingStartedEnv } from "./getting-started-env.mjs";

const RETRIEVAL_SITE_ORIGIN = gettingStartedEnv.docsOrigin;

/**
 * The generated symbol reference, committed under `src/generated/api-reference`
 * by `packages/api-reference`. Pages are served as Markdown only: they exist for
 * coding agents, and their content is signatures rather than prose.
 */
const generated = import.meta.glob("../generated/api-reference/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const PREFIX = "../generated/api-reference/";

export type ApiReferencePage = {
  slug: string;
  content: string;
};

function slugFor(path: string) {
  if (!path.startsWith(PREFIX) || !path.endsWith(".md")) {
    throw new Error(`Unexpected API reference file: ${path}`);
  }
  return path.slice(PREFIX.length, -".md".length);
}

let cached: ReadonlyMap<string, ApiReferencePage> | undefined;

export function getApiReferencePages() {
  if (cached) return cached;

  const pages = new Map<string, ApiReferencePage>();
  for (const [path, content] of Object.entries(generated)) {
    const slug = slugFor(path);
    pages.set(slug, { slug, content });
  }

  if (!pages.has("index")) {
    throw new Error(
      "The API reference has not been generated. Run " +
        "`pnpm --filter ./packages/api-reference generate`.",
    );
  }
  if (!pages.has("symbols")) {
    throw new Error("The API reference is missing its symbol index page.");
  }

  cached = pages;
  return cached;
}

/**
 * Every page as Markdown, the index included.
 *
 * The index is served twice: at `/api-reference/llms.txt`, which is where the
 * llms.txt convention sends agents, and at `/api-reference/index.md`, so links
 * to it keep the `.md` form the rest of the documentation uses.
 */
export function getApiReferenceSubPages() {
  return [...getApiReferencePages().values()];
}

export function apiReferenceIndex() {
  const index = getApiReferencePages().get("index");
  if (!index) throw new Error("The API reference index is missing.");
  return index.content;
}

export function apiReferenceIndexUrl() {
  return `${RETRIEVAL_SITE_ORIGIN}/api-reference/llms.txt`;
}
