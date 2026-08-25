---
name: hello-world
title: Hello World
description: A minimal example skill. Use it as the starting point when creating your own skill in this library.
tags: [example, starter, writing]
version: 1.0.0
---

# Hello World

This is the smallest possible skill: a single `SKILL.md` file with frontmatter and a body.
Copy this folder, rename it, and rewrite the two required frontmatter fields.

## Frontmatter

Only `name` and `description` are required by the [Agent Skills](https://agentskills.io)
specification. This library reads a few optional extras — `title`, `tags`, `version`,
`author` — to build the cards, the filters and the detail page.

Tags are free-form and you can add as many as you like. They are matched
case-insensitively and shown capitalised, so `pull-request` becomes `Pull Request`.

The `description` is what an agent reads to decide whether to load the skill, so write it as
"what this does, and when to use it" rather than a label.

## Instructions

Everything below the frontmatter is the skill body. It is loaded into the agent's context only
once the skill is triggered, so there is room to be specific:

1. State the goal in one sentence.
2. Give the steps in order.
3. Show what good output looks like.

Replace all of this with your own instructions.
