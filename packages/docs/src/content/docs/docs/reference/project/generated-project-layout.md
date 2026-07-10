---
title: "Generated project layout"
description: "Look up package responsibilities, dependency direction, and extension locations."
---

## Identity

Generated pnpm workspace with `packages/api`, `packages/shared`, and `packages/frontend`.

## Contract

- API owns schema, migrations, auth adapters, app routes, boot, mail, and database I/O.
- Shared owns browser-safe contracts, wire types, parsers, serializers, and constants.
- Frontend owns typed clients, navigation, routes, screens, and generated table integration.
- API and frontend may import shared; shared must not import either I/O package.


## Related documentation

- [Develop with a coding agent](/docs/guides/discovery/develop-with-a-coding-agent/)
