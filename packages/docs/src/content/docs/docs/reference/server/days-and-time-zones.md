---
title: "Days and time zones"
description:
  "Look up where the workspace time zone lives, which accessor reads it, and
  how a stored instant becomes a calendar day."
---

## Identity

Workspace time zone storage, the server and browser accessors that read it, and
the temporal codecs that project a stored instant onto a calendar.

## Contract

- Timestamps are stored in UTC as fixed-width canonical text. A time zone
  decides which calendar day one of those instants falls on, and what wall
  clock it is read on.
- A day is a calendar day in the **active workspace's** time zone. The
  workspace row carries `timeZone` as an IANA identifier such as
  `Asia/Kolkata`. A fixed offset is not accepted: an offset describes one
  instant, a report describes a range, and a range can contain the moment the
  offset changes.
- The zone is a business fact of the workspace. "Revenue for August 24" names
  one set of rows for every member of that workspace.
- `workspaceTimeZone(auth)` from `@sapporta/server` is the accessor a request
  handler calls. It reads the zone the request already resolved, so no route
  declares a time zone parameter and no handler performs a lookup.
- `workspaceTimeZone()` throws for a request with no workspace — an anonymous
  public route, or one holding only `systemGlobalOnly` authority. A request
  with no workspace has no calendar, and an error is the answer rather than
  UTC.
- `appTimeZone()` from `@sapporta/frontend/platform` is the accessor a React
  screen calls. It returns a plain value with no hook and nothing asynchronous:
  the zone is published once per page load from the auth-context response the
  boot sequence already fetches, and republished when a session switches
  workspaces.
- `setDisplayTimeZone` and `displayTimeZone` from `@sapporta/grid/column-preset`
  hold the value. `@sapporta/grid` needs the zone to write a cell and does not
  import from the frontend, so there is one holder and a grid cell agrees with
  the screen around it. A date or timestamp column takes no `zone` option.
- `TimeZone` from `@sapporta/shared/temporal` is a checked identifier.
  `parseTimeZone()` checks an identifier a caller named and reports the bad
  value. `isValidTimeZone()` narrows, for a stored identifier that may have
  gone stale and whose answer is a fallback. `supportedTimeZones()` lists the
  identifiers a picker offers.
- `deviceTimeZone()` reports what the runtime says about itself, and has one
  caller: the sign-up request, which carries the browser's zone so that the
  first workspace an account creates starts on the calendar its owner keeps.
- `Temporal.Now.timeZoneId()` and `Temporal.Now.plainDateISO()` with no
  argument read the host's `TZ`. A framework test fails the build for any
  reader of an ambient zone other than `deviceTimeZone()`.
- An owner changes the workspace zone through
  `PUT /api/auth-context/workspace/time-zone`, which answers with a fresh auth
  context. Every member of the workspace reads the new calendar.
- CSV export and grid clipboard copy emit the stored UTC instant with its
  trailing `Z`. A column a downstream program keys on stays self-describing.

## Reading a stored instant

The codecs in `@sapporta/shared/temporal` take the zone as a required argument
and hold no state.

- `formatTemporalForDisplay(value, precision, zone)` renders a canonical date or
  instant as reading text — `2026-08-23` and `2026-08-23 16:38`. Precision is a
  ceiling: a plain date asked for `"minute"` stays a date. A value in neither
  canonical shape is reported as `null`, so a caller shows the text exactly as
  it arrived.
- `formatInstantForDisplay(value, zone)` and
  `describeInstantForDisplay(value, zone)` render the short and full forms. The
  full form names the offset — `2026-08-24 02:00:00 (UTC+05:30)` — so the zone a
  value was printed on is recoverable from the text.
- `formatInstantForDateInput(value, zone)` and
  `parseDateInputToInstantString(day, bound, zone)` move between a local
  calendar day and the instants that day occupies. `bound` is `"startOfDay"` or
  `"endOfDay"`.
- `localDayInZone(instant, zone)` returns the calendar day an instant falls on.

## Grouping and bounding by day

`resolveDateRangeQueryBounds()` from `@sapporta/shared/daterange` and the
`to_tz_date()` SQL function are the two day-shaped operations a handler
performs. Both are covered in
[Group and filter by day](/docs/guides/reports/group-and-filter-by-day/).

## Related documentation

- [Group and filter by day](/docs/guides/reports/group-and-filter-by-day/)
- [Auth and row security](/docs/reference/server/auth-and-row-security/)
- [Workspaces, ownership, and row visibility](/docs/guides/security/workspaces-ownership-and-row-visibility/)
- [Authentication and token endpoints](/docs/reference/http/authentication-and-token-endpoints/)
- [Generated and client values](/docs/reference/schema/semantic-values/generated-and-client-values/)
- [Column sizing](/docs/reference/column-sizing/)
