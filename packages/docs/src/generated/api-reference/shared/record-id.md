---
title: "@sapporta/shared/record-id"
package: "@sapporta/shared"
version: "0.3.1"
specifier: "@sapporta/shared/record-id"
---

> Sapporta API reference for `@sapporta/shared@0.3.1`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/shared/record-id

Import from `@sapporta/shared/record-id`. Documented from `@sapporta/shared@0.3.1`; confirm the installed version with `node -p "require('@sapporta/shared/package.json').version"`.

2 symbols documented here.

## Types (1)

### RecordId

A primary-key value in an address position — URL path segment, query key, grid row key.

```ts
type RecordId = string;
```

## Functions and components (1)

### toRecordId

Convert a database-native id (`LookupValue`, FK cell value) to an address.

```ts
function toRecordId(value: string | number): RecordId;
```
