type MediaRange = {
  type: string;
  subtype: string;
  quality: number;
};

export function explicitlyPrefersMarkdown(accept: string | undefined) {
  if (!accept) return false;
  const ranges = parseAccept(accept);
  const markdownQuality = exactQuality(ranges, "text", "markdown");
  if (markdownQuality === undefined || markdownQuality <= 0) return false;

  return markdownQuality > qualityFor(ranges, "text", "html");
}

export function alternateMarkdownPath(pathname: string) {
  if (!isDocumentationPath(pathname) || pathname.endsWith(".txt")) {
    return undefined;
  }
  if (pathname.endsWith(".md")) return pathname;

  const slug = pathname.replace(/^\/+|\/+$/g, "");
  // The Grid overview is a hand-written marketing page with no Markdown form.
  if (slug === "grid") return undefined;
  return `/${slug}.md`;
}

export function markdownVariantPath(pathname: string) {
  if (pathname.endsWith(".md")) return undefined;
  return alternateMarkdownPath(pathname);
}

function isDocumentationPath(pathname: string) {
  return (
    pathname === "/docs" ||
    pathname === "/docs.md" ||
    pathname.startsWith("/docs/") ||
    pathname === "/grid" ||
    pathname.startsWith("/grid/")
  );
}

function parseAccept(value: string) {
  const ranges: MediaRange[] = [];
  for (const part of value.split(",")) {
    const [mediaType, ...parameters] = part
      .split(";")
      .map((item) => item.trim());
    const [type, subtype, extra] = mediaType.toLowerCase().split("/");
    if (!type || !subtype || extra) continue;

    let quality = 1;
    for (const parameter of parameters) {
      const [name, rawValue] = parameter.split("=").map((item) => item.trim());
      if (name.toLowerCase() !== "q") continue;
      const parsed = Number(rawValue);
      quality =
        Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? parsed : 0;
    }
    ranges.push({ type, subtype, quality });
  }
  return ranges;
}

function exactQuality(
  ranges: readonly MediaRange[],
  type: string,
  subtype: string,
) {
  const matches = ranges
    .filter((range) => range.type === type && range.subtype === subtype)
    .map((range) => range.quality);
  return matches.length > 0 ? Math.max(...matches) : undefined;
}

function qualityFor(
  ranges: readonly MediaRange[],
  type: string,
  subtype: string,
) {
  const exact = exactQuality(ranges, type, subtype);
  if (exact !== undefined) return exact;

  const typeWildcard = exactQuality(ranges, type, "*");
  if (typeWildcard !== undefined) return typeWildcard;

  return exactQuality(ranges, "*", "*") ?? 0;
}
