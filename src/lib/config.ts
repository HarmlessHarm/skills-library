import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { resolveRepo } from './repo.mjs';

/** An install target shown in the header dropdown. */
export interface AgentConfig {
  id: string;
  label: string;
  /** Directory skills are installed into, e.g. `~/.claude/skills`. */
  skillDir: string;
  /** Where a single command file goes. May contain `{name}`. */
  commandPath: string;
  /** Command that installs the whole library. Omitted for agents with no
      plugin ecosystem. */
  marketplace?: string;
  docs?: string;
}

export interface SiteConfig {
  site: {
    title: string;
    tagline: string;
    description: string;
    author?: string | null;
    repo?: string | null;
    branch?: string | null;
    url?: string | null;
    base?: string | null;
  };
  defaults: { version: string; license?: string };
  theme: Record<string, string>;
  defaultAgent: string;
  agents: AgentConfig[];
}

const raw = parse(readFileSync(new URL('../../config.yaml', import.meta.url), 'utf8'));

export const config: SiteConfig = {
  ...raw,
  site: raw.site ?? {},
  agents: raw.agents ?? [],
  defaults: { version: '1.0.0', ...(raw.defaults ?? {}) },
  theme: raw.theme ?? {},
};

if (config.agents.length === 0) {
  throw new Error('config.yaml must list at least one entry under `agents:`.');
}

/** The agent selected when a visitor has not chosen one yet. */
export const defaultAgent: AgentConfig =
  config.agents.find((a) => a.id === config.defaultAgent) ?? config.agents[0];

const detected = resolveRepo(config.site.repo);

export const repo = {
  ...detected,
  branch: config.site.branch || 'main',
  url: detected.slug ? `https://github.com/${detected.slug}` : '',
};

/**
 * Who the site says it is maintained by. Defaults to the repository owner, so
 * a fork is correctly attributed without anyone editing config.yaml.
 */
export const maintainer = {
  name: config.site.author || repo.owner,
  url: repo.owner ? `https://github.com/${repo.owner}` : '',
};

/** Turns a tag like `pull-request` into the `Pull Request` shown on chips. */
export function titleCase(value: string): string {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}
