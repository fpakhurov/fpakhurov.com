// Original scoped verifier, extending the first-party continuous renewal workflow.
// Run serially from the installed FP repository; writes only the explicit draft/evidence paths.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
const ownRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const root=path.resolve(process.argv.find((s,i)=>i>=2&&!s.startsWith('--'))||ownRoot);
const host=process.cwd(), require=createRequire(path.join(host,'package.json'));
assert.notEqual(root,host,'Keep draft outputs outside release');
const {compile}=await import(require.resolve('@mdx-js/mdx'));
const {default:remarkMath}=await import(require.resolve('remark-math'));
const {default:remarkGfm}=await import(require.resolve('remark-gfm'));
const {default:rehypeKatex}=await import(require.resolve('rehype-katex'));
const {rehypeHeadingIds}=await import(require.resolve('@astrojs/markdown-remark'));
const {transform}=await import(require.resolve('@astrojs/compiler-rs'));
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const headingPath='src/plugins/remark-heading-ids.mjs';
assert.equal(read(headingPath),fs.readFileSync(path.join(host,headingPath),'utf8'));
const {default:remarkHeadingIds}=await import(pathToFileURL(path.join(host,headingPath)));
const topics={
 'functions-of-random-variables':{names:['ChangeOfVariables','InverseTransform'],ids:['the-discrete-case','the-distribution-function-method','the-change-of-variables-formula','inverse-transform-sampling','normalizing-flows-in-one-dimension','what-changed','limitations','what-you-should-remember','code','next','references']},
 'multivariate-gaussian':{names:['CovarianceEllipses','GaussianConditioning','GaussianShell'],ids:['the-density','covariance-as-geometry','affine-maps','marginals-and-conditionals','uncorrelated-means-independent-for-gaussian-vectors','high-dimensions-the-shell','what-changed','limitations','what-you-should-remember','code','next','references']}
};
const closure=new Set(),checks={};
function deps(p){if(closure.has(p))return;closure.add(p);if(p.endsWith('.json'))return;for(const m of read(p).matchAll(/(?:from|import)\s+['"]([^'"]+)['"]/g)){if(!m[1].startsWith('.'))continue;let d=path.normalize(path.join(path.dirname(p),m[1]));if(!path.extname(d))d+='.ts';deps(d);}}
const metadata=JSON.parse(read('docs/reports/2026-11-16-probability-renewal/transform-gaussian-curriculum.json'));
for(const [slug,topic] of Object.entries(topics)){
 const normalized=[];
 for(const locale of ['notes','notes-ru']){
  const p=`src/content/${locale}/probability/${slug}.mdx`,text=read(p),frontmatter=text.match(/^---\n([\s\S]*?)\n---\n/)[1],body=text.replace(/^---\n[\s\S]*?\n---\n/,'');
  for(const key of ['title','course','section','order','status','tags','prerequisites']){const re=new RegExp(`^${key}:.*$`,'m');assert.equal(frontmatter.match(re)?.[0],metadata.topics[slug][locale].frontmatter.match(re)?.[0]);}
  const description=frontmatter.match(/^description:\s*(.*)$/m)[1];assert(description.split(/\s+/).length<=35);
  assert.doesNotMatch(body,/[\x00-\x09\x0B-\x1F]/);assert.doesNotMatch(body,/\\qquad/);
  const ids=[];const collect=()=>tree=>{function walk(n){if(/^h[1-6]$/.test(n.tagName||''))ids.push(n.properties?.id);for(const c of n.children||[])walk(c);}walk(tree);};
  const result=await compile(body,{remarkPlugins:[remarkGfm,remarkMath,remarkHeadingIds],rehypePlugins:[[rehypeKatex,{throwOnError:true,strict:'error'}],rehypeHeadingIds,collect]});
  assert.equal(result.messages.length,0,String(result.messages));assert.deepEqual(ids,topic.ids);
  const math=[...body.matchAll(/\$\$([\s\S]*?)\$\$|(?<!\\)\$(?!\$)([^\n$]*?)(?<!\\)\$/g)].map(m=>(m[1]??m[2]).replace(/\s+/g,''));normalized.push(math);
  checks[slug]={mathSpansPerLocale:math.length,displayMathPerLocale:(body.match(/\$\$/g)||[]).length/2,headings:ids,inlineReplays:2};
  const pairs=[...body.matchAll(/```python\n([\s\S]*?)```\s*```text\n([\s\S]*?)```/g)];assert.equal(pairs.length,1);
  for(const [,code,expected] of pairs){const run=spawnSync('python3',['-c',code],{encoding:'utf8',timeout:10000});assert.equal(run.status,0,run.stderr);assert.equal(run.stdout,expected);}
  for(const m of body.matchAll(/\]\((\/[^)]+)\)/g)){const url=m[1].replace(/^\/ru/,'');const f=path.join(host,'src/content/notes',url.replace(/^\/notes\//,'')+'.mdx');assert(fs.existsSync(f),m[1]);}
 }
 assert.deepEqual(normalized[0],normalized[1]);
 for(const name of topic.names)deps(`src/components/figures/${slug}/${name}.astro`);
}
for(const p of closure){if(p.endsWith('.astro')){const r=await transform(read(p),{filename:path.join(root,p),internalURL:'astro/compiler-runtime'});assert.equal(r.diagnostics.filter(d=>d.severity==='error').length,0);}}
const report='docs/reports/2026-11-16-probability-renewal/';
const py=spawnSync('python3',[path.join(root,'scripts/notes/transformation-gaussian-cases.py')],{encoding:'utf8',timeout:10000});assert.equal(py.status,0,py.stderr);assert.equal(py.stdout,read(report+'transform-gaussian-stdout.txt'));
const result={topics:checks,closure:[...closure].sort(),exactPythonStdout:true,assertions:Number(py.stdout.match(/deterministic assertions: (\d+)/)[1]),limits:'Author scoped MDX/math, exact numeric replay and Astro source compilation. Actual SVG rendering with coordinate assertions is an optional separate command. No browser/full-site/CI/production assertion.'};
if(process.argv.includes('--write'))fs.writeFileSync(path.join(root,report+'transform-gaussian-checks.json'),JSON.stringify(result,null,2)+'\n');else assert.deepEqual(JSON.parse(read(report+'transform-gaussian-checks.json')),result);
const renderArg=process.argv.find(s=>s.startsWith('--render-dir='));
if(renderArg){
 const dir=path.resolve(renderArg.slice('--render-dir='.length));fs.mkdirSync(dir,{recursive:true});
 const {build}=await import(require.resolve('esbuild'));const modulePath=path.join(dir,'figures.mjs');
 const entries=Object.entries(topics).flatMap(([slug,t])=>t.names.map(name=>({slug,name})));
 await build({stdin:{contents:entries.map(({slug,name})=>`export {default as ${name}} from ${JSON.stringify(path.join(root,`src/components/figures/${slug}/${name}.astro`))};`).join('\n'),resolveDir:root,loader:'ts'},bundle:true,platform:'node',format:'esm',outfile:modulePath,logLevel:'silent',plugins:[{name:'scoped-astro',setup(b){
 b.onResolve({filter:/^astro\//},a=>({path:require.resolve(a.path),external:true}));
 b.onLoad({filter:/\.astro$/},async a=>{const r=await transform(fs.readFileSync(a.path,'utf8'),{filename:a.path,internalURL:'astro/compiler-runtime',resultScopedSlot:true});const code=r.code.replace(/createMetadata as \$\$createMetadata,?/g,'').replace(/export const \$\$metadata = [\s\S]*?\n(?=const \$\$Astro)/,'');return {contents:code,loader:'ts',resolveDir:path.dirname(a.path)};});}}]});
 const {experimental_AstroContainer:AstroContainer}=await import(require.resolve('astro/container'));const components=await import(pathToFileURL(modulePath).href+'?v='+Date.now());const container=await AstroContainer.create();
 const t=JSON.parse(read('src/components/figures/functions-of-random-variables/cases.json')),g=JSON.parse(read('src/components/figures/multivariate-gaussian/cases.json'));
 const expected={square:t.square.map(([x,y])=>[48+(x+2)*40,224-y*11]),cdf:t.cdf.map(([y,p])=>[48+y*15,224-p*176]),quantile:t.quantileCurve.map(([u,y])=>[48+240*u,224-11*y])};
 for(const row of g.ellipses)expected[`ellipse-${row.radius}`]=row.points.map(([x,y])=>[48+24*(x+6),276-24*(y+3)]);
 expected.marginal=g.conditionalCurves.map(([x,p])=>[48+(x+6)*40/3,224-p*704]);
 expected.conditional=g.conditionalCurves.map(([x,,p])=>[48+(x+6)*40/3,224-p*704]);
 for(const row of g.shellCurves)expected[`shell-${row.dimension}`]=row.points.map(([x,p])=>[48+120*x,224-176*p/7]);
 for(const lang of ['en','ru']){
  let html='';for(const {slug,name} of entries)html+=await container.renderToString(components[name],{request:new Request(`https://fpakhurov.com/${lang==='ru'?'ru/':''}notes/probability/${slug}`)});
  assert.equal((html.match(/<svg\b/g)||[]).length,6);assert.doesNotMatch(html,/NaN|undefined/);
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);
  for(const aria of html.matchAll(/aria-labelledby="([^"]+)"/g))for(const id of aria[1].split(' '))assert(ids.includes(id),id);
  for(const [key,coords] of Object.entries(expected)){
   const poly=html.match(new RegExp(`<polyline[^>]*data-series="${key}"[^>]*points="([^"]+)"`));assert(poly,key);const points=poly[1].split(' ').map(p=>p.split(',').map(Number));assert.equal(points.length,coords.length);
   points.forEach((p,i)=>{assert(p.every(Number.isFinite));assert(Math.abs(p[0]-coords[i][0])<1e-9);assert(Math.abs(p[1]-coords[i][1])<1e-9);assert(p[0]>=48-1e-9&&p[0]<=288+1e-9);assert(p[1]>=32&&p[1]<=276);});
  }
  assert.equal((html.match(/data-series=/g)||[]).length,Object.keys(expected).length);
  const css=fs.readFileSync(path.join(host,'src/styles/global.css'),'utf8')+'\n'+[...closure].filter(p=>p.endsWith('.astro')).flatMap(p=>[...read(p).matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m=>m[1])).join('\n');
  fs.writeFileSync(path.join(dir,`transform-gaussian-${lang}.html`),`<!doctype html><html lang="${lang}" data-theme="light"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}\nbody{margin:0;padding:16px}main{max-width:1000px;margin:auto}</style><main>${html}</main></html>`);
 }
 console.log('Actual Astro render passed: 6 SVG per locale; all 10 plotted series and accessible IDs checked.');
}
console.log(JSON.stringify(result));
