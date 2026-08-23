import { describe, expect, it } from "vitest";
import {
  alternateMarkdownPath,
  explicitlyPrefersMarkdown,
  markdownVariantPath,
} from "./docs-negotiation.js";

describe("explicitlyPrefersMarkdown", () => {
  it.each([undefined, "*/*", "text/html", "text/markdown, text/html"])(
    "keeps HTML for %s",
    (accept) => {
      expect(explicitlyPrefersMarkdown(accept)).toBe(false);
    },
  );

  it.each([
    "text/markdown",
    "text/markdown;q=0.9, text/html;q=0.8",
    "text/markdown;q=0.8, */*;q=0.1",
  ])("selects Markdown for %s", (accept) => {
    expect(explicitlyPrefersMarkdown(accept)).toBe(true);
  });

  it("uses the most specific HTML quality on wildcard ranges", () => {
    expect(explicitlyPrefersMarkdown("text/markdown;q=0.8, text/*;q=0.9")).toBe(
      false,
    );
  });

  it("does not select an explicitly unacceptable Markdown response", () => {
    expect(explicitlyPrefersMarkdown("text/markdown;q=0, */*;q=1")).toBe(false);
  });
});

describe("documentation Markdown paths", () => {
  it.each([
    [
      "/docs/guides/security/authentication-and-abilities/",
      "/docs/guides/security/authentication-and-abilities.md",
    ],
    ["/docs/guides", "/docs/guides.md"],
    ["/docs", "/docs.md"],
    ["/grid/reference/", "/grid/reference.md"],
  ])("maps %s to %s", (pathname, expected) => {
    expect(markdownVariantPath(pathname)).toBe(expected);
  });

  it.each(["/", "/grid", "/grid/", "/docs/llms.txt", "/docs/page.md"])(
    "does not negotiate %s",
    (pathname) => {
      expect(markdownVariantPath(pathname)).toBeUndefined();
    },
  );

  it("keeps an explicit Markdown URL as its own alternate", () => {
    expect(alternateMarkdownPath("/docs/guides.md")).toBe("/docs/guides.md");
    expect(alternateMarkdownPath("/docs.md")).toBe("/docs.md");
  });
});
