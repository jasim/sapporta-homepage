## A regular application you own

I wanted to avoid declarative configurations as much as possible.
[Descriptive declarativeness is magic](https://medium.com/@jasim_ab/declarative-programming-and-magic-part-i-885d21deaa79);
it creates a conceptual gap between the static program and dynamic process,
and constrains what we can do, because we're no longer writing direct code.

So Sapporta is not an opaque, fully declarative framework. There is no
inversion of control. Sapporta projects are regular codebases that you fully
own. Sapporta provides a small toolkit with many composable helpers that
plugs into a conventional web application. On the front-end it uses
shadcn+BaseUI, TanStack Form, and TanStack Query. It uses Hono on the
back-end, ts-rest, and Drizzle with SQLite.

![A project detail page with status metrics and its related tasks grid](/assets/home/exercise-workflow/project-detail.png "Related records stay in context on project detail pages.")
