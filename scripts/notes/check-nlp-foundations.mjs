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
const {default: remarkHeadingIds} = await import(pathToFileURL(path.resolve('src/plugins/remark-heading-ids.mjs')));
const root = path.resolve(process.argv[2] || '.');
const expected = {
  "natural-language-processing": [
    "the-problem-from-text-to-decisions-and-back",
    "what-nlp-is-for",
    "one-objective-under-most-of-it",
    "why-language-is-hard-for-a-computer",
    "worked-example-the-vocabulary-of-ag-news",
    "why-learn-the-methods-when-a-chat-model-exists",
    "the-plan-of-the-course",
    "what-you-should-remember",
    "next",
    "references"
  ],
  "text-as-data": [
    "what-a-string-is",
    "segmentation-cutting-the-string-into-units",
    "cleaning-trading-information-for-a-smaller-vocabulary",
    "worked-example",
    "why-preprocessing-depends-on-the-task",
    "limitations",
    "what-you-should-remember",
    "notebook",
    "next",
    "references"
  ],
  "tokenization": [
    "baseline-words-or-characters",
    "byte-pair-encoding",
    "worked-example",
    "why-the-most-frequent-pair",
    "encoding-new-text",
    "what-the-merge-count-controls",
    "wordpiece-and-sentencepiece",
    "special-tokens-padding-and-masks",
    "what-changed",
    "limitations",
    "what-you-should-remember",
    "notebook",
    "next",
    "references"
  ],
  "corpora-and-evaluation": [
    "three-splits-and-what-each-is-for",
    "leakage-when-the-split-is-not-a-split",
    "accuracy-and-when-it-lies",
    "precision-recall-and-f1",
    "worked-example",
    "spans-rather-than-tokens",
    "intrinsic-and-downstream-evaluation",
    "pitfalls-that-survive-a-correct-split",
    "limitations",
    "what-you-should-remember",
    "notebook",
    "next",
    "references"
  ],
  "bag-of-words-and-tf-idf": [
    "baseline-counting-tokens",
    "a-linear-classifier-on-counts",
    "worked-example",
    "where-raw-counts-fail",
    "tf-idf-reweighting-the-counts",
    "worked-example-continued",
    "results-on-ag-news",
    "when-a-linear-model-on-tf-idf-is-the-right-choice",
    "what-changed",
    "limitations",
    "what-you-should-remember",
    "notebook",
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
  output[slug] = {headingCount: pair.en.ids.length, identicalMathSpans: pair.en.math.length, strictMdxKatex: 'passed'};
}
console.log(JSON.stringify(output, null, 2));
