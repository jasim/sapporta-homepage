---
title: "Configure table search"
description:
  "Configure default, focused, disabled, and recursive relationship search in
  Sapporta table metadata."
---

Every Sapporta table is searchable by default. As soon as you register a table,
the generated table screen shows a search field and the list API accepts `q`.
You do not need to repeat the visible columns in metadata to get that first
useful search:

```ts
export const books = sapportaTable({
  drizzle: booksTable,
  meta: {
    label: "Books",
    rowScope: "workspaceGlobal",
    rowLabelColumns: ["title"],
  },
});
```

This default is equivalent to `search: "allColumns"`. It searches the book's
primary key and visible application columns. If one of those columns is a
foreign key, Sapporta searches the referenced row's label instead of the stored
ID. It does not walk into has-many children unless you ask it to.

## Choose what represents the root row

The `meta.search` API accepts three useful shapes:

```ts
type SearchSelf = false | "allColumns" | readonly string[];

type TableSearch =
  | false
  | "allColumns"
  | {
      self?: SearchSelf;
      children?: Readonly<Record<string, TableSearch>>;
    };
```

Use a `self` array when a broad search would include values people are unlikely
to remember. The names are public SQL column names:

```ts
search: {
  self: ["id", "title", "isbn", "author_id"],
},
```

This searches the stored `id`, `title`, and `isbn`. If `author_id` references
Authors and that table declares `rowLabelColumns: ["first_name", "last_name"]`,
the book search compares the term with a label such as `Jane Doe`. It never
searches the raw `author_id`.

`"allColumns"` includes the primary key and ordinary visible application
columns, but excludes `visuallyHidden` columns and system-managed ownership
fields. An explicit `self` array may include a visually hidden application
column when it genuinely represents the row. Ownership fields cannot be made
searchable.

## Add has-many relationships deliberately

Add remembered values stored in child rows under `search.children`:

```ts
export const books = sapportaTable({
  drizzle: booksTable,
  meta: {
    label: "Books",
    rowScope: "workspaceGlobal",
    rowLabelColumns: ["title"],
    children: [
      {
        table: "book_codes",
        foreignKey: "book_id",
        label: "Codes",
      },
    ],
    search: {
      self: ["id", "title", "isbn", "author_id"],
      children: {
        book_codes: {
          self: ["code", "language_id"],
        },
      },
    },
  },
});
```

The `book_codes` key is the child table's SQL name. It must identify exactly one
relationship already declared in the current table's `meta.children`. The child
foreign key must be a real Drizzle foreign key, or an explicit Sapporta
reference, to the current table's primary key.

The child node follows the same value rules as the root. Ordinary values search
their stored representation; foreign keys search the referenced row label.
Children can continue through their own explicitly declared children:

```ts
search: {
  self: ["id", "title", "isbn", "author_id"],
  children: {
    book_codes: {
      self: ["code", "language_id"],
      children: {
        code_usages: "allColumns",
      },
    },
  },
},
```

Traversal is recursive but never implicit. `"allColumns"` searches one node; it
does not descend into that node's children. To keep a relationship path while
excluding the intermediate table's own values, use `self: false`:

```ts
search: {
  children: {
    book_codes: {
      self: false,
      children: {
        code_usages: "allColumns",
      },
    },
  },
},
```

An object defaults `self` to `"allColumns"`, so a configuration containing only
`children` still searches the current table.

## Disable search or narrow it safely

Set `search: false` when free-text search has no useful meaning:

```ts
meta: {
  label: "Exchange rates",
  rowScope: "systemGlobal",
  rowLabelColumns: ["currency_code"],
  search: false,
},
```

The generated table screen hides its search control. A non-empty `q` sent to the
list or export route returns `400 no_search_config`; it is not silently ignored.
Another table may still reach this table through an explicitly configured child
path.

Invalid configurations fail while the project loads. Sapporta rejects unknown
`self` columns, ownership fields, empty column arrays, unresolved references,
missing row-label columns, undeclared or ambiguous child names, incorrect child
foreign keys, and cyclic configuration objects. A finite path may revisit the
same table as long as the JavaScript configuration object itself is not cyclic.
Use `self: false`, not `self: []`.

Changing only `meta.search` does not change SQLite storage and needs no
migration. Adding an index for the relationship path does.

## Related documentation

- [Use table search](/docs/guides/model-data/use-table-search/)
- [Relational search semantics and security](/docs/guides/model-data/relational-search-semantics-and-security/)
- [Index relational search paths](/docs/guides/model-data/index-relational-search-paths/)
- [Relationships and lookup behavior](/docs/guides/model-data/relationships-and-lookup-behavior/)
- [Table and column metadata](/docs/reference/schema/table-and-column-metadata/)
