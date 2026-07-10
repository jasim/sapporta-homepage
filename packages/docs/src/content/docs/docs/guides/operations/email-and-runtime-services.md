---
title: "Email and runtime services"
description: "Inject configured runtime services into app-owned routes and workflows."
---

Inject configured runtime services into app-owned routes and workflows.

`createSapportaMailer()` builds the generated Nodemailer transport and defaults. `loadApp()` receives the mailer with the database connection at boot.

For the programmer, the project passes services into domain modules without importing auth boot internals.
For the application user, development email is inspectable in the API console, and production delivery uses explicit SMTP configuration.

## System boundary

- Use `SAPPORTA_MAIL_TRANSPORT=stream` during local development.
- Use `smtp` or `disabled` deliberately in production.
- Keep sender defaults and credentials in server configuration.
- Let boot own transport creation and process cleanup.

## Task-app example

A task workflow can send a completion summary through the injected `sendMail()` helper after the database transaction succeeds.


## Verify

1. Run the smallest build, route, table, or browser check that exercises this boundary.
2. Compare the result with the generated record or API surface under the same authenticated workspace.
3. Test one invalid or cross-boundary input when the page changes data or authority.

## Related reference

- [Runtime services](/docs/reference/server/runtime-services/)
- [Environment variables](/docs/reference/project/environment-variables/)
