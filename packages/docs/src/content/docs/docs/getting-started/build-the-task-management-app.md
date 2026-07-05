---
title: "Build the Task Management App"
description:
  "Use the Task Management starter prompt from the generated Sapporta welcome
  screen to build the task-app tutorial baseline."
---

Now that you have created a new Sapporta project, let's turn it into a Task Management app.

## The Welcome screen

The new project welcome screen in `/welcome` already has a set of prompts to give you an idea of how to get started.

From them, choose **Task Management**, and copy the prompt into your
coding agent. Note that you have to start the agent from the root of the Sapporta project)

## Here's the prompt for your reference

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

## Try out the created app

After the agent finishes, you might have to stop the running dev server and restart:

```bash
pnpm build
pnpm dev
```

Now try adding some tasks, and see how the app behaves.

You could ask the coding agent to add some sample data, but before we do that,
let's create an Agent Access token, so that the coding agent can use the API exposed
by the Sapporta app, like how a user of the app would interact with your project with 
their own coding agents.