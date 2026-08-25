import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Fields shared by skills and commands. `name` and `description` are the two
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

const skills = defineCollection({
  loader: glob({
    pattern: 'skills/*/SKILL.md',
    base: '.',
    generateId: ({ entry }) => entry.split('/')[1],
  }),
  schema: base,
});

const commands = defineCollection({
  loader: glob({
    pattern: 'commands/*.md',
    base: '.',
    generateId: ({ entry }) => entry.split('/').pop().replace(/\.md$/, ''),
  }),
  schema: base.extend({
    'argument-hint': z.string().optional(),
    model: z.string().optional(),
  }),
});

export const collections = { skills, commands };
