---
title: "Generated lookups and CSV export"
description:
  "Use row-scoped lookup search, selected-ID rehydration, and streaming CSV
  export for a registered table."
---

Lookup and export are specialized reads on the same registered table. Both
require the table's read authority and apply its row predicate, but they serve
different clients.

## Search and rehydrate lookup values

Lookup values preserve the target primary-key type:

```json
{
  "entries": [
    {
      "value": 1,
      "label": "Website Relaunch",
      "meta": { "id": 1, "name": "Website Relaunch" }
    }
  ]
}
```

`meta` contains visible source-row fields and is not invariantly empty. Lookup
has two separate modes:

- Search mode supplies picker candidates with optional `q`, visible `fields`,
  and a bounded `limit`.
- ID mode uses `ids=1,2` to recover values a form already selected.

ID mode accepts a non-empty bounded list and cannot be mixed with search
parameters. Rehydrating a saved value therefore cannot quietly become a broad
candidate search. A lookup on Projects returns only projects visible to the
caller.

Search on `/_lookup` uses the lookup's displayed fields. It is separate from the
recursive table-search plan configured for list and export.

## Export the active table selection

CSV export follows the active typed filters, table search, sort, ability, and
row scope. It is unpaginated but does not collect every row in memory: the
server streams one deterministic SQLite cursor and read snapshot, then releases
the cursor when the response finishes or is cancelled.

The generated table screen exports its active query instead of silently
exporting all visible rows. A rejected filter must remain an error; dropping it
would broaden the exported selection.

## Related documentation

- [Generated table APIs](/docs/guides/generated-surfaces/generated-table-apis/)
- [Filtering, sorting, search, and pagination](/docs/guides/generated-surfaces/filtering-sorting-search-and-pagination/)
- [Use table search](/docs/guides/model-data/use-table-search/)
- [Table endpoints](/docs/reference/http/table-endpoints/)
