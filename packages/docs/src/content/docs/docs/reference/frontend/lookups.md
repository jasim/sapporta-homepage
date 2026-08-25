---
title: "Table lookups and record ids"
description:
  "Look up scoped table lookup capabilities, LookupPicker typing, lookup value
  identity, and the RecordId address boundary."
---

## Identity

`@sapporta/frontend/lookup`, `@sapporta/grid/lookup`, and
`@sapporta/shared/record-id`.

## Contract

- `useLookupStore()` creates one lookup store for a screen.
  `useTableLookup(tableName)` returns the `LookupCapabilities` for one table
  from that store.
- `LookupPicker` renders a scoped picker over those capabilities. It owns remote
  search, selected-label loading for an entry outside the current search page,
  lookup cache subscriptions, `null` clearing, disabled and invalid states, and
  keyboard behavior.
- Both are generic over the target table's primary-key type, which extends
  `LookupValue` (`string | number`).
- `LookupEntry` objects are the picker's items and its Base UI selected value.
  Application code translates at the domain boundary with
  `pickedEntry?.value ?? null`.

## Parameterize the hook and the picker together

`useTableLookup<TValue>` and `LookupPicker<TValue>` take the same type argument,
matched to the table's primary key:

```tsx
import { LookupPicker, useTableLookup } from "@sapporta/frontend/lookup";

const accountLookup = useTableLookup<number>("accounts");

<LookupPicker<number>
  id="account-id"
  lookup={accountLookup}
  value={accountId}
  onChange={setAccountId}
  placeholder="Select account"
  allowClear
  ariaInvalid={Boolean(issue)}
/>;
```

Supply the parameter in both places or in neither. `useTableLookup("accounts")`
returns capabilities over `string | number`, which does not satisfy
`LookupPicker<number>`. Omitting both parameters keeps the value
`string | number`, which suits a call site where the key type is not known.

The store is key-agnostic at runtime, so the parameter is an assertion about the
column rather than a conversion.

## Cross to an address with `toRecordId`

A lookup id and a `RecordId` are separate types. Lookup entries carry the id as
the database column typed it, so an INTEGER primary key arrives as a JS number.
`RecordId` is that value in an address position — a URL path segment, a query
key, a grid row key — and is always a string, because those transports carry
only strings.

Component state holds the lookup id in its own type. `toRecordId()` marks each
crossing into an address:

```tsx
import { toRecordId } from "@sapporta/shared/record-id";
import { tableRecordQueryOptions } from "@sapporta/frontend/table/query";

const account = useQuery(
  tableRecordQueryOptions({
    tableName: "accounts",
    recordId: toRecordId(accountId),
  }),
);
```

`toRecordId()` accepts `string | number` and returns `RecordId`. It names the
boundary that a bare `String()` leaves unmarked, and it holds for INTEGER and
UUID primary keys alike.

## Compare lookup values by type and value

`lookupValueEquals()` performs item equality and `lookupValueKey()` produces
React keys. Both tag the value with its runtime type:

```ts
lookupValueKey(value); // `${typeof value}:${String(value)}`
```

The number `1` and the string `"1"` therefore produce different keys and never
compare equal. A numeric id that has been widened to a string stops matching its
own lookup entry, which is the failure `toRecordId()` at an explicit boundary
prevents.

## Related documentation

- [Relationships and lookup behavior](/docs/guides/model-data/relationships-and-lookup-behavior/)
- [Generated lookups and CSV export](/docs/guides/generated-surfaces/generated-lookups-and-csv-export/)
- [Custom forms and validation](/docs/guides/application-code/custom-forms-and-validation/)
- [Table query options](/docs/reference/frontend/table-query-options/)
- [Server write values and contracts](/docs/reference/schema/semantic-values/server-write-values-and-contracts/)
