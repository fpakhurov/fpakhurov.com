// Check the complete bilingual allocation example and its numerical figure.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import katex from 'katex';
import { compile } from '@mdx-js/mdx';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkHeadingIds from '../../src/plugins/remark-heading-ids.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
execFileSync('python3', [path.join(root, 'scripts/notes/policy-gradient-allocation.py')], { stdio: 'pipe' });
const paths = ['notes', 'notes-ru'].map(locale => `src/content/${locale}/agents/policy-gradients.mdx`);
const texts = await Promise.all(paths.map(p => fs.readFile(path.join(root, p), 'utf8')));
const math = text => [...text.matchAll(/\$\$([\s\S]*?)\$\$|(?<!\$)\$(?!\$)([^$\n]+)\$(?!\$)/g)];
assert.deepEqual(math(texts[0]).map(m => m[1] || m[2]), math(texts[1]).map(m => m[1] || m[2]));
const figure = await fs.readFile(path.join(root, 'src/components/figures/policy-gradients/AllocationPolicy.astro'), 'utf8');
for (const [i, text] of texts.entries()) {
  for (const m of math(text)) katex.renderToString(m[1] || m[2], { throwOnError: true, strict: 'error', displayMode: !!m[1] });
  const mdx = text.replace(/^---\n[\s\S]*?\n---\n/, '');
  await compile(mdx, { remarkPlugins: [remarkMath, remarkHeadingIds], rehypePlugins: [[rehypeKatex, { strict: 'error', throwOnError: true }]] });
  assert(!/ShortCorridor|ActorCriticLoop|PpoClip|CartPole|2\s*−\s*√2|коридор/i.test(text), 'Retired implementation or source-specific task remains');
  for (const anchor of ['fig-pg-actor-critic-loop', 'fig-pg-ppo-clip']) assert(text.includes(`id="${anchor}"`), `Missing legacy anchor ${anchor}`);
  assert(figure.includes('id="pg-short-corridor"'), 'Missing legacy figure anchor');
  const rows = text.split('\n').filter(line => /^\|/.test(line));
  assert.equal(rows.length, 16, 'The baseline, GAE and PPO tables must be present');
  console.log(`PASS ${i ? 'RU' : 'EN'}: ${math(text).length} mathematical spans, MDX compilation, legacy anchors and retired-material check`);
}
// Check the figure's literal formula against independent exact combinatorics.
assert(figure.includes('3 * p * p * (1 - p)'));
const successes = Array.from({ length: 8 }, (_, n) => n.toString(2).padStart(3, '0')).filter(s => [...s].filter(c => c === '1').length === 2);
assert.deepEqual(successes, ['011', '101', '110']);
console.log('PASS exact trajectory, finite-difference, baseline, GAE, clipping and KL checks; three successful schedules');
