## Explicit migrations and access boundaries

Tables use Drizzle. Migrations are generated as SQL. The project expects the SQL
to be reviewed, committed, and applied explicitly. The SQLite database is stored
in one file that can be backed up, moved, and inspected. The application runs as
a regular Node.js process.

Table metadata controls grids, forms, REST routes, and OpenAPI output. Generated
routes enforce row visibility and CASL abilities. Custom routes select access
rules at the API boundary. Browser filters and hidden columns do not provide
server authorization. Shared ts-rest contracts validate requests, type handlers,
generate OpenAPI, and create browser clients. The project separates shared
contracts, route adapters, domain services, database stores, and React views.

APIs don't require manual JSON wiring for request and response parsing. Both the
auto-generated APIs and any domain APIs you write are defined using ts-rest. The
definitions go into `packages/shared` and are immediately available in the front
end as typed functions.
