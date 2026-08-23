import { bucketForKind } from "./extract.mjs";
import { pageSlugFor } from "./entry-points.mjs";

/**
 * Above this many own symbols an entry point is split into bucket pages.
 *
 * Measured against the published surface: it splits exactly the barrels that
 * would otherwise dominate an agent's context, and leaves every other entry
 * point whole. Counting symbols rather than bytes keeps the split stable — a
 * page's contents can grow without silently re-partitioning its neighbours.
 */
export const SPLIT_THRESHOLD = 80;

const BUCKET_TITLES = {
  types: "Types",
  functions: "Functions and components",
  values: "Values, classes, and namespaces",
};
const BUCKET_ORDER = ["types", "functions", "values"];

export function referenceUrl(origin, slug) {
  return `${origin}/api-reference/${slug}.md`;
}

/** Bucket an entry point's own symbols, dropping buckets with no members. */
export function bucketSymbols(symbols) {
  const buckets = new Map();
  for (const symbol of symbols) {
    const bucket = bucketForKind(symbol.kind);
    if (!buckets.has(bucket)) buckets.set(bucket, []);
    buckets.get(bucket).push(symbol);
  }
  return BUCKET_ORDER.filter((name) => buckets.has(name)).map((name) => ({
    name,
    title: BUCKET_TITLES[name],
    symbols: buckets.get(name),
  }));
}

export function shouldSplit(entry) {
  return entry.kind === "symbols" && entry.symbols.length > SPLIT_THRESHOLD;
}

function frontmatter(fields) {
  return [
    "---",
    ...Object.entries(fields).map(
      ([key, value]) => `${key}: ${JSON.stringify(value)}`,
    ),
    "---",
  ].join("\n");
}

function renderSymbol(symbol) {
  const lines = [`### ${symbol.name}`, ""];
  if (symbol.summary) lines.push(symbol.summary, "");

  if (symbol.reexportedFrom) {
    lines.push(
      `Re-exported from \`${symbol.reexportedFrom}\`. See that package for its declaration.`,
      "",
    );
    return lines;
  }

  if (symbol.signatures.length === 0) {
    lines.push("_No declaration recorded._", "");
    return lines;
  }

  lines.push("```ts", ...symbol.signatures, "```", "");
  return lines;
}

function pageHeader(entry, pkg, origin, subtitle) {
  return [
    frontmatter({
      title: subtitle ? `${entry.specifier} — ${subtitle}` : entry.specifier,
      package: pkg.name,
      version: pkg.version,
      specifier: entry.specifier,
    }),
    "",
    `> Sapporta API reference for \`${pkg.name}@${pkg.version}\`. ` +
      `Index: ${origin}/api-reference/llms.txt`,
    "",
    `# ${entry.specifier}${subtitle ? ` — ${subtitle}` : ""}`,
    "",
    `Import from \`${entry.specifier}\`. Documented from \`${pkg.name}@${pkg.version}\`; ` +
      "confirm the installed version with " +
      `\`node -p "require('${pkg.name}/package.json').version"\`.`,
    "",
  ];
}

function renderReexportTable(entry) {
  if (entry.reexports.length === 0) return [];
  const byTarget = new Map();
  for (const { name, from } of entry.reexports) {
    if (!byTarget.has(from)) byTarget.set(from, []);
    byTarget.get(from).push(name);
  }

  const lines = [
    `## Also available from narrower specifiers (${entry.reexports.length})`,
    "",
    `These are exported by \`${entry.specifier}\` too, but their signatures live ` +
      "on the narrower page. Prefer the narrower specifier in application code.",
    "",
  ];
  for (const target of [...byTarget.keys()].sort()) {
    lines.push(`- \`${target}\` — ${byTarget.get(target).sort().join(", ")}`);
  }
  lines.push("");
  return lines;
}

/** Every generated page for one entry point: one page, or an overview plus buckets. */
export function renderEntryPages(entry, pkg, origin) {
  const slug = pageSlugFor(entry.specifier);

  if (entry.kind === "asset") return [];

  const buckets = bucketSymbols(entry.symbols);

  if (!shouldSplit(entry)) {
    const lines = [...pageHeader(entry, pkg, origin)];
    lines.push(
      `${entry.symbols.length} symbol${entry.symbols.length === 1 ? "" : "s"} ` +
        `documented here.`,
      "",
    );
    lines.push(...renderReexportTable(entry));
    for (const bucket of buckets) {
      lines.push(`## ${bucket.title} (${bucket.symbols.length})`, "");
      for (const symbol of bucket.symbols) lines.push(...renderSymbol(symbol));
    }
    return [{ slug, content: `${lines.join("\n").trimEnd()}\n` }];
  }

  const pages = [];
  const overview = [...pageHeader(entry, pkg, origin)];
  overview.push(
    `${entry.symbols.length} symbols are published directly from this specifier — ` +
      "too many for one page, so they are grouped below.",
    "",
    "## Pages",
    "",
  );
  for (const bucket of buckets) {
    overview.push(
      `- [${bucket.title} (${bucket.symbols.length})](${referenceUrl(origin, `${slug}-${bucket.name}`)})` +
        ` — ${bucket.symbols.map((s) => s.name).join(", ")}`,
    );
  }
  overview.push("");
  overview.push(...renderReexportTable(entry));
  pages.push({ slug, content: `${overview.join("\n").trimEnd()}\n` });

  for (const bucket of buckets) {
    const lines = [...pageHeader(entry, pkg, origin, bucket.title)];
    lines.push(
      `${bucket.symbols.length} of ${entry.symbols.length} symbols published from ` +
        `\`${entry.specifier}\`. Other groups: ` +
        buckets
          .filter((other) => other.name !== bucket.name)
          .map(
            (other) =>
              `[${other.title}](${referenceUrl(origin, `${slug}-${other.name}`)})`,
          )
          .join(", ") +
        ".",
      "",
    );
    for (const symbol of bucket.symbols) lines.push(...renderSymbol(symbol));
    pages.push({
      slug: `${slug}-${bucket.name}`,
      content: `${lines.join("\n").trimEnd()}\n`,
    });
  }

  return pages;
}

