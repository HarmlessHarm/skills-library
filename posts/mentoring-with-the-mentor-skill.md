---
title: A week of letting the agent ask the questions
description: I installed the mentor skill expecting it to slow me down. It did, by about five minutes per change, and I understood every change I shipped that week.
date: 2026-11-02
author: Claudio Codi
role: Assistant, Digitale Diensten
topic: Skills
tags: [learning, planning]
skills: [mentor]
---

> This is a mock post, written to show what a post on this site looks like.

Most of my week is small changes: a validation rule here, a failing test there. With a coding
agent those go fast, sometimes too fast. I'd read the diff, it looked fine, I merged it, and
two weeks later I couldn't explain why it worked. So I installed the
[mentor](/skills/mentor/) skill for a week to see whether it would change that.

## What it actually does

The skill turns every implementation request into two short conversations. Before the agent
edits anything, it asks where _I_ would start and why. After it has made the change and the
tests pass, it asks me to explain the change back: what matched the plan, what didn't, and how
the code would handle a case nobody tested.

It doesn't explain things up front. It asks open questions and only gives hints when I'm stuck,
and it keeps asking until I've stated a decision in my own words. That was the part I expected
to find annoying.

## Monday: the plan file

The first surprise was a new folder, `planned-tasks/`, with one Markdown file per change. After
the planning exchange the agent writes down the agreed scope, approach and my predictions, and
keeps the file afterwards. At the end of the change it compares the implementation with that
plan.

I nearly deleted the folder. By Wednesday it was the most useful thing in the repository: a
short record of _why_ each change looks the way it does, written before the code existed.

## Wednesday: the question I couldn't answer

I asked for a fix to a date filter that dropped results on the last day of the month. The fix
was one line. The teach-back question was: "What happens with this filter when the user is in a
different time zone than the server?"

I didn't know. The agent didn't tell me either. It asked a simpler question about where the
date was parsed, then pointed me at the test file. Ten minutes later I'd found a second bug
and written a test for it. That one question was worth the whole week.

## What I'd tell a colleague

- **It costs about five minutes per small change.** The skill aims for 3–5 minutes of
  dialogue on a small task. That held up for me.
- **Say yes to the learning profile.** On first use it asks whether it may keep a small
  record of what you've already shown you understand, stored locally outside the repository.
  With it, it stops asking about things you've already explained.
- **Keep one change per chat.** When I slipped an unrelated change into the same
  conversation, it noticed, suggested a fresh chat, and respected it when I stayed.
- **It won't commit until both checks pass**: the tests _and_ your explanation. That felt
  strict on day one and normal by day three.

## Would I keep it on?

For work in a codebase I'm still learning: yes. For a quick fix in code I wrote myself
yesterday, I switch it off. The point isn't to slow everything down. It's to make sure that
when I merge something, I could explain it in a review without opening the diff.
