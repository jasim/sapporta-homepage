## Agentic use out of the box

Once a user connects a coding agent with
the [Sapporta skill](https://github.com/jasim/sapporta-skills), the agent can
work through the same application APIs as the UI. It can discover tables and
app-specific routes, inspect their exact contracts, then read or change records
without guessing a URL or request shape.

For example, if you build an expense-tracking system with Sapporta, its users
can scribble reimbursement details — rough vendor names, relative dates, all in
a free-form structure—into an LLM agent and have them recorded accurately in the
database.

This works out of the box because Sapporta publishes the application's API
surface at `/api/openapi.json`. It includes usage examples, and API signature
for every available endpoint. It is generated for the Sapporta table APIs as
well as for application specific APIs you write.