/**
 * Rewrites relative links and images inside skill bodies and external articles
 * so they resolve on the published site.
 *
 * A skill may point at a sibling file (`[reference](reference.md)`) — correct
 * inside the installed folder, but a 404 on a site that only publishes pages.
 * Those targets are pointed at the file in the repository instead: links to the
 * GitHub blob view, images to raw content so they actually render.
 *
 * Blog posts link to pages on this site instead (`[mentor](/skills/mentor/)`).
 * Those site-absolute links get the deploy base in front, so they also work
 * when the site is served from `/<repo>/` on GitHub Pages.
 */
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { resolveRepo } from '../src/lib/repo.mjs';

const config = parse(readFileSync(new URL('../config.yaml', import.meta.url), 'utf8'));
const repo = resolveRepo(config.site?.repo).slug;
const branch = config.site?.branch || 'main';

const isExternal = (url) => !url || /^(?:[a-z]+:|\/\/|\/|#)/i.test(url);

const isSiteAbsolute = (url) => /^\/(?!\/)/.test(url ?? '');

export function remarkRepoLinks({ base = '/' } = {}) {
  const prefix = base.replace(/\/$/, '');

  return (tree, file) => {
    // Path of the markdown file relative to the repository root.
    const source = (file.history?.[0] ?? '').replace(/\\/g, '/');

    if (/\/posts\/[^/]+\.md$/.test(source)) {
      if (!prefix) return;
      const visitPost = (node) => {
        if ((node.type === 'link' || node.type === 'image') && isSiteAbsolute(node.url)) {
          node.url = prefix + node.url;
        }
        node.children?.forEach(visitPost);
      };
      visitPost(tree);
      return;
    }

    if (!repo) return;
    const match = source.match(/\/((?:skills|external)\/.+)$/);
    if (!match) return;

    const dir = match[1].slice(0, match[1].lastIndexOf('/'));

    const visit = (node) => {
      if ((node.type === 'link' || node.type === 'image') && !isExternal(node.url)) {
        const host =
          node.type === 'image'
            ? `https://raw.githubusercontent.com/${repo}/${branch}`
            : `https://github.com/${repo}/blob/${branch}`;
        node.url = new URL(node.url, `${host}/${dir}/`).href;
      }
      node.children?.forEach(visit);
    };

    visit(tree);
  };
}
