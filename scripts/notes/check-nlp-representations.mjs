// Original bounded content checker. Run from the FP repository root.
// Optional first argument selects an outside-served draft root.
import fs from 'node:fs';
import path from 'node:path';
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
  "n-gram-language-models": [
    "from-a-joint-probability-to-a-product-of-conditionals",
    "baseline-estimate-the-conditionals-by-counting",
    "worked-example",
    "generation",
    "perplexity-from-probability-to-a-number",
    "when-two-perplexities-can-be-compared",
    "unseen-n-grams-make-perplexity-explode",
    "smoothing",
    "what-changed",
    "limitations",
    "what-you-should-remember",
    "notebook",
    "next",
    "references"
  ],
  "word-embeddings": [
    "baseline-one-hot-vectors",
    "four-attempts",
    "the-embedding-table",
    "reading-a-vector-space",
    "worked-example",
    "intrinsic-and-extrinsic-evaluation",
    "from-words-to-sentences-for-now",
    "limitations",
    "what-you-should-remember",
    "notebook",
    "next",
    "references"
  ],
  "word2vec": [
    "baseline-fit-the-embeddings-with-a-labelled-task",
    "a-network-whose-first-layer-is-the-table",
    "two-prediction-tasks-cbow-and-skip-gram",
    "why-both-tasks-give-useful-vectors",
    "why-the-softmax-is-the-problem",
    "negative-sampling",
    "worked-example",
    "which-words-are-negatives",
    "subsampling-frequent-words",
    "what-negative-sampling-optimizes",
    "what-a-small-model-learns-from-quora-questions",
    "hyperparameters-and-what-they-do",
    "what-changed",
    "glove-and-fasttext",
    "limitations",
    "what-you-should-remember",
    "notebook",
    "next",
    "references"
  ],
  "glove": [
    "baseline-factorize-the-count-matrix",
    "ratios-carry-the-meaning",
    "from-ratios-to-a-model",
    "weighted-least-squares",
    "a-run-on-quora-questions",
    "glove-and-skip-gram",
    "what-changed",
    "limitations",
    "what-you-should-remember",
    "notebook",
    "code",
    "next",
    "references"
  ],
  "fasttext": [
    "baseline-one-vector-per-word-type",
    "a-word-is-a-bag-of-character-n-grams",
    "hashing",
    "vectors-for-unseen-words",
    "what-subwords-do-to-neighbours",
    "fasttext-as-a-classifier",
    "what-changed",
    "limitations",
    "what-you-should-remember",
    "notebook",
    "code",
    "next",
    "references"
  ]
};
const output = {};
const mathSpans = text => text.match(/\$\$[\s\S]*?\$\$|(?<!\\)\$(?!\$)[^\n$]*?(?<!\\)\$/g) || [];
for (const [slug, oldIds] of Object.entries(expected)) {
  const pair = {};
  for (const [locale, folder] of [['en', 'notes'], ['ru', 'notes-ru']]) {
    const name = `src/content/${folder}/nlp/${slug}.mdx`;
    const source = fs.readFileSync(path.join(root, name), 'utf8').replace(/^---\n[\s\S]*?\n---\n/, '');
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
    pair[locale] = {ids, math: mathSpans(source)};
  }
  if (JSON.stringify(pair.en) !== JSON.stringify(pair.ru)) throw new Error(`${slug}: locale heading/math drift`);
  output[slug] = {ids: pair.en.ids, headingCount: pair.en.ids.length, identicalMathSpans: pair.en.math.length, strictMdxKatex: 'passed'};
}
console.log(JSON.stringify(output, null, 2));
