import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import { parse } from 'yaml';
import { resolveRepo, isUserSite } from './src/lib/repo.mjs';
import { remarkRepoLinks } from './scripts/remark-repo-links.mjs';

const config = parse(readFileSync(fileURLToPath(new URL('./config.yaml', import.meta.url)), 'utf8'));

// Derived from the repository, so a fork deploys to the right path with no
// edits. `site.url` / `site.base` in config.yaml override this.
const repo = resolveRepo(config.site?.repo);

export default defineConfig({
  site: config.site?.url || (repo.owner ? `https://${repo.owner}.github.io` : undefined),
  base: config.site?.base || (repo.name && !isUserSite(repo) ? `/${repo.name}` : '/'),
  output: 'static',
  trailingSlash: 'ignore',
  markdown: {
    remarkPlugins: [remarkRepoLinks],
  },
});
