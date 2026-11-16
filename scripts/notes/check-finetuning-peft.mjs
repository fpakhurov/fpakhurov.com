// Original scoped checks with the existing first-party Astro rendering workflow.
// Run serially from the installed FP repository with this outside draft as the argument.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
const root=path.resolve(process.argv[2]);
const host=process.cwd();
assert.notEqual(root,host);
const require=createRequire(path.join(host,'package.json'));
const {compile}=await import(require.resolve('@mdx-js/mdx'));
const {default:remarkMath}=await import(require.resolve('remark-math'));
const {default:remarkGfm}=await import(require.resolve('remark-gfm'));
const {default:rehypeKatex}=await import(require.resolve('rehype-katex'));
const {rehypeHeadingIds}=await import(require.resolve('@astrojs/markdown-remark'));
const {transform}=await import(require.resolve('@astrojs/compiler-rs'));
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const helper='src/plugins/remark-heading-ids.mjs';
assert.equal(read(helper),fs.readFileSync(path.join(host,helper),'utf8'));
const {default:headingIds}=await import(pathToFileURL(path.join(host,helper)));
const metadata=JSON.parse(read('docs/reports/2026-11-16-nlp-renewal/finetuning-peft-curriculum.json'));
const report='docs/reports/2026-11-16-nlp-renewal/';
const topics={'fine-tuning':['UpdateComparison','CheckpointLoss'],'peft':['LowRankUpdate','RankAddition','StateBudget']};
const closure=new Set();
const held=new Set(JSON.parse(fs.readFileSync(path.join(host,'src/data/withdrawnNotes.json'),'utf8')));
for(const slug of Object.keys(topics))held.delete('nlp/'+slug);
const yaml=require('yaml');
function deps(p){if(closure.has(p))return;closure.add(p);if(p.endsWith('.json'))return;for(const m of read(p).matchAll(/(?:from|import)\s+['"]([^'"]+)['"]/g)){if(!m[1].startsWith('.'))continue;let d=path.normalize(path.join(path.dirname(p),m[1]));if(!path.extname(d))d+='.ts';deps(d);}}
const saved=read(report+'finetuning-peft-results.json');
assert.equal(execFileSync('python3',['-B',path.join(root,'scripts/notes/finetuning-peft-cases.py')],{encoding:'utf8'}),saved);
const data=JSON.parse(saved);
assert.deepEqual(JSON.parse(read('src/components/figures/nlp/fine-tuning/cases.json')),data.fine_tuning);
assert.deepEqual(JSON.parse(read('src/components/figures/nlp/peft/cases.json')),data.peft);
const output={topics:{},exactSavedReplay:true,deterministicAssertions:data.assertions,fixtureSha256:crypto.createHash('sha256').update(saved).digest('hex'),scope:'Strict MDX, bilingual math/IDs/code, exact stdlib replay, actual scoped Astro SVG rendering; no browser, full build, CI or publication claim'};
for(const [slug,names] of Object.entries(topics)){
 const pairs=[];
 for(const [locale,folder] of [['en','notes'],['ru','notes-ru']]){
  const full=read(`src/content/${folder}/nlp/${slug}.mdx`);
  const front=yaml.parse(full.match(/^---\n([\s\S]*?)\n---\n/)[1]);
  const old=metadata.topics[slug][locale].metadata;
  for(const key of ['title','course','section','order','status','tags','prerequisites'])assert.deepEqual(front[key],key==='tags'&&slug==='fine-tuning'?old[key].filter(t=>t!=='sst-2'):old[key]);
  const source=full.replace(/^---\n[\s\S]*?\n---\n/,'');
  assert(!source.includes('\\qquad'));assert(source.split('\n').every(l=>!l.includes('$$')||l.trim()==='$$'));
  const math=[...source.matchAll(/\$\$([\s\S]*?)\$\$|(?<!\$)\$(?!\$)([^$\n]+)\$(?!\$)/g)].map(m=>m[1]??m[2]);
  const snippets=[...source.matchAll(/```python\n([\s\S]*?)```/g)].map(m=>m[1]);
  const outputs=[...source.matchAll(/```text\n([\s\S]*?)```/g)].map(m=>m[1]);
  assert.equal(snippets.length,1);assert.equal(outputs.length,1);
  assert.equal(execFileSync('python3',['-B','-c',snippets[0]],{encoding:'utf8'}),outputs[0]);
  const ids=[];let parsed=0,displays=0,tables=0;
  const mathVisitor=()=>tree=>{function walk(n){if(['math','inlineMath'].includes(n.type)){parsed++;if(n.type==='math')displays++;assert(!n.value.includes('\n\n'));}for(const c of n.children||[])walk(c);}walk(tree);};
  const htmlVisitor=()=>tree=>{function walk(n){if(/^h[1-6]$/.test(n.tagName||''))ids.push(n.properties?.id);if(n.tagName==='table')tables++;for(const c of n.children||[])walk(c);}walk(tree);};
  const compiled=await compile(source,{remarkPlugins:[remarkGfm,remarkMath,headingIds,mathVisitor],rehypePlugins:[[rehypeKatex,{throwOnError:true,strict:'error'}],rehypeHeadingIds,htmlVisitor]});
  assert.equal(compiled.messages.length,0);assert.equal(parsed,math.length);assert.deepEqual(ids,metadata.topics[slug][locale].anchors);assert.equal(ids.length,new Set(ids).size);
  for(const match of source.matchAll(/\]\((\/[^)]+)\)/g)){
   const url=match[1].replace(/^\/ru/,'');assert(url.startsWith('/notes/'));assert(!held.has(url.slice(7)),'Active link to held topic: '+url);const local='src/content/notes/'+url.slice(7)+'.mdx';assert(fs.existsSync(path.join(host,local))||fs.existsSync(path.join(root,local)),url);
  }
  pairs.push({math,snippets,outputs,ids});
  (output.topics[slug]??=[]).push({locale,mathSpans:parsed,displayMath:displays,headings:ids.length,tables,exactInlineReplay:true});
 }
 assert.deepEqual(pairs[0],pairs[1]);
 for(const name of names)deps(`src/components/figures/nlp/${slug}/${name}.astro`);
}
for(const p of closure)if(p.endsWith('.astro')){
 const result=await transform(read(p),{filename:path.join(root,p),internalURL:'astro/compiler-runtime'});
 assert.equal(result.diagnostics.filter(d=>d.severity==='error').length,0);
}
output.localAssetClosure=[...closure].sort();
const renderArg=process.argv.find(s=>s.startsWith('--render-dir='));
if(renderArg){
 const dir=path.resolve(renderArg.slice(13));assert(!dir.startsWith(host+'/'));fs.mkdirSync(dir,{recursive:true});
 const {build}=await import(require.resolve('esbuild'));const modulePath=path.join(dir,'figures.mjs');
 const entries=Object.entries(topics).flatMap(([slug,names])=>names.map(name=>({slug,name})));
 await build({stdin:{contents:entries.map(({slug,name})=>`export {default as ${name}} from ${JSON.stringify(path.join(root,`src/components/figures/nlp/${slug}/${name}.astro`))};`).join('\n'),resolveDir:root,loader:'ts'},bundle:true,platform:'node',format:'esm',outfile:modulePath,logLevel:'silent',plugins:[{name:'scoped-astro',setup(b){
 b.onResolve({filter:/^astro\//},a=>({path:require.resolve(a.path),external:true}));
 b.onLoad({filter:/\.astro$/},async a=>{const result=await transform(fs.readFileSync(a.path,'utf8'),{filename:a.path,internalURL:'astro/compiler-runtime',resultScopedSlot:true});const code=result.code.replace(/createMetadata as \$\$createMetadata,?/g,'').replace(/export const \$\$metadata = [\s\S]*?\n(?=const \$\$Astro)/,'');return {contents:code,loader:'ts',resolveDir:path.dirname(a.path)};});}}]});
 const {experimental_AstroContainer:Container}=await import(require.resolve('astro/container'));
 const components=await import(pathToFileURL(modulePath).href);const container=await Container.create();
 const renderChecks=[];
 for(const lang of ['en','ru']){
  let html='';for(const {slug,name} of entries)html+=await container.renderToString(components[name],{request:new Request(`https://fpakhurov.com/${lang==='ru'?'ru/':''}notes/nlp/${slug}`)});
  assert.equal((html.match(/<svg\b/g)||[]).length,11);assert(!/NaN|undefined/.test(html));
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size);
  for(const match of html.matchAll(/aria-labelledby="([^"]+)"/g))for(const id of match[1].split(' '))assert(ids.includes(id),id);
  for(const key of ['train','validation']){
   const match=html.match(new RegExp(`<polyline[^>]*data-series="${key}"[^>]*points="([^"]+)"`));assert(match);
   const points=match[1].split(' ').map(p=>p.split(',').map(Number));assert.equal(points.length,41);
   points.forEach(([x,y],i)=>{const p=data.fine_tuning.checkpoint.trace[i];assert(Math.abs(x-(48+p.step/40*246))<1e-9);assert(Math.abs(y-(220-p[key]/.8*166))<1e-9);assert(x>=48&&x<=294&&y>=54&&y<=220);});
  }
  for(const [key,amount] of [['full',64],['frozen',16],['update',.5]]){
   const match=html.match(new RegExp(`<rect[^>]*data-budget="${key}"[^>]*width="([^"]+)"`));assert(match);assert.equal(Number(match[1]),amount*272/64);
  }
  const css=fs.readFileSync(path.join(host,'src/styles/global.css'),'utf8')+'\n'+[...closure].filter(p=>p.endsWith('.astro')).flatMap(p=>[...read(p).matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m=>m[1])).join('\n');
  fs.writeFileSync(path.join(dir,`finetuning-peft-${lang}.html`),`<!doctype html><html lang="${lang}"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}\nbody{margin:0;padding:16px}main{max-width:900px;margin:auto}</style><main class="prose">${html}</main></html>`);
  renderChecks.push({locale:lang,svg:11,trajectoryPoints:82,stateBars:3,accessibleIds:ids.length});
 }
 output.actualAstroRendering=renderChecks;
}
if(process.argv.includes('--write'))fs.writeFileSync(path.join(root,report+'finetuning-peft-checks.json'),JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify(output,null,2));
