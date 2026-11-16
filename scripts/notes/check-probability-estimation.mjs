// Bounded author checks. Run from an installed FP host; no site build or browser.
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
const sha=p=>crypto.createHash('sha256').update(read(p)).digest('hex');
const report='docs/reports/2026-11-16-probability-estimation';
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
assert.equal(execFileSync('python3',['-B',path.join(root,'scripts/notes/probability-estimation-cases.py')],{encoding:'utf8'}),saved);
assert.equal(read(`${report}/stdout.json`),saved);
const data=JSON.parse(saved);
const components={estimators:['SamplingDistribution','ShrinkageRisk'],'maximum-likelihood':['LikelihoodProfile','NoiseObjectives']};
const figurePaths=Object.entries(components).flatMap(([s,cs])=>cs.map(c=>`src/components/figures/${s}/${c}.astro`));
const result={topics:[],python:execFileSync('python3',['--version'],{encoding:'utf8'}).trim(),arithmeticAssertions:data.assertions,savedReplay:true,resultsSha256:sha(`${report}/results.json`),scope:'Paired strict MDX/math, unchanged curriculum anchors, literal code execution, arithmetic replay, and actual Astro figures. No full build/browser/CI/publication.'};
const compileIds=async source=>{
 const ids=[];let math=0,displays=0,tables=0;
 const inspectMath=()=>tree=>{function walk(n){if(['math','inlineMath'].includes(n.type)){math++;if(n.type==='math')displays++;}for(const c of n.children||[])walk(c)}walk(tree)};
 const inspectHtml=()=>tree=>{function walk(n){if(/^h[1-6]$/.test(n.tagName||''))ids.push(n.properties?.id);if(n.tagName==='table')tables++;for(const c of n.children||[])walk(c)}walk(tree)};
 const compiled=await compile(source,{remarkPlugins:[remarkGfm,remarkMath,headingIds,inspectMath],rehypePlugins:[[rehypeKatex,{throwOnError:true,strict:'error'}],rehypeHeadingIds,inspectHtml]});
 assert.equal(compiled.messages.length,0);assert.equal(new Set(ids).size,ids.length);
 return {ids,math,displays,tables};
};
for(const slug of Object.keys(components)){
 const pairs=[],locales=[];
 const expected=identity.notes.find(r=>r.path===`src/content/notes-ru/probability/${slug}.mdx`).headingsOutsideFences.map(h=>h.match(/\\\{#([^}]+)\\\}/)[1]);
 for(const [lang,folder] of [['en','notes'],['ru','notes-ru']]){
  const file=`src/content/${folder}/probability/${slug}.mdx`;const full=read(file);const front=full.match(/^---\n([\s\S]*?)\n---\n/)[1];
  const old=identity.notes.find(r=>r.path===file);for(const line of old.allowedFrontmatter)assert(front.split('\n').includes(line));assert(front.includes('status: published'));
  const source=full.replace(/^---\n[\s\S]*?\n---\n/,'');
  assert.doesNotMatch(source,/[\x00-\x09\x0B-\x1F]|\\qquad|@@M|@@CODE|!\[|<img\b/);
  assert(source.split('\n').every(l=>!l.includes('$$')||l.trim()==='$$'));
  const parsed=await compileIds(source);assert.deepEqual(parsed.ids,expected);
  const math=[...source.matchAll(/\$\$([\s\S]*?)\$\$|(?<!\$)\$(?!\$)([^$\n]+)\$(?!\$)/g)].map(m=>m[1]??m[2]);assert.equal(parsed.math,math.length);
  pairs.push({math,...parsed});
  const code=source.match(/```python\n([\s\S]*?)```/)[1],stdout=source.match(/```text\n([\s\S]*?)```/)[1];assert.equal(execFileSync('python3',['-B','-c',code],{encoding:'utf8'}),stdout);
  const links=[];
  for(const m of source.matchAll(/\]\((\/[^)]+)\)/g)){
   const [url,anchor]=m[1].split('#');assert.equal(url.startsWith('/ru/'),lang==='ru');
   const targetPath=`src/content/${folder}/${url.replace(/^\/ru/,'').replace(/^\/notes\//,'')}.mdx`;
   const target=fs.existsSync(path.join(root,targetPath))?read(targetPath):fs.readFileSync(path.join(host,targetPath),'utf8');
   assert(/^status: published$/m.test(target),`Unpublished link ${url}`);
   if(anchor){const headSource=target.split('\n').filter(l=>/^#{2,6} /.test(l)).join('\n');assert((await compileIds(headSource)).ids.includes(anchor),`Missing anchor ${anchor}`)}
   links.push(m[1]);
  }
  const values=slug==='estimators'?[.029154518950437316,.012188208616780046,.047619047619047616,.00992063492063492,.17074694419062766,.1870439059165649,.035555555555555556,.022857142857142857,.005547122430239314,.0016935987631958329]:data.likelihood.comparisons.filter(x=>x.relative!==1).map(x=>x.relative);
  for(const value of values)assert(source.includes(value.toFixed(6)),`Missing ${value.toFixed(6)}`);
  assert.equal([...source.matchAll(/^import .*\.astro';$/gm)].length,2);
  locales.push({lang,headings:parsed.ids.length,math:parsed.math,displays:parsed.displays,tables:parsed.tables,codeStdout:stdout,localLinks:links});
 }
 assert.deepEqual(pairs[0],pairs[1]);result.topics.push({slug,locales});
}
for(const [slug,keys] of [['estimators',['sampling','pmf','risks']],['maximum-likelihood',['likelihood','loss','lossCurve']]]){
 const fig=JSON.parse(read(`src/components/figures/${slug}/cases.json`));for(const k of keys)assert.deepEqual(fig[k],data[k]);
}
for(const p of [...figurePaths,'src/components/figures/Figure.astro']){
 const c=await transform(read(p),{filename:path.join(root,p),internalURL:'astro/compiler-runtime'});assert.equal(c.diagnostics.filter(d=>d.severity==='error').length,0);
}
const arg=process.argv.find(s=>s.startsWith('--render-dir='));assert(arg,'Provide external --render-dir');const dir=path.resolve(arg.slice('--render-dir='.length));fs.mkdirSync(dir,{recursive:true});
const {build}=await import(require.resolve('esbuild'));const modulePath=path.join(dir,'estimation-figures.mjs');
await build({stdin:{contents:figurePaths.map(p=>`export {default as ${path.basename(p,'.astro')}} from ${JSON.stringify(path.join(root,p))};`).join('\n'),resolveDir:root,loader:'ts'},bundle:true,platform:'node',format:'esm',outfile:modulePath,logLevel:'silent',plugins:[{name:'scoped-astro',setup(b){
 b.onResolve({filter:/^astro\//},a=>({path:require.resolve(a.path),external:true}));
 b.onLoad({filter:/\.astro$/},async a=>{const r=await transform(fs.readFileSync(a.path,'utf8'),{filename:a.path,internalURL:'astro/compiler-runtime',resultScopedSlot:true});return{contents:r.code.replace(/createMetadata as \$\$createMetadata,?/g,'').replace(/export const \$\$metadata = [\s\S]*?\n(?=const \$\$Astro)/,''),loader:'ts',resolveDir:path.dirname(a.path)}});
}}]});
const {experimental_AstroContainer:AstroContainer}=await import(require.resolve('astro/container'));const mods=await import(pathToFileURL(modulePath).href+'?v='+Date.now());const container=await AstroContainer.create();
const attrs=tag=>Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));let geometry=0;
const close=(a,b)=>{assert(Math.abs(Number(a)-b)<1e-9,`${a} != ${b}`);geometry++;};
const curve=(actual,expected)=>{const points=actual.split(' ').map(p=>p.split(',').map(Number));assert.equal(points.length,expected.length);points.forEach((p,i)=>{close(p[0],expected[i][0]);close(p[1],expected[i][1]);assert(p[0]>=0&&p[0]<=320&&p[1]>=0&&p[1]<=270)})};
for(const lang of ['en','ru']){
 let html='';for(const [slug,names] of Object.entries(components))for(const name of names)html+=await container.renderToString(mods[name],{request:new Request(`https://fpakhurov.com/${lang==='ru'?'ru/':''}notes/probability/${slug}`)});
 assert.equal((html.match(/<figure\b/g)||[]).length,4);assert.equal((html.match(/<svg\b/g)||[]).length,8);assert.doesNotMatch(html,/NaN|undefined/);
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size);
 for(const id of ['uniform-estimators','bias-variance-polys','likelihood-curves','losses-as-likelihoods'])assert(ids.includes('fig-'+id));
 for(const m of html.matchAll(/<svg\b([^>]*)>/g)){const a=attrs(m[1]);assert.equal(a.role,'img');for(const id of a['aria-labelledby'].split(' '))assert(ids.includes(id));}
 const lines=[...html.matchAll(/<polyline\b[^>]+>/g)].map(m=>attrs(m[0]));const get=s=>lines.find(x=>x['data-series']===s).points;
 for(const row of data.risks){const max=row.n===7?.07:.01;for(const key of ['mean','shrink'])curve(get(`${key}-${row.n}`),row.points.map(r=>[60+230*r.p,210-170*r[key]/max]));}
 curve(get('relative'),data.likelihood.curve.map(r=>[60+230*r.p,210-170*r.relative]));
 curve(get('relativeLog'),data.likelihood.curve.map(r=>[60+230*r.p,210-170*(r.relativeLog+32)/32]));
 for(const key of ['gaussian','laplace'])curve(get(key),data.lossCurve.map(r=>[60+230*(r.shift+3)/7,210-170*r[key]/9]));
 for(const m of html.matchAll(/<g\b([^>]*)>(<line[\s\S]*?<circle[^>]+>)[\s\S]*?<\/g>/g)){
  const a=attrs(m[1]);if(!a['data-rule'])continue;const row=data.pmf.find(r=>r.k===Number(a['data-k']));const l=attrs(m[2].match(/<line[^>]+>/)[0]);const c=attrs(m[2].match(/<circle[^>]+>/)[0]);const x=60+230*row[a['data-rule']],y=210-145*row.mass/.4;
  for(const key of ['x1','x2'])close(l[key],x);close(l.y1,210);close(l.y2,y);close(c.cx,x);close(c.cy,y);
 }
 for(const m of html.matchAll(/<circle\b[^>]+>/g)){
  const a=attrs(m[0]);if(a['data-mle']){close(a.cx,60+230*data.likelihood.mle);close(a.cy,40)}
  if(a['data-optimum']){const opt=a['data-optimum']==='gaussian'?.6:0;close(a.cx,60+230*(opt+3)/7);close(a.cy,210)}
 }
 const css=fs.readFileSync(path.join(host,'src/styles/global.css'),'utf8')+'\n'+figurePaths.flatMap(p=>[...read(p).matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m=>m[1])).join('\n');
 fs.writeFileSync(path.join(dir,`estimation-${lang}.html`),`<!doctype html><html lang="${lang}" data-theme="light"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}\nbody{margin:0;padding:16px}main{max-width:1000px;margin:auto}</style><main>${html}</main></html>`);
}
result.figures={perLocale:4,svgPerLocale:8,coordinateChecks:geometry,scope:'All eight actual polyline series per locale, sampling distribution stems/markers, optimizer markers, accessible IDs and finite in-viewBox plot coordinates.'};
const out=JSON.stringify(result,null,2)+'\n';if(process.argv.includes('--write'))fs.writeFileSync(path.join(root,report,'verification.json'),out);else assert.equal(read(`${report}/verification.json`),out);console.log(out);
