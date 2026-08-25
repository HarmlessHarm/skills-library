import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { config } from './lib/config';

/**
 * Fields shared by skills and commands. `name` and `description` are the two
 * the Agent Skills spec requires; everything else drives this site only, and is
 * safe to omit.
 */
const base = z.object({
  name: z.string(),
  description: z.string(),
  title: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  version: z.string().optional(),
  author: z.string().optional(),
  license: z.string().optional(),
  homepage: z.string().url().optional(),
});

const known = new Set(config.categories.map((c) => c.id));

/** Warns rather than fails, so a typo never breaks a fork's deploy. */
function warnUnknownCategory(data: z.infer<typeof base>, where: string) {
  if (data.category && !known.has(data.category)) {
    console.warn(
      `[content] ${where}: category "${data.category}" is not listed in config.yaml — it will still appear, filed under its own chip.`,
    );
  }
  return data;
}

const skills = defineCollection({
  loader: glob({ pattern: 'skills/*/SKILL.md', base: '.', generateId: ({ entry }) => entry.split('/')[1] }),
  schema: base.transform((data) => warnUnknownCategory(data, `skills/${data.name}`)),
});

const commands = defineCollection({
  loader: glob({
    pattern: 'commands/*.md',
    base: '.',
    generateId: ({ entry }) => entry.split('/').pop().replace(/\.md$/, ''),
  }),
  schema: base
    .extend({
      'argument-hint': z.string().optional(),
      model: z.string().optional(),
    })
    .transform((data) => warnUnknownCategory(data, `commands/${data.name}`)),
});

export const collections = { skills, commands };
