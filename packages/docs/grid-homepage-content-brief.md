# Sapporta Grid homepage content brief

This file records the content direction for the Sapporta Grid homepage. It is
an input to a later homepage rewrite. The current page, components, and styles
remain unchanged during this stage.

## Editorial direction

- Write for a programmer evaluating grids for a real application.
- Let each section answer the programmer's next practical question without
  printing that question as a heading or in the body copy.
- Describe the experience the application can give its users and the APIs a
  programmer uses to produce that experience. Internal machinery belongs on
  the homepage only when it changes what the programmer can build.
- Describe observable system behavior. Avoid feature-list marketing,
  superlatives, and broad claims.
- Use the product and its components as the grammatical subject while keeping
  the sequence aligned with the programmer's evaluation process.
- Distinguish the framework-independent runtime from the React renderer.
- Qualify behavior that belongs to a data source, host application, or optional
  integration rather than presenting it as unconditional runtime behavior.

## Proof standard

Each important capability should follow a tell-then-show pattern. The copy
first states the user experience in plain language. The adjacent artifact then
proves the claim with one of these forms:

- a live interaction in the homepage grid;
- a compact key-to-action reference;
- a screenshot of a UI that would be awkward to keep open in the main demo;
- a short public API example that produces the described behavior; or
- a test excerpt that operates the framework-independent runtime directly.

Technical names should appear when the programmer must use that name in code.
Internal concepts such as identity preservation, path registration, source
disposal, and subscription invalidation should not appear as standalone
benefits. They are implementation work that makes the visible behavior
reliable.

## Opening definition and demonstration

The opening section should establish Sapporta Grid as an extensible grid
framework for React applications. Its schema defines levels, columns, editing
behavior, and interactions. A composable JavaScript runtime operates the grid,
and the shipped React components render that runtime. Applications can use the
provided styling and column presets or replace individual renderers, editors,
and visual rules.

The explanation should connect this architecture to the programmer's actual
decision: the default React grid should be useful immediately, while the core
model should remain adaptable when the application's data, interaction, or
visual requirements become more specific.

The opening demonstration should show schema-as-code and the resulting live
Sapporta Grid at the same time. They must be separate visual containers in one
vertical sequence:

1. A dedicated code container containing the schema and the minimum runtime
   setup.
2. A dedicated live-demo container directly below it containing the grid
   produced by that code.

Both containers should be visible together at a normal desktop viewport when
practical. The demo should be a real interactive grid rather than a static
table imitation. Editing, keyboard movement, and a nested level would make the
relationship between the schema and the result testable. Responsive behavior
can preserve the same code-then-demo order on narrower screens.

The demo should also act as the page's primary source of proof. Short prompts
or annotations can invite the visitor to expand a row, edit a value, create a
record, change a sort, select a range, and use the keyboard. The result of each
action should be visible in the grid.

## Capability narrative

The next section should explain the work the grid can perform, starting with
the capabilities that distinguish it from a flat table component.

### Hierarchical grids

Sapporta Grid supports multi-level and nested grids. A level can expand into a
different child grid with its own columns, rows, editing rules, and data
source. Different branches can use different child levels. Keyboard focus,
selection, expansion, and editing operate across the expanded hierarchy.

The homepage demo should make this concrete with at least two levels. A useful
example would show projects at the root, tasks below a project, and a distinct
child level under another kind of row if the schema and demo can stay legible.
An annotation should explain that expanding a project loads its task grid and
that the child grid can use different columns and a different API from the
project grid. The visitor should perform the expansion rather than only see an
already-expanded screenshot.

### Data from local state or existing APIs

Each grid level can obtain rows from local memory or a remote service. Each
nested level can resolve its own data source, so expanding a row may load data
from an endpoint that differs from the root endpoint or from sibling levels.
Users see loading, ready, refreshing, and failure feedback within the level
that requested the data. The data source shapes the returned rows and adapts
the application's request and response format to the grid.

The API integration should be described as an adapter contract rather than a
fixed backend signature. An application can connect its existing endpoint
shape to the grid data-source interface. The grid does not require the backend
to adopt one prescribed URL or payload format.

### Editing and persistence

Sapporta Grid supports editable cells and row operations. The in-memory data
source can apply edits directly to local rows. A remote data source can expose
write capabilities that translate edits, inserts, and removals into the
application's API calls. Each level can use a different persistence adapter.

The public copy should separate the visible editing experience from the save
adapter. Users edit cells in place and see saving or failure feedback. The
programmer connects those commits to an in-memory object or to an existing API
through the data source.

### Creating records

Users can create a record directly inside the grid. A new row can remain an
editable draft, show that its create request is in progress, and retain the
entered values with an error message when the request fails. The programmer
controls when a draft counts as nonblank, how it is validated, when it is
committed, and how the resulting record is saved.

This is the homepage value of draft and phantom rows. The public narrative
should call them new rows or draft rows unless an API example needs the exact
runtime term. The demonstration should show a user entering a new row and one
of these outcomes:

1. The row is saved and becomes a normal record.
2. The save fails and the entered values remain available for correction and
   retry.

A compact API example can show the fine control available to the programmer:

```ts
const level = runtime.root;

level.drafts.add("new-task", { title: "" });
level.drafts.setCell("new-task", "title", "Review import");
await level.drafts.commit("new-task");
```

### Sorting, filtering, and shareable state

Grid data sources can expose sorting, filtering, refetching, and pagination
state. These operations may run locally or be translated into remote queries.
Host-backed query state can synchronize filters, sorting, and page state with
the browser URL. That integration gives a grid view a shareable URL and keeps
navigation state aligned with the visible rows.

The homepage should briefly and explicitly name sorting and filtering rather
than leaving them implied by the larger architecture. The proof should be
specific:

