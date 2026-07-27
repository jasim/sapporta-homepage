function imageFromParagraph(node) {
  if (
    node?.type !== "element" ||
    node.tagName !== "p" ||
    node.children?.length !== 1
  ) {
    return undefined;
  }

  const image = node.children[0];
  if (
    image?.type !== "element" ||
    image.tagName !== "img" ||
    typeof image.properties?.src !== "string"
  ) {
    return undefined;
  }

  return image;
}

function isWhitespace(node) {
  return (
    node?.type === "text" &&
    typeof node.value === "string" &&
    node.value.trim() === ""
  );
}

function screenshotFigure(paragraph) {
  const image = imageFromParagraph(paragraph);
  if (!isHomepageScreenshot(image)) {
    return undefined;
  }

  const src = image.properties.src;
  const alt =
    typeof image.properties.alt === "string"
      ? image.properties.alt
      : "";
  const caption =
    typeof image.properties.title === "string"
      ? image.properties.title
      : alt;

  delete image.properties.title;
  image.properties.className = ["grid-shot-image"];
  image.properties.loading = "lazy";
  image.properties.decoding = "async";

  return {
    type: "element",
    tagName: "figure",
    properties: { className: ["grid-shot"] },
    children: [
      {
        type: "element",
        tagName: "a",
        properties: {
          ariaLabel: `Open full-size screenshot: ${caption}`,
          className: ["grid-shot-button"],
          href: src,
          rel: ["noreferrer"],
          target: "_blank",
        },
        children: [image],
      },
      {
        type: "element",
        tagName: "figcaption",
        properties: {},
        children: [{ type: "text", value: caption }],
      },
    ],
  };
}

function isHomepageScreenshot(image) {
  return Boolean(
    image?.properties.src.startsWith(
      "/assets/home/exercise-workflow/",
    ),
  );
}

function isHeading(node) {
  return (
    node?.type === "element" &&
    /^h[1-6]$/.test(node.tagName)
  );
}

function nextContentIndex(children, startIndex) {
  let index = startIndex;
  while (
    index < children.length &&
    isWhitespace(children[index])
  ) {
    index += 1;
  }
  return index;
}

function hasFollowingScreenshots(children, index) {
  const screenshotIndex = nextContentIndex(
    children,
    index + 1,
  );
  return Boolean(
    isHomepageScreenshot(
      imageFromParagraph(children[screenshotIndex]),
    ),
  );
}

export function rehypeHomepageScreenshots() {
  return (tree) => {
    if (!Array.isArray(tree.children)) {
      return;
    }

    const children = [];

    for (let index = 0; index < tree.children.length; index += 1) {
      const paragraph = tree.children[index];
      if (
        paragraph?.type !== "element" ||
        paragraph.tagName !== "p" ||
        imageFromParagraph(paragraph)
      ) {
        children.push(paragraph);
        continue;
      }

      const figures = [];
      let nextIndex = index + 1;

      while (nextIndex < tree.children.length) {
        nextIndex = nextContentIndex(
          tree.children,
          nextIndex,
        );

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
            hasFollowingScreenshots(
              tree.children,
              nextIndex,
            ))
        ) {
          break;
        }

        copy.push(node);
        nextIndex += 1;
      }

      children.push({
        type: "element",
        tagName: "div",
        properties: { className: ["essay-beat"] },
        children: [
          {
            type: "element",
            tagName: "div",
            properties: {
              className: ["essay-beat-copy"],
            },
            children: copy,
          },
          {
            type: "element",
            tagName: "div",
            properties: { className: ["essay-beat-media"] },
            children: figures,
          },
        ],
      });
      index = nextIndex - 1;
    }

    tree.children = children;
  };
}
