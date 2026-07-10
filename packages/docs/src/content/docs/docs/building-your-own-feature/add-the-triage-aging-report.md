---
title: "Add The Triage Aging Report"
description:
  "Create a route-based GridDataset for active task aging with links back
  to source records."
---

Add a route-based report:

```text
GET /api/reports/triage-aging
```

Query parameters:

```text
project_id?
assignee_id?
from?
to?
```

Return a `GridDataset` whose root level has visible columns shaped like:

```text
project
assignee
status
priority
open_count
overdue_count
oldest_due_date
```

Include hidden IDs for link resolvers:

```text
project_id
person_id
```

Links should navigate from project and assignee cells to generated record pages,
and from counts to filtered task table URLs. Optional task detail rows can link
to `/tables/tasks/:id`.

Verify:

```bash
pnpm exec sapporta endpoints show "GET /api/reports/triage-aging"
```

Next: [Seed And Validate](/docs/building-your-own-feature/seed-and-validate/).
