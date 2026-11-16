// Original bounded checker. Run from the FP repository root.
// Optional first argument selects an outside-served draft package.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';

const require = createRequire(path.resolve(process.cwd(), 'package.json'));
const {compile} = await import(require.resolve('@mdx-js/mdx'));
const {default: remarkMath} = await import(require.resolve('remark-math'));
const {default: remarkGfm} = await import(require.resolve('remark-gfm'));
const {default: rehypeKatex} = await import(require.resolve('rehype-katex'));
const {rehypeHeadingIds} = await import(require.resolve('@astrojs/markdown-remark'));
const root = path.resolve(process.argv[2] || '.');
const reportDir = 'docs/reports/2026-11-14-nlp-transformer-foundations';
const helper = 'src/plugins/remark-heading-ids.mjs';
if (!fs.readFileSync(path.resolve(helper)).equals(fs.readFileSync(path.join(root, helper)))) {
  throw new Error('Runtime heading helper differs from reviewed candidate bytes');
}
const {default: remarkHeadingIds} = await import(pathToFileURL(path.resolve(helper)));
const anchors = JSON.parse(fs.readFileSync(path.join(root, reportDir, 'curriculum-anchors.json'))).topics;
const saved = fs.readFileSync(path.join(root, reportDir, 'results.json'));
const replay = spawnSync('python3', ['-B', path.join(root, 'scripts/notes/nlp-transformer-foundations-cases.py')], {maxBuffer:1024*1024});
if (replay.status !== 0) throw new Error('Fixture failed: ' + replay.stderr);
if (!replay.stdout.equals(saved)) throw new Error('Saved stdout differs. Use recorded Python or review floating-point differences explicitly.');
const version = spawnSync('python3', ['--version'], {encoding:'utf8'}).stdout.trim();
const mathSpans = text => text.match(/\$\$[\s\S]*?\$\$|(?<!\\)\$(?!\$)[^\n$]*?(?<!\\)\$/g) || [];
const output = {};
const texts = {};
for (const [slug, expected] of Object.entries(anchors)) {
  const pair = {};
  for (const [locale, folder] of [['en','notes'],['ru','notes-ru']]) {
    const name = `src/content/${folder}/nlp/${slug}.mdx`;
    const full = fs.readFileSync(path.join(root, name), 'utf8');
    const source = full.replace(/^---\n[\s\S]*?\n---\n/, '');
    texts[locale+'/'+slug] = source;
    if (/^import |<Figure|<img|!\[/m.test(source)) throw new Error(`${name}: unexpected asset dependency`);
    if (/^\s*\$\$[^\n]|[^\n]\$\$\s*$/m.test(source)) throw new Error(`${name}: display delimiter must be on its own line`);
    const ids = [];
    let tables=0, parsedMath=0, displays=0;
    const inspectMath = () => tree => {
      const walk = node => {
        if (node.type === 'math' || node.type === 'inlineMath') {
          parsedMath++;
          if (node.type === 'math') displays++;
          if (node.value.includes('\n\n')) throw new Error(`${name}: blank paragraph absorbed into math`);
        }
        for (const child of node.children || []) walk(child);
      };
      walk(tree);
    };
    const inspectHeadings = () => tree => {
      const walk = node => {
        if (/^h[1-6]$/.test(node.tagName || '')) ids.push(node.properties?.id);
        if (node.tagName === 'table') tables++;
        for (const child of node.children || []) walk(child);
      };
      walk(tree);
    };
    const result = await compile(source, {
      remarkPlugins:[remarkGfm,remarkMath,remarkHeadingIds,inspectMath],
      rehypePlugins:[[rehypeKatex,{throwOnError:true,strict:'error'}],rehypeHeadingIds,inspectHeadings],
    });
    if (result.messages.length) throw new Error(`${name}: ${result.messages}`);
    if (new Set(ids).size !== ids.length) throw new Error(`${name}: duplicate heading ID`);
    if (JSON.stringify(ids)!==JSON.stringify(expected)) throw new Error(`${name}: curriculum anchors/order drift`);
    const math = mathSpans(source);
    if (parsedMath !== math.length) throw new Error(`${name}: parsed/source math count differs`);
    pair[locale] = {ids,math,parsedMath,displays,tables};
  }
  if (JSON.stringify(pair.en)!==JSON.stringify(pair.ru)) throw new Error(`${slug}: bilingual heading/math/table drift`);
  output[slug] = {headingCount:pair.en.ids.length,identicalMathSpans:pair.en.parsedMath,displayFormulas:pair.en.displays,tablesPerLocale:pair.en.tables,strictMdxKatex:'passed'};
}
// Check local and batch-crossing anchors without claiming a full-site link check.
let checkedAnchors=0;
for (const [key,source] of Object.entries(texts)) {
  const [locale,slug] = key.split('/');
  for (const match of source.matchAll(/\]\(([^)]+)\)/g)) {
    const target = match[1];
    let other=slug, fragment;
    if (target.startsWith('#')) fragment=target.slice(1);
    else {
      const link=target.match(/^\/(?:ru\/)?notes\/nlp\/([^/#]+)#(.+)$/);
      if (!link || !anchors[link[1]]) continue;
      other=link[1]; fragment=link[2];
    }
    if (!anchors[other].includes(fragment)) throw new Error(`${key}: missing scoped anchor ${target}`);
    checkedAnchors++;
  }
}
output._execution={python:version,fixtureStdoutSha256:crypto.createHash('sha256').update(saved).digest('hex'),freshStdoutReplay:'byte-identical',checkedScopedAnchorLinks:checkedAnchors,assets:'Original text/tables/math and stdlib script; no imported figure, dataset, model or notebook'};
console.log(JSON.stringify(output,null,2));
