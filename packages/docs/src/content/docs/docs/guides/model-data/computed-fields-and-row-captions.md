---
title: "Computed fields and row captions"
description:
  "Declare values that the server computes for each row when a read asks for
  them, such as an account's parent path, and name the text that is shown
  under a row's label."
---

A computed field is a named value of each row that the server computes when a
read asks for it. For example, an account can have a parent path such as
"Expenses > Kitchen", and an item can have its stock on hand. A computed field
is not a column: it is not stored, it cannot be written, and it is not part of
the row object. A read names the fields it wants in its `computed` parameter,
and the response carries their values beside the rows.

`meta.rowCaption` names a column or computed field whose text is shown under a
row's label, such as the parent path under an account's name. Pickers, editor
options, and the record sheet show the caption, so two rows with the same name
can be told apart.
[Show rows with their captions and display slots](/docs/guides/generated-surfaces/row-captions-and-display-slots/)
describes where the caption appears in the browser.

## Give a tree table a parent path

`treePath()` is a computed field that Sapporta provides for tables with
`meta.tree`. It gives each row the labels of its ancestors, from the top down.
The accounts table from
[Show a table as a tree](/docs/guides/model-data/show-a-table-as-a-tree/)
declares it and uses it as the caption:

```ts
// packages/api/schema/accounts.ts
import { sapportaTable, treePath } from "@sapporta/server/table";

export const accounts = sapportaTable({
  drizzle: accountsTable,
  meta: {
    label: "Accounts",
    rowScope: "workspaceGlobal",
    rowLabelColumns: ["name"],
    tree: { parentColumn: "parent_id", path: "parentPath" },
    rowCaption: "parentPath",
  },
  computed: {
    parentPath: treePath(),
  },
});
```

`tree.path` names the field for the table's tree pickers, which draw a chosen
account as "Expenses > Kitchen > Groceries", with the path before the name.
`rowCaption` draws the path under the name everywhere else.

An account named Groceries under Kitchen under Expenses has the parent path
"Expenses > Kitchen". A top-level account has no parent path, so its value is
`null`. Each ancestor is named by its row label, the non-empty
`rowLabelColumns` values joined by a space.

`treePath()` takes three options:

| Option      | Default                                | Sets                                          |
| ----------- | -------------------------------------- | --------------------------------------------- |
| `separator` | `" > "`                                | the text placed between two ancestors' labels |
| `column`    | the row label                          | one column whose value names each ancestor    |
| `label`     | the field name in sentence case        | the display label, such as "Parent path"      |

The walk reads only rows that the request may see. A path therefore stops at the
nearest ancestor that the request cannot see, and it never names that ancestor.
For example, when Expenses is hidden from a user, that user sees "Kitchen" as
the parent path of Groceries. A loop in the parent data ends the walk.

A computed field changes no storage, so declaring one needs no migration.

## Declare your own computed field

`computedField()` declares a field with a `kind` and a `load` function. The
following field gives each project the number of its tasks that are not
completed:

```ts
// packages/api/schema/projects.ts
import { and, inArray, ne } from "drizzle-orm";
import { z } from "zod";
import { scopedRows } from "@sapporta/server";
import { computedField, sapportaTable } from "@sapporta/server/table";
import { toRecordId, type RecordId } from "@sapporta/shared/record-id";
import { tasks, tasksTable } from "./tasks.js";

export const projects = sapportaTable({
  drizzle: projectsTable,
  meta: {
    label: "Projects",
    rowScope: "workspaceGlobal",
    rowLabelColumns: ["name"],
  },
  computed: {
    openTasks: computedField({
      kind: "number",
      schema: z.number(),
      notes: "Tasks of the project that are not completed.",
      load: async ({ ids, db, auth }) => {
        const counts = new Map<RecordId, number>(ids.map((id) => [id, 0]));
        if (ids.length === 0) return counts;
        const groups = await scopedRows(db, auth, tasks).countBy({
          column: tasksTable.project_id,
          where: and(
            inArray(tasksTable.project_id, ids.map(Number)),
            ne(tasksTable.status, "completed"),
          ),
          limit: ids.length,
        });
        for (const group of groups) {
          counts.set(toRecordId(group.value as number), group.count);
        }
        return counts;
      },
    }),
  },
});
```

`tasks` is used only inside `load`, so `projects.ts` and `tasks.ts` can import
each other.

