// Original bounded content checker. Run from the FP repository root.
// Optional first argument selects an outside-served draft root.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
const require = createRequire(path.resolve(process.cwd(), 'package.json'));
const {compile} = await import(require.resolve('@mdx-js/mdx'));
const {default: remarkMath} = await import(require.resolve('remark-math'));
const {default: rehypeKatex} = await import(require.resolve('rehype-katex'));
const {rehypeHeadingIds} = await import(require.resolve('@astrojs/markdown-remark'));
const root = path.resolve(process.argv[2] || '.');
const helperPath = 'src/plugins/remark-heading-ids.mjs';
if (!fs.readFileSync(path.resolve(helperPath)).equals(fs.readFileSync(path.join(root, helperPath)))) {
  throw new Error('The runtime heading helper differs from the reviewed candidate bytes');
}
const {default: remarkHeadingIds} = await import(pathToFileURL(path.resolve(helperPath)));
const expected = {
  "cnn-text-classification": [
    "from-a-sequence-of-vectors-to-one-vector",
    "batching-variable-length-sequences",
    "one-dimensional-convolution-over-time",
    "max-pooling-over-time",
    "two-architectures",
    "results-on-ag-news",
    "trainable-embeddings",
    "seeing-what-the-classifier-uses",
    "what-changed",
    "limitations",
    "what-you-should-remember",
    "notebook",
    "next",
    "references"
  ],
  "recurrent-networks": [
    "the-recurrence",
    "worked-example",
    "step-by-step",
    "two-ways-to-use-the-states",
    "rnn-as-a-classifier",
    "rnn-as-a-language-model",
    "gradients-through-time",
    "what-changed",
    "limitations",
    "what-you-should-remember",
    "notebook",
    "next",
    "references"
  ],
  "lstm-and-gru": [
    "baseline-one-state-overwritten-every-step",
    "lstm",
    "worked-example",
    "step-by-step",
    "why-the-gradient-survives",
    "cost",
    "gru",
    "reading-in-both-directions",
    "what-changed",
    "limitations",
    "what-you-should-remember",
    "notebook",
    "next",
    "references"
  ],
  "seq2seq": [
    "the-task-and-its-data",
    "baseline-encoderdecoder-with-a-context-vector",
    "bleu-measuring-a-translation",
    "result",
    "why-one-vector-is-not-enough",
    "what-changed",
    "limitations",
    "what-you-should-remember",
    "notebook",
    "next",
    "references"
  ],
  "attention-before-transformers": [
    "baseline-the-final-state-as-the-only-channel",
    "the-mechanism",
    "worked-example",
    "scoring-functions",
    "evidence-removing-the-bottleneck-from-a-transformer",
    "what-attention-gives",
    "what-changed",
    "limitations",
    "what-you-should-remember",
    "notebook",
    "next",
    "references"
  ]
};
const output = {};
const fixture = path.join(root, 'scripts/notes/nlp-sequence-cases.py');
const saved = fs.readFileSync(path.join(root, 'docs/reports/2026-11-13-licensed-source-renewal/nlp-sequence-results.json'));
const replay = spawnSync('python3', ['-B', fixture], {maxBuffer: 1024*1024});
if (replay.status !== 0) throw new Error('Fixture failed: '+replay.stderr);
if (!replay.stdout.equals(saved)) throw new Error('Saved stdout differs: use the recorded interpreter or review last-digit differences explicitly');
const version = spawnSync('python3', ['--version'], {encoding:'utf8'}).stdout.trim();
let inlineBlocks = 0;
const mathSpans = text => text.match(/\$\$[\s\S]*?\$\$|(?<!\\)\$(?!\$)[^\n$]*?(?<!\\)\$/g) || [];
for (const [slug, oldIds] of Object.entries(expected)) {
  const pair = {};
  for (const [locale, folder] of [['en', 'notes'], ['ru', 'notes-ru']]) {
    const name = `src/content/${folder}/nlp/${slug}.mdx`;
    const source = fs.readFileSync(path.join(root, name), 'utf8').replace(/^---\n[\s\S]*?\n---\n/, '');
    if (/^import |<Figure|<img|!\[/m.test(source.replace(/(?:~~~|```)[\s\S]*?(?:~~~|```)/g, ''))) throw new Error(`${name}: unexpected asset dependency`);
    const blocks = [...source.matchAll(/(?:~~~|```)python\n([\s\S]*?)(?:~~~|```)/g)].map(m=>m[1]);
    for (const block of blocks) {
      const run = spawnSync('python3', ['-B','-c',block], {encoding:'utf8',maxBuffer:64*1024});
      if (run.status !== 0) throw new Error(`${name}: inline Python failed: ${run.stderr}`);
      if (run.stdout.trim() !== '[0.462117, 0.360335, -0.083604]') throw new Error(`${name}: inline stdout drift`);
      inlineBlocks++;
    }
    const ids = [];
    const collect = () => tree => {
      const walk = node => {
        if (/^h[1-6]$/.test(node.tagName || '')) ids.push(node.properties?.id);
        for (const child of node.children || []) walk(child);
      };
      walk(tree);
    };
    const result = await compile(source, {
      remarkPlugins: [remarkMath, remarkHeadingIds],
      rehypePlugins: [[rehypeKatex, {throwOnError: true, strict: 'error'}], rehypeHeadingIds, collect],
    });
    if (result.messages.length) throw new Error(`${name}: ${result.messages}`);
    if (new Set(ids).size !== ids.length) throw new Error(`${name}: duplicate heading`);
    if (oldIds.some(id => !ids.includes(id))) throw new Error(`${name}: missing curriculum anchor`);
    pair[locale] = {ids, math: mathSpans(source), code: blocks};
  }
  if (JSON.stringify(pair.en) !== JSON.stringify(pair.ru)) throw new Error(`${slug}: locale heading/math drift`);
  output[slug] = {ids: pair.en.ids, headingCount: pair.en.ids.length, identicalMathSpans: pair.en.math.length, strictMdxKatex: 'passed'};
}
output._execution = {python:version, fixtureStdoutSha256:crypto.createHash('sha256').update(saved).digest('hex'), freshStdoutReplay:'byte-identical', inlinePythonBlocks:inlineBlocks, assets:'No imported figures, images, datasets, models or notebooks'};
console.log(JSON.stringify(output, null, 2));
