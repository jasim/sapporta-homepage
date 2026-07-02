---
title: "Filter Syntax"
description:
  "Lookup generated table filter operators, value parsing, search, sort,
  pagination, and bad filter behavior."
---

## Filter syntax reference

Generated table list and export routes use a strict query grammar:

```text
filter[col][op]=value
```

`filter[col]=value` is invalid. Unknown columns, unknown operators, malformed
values, and malformed filter keys return `400`; Sapporta does not silently
ignore bad filters.

| Operator                 | Applies to      | Meaning                                  | Example                               |
| ------------------------ | --------------- | ---------------------------------------- | ------------------------------------- |
| `eq`, `neq`              | scalar values   | Equal / not equal                        | `filter[status][eq]=active`           |
| `gt`, `gte`, `lt`, `lte` | ordered values  | Greater/less comparisons                 | `filter[amount][gte]=100`             |
| `in`, `nin`              | scalar values   | CSV membership                           | `filter[id][in]=1,2,3`                |
| `contains`               | text            | Substring match                          | `filter[name][contains]=cash`         |
| `startswith`             | text            | Prefix match                             | `filter[code][startswith]=EXP`        |
| `endswith`               | text            | Suffix match                             | `filter[email][endswith]=example.com` |
| `is`                     | nullable values | Null check; value is `null` or `notnull` | `filter[parent_id][is]=null`          |

Value parsing follows the column kind:

| Kind        | Accepted filter values                                         |
| ----------- | -------------------------------------------------------------- |
| `text`      | Any string. Empty string is a real value.                      |
| `number`    | Finite JavaScript number strings, such as `42` or `19.95`.     |
| `boolean`   | `true` or `false`.                                             |
| `date`      | ISO calendar date, `YYYY-MM-DD`.                               |
| `timestamp` | Canonical ISO instant accepted by Sapporta's timestamp parser. |

For non-text kinds, an empty string parses as `null`. `in` and `nin` take a
comma-separated list and reject empty lists or empty items. `contains`,
`startswith`, and `endswith` escape `%` and `_` so user input matches literally.

Search uses `q=<term>` and requires `meta.search.columns` on the table. It
matches any configured search column and combines with filters using `AND`.
Empty or whitespace-only `q` is ignored.

Sort and paginate with:

```text
sort=created_at,-id
page=1
limit=50
```

`page` is 1-based. `limit` defaults to `50` and must be between `1` and `1000`.

Common query error codes include `unknown_filter_shape`, `unknown_column`,
`unknown_op`, `op_not_applicable`, `bad_value`, `bad_limit`, `bad_page`,
`no_search_config`, and `unknown_search_column`.