The field takes these properties:

| Property | Required | Meaning                                                                       |
| -------- | -------- | ----------------------------------------------------------------------------- |
| `kind`   | yes      | `"text"`, `"number"`, `"boolean"`, `"date"`, `"timestamp"`, or `"json"`       |
| `load`   | yes      | computes the values for a batch of rows                                       |
| `schema` | no       | a Zod schema that every value except `null` must match                        |
| `label`  | no       | the display label; defaults to the name in sentence case, "Open tasks"        |
| `notes`  | no       | text that explains the value, listed in the table metadata and in OpenAPI     |

`kind` chooses how a value is formatted, such as a number with digit grouping.
`"json"` covers any value that is not one scalar, such as a list of numbers for
a small chart. `schema` documents the value in the generated OpenAPI, and its
TypeScript type becomes the type of the values that `load` returns.

A field name starts with a letter or `_` and contains only letters, digits, and
`_`. It cannot be the name of a column of the same table, so a name in a request
or in `rowCaption` always means one thing. `sapportaTable()` throws when a name
breaks these rules.

## Write the loader

`load` receives one batch of rows and returns a map from each row id to its
value. The batch has these members:

| Member  | Contents                                                                       |
| ------- | ------------------------------------------------------------------------------ |
| `ids`   | the primary keys of the rows, as strings, in the order the read returned them |
| `table` | the table definition whose rows these are                                      |
| `db`    | the request's database handle                                                  |
| `auth`  | the request's auth context                                                     |
| `once`  | `once(key, compute)` runs `compute` once per batch and shares its result       |

The batch carries ids only. Read the rows themselves, or rows of other tables,
through `scopedRows(batch.db, batch.auth, table)`, or through a Drizzle query
filtered by `auth.rowSecurity.forTable(table).ownedRows(...)`. A value computed
this way never comes from a row that the request may not read.

The returned map has these rules:

- Every id of the batch must have an entry. `null` is the only way to say that
  a row has no value.
- The keys are the ids as the batch gives them, which are strings. A numeric
  primary key arrives as `"12"`, so `ids.map(Number)` converts the ids for a
  query, and `toRecordId(value)` converts a number back into a key.
- A loader may return the map directly or as a promise.

A loader runs inside reads, including the lookups that a picker sends while a
person types. It must not write, and it should answer a whole batch with one or
two queries.

### Share work between fields

Two fields that come from one query share it through `once()`. In this example,
`buyVolume` and `sellVolume` both call `volumes()`, and the scan of trades runs
once per request:

```ts
import type { ComputedBatch } from "@sapporta/server";

function volumes(batch: ComputedBatch) {
  return batch.once("volumes", () => loadVolumes(batch.db, batch.auth, batch.ids));
}

computed: {
  buyVolume: computedField({
    kind: "number",
    load: async (batch) => {
      const all = await volumes(batch);
      return new Map(batch.ids.map((id) => [id, all.get(id)?.buy ?? null]));
    },
  }),
  sellVolume: computedField({
    kind: "number",
    load: async (batch) => {
      const all = await volumes(batch);
      return new Map(batch.ids.map((id) => [id, all.get(id)?.sell ?? null]));
    },
  }),
},
```

A field that is built from another field's values uses the same pattern: both
fields call one function through `once()`.

### Failures fail the read

A loader that throws, a map that leaves out an id, or a value that its `schema`
rejects fails the whole read. The generated API then answers HTTP `500`. For
this reason a read never returns values that look complete but are not.

## Show a caption under the label

`meta.rowCaption` names one column or computed field of the table. Its text is
shown under the row's label:

```ts
meta: {
  rowLabelColumns: ["name"],
  rowCaption: "parentPath",
},
```

A caption can also be a plain column, such as `rowCaption: "code"` for an
account code. `sapportaTable()` throws when `rowCaption` names neither a column
nor a computed field.

A computed caption is formatted by its field's `kind`: a number with digit
grouping, a boolean as "Yes" or "No", and a `"json"` value as JSON text. A
`null` or empty value shows no caption.

The browser receives the computed fields and the caption in the table schema:
`TableSchema.computed` lists each field's `name`, `label`, `kind`, and `notes`,
and `TableSchema.rowCaption` holds the caption's name. The loaders and schemas
stay on the server.

## Ask for computed fields in a read

Every row read of the generated table API takes `computed`, a comma-separated
list of field names:

