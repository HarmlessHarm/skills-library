import rawConfig from '../../config.yaml?raw';
import { parse } from 'yaml';
import { resolveRepo } from './repo.mjs';

/** An install target shown in the header dropdown. */
export interface AgentConfig {
  id: string;
  label: string;
  /** The agent's identifier in the `skills` CLI, passed as `-a`. */
  skillsAgent: string;
  docs?: string;
}

/**
 * Quick theming from config.yaml. Every key is optional and overrides the
 * matching token in src/styles/theme.css. `...Dark` keys are the dark-mode
 * value and default to their light counterpart.
 */
export interface ThemeConfig {
  accent?: string | null;
  accentDark?: string | null;
  accentText?: string | null;
  accentTextDark?: string | null;
  brand?: string | null;
  brandDark?: string | null;
  font?: string | null;
  /** A stylesheet URL that loads `font`, for typefaces that are not bundled. */
  fontStylesheet?: string | null;
  monoFont?: string | null;
  radius?: string | null;
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
    /** Header logo, as a path inside public/. Empty for the built-in mark. */
    logo?: string | null;
  };
  defaults: { version: string; license?: string };
  theme: ThemeConfig;
  defaultAgent: string;
  agents: AgentConfig[];
}

const raw = parse(rawConfig);

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

/** A light/dark pair as a `light-dark()` value, or undefined if neither is set. */
function pair(light?: string | null, dark?: string | null): string | undefined {
  if (!light && !dark) return undefined;
  // light-dark() takes two colours; with one side missing, use the other.
  return `light-dark(${light || dark}, ${dark || light})`;
}

/**
 * The `theme:` block as CSS custom properties, ready to inject after
 * theme.css. Only keys that are actually set are emitted, so an empty or
 * missing block changes nothing.
 */
export function themeVariables(theme: ThemeConfig = config.theme): string {
  const radius = theme.radius?.toString().trim();
  const vars: Record<string, string | undefined | null> = {
    '--accent': pair(theme.accent, theme.accentDark),
    '--accent-contrast': pair(theme.accentText, theme.accentTextDark),
    '--brand': pair(theme.brand, theme.brandDark),
    '--font': theme.font,
    '--font-mono': theme.monoFont,
    '--radius': radius,
    // Buttons and inputs keep the same proportion to cards as in theme.css.
    '--radius-md': radius && `calc(${radius} * 0.7)`,
  };
  return Object.entries(vars)
    .filter(([, value]) => Boolean(value))
    .map(([key, value]) => `${key}: ${value};`)
    .join(' ');
}

/** Turns a tag like `pull-request` into the `Pull Request` shown on chips. */
export function titleCase(value: string): string {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}
