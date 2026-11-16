import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {parseFrontmatter} from '@astrojs/markdown-remark';

const notePath = /^src\/content\/(notes|notes-ru)\/(.+)\.mdx$/;

export function selectPublishedNoteRoutes(root, changed, held) {
  const notes = new Set(changed.filter(file => notePath.test(file)));
  for (const file of changed.filter(file => /^content-rights\/reviews\/.+\.json$/.test(file))) {
    const reviewPath = path.join(root, file);
    if (!fs.existsSync(reviewPath)) continue;
    const review = JSON.parse(fs.readFileSync(reviewPath, 'utf8'));
    for (const file of Object.keys(review.files || {})) {
      if (notePath.test(file)) notes.add(file);
    }
  }

  const routes = [];
  for (const file of notes) {
    const sourcePath = path.join(root, file);
    if (!fs.existsSync(sourcePath)) continue;
    const [, folder, id] = file.match(notePath);
    if (held.has(id)) continue;
    const {frontmatter} = parseFrontmatter(fs.readFileSync(sourcePath, 'utf8'));
    if (frontmatter.status !== 'published') continue;
    const locale = folder === 'notes-ru' ? 'ru' : 'en';
    const route = `/${locale === 'ru' ? 'ru/' : ''}notes/${id}/`;
    assert.ok(fs.existsSync(path.join(root, 'dist', route, 'index.html')),
      `${file}: selected published note has no built route ${route}`);
    routes.push({id, locale, route});
  }
  return routes;
}
