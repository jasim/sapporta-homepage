import type { APIRoute } from "astro";
import { renderFullBundle, textResponse } from "../../lib/agent-docs";

export const prerender = true;

export const GET: APIRoute = async () => textResponse(await renderFullBundle("docs"), "text/plain; charset=utf-8");
