---
title: OpenSpec
description: Spec-driven development for coding agents. Agree on a written proposal, specs and task list with the agent before any code is written.
kind: tool
source: https://github.com/Fission-AI/OpenSpec
author: Fission AI
license: MIT
tags: [planning, specs, workflow]
install:
  - label: Install the CLI (macOS / Linux)
    script: curl -fsSL https://openspec.dev/cli/install.sh | sh
  - label: Or with npm (Node.js 22.12+)
    script: npm install -g @fission-ai/openspec@latest
  - label: Then, in your project
    script: openspec init
---

## What it is

OpenSpec adds a planning step to working with a coding agent. Instead of asking for a change
and reviewing whatever comes back, you first let the agent write down what it is going to do.
For each change, that's a proposal, the requirements as plain-Markdown specs with concrete
scenarios, a technical design and a task list. You review that plan, and only then does the
agent implement it.

`openspec init` sets up slash commands in your agent. A typical round looks like this:

- `/opsx:explore` to think a change through with the agent
- `/opsx:propose add-dark-mode` to write the plan into `openspec/changes/add-dark-mode/`
- `/opsx:apply` to implement the task list
- `/opsx:archive` to fold the finished change into the project's specs

## Why it's worth a look

- **The plan is reviewable.** It's Markdown in the repository, so a colleague can review the
  intent in a pull request before any code exists.
- **The specs stay with the code.** Archived changes update `openspec/specs/`, so the project
  keeps an up-to-date description of how it is supposed to behave.
- **It works on existing projects.** It's built for adding changes to a codebase that already
  exists, not just for starting from scratch.

## Things to know

- It's a CLI you install, not a single skill. It adds its own commands to your agent.
- Check the [OpenSpec docs](https://openspec.dev) for which agents it supports and how it
  sets each one up.
