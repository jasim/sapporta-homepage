---
title: "Create a Sapporta project"
description:
  "Create a Sapporta project, inspect the generated TypeScript application, sign
  up locally, and open the generated app shell."
---

Sapporta projects use pnpm. If Node.js is installed but `pnpm` is not available,
enable pnpm through Corepack:

```bash
corepack enable pnpm
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

The console prints the local browser URL. This is the Vite frontend server. It
serves `index.html` and the React application, usually at:

```text
http://localhost:5173
```

The backend API runs at:

```text
http://localhost:3000
```

## Sign up locally

Open the local browser URL printed by `pnpm dev`. A new project opens at the
signup screen when no signed-in session exists.

![Generated Sapporta signup screen](/assets/getting-started/generated-app-signup.jpg)

Enter a name, email address, and password.

> **Look at your logs for the email verification link!**
>
> The account requires email verification. In local development, the email
> server writes every message to the `pnpm dev` console. Open the verification
> URL from the console to verify the account.

Sapporta uses [Better Auth](https://better-auth.com/) for authentication. The
authentication UI and related screens are present in the generated application
and can be customized locally.

After verification, Sapporta creates the first workspace and assigns the first
user as its owner. The app shell shows project navigation, generated table
surfaces, the account workspace, and the starter welcome screen.

![Generated Sapporta app after signup](/assets/getting-started/generated-app-welcome.jpg)

The project name and table list in the app shell come from the project on disk.
As tables are added to `packages/api/schema/`, the table navigation and
generated record screens update with the running application.

Continue with
[Tour the generated project](/docs/getting-started/tour-the-generated-project/).