```http
GET /api/tables/accounts?q=kitchen&computed=parentPath
```

The response carries `computed` beside the rows. It maps each field name to the
returned row ids and their values:

```json
{
  "data": [{ "id": 12, "name": "Groceries", "parent_id": 7 }],
  "meta": { "total": 1, "page": 1, "limit": 50, "pages": 1 },
  "computed": { "parentPath": { "12": "Expenses > Kitchen" } }
}
```

The list read (including tree reads and child-level reads), the single-row read,
and the lookup all accept `computed`. Rows stay ordinary rows, so grids, forms,
CSV export, and writes see the same row shape with or without computed fields.
Create and update compute nothing. A name that the table does not declare
returns HTTP `400` with the code `unknown_computed_field`.

The CLI passes the same parameter through the raw API command:

```bash
pnpm exec sapporta api get /api/tables/accounts \
  --query '{"computed":"parentPath","limit":"5"}'
```

In the browser, `fetchTableRows()` and `tableRecordsPageQueryOptions()` take
`computed: ["parentPath"]`, and the page they return carries the same
`computed` member.
[Table endpoints](/docs/reference/http/table-endpoints/#computed-fields) lists
the exact shapes.

## Compute fields in your own endpoint

`computeFields()` runs the same loaders from application code. Pass ids of rows
that the request may read, such as the rows a scoped read just returned:

```ts
import { computeFields, scopedRows } from "@sapporta/server";
import { toRecordId } from "@sapporta/shared/record-id";

const overdue = await scopedRows(db, auth, invoices).findMany({
  where,
  limit: 100,
});
const balances = await computeFields({
  db,
  auth,
  table: customers,
  ids: [...new Set(overdue.map((invoice) => toRecordId(invoice.customer_id)))],
  names: ["balance"],
});
// balances.balance["7"] is customer 7's balance, or null.
```

`computeFields()` applies the same rules as the generated API: every id gets a
value, and a failing field fails the call. It does not check that the request
may read the ids it is given, so build the id list from scoped reads.

## Read tree paths in raw SQL

Reports and other code that runs synchronous SQL cannot call the asynchronous
`treePath()` loader. `treePathRelation()` gives the same paths as a member of a
`with recursive` list:

```ts
import { sql } from "drizzle-orm";
import { treePathRelation } from "@sapporta/server";

const paths = treePathRelation(accounts, auth);
const rows = db.all<{ id: number; name: string; parent_path: string | null }>(
  sql`with recursive ${paths}
      select a.id, a.name, p.parent_path
      from accounts a
      join tree_paths p on p.id = a.id
      order by p.path`,
);
```

The relation is named `tree_paths` and has three columns:

| Column        | Value                                                                      |
| ------------- | -------------------------------------------------------------------------- |
| `id`          | the row's primary key                                                      |
| `parent_path` | the ancestors' labels from the top down, or `NULL` for a row with no visible parent |
| `path`        | `parent_path`, the separator, and the row's own label; or the label alone  |

The relation contains only rows that `auth` may see, so the join above also
limits `accounts` to visible rows. A path stops at the nearest ancestor that the
request cannot see, as a `treePath()` path does. The labels follow the same rule
as `treePath()`: the non-empty label columns joined by a space, with a whole
number printed as `4` and not `4.0`.

Rows in a loop of parents that never reaches a top-level row have no row in the
relation, and neither do the rows under them.

The options are `name`, which renames the relation, `separator` (`" > "` by
default), and `column`, which names each row by one column instead of its label.
To combine the relation with other members, list them after it:
`` sql`with recursive ${paths}, visible_lines as (...) select ...` ``.
[Computed fields and tree paths](/docs/reference/server/row-scoped-data/computed-fields-and-tree-paths/#treepathrelation)
describes the options and the SQL contract.

## Related documentation

- [Show rows with their captions and display slots](/docs/guides/generated-surfaces/row-captions-and-display-slots/)
- [Name table rows in report cells](/docs/guides/reports/report-reference-columns/)
- [Table definitions](/docs/reference/schema/table-definitions/#computed-fields)
- [Computed fields and tree paths](/docs/reference/server/row-scoped-data/computed-fields-and-tree-paths/)
- [Table endpoints](/docs/reference/http/table-endpoints/#computed-fields)
- [Show a table as a tree](/docs/guides/model-data/show-a-table-as-a-tree/)
