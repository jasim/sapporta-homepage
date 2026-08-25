---
title: "Non-JSON and raw responses"
description:
  "Declare typed text or CSV output and reserve raw Response values for
  streaming, download headers, or other explicit transport behavior."
---

Use `c.otherResponse()` for the supported native text types: `text/csv` and
`text/plain`.

```ts
responses: {
  200: c.otherResponse({ contentType: "text/csv", body: z.string() }),
}
```

The handler can return the ordinary typed shape:

```ts
return {
  status: 200,
  body: "task_id,title,status\n1,Audit launch checklist,completed\n",
};
```

Return a raw `Response` only for streaming, a download filename, or custom
headers the normal return cannot express. It bypasses both the handler's
declared response type and runtime response-shape enforcement. The contract may
still document the intended output, but focused tests must prove the raw status,
headers, body, and cancellation behavior.

## Related documentation

- [Shared contracts and request validation](/docs/guides/application-code/shared-contracts-and-request-validation/)
- [Contract helpers and wire types](/docs/reference/contracts/contract-helpers-and-wire-types/)
- [Serialization and API errors](/docs/reference/contracts/serialization-and-api-errors/)
