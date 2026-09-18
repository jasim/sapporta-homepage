---
title: "Runtime services"
description: "Look up generated mail, health, data directory, boot, and shutdown extension contracts."
---

## Identity

Generated `packages/api/mailer.ts`, `runtime.ts`, `boot.ts`, and `loadApp()`
options; `dataPath()` and `databasePath()` from `@sapporta/server`.

## Contract

- `createSapportaMailer()` returns the Nodemailer transport, parsed defaults, and `sendMail()` helper.
- Boot constructs the database connection and mailer, then passes them to `loadApp()`.
- `openProjectRuntime()` opens `sqlite.db` in the directory named by `SAPPORTA_DATA_DIR` and returns that file's path as `databasePath`. Boot prints it after the ready line.
- Health policy accepts `public`, `authenticated`, or `disabled`.
- Boot owns process signal handling, server close, transport close, and database cleanup.

## Data directory paths

`dataPath(...segments)` joins path segments onto the data directory.
`databasePath()` returns `dataPath("sqlite.db")`. Use `dataPath()` for an
application's own files that belong with its database, so a process pointed at
another data directory also reads another copy of them:

```ts
import { dataPath } from "@sapporta/server";

const importPresetsFile = dataPath("user-config", "import-presets.json");
```

- An absolute `SAPPORTA_DATA_DIR` is used as given. A relative one resolves
  against the project root, the directory with `sapporta.json`, never against
  the working directory.
- Both functions throw when `SAPPORTA_DATA_DIR` is unset or empty.
- Both work at the top of a module and from any working directory, including
  code that runs before `openProjectRuntime()` sets the project root. Until
  then, `projectRoot()` walks up for `sapporta.json` from the script that started
  the process, such as `packages/api/dist/boot.js`, and then from the working
  directory.
- `@sapporta/server/data-dir` exports the same two functions and depends on
  nothing beyond Node built-ins. `drizzle.config.ts` imports `databasePath()`
  from it, so Drizzle Kit opens the database the app opens.

## Related documentation

- [Email and runtime services](/docs/guides/operations/email-and-runtime-services/)
- [Environment variables](/docs/reference/project/environment-variables/)
- [Production builds and deployment](/docs/guides/operations/production-builds-and-deployment/)
