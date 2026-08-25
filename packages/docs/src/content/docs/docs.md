---
title: "Documentation"
description:
  "Index of every Sapporta documentation page: getting started, the guides, the
  reference, and the standalone Sapporta Grid."
---

Sapporta turns table definitions into a running database application: generated
CRUD endpoints, record screens, row-scoped access, reports, and a CLI to operate
the result. This page indexes every documentation page there is.

Coding agents can fetch the Markdown form of any page below by appending `.md`
to its path — `/docs/reference.md` for the reference index, and so on. The
[Sapporta API reference](/api-reference/llms.txt) names every exported symbol
and the specifier that publishes it; [llms.txt](/llms.txt) is the retrieval
index for the whole site.

## Getting Started

- [Welcome to Sapporta](/docs/getting-started/introduction/)
- [Technical overview](/docs/technical-overview/)
- [Create a Sapporta project](/docs/getting-started/create-a-project/)
- [Tour the generated project](/docs/getting-started/tour-the-generated-project/)
- [Develop with a coding agent](/docs/guides/discovery/develop-with-a-coding-agent/)

## Guides

- [Guides](/docs/guides/)
- [Choose an application interface](/docs/guides/discovery/choose-an-application-interface/)

### Model table-backed features

- [Tables, columns, and schema metadata](/docs/guides/model-data/tables-columns-and-schema-metadata/)
- [Relationships and lookup behavior](/docs/guides/model-data/relationships-and-lookup-behavior/)
- **Table search**
  - [Search table rows and relationships](/docs/guides/model-data/search-indexes-and-display-metadata/)
  - [Configure table search](/docs/guides/model-data/configure-table-search/)
  - [Use table search](/docs/guides/model-data/use-table-search/)
  - [Relational search semantics and security](/docs/guides/model-data/relational-search-semantics-and-security/)
  - [Index relational search paths](/docs/guides/model-data/index-relational-search-paths/)
- [Schema changes and migrations](/docs/guides/model-data/schema-changes-and-migrations/)
- [Generated record screens and forms](/docs/guides/generated-surfaces/record-screens-and-forms/)
- **Generated table APIs**
  - [Generated table APIs](/docs/guides/generated-surfaces/generated-table-apis/)
  - [Generated lookups and CSV export](/docs/guides/generated-surfaces/generated-lookups-and-csv-export/)
  - [Count visible rows](/docs/guides/generated-surfaces/count-visible-rows/)
  - [Filtering, sorting, search, and pagination](/docs/guides/generated-surfaces/filtering-sorting-search-and-pagination/)

### Build custom data interfaces

- [Grid-first record workflows](/docs/guides/generated-surfaces/grid-first-record-workflows/)
- **Registered-table Grid**
  - [Grid interaction and selection](/docs/guides/generated-surfaces/grid-interaction-and-selection/)
  - [Table-aware grids and customization](/docs/guides/generated-surfaces/table-aware-grids-and-customization/)
  - [Low-level TGrid sessions](/docs/guides/generated-surfaces/low-level-tgrid-sessions/)
- [Bounded GridCore projections](/docs/guides/application-code/bounded-gridcore-projections/)
- **Custom forms**
  - [Custom forms and cached table reads](/docs/guides/application-code/custom-forms-and-table-queries/)
  - [Custom forms and validation](/docs/guides/application-code/custom-forms-and-validation/)
  - [Cached table reads and refresh](/docs/guides/application-code/cached-table-reads-and-refresh/)
  - [Stage multi-row drafts in a Grid](/docs/guides/application-code/staged-multi-row-drafts/)
- **Custom screens**
  - [Custom frontend routes and screens](/docs/guides/application-code/custom-frontend-routes-and-screens/)
  - [Custom workflow screens](/docs/guides/application-code/custom-workflow-screens/)
  - [Frontend routes, navigation, and layout](/docs/guides/application-code/frontend-routes-navigation-and-layout/)

### Build domain workflows

- [Shared contracts and request validation](/docs/guides/application-code/shared-contracts-and-request-validation/)
- [Domain workflows and transactions](/docs/guides/application-code/domain-workflows-and-transactions/)
- [Parent-detail transactions](/docs/guides/application-code/parent-detail-transactions/)
- [Custom API endpoints](/docs/guides/application-code/custom-api-endpoints/)
- **Endpoint patterns**
  - [Errors, uploads, and endpoint patterns](/docs/guides/application-code/errors-uploads-and-endpoint-patterns/)
  - [Expected errors and HTTP mapping](/docs/guides/application-code/expected-errors-and-http-mapping/)
  - [Multipart file uploads](/docs/guides/application-code/multipart-file-uploads/)
  - [Non-JSON and raw responses](/docs/guides/application-code/non-json-and-raw-responses/)
- [Typed API clients](/docs/guides/application-code/typed-api-clients/)

### Secure actions and data

