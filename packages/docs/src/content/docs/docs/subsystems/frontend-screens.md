---
title: "Frontend Screens"
description:
  "Add custom React pages, forms, dashboards, app shell navigation, and UI
  controls."
---

## Add routes to the app

Custom screens live in `packages/frontend/src`. A generated Sapporta app keeps
the builder-owned route surface in `packages/frontend/src/App.tsx`:

- `appNavigation` defines links shown in the app shell.
- `appHomeRoute` decides where `/` sends signed-in users.
- `appPublicRoutes` renders outside the auth gate.
- `appProtectedRoutes` renders inside `AuthGate`, `BootLoader`, and `AppShell`.

Start with one file per screen, then mount it from `App.tsx`.

```tsx
import { Route, Navigate } from "react-router-dom";
import type { Navigation } from "@sapporta/frontend/shell";
import { LayoutDashboard, Upload } from "lucide-react";
import { ImportJobs } from "./screens/ImportJobs";
import { OperationsDashboard } from "./screens/OperationsDashboard";

const dashboardPath = "/operations";
const importsPath = "/operations/imports";

export const appNavigation: Navigation = [
  {
    label: "Operations",
    items: [
      { label: "Dashboard", to: dashboardPath, icon: LayoutDashboard },
      { label: "Imports", to: importsPath, icon: Upload },
    ],
  },
];

export const appHomeRoute = (
  <Route index element={<Navigate to={dashboardPath} replace />} />
);

export const appPublicRoutes = (
  <>
    {/* Public pages go here only when their data is intentionally public. */}
  </>
);

export const appProtectedRoutes = (
  <>
    <Route path="operations" element={<OperationsDashboard />} />
    <Route path="operations/imports" element={<ImportJobs />} />
  </>
);
```

Protected routes automatically render inside the app shell and after the schema
and auth context have loaded. Public routes do not. Keep public pages limited to
marketing pages, invitation flows, or intentionally public data.

For data screens, prefer existing Sapporta primitives before building a local
fetch-and-table loop:

- Use built-in table routes for ordinary record browsing and editing.
- Use `SchemaTableGridView` when you want a schema table on a custom app route.
- Use report components for route-based reports.
- Use typed app API clients for app-owned features that need custom backend
  behavior.

## Build forms

Build forms with `@sapporta/ui` controls so inputs match the generated table,
report, and shell screens. Keep the form state shaped like the request you will
send to a built-in table API or typed custom endpoint.

```tsx
import { useState } from "react";
import {
  Button,
  Checkbox,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@sapporta/ui";

export function InvoiceForm({
  onSubmit,
}: {
  onSubmit(input: {
    invoiceDate: string;
    status: "draft" | "sent";
    subtotal: number | null;
    taxable: boolean;
  }): Promise<void>;
}) {
  const [invoiceDate, setInvoiceDate] = useState("");
  const [status, setStatus] = useState<"draft" | "sent">("draft");
  const [subtotal, setSubtotal] = useState<number | null>(null);
  const [taxable, setTaxable] = useState(false);

  return (
    <form
      className="space-y-5"
      onSubmit={async (event) => {
        event.preventDefault();
        await onSubmit({
          invoiceDate,
          status,
          subtotal,
          taxable,
        });
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="invoice-date">Invoice date</Label>
        <Input
          id="invoice-date"
          type="date"
          value={invoiceDate}
          onChange={(event) => setInvoiceDate(event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Status</Label>
        <Select
          value={status}
          onValueChange={(value) => setStatus(value as "draft" | "sent")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subtotal">Subtotal</Label>
        <Input
          id="subtotal"
          type="number"
          step="0.01"
          value={subtotal ?? ""}
          onChange={(event) =>
            setSubtotal(event.target.value ? Number(event.target.value) : null)
          }
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={taxable}
          onCheckedChange={(checked) => setTaxable(checked === true)}
        />
        Taxable
      </label>

      <Button type="submit">Save invoice</Button>
    </form>
  );
}
```

Use the control that matches the data:

| Data                           | Control                                                                                         |
| ------------------------------ | ----------------------------------------------------------------------------------------------- |
| Short text                     | `Input type="text"`                                                                             |
| Long text                      | `<textarea>` styled with the same input classes used locally                                    |
| Number, currency, percentage   | `Input type="number"` with parsing at the state boundary                                        |
| Date                           | `Input type="date"`                                                                             |
| Timestamp                      | `Input type="datetime-local"` plus Sapporta temporal helpers when canonical wire format matters |
| Boolean                        | `Checkbox` or `Switch`                                                                          |
| Short fixed option set         | `Select`                                                                                        |
| Foreign key or long option set | Base UI `Combobox` primitives                                                                   |

