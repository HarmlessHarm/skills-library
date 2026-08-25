#!/usr/bin/env node
/**
 * Prepares everything the site cannot generate from markdown alone:
 *
 *   1. public/downloads/<name>.skill   — a zip of each skills/<name>/ folder
 *   2. public/downloads/<name>.md      — a copy of each command, so downloads
 *                                        are served by the site itself
 *   3. .claude-plugin/{marketplace,plugin}.json,
 *      .codex-plugin/plugin.json and .agents/plugins/marketplace.json
 *      — all regenerated from config.yaml
 *
 * Runs before both `npm run dev` and `npm run build`.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import JSZip from 'jszip';
import { resolveRepo } from '../src/lib/repo.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const config = parse(readFileSync(join(root, 'config.yaml'), 'utf8'));

const SKILLS_DIR = join(root, 'skills');
const COMMANDS_DIR = join(root, 'commands');
const OUT_DIR = join(root, 'public', 'downloads');
const CLAUDE_DIR = join(root, '.claude-plugin');
const CODEX_DIR = join(root, '.codex-plugin');
const CODEX_MARKET_DIR = join(root, '.agents', 'plugins');

// Fixed timestamp so repeated builds produce byte-identical archives.
const FIXED_DATE = new Date('2000-01-01T00:00:00Z');

const exists = (p) => {
  try { statSync(p); return true; } catch { return false; }
};

const dirs = (p) =>
  exists(p) ? readdirSync(p, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name) : [];

const files = (p, ext) =>
  exists(p) ? readdirSync(p, { withFileTypes: true }).filter((e) => e.isFile() && e.name.endsWith(ext)).map((e) => e.name) : [];

/** Every file under `dir`, recursively, as paths relative to `dir`. */
function walk(dir, base = dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return walk(full, base);
    if (entry.isFile()) return [relative(base, full)];
    return [];
  });
}

rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });

// 1. Skill bundles ----------------------------------------------------------
let skillCount = 0;
for (const name of dirs(SKILLS_DIR)) {
  const dir = join(SKILLS_DIR, name);
  if (!exists(join(dir, 'SKILL.md'))) {
    console.warn(`[assets] skills/${name}/ has no SKILL.md — skipped`);
    continue;
  }

  const zip = new JSZip();
  for (const rel of walk(dir).sort()) {
    // Paths are written in full and nested under the skill name, so unzipping
    // yields <name>/SKILL.md. `createFolders: false` keeps implicit directory
    // entries — which would carry the current time — out of the archive.
    const path = `${name}/${rel.split(sep).join('/')}`;
    zip.file(path, readFileSync(join(dir, rel)), { date: FIXED_DATE, createFolders: false });
  }

  const buffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });
  writeFileSync(join(OUT_DIR, `${name}.skill`), buffer);
  skillCount++;
}

// 2. Command copies ---------------------------------------------------------
let commandCount = 0;
for (const file of files(COMMANDS_DIR, '.md')) {
  writeFileSync(join(OUT_DIR, file), readFileSync(join(COMMANDS_DIR, file)));
  commandCount++;
}

// 3. Plugin manifests -------------------------------------------------------
const repo = resolveRepo(config.site?.repo);

// Both ecosystems require a kebab-case identifier, and a repository name is
// not guaranteed to be one.
const toKebab = (value) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

const pluginName = toKebab(repo.name || 'skills-library');
const version = config.defaults?.version ?? '1.0.0';
const description = config.site?.description ?? '';
const homepage = repo.slug ? `https://github.com/${repo.slug}` : undefined;

// Same rule as the site: an explicit author wins, otherwise the repo owner.
// `url` is optional in both schemas but worth setting — it points attribution
// at a real profile rather than leaving a bare name.
const author = {
  name: config.site?.author || repo.owner || 'Unknown',
  ...(repo.owner ? { url: `https://github.com/${repo.owner}` } : {}),
};

const write = (dir, file, value) => {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, file), `${JSON.stringify(value, null, 2)}\n`);
};

// Claude — https://code.claude.com/docs/en/plugin-marketplaces
write(CLAUDE_DIR, 'plugin.json', {
  name: pluginName,
  description,
  version,
  author,
  ...(homepage ? { homepage } : {}),
  ...(config.defaults?.license ? { license: config.defaults.license } : {}),
});

write(CLAUDE_DIR, 'marketplace.json', {
  name: pluginName,
  owner: author,
  plugins: [{ name: pluginName, source: './', description, version }],
});

// Codex — the plugin manifest. `skills` is a path relative to the plugin root,
// which is the repository root here. commands/ is picked up by convention.
write(CODEX_DIR, 'plugin.json', {
  name: pluginName,
  version,
  description,
  author,
  ...(homepage ? { homepage, repository: homepage } : {}),
  ...(config.defaults?.license ? { license: config.defaults.license } : {}),
  skills: './skills/',
  interface: {
    displayName: config.site?.title ?? pluginName,
    shortDescription: config.site?.tagline ?? description,
  },
});

// Codex — the marketplace this repository publishes, so that
// `codex plugin marketplace add <owner>/<repo>` resolves. The default
// marketplace path is .agents/plugins/marketplace.json, and the single plugin
// it lists is the repository itself.
write(CODEX_MARKET_DIR, 'marketplace.json', {
  name: pluginName,
  interface: { displayName: config.site?.title ?? pluginName },
  plugins: [
    {
      name: pluginName,
      source: { source: 'local', path: './' },
      policy: { installation: 'AVAILABLE' },
      category: 'Productivity',
    },
  ],
});

console.log(
  `[assets] ${skillCount} skill bundle(s), ${commandCount} command file(s), Claude + Codex plugin manifests for "${pluginName}"`,
);
