---
title: "Runtime services"
description: "Look up generated mail, health, boot, and shutdown extension contracts."
---

## Identity

Generated `packages/api/mailer.ts`, `boot.ts`, and `loadApp()` options.

## Contract

- `createSapportaMailer()` returns the Nodemailer transport, parsed defaults, and `sendMail()` helper.
- Boot constructs the database connection and mailer, then passes them to `loadApp()`.
- Health policy accepts `public`, `authenticated`, or `disabled`.
- Boot owns process signal handling, server close, transport close, and database cleanup.


## Related documentation

- [Email and runtime services](/docs/guides/operations/email-and-runtime-services/)
