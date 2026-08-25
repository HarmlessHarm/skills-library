import { getCollection, type CollectionEntry } from 'astro:content';
import { config, resolveCategory, titleCase, type CategoryConfig } from './config';
import type { ItemType } from './install';

/** A skill or a command, normalised into one shape for cards and pages. */
export interface Item {
  type: ItemType;
  slug: string;
  name: string;
  title: string;
  description: string;
  category: CategoryConfig;
  tags: string[];
  version: string;
  author: string;
  license?: string;
  homepage?: string;
  argumentHint?: string;
  entry: CollectionEntry<'skills'> | CollectionEntry<'commands'>;
}

function normalise(entry: CollectionEntry<'skills'> | CollectionEntry<'commands'>, type: ItemType): Item {
  const data = entry.data;
  return {
    type,
    slug: entry.id,
    name: data.name,
    title: data.title ?? titleCase(data.name),
    description: data.description,
    category: resolveCategory(data.category),
    tags: [...new Set(data.tags)].sort(),
    version: data.version ?? config.defaults.version,
    author: data.author ?? config.defaults.author,
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

/** Categories that are actually in use, in the order config.yaml declares them. */
export function usedCategories(items: Item[]): CategoryConfig[] {
  const counts = new Map<string, CategoryConfig>();
  for (const item of items) counts.set(item.category.id, item.category);

  const declared = config.categories.filter((c) => counts.has(c.id));
  const extra = [...counts.values()]
    .filter((c) => !config.categories.some((d) => d.id === c.id))
    .sort((a, b) => a.label.localeCompare(b.label));

  return [...declared, ...extra];
}

/** Every tag in use, most common first, then alphabetically. */
export function usedTags(items: Item[]): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    for (const tag of item.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}
