## Agentic use out of the box

Once a user connects a coding agent with
the [Sapporta skill](https://github.com/jasim/sapporta-skills), the agent can
work through the same application APIs as the UI. It can discover tables and
app-specific routes, inspect their exact contracts, then read or change records
without guessing a URL or request shape.

For example, if you build an expense-tracking system with Sapporta, its users
can scribble reimbursement details — rough vendor names, relative dates, all in
a free-form structure—into an LLM agent and have them recorded accurately in the
database.

This works out of the box because Sapporta publishes the application's API
surface at `/api/openapi.json`. It includes usage examples, and API signature
for every available endpoint. It is generated for the Sapporta table APIs as
well as for application specific APIs you write.

![A coding agent answering questions and summarizing pending tasks by project](/assets/home/screenshots/complex-data-queries.png "Ask multi-part questions about the work and the coding agent queries related table endpoints to answer them.")

Here is a condensed transcript from an actual run against a Sapporta task
application. The commands use the standard project-local form, and each response
keeps only the fields relevant to the answer. There was no purpose-built report
for this question.

<div class="home-agent-example">
  <div class="home-agent-example__turn home-agent-example__turn--user">
    <span class="home-agent-example__speaker">User</span>
    <p>Who has the most todos pending?</p>
  </div>
  <div class="home-agent-example__commentary">
    <p>The agent discovered the mounted APIs and table metadata, checked the
    task and people contracts, fetched the rows visible to this user, then
    counted every status other than “done” by assignee.</p>
    <details class="home-agent-trace">
      <summary>Show the six CLI calls and abbreviated output</summary>
      <pre aria-label="Abbreviated Sapporta CLI transcript"><code>1. Discover the mounted routes
<br />$ pnpm exec sapporta endpoints list
<br />{"method":"GET","path":"/api/tables/people",…}
<br />{"method":"GET","path":"/api/tables/tasks",…}
<br />… 48 other routes
<br />
<br />2. Inspect the registered tables
<br />$ pnpm exec sapporta tables list
<br />{"name":"people","rowCount":5,…}
<br />{"name":"tasks","rowCount":14,…}
<br />… 4 other tables
<br />
<br />3. Check the tasks contract
<br />$ pnpm exec sapporta endpoints show "GET /api/tables/tasks"
<br />{"responses":{"200":{"properties":{"data":{
<br />  "items":{"properties":{
<br />    "assignee_id":{"type":"number","nullable":true},
<br />    "status":{"enum":["backlog","in_progress","review","done"]}
<br />}}}}}}}
<br />
<br />4. Check the people contract
<br />$ pnpm exec sapporta endpoints show "GET /api/tables/people"
<br />{"responses":{"200":{"properties":{"data":{
<br />  "items":{"properties":{"id":{"type":"number"},"name":{"type":"string"}}}
<br />}}}}}
<br />
<br />5. Read all visible tasks
<br />$ pnpm exec sapporta api get "/api/tables/tasks?limit=1000"
<br />{"data":[
<br />  {"id":1,"assignee_id":1,"status":"in_progress",…},
<br />  {"id":8,"assignee_id":4,"status":"done",…},
<br />  {"id":11,"assignee_id":null,"status":"backlog",…},
<br />  … 11 more task rows
<br />],"meta":{"total":14}}
<br />
<br />6. Resolve assignee names
<br />$ pnpm exec sapporta api get "/api/tables/people?limit=1000"
<br />{"data":[
<br />  {"id":1,"name":"Maya Chen",…},
<br />  {"id":2,"name":"Jon Bell",…},
<br />  {"id":3,"name":"Priya Nair",…},
<br />  {"id":4,"name":"Omar Haddad",…},
<br />  {"id":5,"name":"Elena Rossi",…}
<br />],"meta":{"total":5}}</code></pre>
    </details>
  </div>
  <div class="home-agent-example__turn home-agent-example__turn--agent">
    <span class="home-agent-example__speaker">Agent</span>
    <p>It’s a five-way tie: Maya Chen, Jon Bell, Priya Nair, Omar Haddad, and
    Elena Rossi each have <strong>2 pending todos</strong>.</p>
    <p>I counted all tasks whose status isn’t <code>done</code>; 2 additional
    pending todos are unassigned. Source: Tasks and People table endpoints.</p>
  </div>
</div>