Sapporta re-exports the Base UI `Combobox` namespace and provides shared theme
classes:

```tsx
import { Combobox, comboboxClassNames } from "@sapporta/ui/combobox";
```

Use the [Base UI Combobox documentation](https://base-ui.com/react/components/combobox)
for composition, accessibility, filtering, controlled state, and the API
reference. Apply matching `comboboxClassNames` entries to use Sapporta's default
styling. Foreign-key forms can keep an ID in form state and translate between
that ID and the selected item object at the combobox boundary.

In auth-enabled apps, do not add hidden inputs for `workspace_id`,
`workspaceId`, `scoped_to_user_id`, or `scopedToUserId`. Do not submit columns
marked `clientEditable: false`. Let the server resolve the current user and
workspace, then stamp or guard scoped rows through Sapporta's backend helpers.

## Build dashboards

Dashboards should help users decide what to do next. Keep them focused: a small
set of metrics, links into the relevant work queues, and actions that call typed
application APIs.

```tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge, Button } from "@sapporta/ui";
import { RefreshCw } from "lucide-react";
import { operationsApi } from "../api";

type DashboardState =
  | { kind: "loading" }
  | { kind: "ready"; openOrders: number; blockedJobs: number }
  | { kind: "error"; message: string };

export function OperationsDashboard() {
  const [state, setState] = useState<DashboardState>({ kind: "loading" });

  async function load() {
    setState({ kind: "loading" });
    try {
      const summary = await operationsApi.summary();
      setState({
        kind: "ready",
        openOrders: summary.openOrders,
        blockedJobs: summary.blockedJobs,
      });
    } catch (error) {
      setState({
        kind: "error",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <main className="space-y-6 p-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Operations</h1>
          <p className="text-sm text-sap-muted">
            Current workload and exceptions.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={() => void load()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </header>

      {state.kind === "loading" && <p className="text-sap-muted">Loading...</p>}
      {state.kind === "error" && (
        <p className="text-destructive">{state.message}</p>
      )}
      {state.kind === "ready" && (
        <section className="grid gap-4 md:grid-cols-2">
          <Link
            to="/tables/orders?status=open"
            className="rounded-md border border-sap-border bg-sap-sidebar p-4"
          >
            <div className="text-sm text-sap-muted">Open orders</div>
            <div className="mt-2 text-3xl font-semibold">
              {state.openOrders}
            </div>
          </Link>

          <Link
            to="/operations/imports"
            className="rounded-md border border-sap-border bg-sap-sidebar p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-sap-muted">Blocked jobs</span>
              {state.blockedJobs > 0 && (
                <Badge variant="destructive">Review</Badge>
              )}
            </div>
            <div className="mt-2 text-3xl font-semibold">
              {state.blockedJobs}
            </div>
          </Link>
        </section>
      )}
    </main>
  );
}
```

Use typed clients from `packages/frontend/src/api.ts` for dashboard data that
comes from custom endpoints:

```ts
import { createApiClient } from "@sapporta/shared/client";
import { getApiBase } from "@sapporta/frontend/platform";
import { operationsContract } from "my-app-shared";

export const operationsApi = createApiClient(operationsContract, {
  baseUrl: getApiBase,
});
```

Pass `getApiBase` itself, not `getApiBase()`. Contract methods return the 2xx
body and throw `ApiError` for non-2xx responses, so preserve the server's error
body when showing validation or permission failures.

For dashboard tables, use the same decision path as full pages:

- Link to built-in `/tables/<table>` routes when the table view is enough.
- Use `SchemaTableGridView` inside the dashboard when users need the actual
  editable table surface there.
- Use a report route or report component for readonly summaries with totals and
  drill-through links.
- Use standalone Sapporta Grid only when the dashboard owns row shape, loading
  behavior, hierarchy, editing rules, side panels, toolbar behavior, and data
  transport.

## Use the app shell

`SapportaApp.tsx` wires the generated shell:

```tsx
<AuthGate>
  <BootLoader>
    <AppShell navigation={appNavigation} showFrameworkNavigation={isOwner} />
  </BootLoader>
</AuthGate>
```

Most apps do not need to edit this file. Add builder-owned routes and navigation
in `App.tsx`; the shell combines your sections with framework table navigation.
Generated apps hide framework table navigation from non-owner workspace users by
passing `showFrameworkNavigation={isOwner}`.

Navigation is a list of sections. Each item needs a label and route, and can
include a lucide icon.

```tsx
import type { Navigation } from "@sapporta/frontend/shell";
import { BarChart3, ClipboardList } from "lucide-react";

export const appNavigation: Navigation = [
  {
    label: "Workspaces",
    items: [
      { label: "Queue", to: "/work/queue", icon: ClipboardList },
      { label: "Scorecard", to: "/work/scorecard", icon: BarChart3 },
    ],
  },
];
```

The active state is based on `location.pathname.startsWith(item.to)`, so choose
stable route prefixes. For example, `/work` is a good parent for `/work/queue`,
`/work/queue/:id`, and `/work/scorecard`.

Workspace-aware screens should read data through the same protected APIs as the
rest of the app. Built-in table routes apply row visibility server-side. Custom
endpoints must resolve auth at the route edge and use scoped row helpers or row
security. `fixedFilters`, hidden fields, and URL params can shape a view, but
they are not authorization.

## Use UI components

Sapporta frontend code uses React, Vite, Tailwind, `@sapporta/ui`, shadcn/ui
conventions, Base UI primitives, and lucide icons. Prefer the exported Sapporta
UI components before introducing local component libraries.

Common imports:

```tsx
import {
  Badge,
  Button,
  Checkbox,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Switch,
} from "@sapporta/ui";
```

Use components by intent:

| Need                                         | Component               |
| -------------------------------------------- | ----------------------- |
| Primary or secondary command                 | `Button` with `variant` |
| Status, category, count, or exception marker | `Badge`                 |
| Text, number, date, and timestamp fields     | `Input`                 |
| Binary field in a form                       | `Checkbox`              |
| Binary setting or preference                 | `Switch`                |
| Short fixed option set                       | `Select`                |
| Searchable picker over IDs and labels        | `Combobox` primitives   |
| Small contextual controls                    | `Popover`               |
| Detail drawer, editor, or review panel       | `Sheet`                 |

Use the Sapporta design tokens already present in generated screens:
`bg-sap-surface`, `bg-sap-sidebar`, `text-sap-fg`, `text-sap-muted`,
`text-sap-data`, `border-sap-border`, and `text-destructive`.

```tsx
import {
  Button,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@sapporta/ui";
import { Pencil } from "lucide-react";

export function ReviewPanel({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange(open: boolean): void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Review job</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <p className="text-sm text-sap-muted">
            Check the imported rows before approving the job.
          </p>
          <Button type="button">
            <Pencil className="mr-2 h-4 w-4" />
            Approve
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

For custom table and grid screens, stay on the highest-level Sapporta primitive
that fits:

- `SchemaTableGridView` for a normal schema table on an app route.
- `buildSchemaTGridConfig` and `defineTGrid` when the schema table is right but
  columns, renderers, filters, row interaction, or save behavior need product
  logic.
- `useTableGrid` and `TGrid` when the route still uses table row plumbing but
  the visible table surface itself is custom.
- Standalone Sapporta Grid when the screen owns its row model, data source,
  persistence, filters, pagination, export, and backend transport rather than
  using Sapporta table APIs.

For a standard schema table route, load table metadata from the schema store and
let `SchemaTableGridView` keep toolbar, filters, pagination, lookup labels, URL
state, loading states, error states, saving, and CSV export.

```tsx
import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  SchemaTableGridView,
  type SchemaTableGridViewSource,
} from "@sapporta/frontend";
import { useSchemaStore } from "@sapporta/frontend/schema";

export function InvoicesRoute() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const table = useSchemaStore((state) =>
    state.tables.find((candidate) => candidate.name === "invoices"),
  );
  const tables = useSchemaStore((state) => state.tables);
  const source = useMemo<SchemaTableGridViewSource | null>(() => {
    if (!table) return null;
    return {
      table,
      tablesByName: Object.fromEntries(
        tables.map((schema) => [schema.name, schema]),
      ),
    };
  }, [table, tables]);

  if (!source) return null;

  return (
    <SchemaTableGridView
      source={source}
      route={{ path: "/invoices", searchParams, navigate }}
      registerAs="invoices"
      onNewRecord={() => navigate("/invoices/new")}
    />
  );
}
```

Reach for lower-level grid APIs only when you need to own behavior that the
schema table route should not own. When you use the standalone package directly,
follow [Core Model](/grid/docs/core-model/) for runtime ownership and lifecycle
rules.
