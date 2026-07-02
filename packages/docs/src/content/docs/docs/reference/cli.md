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

| Option or env var                                        | Purpose                                         |
| -------------------------------------------------------- | ----------------------------------------------- |
| `--api-url <url>` / `SAPPORTA_API_URL`                   | Select the target app. Flags override env vars. |
| `--api-token <token>` / `SAPPORTA_API_TOKEN`             | Bearer token for protected apps.                |
| `--output-format table\|json` / `SAPPORTA_OUTPUT_FORMAT` | Human table output or JSON for scripts.         |
| `--input-body-json '{...}'`                              | Body for commands that accept object input.     |
| `--sapporta-project-dir <path>`                          | Override project-root auto-detection.           |

Useful commands:

```bash
pnpm exec sapporta describe
pnpm exec sapporta describe "GET /api/tables/customers"
pnpm exec sapporta describe "POST /api/invoices/{id}/void"

pnpm exec sapporta tables
pnpm exec sapporta tables show customers
pnpm exec sapporta tables indexes customers
pnpm exec sapporta tables sample customers --limit 10 --fields id,name,email

pnpm exec sapporta rows customers --limit 50 --page 2 --sort name
pnpm exec sapporta rows get customers 7
pnpm exec sapporta rows insert customers --data '{"name":"Acme Co"}'
pnpm exec sapporta rows update customers 7 --data '{"name":"Acme Ltd"}'
pnpm exec sapporta rows delete customers 7

pnpm exec sapporta db exec-sql "SELECT * FROM customers"
pnpm exec sapporta db exec-sql \
  --input-body-json '{"sql":"SELECT * FROM customers","limit":50}'
```

The CLI can call built-in table, metadata, row, and SQL commands. It uses
`describe` for custom routes, but does not directly invoke custom HTTP
endpoints; call those with `curl`, a typed client, or another HTTP client.
