// Original bounded author checks. Run from the installed FP repository; no site build.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
const ownRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const root=path.resolve(process.argv.find((s,i)=>i>=2&&!s.startsWith('--'))||ownRoot);
const host=process.cwd(),require=createRequire(path.join(host,'package.json'));
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const digest=p=>crypto.createHash('sha256').update(read(p)).digest('hex');
const report='docs/reports/2026-11-16-nlp-adaptation';
const {compile}=await import(require.resolve('@mdx-js/mdx'));
const {default:remarkMath}=await import(require.resolve('remark-math'));
const {default:remarkGfm}=await import(require.resolve('remark-gfm'));
const {default:rehypeKatex}=await import(require.resolve('rehype-katex'));
const {rehypeHeadingIds}=await import(require.resolve('@astrojs/markdown-remark'));
const {transform}=await import(require.resolve('@astrojs/compiler-rs'));
const helper='src/plugins/remark-heading-ids.mjs';
for(const p of [helper,'src/components/figures/Figure.astro','src/utils/lang.ts'])assert.equal(read(p),fs.readFileSync(path.join(host,p),'utf8'));
const {default:headingIds}=await import(pathToFileURL(path.join(host,helper)));
const identity=JSON.parse(read(`${report}/curriculum-identity.json`));
const saved=read(`${report}/results.json`);
assert.equal(execFileSync('python3',['-B',path.join(root,'scripts/notes/nlp-adaptation-cases.py')],{encoding:'utf8'}),saved);
const data=JSON.parse(saved);
const topics=['efficient-transformers','transfer-learning'];
const components={
 'efficient-transformers':['AttentionStorage','ExpertCapacity'],
 'transfer-learning':['RepresentationBottleneck','AdaptationTrajectory'],
};
const result={topics:[],python:execFileSync('python3',['--version'],{encoding:'utf8'}).trim(),exactSavedReplay:true,fixtureSha256:digest(`${report}/results.json`),scope:'Strict paired MDX/math, original arithmetic replay and actual Astro rendering with coordinate checks. No full build, browser, CI or publication claim.'};
for(const slug of topics){
 const pairs=[],locales=[];
 const expected=identity.topics[slug]['notes-ru'].headings.map(h=>h.match(/\\\{#([^}]+)\\\}/)[1]);
 const figureData=JSON.parse(read(`src/components/figures/${slug}/cases.json`));
 assert.deepEqual(figureData,data[slug.replaceAll('-','_')]);
 for(const [lang,folder] of [['en','notes'],['ru','notes-ru']]){
  const full=read(`src/content/${folder}/nlp/${slug}.mdx`);
  const front=full.match(/^---\n([\s\S]*?)\n---\n/)[1];
  for(const key of ['title','course','section','order','prerequisites']){
   const line=s=>s.split('\n').find(l=>l.startsWith(key+':'));
   assert.equal(line(front),line(identity.topics[slug][folder].identity),`${slug} ${lang} ${key}`);
  }
  assert(front.includes('status: published'));
  const source=full.replace(/^---\n[\s\S]*?\n---\n/,'');
  assert.doesNotMatch(source,/[\x00-\x09\x0B-\x1F]/);
  assert(source.split('\n').every(l=>!l.includes('$$')||l.trim()==='$$'));
  const ids=[];let parsed=0,displays=0,tables=0;
  const inspectMath=()=>tree=>{function walk(n){if(['math','inlineMath'].includes(n.type)){parsed++;if(n.type==='math')displays++;}for(const c of n.children||[])walk(c)}walk(tree)};
  const inspectHtml=()=>tree=>{function walk(n){if(/^h[1-6]$/.test(n.tagName||''))ids.push(n.properties?.id);if(n.tagName==='table')tables++;for(const c of n.children||[])walk(c)}walk(tree)};
  const compiled=await compile(source,{remarkPlugins:[remarkGfm,remarkMath,headingIds,inspectMath],rehypePlugins:[[rehypeKatex,{throwOnError:true,strict:'error'}],rehypeHeadingIds,inspectHtml]});
  assert.equal(compiled.messages.length,0);assert.deepEqual(ids,expected);assert.equal(new Set(ids).size,ids.length);
  const math=[...source.matchAll(/\$\$([\s\S]*?)\$\$|(?<!\$)\$(?!\$)([^$\n]+)\$(?!\$)/g)].map(m=>m[1]??m[2]);
  assert.equal(parsed,math.length);pairs.push({math,ids,tables,displays});
  const links=[];
  for(const m of source.matchAll(/\]\((\/[^)]+)\)/g)){
   const url=m[1].split('#')[0];assert.equal(url.startsWith('/ru/'),lang==='ru');
   const note=url.replace(/^\/ru/,'').replace(/^\/notes\//,'');
   const p=`src/content/${folder}/${note}.mdx`;
   const target=fs.existsSync(path.join(root,p))?read(p):fs.readFileSync(path.join(host,p),'utf8');
   assert(/^status: published$/m.test(target),`Link points to unpublished target: ${url}`);links.push(url);
  }
  assert.equal([...source.matchAll(/^import .*\.astro';$/gm)].length,2);
  assert.doesNotMatch(source,/!\[|<img\b|```/);
  if(slug==='efficient-transformers'){
   for(const n of ['650','281','123','35','108','36','18'])assert(source.includes(n));
  }else{
   for(const step of [0,5,20,60,240])assert(source.includes(figureData.history.find(r=>r.step===step).target_nll.toFixed(6)));
   assert(source.includes('840'));assert(!links.some(l=>l.endsWith('/fine-tuning')));
  }
  locales.push({lang,headings:ids.length,math:parsed,displays,tables,publishedLocalLinks:links});
 }
 assert.deepEqual(pairs[0],pairs[1]);result.topics.push({slug,locales});
}
const figurePaths=topics.flatMap(slug=>components[slug].map(name=>`src/components/figures/${slug}/${name}.astro`));
for(const p of [...figurePaths,'src/components/figures/Figure.astro']){
 const compiled=await transform(read(p),{filename:path.join(root,p),internalURL:'astro/compiler-runtime'});
 assert.equal(compiled.diagnostics.filter(d=>d.severity==='error').length,0);
}
const renderArg=process.argv.find(s=>s.startsWith('--render-dir='));
assert(renderArg,'Provide --render-dir outside the repository to verify actual Astro output.');
const dir=path.resolve(renderArg.slice('--render-dir='.length));fs.mkdirSync(dir,{recursive:true});
const {build}=await import(require.resolve('esbuild'));
const modulePath=path.join(dir,'adaptation-figures.mjs');
await build({stdin:{contents:figurePaths.map(p=>`export {default as ${path.basename(p,'.astro')}} from ${JSON.stringify(path.join(root,p))};`).join('\n'),resolveDir:root,loader:'ts'},bundle:true,platform:'node',format:'esm',outfile:modulePath,logLevel:'silent',plugins:[{name:'scoped-astro',setup(b){
 b.onResolve({filter:/^astro\//},a=>({path:require.resolve(a.path),external:true}));
 b.onLoad({filter:/\.astro$/},async a=>{const r=await transform(fs.readFileSync(a.path,'utf8'),{filename:a.path,internalURL:'astro/compiler-runtime',resultScopedSlot:true});const code=r.code.replace(/createMetadata as \$\$createMetadata,?/g,'').replace(/export const \$\$metadata = [\s\S]*?\n(?=const \$\$Astro)/,'');return {contents:code,loader:'ts',resolveDir:path.dirname(a.path)};});
}}]});
const {experimental_AstroContainer:AstroContainer}=await import(require.resolve('astro/container'));
const renderedComponents=await import(pathToFileURL(modulePath).href+'?v='+Date.now());
const container=await AstroContainer.create();
const attributes=tag=>Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));
const close=(actual,expected)=>assert(Math.abs(Number(actual)-expected)<1e-9,`${actual} != ${expected}`);
for(const lang of ['en','ru']){
 let html='';for(const slug of topics)for(const name of components[slug])html+=await container.renderToString(renderedComponents[name],{request:new Request(`https://fpakhurov.com/${lang==='ru'?'ru/':''}notes/nlp/${slug}`)});
 assert.equal((html.match(/<svg\b/g)||[]).length,7);assert.equal((html.match(/<figure\b/g)||[]).length,4);assert.doesNotMatch(html,/NaN|undefined/);
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);
 const rects=[...html.matchAll(/<rect\b[^>]+>/g)].map(m=>attributes(m[0]));
 for(const row of data.efficient_transformers.memory){
  const rect=rects.find(r=>r['data-series']==='streamed'&&Number(r['data-n'])===row.n);assert(rect);close(rect.width,260*row.streamed_bytes/row.dense_bytes);
  const dense=rects.find(r=>r['data-series']==='materialized'&&Number(r['data-n'])===row.n);close(dense.width,260);
 }
 for(const [i,count] of data.efficient_transformers.moe.counts.entries())for(const kind of ['accepted','overflow']){
  const rect=rects.find(r=>Number(r['data-expert'])===i+1&&r['data-kind']===kind);assert(rect);close(rect.x,48+i*52);close(rect.height,(kind==='accepted'?Math.min(count,3):Math.max(count-3,0))*24);close(rect.y,184-(kind==='accepted'?Math.min(count,3):count)*24);
 }
 const curve=attributes(html.match(/<polyline\b[^>]*data-series="adapted"[^>]*>/)[0]).points.split(' ').map(p=>p.split(',').map(Number));
 assert.equal(curve.length,data.transfer_learning.history.length);
 curve.forEach((p,i)=>{const row=data.transfer_learning.history[i];close(p[0],48+row.step);close(p[1],218-150*row.target_nll)});
 const optimum=attributes(html.match(/<line\b[^>]*data-series="frozen-optimum"[^>]*>/)[0]);close(optimum.y1,218-150*Math.log(2));close(optimum.y2,Number(optimum.y1));
 for(const [key,a] of [['frozen',[1,0]],['changed',[0,2]]])for(const [i,h] of [-2,2].entries()){
  const tags=[...html.matchAll(/<path\b[^>]*data-projection="[^"]+"[^>]*>/g)].map(m=>attributes(m[0]));
  const tag=tags.find(t=>t['data-projection']===key&&Number(t['data-location'])===h);assert(tag);assert.equal(tag.d,`M${80+160*i} 88 A17 17 0 0 0 ${80+160*i} 122 Z`);
  const labels=data.transfer_learning.inputs.map((x,j)=>({h:x[0]*a[0]+x[1]*a[1],y:data.transfer_learning.target_labels[j]})).filter(x=>x.h===h).map(x=>x.y);
  assert.equal(labels.length,2);assert.equal(tag.fill,labels[0]===0?'var(--fig-blue)':'var(--fig-amber)');assert(html.includes(labels.join(' + ')));
 }
 const css=fs.readFileSync(path.join(host,'src/styles/global.css'),'utf8')+'\n'+figurePaths.flatMap(p=>[...read(p).matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m=>m[1])).join('\n');
 fs.writeFileSync(path.join(dir,`adaptation-${lang}.html`),`<!doctype html><html lang="${lang}" data-theme="light"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}\nbody{margin:0;padding:16px}main{max-width:1000px;margin:auto}</style><main>${html}</main></html>`);
}
result.figures={perLocale:4,svgsPerLocale:7,checks:'Every storage bar, expert accepted/overflow geometry, adaptation checkpoint and frozen optimum, original projection groups; EN/RU actual Astro render.'};
const out=JSON.stringify(result,null,2)+'\n';
if(process.argv.includes('--write'))fs.writeFileSync(path.join(root,report,'verification.json'),out);else assert.equal(read(`${report}/verification.json`),out);
console.log(out);