- Show the existing filtering-interface screenshot. Its visible controls and
  active filter state should demonstrate what users can construct, rather than
  presenting filtering as a feature label.
- State that sortable columns support ascending and descending order. The live
  demo can prove this with the column-header menu or sort indicator.
- Show the browser URL before and after a filter changes, or place a short URL
  example beside the filtering screenshot. This demonstrates how a filtered
  view becomes linkable when the host connects query state to the URL.

### Keyboard operation

Keyboard support should be described through exact actions. The homepage can
place a compact reference beside the live grid and let the visitor try the
same keys:

| Key | Visible result |
| --- | --- |
| Arrow keys | Move the active cell or active row. |
| Shift + Arrow | Extend the current cell range or row selection in a configured selection mode. |
| Tab / Shift + Tab | Move to the next or previous grid target. |
| Enter or F2 | Start editing an editable cell. |
| Typing | Start editing and pass the typed character into the editor. |
| Escape | Clear the current selection; editor behavior should be verified separately before publication. |
| Ctrl/Cmd + Home | Move to the first grid target. |
| Ctrl/Cmd + End | Move to the last grid target. |
| Page Up / Page Down | Move ten rows up or down. |
| Right / Left | Expand or collapse an active row when row expansion is configured. |
| Space | Toggle the active row when the selected interaction preset assigns that action. |

The final list must match the interaction preset used by the live demo. The
page should not combine keys from mutually exclusive presets and imply that
all grids use one fixed keyboard model.

### Runtime, rendering, and styling

The core is a JavaScript grid runtime. A programmer can load rows, expand a
nested grid, sort, filter, edit, create, select, and run row operations through
that runtime without rendering a React component.

Sapporta Grid ships with React rendering primitives, column presets, and
styles for a practical default surface. Applications can start without those
styles, use the public DOM and state attributes with their own CSS, or provide
custom cell renderers and editors. Framework renderers other than React are an
architectural extension point; the homepage should only promise shipped or
documented renderers by name.

The framework-independent claim needs executable proof. The preferred source
is `sapporta/packages/grid/src/grid/runtime/runtime.e2e.test.ts`. That test uses
`createGridRuntime()` without rendering React and drives a realistic
orders-to-lines hierarchy through remote loading, sorting, expansion, editing,
server confirmation, rejection, and refetching.

The homepage should use a shortened excerpt built only from public APIs. One
possible sequence is:

```ts
const runtime = createGridRuntime({ schema, dataSource });
const orderId = makeRowId(runtime.root.path, "O1");

await runtime.root.data.query?.sort?.set([
  { colId: "amount", direction: "asc" },
]);
runtime.root.toggleExpand(orderId);
runtime.root.writeCell({ rowId: orderId, colId: "amount" }, 125);
```

The accompanying explanation should stay at the programmer-value level: the
same object that powers the React grid can be driven in a test, a script, or a
different view layer. The test excerpt demonstrates the claim more clearly
than a list of the runtime's internal responsibilities.

## User experiences worth showing

The documentation and runtime tests support more visible user experiences than
the first brief recorded. These can be included after the primary narrative if
the page remains focused. Each item needs its own concrete proof rather than a
feature-card label.

- Cell ranges can be selected with the keyboard and copied as CSV. A short
  interaction or screenshot can show a selected rectangle and the resulting
  clipboard text with headers.
- Rows can be selected independently for delete, export, bulk edit, or a detail
  panel. A demo should show the action that becomes available after selection.
- Copy behavior can include the displayed label and stored value for a lookup
  or select column. A two-line clipboard result would make this customization
  concrete.
- Editable columns cover text, numbers, currency, percentages, dates,
  booleans, selects, lookups, and foreign keys. One compact demo row can show
  several editor types opening in place.
- Custom cells can render application-specific content and still participate
  in grid focus, selection, editing, and copy behavior. Pair one custom cell
  with the small column definition that creates it.
- New records can be created in the grid with application-controlled
  validation, saving, failure display, and retry behavior. Show the draft row
  moving through the visible states.
- Loading, refreshing, empty, and error states can appear at each nested level.
  A screenshot sequence or controlled demo toggle can show that a child API
  failure is contained within the expanded child grid.
- Summary rows can represent rollups, subtotals, opening balances, closing
  balances, and footers. Use a financial or grouped-data screenshot only if
  these workflows belong in the final narrative.
- Local-memory and remote-API grids present the same interaction surface. A
  paired code example can swap the data source while leaving the schema and
  React rendering unchanged.
- Spreadsheet-style grids, row-first lists, side-panel workflows, and
  multi-select lists use configurable interaction presets. Show two visibly
  different experiences only if the page can explain when a programmer would
  choose each one.

## Claims to verify before publishing

- Confirm the exact accessibility statement. Keyboard operation is documented,
  but "fully accessible" should require an accessibility audit and documented
  semantics beyond keyboard support.
- Confirm whether URL synchronization is supplied as a ready-made integration
  or assembled by the host application using host-backed query state. Current
  documentation describes the latter.
- Confirm which non-React renderers exist. The framework-independent runtime
  supports that architecture, but the homepage should not imply that vanilla
  JavaScript or other framework renderers are already shipped unless they are.
- Confirm which data states the proposed live demo can expose visibly,
  including loading, error, empty, and saving states.
- Confirm that every feature shown in the code container is the feature running
  in the demo container, so the demonstration does not become illustrative
  pseudocode.

## Deferred work

- Do not revise `src/pages/grid/index.astro` yet.
- Do not revise `src/styles/grid-site.css` or any shared homepage styles yet.
- Do not finalize headings or paragraph copy until the remaining content
  questions have been supplied.
- Do not choose the final demo data model until the full page narrative is
  known.
