---
title: "CLI"
description:
  "Lookup Sapporta CLI commands, environment variables, flags, and examples."
---

## CLI reference

Prefer the project-local CLI:

```bash
pnpm exec sapporta ...
```

`sapporta init <name>` is local. Most other commands call a running API server.
The default API URL is `http://localhost:3000`.

| Option or env var                                 | Purpose                                         |
| ------------------------------------------------- | ----------------------------------------------- |
| `--api-url <url>` / `SAPPORTA_API_URL`            | Select the target app. Flags override env vars. |
| `--api-token <token>` / `SAPPORTA_API_TOKEN`      | Bearer token for protected apps.                |
| `--output table\|json` / `SAPPORTA_OUTPUT_FORMAT` | Human table output or JSON for scripts.         |

Useful commands:

```bash
pnpm exec sapporta endpoints list
pnpm exec sapporta endpoints show "GET /api/tables/customers"
pnpm exec sapporta endpoints show "POST /api/invoices/{id}/void"

pnpm exec sapporta tables list
pnpm exec sapporta tables show customers
pnpm exec sapporta tables indexes customers
pnpm exec sapporta tables sample customers --limit 10 --columns id,name,email

pnpm exec sapporta rows list customers --limit 50 --page 2 --sort name
pnpm exec sapporta rows get customers 7
pnpm exec sapporta rows create customers --values '{"name":"Acme Co"}'
pnpm exec sapporta rows update customers 7 --values '{"name":"Acme Ltd"}'
pnpm exec sapporta rows delete customers 7

pnpm exec sapporta sql query "SELECT * FROM customers"
pnpm exec sapporta sql query "SELECT * FROM customers" --limit 50
pnpm exec sapporta sql execute \
  "UPDATE customers SET name = ? WHERE id = ?" \
  --params '["Acme Ltd",7]' \
  --dry-run

pnpm exec sapporta api get /api/tables/customers --query '{"limit":50}'
pnpm exec sapporta api post /api/invoices/123/void \
  --body '{"reason":"duplicate"}'
```

Use `endpoints list` and `endpoints show` for OpenAPI-backed discovery. Use
`api get/post/put/delete` to call app-owned report and workflow endpoints when a
dedicated `tables`, `rows`, or `sql` command is not the right fit.
