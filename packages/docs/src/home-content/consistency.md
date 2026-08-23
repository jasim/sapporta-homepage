## Consistency across an AI-written codebase

When you use AI to write a database application, common patterns often end up
implemented differently in different parts of the app. Coding agents rarely
build shared, reusable infrastructure, so you get:

- Repeated prompting for basic functionality
- Similar features implemented in different ways
- Security lapses, such as forgetting to scope data to the user
- Time spent correcting plumbing instead of writing business logic

Sapporta generates data-related functionality from schema declarations
instead:

- Declare a table once and it gets grids, forms, reports, and secure APIs
- Shared behaviors — filtering, sorting, exports — are written in one place
- Security is built into the framework and the agent skills
- The whole stack (Hono + React + SQLite) stays visible and maintainable
