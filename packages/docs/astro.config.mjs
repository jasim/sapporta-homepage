// @ts-check
import { defineConfig } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import tailwindcss from "@tailwindcss/vite";
import docsSidebar from "./sidebar.mjs";
import { gettingStartedEnv, replaceGettingStartedEnvTokens } from "./src/lib/getting-started-env.mjs";
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

// https://astro.build/config
export default defineConfig({
  site: gettingStartedEnv.docsCanonicalOrigin,
  base: "/",
  output: "static",
  trailingSlash: "ignore",
  markdown: {
    processor: unified({
      remarkPlugins: [injectGettingStartedEnv],
      rehypePlugins: [rehypeHomepageContent],
    }),
  },
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    react(),
    starlight({
      title: "Sapporta",
      customCss: ["./src/styles/sapporta.css"],
      components: {
        Head: "./src/components/AgentHead.astro",
        PageTitle: "./src/components/AgentPageTitle.astro",
      },
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
    mdx({
      remarkPlugins: [injectGettingStartedEnv],
      rehypePlugins: [rehypeHomepageContent],
    }),
  ],
});
