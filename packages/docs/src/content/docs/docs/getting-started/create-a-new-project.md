---
title: "Create a new Sapporta project"
description:
  "Create a Sapporta project, inspect the generated TypeScript application, sign
  up locally, and open the generated app shell."
---

Sapporta projects use pnpm. If Node.js is installed but `pnpm` is not available,
enable pnpm through Corepack:

```bash
corepack enable pnpm
```

Now, create a project named `task-app`, move into it, and build the generated
application:

```bash
pnpm dlx sapporta init task-app
```

Note that the Sapporta installation will aks you to install the Sapporta Skill. It is essential for both building
Sapporta projects
as well as to use them through coding agents. Ensure it is installed:

``bash 
npx skills add https://github.com/jasim/sapporta-skills --skill sapporta
``

Now start the local development server:

```bash
cd task-app
pnpm dev
```

The console prints the local browser URL. It is the front-end Vite server, and serves the index.html as well as the
entire React codebase. It is usually on:

```text
http://localhost:5173
```

The back-end API runs on:

```text
http://localhost:3000
```

## Project Anatomy

A Sapporta app is a pnpm workspace with a Hono API, a React frontend, and a
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

## Sign up locally

Open the local browser URL printed by `pnpm dev`. A new project opens at the
signup screen when no signed-in session exists.

![Generated Sapporta signup screen](/assets/getting-started/generated-app-signup.jpg)

Enter a name, email address, and password. You'll need to verify your email. In local development,
the email server is not configured, and all emails are logged into the console. So look at the logs of the `pnpm dev`
command to get the verification URL. Open it in the browser to verify your email.

Note that for this authorization part we use the [better-auth](https://better-auth.com/) package. However, all the UI
for the authorization and related screens are all present locally in your app. So you can customize it however you want.

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
