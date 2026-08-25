export default [
  {
    slug: "docs",
  },
  {
    label: "Getting Started",
    items: [
      {
        slug: "docs/getting-started/introduction",
      },
      {
        slug: "docs/technical-overview",
      },
      {
        slug: "docs/getting-started/create-a-project",
      },
      {
        slug: "docs/getting-started/tour-the-generated-project",
      },
      {
        slug: "docs/guides/discovery/develop-with-a-coding-agent",
      },
    ],
  },
  {
    label: "Guides",
    items: [
      {
        slug: "docs/guides",
      },
      {
        slug: "docs/guides/discovery/choose-an-application-interface",
      },
      {
        label: "Model table-backed features",
        items: [
          {
            slug: "docs/guides/model-data/tables-columns-and-schema-metadata",
          },
          {
            slug: "docs/guides/model-data/relationships-and-lookup-behavior",
          },
          {
            label: "Table search",
            items: [
              {
                slug: "docs/guides/model-data/search-indexes-and-display-metadata",
              },
              {
                slug: "docs/guides/model-data/configure-table-search",
              },
              {
                slug: "docs/guides/model-data/use-table-search",
              },
              {
                slug: "docs/guides/model-data/relational-search-semantics-and-security",
              },
              {
                slug: "docs/guides/model-data/index-relational-search-paths",
              },
            ],
          },
          {
            slug: "docs/guides/model-data/schema-changes-and-migrations",
          },
          {
            slug: "docs/guides/generated-surfaces/record-screens-and-forms",
          },
          {
            label: "Generated table APIs",
            items: [
              {
                slug: "docs/guides/generated-surfaces/generated-table-apis",
              },
              {
                slug: "docs/guides/generated-surfaces/generated-lookups-and-csv-export",
              },
              {
                slug: "docs/guides/generated-surfaces/count-visible-rows",
              },
              {
                slug: "docs/guides/generated-surfaces/filtering-sorting-search-and-pagination",
              },
            ],
          },
        ],
      },
      {
        label: "Build custom data interfaces",
        items: [
          {
            slug: "docs/guides/generated-surfaces/grid-first-record-workflows",
          },
          {
            label: "Registered-table Grid",
            items: [
              {
                slug: "docs/guides/generated-surfaces/grid-interaction-and-selection",
              },
              {
                slug: "docs/guides/generated-surfaces/table-aware-grids-and-customization",
              },
              {
                slug: "docs/guides/generated-surfaces/low-level-tgrid-sessions",
              },
            ],
          },
          {
            slug: "docs/guides/app-owned-features/bounded-gridcore-projections",
          },
          {
            label: "Custom forms",
            items: [
              {
                slug: "docs/guides/app-owned-features/custom-forms-and-table-queries",
              },
              {
                slug: "docs/guides/app-owned-features/custom-forms-and-validation",
              },
              {
                slug: "docs/guides/app-owned-features/cached-table-reads-and-refresh",
              },
              {
                slug: "docs/guides/app-owned-features/staged-multi-row-drafts",
              },
            ],
          },
          {
            label: "Custom screens",
            items: [
              {
                slug: "docs/guides/app-owned-features/custom-frontend-routes-and-screens",
              },
              {
                slug: "docs/guides/app-owned-features/custom-workflow-screens",
              },
              {
                slug: "docs/guides/app-owned-features/frontend-routes-navigation-and-layout",
              },
            ],
          },
        ],
      },
      {
        label: "Build domain workflows",
        items: [
          {
            slug: "docs/guides/app-owned-features/shared-contracts-and-request-validation",
          },
          {
            slug: "docs/guides/app-owned-features/domain-workflows-and-transactions",
          },
          {
            slug: "docs/guides/app-owned-features/parent-detail-transactions",
          },
          {
            slug: "docs/guides/app-owned-features/custom-api-endpoints",
          },
          {
            label: "Endpoint patterns",
            items: [
              {
                slug: "docs/guides/app-owned-features/errors-uploads-and-endpoint-patterns",
              },
              {
                slug: "docs/guides/app-owned-features/expected-errors-and-http-mapping",
              },
              {
                slug: "docs/guides/app-owned-features/multipart-file-uploads",
              },
              {
                slug: "docs/guides/app-owned-features/non-json-and-raw-responses",
              },
            ],
          },
          {
            slug: "docs/guides/app-owned-features/typed-api-clients",
          },
        ],
      },
      {
        label: "Secure actions and data",
        items: [
          {
            slug: "docs/guides/security/authentication-and-abilities",
          },
          {
            slug: "docs/guides/security/workspaces-ownership-and-row-visibility",
          },
          {
            label: "Row-safe custom data",
            items: [
              {
                slug: "docs/guides/security/row-safe-custom-endpoints-and-reports",
              },
              {
                slug: "docs/guides/security/scoped-table-reads-and-writes",
              },
              {
                slug: "docs/guides/security/immutable-tables-and-trusted-raw-access",
              },
            ],
          },
          {
            slug: "docs/guides/security/agent-access-and-scoped-tokens",
          },
        ],
      },
      {
        label: "Build reports",
        items: [
          {
            slug: "docs/guides/reports/route-based-reports",
          },
          {
            slug: "docs/guides/reports/scoped-report-data",
          },
          {
            slug: "docs/guides/reports/group-and-filter-by-day",
          },
          {
            slug: "docs/guides/reports/report-datasets-and-formatting",
          },
          {
            slug: "docs/guides/reports/report-screens-and-url-state",
          },
          {
            slug: "docs/guides/reports/drill-through-and-cross-report-links",
          },
        ],
      },
      {
        label: "Inspect and operate a running application",
        items: [
          {
            slug: "docs/guides/discovery/openapi-and-endpoint-discovery",
          },
          {
            slug: "docs/guides/discovery/use-the-sapporta-cli",
          },
          {
            slug: "docs/guides/discovery/use-the-agent-data-console",
          },
        ],
      },
      {
        label: "Configure and ship",
        items: [
          {
            slug: "docs/guides/operations/application-configuration",
          },
          {
            slug: "docs/guides/operations/sample-data-and-scripts",
          },
          {
            slug: "docs/guides/operations/email-and-runtime-services",
          },
          {
            slug: "docs/guides/operations/run-migrations-in-deployed-environments",
          },
          {
            slug: "docs/guides/operations/production-builds-and-deployment",
          },
          {
            slug: "docs/guides/operations/troubleshooting",
          },
        ],
      },
    ],
  },
  {
    label: "Reference",
    items: [
      {
        slug: "docs/reference",
      },
      {
        label: "Project and configuration",
        items: [
          {
            slug: "docs/reference/project/project-files",
          },
          {
            slug: "docs/reference/project/generated-project-layout",
          },
          {
            slug: "docs/reference/project/environment-variables",
          },
          {
            slug: "docs/reference/project/application-configuration",
          },
        ],
      },
      {
        label: "Schema and tables",
        items: [
          {
            slug: "docs/reference/schema/table-definitions",
          },
          {
            slug: "docs/reference/schema/table-and-column-metadata",
          },
          {
            slug: "docs/reference/schema/table-validation",
          },
          {
            label: "Semantic values",
            items: [
              {
                slug: "docs/reference/schema/semantic-value-boundaries",
              },
              {
                slug: "docs/reference/schema/semantic-values/generated-and-client-values",
              },
              {
                slug: "docs/reference/schema/semantic-values/server-write-values-and-contracts",
              },
            ],
          },
          {
            slug: "docs/reference/schema/schema-metadata-types",
          },
          {
            slug: "docs/reference/schema/migrations",
          },
        ],
      },
      {
        label: "Generated HTTP surface",
        items: [
          {
            slug: "docs/reference/http/table-endpoints",
          },
          {
            slug: "docs/reference/http/query-syntax",
          },
          {
            slug: "docs/reference/http/metadata-and-sql-endpoints",
          },
          {
            slug: "docs/reference/http/openapi",
          },
          {
            slug: "docs/reference/http/authentication-and-token-endpoints",
          },
        ],
      },
      {
        label: "Server APIs",
        items: [
          {
            slug: "docs/reference/server/ts-rest-api-and-route-registration",
          },
          {
            slug: "docs/reference/server/auth-and-row-security",
          },
          {
            slug: "docs/reference/server/days-and-time-zones",
          },
          {
            label: "Row-scoped data",
            items: [
              {
                slug: "docs/reference/server/row-scoped-data-helpers",
              },
              {
                slug: "docs/reference/server/row-scoped-data/scoped-crud-and-bounded-reads",
              },
              {
                slug: "docs/reference/server/row-scoped-data/lookups-and-counts",
              },
              {
                slug: "docs/reference/server/row-scoped-data/generated-query-resolvers",
              },
              {
                slug: "docs/reference/server/row-scoped-data/table-row-security-guards",
              },
            ],
          },
          {
            slug: "docs/reference/server/runtime-services",
          },
        ],
      },
      {
        label: "Shared contracts and clients",
        items: [
          {
            slug: "docs/reference/contracts/contract-helpers-and-wire-types",
          },
          {
            slug: "docs/reference/contracts/typed-client-creation",
          },
          {
            slug: "docs/reference/contracts/serialization-and-api-errors",
          },
        ],
      },
      {
        label: "Frontend APIs",
        items: [
          {
            slug: "docs/reference/column-sizing",
          },
          {
            label: "App shell",
            items: [
              {
                slug: "docs/reference/frontend/app-shell-routes-and-navigation",
              },
              {
                slug: "docs/reference/frontend/app-shell/application-routes-and-navigation",
              },
              {
                slug: "docs/reference/frontend/app-shell/layout-and-sidebar",
              },
            ],
          },
          {
            slug: "docs/reference/frontend/generated-record-surfaces",
          },
          {
            slug: "docs/reference/frontend/lookups",
          },
          {
            label: "Table queries",
            items: [
              {
                slug: "docs/reference/frontend/table-query-options",
              },
              {
                slug: "docs/reference/frontend/table-queries/read-functions-and-options",
              },
              {
                slug: "docs/reference/frontend/table-queries/cache-keys-and-ownership",
              },
            ],
          },
          {
            label: "TGrid",
            items: [
              {
                slug: "docs/reference/frontend/tgrid",
              },
              {
                slug: "docs/reference/frontend/tgrid/definitions-sessions-and-queries",
              },
              {
                slug: "docs/reference/frontend/tgrid/interactions-columns-and-writes",
              },
            ],
          },
        ],
      },
      {
        label: "Reports",
        items: [
          {
            slug: "docs/reference/reports/report-routes-and-registration",
          },
          {
            slug: "docs/reference/reports/grid-dataset",
          },
          {
            slug: "docs/reference/reports/report-links",
          },
          {
            slug: "docs/reference/reports/scoped-report-helpers",
          },
        ],
      },
      {
        label: "CLI",
        items: [
          {
            slug: "docs/reference/cli/overview-and-global-options",
          },
          {
            slug: "docs/reference/cli/project-and-discovery-commands",
          },
          {
            slug: "docs/reference/cli/table-row-and-report-commands",
          },
          {
            slug: "docs/reference/cli/api-and-sql-commands",
          },
          {
            slug: "docs/reference/cli/output-formats-and-exit-codes",
          },
        ],
      },
      {
        label: "Deployment and diagnostics",
        items: [
          {
            slug: "docs/reference/operations/runtime-and-deployment-contract",
          },
          {
            slug: "docs/reference/operations/migration-and-startup-invariants",
          },
          {
            slug: "docs/reference/operations/error-catalogue-and-diagnostics",
          },
        ],
      },
      {
        label: "Indexes",
        items: [
          {
            slug: "docs/reference/indexes/public-symbols",
          },
          {
            slug: "docs/reference/indexes/http-endpoints",
          },
          {
            slug: "docs/reference/indexes/cli-commands",
          },
          {
            slug: "docs/reference/indexes/configuration",
          },
        ],
      },
    ],
  },
  {
    label: "Sapporta Grid",
    items: [
      {
        label: "Sapporta Grid overview",
        link: "/grid/",
      },
      {
        label: "Start",
        items: [
          {
            slug: "grid/start/install-and-render-the-first-grid",
          },
          {
            slug: "grid/start/choose-a-grid-layer",
          },
        ],
      },
      {
        label: "Guides",
        items: [
          {
            slug: "grid/guides/core-model",
          },
          {
            slug: "grid/guides/columns-and-editors",
          },
          {
            slug: "grid/guides/data-sources",
          },
          {
            slug: "grid/guides/editing-and-saving",
          },
          {
            slug: "grid/guides/keyboard-and-selection",
          },
          {
            slug: "grid/guides/copying-grid-data",
          },
          {
            slug: "grid/guides/hierarchical-grids",
          },
          {
            label: "Advanced rows",
            items: [
              {
                slug: "grid/guides/advanced-rows",
              },
              {
                slug: "grid/guides/advanced-rows/summary-rows-and-footers",
              },
              {
                slug: "grid/guides/advanced-rows/phantom-rows-and-inserts",
              },
            ],
          },
          {
            slug: "grid/guides/styling",
          },
        ],
      },
      {
        label: "Reference",
        items: [
          {
            slug: "grid/reference",
          },
          {
            label: "GridCore",
            items: [
              {
                slug: "grid/reference/grid-core",
              },
              {
                slug: "grid/reference/grid-core/schema-rows-and-identity",
              },
              {
                slug: "grid/reference/grid-core/grid-runtime",
              },
              {
                slug: "grid/reference/grid-core/level-runtime",
              },
              {
                slug: "grid/reference/grid-core/react-api",
              },
              {
                slug: "grid/reference/grid-core/advanced-composition",
              },
            ],
          },
          {
            slug: "grid/reference/column-preset",
          },
          {
            label: "Data sources",
            items: [
              {
                slug: "grid/reference/data-sources",
              },
              {
                slug: "grid/reference/data-sources/contracts-and-state",
              },
              {
                slug: "grid/reference/data-sources/runtime-data-access",
              },
              {
                slug: "grid/reference/data-sources/writes-and-reconciliation",
              },
              {
                slug: "grid/reference/data-sources/in-memory-and-rest-sources",
              },
              {
                slug: "grid/reference/rest-helpers",
              },
            ],
          },
          {
            slug: "grid/reference/clipboard",
          },
          {
            label: "Interactions",
            items: [
              {
                slug: "grid/reference/interactions",
              },
              {
                slug: "grid/reference/interactions/configuration-and-presets",
              },
              {
                slug: "grid/reference/interactions/active-row-and-activation",
              },
              {
                slug: "grid/reference/interactions/row-selection",
              },
            ],
          },
          {
            slug: "grid/reference/dom-and-styling-contract",
          },
        ],
      },
    ],
  },
];
