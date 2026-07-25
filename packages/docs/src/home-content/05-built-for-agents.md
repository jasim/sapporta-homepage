## Agentic use out of the box

Applications that you build with Sapporta can be operated fully agentically
by default.

Agents can insert new rows, or update existing rows, map freeform data into
database entries, execute multi-step workflows, run reports, and answer data
questions, all through the same APIs used by the application UI.

For example, if you build an expense-tracking system with Sapporta, its users
can scribble reimbursement details — rough vendor names, relative dates, all in a
free-form structure—into an LLM agent and have them recorded accurately in the
database. This requires no additional application code, although the user needs
to have the [Sapporta skill](https://github.com/jasim/sapporta-skills)
installed.

This works because Sapporta publishes the application's API surface at
`/api/openapi.json`. It has detailed route descriptions, usage examples, and
documented request parameters for every available endpoint. This includes all
the automatically generated table APIs as well as any domain specific APIs
written by you.

It is also secure by default - since all endpoints are secured by row-security
and CASL, the agents only have access to the exact data that the user themselves
have.