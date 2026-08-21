## Agentic use out of the box

Every endpoint and table operation is published to `/api/openapi.json`, so
agents get full access to your application — with row-level security and
CASL authorization enforced on every call.

**Freeform data entry using agents.** In a calorie tracker built with
Sapporta, you can scribble your meal into your coding agent in shorthand —
"about 2 hours ago, brekkie - toast butter with 2 banans" — or dictate it by
voice. The agent maps the items to foods already in your database, converts
them into valid structured entries, and if a food doesn't exist it creates
it, looks up standard nutrition information, and links everything up. No
extra code: the generated table APIs plus the
[Sapporta Skill](https://github.com/jasim/sapporta-skills/tree/main/skills/sapporta/references/data-console)
let the agent run complex multi-step workflows on their own.

**Complex multi-step queries.** In the personal book-keeping system I built
with Sapporta, I can point an agent at it and ask why my computed bank
balance doesn't match. It finds the duplicated, missing, or erroneous
transactions — analysis that used to take hours of drudgery.
