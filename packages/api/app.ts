/**
 * App-specific API routes.
 *
 * Mount each `packages/api/app/*.ts` sub-app here. `app` is already scoped to
 * `/api`, so `app.route("/bank", bankApi)` is served at `/api/bank`; do not
 * repeat the `/api` prefix.
 *
 * Add a route here when you want it available from the browser, CLI, or API
 * clients. New files under `packages/api/app/` are not exposed until you mount
 * them here.
 */
import type {
  ProjectDbConnection,
  SapportaEnv,
  TsRestApi,
} from "@sapporta/server";
import demoResetApi from "./app/demo-reset.js";
import helloApi from "./app/hello.js";
import publicApiSample from "./app/public-api-sample.js";
import type { SapportaMailer } from "./mailer.js";
import type { PublicRoutePattern } from "./project-auth/index.js";

export interface LoadAppOptions {
  conn: ProjectDbConnection;
  mailer: SapportaMailer;
}

export function loadApp(app: TsRestApi<SapportaEnv>, _options: LoadAppOptions) {
  app.route("/", helloApi);
  app.route("/", publicApiSample);
  app.route("/", demoResetApi);
}

const publicTableNames = ["books", "quotes"] as const;

function publicTableRoutes(
  tableName: (typeof publicTableNames)[number],
): readonly PublicRoutePattern[] {
  return [
    { method: "GET", path: `/api/meta/tables/${tableName}` },
    { method: "GET", path: `/api/tables/${tableName}` },
    { method: "POST", path: `/api/tables/${tableName}` },
    { method: "GET", path: `/api/tables/${tableName}/*` },
    { method: "PUT", path: `/api/tables/${tableName}/*` },
  ];
}

export const publicApiRoutes = [
  { method: "GET", path: "/api/public-api-sample" },
  // Called unauthenticated by the demo-refresh cron; it can only restore the
  // snapshot, never read or write anything else.
  { method: "POST", path: "/api/demo-reset" },
  { method: "GET", path: "/api/meta/tables" },
  ...publicTableNames.flatMap((tableName) => publicTableRoutes(tableName)),
] satisfies readonly PublicRoutePattern[];

/**
 * PUBLIC ROUTE WARNING
 *
 * Routes in `publicApiRoutes` can be reached by anonymous visitors. Add a path
 * here only when the feature is intentionally public. The handler must still
 * read `c.get("auth")`, call `forbidUnless(c, auth.ability.can(...))`, and use
 * row security for any table-backed data.
 *
 * For table-backed public pages, import the table definition and compose the
 * route predicate with row security:
 *
 *   const auth = c.get("auth");
 *   forbidUnless(c, auth.ability.can("read-published", "quotes"));
 *   const access = auth.rowSecurity.forTable(quotes);
 *   const where = access.ownedRows(eq(quotesTable.published, true));
 */