- [Authentication and abilities](/docs/guides/security/authentication-and-abilities/)
- [Workspaces, ownership, and row visibility](/docs/guides/security/workspaces-ownership-and-row-visibility/)
- **Row-safe custom data**
  - [Row-safe custom endpoints and reports](/docs/guides/security/row-safe-custom-endpoints-and-reports/)
  - [Scoped table reads and writes](/docs/guides/security/scoped-table-reads-and-writes/)
  - [Immutable tables and trusted raw access](/docs/guides/security/immutable-tables-and-trusted-raw-access/)
- [Agent access and scoped tokens](/docs/guides/security/agent-access-and-scoped-tokens/)

### Build reports

- [Route-based reports](/docs/guides/reports/route-based-reports/)
- [Scoped report data](/docs/guides/reports/scoped-report-data/)
- [Group and filter by day](/docs/guides/reports/group-and-filter-by-day/)
- [Report datasets and formatting](/docs/guides/reports/report-datasets-and-formatting/)
- [Report screens and URL state](/docs/guides/reports/report-screens-and-url-state/)
- [Drill-through and cross-report links](/docs/guides/reports/drill-through-and-cross-report-links/)

### Inspect and operate a running application

- [OpenAPI and endpoint discovery](/docs/guides/discovery/openapi-and-endpoint-discovery/)
- [Use the Sapporta CLI](/docs/guides/discovery/use-the-sapporta-cli/)
- [Use the agent data console](/docs/guides/discovery/use-the-agent-data-console/)

### Configure and ship

- [Application configuration](/docs/guides/operations/application-configuration/)
- [Sample data and command-line scripts](/docs/guides/operations/sample-data-and-scripts/)
- [Email and runtime services](/docs/guides/operations/email-and-runtime-services/)
- [Run migrations in deployed environments](/docs/guides/operations/run-migrations-in-deployed-environments/)
- [Production builds and deployment](/docs/guides/operations/production-builds-and-deployment/)
- [Troubleshoot startup, native modules, auth, and migrations](/docs/guides/operations/troubleshooting/)

## Reference

- [Reference](/docs/reference/)

### Project and configuration

- [Project file map](/docs/reference/project/project-files/)
- [Environment variables](/docs/reference/project/environment-variables/)

### Schema and tables

- [Table definitions](/docs/reference/schema/table-definitions/)
- [Table and column metadata](/docs/reference/schema/table-and-column-metadata/)
- [Table validation](/docs/reference/schema/table-validation/)
- **Semantic values**
  - [Semantic value boundaries](/docs/reference/schema/semantic-value-boundaries/)
  - [Generated and client values](/docs/reference/schema/semantic-values/generated-and-client-values/)
  - [Server write values and contracts](/docs/reference/schema/semantic-values/server-write-values-and-contracts/)
- [Schema metadata types](/docs/reference/schema/schema-metadata-types/)
- [Migrations](/docs/reference/schema/migrations/)

### Generated HTTP surface

- [Table endpoints](/docs/reference/http/table-endpoints/)
- [Query syntax](/docs/reference/http/query-syntax/)
- [Metadata and SQL endpoints](/docs/reference/http/metadata-and-sql-endpoints/)
- [OpenAPI](/docs/reference/http/openapi/)
- [Authentication and token endpoints](/docs/reference/http/authentication-and-token-endpoints/)

### Server APIs

- [TsRestApi and route registration](/docs/reference/server/ts-rest-api-and-route-registration/)
- [Auth and row security](/docs/reference/server/auth-and-row-security/)
- [Days and time zones](/docs/reference/server/days-and-time-zones/)
- **Row-scoped data**
  - [Row-scoped data helpers](/docs/reference/server/row-scoped-data-helpers/)
  - [Scoped CRUD and bounded reads](/docs/reference/server/row-scoped-data/scoped-crud-and-bounded-reads/)
  - [Scoped lookups and counts](/docs/reference/server/row-scoped-data/lookups-and-counts/)
  - [Generated query resolvers](/docs/reference/server/row-scoped-data/generated-query-resolvers/)
  - [Table row-security guards](/docs/reference/server/row-scoped-data/table-row-security-guards/)
- [Runtime services](/docs/reference/server/runtime-services/)

### Shared contracts and clients

- [Contract helpers and wire types](/docs/reference/contracts/contract-helpers-and-wire-types/)
- [Typed client creation](/docs/reference/contracts/typed-client-creation/)
- [Serialization and API errors](/docs/reference/contracts/serialization-and-api-errors/)

### Frontend APIs

- [Column sizing](/docs/reference/column-sizing/)
- **App shell**
  - [App shell, routes, and navigation](/docs/reference/frontend/app-shell-routes-and-navigation/)
  - [Application routes and navigation](/docs/reference/frontend/app-shell/application-routes-and-navigation/)
  - [App shell layout and sidebar](/docs/reference/frontend/app-shell/layout-and-sidebar/)
