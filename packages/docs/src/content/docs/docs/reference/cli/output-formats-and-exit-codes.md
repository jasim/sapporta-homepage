---
title: "Output formats and exit codes"
description: "Look up human and machine output boundaries for the Sapporta CLI."
---

## Identity

CLI table/JSON renderers, stdout/stderr separation, and process exit status.

## Contract

- Table output is intended for interactive inspection; JSON output is intended for scripts.
- Command results are written to stdout and warnings/diagnostics to stderr.
- Secrets are not returned by token list operations; raw token creation output must be handled as a secret.
- Network, auth, validation, not-found, and local setup failures produce non-zero exits.
- Scripts should depend on JSON fields and exit status, not incidental human message wording.


## Related documentation

- [Use the Sapporta CLI](/docs/guides/discovery/use-the-sapporta-cli/)
