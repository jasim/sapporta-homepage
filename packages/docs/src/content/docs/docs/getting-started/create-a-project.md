---
title: "Create a Sapporta project"
description: "Generate a Sapporta project, run its API and frontend, and enter the authenticated app shell."
---

A generated Sapporta workspace contains an API package, a shared package, and a React frontend. The local development process starts all three in dependency order.

> Checkpoint: C00 → C01

## Agent approach

```text
Read the local project instructions and use the Sapporta skill. Starting at C00, implement this outcome: A generated Sapporta workspace contains an API package, a shared package, and a React frontend. The local development process starts all three in dependency order. Reach C01, run the validation described on this page, and report changed files and checks. Preserve server-controlled scope fields and use generated APIs for ordinary CRUD.
```

## Review the agent's work

- The generated root contains `sapporta.json` and a pnpm workspace.
- Development email uses the stream transport and writes the verification message to the API console.
- The first verified user creates the first workspace and becomes its owner.

## Code approach

```bash
corepack enable
pnpm exec sapporta init task-app
cd task-app
pnpm dev
```

Open `http://localhost:5173`, create an account, and follow the verification URL printed by the API process. The API listens on `http://localhost:3000`.

## Observe and verify

The browser loads the signed-in application shell and the API health endpoint responds. Keep this user and workspace for later access checks.

## What you built

The scaffold is running at C01. The next page identifies the files that each later tutorial change will use.

Continue with [the related guide](/docs/guides/operations/application-configuration/) or use [the exact reference](/docs/reference/project/project-files/).
