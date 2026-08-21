## Why a framework instead of more prompting

Agents produce screens quickly, but they do not build the shared layer
underneath: one grid that filters and sorts, APIs that secure their own rows,
forms that follow the schema.

Ask for a filter on a list of tickets and the agent writes conditions for the
fields you named — then it handles equals but not contains, and breaks when
two conditions meet. Fixing it takes turns of specifying, checking,
correcting, and waiting. Someone still has to build the UI that shows the
filter is active, and clears it.

Then you want the same on invoices, and the logic repeats. The agent will not
stop and say filtering is a general idea; that kind of generalization exists
only in systems designed around it. Prompting feature by feature never
arrives at a shared architecture — each generated screen filters a little
differently, filtering exists only on the tables you happened to ask about,
and row checks exist only where someone remembered to prompt for them.

Sapporta is that shared layer, declared once and used by every table. Your
attention goes back to your own work — the workflows of your clinic CRM, your
inspection tracker, your vertical SaaS — instead of another round of
describing and fixing plumbing.
