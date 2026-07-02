export function toAppHref(path: string, appBaseUrl: string): string {
  if (!path.startsWith("/")) {
    throw new Error(`App paths must start with "/": ${path}`);
  }

  const normalizedBaseUrl = appBaseUrl.trim().replace(/\/+$/, "");
  if (!normalizedBaseUrl) {
    return path;
  }

  return `${normalizedBaseUrl}${path}`;
}
