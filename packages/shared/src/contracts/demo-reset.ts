// Contract for the demo-data reset endpoint. A scheduled job POSTs to
// /api/demo-reset to wipe the books and quotes tables and reload them from
// the pristine snapshot (`original.db`) that sits next to the live database
// file. See `packages/api/app/demo-reset.ts` for the handler.

import { z } from "zod";
import { initContract } from "@sapporta/rest-core";

const c = initContract();

export const demoResetContract = c.router({
  demoReset: c.mutation({
    method: "POST",
    path: "/demo-reset",
    summary: "Restore books and quotes from the original.db demo snapshot",
    body: c.noBody(),
    responses: {
      200: z.object({
        books: z.number(),
        quotes: z.number(),
      }),
    },
  }),
});
