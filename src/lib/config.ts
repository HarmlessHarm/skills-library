import { readFileSync } from 'node:fs';
import { parse } from 'yaml';

/** An install target shown in the header dropdown. */
export interface AgentConfig {
  id: string;
  label: string;
  /** Directory skills are installed into, e.g. `~/.claude/skills`. */
  skillDir: string;
  /** Where a single command file goes. May contain `{name}`. */
  commandPath: string;
  docs?: string;
}

export interface CategoryConfig {
  id: string;
  label: string;
}

export interface SiteConfig {
  site: {
    title: string;
    tagline: string;
    description: string;
    author: string;
    repo: string;
    branch: string;
    url?: string | null;
    base?: string | null;
  };
  defaults: { version: string; author: string; license?: string };
  theme: Record<string, string>;
  categories: CategoryConfig[];
  defaultAgent: string;
  agents: AgentConfig[];
}

const raw = parse(readFileSync(new URL('../../config.yaml', import.meta.url), 'utf8'));

export const config: SiteConfig = {
  ...raw,
  categories: raw.categories ?? [],
  agents: raw.agents ?? [],
  defaults: { version: '1.0.0', author: '', ...(raw.defaults ?? {}) },
  theme: raw.theme ?? {},
};

if (config.agents.length === 0) {
  throw new Error('config.yaml must list at least one entry under `agents:`.');
}

/** The agent selected when a visitor has not chosen one yet. */
export const defaultAgent: AgentConfig =
  config.agents.find((a) => a.id === config.defaultAgent) ?? config.agents[0];

const [owner = '', repoName = ''] = (config.site.repo ?? '').split('/');
export const repo = { owner, name: repoName, slug: config.site.repo, branch: config.site.branch || 'main' };

/** The category chip a given frontmatter `category` maps to. */
export function resolveCategory(id?: string): CategoryConfig {
  if (!id) return { id: 'other', label: 'Other' };
  return config.categories.find((c) => c.id === id) ?? { id, label: titleCase(id) };
}

export function titleCase(value: string): string {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}
