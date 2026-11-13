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
const scratch = await fs.mkdtemp(path.join(os.tmpdir(), 'probability-intro-figures-'));
execFileSync('python3', [path.join(root, 'scripts/notes/probability-intro-cases.py')], {stdio:'inherit'});
const resultBase='docs/reports/2026-11-13-licensed-example-renewal/';
const exact=JSON.parse(await fs.readFile(path.join(root,resultBase+'probability-intro-numerical-checks.json'),'utf8'));
const texts=await Promise.all(['notes','notes-ru'].map(locale=>fs.readFile(path.join(root,`src/content/${locale}/probability/what-probability-is.mdx`),'utf8')));
const math=text=>[...text.matchAll(/\$\$([\s\S]*?)\$\$|(?<!\$)\$(?!\$)([^$\n]+)\$(?!\$)/g)];
assert.deepEqual(math(texts[0]).map(m=>m[1]||m[2]),math(texts[1]).map(m=>m[1]||m[2]));
const expectedIds=['three-readings-of-a-probability','where-intuition-fails','what-the-course-builds','what-changed','limitations','what-you-should-remember','code','next','references'];
const script=await fs.readFile(path.join(root,'scripts/notes/probability-intro-cases.py'),'utf8');
const shared=script.split('# BEGIN NOTE CODE\n')[1].split('# END NOTE CODE')[0].trim();
const counts=[];
for(const [i,text] of texts.entries()) {
  assert(!/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(text));
  assert(!text.split('\n').some(line=>line.includes('$$')&&line.trim()!=='$$'),'Display delimiters need separate lines');
  for(const m of math(text)) katex.renderToString(m[1]||m[2],{throwOnError:true,strict:'error',displayMode:!!m[1]});
  const code=[...text.matchAll(/```python\n([\s\S]*?)```/g)];
  const outputs=[...text.matchAll(/```text\n([\s\S]*?)```/g)];
  assert.equal(code.length,1);assert.equal(outputs.length,1);assert.equal(code[0][1].trim(),shared);
  assert.equal(execFileSync('python3',['-c',code[0][1]],{encoding:'utf8'}),outputs[0][1]);
  let actualIds=[],parsedMath=0,parsedCode=0;
  const inspect=()=>tree=>{
    const walk=node=>{if(node.type==='heading')actualIds.push(node.data?.hProperties?.id);if(node.type==='math')parsedMath++;if(node.type==='code')parsedCode++;for(const child of node.children||[])walk(child)};
    walk(tree);
  };
  await compile(text.replace(/^---\n[\s\S]*?\n---\n/,''),{remarkPlugins:[remarkMath,remarkHeadingIds,inspect],rehypePlugins:[[rehypeKatex,{strict:'error',throwOnError:true}]]});
  assert.deepEqual(actualIds,expectedIds);assert.equal(parsedMath,math(text).filter(m=>m[1]).length);assert.equal(parsedCode,2);
  assert(!/Gigerenzer|Hoffrage|Charig|81 of 87|81 из 87|192 of 263|160 gynecologists|160 гинеколог|9\/98|0\.501|0\.53 heads|365\/365/.test(text));
  counts.push({locale:i?'ru':'en',mathSpans:math(text).length,displayMath:parsedMath,headingIds:actualIds,inlineReplay:'Exact stdout'});
}
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

const base=path.join(root,'src/components/figures/what-probability-is');
const cases=await import(pathToFileURL(await moduleFile(path.join(base,'cases.ts'))).href);
const {createHash}=await import('node:crypto');
assert.equal(cases.probability,3/8);assert.equal(cases.sampleSize,4096);
for(const [i,run] of cases.runs.entries()) {
  assert.equal(createHash('sha256').update(JSON.stringify(run)).digest('hex'),exact.bernoulli.paths[i].full_count_array_sha256);
  for(const [n,count] of Object.entries(exact.bernoulli.paths[i].counts))assert.equal(run[Number(n)-1],count);
  assert(run.every((value,index)=>value>=0&&value<=index+1&&(index===0||[0,1].includes(value-run[index-1]))));
}
for(const [i,mix] of cases.mixes.entries()) {
  assert.deepEqual(mix.jobs,exact.conditioning[i].jobs);assert.deepEqual(mix.long,exact.conditioning[i].long);
  mix.jobs.forEach((n,k)=>assert.equal(n*cases.rates[k],mix.long[k]));
}
const container=await AstroContainer.create();
const css=await fs.readFile(path.join(root,'src/styles/global.css'),'utf8');
for(const lang of ['en','ru']) {
  let html='';
  for(const name of ['RunningFrequency','BaseRateTree']) {
    const component=(await import(pathToFileURL(await moduleFile(path.join(base,name+'.astro'))).href)).default;
    html+=await container.renderToString(component,{request:new Request(`https://fpakhurov.com/${lang==='ru'?'ru/':''}notes/probability/what-probability-is`)});
  }
  assert.equal((html.match(/<svg /g)||[]).length,2);assert(!/NaN|undefined/.test(html));
  for(const id of ['fig-running-frequency','fig-base-rate-tree'])assert(html.includes(`id="${id}"`));
  const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size);
  await fs.writeFile(path.join(scratch,`${lang}.html`),`<!doctype html><html lang="${lang}"><meta charset="utf-8"><style>${css}\n${figureStyles.join('\n')}\nbody{margin:0;padding:16px}main{max-width:840px;margin:auto}</style><main class="prose">${html}</main></html>`);
}
const result={checks:counts,figures:2,renderedLocales:['en','ru'],numericalChecks:'Exact finite populations, exhaustive small collision cases and averaging distributions, independent uint32 replay vs all 12288 JavaScript cumulative counts',closure:[...cache.keys()].map(f=>path.relative(root,f)).sort()};
const output=path.join(root,resultBase+'probability-intro-figure-checks.json');
if(process.argv.includes('--write'))await fs.writeFile(output,JSON.stringify(result,null,2)+'\n');
else assert.deepEqual(result,JSON.parse(await fs.readFile(output,'utf8')));
console.log(`Probability introduction complete local checks passed: ${counts.map(x=>x.mathSpans).join('/')} math spans, 9 preserved headings, two exact inline replays, finite oracles and actual Astro render.`);
if(process.argv.includes('--render'))console.log(`Rendered figure previews: ${scratch}`);
else await fs.rm(scratch,{recursive:true,force:true});
