/**
 * Rewrites relative links and images inside skill and command bodies so they
 * resolve on the published site.
 *
 * A skill may point at a sibling file (`[reference](reference.md)`) — correct
 * inside the installed folder, but a 404 on a site that only publishes pages.
 * Those targets are pointed at the file in the repository instead: links to the
 * GitHub blob view, images to raw content so they actually render.
 */
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';

const config = parse(readFileSync(new URL('../config.yaml', import.meta.url), 'utf8'));
const repo = config.site?.repo ?? '';
const branch = config.site?.branch || 'main';

const isExternal = (url) => !url || /^(?:[a-z]+:|\/\/|\/|#)/i.test(url);

export function remarkRepoLinks() {
  return (tree, file) => {
    if (!repo) return;

    // Path of the markdown file relative to the repository root.
    const source = (file.history?.[0] ?? '').replace(/\\/g, '/');
    const match = source.match(/\/((?:skills|commands)\/.+)$/);
    if (!match) return;

    const dir = match[1].slice(0, match[1].lastIndexOf('/'));

    const visit = (node) => {
      if ((node.type === 'link' || node.type === 'image') && !isExternal(node.url)) {
        const host =
          node.type === 'image'
            ? `https://raw.githubusercontent.com/${repo}/${branch}`
            : `https://github.com/${repo}/blob/${branch}`;
        node.url = `${host}/${dir}/${node.url}`.replace(/([^:])\/{2,}/g, '$1/');
      }
      node.children?.forEach(visit);
    };

    visit(tree);
  };
}
