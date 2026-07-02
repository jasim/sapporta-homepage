## Core tone: Factual-declarative register

This is the dominant mode. Every paragraph is a clean assertion of what
something **is** or **does**, not what it _avoids_, _replaces_, or _isn't_. The
writing feels like technical documentation written by someone who trusts the
reader to evaluate the product on its own terms.

**Concrete examples from the user's own writing:**

> "Sapporta provides an extensible datagrid for your tables, similar to AirTable
> and NocoDB."

> "These grids are live as soon as you define their Drizzle schema and Sapporta
> table metadata."

> "Projects generated using Sapporta use Hono for the back-end, React for the
> front-end, and ts-rest for type-safe API clients."

> "There is no inversion of control — your codebase owns its runtime, imports
> its own dependencies, and deploys as a regular Node.js process."

The last one is instructive: it **does** contain a negation ("no inversion of
control"), but it's a factual property claim, not a rhetorical "instead of"
move. The negation is immediately followed by an affirmative, concrete,
mechanical description of what ownership means.

---

## Linguistic / terminological breakdown

### 1. Positive assertion rather than contrastive framing

The writer avoids the **contrastive connective** ("instead of," "rather than,"
"unlike") as a structural device. Features are introduced through what they
_are_, not through what they _replace_.

| Do — positive assertion                                              | Don't — contrastive / negated framing                         |
| -------------------------------------------------------------------- | ------------------------------------------------------------- |
| "Sapporta provides an extensible datagrid for your tables"           | "No stitching ORMs to auth layers to UI frameworks by hand"   |
| "The generated project is a regular Hono + React application"        | "working software instead of debugging generated spaghetti"   |
| "Define your tables... and the stack generates..." (causal-positive) | "No black-box abstractions — just a curated TypeScript stack" |

The "just" in that last don't-example is also a giveaway — it's a **minimizer**
that carries informal, conversational weight.

### 2. Third-person product subject

The grammatical subject is consistently **the product** ("Sapporta," "These
grids," "Projects generated using Sapporta"), not the reader's experience or the
writer's opinion. This is the **impersonal declarative** — the writer is a
neutral describer, not a persuader.

### 3. Causal-positive connectives

When linking cause and effect, the writer uses **"as soon as"** (immediacy, not
contrast) and **"and"** (simple conjunction, not "but" or "however"):

> "These grids are live as soon as you define their Drizzle schema and Sapporta
> table metadata."

No "once you define" (temporal-but-still-faintly-conditional), no "when"
(vague). "As soon as" is precise about the trigger.

### 4. Concrete technical enumeration

The writer names specific technologies in sequence without commentary:

> "Hono for the back-end, React for the front-end, and ts-rest for type-safe API
> clients"

This is **paratactic listing** — items joined by commas and "and" with no
subordination, no evaluation. The list _is_ the argument.

### 5. Short declarative sentences with low clause density

Sentences are one main clause, maybe one subordinate clause. No nested
conditionals, no parenthetical asides, no rhetorical stacking.

### 6. Absence of informal metaphors and register-dropping

No "spaghetti," no "batteries-included," no "drop a rough prompt," no "by hand."
These are all **informal-register metaphors** that introduce a conversational,
almost bloggy texture. The user's writing stays in a consistent
**technical-neutral register** — not academic, not marketing, not casual.

---

## Narrative structure: Feature-by-feature parataxis

The user doesn't build an argument arc (problem → solution → benefit). Instead
they present a **flat, paratactic sequence** of feature-descriptions:

1. Datagrid feature (what it is, how it activates)
2. Reporting, APIs, auth, agent skills (what else is in the box)
3. Agentic capabilities (who can operate it)
4. Tech stack (what it's built on)
5. Ownership philosophy (what "no inversion of control" actually means)
6. Synthesis (what these pieces together enable)

Each paragraph is a self-contained **fact-block**. No paragraph depends on the
previous one for its rhetorical force. The reader can skim any paragraph and get
a complete, self-standing claim.

This is the **expository-paratactic** structure: thesis statements in sequence,
not in hierarchy.

---

## Dos and Don'ts (codified)

| Do                                                                                                          | Don't                                                                  |
| ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Use the product as the grammatical subject ("Sapporta provides...")                                         | Use the reader's struggle as the opener ("You'd otherwise have to...") |
| State what something is, positively                                                                         | State what something isn't, as the primary framing                     |
| Use "and" / "as soon as" for causation                                                                      | Use "instead of" / "unlike" / "rather than" for contrast               |
| Name specific technologies in paratactic lists                                                              | Use metaphorical shorthand ("curated stack" without specifics)         |
| Keep sentences to one main clause                                                                           | Nest conditionals, concessions, or rhetorical questions                |
| Write in technical-neutral register                                                                         | Drop into informal ("just," "rough," "spaghetti," "by hand")           |
| Present features as flat, self-contained fact-blocks                                                        | Build a problem → solution → benefit argument arc                      |
| Use "no X" only when immediately followed by a concrete, affirmative description of what that absence means | Use "no X" as a standalone rhetorical flourish                         |

---

## The core principle

The user's writing operates on a single axiom: **the product is interesting
enough that describing it accurately is sufficient**. No persuasion, no
contrast, no informal warmth needed. The writing's job is to be a transparent
window onto the thing itself — not to sell the window.
