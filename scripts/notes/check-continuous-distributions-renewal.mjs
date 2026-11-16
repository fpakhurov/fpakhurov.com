// Original scoped verifier; Fedor Pakhurov project with Codex assistance.
// Uses already-installed host dependencies. Run from the installed FP repository.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const ownRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const root=path.resolve(process.argv.find((s,i)=>i>=2&&!s.startsWith('--'))||ownRoot);
const host=process.cwd(),require=createRequire(path.join(host,'package.json'));
const {compile}=await import(require.resolve('@mdx-js/mdx'));
const {default:remarkMath}=await import(require.resolve('remark-math'));
const {default:remarkGfm}=await import(require.resolve('remark-gfm'));
const {default:rehypeKatex}=await import(require.resolve('rehype-katex'));
const {rehypeHeadingIds}=await import(require.resolve('@astrojs/markdown-remark'));
const {transform}=await import(require.resolve('@astrojs/compiler-rs'));
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const digest=p=>createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex');
const headingPath='src/plugins/remark-heading-ids.mjs';
assert.equal(read(headingPath),fs.readFileSync(path.join(host,headingPath),'utf8'));
const {default:remarkHeadingIds}=await import(pathToFileURL(path.join(host,headingPath)));
const expectedIds=['densities','the-distribution-function-and-quantiles','uniform','exponential','normal','gamma','beta','what-changed','limitations','what-you-should-remember','code','next','references'];
const normalized=[];let count=0,displayCount=0;
for(const locale of ['notes','notes-ru']){
 const p=`src/content/${locale}/probability/continuous-distributions.mdx`,body=read(p).replace(/^---\n[\s\S]*?\n---\n/,'');
 assert.doesNotMatch(body,/[\x00-\x09\x0B-\x1F]/);
 const ids=[];const collect=()=>tree=>{function walk(n){if(/^h[1-6]$/.test(n.tagName||''))ids.push(n.properties?.id);for(const c of n.children||[])walk(c);}walk(tree);};
 const result=await compile(body,{remarkPlugins:[remarkGfm,remarkMath,remarkHeadingIds],rehypePlugins:[[rehypeKatex,{throwOnError:true,strict:'error'}],rehypeHeadingIds,collect]});
 assert.equal(result.messages.length,0,String(result.messages));assert.deepEqual(ids,expectedIds);
 const math=[...body.matchAll(/\$\$([\s\S]*?)\$\$|(?<!\\)\$(?!\$)([^\n$]*?)(?<!\\)\$/g)].map(m=>(m[1]??m[2]).replace(/\s+/g,''));normalized.push(math);count=math.length;displayCount=(body.match(/\$\$/g)||[]).length/2;
 const pairs=[...body.matchAll(/```python\n([\s\S]*?)```\s*```text\n([\s\S]*?)```/g)];assert.equal(pairs.length,1);
 for(const [,code,expected] of pairs){const run=spawnSync('python3',['-c',code],{encoding:'utf8',timeout:10000});assert.equal(run.status,0,run.stderr);assert.equal(run.stdout,expected);}
 for(const m of body.matchAll(/\]\((\/[^)]+)\)/g)){const url=m[1].replace(/^\/ru/,'');const f=path.join(host,'src/content/notes',url.replace(/^\/notes\//,'')+'.mdx');assert(fs.existsSync(f),m[1]);}
}
assert.deepEqual(normalized[0],normalized[1]);
const names=['DensityAndCdf','GeometricToExponential'];const closure=new Set();
function deps(p){if(closure.has(p))return;closure.add(p);if(p.endsWith('.json'))return;for(const m of read(p).matchAll(/(?:from|import)\s+['"]([^'"]+)['"]/g)){if(!m[1].startsWith('.'))continue;let d=path.normalize(path.join(path.dirname(p),m[1]));if(!path.extname(d))d+='.ts';deps(d);}}
for(const n of names)deps(`src/components/figures/continuous-distributions/${n}.astro`);
for(const p of closure){if(p.endsWith('.astro')){const r=await transform(read(p),{filename:path.join(root,p),internalURL:'astro/compiler-runtime'});assert.equal(r.diagnostics.filter(d=>d.severity==='error').length,0);}}
const report='docs/reports/2026-11-16-probability-renewal/';
const py=spawnSync('python3',[path.join(root,'scripts/notes/continuous-distributions-cases.py')],{encoding:'utf8',timeout:10000});assert.equal(py.status,0,py.stderr);assert.equal(py.stdout,read(report+'continuous-stdout.txt'));
const data=JSON.parse(read('src/components/figures/continuous-distributions/cases.json'));
for(const locale of ['notes','notes-ru']){const body=read(`src/content/${locale}/probability/continuous-distributions.mdx`);for(const r of data.exponential.rows)assert(body.includes(`| ${r.delta.toFixed(2)} | ${r.survival.toFixed(6)} |`));for(const r of data.normal.central)assert(body.includes(r.mass.toFixed(6)));assert(body.includes(data.gamma.cdf_at_1.toFixed(6)));}
const result={mathSpansPerLocale:count,displayMathPerLocale:displayCount,headings:expectedIds,closure:[...closure].sort(),exactPythonStdout:true,inlineReplays:2,caseChecks:'Rising-density normalization, rational interval and rounding masses, independent Simpson quadratures, geometric survival using exact rational trial times, normal erf integration, gamma and beta normalization/CDF; all plot coordinates',limits:'Strict MDX/math and actual Astro compilation plus deterministic replay. Browser layout, full site, CI and production checks remain separate.'};
if(process.argv.includes('--write'))fs.writeFileSync(path.join(root,report+'continuous-checks.json'),JSON.stringify(result,null,2)+'\n');else assert.deepEqual(JSON.parse(read(report+'continuous-checks.json')),result);
const renderArg=process.argv.find(s=>s.startsWith('--render-dir='));
if(renderArg){
 const dir=path.resolve(renderArg.slice('--render-dir='.length));fs.mkdirSync(dir,{recursive:true});
 const {build}=await import(require.resolve('esbuild'));const modulePath=path.join(dir,'figures.mjs');
 await build({stdin:{contents:names.map(n=>`export {default as ${n}} from ${JSON.stringify(path.join(root,`src/components/figures/continuous-distributions/${n}.astro`))};`).join('\n'),resolveDir:root,loader:'ts'},bundle:true,platform:'node',format:'esm',outfile:modulePath,logLevel:'silent',plugins:[{name:'scoped-astro',setup(b){
 b.onResolve({filter:/^astro\//},a=>({path:require.resolve(a.path),external:true}));
 b.onLoad({filter:/\.astro$/},async a=>{const r=await transform(fs.readFileSync(a.path,'utf8'),{filename:a.path,internalURL:'astro/compiler-runtime',resultScopedSlot:true});const code=r.code.replace(/createMetadata as \$\$createMetadata,?/g,'').replace(/export const \$\$metadata = [\s\S]*?\n(?=const \$\$Astro)/,'');return {contents:code,loader:'ts',resolveDir:path.dirname(a.path)};});}}]});
 const {experimental_AstroContainer:AstroContainer}=await import(require.resolve('astro/container'));const components=await import(pathToFileURL(modulePath).href+'?v='+Date.now());const container=await AstroContainer.create();
 for(const lang of ['en','ru']){
  let html='';for(const name of names)html+=await container.renderToString(components[name],{request:new Request(`https://fpakhurov.com/${lang==='ru'?'ru/':''}notes/probability/continuous-distributions`)});
  assert.equal((html.match(/<svg\b/g)||[]).length,3);assert.doesNotMatch(html,/NaN|undefined/);
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);
  for(const key of ['density','cdf']){const poly=html.match(new RegExp(`<polyline[^>]*data-series="${key}"[^>]*points="([^"]+)"`));assert(poly,key);const points=poly[1].split(' ').map(p=>p.split(',').map(Number));assert.equal(points.length,161);points.forEach((p,i)=>{assert(Math.abs(p[0]-(48+58*(data.rising.grid[i].x+1)))<1e-9);assert(Math.abs(p[1]-(210-data.rising.grid[i][key]*(key==='density'?320:160)))<1e-9);});}
  for(const s of [{key:'limit',points:data.exponential.limit_grid},...data.exponential.steps.map(r=>({key:`step-${r.delta}`,points:r.points}))]){const poly=html.match(new RegExp(`<polyline[^>]*data-series="${s.key}"[^>]*points="([^"]+)"`));assert(poly,s.key);const points=poly[1].split(' ').map(p=>p.split(',').map(Number));assert.equal(points.length,s.points.length);points.forEach((p,i)=>{assert(Math.abs(p[0]-(48+62*s.points[i][0]))<1e-9);assert(Math.abs(p[1]-(214-176*s.points[i][1]))<1e-9);});}
  const css=fs.readFileSync(path.join(host,'src/styles/global.css'),'utf8')+'\n'+[...closure].filter(p=>p.endsWith('.astro')).flatMap(p=>[...read(p).matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m=>m[1])).join('\n');
  fs.writeFileSync(path.join(dir,`continuous-${lang}.html`),`<!doctype html><html lang="${lang}" data-theme="light"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}\nbody{margin:0;padding:16px}main{max-width:1000px;margin:auto}</style><main>${html}</main></html>`);
 }
 console.log('Actual Astro EN/RU rendering passed: 3 SVG per locale; every plotted coordinate checked.');
}
console.log(`Continuous scoped checks passed: ${count} paired math spans, ${displayCount} displays, ${expectedIds.length} anchors; exact Python and inline stdout.`);
