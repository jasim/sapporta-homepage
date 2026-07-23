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
  if (!image) return undefined;

  const src = image.properties.src;
  if (!src.startsWith("/assets/home/exercise-workflow/")) {
    return undefined;
  }

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
        while (
          nextIndex < tree.children.length &&
          isWhitespace(tree.children[nextIndex])
        ) {
          nextIndex += 1;
        }

        const figure = screenshotFigure(tree.children[nextIndex]);
        if (!figure) break;
        figures.push(figure);
        nextIndex += 1;
      }

      if (figures.length === 0) {
        children.push(paragraph);
        continue;
      }

      children.push({
        type: "element",
        tagName: "div",
        properties: { className: ["essay-beat"] },
        children: [
          {
            type: "element",
            tagName: "div",
            properties: { className: ["essay-beat-media"] },
            children: figures,
          },
          paragraph,
        ],
      });
      index = nextIndex - 1;
    }

    tree.children = children;
  };
}
