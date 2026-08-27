function imageFromParagraph(node) {
  if (node?.type !== "element" || node.tagName !== "p" || node.children?.length !== 1) {
    return undefined;
  }

  const image = node.children[0];
  if (image?.type !== "element" || image.tagName !== "img" || typeof image.properties?.src !== "string") {
    return undefined;
  }

  return image;
}

/*
 * Nodes reach us with their classes in either shape: hast uses a `className`
 * array, but Shiki hands back raw `class` strings on the elements it generates
 * (the highlighted <pre> carries `astro-code` that way). Reading both and
 * writing one keeps a highlighted block from losing the classes Shiki set.
 */
function classList(node) {
  const properties = node?.properties ?? {};
  const values = [properties.className, properties.class].flatMap((value) => {
    if (Array.isArray(value)) return value;
    return typeof value === "string" ? value.split(/\s+/) : [];
  });

  return values.filter(Boolean);
}

function addClass(node, ...classNames) {
  node.properties = {
    ...node.properties,
    className: [...new Set([...classList(node), ...classNames])],
  };

  delete node.properties.class;
}

function hasClass(node, className) {
  return classList(node).includes(className);
}

function isWhitespace(node) {
  return node?.type === "text" && typeof node.value === "string" && node.value.trim() === "";
}

function screenshotKind(src) {
  const filename = src.split("/").at(-1) ?? "";

  if (filename.includes("dashboard")) {
    return "dashboard";
  }
  if (filename.includes("form")) {
    return "form";
  }
  if (filename.includes("detail")) {
    return "detail";
  }
  return "grid";
}

function screenshotFigure(paragraph) {
  const image = imageFromParagraph(paragraph);
  if (!isHomepageScreenshot(image)) {
    return undefined;
  }

  const src = image.properties.src;
  const alt = typeof image.properties.alt === "string" ? image.properties.alt : "";
  const caption = typeof image.properties.title === "string" ? image.properties.title : alt;
  const kind = screenshotKind(src);

  delete image.properties.title;
  addClass(image, "home-screenshot__image");
  image.properties.loading = "lazy";
  image.properties.decoding = "async";

  return {
    type: "element",
    tagName: "figure",
    properties: {
      className: ["home-screenshot", `home-screenshot--${kind}`],
      dataScreenshotKind: kind,
    },
    children: [
      {
        type: "element",
        tagName: "figcaption",
        properties: {
          className: ["home-screenshot__caption"],
        },
        children: [{ type: "text", value: caption }],
      },
      {
        type: "element",
        tagName: "a",
        properties: {
          ariaLabel: `Open full-size screenshot: ${alt || caption}`,
          className: ["home-screenshot__link"],
          href: src,
          rel: ["noreferrer"],
          target: "_blank",
        },
        children: [image],
      },
    ],
  };
}

function isHomepageScreenshot(image) {
  return Boolean(image?.properties.src.startsWith("/assets/home/screenshots/"));
}

const contentBlockTags = new Set(["h1", "h2", "h3", "h4", "p", "ul", "ol", "pre", "blockquote", "hr", "table", "img"]);

function classifyContentNode(node, parent, isHero, heroParagraphIndex) {
  if (node?.type !== "element") {
    return heroParagraphIndex;
  }

  if (hasClass(node, "home-screenshot")) {
    return heroParagraphIndex;
  }

  if (contentBlockTags.has(node.tagName)) {
    addClass(node, "home-copy__measure");
  }

  switch (node.tagName) {
    case "h1":
    case "h2":
    case "h3":
    case "h4":
      addClass(node, "home-copy__heading", `home-copy__heading--level-${node.tagName.slice(1)}`);
      if (isHero && node.tagName === "h2") {
        addClass(node, "home-intro__title");
      }
      break;
    case "p":
      addClass(node, "home-copy__paragraph");
      if (parent?.tagName === "li") {
        addClass(node, "home-copy__paragraph--list-item");
      } else if (isHero) {
        addClass(node, heroParagraphIndex === 0 ? "home-intro__headline" : "home-intro__summary");
        heroParagraphIndex += 1;
      }
      break;
    case "ul":
    case "ol":
      addClass(
        node,
        "home-copy__list",
        node.tagName === "ul" ? "home-copy__list--unordered" : "home-copy__list--ordered",
      );
      break;
    case "li":
      addClass(node, "home-copy__list-item");
      break;
    case "a":
      addClass(node, "home-copy__link");
      break;
    case "strong":
      addClass(node, "home-copy__strong");
      break;
    case "em":
      addClass(node, "home-copy__emphasis");
      break;
    case "code":
      addClass(node, parent?.tagName === "pre" ? "home-copy__code-block-content" : "home-copy__inline-code");
      break;
    case "pre":
      addClass(node, "home-copy__code-block");
      break;
    case "blockquote":
      addClass(node, "home-copy__quote");
      break;
    case "hr":
      addClass(node, "home-copy__rule");
      break;
    case "table":
      addClass(node, "home-copy__table");
      break;
    case "th":
      addClass(node, "home-copy__table-heading");
      break;
    case "td":
      addClass(node, "home-copy__table-cell");
      break;
    case "img":
      addClass(node, "home-copy__image");
      break;
  }

  for (const child of node.children ?? []) {
    heroParagraphIndex = classifyContentNode(child, node, isHero, heroParagraphIndex);
  }

  return heroParagraphIndex;
}

function isHomepageContent(file) {
  const path = file?.path ?? file?.history?.[file.history.length - 1];

  return typeof path === "string" && /[/\\]src[/\\]home-content[/\\]/.test(path);
}

function isHeroContent(file) {
  const path = file?.path ?? file?.history?.[file.history.length - 1];

  return typeof path === "string" && /[/\\]home-content[/\\]hero\.md$/.test(path);
}

export function rehypeHomepageContent() {
  return (tree, file) => {
    if (!Array.isArray(tree.children)) {
      return;
    }

    const children = [];

    for (let index = 0; index < tree.children.length; index += 1) {
      const figure = screenshotFigure(tree.children[index]);
      if (!figure) {
        children.push(tree.children[index]);
        continue;
      }

      const figures = [figure];
      let nextIndex = index + 1;

      while (nextIndex < tree.children.length) {
        if (isWhitespace(tree.children[nextIndex])) {
          nextIndex += 1;
          continue;
        }

        const nextFigure = screenshotFigure(tree.children[nextIndex]);
        if (!nextFigure) break;
        figures.push(nextFigure);
        nextIndex += 1;
      }

      children.push({
        type: "element",
        tagName: "div",
        properties: { className: ["home-screenshot-stack"] },
        children: figures,
      });
      index = nextIndex - 1;
    }

    tree.children = children;

    if (!isHomepageContent(file)) {
      return;
    }

    let heroParagraphIndex = 0;
    for (const child of tree.children) {
      heroParagraphIndex = classifyContentNode(child, tree, isHeroContent(file), heroParagraphIndex);
    }

    if (isHeroContent(file)) {
      return;
    }

    // The first paragraph after each h2 is the section's lede: the one-line
    // summary a skimmer reads instead of the body.
    for (let index = 0; index < tree.children.length; index += 1) {
      const node = tree.children[index];
      if (node?.type !== "element" || node.tagName !== "h2") {
        continue;
      }

      let nextIndex = index + 1;
      while (nextIndex < tree.children.length && isWhitespace(tree.children[nextIndex])) {
        nextIndex += 1;
      }

      const next = tree.children[nextIndex];
      if (next?.type === "element" && next.tagName === "p") {
        addClass(next, "home-copy__lede");
      }
    }
  };
}
