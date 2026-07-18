import type { APIRoute } from "astro";
import { renderScopedIndex, textResponse } from "../../lib/agent-docs";

export const prerender = true;

export const GET: APIRoute = async () => textResponse(await renderScopedIndex("grid"), "text/plain; charset=utf-8");
