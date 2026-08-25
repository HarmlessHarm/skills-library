import { getCollection, type CollectionEntry } from 'astro:content';
import { config, maintainer, titleCase } from './config';
import type { ItemType } from './install';

/** A tag, as written in frontmatter and as shown on a chip. */
export interface Tag {
  /** Lower-cased, used for matching and as the URL value. */
  id: string;
  /** Capitalised, used everywhere it is shown. */
  label: string;
}

/** A skill or a command, normalised into one shape for cards and pages. */
export interface Item {
  type: ItemType;
  slug: string;
  name: string;
  title: string;
  description: string;
  tags: Tag[];
  version: string;
  author: string;
  license?: string;
  homepage?: string;
  argumentHint?: string;
  entry: CollectionEntry<'skills'> | CollectionEntry<'commands'>;
}

function toTags(values: string[]): Tag[] {
  const seen = new Map<string, Tag>();
  for (const value of values) {
    const id = value.trim().toLowerCase();
    if (id && !seen.has(id)) seen.set(id, { id, label: titleCase(id) });
  }
  return [...seen.values()].sort((a, b) => a.label.localeCompare(b.label));
}

function normalise(entry: CollectionEntry<'skills'> | CollectionEntry<'commands'>, type: ItemType): Item {
  const data = entry.data;
  return {
    type,
    slug: entry.id,
    name: data.name,
    title: data.title ?? titleCase(data.name),
    description: data.description,
    tags: toTags(data.tags),
    version: data.version ?? config.defaults.version,
    author: data.author ?? maintainer.name,
    license: data.license ?? config.defaults.license,
    homepage: data.homepage,
    argumentHint: 'argument-hint' in data ? data['argument-hint'] : undefined,
    entry,
  };
}

const byTitle = (a: Item, b: Item) => a.title.localeCompare(b.title);

export async function getSkills(): Promise<Item[]> {
  return (await getCollection('skills')).map((e) => normalise(e, 'skill')).sort(byTitle);
}

export async function getCommands(): Promise<Item[]> {
  return (await getCollection('commands')).map((e) => normalise(e, 'command')).sort(byTitle);
}

export async function getItems(): Promise<Item[]> {
  return [...(await getSkills()), ...(await getCommands())].sort(byTitle);
}

/** Every tag in use, most common first, then alphabetically. */
export function usedTags(items: Item[]): (Tag & { count: number })[] {
  const counts = new Map<string, Tag & { count: number }>();

  for (const item of items) {
    for (const tag of item.tags) {
      const existing = counts.get(tag.id);
      if (existing) existing.count++;
      else counts.set(tag.id, { ...tag, count: 1 });
    }
  }

  return [...counts.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}
