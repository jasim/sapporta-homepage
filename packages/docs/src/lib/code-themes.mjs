/*
 * One Shiki theme pair for every code sample on the homepage: the <Code>
 * component in the demo panel and the fenced blocks inside home-content MDX.
 * Dual themes render the light tokens inline and carry the dark ones along in
 * `--shiki-dark` custom properties, which homepage-essay.css promotes to the
 * live colour under data-theme="dark" -- so the page switches themes without
 * shipping a second stylesheet or any client JavaScript.
 */

/** @type {{ light: "github-light-default"; dark: "github-dark-default" }} */
export const codeThemes = {
  light: "github-light-default",
  dark: "github-dark-default",
};
