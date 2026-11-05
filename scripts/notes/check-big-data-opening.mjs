import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  balancedGB,
  bytesPerGB,
  bytesPerRow,
  compactGB,
  cpuSeconds,
  deadline,
  diskGBps,
  fasterDiskGBps,
  inputGB,
  linkGBps,
  linkGbitPerSecond,
  partialsKB,
  readSeconds,
  rows,
  rowsPerSecond,
  skewedGB,
  stores,
  subtotalBytes,
  transferSeconds,
  workers,
} from '../../src/components/figures/big-data-beyond-one-machine/example.ts';

const sum = (values) => values.reduce((a, b) => a + b, 0);
assert.equal(rows * bytesPerRow, inputGB * bytesPerGB);
assert.equal(inputGB, 600);
assert.equal(compactGB, 150);
assert.equal(cpuSeconds * rowsPerSecond, rows);
assert.equal(cpuSeconds, 200);
assert.equal(deadline, 180);
assert.equal(readSeconds(inputGB), 600);
assert.equal(readSeconds(compactGB), 150);
assert.equal(Math.max(readSeconds(compactGB), cpuSeconds), 200);
assert.equal(readSeconds(inputGB, fasterDiskGBps), 300);
assert.equal(3600 / readSeconds(inputGB, diskGBps), 6);
assert.equal(60 / 5, 12);
assert.equal(balancedGB.length, workers);
assert.equal(skewedGB.length, workers);
assert.equal(sum(balancedGB), inputGB);
assert.equal(sum(skewedGB), inputGB);
assert.equal(readSeconds(Math.max(...balancedGB)), 150);
assert.equal(readSeconds(Math.max(...skewedGB)), 240);
assert.equal(readSeconds(workers * inputGB, workers * diskGBps), 600);
assert.equal(linkGbitPerSecond / 8, linkGBps);
assert.equal(linkGBps, 1.25);
assert.equal(transferSeconds, 480);
assert.equal(workers * stores * subtotalBytes, partialsKB * 1000);
assert.equal(partialsKB, 32);

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const en = read('../../src/content/notes/big-data/beyond-one-machine.mdx');
const ru = read('../../src/content/notes-ru/big-data/beyond-one-machine.mdx');
const extract = (text, pattern) => Array.from(text.matchAll(pattern), (match) => match[1] ?? match[2]);
const figures = (text) => extract(text, /^<(\w+) \/>$/gm);
const query = (text) => extract(text, /```sql\n([\s\S]*?)\n```/g);
const math = (text) => extract(text, /\$\$([\s\S]*?)\$\$|\$([^$\n]+)\$/g);
const links = (text) => extract(text, /\]\((https:\/\/[^)]+)\)/g);

assert.deepEqual(figures(en), ['ResourceFloors', 'PartitionFloors', 'NetworkTraffic']);
assert.deepEqual(figures(ru), figures(en));
assert.equal(query(en).length, 1);
assert.deepEqual(query(ru), query(en));
assert.deepEqual(math(ru), math(en));
assert.equal(links(en).length, 5);
assert.deepEqual(links(ru), links(en));
for (const [note, prefix] of [[en, ''], [ru, '/ru']]) {
  assert.ok(note.includes('(' + prefix + '/notes/databases#section-4)'));
  assert.ok(note.includes('(' + prefix + '/notes/big-data#section-1)'));
  assert.doesNotMatch(note, /\/big-data\/partial-failures/);
}
assert.match(ru, /^## Литература \\\{#references\\\}$/m);

const ids = figures(en).map((figure) => {
  const astro = read('../../src/components/figures/big-data-beyond-one-machine/' + figure + '.astro');
  assert.match(astro, /<svg class="fig-compact" viewBox="0 0 380 \d+" role="img" aria-labelledby=/);
  assert.match(astro, /<title id=/);
  assert.match(astro, /<desc id=/);
  const [id] = extract(astro, /^const id = '([^']+)'/gm);
  assert.ok(id);
  return id;
});
assert.equal(new Set(ids).size, ids.length);

console.log('Big Data opening: resource bounds, bilingual parity and figure structure passed.');
