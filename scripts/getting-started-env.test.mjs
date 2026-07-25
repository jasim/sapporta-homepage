import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_DOCS_ORIGIN,
  DEFAULT_SKILL_SOURCE,
  replaceGettingStartedEnvTokens,
  resolveGettingStartedEnv,
} from "../packages/docs/src/lib/getting-started-env.mjs";

test("uses published values when environment variables are absent", () => {
  const environment = resolveGettingStartedEnv(
    {},
    "pnpm dlx sapporta@1.2.3 init my-app",
  );

  assert.equal(environment.docsOrigin, DEFAULT_DOCS_ORIGIN);
  assert.equal(environment.docsCanonicalOrigin, DEFAULT_DOCS_ORIGIN);
  assert.equal(environment.skillSource, DEFAULT_SKILL_SOURCE);
  assert.equal(environment.initCommand, "pnpm dlx sapporta@1.2.3 init my-app");
});

test("uses independently configured getting-started environment values", () => {
  const environment = resolveGettingStartedEnv({
    SAPPORTA_DOCS_ORIGIN: "http://127.0.0.1:4321",
    SAPPORTA_DOCS_CANONICAL_ORIGIN: "https://docs.example.com",
    SAPPORTA_INIT_COMMAND: "sapporta init my-app",
    SAPPORTA_SKILL_SOURCE: "/tmp/sapporta skills",
  });

  assert.equal(environment.docsOrigin, "http://127.0.0.1:4321");
  assert.equal(environment.docsCanonicalOrigin, "https://docs.example.com");
  assert.equal(environment.initCommand, "sapporta init my-app");
  assert.equal(
    environment.skillInstallCommand,
    "npx skills add '/tmp/sapporta skills' --skill sapporta",
  );
  assert.equal(
    environment.agentMarkdownUrl("docs/getting-started/introduction"),
    "http://127.0.0.1:4321/docs/getting-started/introduction.md",
  );

  assert.equal(
    replaceGettingStartedEnvTokens(
      [
        "{{SAPPORTA_INIT_COMMAND}}",
        "{{SAPPORTA_SKILL_INSTALL_COMMAND}}",
        "{{SAPPORTA_GETTING_STARTED_AGENT_URL}}",
      ].join("\n"),
      environment,
    ),
    [
      "sapporta init my-app",
      "npx skills add '/tmp/sapporta skills' --skill sapporta",
      "http://127.0.0.1:4321/docs/getting-started/introduction.md",
    ].join("\n"),
  );
});

test("allows one value to be overridden without selecting a mode", () => {
  const environment = resolveGettingStartedEnv(
    {
      SAPPORTA_DOCS_ORIGIN: "https://preview.example.com",
    },
    "pnpm dlx sapporta@1.2.3 init my-app",
  );

  assert.equal(environment.docsOrigin, "https://preview.example.com");
  assert.equal(environment.skillSource, DEFAULT_SKILL_SOURCE);
});

test("rejects malformed environment values", () => {
  assert.throws(
    () =>
      resolveGettingStartedEnv({
        SAPPORTA_DOCS_ORIGIN: "http://127.0.0.1:4321/docs",
      }),
    /absolute HTTP\(S\) origin/,
  );
  assert.throws(
    () =>
      resolveGettingStartedEnv({
        SAPPORTA_SKILL_SOURCE: "./skills",
      }),
    /absolute filesystem path or HTTP\(S\) URL/,
  );
  assert.throws(
    () =>
      resolveGettingStartedEnv({
        SAPPORTA_INIT_COMMAND: " ",
      }),
    /must not be empty/,
  );
});
