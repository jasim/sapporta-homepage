import { SAPPORTA_PACKAGES } from "./entry-points.mjs";

const SAPPORTA_PACKAGE_SET = new Set(SAPPORTA_PACKAGES);

/**
 * Compiler options for reading published declaration files.
 *
 * These describe how a consuming application resolves `@sapporta/*`, so the
 * surface we document is the one applications actually see. Nothing is
 * type-checked here — declarations are read for their text, not their validity.
 */
export function compilerOptionsFor(ts) {
  return {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.ReactJSX,
    strict: true,
    skipLibCheck: true,
    noEmit: true,
    allowJs: false,
  };
}

/**
 * Resolve relative imports to declaration files, preferring a directory barrel.
 *
 * The bundled packages emit types and JavaScript to different paths — types at
 * `table/query/index.d.ts`, code at `table/query.js` — which is legal, because
 * the `exports` map names both. But it makes a bare `./query` ambiguous, and
 * default resolution stops at the JavaScript file and contributes no types, so
 * everything behind `export * from './query'` silently disappears. Resolving to
 * the declaration first keeps those re-exports in the surface.
 */
export function resolveDeclarationFirst(specifier, containingFile, ts, sys) {
  if (!specifier.startsWith(".")) return undefined;
  const base = ts.resolvePath(ts.getDirectoryPath(containingFile), specifier);
  for (const candidate of [
    `${base}.d.ts`,
    `${base}.d.mts`,
    `${base}/index.d.ts`,
    `${base}/index.d.mts`,
  ]) {
    if (sys.fileExists(candidate)) return candidate;
  }
  return undefined;
}

function createDeclarationHost(options, ts) {
  const host = ts.createCompilerHost(options, true);
  host.resolveModuleNameLiterals = (literals, containingFile) =>
    literals.map((literal) => {
      const preferred = resolveDeclarationFirst(
        literal.text,
        containingFile,
        ts,
        ts.sys,
      );
      if (preferred) {
        return {
          resolvedModule: {
            resolvedFileName: preferred,
            extension: ts.Extension.Dts,
            isExternalLibraryImport: false,
          },
        };
      }
      return {
        resolvedModule: ts.resolveModuleName(
          literal.text,
          containingFile,
          options,
          host,
        ).resolvedModule,
      };
    });
  return host;
}

/** Owning npm package of a file, read from the last `node_modules/` segment. */
export function packageNameFromFile(fileName) {
  const marker = "/node_modules/";
  const index = fileName.lastIndexOf(marker);
  if (index === -1) return undefined;

  const rest = fileName.slice(index + marker.length).split("/");
  if (rest[0] === undefined) return undefined;
  return rest[0].startsWith("@") ? `${rest[0]}/${rest[1]}` : rest[0];
}

/**
 * Bucket a symbol so heavy entry points can be split predictably.
 *
 * Three buckets keep the split stable: a symbol's bucket changes only when its
 * declaration changes shape, so adding an export rewrites one page, not all.
 */
export function bucketForKind(kind) {
  if (kind === "type" || kind === "interface" || kind === "enum") return "types";
  if (kind === "function" || kind === "component") return "functions";
  return "values";
}

function classifyKind(symbol, ts) {
  const flags = symbol.flags;
  const F = ts.SymbolFlags;
  if (flags & F.TypeAlias) return "type";
  if (flags & F.Interface) return "interface";
  if (flags & (F.Enum | F.ConstEnum)) return "enum";
  if (flags & F.Class) return "class";
  if (flags & (F.Function | F.Method)) {
    return /^[A-Z]/.test(symbol.getName()) ? "component" : "function";
  }
  if (flags & F.Module) return "namespace";
  if (flags & (F.Variable | F.BlockScopedVariable | F.Property)) return "value";
  return "value";
}

function resolveAlias(symbol, checker, ts) {
  if (!(symbol.flags & ts.SymbolFlags.Alias)) return symbol;
  try {
    return checker.getAliasedSymbol(symbol);
  } catch {
    return symbol;
  }
}

/**
 * Longest declaration reproduced in full, in bytes.
 *
 * Aggregate values — a ts-rest router, a large Zod schema — carry a fully
 * inferred type that runs to tens of kilobytes and tells a reader far less than
 * its member names do. Past this size the declaration is condensed to its shape.
 */
export const MAX_SIGNATURE_BYTES = 2500;

function stripDeclarationKeywords(text) {
  return text
    .replace(/^export\s+default\s+/, "")
    .replace(/^export\s+/, "")
    .replace(/^declare\s+/, "")
    .trim();
}

/**
 * Collapse an over-long declaration to its member names.
 *
 * Member names are the part a reader acts on — the routes on a contract, the
 * fields on a schema — so keeping them and eliding their inferred types loses
 * nothing they would have used.
 */
function condenseDeclaration(node, text, ts) {
  const typeLiteral = findTypeLiteral(node, ts);
  if (typeLiteral) {
    const members = typeLiteral.members
      .map((member) => member.name?.getText?.())
      .filter((name) => typeof name === "string" && name.length > 0);

    if (members.length > 0) {
      const head = text.slice(0, text.indexOf("{") + 1);
      return [
        `${stripDeclarationKeywords(head)}`,
        ...members.map((name) => `  ${name}: …;`),
        "}",
        `// ${members.length} members; inferred types elided. Read the full type from the declaration file if needed.`,
      ].join("\n");
    }
  }

  const kept = text.slice(0, MAX_SIGNATURE_BYTES);
  return `${stripDeclarationKeywords(kept)}\n// …declaration truncated at ${MAX_SIGNATURE_BYTES} bytes.`;
}

