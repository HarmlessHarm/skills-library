import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import { parse } from 'yaml';
import { remarkRepoLinks } from './scripts/remark-repo-links.mjs';

const config = parse(readFileSync(fileURLToPath(new URL('./config.yaml', import.meta.url)), 'utf8'));

// Derive the deploy URL from the repository we are building in, so a fork works
// with no edits at all. `site.url` / `site.base` in config.yaml override this.
const [envOwner, envRepo] = (process.env.GITHUB_REPOSITORY ?? '').split('/');
const [cfgOwner, cfgRepo] = (config.site?.repo ?? '').split('/');
const owner = envOwner || cfgOwner;
const repo = envRepo || cfgRepo;

// A repo named <owner>.github.io is served from the domain root, everything
// else from /<repo>/.
const isUserSite = Boolean(owner) && repo?.toLowerCase() === `${owner.toLowerCase()}.github.io`;

export default defineConfig({
  site: config.site?.url || (owner ? `https://${owner}.github.io` : undefined),
  base: config.site?.base || (repo && !isUserSite ? `/${repo}` : '/'),
  output: 'static',
  markdown: {
    remarkPlugins: [remarkRepoLinks],
  },
  trailingSlash: 'ignore',
});
