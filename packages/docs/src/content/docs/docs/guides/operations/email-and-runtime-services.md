---
title: "Email and runtime services"
description:
  "Inject configured runtime services into app-owned routes and workflows."
---

Generated projects construct long-lived services during boot and pass them into
`loadApp()`. The mailer demonstrates the boundary: the process owns Nodemailer
configuration, while application code receives a typed capability.

## Keep construction at boot

`readProjectAuthEnv()` parses the server environment. `createSapportaMailer()`
constructs one Nodemailer transport, default sender, and `sendMail()` helper.
`boot.ts` passes that service into the application entry point:

```ts
const projectEnv = readProjectAuthEnv();
const mailer = createSapportaMailer(projectEnv.mail);

const apiApp = new TsRestApi<SapportaEnv>();
loadApp(apiApp, { conn, mailer });
```

The route or domain service accepts the capability it uses instead of importing
environment parsing or the boot module:

```ts
import type { SapportaMailer } from "../../mailer.js";

export interface CompletionNoticeInput {
  recipient: string;
  taskTitle: string;
}

export async function sendCompletionNotice(
  mailer: Pick<SapportaMailer, "sendMail">,
  input: CompletionNoticeInput,
) {
  await mailer.sendMail({
    to: input.recipient,
    subject: `Completed: ${input.taskTitle}`,
    text: `The task "${input.taskTitle}" is complete.`,
  });
}
```

Call the mail service after the database transaction commits. Nodemailer is an
external effect and should not run inside the synchronous SQLite transaction
callback. If delivery must be durable, insert an outbox record in the
transaction and process it separately.

## Resolve the verification policy

`readProjectAuthEnv()` resolves the email-verification requirement from one
policy. An explicit `SAPPORTA_REQUIRE_VERIFIED_EMAIL=true` or `false` takes
precedence. When the variable is absent, `NODE_ENV=production` requires
verification and other runtime modes do not.

The generated development environment therefore permits sign-up without a
verification message. Set the explicit override to `true` when a local workflow
needs to exercise verification links and unverified-session handling.

## Inspect mail locally

Stream transport does not deliver the message. It logs selected input fields:
sender, recipient, subject, text, and HTML. It does not log the complete raw
MIME source.

```ini
SAPPORTA_MAIL_TRANSPORT=stream
SAPPORTA_MAIL_FROM=Task App <no-reply@example.com>
```

```bash
pnpm dev
# Trigger the workflow from the browser or its app-owned endpoint.
pnpm exec sapporta api post /api/tasks/1/complete --body '{}'
```

Production uses `SAPPORTA_MAIL_TRANSPORT=smtp` with either `SMTP_URL` or the
individual `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, and `SMTP_PASS`
values. `disabled` skips delivery explicitly. `SAPPORTA_MAIL_FROM` remains
required for every transport.

Commit domain state before sending. When state and eventual delivery must be
coordinated, insert an outbox record in the transaction and process it after
commit; the outbox is an application pattern, not a built-in queue.

## Related reference

- [Runtime services](/docs/reference/server/runtime-services/)
- [Environment variables](/docs/reference/project/environment-variables/)
