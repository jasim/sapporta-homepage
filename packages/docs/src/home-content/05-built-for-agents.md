## Built for agents, too

Sapporta projects are structured for coding agents. The generated codebase
follows explicit conventions for project structure. These conventions cover data
modeling, API behavior, UI flows, access rules, and migrations. Sapporta also
ships [sapporta-skills](https://github.com/jasim/sapporta-skills) for table
creation, reports, row access, custom endpoints, and front-end workflows. The
[legible-code](https://github.com/jasim/legible-code) skill applies domain
types, module boundaries, and the functional core, imperative shell design to
agent-authored TypeScript.

![A project progress report with counts and completion percentages](/assets/home/exercise-workflow/project-progress-report.png "Reports reuse the data model and drill into source records.")

Applications that you build with Sapporta can also be operated fully agentically
by default. Every Sapporta table receives REST routes. The running application
publishes these routes and its typed endpoints at `/api/openapi.json`. The
document has detailed route descriptions, usage examples, and documented request
parameters for every available endpoint. This includes the automatically
generated table APIs as well as any domain-specific APIs you write. A mounted
endpoint for an operation such as completing a task or reconciling a transaction
appears in the same document.

An agent can inspect the OpenAPI document, insert rows, update records, map
free-form data into database entries, run reports, answer data questions, and
call multi-step workflows through the same APIs used by the application UI.

For example, if you build an expense-tracking system with Sapporta, its users
can scribble reimbursement details—rough vendor names, relative dates, all in a
free-form structure—into an LLM agent and have them recorded accurately in the
database. This requires no additional application code, although the user needs
to have the [Sapporta skill](https://github.com/jasim/sapporta-skills)
installed.

A calorie tracker can accept a description of food and convert it into food,
quantity, and meal records. A person can inspect and correct those records in
the grid and export a week of data. A finance application can classify bank
memos and execute the reports shown in the interface.

API requests are subject to tokens, abilities, workspace scope, and row
visibility. Because all endpoints are secured by row security and authorization,
agents only have access to the exact data that the user has. An agent and a
person using the grid receive access according to the same server rules.
