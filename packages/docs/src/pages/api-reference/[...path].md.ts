import type { APIRoute, GetStaticPaths } from "astro";
import { getApiReferencePages, getApiReferenceSubPages } from "../../lib/api-reference";
import { textResponse } from "../../lib/agent-docs";

export const prerender = true;

export const getStaticPaths = (() =>
  getApiReferenceSubPages().map((page) => ({
    params: { path: page.slug },
    props: { slug: page.slug },
  }))) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const page = getApiReferencePages().get(String(props.slug));
  if (!page) return new Response("Not found\n", { status: 404 });

  return textResponse(page.content, "text/markdown; charset=utf-8");
};
