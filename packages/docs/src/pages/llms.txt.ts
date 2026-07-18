import type { APIRoute } from "astro";
import { renderRootIndex, textResponse } from "../lib/agent-docs";

export const prerender = true;

export const GET: APIRoute = async () => textResponse(await renderRootIndex(), "text/plain; charset=utf-8");
