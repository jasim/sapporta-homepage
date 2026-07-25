import path from "node:path";
import { sapportaInitCommand } from "../generated/sapporta-cli.mjs";

export const DEFAULT_DOCS_ORIGIN = "https://sapporta.com";
export const DEFAULT_SKILL_SOURCE = "https://github.com/jasim/sapporta-skills";

const DOCS_ORIGIN = "SAPPORTA_DOCS_ORIGIN";
const DOCS_CANONICAL_ORIGIN = "SAPPORTA_DOCS_CANONICAL_ORIGIN";
const INIT_COMMAND = "SAPPORTA_INIT_COMMAND";
const SKILL_SOURCE = "SAPPORTA_SKILL_SOURCE";

export function resolveGettingStartedEnv(env = process.env, publishedInitCommand = sapportaInitCommand) {
  const docsOrigin = readOrigin(env[DOCS_ORIGIN] ?? DEFAULT_DOCS_ORIGIN, DOCS_ORIGIN);
  const docsCanonicalOrigin = readOrigin(env[DOCS_CANONICAL_ORIGIN] ?? DEFAULT_DOCS_ORIGIN, DOCS_CANONICAL_ORIGIN);
  const initCommand = readNonEmpty(env[INIT_COMMAND] ?? publishedInitCommand, INIT_COMMAND);
  const skillSource = readSkillSource(env[SKILL_SOURCE] ?? DEFAULT_SKILL_SOURCE, SKILL_SOURCE);

  return Object.freeze({
    docsOrigin,
    docsCanonicalOrigin,
    initCommand,
    skillSource,
    skillInstallCommand: `npx skills add ${shellQuote(skillSource)} --skill sapporta`,
    agentMarkdownUrl(slug) {
      return `${docsOrigin}/${normalizeSlug(slug)}.md`;
    },
  });
}

export function replaceGettingStartedEnvTokens(text, environment) {
  const replacements = {
    "{{SAPPORTA_INIT_COMMAND}}": environment.initCommand,
    "{{SAPPORTA_SKILL_INSTALL_COMMAND}}": environment.skillInstallCommand,
    "{{SAPPORTA_GETTING_STARTED_AGENT_URL}}": environment.agentMarkdownUrl("docs/getting-started/introduction"),
  };

  let rendered = text;
  for (const [token, value] of Object.entries(replacements)) {
    rendered = rendered.replaceAll(token, value);
  }
  return rendered;
}

export const gettingStartedEnv = resolveGettingStartedEnv();

function readOrigin(value, name) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${name} must be an absolute HTTP(S) origin`);
  }

  if (
    (parsed.protocol !== "http:" && parsed.protocol !== "https:") ||
    parsed.pathname !== "/" ||
    parsed.search ||
    parsed.hash ||
    parsed.username ||
    parsed.password
  ) {
    throw new Error(`${name} must be an absolute HTTP(S) origin`);
  }
  return parsed.origin;
}

function readNonEmpty(value, name) {
  const normalized = value.trim();
  if (!normalized) throw new Error(`${name} must not be empty`);
  return normalized;
}

function readSkillSource(value, name) {
  const normalized = readNonEmpty(value, name);
  if (path.isAbsolute(normalized)) return path.normalize(normalized);

  let parsed;
  try {
    parsed = new URL(normalized);
  } catch {
    throw new Error(`${name} must be an absolute filesystem path or HTTP(S) URL`);
  }
  if ((parsed.protocol !== "http:" && parsed.protocol !== "https:") || parsed.username || parsed.password) {
    throw new Error(`${name} must be an absolute filesystem path or HTTP(S) URL`);
  }
  return parsed.href.replace(/\/$/, "");
}

function normalizeSlug(slug) {
  const normalized = slug.replace(/^\/+|\/+$/g, "");
  if (!normalized) throw new Error("Documentation slug must not be empty");
  return normalized;
}

function shellQuote(value) {
  if (/^[A-Za-z0-9_./:@+-]+$/.test(value)) return value;
  return `'${value.replaceAll("'", `'\\''`)}'`;
}
