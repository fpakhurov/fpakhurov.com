import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const ids = JSON.parse(readFileSync(path.join(root, 'src/data/withdrawnNotes.json'), 'utf8'));
const args = process.argv.slice(2);
if (args.length && (args.length !== 2 || args[0] !== '--dist')) throw new Error('Use --dist <directory> to inspect built output');
const markers = /xufana|glkuzi|dsba_nlp|week09_RAG|830 posts|830 постов|golden set of 20|golden set из 20|0\.456[\s\S]{0,120}0\.613/i;

for (const id of ids) for (const folder of ['notes', 'notes-ru']) {
  const source = readFileSync(path.join(root, 'src/content', folder, `${id}.mdx`), 'utf8');
  assert.match(source, /^status: needs-review$/m, `${folder}/${id}: publication hold was removed`);
  const body = source.split(/^---$/m).slice(2).join('---').trim();
  assert.ok(body.length < 200, `${folder}/${id}: withheld source body has returned`);
}

for (const folder of ['notes', 'notes-ru']) {
  const base = path.join(root, 'src/content', folder, 'nlp');
  for (const name of readdirSync(base).filter((name) => name.endsWith('.mdx'))) {
    const source = readFileSync(path.join(base, name), 'utf8');
    if (/^status: published$/m.test(source)) assert.doesNotMatch(source, markers, `${folder}/nlp/${name}: withdrawn source fingerprint`);
  }
}

if (args[0] === '--dist') {
  const dist = path.resolve(args[1]);
  for (const id of ids) for (const prefix of ['', 'ru']) {
    assert.ok(!existsSync(path.join(dist, prefix, 'notes', id, 'index.html')), `${prefix}/${id}: withdrawn route was built`);
  }
  const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
  for (const file of walk(dist).filter((file) => file.endsWith('.html'))) {
    const html = readFileSync(file, 'utf8');
    if (file.includes(`${path.sep}notes${path.sep}nlp${path.sep}`)) assert.doesNotMatch(html, markers, `${file}: withdrawn source fingerprint`);
    for (const [, target] of html.matchAll(/href="(?:https:\/\/fpakhurov\.com)?(?:\/ru)?\/notes\/([^"?#]+)(?:[?#][^"]*)?"/g)) {
      assert.ok(!ids.includes(target.replace(/\/$/, '')), `${file}: link to withdrawn note ${target}`);
    }
  }
}
console.log(`Publication holds verified for ${ids.length} notes in both locales${args.length ? ', including built routes and links' : ''}.`);
