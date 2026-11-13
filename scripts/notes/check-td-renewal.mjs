// Original scoped verification authored for this project with Codex assistance.
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { transform } from '@astrojs/compiler-rs';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import ts from 'typescript';
import katex from 'katex';
import { compile } from '@mdx-js/mdx';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkHeadingIds from '../../src/plugins/remark-heading-ids.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const scratch = await fs.mkdtemp(path.join(os.tmpdir(), 'td-figures-'));
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-10, `${a} != ${b}`);
const fraction = s => s.includes('/') ? s.split('/').map(Number).reduce((a,b)=>a/b) : Number(s);
execFileSync('python3', [path.join(root, 'scripts/notes/td-renewal-cases.py')], { stdio: 'inherit' });
const resultPath = 'docs/reports/2026-11-13-licensed-example-renewal/td-numerical-checks.json';
const exact = JSON.parse(await fs.readFile(path.join(root, resultPath), 'utf8'));
const texts = await Promise.all(['notes', 'notes-ru'].map(locale => fs.readFile(path.join(root, `src/content/${locale}/agents/temporal-difference-learning.mdx`), 'utf8')));
const math = text => [...text.matchAll(/\$\$([\s\S]*?)\$\$|(?<!\$)\$(?!\$)([^$\n]+)\$(?!\$)/g)];
assert.deepEqual(math(texts[0]).map(m=>m[1]||m[2]), math(texts[1]).map(m=>m[1]||m[2]));
const expectedIds = ['baseline-value-iteration-needs-the-model', 'exploration-first-the-multi-armed-bandit', 'monte-carlo-prediction', 'td0-learning-a-guess-from-a-guess', 'which-target-is-better-bias-against-variance', 'from-prediction-to-control-sarsa-and-q-learning', 'cliff-walking-what-on-policy-and-off-policy-learn', 'when-the-estimates-converge', 'between-one-step-and-the-whole-episode-n-step-returns-and-eligibility-traces', 'what-changed', 'limitations', 'what-you-should-remember', 'code', 'next', 'references'];
const script = await fs.readFile(path.join(root, 'scripts/notes/td-renewal-cases.py'), 'utf8');
const shared = script.split('# BEGIN NOTE CODE\n')[1].split('# END NOTE CODE')[0].trim();
const counts = [];
for (const [i, text] of texts.entries()) {
  console.log('Checking locale', i);
  assert(!/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(text));
  assert(!text.split('\n').some(line => line.includes('$$') && line.trim() !== '$$'), 'Display delimiters must occupy their own lines');
  for (const m of math(text)) katex.renderToString(m[1]||m[2], { throwOnError: true, strict: 'error', displayMode: !!m[1] });
  const code = [...text.matchAll(/```python\n([\s\S]*?)```/g)];
  const output = [...text.matchAll(/```text\n([\s\S]*?)```/g)];
  assert.equal(code.length, 1); assert.equal(output.length, 1);
  assert(code[0][1].includes(shared));
  assert.equal(execFileSync('python3', ['-c', code[0][1]], { encoding: 'utf8' }), output[0][1]);
  let actualIds = [], parsedMath = 0, parsedCode = 0;
  const inspect = () => tree => {
    const walk = node => {
      if(node.type === 'heading') actualIds.push(node.data?.hProperties?.id);
      if(node.type === 'math') parsedMath += 1;
      if(node.type === 'code') parsedCode += 1;
      for(const child of node.children || []) walk(child);
    };
    walk(tree);
  };
  console.log('Compiling MDX', i);
  await compile(text.replace(/^---\n[\s\S]*?\n---\n/, ''), { remarkPlugins: [remarkMath, remarkHeadingIds, inspect], rehypePlugins: [[rehypeKatex, { strict: 'error', throwOnError: true }]] });
  assert.deepEqual(actualIds, expectedIds);
  assert.equal(parsedMath, math(text).filter(m=>m[1]).length, 'Markdown must recognize each display expression');
  assert.equal(parsedCode, 2);
  const withoutLegacyAnchors = text.replace(/id="fig-td-[^"]+"/g,'').replace(/\\\{#[^}]+\\\}/g,'');
  assert(!/10-armed|10-рук|десятирук|2000 random bandits|RandomWalkRms|CliffWalking|BanditCurves|TdBackup|4.rows.and.12|4 ряда|1\/6, 2\/6|eight episodes|восемь эпизодов|0\.035|45\.8/.test(withoutLegacyAnchors), 'Retired experiment remains');
  counts.push({locale:i?'ru':'en',mathSpans:math(text).length,displayMath:parsedMath,headings:actualIds.length,inlineReplay:'Exact stdout'});
}
assert.equal(texts[0].split('```python\n')[1].split('```')[0], texts[1].split('```python\n')[1].split('```')[0]);
const cache = new Map();
const figureStyles = [];
async function moduleFile(file) {
  if(cache.has(file)) return cache.get(file);
  const target = path.join(scratch, `${cache.size}.mjs`); cache.set(file, target);
  let code = await fs.readFile(file, 'utf8');
  if(file.endsWith('.astro')) {
    const compiled = transform(code, { filename:file, internalURL:'astro/compiler-runtime', resultScopedSlot:true });
    assert(!compiled.diagnostics.some(d=>d.severity==='error'));
    figureStyles.push(...compiled.css);
    code = compiled.code.replace(/createMetadata as \$\$createMetadata,?/g,'').replace(/export const \$\$metadata = [\s\S]*?\n(?=const \$\$Astro)/,'')
      .replace(/^import\s+['"][^'"]+\?astro&type=style[^'"]*['"];?\s*$/gm,'');
  }
  for(const match of [...code.matchAll(/from\s+(['"])([^'"]+)\1/g)]) {
    let url;
    if(match[2].startsWith('.')) {
      let file2=path.resolve(path.dirname(file),match[2]); if(!path.extname(file2)) file2+='.ts';
      url=pathToFileURL(await moduleFile(file2)).href;
    } else url=import.meta.resolve(match[2]);
    code=code.replaceAll(`${match[1]}${match[2]}${match[1]}`,JSON.stringify(url));
  }
  await fs.writeFile(target, ts.transpileModule(code,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText);
  return target;
}
const base = path.join(root,'src/components/figures/temporal-difference-learning');
const cases = await import(pathToFileURL(await moduleFile(path.join(base,'cases.ts'))).href);
for(const [i,name] of ['mc','exact_td','wrong_td'].entries()) {
  near(cases.prediction[i].mean,fraction(exact.prediction[name][0]));
  near(cases.prediction[i].variance,fraction(exact.prediction[name][1]));
}
for(const item of exact.control) for(const policy of item.all_policies) {
  const values=cases.policyValues(policy.skeleton,fraction(item.epsilon));
  values.forEach((v,i)=>near(v,fraction(policy.values[i])));
}
const container=await AstroContainer.create();
const css=await fs.readFile(path.join(root,'src/styles/global.css'),'utf8');
for(const lang of ['en','ru']) {
  let html='';
  for(const name of ['TargetMoments','EnergyPolicy']) {
    const component=(await import(pathToFileURL(await moduleFile(path.join(base,name+'.astro'))).href)).default;
    html+=await container.renderToString(component,{request:new Request(`https://fpakhurov.com/${lang==='ru'?'ru/':''}notes/agents/temporal-difference-learning`)});
  }
  assert.equal((html.match(/<svg /g)||[]).length,2);
  assert(!/NaN|undefined/.test(html));
  for(const id of ['fig-td-random-walk-rms','fig-td-cliff-walking']) assert(html.includes(`id="${id}"`));
  const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(ids.length,new Set(ids).size);
  await fs.writeFile(path.join(scratch,`${lang}.html`),`<!doctype html><html lang="${lang}"><meta charset="utf-8"><style>${css}\n${figureStyles.join('\n')}\nbody{margin:0;padding:16px}main{max-width:840px;margin:auto}</style><main class="prose">${html}</main></html>`);
}
// Shared consumers keep their numerical helper API; all old experiment exports are gone.
const helpers=await import(pathToFileURL(await moduleFile(path.join(base,'td.ts'))).href);
assert.deepEqual(Object.keys(helpers).sort(),['bins','mean','rng','spread']);
assert.equal(helpers.mean([1,3,5]),3);
assert.deepEqual(helpers.bins([2,4,6,8],2),{xs:[1.5,3.5],ys:[3,7]});
assert.deepEqual(helpers.spread([4,2,3],3),[8,2,5]);
await moduleFile(path.join(base,'Curves.astro'));
const result={checks:counts,policyEvaluations:16,figures:2,renderedLocales:['en','ru'],numericalCheck:'Exact Fraction oracle vs all TypeScript policy solutions; target means and variances',helperExports:Object.keys(helpers).sort(),closure:[...cache.keys()].map(f=>path.relative(root,f)).sort()};
const outputPath=path.join(root,'docs/reports/2026-11-13-licensed-example-renewal/td-figure-checks.json');
if(process.argv.includes('--write')) await fs.writeFile(outputPath,JSON.stringify(result,null,2)+'\n');
else assert.deepEqual(result,JSON.parse(await fs.readFile(outputPath,'utf8')));
console.log(`TD complete local checks passed: ${counts.map(x=>x.mathSpans).join('/')} math spans, 15 anchors, two exact inline replays, 16 policy oracles and actual Astro render.`);
if(process.argv.includes('--render')) console.log(`Rendered figure previews: ${scratch}`);
else await fs.rm(scratch,{recursive:true,force:true});
