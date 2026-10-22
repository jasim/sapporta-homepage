// @ts-check
import { defineConfig } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import tailwindcss from "@tailwindcss/vite";
import agentDocs from "nuaj-agent-docs";
import docsSidebar from "./sidebar.mjs";
import { codeThemes } from "./src/lib/code-themes.mjs";
import {
  gettingStartedEnv,
  gettingStartedEnvTokens,
  replaceGettingStartedEnvTokens,
} from "./src/lib/getting-started-env.mjs";
import { rehypeHomepageContent } from "./src/markdown/rehype-homepage-content.mjs";

function injectGettingStartedEnv() {
  return (tree) => {
    const visit = (node) => {
      if (typeof node.value === "string") {
        node.value = replaceGettingStartedEnvTokens(node.value, gettingStartedEnv);
      }
      if (Array.isArray(node.children)) node.children.forEach(visit);
    };

    visit(tree);
  };
}

const apiReferenceLink = {
  title: "Sapporta API reference",
  href: `${gettingStartedEnv.docsOrigin}/api-reference/llms.txt`,
  description:
    "Every symbol published by the Sapporta packages, with the specifier to import it from and its exact declaration.",
};

/*
 * Dev topology: the Hono server on SAPPORTA_API_PORT is the only origin the
 * browser uses. In production it serves this site from dist/; in development it
 * proxies the same URLs to this dev server instead, deciding ownership from one
 * shared table (packages/api/site-routes.ts). That needs a fixed port here.
 * Hot module reload is a WebSocket and cannot cross a fetch()-based proxy, so
 * `hmr.clientPort` points the browser at this server directly for that socket
 * alone. `astro build` ignores both settings.
 */
const docsPort = Number(process.env.SAPPORTA_DOCS_PORT) || 4321;

// https://astro.build/config
export default defineConfig({
  site: gettingStartedEnv.docsCanonicalOrigin,
  base: "/",
  output: "static",
  trailingSlash: "ignore",
  server: { port: docsPort },
  markdown: {
    processor: unified({
      remarkPlugins: [injectGettingStartedEnv],
      rehypePlugins: [rehypeHomepageContent],
    }),
  },
  vite: {
    plugins: [tailwindcss()],
    server: { hmr: { clientPort: docsPort } },
  },
  integrations: [
    react(),
    starlight({
      title: "Sapporta",
      customCss: ["./src/styles/sapporta.css"],
      head: [
        { tag: "link", attrs: { rel: "preconnect", href: "https://fonts.googleapis.com" } },
        { tag: "link", attrs: { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "anonymous" } },
        {
          tag: "link",
          attrs: {
            rel: "stylesheet",
            href: "https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,100..900&display=swap",
          },
        },
      ],
      plugins: [
        agentDocs({
          canonicalOrigin: gettingStartedEnv.docsCanonicalOrigin,
          retrievalOrigin: gettingStartedEnv.docsOrigin,
          title: "Sapporta documentation",
          summary: "Documentation for Sapporta and the standalone Sapporta Grid.",
          links: [
            {
              heading: "API reference",
              links: [
                {
                  ...apiReferenceLink,
                  description: `${apiReferenceLink.description} Read this instead of opening declaration files under \`node_modules\`.`,
                },
              ],
            },
          ],
          sections: [
            {
              prefix: "docs",
              title: "Sapporta application framework documentation",
              summary: "Documentation for building database applications with Sapporta.",
              setLabel: "Sapporta application framework",
              setDescription: "Guides and reference for building and operating Sapporta applications.",
              bundleName: "framework",
              links: [
                {
                  heading: "API reference",
                  links: [
                    {
                      ...apiReferenceLink,
                      description: `${apiReferenceLink.description} The pages below explain behaviour; this names the surface.`,
                    },
                  ],
                },
              ],
            },
            {
              prefix: "grid",
              title: "Sapporta Grid documentation",
              summary: "Documentation for the standalone @sapporta/grid React data grid.",
              setLabel: "Sapporta Grid",
              setDescription: "Guides and reference for the standalone React data grid.",
              bundleName: "Grid",
            },
          ],
          replacements: gettingStartedEnvTokens(gettingStartedEnv),
        }),
      ],
      expressiveCode: {
        themes: ["github-dark-default", "github-light-default"],
        useStarlightUiThemeColors: false,
        styleOverrides: {
          borderRadius: "0px",
          borderWidth: "0px",
          codePaddingBlock: "0.75rem",
          codePaddingInline: "1rem",
          codeFontSize: "0.875rem",
          codeLineHeight: "1.5",
        },
      },
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/jasim/sapporta",
        },
      ],
      sidebar: docsSidebar,
    }),
    /*
     * MDX is homepage-only: everything under src/home-content. Starlight's
     * Expressive Code sets markdown.syntaxHighlight to false globally and
     * highlights .md itself through a rehype plugin it appends to the markdown
     * config -- but the plugin arrays passed here *replace* the inherited ones,
     * so MDX gets neither Expressive Code nor Shiki and fenced code lands as
     * bare <pre><code>. Turning Shiki back on for this pipeline gives the
     * homepage build-time highlighting with no client JavaScript and no
     * Expressive Code chrome, matching the <Code> demo panel. `gfm` is likewise
     * not inherited (the markdown config leaves it undefined for the processor
     * to default), so tables and strikethrough need it stated here.
     */
    mdx({
      gfm: true,
      syntaxHighlight: "shiki",
      shikiConfig: { themes: codeThemes },
      remarkPlugins: [injectGettingStartedEnv],
      rehypePlugins: [rehypeHomepageContent],
    }),
  ],
});
