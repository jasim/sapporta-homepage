---
title: "@sapporta/server/create-project"
package: "@sapporta/server"
version: "0.6.2"
specifier: "@sapporta/server/create-project"
---

> Sapporta API reference for `@sapporta/server@0.6.2`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/server/create-project

Import from `@sapporta/server/create-project`. Documented from `@sapporta/server@0.6.2`; confirm the installed version with `node -p "require('@sapporta/server/package.json').version"`.

4 symbols documented here.

## Types (2)

### CreateProjectOptions

```ts
interface CreateProjectOptions {
    /** Absolute path to the project root that should be published on success. */
    dir: string;
    /** Project name for package.json. Defaults to the directory basename. */
    name?: string;
    /** Optional hook for CLI progress messages while long-running setup runs. */
    progress?: ProgressLogger;
    /** Test hook for commands that would otherwise reach the shell or network. */
    runCommand?: InitCommandRunner;
    /** Test hook for the better-sqlite3 native binding verification step. */
    verifySqlite?: (apiDir: string, progress: ProgressLogger) => void;
}
```

### CreateProjectResult

```ts
interface CreateProjectResult {
    dir: string;
    name: string;
    /** The ports written into the new project's .env.development. */
    devPorts: DevPorts;
}
```

## Functions and components (1)

### createProject

Create a Sapporta code project: writes workspace package files, boot.ts, app.ts, package.json, tsconfig.json from templates and installs dependencies.

```ts
function createProject(opts: CreateProjectOptions): CreateProjectResult;
```

## Values, classes, and namespaces (1)

### MINIMUM_PNPM_MAJOR_VERSION

The generated project reads its pnpm settings from pnpm-workspace.yaml.

```ts
const MINIMUM_PNPM_MAJOR_VERSION = 11;
```
