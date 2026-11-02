#!/usr/bin/env node
/**
 * Zips each skills/<name>/ folder into public/downloads/<name>.skill, the one
 * thing the site cannot generate from markdown alone.
 *
 * Runs before both `npm run dev` and `npm run build`.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';

const root = fileURLToPath(new URL('..', import.meta.url));

const SKILLS_DIR = join(root, 'skills');
const OUT_DIR = join(root, 'public', 'downloads');

// Fixed timestamp so repeated builds produce byte-identical archives.
const FIXED_DATE = new Date('2000-01-01T00:00:00Z');

const exists = (p) => {
  try { statSync(p); return true; } catch { return false; }
};

const dirs = (p) =>
  exists(p) ? readdirSync(p, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name) : [];

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

console.log(`[assets] ${skillCount} skill bundle(s)`);
