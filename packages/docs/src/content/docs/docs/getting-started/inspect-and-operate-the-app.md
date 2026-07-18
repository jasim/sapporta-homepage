---
title: "Inspect and operate the app"
description:
  "Discover generated and app-owned routes, operate them through the CLI, and
  verify scoped token access."
---

The task app now contains generated CRUD routes, a complete-task transition, and
a project-progress report. This page uses the live OpenAPI document and the
project-local CLI to discover and call all three kinds of surface. You will also
create a revocable agent token and prove that non-browser callers receive the
same abilities and workspace row visibility as the represented user.

```text
Walk through the running task app as an operator. Discover its table and app routes, call one generated query and one domain endpoint, check the progress report, and prove a scoped token cannot see another workspace.
```

## Treat the running API as the inventory

Source files show intended contracts. The mounted server shows which contracts
are actually available. Start the app and inspect its OpenAPI-backed inventory
before making a direct call:

```bash
pnpm dev
pnpm exec sapporta tables list
pnpm exec sapporta endpoints list
pnpm exec sapporta endpoints show "GET /api/tables/tasks"
pnpm exec sapporta endpoints show "PUT /api/tables/tasks/{id}"
pnpm exec sapporta endpoints show "POST /api/tasks/{id}/complete"
pnpm exec sapporta endpoints show "GET /api/reports/project-progress"
```

The selectors use mounted runtime URLs, including `/api`. The shared ts-rest
contracts for the complete-task and report routes omit that prefix. Generated
row updates use `PUT`; a discovered `PATCH` call is not a substitute.

The OpenAPI document is protected in an authenticated app. A discovery failure
can therefore mean that caller authority is missing, not that the endpoint was
never registered. If one app-owned route is absent while the other routes are
visible, check both `app.route()` and `app.extend()` in `packages/api/app.ts`.

<!--
Screenshot brief
Suggested asset: /images/docs/getting-started/task-app-endpoint-discovery.png
Setup: Run the completed tutorial app, authenticate the CLI for Workspace A, and show POST /api/tasks/{id}/complete after listing endpoints.
Frame: Capture the terminal from the endpoint selector through its path parameter, request body, authentication, and declared response schemas.
Visible proof: The live contract uses the mounted /api path and declares 200, 404, and 409 responses for complete-task.
Alt text: Sapporta CLI displaying the mounted complete-task endpoint with its parameter, body, and declared responses.
-->

## Use the highest-level operation that fits

The generated row commands fit ordinary record reads and writes. Query the open
tasks and raise one task's priority without sending a workspace column:

```bash
pnpm exec sapporta rows list tasks \
  --where '{"status":{"eq":"open"}}' \
  --sort "due_date" \
  --output json
pnpm exec sapporta rows update tasks 1 \
  --values '{"priority":"high"}'
pnpm exec sapporta --output json rows get tasks 1
```

The equivalent generated HTTP query and representative body are:

```http
GET /api/tables/tasks?filter[status][eq]=open&sort=due_date HTTP/1.1
Host: localhost:3000
```

```json
{
  "data": [
    {
      "id": 1,
      "project_id": 1,
      "title": "Publish launch checklist",
      "status": "open",
      "priority": "high",
      "due_date": "2026-08-01"
    }
  ],
  "meta": { "total": 1, "page": 1, "limit": 50, "pages": 1 }
}
```

Completing a task is not an ordinary update. It changes the task and inserts a
history row in one transaction, so call the app-owned transition and then read
back its effects:

```bash
pnpm exec sapporta api post /api/tasks/1/complete --body '{}'
pnpm exec sapporta --output json rows get tasks 1
pnpm exec sapporta rows list task_events \
  --where '{"task_id":{"eq":1}}' \
  --sort=-occurred_at \
  --output json
pnpm exec sapporta api get /api/reports/project-progress
```

A successful transition returns the domain result declared by the shared
contract:

```json
{
  "task_id": 1,
  "event_id": 6,
  "status": "completed"
}
```

The follow-up reads supply the task and event details. They are observable proof
that the status, immutable history, and report totals changed; a successful
`200` alone does not prove those effects.

## Give a non-browser caller one revocable boundary

Open `/account/profile` while Workspace A is active and create an agent access
token. The raw `spat_...` value appears once. Store it in a secret manager or a
disposable environment variable. Do not paste it into a prompt, project file,
documentation capture, or command-line argument that will be logged.

```bash
export SAPPORTA_API_URL="http://localhost:3000"
read -s SAPPORTA_API_TOKEN
export SAPPORTA_API_TOKEN

pnpm exec sapporta endpoints show "GET /api/reports/project-progress"
pnpm exec sapporta rows list tasks --output json
pnpm exec sapporta api get /api/reports/project-progress
```

The bearer equivalent is a normal authenticated API request:

```http
GET /api/reports/project-progress HTTP/1.1
Host: localhost:3000
Authorization: Bearer spat_<token-id>_<secret>
```

The token represents one user in the workspace that was active at creation.
Authentication establishes that identity. Feature abilities decide whether the
caller may read `project_progress` or complete a task. Row visibility limits
which projects, tasks, and events those permitted operations can reach. A
client-supplied `workspace_id` cannot switch any of those boundaries.

Seed a clearly named task in Workspace B. The Workspace A token's task list and
report must omit it. An attempt to complete a Workspace B task ID should have
the same missing-row behavior as an ID that does not exist; invisible and
missing rows must not disclose different information.

<!--
Screenshot brief
Suggested asset: /images/docs/getting-started/scoped-agent-token-round-trip.png
Setup: Seed five tasks in Workspace A and one visibly named task in Workspace B. Create a short-lived token while Workspace A is active, use it to list tasks and run the report, and redact the complete token and all personal data.
Frame: Capture the Workspace A profile token metadata beside terminal JSON for the scoped task list and project-progress report.
Visible proof: The terminal shows only Workspace A records and the token metadata names the active workspace and expiry.
Alt text: A scoped Workspace A agent token beside CLI results containing only that workspace's task and report rows.
-->

## Revoke the credential and test the next request

Return to `/account/profile`, revoke the token, and repeat a harmless list. The
next request should fail with the documented `token_revoked` authentication
response. Removing a shell variable prevents local reuse; revocation changes
server behavior.

```bash
pnpm exec sapporta rows list tasks --limit 1
unset SAPPORTA_API_TOKEN
```

```json
{
  "error": "Agent access token has been revoked",
  "code": "token_revoked"
}
```

<!--
Screenshot brief
Suggested asset: /images/docs/getting-started/revoked-agent-token-check.png
Setup: Revoke the tutorial token in /account/profile, then repeat a read-only rows list command with the same token in a disposable terminal session.
Frame: Capture the revoked token row and the terminal failure together. Redact the raw secret, user email, cookies, and unrelated terminal history.
Visible proof: The profile marks the token revoked and the following API-backed command reports token_revoked.
Alt text: Revoked task-app agent token with a terminal request rejected by the API.
-->

The browser, CLI, and bearer caller now exercise one mounted API under the same
authorization model. Discovery supplies the exact route and method. Generated
commands cover ordinary records, while app endpoints cover transitions and
reports. Continue with
[Build, test, and choose the next guide](/docs/getting-started/build-test-and-choose-the-next-guide/)
for the final validation pass, or use the guides for
[OpenAPI discovery](/docs/guides/discovery/openapi-and-endpoint-discovery/),
[the agent data console](/docs/guides/discovery/use-the-agent-data-console/),
and [scoped tokens](/docs/guides/security/agent-access-and-scoped-tokens/).
