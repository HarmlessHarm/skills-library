import { getCollection, type CollectionEntry } from 'astro:content';
import { config, maintainer, titleCase } from './config';
import { withBase } from './url';

/** A tag, as written in frontmatter and as shown on a chip. */
export interface Tag {
  /** Lower-cased, used for matching and as the URL value. */
  id: string;
  /** Capitalised, used everywhere it is shown. */
  label: string;
}

/** What every card needs, whether the item lives here or elsewhere. */
interface BaseItem {
  slug: string;
  title: string;
  description: string;
  tags: Tag[];
  href: string;
}

/** A skill in this library, normalised into one shape for cards and pages. */
export interface Skill extends BaseItem {
  origin: 'library';
  kind: 'skill';
  kindLabel: string;
  name: string;
  version: string;
  author: string;
  license?: string;
  homepage?: string;
  entry: CollectionEntry<'skills'>;
}

export type ExternalKind = CollectionEntry<'external'>['data']['kind'];

/** Something found online: described here, installed from its own source. */
export interface External extends BaseItem {
  origin: 'external';
  kind: ExternalKind;
  kindLabel: string;
  source: string;
  /** `owner/repo` for GitHub sources, otherwise the host name. */
  sourceLabel: string;
  author?: string;
  license?: string;
  contributor?: string;
  install: { label?: string; script: string }[];
  entry: CollectionEntry<'external'>;
}

export type Item = Skill | External;

export const kindLabels: Record<ExternalKind, string> = {
  skill: 'Skill',
  collection: 'Skill collection',
  plugin: 'Plugin',
  tool: 'Tool',
};

/** Every kind in use, in the order of `kindLabels`, with how many items have it. */
export function usedKinds(items: Item[]): { id: ExternalKind; label: string; count: number }[] {
  return (Object.keys(kindLabels) as ExternalKind[])
    .map((id) => ({ id, label: kindLabels[id], count: items.filter((i) => i.kind === id).length }))
    .filter((k) => k.count > 0);
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
    origin: 'library',
    kind: 'skill',
    kindLabel: kindLabels.skill,
    slug: entry.id,
    href: withBase(`/skills/${entry.id}/`),
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

function sourceLabel(source: string): string {
  const url = new URL(source);
  if (url.hostname === 'github.com') return url.pathname.split('/').slice(1, 3).join('/');
  return url.hostname.replace(/^www\./, '');
}

function normaliseExternal(entry: CollectionEntry<'external'>): External {
  const data = entry.data;
  return {
    origin: 'external',
    slug: entry.id,
    href: withBase(`/external/${entry.id}/`),
    title: data.title,
    description: data.description,
    tags: toTags(data.tags),
    kind: data.kind,
    kindLabel: kindLabels[data.kind],
    source: data.source,
    sourceLabel: sourceLabel(data.source),
    author: data.author,
    license: data.license,
    contributor: data.contributor,
    install: data.install,
    entry,
  };
}

const byTitle = (a: BaseItem, b: BaseItem) => a.title.localeCompare(b.title);

export async function getSkills(): Promise<Skill[]> {
  return (await getCollection('skills')).map(normalise).sort(byTitle);
}

export async function getExternal(): Promise<External[]> {
  return (await getCollection('external')).map(normaliseExternal).sort(byTitle);
}

/** Library skills and external picks together, as the home page lists them. */
export async function getItems(): Promise<Item[]> {
  return [...(await getSkills()), ...(await getExternal())].sort(byTitle);
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
