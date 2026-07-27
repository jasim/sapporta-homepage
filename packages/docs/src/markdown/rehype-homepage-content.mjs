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

function addClass(node, ...classNames) {
  const existing = Array.isArray(node.properties?.className) ? node.properties.className : [];

  node.properties = {
    ...node.properties,
    className: [...new Set([...existing, ...classNames])],
  };
}

function hasClass(node, className) {
  return Array.isArray(node?.properties?.className) && node.properties.className.includes(className);
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
        tagName: "a",
        properties: {
          ariaLabel: `Open full-size screenshot: ${caption}`,
          className: ["home-screenshot__link"],
          href: src,
          rel: ["noreferrer"],
          target: "_blank",
        },
        children: [image],
      },
      {
        type: "element",
        tagName: "figcaption",
        properties: {
          className: ["home-screenshot__caption"],
        },
        children: [{ type: "text", value: caption }],
      },
    ],
  };
}

function isHomepageScreenshot(image) {
  return Boolean(image?.properties.src.startsWith("/assets/home/exercise-workflow/"));
}

function isHeading(node) {
  return node?.type === "element" && /^h[1-6]$/.test(node.tagName);
}

function nextContentIndex(children, startIndex) {
  let index = startIndex;
  while (index < children.length && isWhitespace(children[index])) {
    index += 1;
  }
  return index;
}

function hasFollowingScreenshots(children, index) {
  const screenshotIndex = nextContentIndex(children, index + 1);
  return Boolean(isHomepageScreenshot(imageFromParagraph(children[screenshotIndex])));
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
      const paragraph = tree.children[index];
      if (paragraph?.type !== "element" || paragraph.tagName !== "p" || imageFromParagraph(paragraph)) {
        children.push(paragraph);
        continue;
      }

      const figures = [];
      let nextIndex = index + 1;

      while (nextIndex < tree.children.length) {
        nextIndex = nextContentIndex(tree.children, nextIndex);

        const figure = screenshotFigure(tree.children[nextIndex]);
        if (!figure) break;
        figures.push(figure);
        nextIndex += 1;
      }

      if (figures.length === 0) {
        children.push(paragraph);
        continue;
      }

      const copy = [paragraph];
      while (nextIndex < tree.children.length) {
        const node = tree.children[nextIndex];
        if (
          isHeading(node) ||
          (node?.type === "element" &&
            node.tagName === "p" &&
            !imageFromParagraph(node) &&
            hasFollowingScreenshots(tree.children, nextIndex))
        ) {
          break;
        }

        copy.push(node);
        nextIndex += 1;
      }

      children.push({
        type: "element",
        tagName: "div",
        properties: { className: ["home-story"] },
        children: [
          {
            type: "element",
            tagName: "div",
            properties: {
              className: ["home-story__copy"],
            },
            children: copy,
          },
          {
            type: "element",
            tagName: "div",
            properties: {
              className: ["home-story__media"],
            },
            children: figures,
          },
        ],
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
  };
}
