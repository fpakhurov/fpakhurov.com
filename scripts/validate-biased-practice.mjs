import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { publishedNoteIds } from './lib/biased-practice-source.mjs';
import { practiceContentLabel, practiceHref, sourceNoteId, validatePracticeCatalog } from '../src/utils/biasedPracticeLinks.mjs';

const args = process.argv.slice(2);
if (args.length && (args.length !== 2 || args[0] !== '--dist')) throw new Error('Usage: npm run practice:check -- [--dist dist]');
const root = fileURLToPath(new URL('../', import.meta.url));
const catalog = JSON.parse(readFileSync(path.join(root, 'src/data/biasedPractice.json'), 'utf8'));
const published = publishedNoteIds(root);
const stats = validatePracticeCatalog(catalog, published);

// These cases exercise the public URL contract, including strict source identity and bounded labels.
assert.equal(sourceNoteId('https://fpakhurov.com/ru/notes/python/functions/#example'), 'python/functions');
assert.throws(() => sourceNoteId('https://example.com/notes/python/functions'));
assert.throws(() => sourceNoteId('https://fpakhurov.com/notes/python/functions?token=private'));
assert.equal(practiceContentLabel('python/functions'), 'python--functions');
const longId = `generative-models/${'long-topic-'.repeat(8)}alpha`;
const longLabel = practiceContentLabel(longId);
assert.equal(longLabel.length, 64);
assert.match(longLabel, /^[a-z0-9][a-z0-9_-]{0,63}$/);
assert.notEqual(longLabel, practiceContentLabel(longId.replace(/alpha$/, 'beta')));
assert.equal(longLabel, practiceContentLabel(longId));
const example = catalog.notes['python/functions'][0];
assert.throws(() => practiceHref('python/function', example, 'en'));
const exampleUrl = new URL(practiceHref('python/functions', example, 'ru'));
assert.equal(exampleUrl.pathname, '/learn/python/functions');
assert.equal(exampleUrl.hash, '#check-yourself');
assert.deepEqual(Object.fromEntries(exampleUrl.searchParams), {
  lang: 'ru', mode: 'deep', utm_source: 'fpakhurov_com', utm_medium: 'referral',
  utm_campaign: 'course_practice', utm_content: 'python--functions', utm_term: 'python',
});

if (args[0] === '--dist') {
  const dist = path.resolve(args[1]);
  let renderedActions = 0;
  for (const noteId of published) for (const lang of ['en', 'ru']) {
    const file = path.join(dist, lang === 'ru' ? 'ru' : '', 'notes', noteId, 'index.html');
    const html = readFileSync(file, 'utf8');
    const blocks = [...html.matchAll(/<aside\b[^>]*\bdata-biased-practice="([^"]+)"[^>]*>([\s\S]*?)<\/aside>/g)];
    const targets = catalog.notes[noteId] ?? [];
    assert.equal(blocks.length, targets.length ? 1 : 0, `${lang}/${noteId}: unexpected practice invitation`);
    if (!targets.length) continue;
    const block = blocks[0];
    assert.equal(block[1], noteId);
    assert.ok(block.index > html.indexOf('class="prose"'), `${lang}/${noteId}: practice must follow the article`);
    assert.ok(block.index < html.indexOf('class="note-pagination"'), `${lang}/${noteId}: practice must precede pagination`);
    const hrefs = [...block[2].matchAll(/href="([^"]+)"/g)].map((match) => match[1].replaceAll('&amp;', '&'));
    assert.deepEqual(hrefs, targets.map((target) => practiceHref(noteId, target, lang)), `${lang}/${noteId}: wrong practice targets`);
    for (const target of targets) {
      const fragment = new URL(target.sourceNote).hash.slice(1);
      if (fragment) assert.ok(html.includes(`id="${fragment}"`), `${lang}/${noteId}: source fragment is absent: ${fragment}`);
    }
    renderedActions += hrefs.length;
  }
  console.log(`Rendered practice invitations checked on ${published.size * 2} bilingual note pages; ${renderedActions} exact action links.`);
}
console.log(`Public BIASED practice mapping valid: ${JSON.stringify(stats)}`);
