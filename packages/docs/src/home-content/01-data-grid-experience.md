## A data grid based user experience

80% of most ERP software is just forms, data grids, and reports, and all of it is quite keyboard-accessible. Sapporta tries to bring the same experience to
database applications on the web. 

![A projects page showing records in a searchable Sapporta data grid](/assets/home/exercise-workflow/projects-grid.png "Every table gets a searchable, sortable data grid.")

![A tasks grid filtered to show only blocked tasks](/assets/home/exercise-workflow/tasks-filtered-blocked.png "Filters narrow the same grid without creating another screen.")

Sapporta uses data grids to display data wherever
possible. They are used in regular tables, inside forms, and for reports. The value of a data grid is that it is a
general-purpose surface. You can put a lot of heart and soul into a single
component, and it benefits the entire application.

That is also what makes spreadsheets beautiful. Since they are a general-purpose surface for
all kinds of tabular data, they come with many features that are hard to replicate in
a custom-built application. People use them because they can work with the data without
having to anticipate every requirement in advance. Consider simple features such as filtering,
sorting, or selecting a set of rows and seeing their sum or average. Building these interactions in a conventional
web application, even with an LLM, requires defining them from scratch for every
table. So we often focus on the central parts of the system that finds most
use, adding features as users request them. The rest of the application's data
becomes a second-class citizen.

But in Sapporta, just like a spreadsheet, you immediately get a live, editable
data grid the moment you create a table. The Sapporta Grid is a custom-built
React component that can be deeply composed and extended. It brings a similar
set of features and UX as Airtable, NocoDB, and similar collaborative databases.
It is paginated, filterable, sortable, and searchable. It also supports nested
master-detail relationships, with full keyboard support that works across
levels.

Sapporta also automatically creates forms for adding and editing data, and it
creates drill-down reports that use the same data grid and thus have all the
same affordances.

So when you use Sapporta to build a web application with a coding agent, you get
a fully wired system with a front end for manipulating data, along with all the
forms and workflows the application needs. Sapporta and the agent are both
deeply aware of the database nature of the application, and helps build a
superior experience for data-obsessed users.
