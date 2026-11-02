import { getCollection, type CollectionEntry } from 'astro:content';
import { config, maintainer, titleCase } from './config';

/** A tag, as written in frontmatter and as shown on a chip. */
export interface Tag {
  /** Lower-cased, used for matching and as the URL value. */
  id: string;
  /** Capitalised, used everywhere it is shown. */
  label: string;
}

/** A skill, normalised into one shape for cards and pages. */
export interface Skill {
  slug: string;
  name: string;
  title: string;
  description: string;
  tags: Tag[];
  version: string;
  author: string;
  license?: string;
  homepage?: string;
  entry: CollectionEntry<'skills'>;
}

function toTags(values: string[]): Tag[] {
  const seen = new Map<string, Tag>();
  for (const value of values) {
    const id = value.trim().toLowerCase();
    if (id && !seen.has(id)) seen.set(id, { id, label: titleCase(id) });
  }
  return [...seen.values()].sort((a, b) => a.label.localeCompare(b.label));
}

function normalise(entry: CollectionEntry<'skills'>): Skill {
  const data = entry.data;
  return {
    slug: entry.id,
    name: data.name,
    title: data.title ?? titleCase(data.name),
    description: data.description,
    tags: toTags(data.tags),
    version: data.version ?? config.defaults.version,
    author: data.author ?? maintainer.name,
    license: data.license ?? config.defaults.license,
    homepage: data.homepage,
    entry,
  };
}

export async function getSkills(): Promise<Skill[]> {
  return (await getCollection('skills')).map(normalise).sort((a, b) => a.title.localeCompare(b.title));
}

/** Every tag in use, most common first, then alphabetically. */
export function usedTags(skills: Skill[]): (Tag & { count: number })[] {
  const counts = new Map<string, Tag & { count: number }>();

  for (const skill of skills) {
    for (const tag of skill.tags) {
      const existing = counts.get(tag.id);
      if (existing) existing.count++;
      else counts.set(tag.id, { ...tag, count: 1 });
    }
  }

  return [...counts.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}
