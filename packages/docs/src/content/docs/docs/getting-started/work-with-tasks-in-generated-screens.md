---
title: "Work with tasks in generated screens"
description:
  "Create, edit, search, filter, and relate task records through generated
  screens and their generated API requests."
---

The project and task schemas from the previous page already describe an ordinary
record workflow. This page traces that metadata into generated list, create,
detail, and edit screens, then follows the matching requests in the browser. You
will create related records, edit and find a task, and navigate from a project
to its tasks without adding a project-owned React route. The same pattern
supplies the first usable workflow for other table-shaped application data.

```text
Use the generated project and task screens with me. I want to create related records, edit a task, search it, and confirm the browser uses the generated table API.
```

## Read the screen from the schema

The generated experience follows the types, Drizzle foreign key, and Sapporta
metadata defined on the previous page:

- `rowLabelColumns: ["name"]` displays project names in task lookups.
- `select()` options render status and priority as searchable, clearable
  comboboxes.
- `date()` renders a date editor and preserves the canonical `YYYY-MM-DD` wire
  value.
- `search.columns` activates search across task title and description.
- the project's `children` entry adds a Tasks collection to project detail.
- row-scope columns and managed timestamps stay out of ordinary forms and grids.

Presentation metadata does not authorize data. Generated lookups, lists, gets,
and writes still run through the current request's abilities and row-visibility
policy on the server.

## Create a project and task

Start the app and inspect the generated create operations before using the
screens:

```bash
pnpm dev
pnpm exec sapporta endpoints show "POST /api/tables/projects"
pnpm exec sapporta endpoints show "POST /api/tables/tasks"
```

Open `/tables/projects` in an authenticated browser and create a project named
**Website Relaunch**. Then open `/tables/tasks/new` and enter:

| Field       | Value                    |
| ----------- | ------------------------ |
| Title       | Publish launch checklist |
| Project     | Website Relaunch         |
| Status      | in_progress              |
| Priority    | medium                   |
| Due date    | 2026-08-01               |
| Description | Prepare the release list |

The Project field stores the numeric project ID and displays the project name.
Its picker reads the generated lookup route:

```http
GET /api/tables/projects/_lookup?q=Website
```

```json
{
  "entries": [
    {
      "value": 1,
      "label": "Website Relaunch",
      "meta": { "id": 1, "name": "Website Relaunch" }
    }
  ]
}
```

Lookup values preserve the referenced primary-key type. This project uses an
integer key, so the task request sends `project_id` as a JSON number.

Status and priority use local option lists from their `select()` column
declarations. Text entered in either combobox filters those options and does not
become the saved value. The chosen option remains the exact declared string.

<!--
Screenshot brief
Suggested asset: getting-started-generated-task-create.png
Setup: Create the Website Relaunch project, open `/tables/tasks/new`, fill the walkthrough values, and open the Project lookup so Website Relaunch is visible.
Frame: Capture the full generated form with the project-name lookup, one open status or priority combobox, date input, and multiline description. Exclude browser developer tools.
Visible proof: Project displays a name instead of a numeric ID, the combobox filters declared options, due date has a date editor, and server-managed scope fields are absent.
Alt text: Generated task creation form with a named project lookup and searchable controlled task fields.
-->

Open the browser Network panel before saving. The generated form sends this
request under the framework `/api` prefix:

```http
POST /api/tables/tasks
Content-Type: application/json

{
  "project_id": 1,
  "title": "Publish launch checklist",
  "description": "Prepare the release list",
  "status": "in_progress",
  "priority": "medium",
  "due_date": "2026-08-01"
}
```

The form decodes its draft on submit. It preserves invalid field text when local
decoding fails and sends finite numbers or canonical date values only after a
successful decode. The server then adds trusted scope values, runs
visible-reference checks, performs authoritative structural and application
validation, writes the parsed row, and returns HTTP 201. The relevant response
fields are:

```json
{
  "data": {
    "id": 1,
    "project_id": 1,
    "title": "Publish launch checklist",
    "description": "Prepare the release list",
    "status": "in_progress",
    "priority": "medium",
    "due_date": "2026-08-01"
  }
}
```

The request body omits IDs, timestamps, and scope columns. Clients do not choose
workspace, owner, role, or scope values. The API derives them from request
authority.

<!--
Screenshot brief
Suggested asset: getting-started-generated-task-network.png
Setup: Open browser developer tools before saving the task. Preserve the selected POST `/api/tables/tasks` request after the server returns 201.
Frame: Capture the Network request name, method, status, JSON request payload, and the created-row response. Redact cookies, tokens, and workspace identifiers.
Visible proof: The generated form uses POST under `/api`, submits typed task fields and a numeric project_id, omits scope fields, and receives a `{ data }` response.
Alt text: Browser Network panel showing the generated task form POST request and created-row response.
-->

## Edit, search, and follow the relationship

Open the saved task and change its status to **open**. The browser sends a
generated update request with a patch-shaped body even though the HTTP method is
`PUT`:

```http
PUT /api/tables/tasks/1
Content-Type: application/json

{ "status": "open" }
```

```json
{
  "data": {
    "id": 1,
    "project_id": 1,
    "title": "Publish launch checklist",
    "status": "open",
    "priority": "medium",
    "due_date": "2026-08-01"
  }
}
```

Generated row updates use `PUT`, not `PATCH`. The server applies the update to
the requested ID and the active row-visibility predicate in the same write.

Return to `/tables/tasks` and search for **launch**. Filter status to **open**
with the searchable multi-value combobox and confirm the saved task remains. The
chosen value appears as a removable chip; the combobox query itself is not part
of the filter. Then open **Website Relaunch** and find the task in its **Tasks**
child collection. The lookup, task list, task detail, and child list all use
generated routes with the same row boundary.

<!--
Screenshot brief
Suggested asset: getting-started-project-task-child.png
Setup: Save the task with open status, search for it in the tasks grid, then open the Website Relaunch project detail route.
Frame: Capture the project heading and Tasks child collection with title, status, priority, and due date visible. Keep the child result count in frame if available.
Visible proof: The related task is reachable from its project and displays the same values saved through the generated task form.
Alt text: Generated project detail screen with the related open task in its Tasks collection.
-->

The task app now has a complete generated record loop: create, validate, edit,
search, lookup, detail, and parent-child navigation. The browser requests show
that these screens are clients of the same generated CRUD API, and hidden fields
remain presentation rather than authorization. Continue to
[Query tasks through the generated API](/docs/getting-started/query-tasks-through-the-generated-api/)
to call those routes directly. The
[record screens and forms guide](/docs/guides/generated-surfaces/record-screens-and-forms/)
and
[generated record surfaces reference](/docs/reference/frontend/generated-record-surfaces/)
describe the available generated behavior in more depth.
