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
const report='docs/reports/2026-11-16-probability-limits';
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
assert.equal(execFileSync('python3',['-B',path.join(root,'scripts/notes/probability-limit-cases.py')],{encoding:'utf8'}),saved);
const data=JSON.parse(saved);
const topics=['law-of-large-numbers','central-limit-theorem'];
const components={
 'law-of-large-numbers':['TwoConvergences','MonteCarloPrecision'],
 'central-limit-theorem':['SumsBecomeNormal','ModesOfConvergence'],
};
const result={topics:[],python:execFileSync('python3',['--version'],{encoding:'utf8'}).trim(),exactSavedReplay:true,fixtureSha256:digest(`${report}/results.json`),scope:'Strict paired MDX/math, original arithmetic replay and actual Astro rendering with coordinate checks. No full build, browser, CI or publication claim.'};
for(const slug of topics){
 const pairs=[],locales=[];
 const expected=identity.topics[slug]['notes-ru'].headings.map(h=>h.match(/\\\{#([^}]+)\\\}/)[1]);
 const figureData=JSON.parse(read(`src/components/figures/${slug}/cases.json`));
 assert.deepEqual(figureData.law,data.law);
 for(const [lang,folder] of [['en','notes'],['ru','notes-ru']]){
  const full=read(`src/content/${folder}/probability/${slug}.mdx`);
  const front=full.match(/^---\n([\s\S]*?)\n---\n/)[1];
  for(const key of ['title','course','section','order','tags','prerequisites']){
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
  const values=slug==='law-of-large-numbers'
   ? data.weak.flatMap(r=>[r.tail.toFixed(r.n===384?9:6),r.chebyshev.toFixed(6),r.hoeffding.toFixed(6)])
   : [...data.clt.flatMap(r=>[r.kolmogorov.toFixed(6),r.berryEsseenConstant3.toFixed(6)]),...data.coverage.flatMap(r=>[r.standardError.toFixed(6),r.halfWidth.toFixed(6),r.coverage.toFixed(6)]),...['probability','uncorrected','continuityCorrected'].map(k=>data.interval[k].toFixed(6))];
  for(const value of values)assert(source.includes(value),`${slug} ${lang}: missing computed table value ${value}`);
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
const modulePath=path.join(dir,'limit-figures.mjs');
await build({stdin:{contents:figurePaths.map(p=>`export {default as ${path.basename(p,'.astro')}} from ${JSON.stringify(path.join(root,p))};`).join('\n'),resolveDir:root,loader:'ts'},bundle:true,platform:'node',format:'esm',outfile:modulePath,logLevel:'silent',plugins:[{name:'scoped-astro',setup(b){
 b.onResolve({filter:/^astro\//},a=>({path:require.resolve(a.path),external:true}));
 b.onLoad({filter:/\.astro$/},async a=>{const r=await transform(fs.readFileSync(a.path,'utf8'),{filename:a.path,internalURL:'astro/compiler-runtime',resultScopedSlot:true});const code=r.code.replace(/createMetadata as \$\$createMetadata,?/g,'').replace(/export const \$\$metadata = [\s\S]*?\n(?=const \$\$Astro)/,'');return {contents:code,loader:'ts',resolveDir:path.dirname(a.path)};});
}}]});
const {experimental_AstroContainer:AstroContainer}=await import(require.resolve('astro/container'));
const renderedComponents=await import(pathToFileURL(modulePath).href+'?v='+Date.now());
const container=await AstroContainer.create();
const attributes=tag=>Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));
const close=(actual,expected)=>assert(Math.abs(Number(actual)-expected)<1e-9,`${actual} != ${expected}`);
const lln=JSON.parse(read('src/components/figures/law-of-large-numbers/cases.json'));
const clt=JSON.parse(read('src/components/figures/central-limit-theorem/cases.json'));
let geometryChecks=0;
const verify=(actual,expected)=>{close(actual,expected);geometryChecks++;};
for(const lang of ['en','ru']){
 let html='';for(const slug of topics)for(const name of components[slug])html+=await container.renderToString(renderedComponents[name],{request:new Request(`https://fpakhurov.com/${lang==='ru'?'ru/':''}notes/probability/${slug}`)});
 assert.equal((html.match(/<svg\b/g)||[]).length,6);assert.equal((html.match(/<figure\b/g)||[]).length,4);assert.doesNotMatch(html,/NaN|undefined/);
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);
 for(const figure of ['two-convergences','monte-carlo-precision','sums-become-normal','modes-of-convergence'])assert(ids.includes('fig-'+figure));
 const curves=[...html.matchAll(/<polyline\b[^>]+>/g)].map(m=>attributes(m[0]));
 const get=(series,n)=>curves.find(r=>r['data-series']===series&&(n===undefined||Number(r['data-n'])===n)).points.split(' ').map(p=>p.split(',').map(Number));
 const curve=(actual,expected)=>{assert.equal(actual.length,expected.length);actual.forEach((p,i)=>{verify(p[0],expected[i][0]);verify(p[1],expected[i][1]);});};
 curve(get('point'),lln.events.map(r=>[48+40*Math.log2(r.n/4),212-160*r.atN]));
 curve(get('window'),lln.events.map(r=>[48+40*Math.log2(r.n/4),212-160*r.through4N]));
 curve(get('plain'),lln.monteCarlo.budget.map(r=>[60+30*Math.log2(r.evaluations/4),52+80*Math.log10(.2/r.plainRms)]));
 curve(get('paired'),lln.monteCarlo.budget.map(r=>[60+30*Math.log2(r.evaluations/4),52+80*Math.log10(.2/r.pairedRms)]));
 for(const row of clt.cdfs){
  curve(get('normal',row.n),clt.normalCdf.map(([z,p])=>[48+30*(z+4),210-160*p]));
  curve(get('exact',row.n),row.plotPoints.map(([z,p])=>[48+30*(z+4),210-160*p]));
  assert(row.plotPoints.every(([z,p])=>z>=-4&&z<=4&&p>=0&&p<=1));
  // Check the visible boundary CDF against the complete exact jump sequence.
  for(const boundary of [-4,4]){
   const complete=row.points.filter(([z])=>z<=boundary);const value=complete.length?complete.at(-1)[1]:0;
   verify(row.plotPoints[boundary===-4?0:row.plotPoints.length-1][1],value);
  }
 }
 for(const circle of [...html.matchAll(/<circle\b[^>]+>/g)].map(m=>attributes(m[0]))){
  const n=Number(circle['data-n']??circle['data-calls']);const series=circle['data-series'];
  if(series==='point'||series==='window'){
   const row=lln.events.find(r=>r.n===n);verify(circle.cx,48+40*Math.log2(n/4));verify(circle.cy,212-160*row[series==='point'?'atN':'through4N']);
  }else{
   const row=lln.monteCarlo.budget.find(r=>r.evaluations===n);verify(circle.cx,60+30*Math.log2(n/4));verify(circle.cy,52+80*Math.log10(.2/row[series==='plain'?'plainRms':'pairedRms']));
  }
 }
 const cells=[...html.matchAll(/<td\b([^>]*)>([^<]+)<\/td>/g)].map(m=>({...attributes(m[1]),text:m[2]}));
 for(const row of clt.modes.slice(0,2))for(const z of [-3,3])assert.equal(cells.find(c=>Number(c['data-n'])===row.n&&Number(c['data-z'])===z).text,String(row[z===-3?'atZminus3':'atZplus3']));
 const css=fs.readFileSync(path.join(host,'src/styles/global.css'),'utf8')+'\n'+figurePaths.flatMap(p=>[...read(p).matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m=>m[1])).join('\n');
 fs.writeFileSync(path.join(dir,`limits-${lang}.html`),`<!doctype html><html lang="${lang}" data-theme="light"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}\nbody{margin:0;padding:16px}main{max-width:1000px;margin:auto}</style><main>${html}</main></html>`);
}
result.figures={perLocale:4,svgsPerLocale:6,geometryChecks,checks:'Every event/Monte Carlo curve and marker, all four exact and normal CDF curves, truncated-domain boundary probabilities and the alternating-outcome table; EN/RU actual Astro render.'};
const out=JSON.stringify(result,null,2)+'\n';
if(process.argv.includes('--write'))fs.writeFileSync(path.join(root,report,'verification.json'),out);else assert.equal(read(`${report}/verification.json`),out);
console.log(out);
