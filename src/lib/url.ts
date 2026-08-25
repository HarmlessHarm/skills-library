const BASE = import.meta.env.BASE_URL;

/**
 * Prefixes a site-absolute path with Astro's configured base, so every link
 * works both at the domain root and under `/<repo>/` on GitHub Pages.
 */
export function withBase(path: string): string {
  const trimmedBase = BASE.endsWith('/') ? BASE.slice(0, -1) : BASE;
  const trimmedPath = path.startsWith('/') ? path : `/${path}`;
  return `${trimmedBase}${trimmedPath}` || '/';
}
