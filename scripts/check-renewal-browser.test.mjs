import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, writeFileSync, rmSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {selectPublishedNoteRoutes} from './lib/renewal-browser-routes.mjs';

const en = 'src/content/notes/demo/example.mdx';
const ru = 'src/content/notes-ru/demo/example.mdx';
const review = 'content-rights/reviews/demo-example.json';
function fixture(t) {
  const root = mkdtempSync(path.join(os.tmpdir(), 'renewal-browser-routes-'));
  t.after(() => rmSync(root, {recursive: true, force: true}));
  const write = (name, value) => {
    const file = path.join(root, name);
    mkdirSync(path.dirname(file), {recursive: true});
    writeFileSync(file, typeof value === 'string' ? value : JSON.stringify(value));
  };
  write(en, '---\nstatus: published\n---\nEnglish note.\n');
  write(ru, '---\nstatus: "published" # YAML comment\n---\nRussian note.\n');
  write(review, {files: {[en]: 'hash-en', [ru]: 'hash-ru', 'docs/review.md': 'hash-report'}});
  return {root, write};
}

for (const [missing, built] of [['en', 'ru'], ['ru', 'en']]) {
  test(`a missing published ${missing.toUpperCase()} route fails instead of being skipped`, t => {
    const f = fixture(t);
    f.write(`dist/${built === 'ru' ? 'ru/' : ''}notes/demo/example/index.html`, '<h1>Built</h1>');
    assert.throws(() => selectPublishedNoteRoutes(f.root, [review], new Set()),
      new RegExp(`selected published note has no built route /${missing === 'ru' ? 'ru/' : ''}notes/demo/example/`));
  });
}

test('a report-only review update selects both locales without direct note changes', t => {
  const f = fixture(t);
  f.write('dist/notes/demo/example/index.html', '<h1>English</h1>');
  f.write('dist/ru/notes/demo/example/index.html', '<h1>Russian</h1>');
  assert.deepEqual(selectPublishedNoteRoutes(f.root, ['docs/review.md', review], new Set()), [
    {id: 'demo/example', locale: 'en', route: '/notes/demo/example/'},
    {id: 'demo/example', locale: 'ru', route: '/ru/notes/demo/example/'},
  ]);
});

test('held, unpublished and deleted notes do not require built routes', t => {
  const f = fixture(t);
  assert.deepEqual(selectPublishedNoteRoutes(f.root, [review], new Set(['demo/example'])), []);
  f.write(en, '---\nstatus: draft\n---\nstatus: published\n');
  f.write(ru, '---\nstatus: needs-review\n---\nNot published.\n');
  assert.deepEqual(selectPublishedNoteRoutes(f.root, [review, 'src/content/notes/demo/deleted.mdx'], new Set()), []);
});

test('direct changed notes are checked and unrelated documentation selects none', t => {
  const f = fixture(t);
  assert.throws(() => selectPublishedNoteRoutes(f.root, [en], new Set()), /no built route/);
  assert.deepEqual(selectPublishedNoteRoutes(f.root, ['docs/unrelated.md'], new Set()), []);
});
