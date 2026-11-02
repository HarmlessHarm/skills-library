/**
 * Opens links that leave the site in a new tab, so a reader browsing skills,
 * articles or posts keeps their place here.
 *
 * Runs after remark-repo-links, so relative links it has pointed at GitHub
 * count as external too. Links on this site (site-absolute or relative) and
 * in-page anchors are left alone.
 */
const isExternal = (href) => /^(?:https?:)?\/\//i.test(href ?? '');

export function rehypeExternalLinks() {
  return (tree) => {
    const visit = (node) => {
      if (node.type === 'element' && node.tagName === 'a' && isExternal(node.properties?.href)) {
        node.properties.target = '_blank';
        node.properties.rel = ['noopener'];
      }
      node.children?.forEach(visit);
    };

    visit(tree);
  };
}
