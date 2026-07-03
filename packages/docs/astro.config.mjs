// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://sapporta.com",
  base: "/",
  trailingSlash: "ignore",
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    react(),
    starlight({
      title: "Sapporta",
      customCss: ["./src/styles/sapporta.css"],
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
      sidebar: [
        {
          label: "Sapporta Grid",
          items: [
            { slug: "grid/docs" },
            { slug: "grid/docs/getting-started" },
            { slug: "grid/docs/core-model" },
            { slug: "grid/docs/columns-and-editors" },
            { slug: "grid/docs/data-sources" },
            { slug: "grid/docs/editing-and-saving" },
            { slug: "grid/docs/keyboard-and-selection" },
            { slug: "grid/docs/hierarchical-grids" },
            { slug: "grid/docs/advanced-rows" },
            { slug: "grid/docs/styling" },
            { slug: "grid/docs/reference" },
            { slug: "grid/docs/full/basegrid-guide" },
            { slug: "grid/docs/full/basegrid-api" },
            { slug: "grid/docs/full/basegrid-interactions" },
            { slug: "grid/docs/full/basegrid-styling" },
          ],
        },
        {
          label: "Sapporta Framework",
          items: [{ slug: "docs/getting-started" }, { slug: "docs" }],
        },
        {
          label: "Concepts",
          items: [
            { slug: "docs/concepts/what-is-sapporta" },
            { slug: "docs/concepts/the-grid-and-record-surfaces" },
            { slug: "docs/concepts/grid/standalone-grid-and-sapporta" },
            { slug: "docs/concepts/project-anatomy" },
            { slug: "docs/concepts/schema-as-code" },
            { slug: "docs/concepts/generated-apis-and-openapi" },
            { slug: "docs/concepts/auth-and-row-scope" },
            { slug: "docs/concepts/app-owned-features" },
            { slug: "docs/concepts/agent-native-development" },
          ],
        },
        {
          label: "Building Your Own Feature",
          items: [
            { slug: "docs/building-your-own-feature/overview" },
            { slug: "docs/building-your-own-feature/start-from-the-task-app" },
            { slug: "docs/building-your-own-feature/add-task-events" },
            {
              slug: "docs/building-your-own-feature/define-the-triage-contract",
            },
            {
              slug: "docs/building-your-own-feature/implement-the-backend-action",
            },
            {
              slug: "docs/building-your-own-feature/mount-and-discover-the-endpoint",
            },
            { slug: "docs/building-your-own-feature/build-the-triage-screen" },
            {
              slug: "docs/building-your-own-feature/add-the-triage-aging-report",
            },
            { slug: "docs/building-your-own-feature/seed-and-validate" },
            { slug: "docs/building-your-own-feature/what-to-change-next" },
          ],
        },
        {
          label: "Subsystem Guides",
          items: [
            { slug: "docs/subsystems/data-modeling" },
            { slug: "docs/subsystems/generated-record-screens" },
            { slug: "docs/subsystems/generated-table-apis" },
            { slug: "docs/subsystems/authorization" },
            { slug: "docs/subsystems/custom-api-endpoints" },
            { slug: "docs/subsystems/typed-api-clients" },
            { slug: "docs/subsystems/frontend-screens" },
            { slug: "docs/subsystems/grid" },
            { slug: "docs/subsystems/reports" },
            { slug: "docs/subsystems/openapi-and-discovery" },
          ],
        },
        {
          label: "Tools And Operations",
          items: [
            { slug: "docs/tools-and-operations/choose-apis-and-tools" },
            { slug: "docs/tools-and-operations/sapporta-cli" },
            { slug: "docs/tools-and-operations/agent-access" },
            { slug: "docs/tools-and-operations/agent-data-console" },
            { slug: "docs/tools-and-operations/agent-data-console-recipes" },
            { slug: "docs/tools-and-operations/llm-assisted-engineering" },
            { slug: "docs/tools-and-operations/deployment" },
            { slug: "docs/tools-and-operations/troubleshooting" },
          ],
        },
        {
          label: "Reference",
          items: [
            { slug: "docs/reference" },
            { slug: "docs/reference/table-definitions" },
            { slug: "docs/reference/full/schema-and-migrations" },
            { slug: "docs/reference/full/schema-metadata" },
            { slug: "docs/reference/filter-syntax" },
            { slug: "docs/reference/table-apis" },
            { slug: "docs/reference/full/grid/tgrid-usage" },
            { slug: "docs/reference/auth-and-row-security" },
            { slug: "docs/reference/full/auth-row-safe-apps" },
            { slug: "docs/reference/cli" },
            { slug: "docs/reference/full/cli" },
            { slug: "docs/reference/report-datasets" },
            { slug: "docs/reference/full/reports/grid-result-shape" },
            { slug: "docs/reference/full/reports/route-based-reports" },
            { slug: "docs/reference/full/reports/scoped-report-data" },
            { slug: "docs/reference/openapi" },
            { slug: "docs/reference/deployment" },
            { slug: "docs/reference/full/deployment" },
            { slug: "docs/reference/troubleshooting" },
          ],
        },
      ],
    }),
  ],
});
