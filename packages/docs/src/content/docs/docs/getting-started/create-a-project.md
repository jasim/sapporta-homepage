---
title: "Create a Sapporta project"
description:
  "Create a Sapporta project, inspect the generated TypeScript application, sign
  up locally, and open the generated app shell."
---

Sapporta projects require pnpm 11 or later. The generated workspace declares its
settings in `pnpm-workspace.yaml`, which pnpm 10 and earlier ignore, so
`sapporta init` checks the version and stops on an older one.

If Node.js is installed but `pnpm` is not available, or an older pnpm is
installed, use Corepack:

```bash
corepack use pnpm@11
```

Create a project named `my-app`:

```bash
{{SAPPORTA_INIT_COMMAND}}
```

The command may pause for two approvals. Approve both:

1. If Corepack asks to download pnpm, answer `y`.
2. When pnpm asks which packages to build, select both `better-sqlite3` and
   `esbuild`. Continue and answer `Yes` to the final build approval.

The Sapporta installation asks you to install the Sapporta skill. The skill is
used both to build Sapporta projects and to operate them through coding agents.
Ensure it is installed:

```bash
{{SAPPORTA_SKILL_INSTALL_COMMAND}}
```

Start the local development server:

```bash
cd my-app
pnpm dev
```

Each project gets its own ports, so `pnpm dev` prints them as it starts:

```text
Development servers for this project, on ports set in .env.development:

  App   http://localhost:5385   open this in a browser
  API   http://localhost:3212   call directly from scripts and coding agents
```

The two numbers differ in every project. Read them from this output, or from
`.env.development`.

## Sign up locally

Open the App URL printed by `pnpm dev`. A new project opens at the signup
screen when no signed-in session exists.

![Generated Sapporta signup screen](/assets/getting-started/generated-app-signup.jpg)

Enter a name, email address, and password.

Sapporta uses [Better Auth](https://better-auth.com/) for authentication. The
authentication UI and related screens are present in the generated application
and can be customized locally.

Sapporta creates the first workspace and assigns the first user as its owner.
The app shell shows project navigation, generated table surfaces, the account
workspace, and the starter home screen at `/`.

![Generated Sapporta app after signup](/assets/getting-started/generated-app-welcome.jpg)

The project name and table list in the app shell come from the project on disk.
As tables are added to `packages/api/schema/`, the table navigation and
generated record screens update with the running application.

## Fill the database with sample data

Once the project has tables, `packages/api/seed.ts` holds the rows a development
database starts with:

```bash
pnpm seed
```

The run opens the database directly, with no server and no access token, and
writes through the application's own save path. It creates the sample-data
account named at the top of `seed.ts` on the first run and signs in as it after
that; sign in as that account to see the rows.
[Sample data and command-line scripts](/docs/guides/operations/sample-data-and-scripts/)
covers writing the rows and the permission that keeps seeding on a development
machine.

Continue with
[Tour the generated project](/docs/getting-started/tour-the-generated-project/).
