import { execFileSync } from 'node:child_process';

/**
 * Works out which GitHub repository this site belongs to, so a fork needs no
 * edits to show the right owner, links and install commands.
 *
 * In order of precedence:
 *   1. `site.repo` in config.yaml — an explicit override
 *   2. GITHUB_REPOSITORY — set by Actions, so CI always knows
 *   3. the `origin` remote — so a fresh clone is right locally too
 *
 * Shared by astro.config.mjs, scripts/build-assets.mjs and src/lib/config.ts
 * so all three agree on the answer.
 */
export function resolveRepo(configured) {
  const slug = configured || process.env.GITHUB_REPOSITORY || fromGitRemote();
  const [owner = '', name = ''] = slug.split('/');
  return { owner, name, slug: owner && name ? `${owner}/${name}` : '' };
}

function fromGitRemote() {
  try {
    const url = execFileSync('git', ['remote', 'get-url', 'origin'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();

    // Matches both git@github.com:owner/repo.git and https://github.com/owner/repo
    const match = url.match(/github\.com[:/]([^/]+)\/(.+?)(?:\.git)?$/);
    return match ? `${match[1]}/${match[2]}` : '';
  } catch {
    // No git, no remote, or a tarball download — fall through to unset.
    return '';
  }
}

/** A repo named <owner>.github.io is served from the domain root. */
export function isUserSite({ owner, name }) {
  return Boolean(owner) && name.toLowerCase() === `${owner.toLowerCase()}.github.io`;
}
