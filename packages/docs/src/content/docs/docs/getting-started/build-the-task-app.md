---
title: "Build the Task App"
description:
  "Use the Task Management starter prompt from the generated Sapporta welcome
  screen to build the task-app tutorial baseline."
---

The setup page creates a running Sapporta project. This page turns that project
into the task app used by the rest of the docs and CLI examples.

## Start from the welcome screen

Open `/welcome`, choose **Task Management**, and copy the prompt into your
coding agent from the `task-app` project root. The Task Management prompt ships
with every new Sapporta app as an example of an agent-ready application request.
Use that exact prompt for the tutorial baseline.

## Use this prompt

<div class="sap-doc-prompt" aria-label="Task Management starter prompt">
  <p>
    <strong>Build a simple task management application.</strong>
  </p>
  <p>
    Use Sapporta, the database framework for TypeScript, and ensure the Sapporta
    skill is installed. Follow the setup instructions at
    <a href="https://sapporta.com/docs/getting-started">https://sapporta.com/docs/getting-started</a>.
  </p>
  <p>
    Keep the first version focused and easy to understand: include the core
    workflows that make the app useful, and avoid exhaustive features or deep
    customization.
  </p>
  <p>
    Use workspaceGlobal tables with this exact contract: people(id, name,
    email), projects(id, name, description, status), tasks(id, title,
    description, status, priority, due_date, assignee_id, project_id),
    labels(id, name, color), task_labels(id, task_id, label_id), comments(id,
    task_id, author_id, body). Use status values open, in_progress, blocked,
    done; priorities low, normal, high; and project statuses active, paused,
    complete. Do not expose workspace_id, workspaceId, scoped_to_user_id, or
    scopedToUserId in clients, CLI commands, or agent prompts.
  </p>
  <p>
    Include workflows for creating a task, assigning it, changing its status,
    and adding a comment. Include reports for open tasks, overdue tasks, tasks
    by assignee, and tasks by project. Populate the application with realistic
    sample projects, people, tasks, labels, and comments so the first run shows
    an active todo app.
  </p>
  <p>
    Before changing the app, review:
  </p>
  <ul>
    <li>README.md</li>
    <li>AGENTS.md</li>
    <li>
      <a href="https://github.com/jasim/sapporta-skills/tree/main/skills/sapporta">
        Sapporta coding-agent skill
      </a>
    </li>
  </ul>
</div>

The prompt gives the coding agent a stable schema target. Later tutorials use
the same table names, columns, and values in copyable CLI commands, report
routes, and frontend examples.

<table>
  <thead>
    <tr>
      <th>Table</th>
      <th>Columns</th>
      <th>Values named by the prompt</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>people</td>
      <td>id, name, email</td>
      <td></td>
    </tr>
    <tr>
      <td>projects</td>
      <td>id, name, description, status</td>
      <td>status: active, paused, complete</td>
    </tr>
    <tr>
      <td>tasks</td>
      <td>
        id, title, description, status, priority, due_date, assignee_id,
        project_id
      </td>
      <td>
        status: open, in_progress, blocked, done<br />
        priority: low, normal, high
      </td>
    </tr>
    <tr>
      <td>labels</td>
      <td>id, name, color</td>
      <td></td>
    </tr>
    <tr>
      <td>task_labels</td>
      <td>id, task_id, label_id</td>
      <td></td>
    </tr>
    <tr>
      <td>comments</td>
      <td>id, task_id, author_id, body</td>
      <td></td>
    </tr>
  </tbody>
</table>

The first tutorial app uses workspaceGlobal tables. Projects, tasks, people,
labels, and comments are shared within the workspace. Browser clients, CLI
commands, and coding agents still omit trusted scope columns such as
workspace_id, workspaceId, scoped_to_user_id, and scopedToUserId.

## Check the created app

After the agent finishes, verify the project:

```bash
pnpm build
pnpm dev
```

The app is ready when the table navigation contains Projects, People, Tasks,
Labels, and Comments. The task grid contains rows, and a task opens in the
generated record screen for editing.

<figure class="sap-doc-figure">
  <img
    src="/assets/getting-started/task-app-created.png"
    alt="Completed task app showing the generated Tasks table with sample rows"
  />
  <figcaption>
    A completed tutorial baseline shows the generated table navigation and an
    active Tasks grid.
  </figcaption>
</figure>

The whole application is now set up. The browser table screens can create new
people, projects, tasks, labels, and comments. For the tutorial, create sample
data through a coding agent instead of entering each row manually.

Before creating sample data, give the coding agent access to the Sapporta API
for the app you just created. That is the next step.

Next:
[Use a Coding Agent with the Sapporta Application](/docs/getting-started/use-a-coding-agent/).