function findTypeLiteral(node, ts) {
  if (ts.isInterfaceDeclaration(node)) return node;
  const candidate = ts.isVariableStatement(node)
    ? node.declarationList.declarations[0]?.type
    : ts.isTypeAliasDeclaration(node)
      ? node.type
      : undefined;
  return candidate && ts.isTypeLiteralNode(candidate) ? candidate : undefined;
}

/**
 * The declaration exactly as published.
 *
 * Declaration files already carry the flattened public form, so the source text
 * is the signature — no re-rendering, and nothing can drift from what ships.
 */
function declarationText(declaration, ts) {
  let node = declaration;
  // A VariableDeclaration's own text omits `declare const`, so climb to the
  // statement that carries it.
  if (ts.isVariableDeclaration(node) && node.parent?.parent) {
    node = node.parent.parent;
  }

  let text;
  try {
    text = node.getText();
  } catch {
    return undefined;
  }

  if (Buffer.byteLength(text) > MAX_SIGNATURE_BYTES) {
    return condenseDeclaration(node, text, ts);
  }
  return stripDeclarationKeywords(text);
}

function summaryFor(symbol, checker, ts) {
  const parts = symbol.getDocumentationComment(checker);
  const text = ts.displayPartsToString(parts).trim();
  if (!text) return undefined;
  // Keep the opening sentence: enough to disambiguate, cheap to carry.
  const firstBlock = text.split(/\n\s*\n/)[0].replace(/\s+/g, " ").trim();
  const sentence = firstBlock.match(/^.*?[.!?](?=\s|$)/);
  return (sentence ? sentence[0] : firstBlock).trim();
}

function describeSymbol(exportedSymbol, checker, ts) {
  const name = exportedSymbol.getName();
  const target = resolveAlias(exportedSymbol, checker, ts);
  const declarations = target.getDeclarations() ?? [];

  if (declarations.length === 0) {
    return { name, kind: classifyKind(target, ts), signatures: [] };
  }

  const owner = packageNameFromFile(declarations[0].getSourceFile().fileName);
  const isForeign = owner !== undefined && !SAPPORTA_PACKAGE_SET.has(owner);

  // Re-exported third-party types stay as a reference: their full declarations
  // belong to their own projects and would swamp this page.
  if (isForeign) {
    return {
      name,
      kind: classifyKind(target, ts),
      summary: summaryFor(target, checker, ts),
      reexportedFrom: owner,
      signatures: [],
    };
  }

  const signatures = [];
  for (const declaration of declarations) {
    const text = declarationText(declaration, ts);
    if (text && !signatures.includes(text)) signatures.push(text);
  }

  return {
    name,
    kind: classifyKind(target, ts),
    summary: summaryFor(target, checker, ts),
    signatures,
  };
}

/**
 * Read every entry point's exported surface.
 *
 * Returns a plain data model; rendering is a separate, pure step so the output
 * format can change without re-reading declarations.
 */
export function extractSurface(packages, ts) {
  const symbolEntryPoints = packages.flatMap((pkg) =>
    pkg.entryPoints.filter((entry) => entry.kind === "symbols"),
  );

  const options = compilerOptionsFor(ts);
  const program = ts.createProgram(
    symbolEntryPoints.map((entry) => entry.typesFile),
    options,
    createDeclarationHost(options, ts),
  );
  const checker = program.getTypeChecker();
  const missing = [];

  const described = new Map();
  for (const entry of symbolEntryPoints) {
    const sourceFile = program.getSourceFile(entry.typesFile);
    if (!sourceFile) {
      missing.push(`${entry.specifier} (${entry.typesFile})`);
      continue;
    }
    const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
    const exported = moduleSymbol
      ? checker.getExportsOfModule(moduleSymbol)
      : [];
    described.set(
      entry.specifier,
      exported
        .map((symbol) => describeSymbol(symbol, checker, ts))
        .sort((a, b) => a.name.localeCompare(b.name)),
    );
  }

  if (missing.length > 0) {
    throw new Error(
      `Declaration files are missing for:\n- ${missing.join("\n- ")}\n` +
        "Run the package build, or reinstall @sapporta/* dependencies.",
    );
  }

  return {
    packages: packages.map((pkg) => ({
      name: pkg.name,
      version: pkg.version,
      entryPoints: pkg.entryPoints.map((entry) =>
        buildEntry(entry, described, pkg),
      ),
    })),
  };
}

function buildEntry(entry, described, pkg) {
  if (entry.kind === "asset") {
    return {
      specifier: entry.specifier,
      subpath: entry.subpath,
      isRoot: entry.isRoot,
      kind: "asset",
      assetFile: entry.assetFile,
      symbols: [],
      reexports: [],
    };
  }

  const symbols = described.get(entry.specifier) ?? [];

  // A root barrel re-exports much of what its own subpaths publish. Point at
  // the subpath instead of repeating the signature: it keeps the root page
  // navigable and tells the reader the narrower specifier exists.
  if (!entry.isRoot) {
    return {
      specifier: entry.specifier,
      subpath: entry.subpath,
      isRoot: false,
      kind: "symbols",
      symbols,
      reexports: [],
    };
  }

  const bySubpath = new Map();
  for (const sibling of pkg.entryPoints) {
    if (sibling.isRoot || sibling.kind !== "symbols") continue;
    for (const symbol of described.get(sibling.specifier) ?? []) {
      if (!bySubpath.has(symbol.name)) bySubpath.set(symbol.name, sibling.specifier);
    }
  }

  const own = [];
  const reexports = [];
  for (const symbol of symbols) {
    const from = bySubpath.get(symbol.name);
    if (from) reexports.push({ name: symbol.name, from });
    else own.push(symbol);
  }

  return {
    specifier: entry.specifier,
    subpath: entry.subpath,
    isRoot: true,
    kind: "symbols",
    symbols: own,
    reexports,
  };
}
