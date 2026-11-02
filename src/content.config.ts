import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Skill frontmatter. `name` and `description` are the two
 * the Agent Skills spec requires; everything else drives this site only, and is
 * safe to omit.
 *
 * Tags are free-form: write them however you like, they are matched
 * case-insensitively and displayed capitalised.
 */
const base = z.object({
  name: z.string(),
  description: z.string(),
  title: z.string().optional(),
  tags: z.array(z.string()).default([]),
  version: z.string().optional(),
  author: z.string().optional(),
  license: z.string().optional(),
  homepage: z.string().url().optional(),
});

/**
 * Skills, plugins and tools found elsewhere. These are only described here —
 * a short article plus how to get it from the original source — so they live
 * outside skills/ and never end up in `npx skills add` for this library.
 */
const external = defineCollection({
  loader: glob({
    pattern: 'external/*.md',
    base: '.',
    generateId: ({ entry }) => entry.split('/')[1].replace(/\.md$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    kind: z.enum(['skill', 'collection', 'plugin', 'tool']),
    source: z.string().url(),
    author: z.string().optional(),
    license: z.string().optional(),
    tags: z.array(z.string()).default([]),
    install: z.array(z.object({ label: z.string().optional(), script: z.string() })).default([]),
    contributor: z.string().optional(),
  }),
});

const skills = defineCollection({
  loader: glob({
    pattern: 'skills/*/SKILL.md',
    base: '.',
    generateId: ({ entry }) => entry.split('/')[1],
  }),
  schema: base,
});

/**
 * Blog posts: short write-ups by colleagues about a skill, tool or framework
 * they used. Files starting with `_` (like `_template.md`) are skipped.
 *
 * `skills` lists the slugs of library skills or external picks the post is
 * about; they link both ways, and an unknown slug fails the build.
 */
const posts = defineCollection({
  loader: glob({
    pattern: 'posts/[!_]*.md',
    base: '.',
    generateId: ({ entry }) => entry.split('/')[1].replace(/\.md$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    author: z.string(),
    role: z.string().optional(),
    topic: z.string().optional(),
    tags: z.array(z.string()).default([]),
    skills: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { skills, external, posts };
