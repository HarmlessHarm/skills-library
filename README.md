# Skill Library

The Gemeente Amsterdam skill library: a GitHub Pages site for sharing agent skills, tools and
plugins, and for sharing what we learned using them. Skills install into GitHub Copilot, Codex
or Claude Code in one command with [`npx skills`](https://skills.sh); short blog posts from
colleagues sit next to them.

It's styled with the Amsterdam Soft design system (Amsterdam blue, a little Amsterdam red,
Figtree, soft corners). The styling is hard-coded for now; it may be split back out into a
generic template later.

---

## What you get

- **A browsable site** — search, tag filters, one tile per item.
- **Search** across name, description and tags, with shareable filter URLs.
- **One install method for every agent** — each skill installs with `npx skills add`, and a
  dropdown in the header switches every snippet on the site between GitHub Copilot (the
  default), Codex and Claude Code. The choice is remembered.
- **Downloadable `.skill` bundles** — each skill folder zipped, supporting files included.
- **External picks** — useful skills, plugins and tools found elsewhere, each with a short
  article on why it's worth a look and how to get it from its own source.
- **A blog** — short posts about a skill, tool or framework someone used. The newest one is
  featured on the home page, and posts and the skills they're about link to each other.
- **Light and dark themes** — follows the viewer's system setting, with a header toggle that
  overrides it and is remembered.
- **Automatic deploys** to GitHub Pages on every push to `main`.

