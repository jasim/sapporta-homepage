import { createMarkdownPaths } from "nuaj-agent-docs/negotiation";

export { explicitlyPrefersMarkdown } from "nuaj-agent-docs/negotiation";

// The Grid overview is a hand-written marketing page with no Markdown form.
export const {
  isDocumentationPath,
  alternateMarkdownPath,
  markdownVariantPath,
} = createMarkdownPaths({ prefixes: ["docs", "grid"], withoutMarkdown: ["grid"] });
