import type { APIRoute } from "astro";
import { apiReferenceIndex } from "../../lib/api-reference";
import { textResponse } from "nuaj-agent-docs/catalog";

export const prerender = true;

export const GET: APIRoute = async () =>
  textResponse(apiReferenceIndex(), "text/plain; charset=utf-8");
