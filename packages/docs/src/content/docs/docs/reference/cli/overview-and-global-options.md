---
title: "CLI overview and global options"
description: "Look up CLI invocation, target, token, output, and environment precedence."
---

## Identity

Published `sapporta` binary; prefer project-local `pnpm exec sapporta`.

## Contract

- `--api-url <url>` overrides `SAPPORTA_API_URL`, which overrides the
  surrounding project's `SAPPORTA_API_PORT` from `.env.development`. Outside a
  project the fallback is `http://localhost:3000`.
- `--api-token <token>` overrides `SAPPORTA_API_TOKEN` for bearer authentication.
- `--output table|json` overrides `SAPPORTA_OUTPUT_FORMAT`.
- `--version` and `--help` are local; API-backed commands require a reachable running app.

## Minimal lookup

```bash
pnpm exec sapporta --help
```

## Related documentation

- [Use the Sapporta CLI](/docs/guides/discovery/use-the-sapporta-cli/)
