import { createMarkdownPaths } from "nuaj-agent-docs/negotiation";

export { explicitlyPrefersMarkdown } from "nuaj-agent-docs/negotiation";

// The Grid overview is a hand-written marketing page with no Markdown form.
// The homepage answers a Markdown request with the site's llms.txt index.
export const {
  isDocumentationPath,
  alternateMarkdownPath,
  markdownVariantPath,
} = createMarkdownPaths({
  prefixes: ["docs", "grid"],
  withoutMarkdown: ["grid"],
  variants: { "/": "/llms.txt" },
});
