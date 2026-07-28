## A grid-first interface

80% of most ERP software is just forms, data grids, and reports, and they can
all be operated well with the keyboard. My goal with Sapporta is to bring the
same experience to database applications on the web.

Sapporta uses data grids as a universal surface for tabular data. You can put a
lot of heart and soul into a single component, and it benefits the entire
application.

That is also what makes spreadsheets beautiful. People use them because they can
work with data without having to anticipate every requirement in advance.
Operations like sorting, searching, and filtering, are available to all sheets,
and together they form a partial but high-leverage algebra for changing and
understanding data

Building them as one-off features in a conventional web application, even with
an LLM, requires defining them from scratch for every table. So we often focus
on the central parts of the system that finds most use, adding features as users
request them. The rest of the application's data becomes a second-class citizen.

But in Sapporta, just like a spreadsheet, you immediately get a live, editable
data grid the moment you create a table. The Sapporta Grid is a custom-built
React component that can be deeply composed and extended. It brings a similar
set of features and UX as Airtable, NocoDB, and similar collaborative databases.
It is paginated, filterable, sortable, and searchable. It also supports nested
master-detail relationships, with full keyboard support that works across
levels.

Sapporta also renders forms for adding and editing records. It has a lightweight
reporting framework with summary rows, detail rows, and drill-down links.
Reports use the same data grid and thus have all the same affordances.

So when you use Sapporta to build a web application with a coding agent, you get
a fully wired system with a front end for manipulating data, along with all the
forms and workflows the application needs.

![The Daymark task application showing its open-tasks grid](/assets/home/screenshots/grid-view.png "Work with open tasks in a full application view built around the Sapporta Grid.")

![A task grid with text and assignee filters open](/assets/home/screenshots/grid-filtering.png "Combine text and column filters without leaving the grid.")

![A master-detail view of people and their related tasks](/assets/home/screenshots/master-detail.png "Move through people and the related task grid follows the active record.")