- [Generated record surfaces and form helpers](/docs/reference/frontend/generated-record-surfaces/)
- [Table lookups and record ids](/docs/reference/frontend/lookups/)
- **Table queries**
  - [Table query options](/docs/reference/frontend/table-query-options/)
  - [Table read functions and query options](/docs/reference/frontend/table-queries/read-functions-and-options/)
  - [Table query cache keys and ownership](/docs/reference/frontend/table-queries/cache-keys-and-ownership/)
- **TGrid**
  - [TGrid](/docs/reference/frontend/tgrid/)
  - [TGrid definitions, sessions, and queries](/docs/reference/frontend/tgrid/definitions-sessions-and-queries/)
  - [TGrid interactions, columns, and writes](/docs/reference/frontend/tgrid/interactions-columns-and-writes/)

### Reports

- [Report routes and registration](/docs/reference/reports/report-routes-and-registration/)
- [GridDataset](/docs/reference/reports/grid-dataset/)
- [Report links](/docs/reference/reports/report-links/)
- [Scoped report helpers](/docs/reference/reports/scoped-report-helpers/)

### CLI

- [CLI overview and global options](/docs/reference/cli/overview-and-global-options/)
- [Project and discovery commands](/docs/reference/cli/project-and-discovery-commands/)
- [Table, row, and report commands](/docs/reference/cli/table-row-and-report-commands/)
- [API and SQL commands](/docs/reference/cli/api-and-sql-commands/)
- [Output formats and exit codes](/docs/reference/cli/output-formats-and-exit-codes/)

### Deployment and diagnostics

- [Runtime and deployment contract](/docs/reference/operations/runtime-and-deployment-contract/)
- [Migration and startup invariants](/docs/reference/operations/migration-and-startup-invariants/)
- [Error catalogue and diagnostics](/docs/reference/operations/error-catalogue-and-diagnostics/)

### Indexes

- [Public symbols](/docs/reference/indexes/public-symbols/)
- [HTTP endpoints](/docs/reference/indexes/http-endpoints/)
- [CLI commands](/docs/reference/indexes/cli-commands/)
- [Configuration](/docs/reference/indexes/configuration/)

## Sapporta Grid

- [Sapporta Grid overview](/grid/)

### Start

- [Install and render the first grid](/grid/start/install-and-render-the-first-grid/)
- [Choose a grid layer](/grid/start/choose-a-grid-layer/)

### Guides

- [Core model](/grid/guides/core-model/)
- [Columns and editors](/grid/guides/columns-and-editors/)
- [Data sources](/grid/guides/data-sources/)
- [Editing and saving](/grid/guides/editing-and-saving/)
- [Keyboard and selection](/grid/guides/keyboard-and-selection/)
- [Copying grid data](/grid/guides/copying-grid-data/)
- [Hierarchical grids](/grid/guides/hierarchical-grids/)
- **Advanced rows**
  - [Advanced rows](/grid/guides/advanced-rows/)
  - [Summary rows and footers](/grid/guides/advanced-rows/summary-rows-and-footers/)
  - [Phantom rows and inserts](/grid/guides/advanced-rows/phantom-rows-and-inserts/)
- [Styling](/grid/guides/styling/)

### Reference

- [Grid reference](/grid/reference/)
- **GridCore**
  - [GridCore reference](/grid/reference/grid-core/)
  - [Schema, rows, paths, and identity](/grid/reference/grid-core/schema-rows-and-identity/)
  - [GridRuntime](/grid/reference/grid-core/grid-runtime/)
  - [GridLevelRuntime](/grid/reference/grid-core/level-runtime/)
  - [GridCore React APIs](/grid/reference/grid-core/react-api/)
  - [Advanced Grid composition](/grid/reference/grid-core/advanced-composition/)
- [ColumnPreset](/grid/reference/column-preset/)
- **Data sources**
  - [Data-source reference](/grid/reference/data-sources/)
  - [Data-source contracts and state](/grid/reference/data-sources/contracts-and-state/)
  - [Runtime data access](/grid/reference/data-sources/runtime-data-access/)
  - [Data-source writes and reconciliation](/grid/reference/data-sources/writes-and-reconciliation/)
  - [In-memory and REST data sources](/grid/reference/data-sources/in-memory-and-rest-sources/)
  - [REST data-source helpers](/grid/reference/rest-helpers/)
- [Clipboard API](/grid/reference/clipboard/)
- **Interactions**
  - [Grid interactions](/grid/reference/interactions/)
  - [Interaction configuration and presets](/grid/reference/interactions/configuration-and-presets/)
  - [Active rows and row activation](/grid/reference/interactions/active-row-and-activation/)
  - [Row selection](/grid/reference/interactions/row-selection/)
- [Grid DOM state contract](/grid/reference/dom-and-styling-contract/)
