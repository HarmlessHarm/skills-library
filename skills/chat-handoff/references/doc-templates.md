# Document templates

Structures for each file in the handoff bundle. These are starting shapes, not rigid forms — adapt to what the chat contained. Omit sections that don't apply rather than padding them. Files are generated in this order: idea → decisions → prd → {ux, architecture} → handoff. References always point backward to already-generated ids.

## idea.md (always, generated first)

The spark. Elevator pitch / executive summary. Product rationale only — why it should exist, not how it's built. Keep it brief.

```markdown
# [Project / feature name]

## The pitch
One or two sentences — what this is, in plain terms.

## Problem
What need or gap does it address?

## Why it matters
Why is this worth building? Why now?

## Who it's for
Users / audience / context of use.
```

Do NOT justify technical choices here (framework, database, hosting). Those are
decisions and live in decisions.md. If a line reads as "we're using X because…",
it's in the wrong file.

## decisions.md (always, generated second)

ADR-style deliberation record, harvested from the chat. Self-contained — no
outbound references. This is the most perishable, highest-value content: the
"why / why-not" that nothing else captures.

```markdown
# Decisions

## DEC-1: [decision title]
- **Context**: what prompted this decision.
- **Options considered**: A, B, C.
- **Chosen**: B.
- **Why**: reasoning.
- **Rejected**: A (because…), C (because…).

## DEC-2: ...
```

Even an idea-only chat produces one or two of these — directions weighed and
dropped while forming the idea. Hunt for "considered X, chose Y because Z"
moments in the conversation rather than only recording conclusions.

## prd.md (always, the core of the plan)

The spine. A substantial document, not a summary. Maturity dials stub →
developing → mature; maturity shows as requirement-tree depth plus how much of
the frame is filled. At *stub*, this may be just the summary and a flat handful
of requirements. At *mature*, the whole frame is populated.

```markdown
# PRD: [name]

## Summary
One paragraph: what we're building and why.

## Background & context
The situation this exists in — prior art, the existing system it plugs into,
relevant history from the chat. This is what makes the requirements legible to
someone who wasn't in the conversation.

## Goals
Success as outcomes, not features. ("Users recover access without contacting
support.")

## Non-goals
Deliberate exclusions, ideally with a word on why. Distinct from open questions:
a non-goal says *don't build this*; an open question says *ask before deciding*.

## Requirements

Functional requirements form a tree. A requirement can be as broad or specific
as the discussion warrants; depth is added only where the chat went deeper. Do
NOT label nodes as "epic" / "feature" / "story" — those are just names for depth,
and the numbering carries it. REQ-1 is simply the top of the tree for THIS
project, whatever its scope.

- **REQ-1** (MUST): [top-level requirement]. [ref: DEC-X]
  - **REQ-1.1** (MUST): [child requirement].
    - **REQ-1.1.1** (SHOULD): [leaf requirement].
  - **REQ-1.2** (SHOULD): [child requirement].
- **REQ-2** (MUST): [top-level requirement].

Go only as deep as the conversation established. A flat list (REQ-1, REQ-2, …)
is a valid, honest output for a small or early chat — depth signals how granular
the thinking got, not a template to fill.

RFC-2119 grading (MUST / SHOULD / MAY) applies at every level. A parent's grade
is the default expectation; mark a child's grade only where it diverges
(inheritance). Reference DEC ids where a requirement traces to a decision.

## Non-functional requirements
Cross-cutting constraints — flat list, not tree nodes. Performance, platform,
security, and handed-to-you stack/platform constraints ("MUST deploy to AKS",
"MUST use existing Supabase project").
- **NFR-1** (MUST): [constraint].
- **NFR-2** (SHOULD): [constraint].

## Success criteria
How we'll know it's done and working.

## Open questions
Requirement-level unknowns the chat raised but didn't resolve — things that,
reading the history, genuinely need a decision before or during build.
- Is [X] in scope for v1?
- Should [Y] behave like [A] or [B]?
```

## ux-design.md (conditional)

Only if the chat covered experience/interaction. What the experience should be,
not technical design.

```markdown
# UX Design: [name]

## User flows
Key paths through the product. [ref: REQ-X where relevant]

## Interaction model
How the user acts on the system; key screens/states and transitions.

## Layout & visual intent
Rough structure, hierarchy, tone. Intent, not pixel specs.

## Open UX questions
What wasn't resolved.
```

## architecture.md (conditional)

Only if the chat covered build *choices*. Decisions about how it's built, NOT the
implementation contract (no exact DDL, no full API schemas — those are repo-side
specs).

```markdown
# Architecture: [name]

## Stack
Chosen technologies at a decision level (not versions-and-config).
[ref: DEC-X for the reasoning]

## Data model (conceptual)
Core entities and relationships — conceptual, not schema DDL.

## Integration points
External services, APIs, boundaries.

## Open architecture questions
What wasn't resolved and should be settled repo-side.
```

## handoff.md (always, the manifest)

```markdown
# Handoff: [name]

- **Target**: new-project | existing-project
- **PRD maturity**: stub | developing | mature
- **Branches present**: [ux-design, architecture] (list only those emitted)
- **Framework hint**: openspec | bmad | gsd | speckit | none — or "detect from repo" (default)
- **Repo creation requested**: yes/no — if yes, code-side skill runs `gh repo create <name>`

## Source context
2-3 sentences: what this chat was, and where it left off. Enough for the
code-side agent to orient without reading the whole bundle.

## Open questions / assumptions to verify
Cross-cutting unknowns that don't belong to a single doc, or that reading the
whole chat surfaces. The first thing the code-side agent should see.
- [assumption the chat made but never stated explicitly]
- [decision deferred to build time]

## Files in this bundle
- idea.md
- decisions.md
- prd.md
- [ux-design.md]
- [architecture.md]
```
