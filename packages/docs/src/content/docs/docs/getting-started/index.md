---
title: "Getting Started"
description:
  "Create a Sapporta project, inspect the generated TypeScript application, sign
  up locally, and open the generated app shell."
---

Welcome to Sapporta. Sapporta is a TypeScript framework for database
applications with schema-as-code table definitions, generated CRUD APIs,
auth-aware row access, and a React app shell.

This page creates a new project and opens the generated application. The next
page builds the task app used by the rest of the tutorials.

## Create a project

Sapporta projects use pnpm. If Node.js is installed but `pnpm` is not available,
enable pnpm through Corepack:

```bash
corepack enable pnpm
```

Create a project named `task-app`, move into it, and build the generated
application:

```bash
pnpm dlx sapporta init task-app
cd task-app
pnpm build
```

Start the local development server:

```bash
pnpm dev
```

The console prints the local browser URL, usually:

```text
http://localhost:5173
```

The API usually runs on:

```text
http://localhost:3000
```

Run future Sapporta commands from the project root. The project root contains
`sapporta.json`, `package.json`, and `pnpm-workspace.yaml`.

## Inspect the generated code

The generated app is a pnpm workspace with a Hono API, a React frontend, and a
shared package for API contracts and wire types.

```text
task-app/
  sapporta.json
  package.json
  pnpm-workspace.yaml
  .env.development
  data/
  packages/
    api/
      app/
      authz/
      migrations/
      project-auth/
      schema/
    frontend/
      src/
    shared/
      src/
        contracts/
  scripts/
  Dockerfile
  DEPLOYMENT.md
```

| Path                                     | What it contains                                                                                        |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `sapporta.json`                          | The project marker used by the Sapporta CLI to find the app root.                                       |
| `package.json` and `pnpm-workspace.yaml` | Workspace scripts, package manager metadata, and package membership.                                    |
| `.env.development`                       | Local ports, auth settings, mail transport, and development-only secrets.                               |
| `data/`                                  | The local SQLite database used by the generated app.                                                    |
| `packages/api/`                          | The Hono server, Drizzle configuration, auth setup, migrations, schema files, and app-owned API routes. |
| `packages/api/schema/`                   | Table definitions written as Drizzle schemas with Sapporta metadata.                                    |
| `packages/api/app/`                      | Custom backend routes mounted under `/api`.                                                             |
| `packages/api/authz/`                    | Authorization rules and request data-authority helpers for server-side access control.                  |
| `packages/api/project-auth/`             | Better Auth integration, workspace bootstrap, email verification, and agent token support.              |
| `packages/frontend/`                     | The React and Vite app shell, routes, styles, and browser API clients.                                  |
| `packages/frontend/src/App.tsx`          | App-owned frontend routes and navigation entries.                                                       |
| `packages/frontend/src/api.ts`           | Typed browser clients for shared API contracts.                                                         |
| `packages/shared/`                       | Request and response contracts shared by the API and frontend.                                          |
| `packages/shared/src/contracts/`         | ts-rest contract definitions for custom endpoints.                                                      |
| `scripts/`                               | Local development helpers used by `pnpm dev` and build cleanup.                                         |
| `Dockerfile` and `DEPLOYMENT.md`         | The default production image and deployment notes.                                                      |

Generated table endpoints, report endpoints, and app-owned endpoints are served
under `/api`. Browser screens live in `packages/frontend`. Shared request and
response shapes live in `packages/shared`; that package does not depend on the
API or frontend packages.

## Sign up locally

Open the local browser URL printed by `pnpm dev`. A new project opens at the
signup screen when no signed-in session exists.

![Generated Sapporta signup screen](/assets/getting-started/generated-app-signup.jpg)

Enter a name, email address, and password. In local development, the stream mail
transport writes the generated email to the API console. The verification email
includes a local URL. Open that URL to verify the account and load the signed-in
app context.

After verification, Sapporta creates the first workspace and assigns the first
user as the owner. The app shell shows the project navigation, generated table
surfaces, account workspace, and the starter welcome screen.

![Generated Sapporta app after signup](/assets/getting-started/generated-app-welcome.jpg)

The project name and table list in the app shell come from the project on disk.
As tables are added to `packages/api/schema/`, the table navigation and
generated record screens update with the running application.

## Next step

Build the tutorial baseline in
[Build the Task App](/docs/getting-started/build-the-task-app/).
