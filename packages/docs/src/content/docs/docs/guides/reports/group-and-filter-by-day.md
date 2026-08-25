---
title: "Group and filter by day"
description:
  "Bound a report to a range of days and bucket its rows by local day, in the
  active workspace's time zone."
---

A report that names a day answers a calendar question about instants stored in
UTC. Two operations turn one into the other: bounding a query to the days a
reader named, and grouping rows by the day each one falls on. Both take the zone
from the workspace the request already resolved.

```ts
const zone = workspaceTimeZone(c.get("auth"));
```

## Bound a range of days

`resolveDateRangeQueryBounds()` parses the daterange fields of a route query and
resolves them against a zone and a moment:

```ts
import { resolveDateRangeQueryBounds } from "@sapporta/shared/daterange";
import { Temporal } from "@sapporta/shared/temporal";
import { workspaceTimeZone } from "@sapporta/server";

const zone = workspaceTimeZone(auth);
const period = resolveDateRangeQueryBounds(
  "period",
  request.query,
  zone,
  Temporal.Now.instant(),
);
```

`zone` and `now` are both required. Resolving a relative range such as `7d` or
`mtd` means knowing what day it is, and that question has no zone-free answer.

The result carries both shapes a column can be compared against. Use
`period.days` for a `date` column and `period.instants` for a `timestamp`
column:

```sql
WHERE (:from  IS NULL OR issued_on  >= :from)     -- period.days
  AND (:to    IS NULL OR issued_on  <= :to)

WHERE (:from  IS NULL OR created_at >= :from)     -- period.instants
  AND (:until IS NULL OR created_at <  :until)
```

`period.state` is the `DateRangeState` the query named, for a screen that
re-renders the control the reader used.

**The instant window is half-open.** `period.instants.until` is the first moment
of the day after the range, and the comparison is `<`. An inclusive upper bound
compared against a `timestamp` column drops its own last day: every instant
stored on the 24th begins `2026-08-24T`, which sorts after a bound of
`2026-08-24`. A closed bound built from a wall clock such as `23:59:59` loses an
hour on the day a zone leaves daylight saving, because that wall clock occurs
twice. Both edges come from the first instant that exists on a local day, so the
window is exact on a day whose local midnight does not exist and on a day that
runs 23 or 25 hours.

One function returns both shapes because the two differ only in what they are
compared against, and the cost of reaching for the wrong one is a report that
silently drops a day.

## Bucket rows by local day

`to_tz_date(instant, zone)` returns the calendar day a stored instant falls on.
`connectProject` registers it on every project connection, so a Drizzle `sql`
template and a raw statement both reach it:

```sql
SELECT to_tz_date(created_at, :zone) AS day, count(*) AS n
FROM   txns
WHERE  (:from  IS NULL OR created_at >= :from)
  AND  (:until IS NULL OR created_at <  :until)
GROUP  BY day
ORDER  BY day
```

The result is exact. Each row's day is computed against the full time zone
database, so a day that runs 23 or 25 hours holds exactly its own rows.

SQLite ships no time zone database, so this function supplies Node's. It costs
about 6µs a row, some thirty times SQLite's own `date(col)`, which is the price
of crossing into JavaScript for a real zone database. **Bound the range in
`WHERE` before grouping**, so the function runs over the rows the report
returns.

`to_tz_date` is registered `directOnly`, which limits it to a plain statement. A
`CREATE INDEX`, view, trigger, `CHECK` constraint, or generated column over it
would record a JavaScript function's name in the database file, and from that
point the file is writable only by a process that has registered a function of
that name. `directOnly` turns that into an error at `CREATE INDEX` time.

The function comes from the driver, so a `sqlite3` shell reports
`unknown function: to_tz_date()`. On a database with its own zone support the
call is a one-line substitution — PostgreSQL 16's `date_trunc('day', ts, tz)`,
MySQL's `CONVERT_TZ`, BigQuery's `TIMESTAMP_TRUNC(ts, DAY, tz)` — and every call
site is found by grepping for one name.

## Name the zone on screen

A report whose numbers depend on a zone says which zone it used.
`ReportTimeZoneNote` from `@sapporta/frontend/report` renders it in the toolbar
as `Asia/Kolkata UTC+05:30`, including when the zone is UTC.

## Prove the range is zone-stable

- Run the report under two host `TZ` values and compare the results
  byte-for-byte. A relative range that reads the host clock changes its answer;
  one resolved from the workspace zone does not.
- Include a row stored in the last hour of the range's final local day, and
  assert it is present. That row is what an inclusive bound on a `timestamp`
  column drops.
- Run a range whose final day is a daylight-saving transition in the workspace
  zone, and assert the row count matches the rows the day actually holds.
- Compare a grouped `to_tz_date` total against the same rows counted through a
  bounded scoped read.

## Related documentation

- [Days and time zones](/docs/reference/server/days-and-time-zones/)
- [Route-based reports](/docs/guides/reports/route-based-reports/)
- [Scoped report data](/docs/guides/reports/scoped-report-data/)
- [Report datasets and formatting](/docs/guides/reports/report-datasets-and-formatting/)
- [Filtering, sorting, search, and pagination](/docs/guides/generated-surfaces/filtering-sorting-search-and-pagination/)
