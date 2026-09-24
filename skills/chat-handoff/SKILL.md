---
name: chat-handoff
description: Package a brainstorming chat into a structured handoff bundle for Claude Code. Use this skill whenever the user wants to "hand off to Claude Code", "package this chat", "turn this brainstorm into docs", "export this for coding", "write this up so I can build it", or otherwise move a design/planning conversation out of chat and into a code repo. Trigger even when phrased casually ("ok let's build this", "make this into a project", "I'm ready to code this") as long as the intent is to leave chat and start implementing elsewhere. Works for both brand-new projects and additions to existing codebases.
title: Chat Handoff
tags: [workflow, handoff, planning, brainstorm, claude-code]
version: 1.0.0
---

# Chat Handoff

Package a brainstorming conversation into a set of markdown documents that Claude Code (or another agent) can ingest to start building. The chat is where thinking happens; this skill freezes that thinking into durable, versionable artifacts so it survives the jump to the repo.

## Core principle

The chat side produces **intent and design decisions only** — never an implementation spec. A spec (exact schema DDL, API contracts, migration files, task breakdowns) is an implementation artifact and belongs in the code repo, produced by the code-side tooling next to the code where it can be version-controlled. This skill stops at the boundary: it captures *what* to build, *why*, and *what was rejected*, and hands that over.

## The document model

Always generate a bundle of markdown files. Some are always present, some are conditional on what the conversation actually covered. **Never fabricate a document the chat didn't support** — an idea-only chat should not sprout a fake architecture doc. Assess what the conversation genuinely reached and emit accordingly.

### Generation order

Generate in this order. It matters: every cross-reference points *backward* to ids that already exist, so nothing dangles and no backfill pass is needed.

```
idea.md          the spark
   ▼
decisions.md     the deliberation (harvested from chat; primary artifact)
   ▼
prd.md           the core plan (references DEC ids)
   ├──▶ ux-design.md      conditional (references DEC + REQ)
   └──▶ architecture.md   conditional (references DEC + REQ)
   ▼
handoff.md       the manifest
```

### idea.md — always

The spark. An elevator pitch / executive summary: **why the product should exist**, what problem it solves, who it's for. Brief. It reads like a pitch, not a technical document. Product rationale only — *why the product is needed* belongs here; *why it's built in Nuxt instead of Next* does NOT (that's a decision, and lives in decisions.md). If a line justifies a technical/build choice, it's in the wrong doc.

### decisions.md — always, generated second

Harvested directly from the chat — the deliberation happened in the conversation, so this is sourced from the chat, not from the other docs. ADR-style record: what was considered, what was chosen, what was rejected and why. This is the highest-value, most perishable content — the reasoning the other docs flatten into conclusions. Generating it early forces the "hunt for what was weighed and rejected" step to happen while the chat is the only source.

Self-contained: it carries no outbound references. Downstream docs point *at* decisions by id; decisions.md doesn't need to know which requirements will cite it. Even an idea-only chat produces a decision or two — directions weighed and dropped while forming the idea.

### prd.md — always, the core of the plan

The spine; everything else elaborates from it. This is a substantial document, not a summary — see `references/doc-templates.md` for full structure. Its **maturity is a dial** (stub → developing → mature), and maturity shows up as the **depth of the requirement tree** plus how much of the surrounding frame (background, goals, non-goals, success criteria) is filled.

Key rules:
- **Requirements form a tree** with dotted-depth numbering (REQ-1, REQ-1.1, REQ-1.1.1). Do NOT label nodes as "epic" / "feature" / "story" — those are just names for depth, and the numbering carries it. REQ-1 is simply the top of the tree for *this* project, whatever its scope. A flat list is a valid, honest output for a small chat.
- **RFC-2119 grading** (MUST / SHOULD / MAY) at every level. A parent's grade sets the default; a child may sharpen it (inheritance — only mark a child's grade where it diverges from the parent).
- **NFRs are separate and flat** (NFR-1, NFR-2…) — cross-cutting constraints, not tree nodes. Handed-to-you stack/platform constraints ("MUST deploy to AKS", "MUST use existing Supabase project") live here, distinct from stack *choices* (which go in architecture.md).
- **Open questions** — a section for requirement-level unknowns the chat raised but didn't resolve. Reading the history, what genuinely needs a decision before or during build?
- References DEC ids (which already exist by now) where a requirement traces to a decision.

### ux-design.md — conditional

Emit only if the chat covered user flows, interaction, layout, or visual intent. UX design (what the experience should be), not technical design. Has its own open-questions section. References DEC + REQ ids. Skip entirely if the conversation never touched it.

### architecture.md — conditional

Emit only if the chat covered stack, data model, or build *choices the user made*. Architecture-as-decisions (chose Drizzle over Prisma), not architecture-as-contract (exact DDL — that's a repo-side spec). Has its own open-questions section. References DEC + REQ ids. Skip if the conversation stayed above the "how it's built" level.

### handoff.md — always, the manifest

Ties the bundle together. Contains:
- **Target**: `new-project` or `existing-project`
- **PRD maturity**: stub | developing | mature
- **Branches present**: which of {ux-design, architecture} were emitted
- **Framework hint** (optional): openspec | bmad | gsd | speckit | none/just-implement. Leave unset by default ("detect from repo") and let the code-side ingester detect from the repo's existing structure; set it only if the user stated a preference.
- **Source context**: 2-3 sentence summary of what the chat was and where it left off — enough for the code-side agent to orient.
- **Open questions / assumptions to verify**: cross-cutting unknowns that don't belong to any single doc, or that reading the whole chat surfaces ("the chat assumes Supabase auth but never says whether SSO is needed"). The first thing the code-side agent should see.
- **Repo creation** (optional): if the user wants a new GitHub repo created, note it here as an instruction for the code-side skill to execute (`gh repo create`). Do NOT attempt to create the repo from chat — the auth boundary means it belongs on the user's machine where `gh` is authenticated.

## Reference direction

One rule, applied everywhere: **references only point backward, to ids generated earlier.** Given the generation order, that means decisions.md is self-contained (no outbound refs), the PRD may cite DEC ids, and ux/architecture may cite DEC and REQ ids. Nothing references forward. This makes dangling references structurally impossible.

## Process

1. **Determine target.** New project or addition to existing code? Infer from context (existing repo/project references → existing); ask only if genuinely unclear.
2. **Scan the conversation** for what each doc covers. Harvest deliberation (→ decisions, deliberately — hunt for "we decided X over Y because Z" moments). Assess requirement-tree depth (→ prd maturity). Check for flows/interaction (→ ux) and stack/schema/build choices (→ architecture).
3. **Generate in order**: idea → decisions → prd → conditional branches → handoff manifest.
4. **Deliver** the bundle as downloadable files.

## Notes for v0

This is an early version. Detection of prd maturity and branch presence is by judgment from reading the conversation — there's no rigid rubric yet. Favor honesty about what the chat contained over completeness of the bundle. When in doubt about whether a branch is warranted, lean toward omitting it and note in handoff.md that it wasn't covered.

See `references/doc-templates.md` for the structure of each document.
