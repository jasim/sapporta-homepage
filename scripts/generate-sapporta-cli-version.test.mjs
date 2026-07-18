import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";
import {
  parseLatestVersion,
  renderGeneratedModule,
  resolveLatestVersion,
  SAPPORTA_LATEST_URL,
  writeGeneratedModule,
} from "./generate-sapporta-cli-version.mjs";

test("resolves sapporta@latest from the public npm package endpoint", async () => {
  const version = await resolveLatestVersion(async (url, options) => {
    assert.equal(url, SAPPORTA_LATEST_URL);
    assert.equal(options.headers.accept, "application/json");
    return new Response(JSON.stringify({ name: "sapporta", version: "1.2.3" }));
  });

  assert.equal(version, "1.2.3");
});

test("rejects missing and invalid registry versions", () => {
  for (const payload of [
    { name: "sapporta" },
    { name: "sapporta", version: "latest" },
    { name: "sapporta", version: "01.2.3" },
    { name: "sapporta", version: "1.2" },
  ]) {
    assert.throws(
      () => parseLatestVersion(payload),
      /invalid sapporta version/,
    );
  }
});

test("rejects metadata for a different npm package", () => {
  assert.throws(
    () => parseLatestVersion({ name: "@sapporta/server", version: "1.2.3" }),
    /metadata for the wrong package/,
  );
});

test("fails clearly when npm cannot be reached", async () => {
  await assert.rejects(
    resolveLatestVersion(async () => {
      throw new Error("network unavailable");
    }),
    /Could not reach npm to resolve sapporta@latest/,
  );
});

test("renders one shared versioned command and writes it idempotently", async () => {
  const directory = await mkdtemp(join(tmpdir(), "sapporta-cli-version-"));
  const destination = pathToFileURL(join(directory, "sapporta-cli.mjs"));

  assert.equal(await writeGeneratedModule("1.2.3", destination), true);
  assert.equal(await writeGeneratedModule("1.2.3", destination), false);

  const content = await readFile(destination, "utf8");
  assert.equal(content, renderGeneratedModule("1.2.3"));
  assert.match(content, /sapportaCliVersion = "1\.2\.3"/);
  assert.match(content, /sapporta@\$\{sapportaCliVersion\} init my-app/);
});
