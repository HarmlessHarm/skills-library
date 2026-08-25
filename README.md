# Skills Library

A template for publishing your own library of agent skills and commands as a
GitHub Pages site — searchable, filterable, and installable into Claude Code,
Codex or GitHub Copilot in one command.

Fork it, edit one YAML file, drop your skills in, and push.

---

## What you get

- **A browsable site** — hero, search, tag filters, one tile per item.
- **Search** across name, description and tags, with shareable filter URLs.
- **Per-agent install instructions** — a dropdown in the header switches every snippet on the
  site between Claude Code, Codex and Copilot. The choice is remembered.
- **Downloadable `.skill` bundles** — each skill folder zipped, supporting files included.
- **A Claude plugin marketplace entry**, so the whole library installs with one command.
- **Automatic deploys** to GitHub Pages on every push to `main`.

Only skills and commands. No plugin browsing, no other content types.

## Setup

1. Click **Use this template** → create your repository.
2. In your new repo: **Settings ▸ Pages ▸ Build and deployment ▸ Source: GitHub Actions**.
3. Edit [`config.yaml`](config.yaml) — realistically just `site.title` and `site.tagline`.
4. Push. The workflow builds and deploys; your site appears at
   `https://<you>.github.io/<repo>/`.

Every value in `config.yaml` is optional. The repository owner, name, deploy URL and base
path are worked out from `GITHUB_REPOSITORY` in CI, and from your `origin` remote when you
run locally — so a fresh fork already shows the right maintainer, links and install commands
with nothing filled in. Set `site.author` only if you want a display name instead of your
GitHub username, and `site.repo` only to point at a different repository than the one you are
building in.

The one thing that cannot be derived at render time is the committed plugin manifest, since
Claude reads it from the repository. CI rewrites that for you on the first push — see
[Generated plugin manifests](#generated-plugin-manifests).

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

## Adding a command

Create `commands/<name>.md` — a single file, matching Claude Code's convention:

```markdown
---
name: my-command
description: One line describing what running this does.
tags: [releases, writing]
argument-hint: "[branch]"
---

The prompt the command runs.
```

`argument-hint` and `model` are also accepted and shown on the detail page.

## Configuration

Everything site-level lives in [`config.yaml`](config.yaml):

| Block      | What it controls                                                         |
| ---------- | ------------------------------------------------------------------------ |
| `site`     | Title and tagline, plus optional author/repository/URL/base overrides     |
| `defaults` | Version and license for items that omit them                              |
| `theme`    | Accent colour, fonts and corner radius                                    |
| `agents`   | The install targets in the header dropdown                                |

Tag chips are built from the tags your skills and commands actually use, so there is nothing
to configure.

### Generated plugin manifests

`.claude-plugin/marketplace.json` and `plugin.json` are generated from `config.yaml` — never
edit them by hand, your changes will be overwritten. They are the one generated thing that has
to be **committed**, because Claude reads them from your repository rather than from the built
site, which is why a template ships them carrying someone else's name.

You do not have to do anything about that. The deploy workflow regenerates them on every push
and commits them back if they changed, so **your fork re-attributes itself to you on its first
push** — you will see a `Sync plugin manifests with config.yaml` commit from
`github-actions[bot]` the first time CI runs. The same step keeps them in sync afterwards, so
editing `config.yaml` is enough and you never need to remember to rebuild.

Two cases where you should run `npm run build` and commit the result yourself:

- your `main` is protected against direct pushes, so CI cannot commit (the run logs a warning
  and still deploys), or
- you want the manifests correct before CI has run for the first time.

## Theming

Two levels, depending on how far you want to go:

- **Quick** — set `theme.accent`, `theme.accentDark`, `theme.font`, `theme.monoFont` and
  `theme.radius` in `config.yaml`. They are injected as CSS variables and override the defaults.
- **Full** — edit [`src/styles/theme.css`](src/styles/theme.css). Every colour, radius, shadow
  and width on the site is a custom property defined there, in both light and dark mode.
  Components reference tokens only and never a literal colour, so changing a token changes the
  whole site.

Layout lives in [`src/styles/global.css`](src/styles/global.css) if you want to go further.

## Install targets

The header dropdown decides which install snippet is shown, everywhere, at once. Each entry
under `agents:` in `config.yaml` defines one:

```yaml
- id: claude
  label: Claude Code
  skillDir: ~/.claude/skills
  commandPath: ~/.claude/commands/{name}.md
  docs: https://code.claude.com/docs/en/skills
```

Adding a fourth agent means adding a fourth entry — no code change. Available placeholders:
`{name}`, `{owner}`, `{repo}`, `{branch}`, `{downloadUrl}`, `{skillDir}`.

All three shipped agents read the same `SKILL.md` format; they differ only in where the files
go. If a vendor moves a directory, fix it here and every snippet on the site follows.

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
`.skill` bundles into `public/downloads/` (gitignored) and regenerates the plugin manifests.

## Project structure

```
config.yaml              Site configuration — the file you edit
skills/<name>/SKILL.md   One folder per skill, plus any supporting files
commands/<name>.md       One file per command
src/styles/theme.css     Design tokens
src/lib/repo.mjs         Works out which repository this is, for links and attribution
src/lib/                 Config loading, install snippets, item normalisation
scripts/build-assets.mjs Bundles .skill files, regenerates plugin manifests
.claude-plugin/          Generated marketplace manifests (committed)
```

Built with [Astro](https://astro.build). No UI framework, no client-side data fetching —
filtering runs over pre-rendered cards in the DOM.

## License

MIT. Replace this section with your own terms if you fork it.