Library skills use the [Agent Skills](https://agentskills.io) format, the one thing Copilot,
Codex and Claude Code all read the same way. External picks link out instead, so they can be
anything: a single skill, a collection, a plugin or a CLI tool.

## Setup

1. Click **Use this template** → create your repository.
2. In your new repo: **Settings ▸ Pages ▸ Build and deployment ▸ Source: GitHub Actions**.
3. **If you forked instead of using the template**, GitHub disables Actions on forks. Open the
   **Actions** tab, click **I understand my workflows, go ahead and enable them**, then run
   **Deploy to GitHub Pages ▸ Run workflow** once by hand — a fork's first workflow run does
   not start on its own. After that, pushes trigger it normally. Repositories created with
   **Use this template** do not need this.
4. Edit [`config.yaml`](config.yaml) — realistically just `site.title` and `site.tagline`.
5. Push. The workflow builds and deploys; your site appears at
   `https://<you>.github.io/<repo>/`.

Every value in `config.yaml` is optional. The repository owner, name, deploy URL and base
path are worked out from `GITHUB_REPOSITORY` in CI, and from your `origin` remote when you
run locally — so a fresh fork already shows the right maintainer, links and install commands
with nothing filled in. Set `site.author` only if you want a display name instead of your
GitHub username, and `site.repo` only to point at a different repository than the one you are
building in.

## Adding a skill

Create `skills/<name>/SKILL.md`:

```markdown
---
name: my-skill
description: What this does, and when an agent should reach for it.
title: My Skill
tags: [git, code-review, pull-request]
version: 1.0.0
---

# My Skill

Your instructions go here.
```

`name` and `description` are the only fields the [Agent Skills](https://agentskills.io)
specification requires — everything else is optional and only feeds this site:

| Field         | Purpose                                                        |
| ------------- | -------------------------------------------------------------- |
| `name`        | **Required.** Folder-safe identifier, used in install commands  |
| `description` | **Required.** How an agent decides whether to load the skill    |
| `title`       | Display name on the card. Defaults to a title-cased `name`      |
| `tags`        | Filter chips and search terms. Add as many as you like          |
| `version`     | Shown on the detail page. Falls back to `defaults.version`      |
| `author`      | Falls back to the site maintainer                               |
| `license`     | Falls back to `defaults.license`                                |
| `homepage`    | Optional external link                                          |

Add supporting files (`reference.md`, scripts, templates) beside `SKILL.md` — they are bundled
into the downloadable `.skill` archive automatically. Relative links in the body are rewritten
to point at the file in your repository, so they work on the site too.

Tags are free-form — there is no list to register them in. They are matched
case-insensitively and displayed capitalised, so `pull-request` renders as `Pull Request` and
`Pull-Request` is the same tag.

## Adding an external pick

Found something useful that lives in someone else's repository? Describe it in
`external/<name>.md` rather than copying it into `skills/`:

```markdown
---
title: OpenSpec
description: One or two sentences for the card.
kind: tool               # skill | collection | plugin | tool
source: https://github.com/Fission-AI/OpenSpec
author: Fission AI
license: MIT
tags: [planning, specs]
contributor: Your Name   # who wrote this article
install:
  - label: Install the CLI
    script: npm install -g @fission-ai/openspec@latest
  - label: Then, in your project
    script: openspec init
---

A short article in your own words: what it is, why it's worth a look, and anything a
colleague should know before trying it.
```

| Field         | Purpose                                                              |
| ------------- | -------------------------------------------------------------------- |
| `title`       | **Required.** Display name                                           |
| `description` | **Required.** Shown on the card and at the top of the page           |
| `kind`        | **Required.** `skill`, `collection`, `plugin` or `tool`              |
| `source`      | **Required.** Where it lives. GitHub links show as `owner/repo`      |
| `install`     | Commands copied from the source's own instructions, in order         |
| `author`      | Who made it                                                          |
| `license`     | Its license, as stated by the source                                 |
| `contributor` | Who wrote the article                                                |
| `tags`        | Shared with library skills, so filters cover both                    |

External picks appear alongside library skills with an **External** label, and an
*All / In this library / External* switch appears once both exist. They are never part of
`npx skills add <owner>/<repo>` for this library — installing one always happens from its
own source.

## Writing a post

Posts are short write-ups: what you tried, what happened, what you'd tell a colleague. Copy
[`posts/_template.md`](posts/_template.md) to `posts/<slug>.md`:

```markdown
---
title: A week of letting the agent ask the questions
description: One or two sentences, shown as the preview on the home page and the blog.
date: 2026-11-02
author: Your Name
role: Developer, Your Team   # optional
topic: Skills                # optional, used to filter the blog
tags: [learning]
skills: [mentor]             # what the post is about
---

The post itself, in Markdown.
```

| Field         | Purpose                                                                       |
| ------------- | ----------------------------------------------------------------------------- |
| `title`       | **Required.** The headline                                                    |
| `description` | **Required.** Preview text on the home page, the blog and in search results   |
| `date`        | **Required.** Publication date, `YYYY-MM-DD`. The newest post is featured      |
| `author`      | **Required.** Shown in the byline; the initials go in the avatar               |
| `role`        | Team or role, shown in the byline on the post                                 |
| `topic`       | One short label. The blog shows topic filters once there are two or more      |
| `skills`      | Slugs of library skills (`skills/<slug>/`) or external picks (`external/<slug>.md`) |
| `draft`       | `true` keeps the post off the site                                            |

Every slug under `skills:` is checked at build time. A typo fails the build with a message
naming the post, rather than publishing a broken link. Each listed item gets a "Read: …" link
on its card and a *Posts about this* panel on its page; the post shows the items with their
install commands.

To link to a page on the site from inside a post, write the path from the site root, like
`[mentor](/skills/mentor/)`. The deploy base path is added for you. Reading time is worked
out from the word count. Files whose name starts with `_` are never published.

## Configuration

Everything site-level lives in [`config.yaml`](config.yaml):

| Block      | What it controls                                                         |
| ---------- | ------------------------------------------------------------------------ |
| `site`     | Title and tagline, plus optional author/repository/URL/base overrides     |
| `defaults` | Version and license for items that omit them                              |
| `agents`   | The install targets in the header dropdown                                |

Tag chips are built from the tags your skills actually use, so there is nothing
to configure.

## Theming

Every colour, space, radius, shadow and width is a custom property in
[`src/styles/theme.css`](src/styles/theme.css), with values from the Amsterdam Soft design
system. Components reference tokens only and never a literal colour, so changing a token
changes the whole site. Layout lives in [`src/styles/global.css`](src/styles/global.css).

A few rules from the design system that the site follows:

- **Amsterdam blue** (`--accent`) is the one active colour: links, the main button, selected
  filters.
- **Amsterdam red** (`--brand-red`) is a small accent only: the logo, the underline under the
  current nav item and the dot on the newest post. Never text, buttons or errors.
- **Figtree** is the only typeface. It's bundled with
  [`@fontsource-variable/figtree`](https://fontsource.org/fonts/figtree), so the site makes no
  requests to Google Fonts.

The logo in [`src/components/Logo.astro`](src/components/Logo.astro) is drawn by hand. Swap
in the official SVG before the site goes public.

### Light and dark

Colours are written once, as `light-dark(light, dark)`:

```css
--bg: light-dark(#f6f7f9, #14161b);
```

Which half applies comes from the `color-scheme` property, so there is no duplicated dark
block to keep in sync — edit the pair and both themes follow. `light-dark()` needs a browser
from 2024 or later; swap in a `prefers-color-scheme` block if you need to support older ones.

The site follows the viewer's system setting by default. The header toggle overrides it with
Light or Dark, stored in `localStorage` and applied by an inline script before the first
paint, so there is no flash of the wrong theme. Choosing **System** clears the override.
With JavaScript disabled the system setting still applies.

## Install targets

The header dropdown decides which install snippet is shown, everywhere, at once. Each entry
under `agents:` in `config.yaml` defines one:

```yaml
- id: claude
  label: Claude Code
  skillsAgent: claude-code
  docs: https://code.claude.com/docs/en/skills
```

| Field         | Purpose                                                                    |
| ------------- | -------------------------------------------------------------------------- |
| `id`          | Internal key, also what `defaultAgent` refers to                           |
| `label`       | Shown in the dropdown and the snippets                                     |
| `skillsAgent` | The agent's identifier in the `skills` CLI, passed as `-a`                 |
| `docs`        | Optional link shown under each install snippet                             |

Every snippet uses the [`skills` CLI](https://skills.sh), which knows where each agent keeps its
skills — so this repository never has to:

```bash
npx skills add <owner>/<repo> -a github-copilot                     # every skill
npx skills add <owner>/<repo> --skill hello-world -a github-copilot # one skill
```

Both install into the current project; `-g` installs for the user instead. Run
`npx skills --help` for the list of agent identifiers.

Every snippet is rendered into the page at build time and one is revealed with CSS, so the
right instructions show before the page paints and the site still works with JavaScript off.

## Local development

```bash
npm install
npm run dev      # http://localhost:4321/<base>/
npm run build    # static output in dist/
npm run preview  # serve dist/ with the correct base path
```

`npm run dev` and `npm run build` both run `scripts/build-assets.mjs` first, which zips the
`.skill` bundles into `public/downloads/` (gitignored).

## Project structure

```
config.yaml              Site configuration — the file you edit
skills/<name>/SKILL.md   One folder per skill, plus any supporting files
external/<name>.md       One article per external pick
posts/<slug>.md          One file per blog post (posts/_template.md to start from)
src/styles/theme.css     Design tokens
src/lib/repo.mjs         Works out which repository this is, for links and attribution
src/lib/                 Config loading, install snippets, skill and post normalisation
scripts/build-assets.mjs Bundles .skill files
```

Built with [Astro](https://astro.build). No UI framework, no client-side data fetching —
filtering runs over pre-rendered cards in the DOM.

## License

MIT.
