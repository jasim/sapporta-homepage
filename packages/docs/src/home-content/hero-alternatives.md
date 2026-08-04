CURRENT (line 28):
Applications built with Sapporta can also be operated fully agentically: `/api/openapi.json` exposes every registered endpoint and table operation, giving agents complete, contract-accurate access. That openness is safe because row-level security and CASL authorization apply on every call, so operators can rely on full exposure without insecure exposure.

---

OPTION 1 — Security-first reordering (authorization enables openness):
Every endpoint and table operation is protected by row-level security and CASL authorization. That protection makes full openness safe: `/api/openapi.json` exposes the complete API surface, giving agents contract-accurate access to every registered route without risking insecure data exposure for the operators who build and run the system.

---

OPTION 2 — Boundary/architecture framing (surface → boundary → trust):
The application's full surface — every registered endpoint and table operation — is discoverable at `/api/openapi.json`, so agents work with complete, contract-accurate access. Authorization is the architectural boundary: row-level security and CASL authorization enforce scope on every call, meaning operators can expose everything and still trust that no user data leaks insecurely.

---

OPTION 3 — Agent-verb / parallel structure (what agents do, what operators trust):
Agents discover and call every endpoint and table operation through `/api/openapi.json` with full contract accuracy. Operators expose that same complete surface knowing row-level security and CASL authorization enforce scope on each call — full agentic access without insecure exposure.

---

OPTION 4 — Concise elliptical / reduced clauses (tight flow, no filler):
`/api/openapi.json` exposes every endpoint and table operation for contract-accurate agentic access. Row-level security and CASL authorization apply on every call, so operators can open the full surface without opening insecure exposure.