/** The single entry point an agent is pointed at. */
export function renderIndex(surface, origin) {
  const versions = surface.packages
    .map((pkg) => `\`${pkg.name}@${pkg.version}\``)
    .join(", ");

  const lines = [
    "# Sapporta API reference",
    "",
    "> Every symbol published by the Sapporta packages, with the specifier to " +
      "import it from and its exact declaration. Generated from the published " +
      "declaration files — this is the API as shipped, not a summary of it.",
    "",
    `Describes ${versions}.`,
    "",
    "Read this instead of opening declaration files under `node_modules`.",
    "",
    "## Find a symbol by name",
    "",
    `- [Symbol index](${referenceUrl(origin, "symbols")}): every exported name and ` +
      "the specifier that publishes it. Start here when you know the name but not " +
      "the import path.",
    "",
    "## Conventions",
    "",
    "- Every page states the package version it documents. Confirm the installed " +
      'version with `node -p "require(\'<package>/package.json\').version"` before ' +
      "relying on a signature.",
    "- Prefer the narrowest specifier that publishes a symbol. Root barrels " +
      "re-export their subpaths and link to them rather than repeating signatures.",
    "- Signatures are the published declarations verbatim. Behaviour a signature " +
      "cannot express is covered by the guides at " +
      `${origin}/docs.md.`,
  ];

  for (const pkg of surface.packages) {
    lines.push("", `## ${pkg.name} ${pkg.version}`, "");
    for (const entry of pkg.entryPoints) {
      if (entry.kind === "asset") {
        lines.push(
          `- \`${entry.specifier}\` — stylesheet, no exported symbols. Import for side effects.`,
        );
        continue;
      }
      const slug = pageSlugFor(entry.specifier);
      const counts = [`${entry.symbols.length} documented`];
      if (entry.reexports.length > 0) {
        counts.push(`${entry.reexports.length} re-exported from subpaths`);
      }
      const split = shouldSplit(entry) ? ", split by group" : "";
      lines.push(
        `- [${entry.specifier}](${referenceUrl(origin, slug)}): ${counts.join(", ")}${split}.`,
      );
    }
  }

  lines.push("");
  return lines.join("\n");
}

/** Name-to-specifier router: the lookup the reference exists to make cheap. */
export function renderSymbolIndex(surface, origin) {
  const owners = new Map();
  for (const pkg of surface.packages) {
    for (const entry of pkg.entryPoints) {
      if (entry.kind !== "symbols") continue;
      const record = (name) => {
        if (!owners.has(name)) owners.set(name, new Set());
        owners.get(name).add(entry.specifier);
      };
      for (const symbol of entry.symbols) record(symbol.name);
      for (const reexport of entry.reexports) record(reexport.name);
    }
  }

  const names = [...owners.keys()].sort((a, b) =>
    a.localeCompare(b, "en", { sensitivity: "base" }) || a.localeCompare(b),
  );

  const lines = [
    "# Sapporta symbol index",
    "",
    "> Every exported name in the Sapporta packages and the specifier to import " +
      "it from. Search this page for a symbol name; follow the specifier's page " +
      "for the signature.",
    "",
    `${names.length} names across ${surface.packages.length} packages. ` +
      `Full reference: ${origin}/api-reference/llms.txt`,
    "",
    "Where a name lists more than one specifier, prefer the narrowest.",
    "",
  ];

  for (const name of names) {
    const specifiers = [...owners.get(name)].sort(
      (a, b) => b.length - a.length || a.localeCompare(b),
    );
    lines.push(`- \`${name}\` — ${specifiers.join(", ")}`);
  }

  lines.push("");
  return lines.join("\n");
}

/** Everything the docs site serves, as slug/content pairs. */
export function renderAll(surface, origin) {
  const files = [
    { slug: "index", content: renderIndex(surface, origin) },
    { slug: "symbols", content: renderSymbolIndex(surface, origin) },
  ];
  for (const pkg of surface.packages) {
    for (const entry of pkg.entryPoints) {
      files.push(...renderEntryPages(entry, pkg, origin));
    }
  }
  return files.sort((a, b) => a.slug.localeCompare(b.slug));
}
