// Scoped deterministic author checks; use an installed FP host, never a full build.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const host=process.cwd(),require=createRequire(path.join(host,'package.json'));
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const sha=p=>crypto.createHash('sha256').update(read(p)).digest('hex');
const report='docs/reports/2026-11-16-probability-interval-tests';
const identity=JSON.parse(read(`${report}/curriculum-identity.json`));
const {compile}=await import(require.resolve('@mdx-js/mdx'));
const {default:remarkMath}=await import(require.resolve('remark-math'));
const {default:remarkGfm}=await import(require.resolve('remark-gfm'));
const {default:rehypeKatex}=await import(require.resolve('rehype-katex'));
const {rehypeHeadingIds}=await import(require.resolve('@astrojs/markdown-remark'));
const {transform}=await import(require.resolve('@astrojs/compiler-rs'));
const {convertToTSX}=await import(require.resolve('@astrojs/compiler'));
const {default:ts}=await import(require.resolve('typescript'));
const helper='src/plugins/remark-heading-ids.mjs';
const {default:headingIds}=await import(pathToFileURL(path.join(host,helper)));
for(const p of [helper,'src/components/figures/Figure.astro','src/utils/lang.ts']) assert.equal(read(p),fs.readFileSync(path.join(host,p),'utf8'));
const saved=read(`${report}/results.json`),stdout=read(`${report}/stdout.txt`);
assert.equal(execFileSync('python3',['-B',path.join(root,'scripts/check-interval-tests-cases.py')],{encoding:'utf8'}),stdout);
assert.equal(read(`${report}/results.json`),saved);
const data=JSON.parse(saved);
const components={'confidence-intervals-and-bootstrap':['CoverageIntervals','BootstrapSteps'],'hypothesis-tests':['TestLogic','Peeking']};
const figures=Object.entries(components).flatMap(([slug,names])=>names.map(name=>`src/components/figures/${slug}/${name}.astro`));
const result={python:execFileSync('python3',['--version'],{encoding:'utf8'}).trim(),savedResultsReplay:true,arithmeticAssertions:data.verificationAssertions,resultsSha256:sha(`${report}/results.json`),topics:[],scope:'Strict paired MDX/math, exact original small computations and inline code, unchanged historical identity, Astro+TSX syntax, actual Astro SVG coordinates/accessibility. No browser/full build/global rights/publication.'};
const parse=async source=>{
 const ids=[],math=[];let displays=0;
 const inspect=()=>tree=>{function walk(n){if(['math','inlineMath'].includes(n.type)){math.push(n.value);if(n.type==='math') displays++;}for(const c of n.children||[])walk(c)}walk(tree)};
 const html=()=>tree=>{function walk(n){if(/^h[1-6]$/.test(n.tagName||''))ids.push(n.properties.id);for(const c of n.children||[])walk(c)}walk(tree)};
 const output=await compile(source,{remarkPlugins:[remarkGfm,remarkMath,headingIds,inspect],rehypePlugins:[[rehypeKatex,{throwOnError:true,strict:'error'}],rehypeHeadingIds,html]});assert.equal(output.messages.length,0);assert.equal(ids.length,new Set(ids).size);return {ids,math,displays};
};
for(const slug of Object.keys(components)) {
 const locales=[],paired=[];
 const expected=identity.files.find(f=>f.path===`src/content/notes-ru/probability/${slug}.mdx`).headingsOutsideFences.map(h=>h.match(/\\\{#([^}]+)\\\}/)[1]);
 for(const [lang,folder] of [['en','notes'],['ru','notes-ru']]) {
  const file=`src/content/${folder}/probability/${slug}.mdx`,full=read(file);
  assert(full.split('\n').every(line=>line===line.trimEnd()),`${file}: trailing whitespace`);
  const front=full.match(/^---\n([\s\S]*?)\n---\n/)[1];
  for(const [key,value] of Object.entries(identity.files.find(f=>f.path===file).metadata)) assert(front.split('\n').includes(`${key}: ${value}`));
  const source=full.replace(/^---\n[\s\S]*?\n---\n/,'');
  assert.doesNotMatch(source,/[\x00-\x09\x0B-\x1F]|\\qquad|!\[|<img\b|@@/);
  const p=await parse(source);assert.deepEqual(p.ids,expected);
  const code=source.match(/```python\n([\s\S]*?)```/)[1],out=source.match(/```text\n([\s\S]*?)```/)[1];
  assert.equal(execFileSync('python3',['-B','-c',code],{encoding:'utf8'}),out);
  const imports=[...source.matchAll(/^import (\w+) from '([^']+)';$/gm)].map(m=>({name:m[1],path:m[2]}));assert.deepEqual(imports.map(x=>x.name),components[slug]);
  const links=[...source.matchAll(/\]\((\/[^)]+)\)/g)].map(m=>m[1]);
  for(const link of links) {
   assert.equal(link.startsWith('/ru/'),lang==='ru');const [url,anchor]=link.split('#');const local=`src/content/${folder}/${url.replace(/^\/ru/,'').replace(/^\/notes\//,'')}.mdx`;
   const target=read(local);assert(/^status: published$/m.test(target));assert((await parse(target.replace(/^---\n[\s\S]*?\n---\n/,''))).ids.includes(anchor));
  }
  paired.push({math:p.math,ids:p.ids,displays:p.displays,code,out,imports});locales.push({lang,headings:p.ids.length,math:p.math.length,displayMath:p.displays,inlineCodeStdout:out,links});
 }
 assert.deepEqual(paired[0],paired[1]);result.topics.push({slug,locales});
}
for(const file of [...figures,'src/components/figures/Figure.astro']) {
 assert(read(file).split('\n').every(line=>line===line.trimEnd()));
 const output=await transform(read(file),{filename:path.join(root,file),internalURL:'astro/compiler-runtime'});assert.equal(output.diagnostics.filter(d=>d.severity==='error').length,0);
 const tsx=await convertToTSX(read(file),{filename:file});const parsed=ts.createSourceFile(file+'.tsx',tsx.code,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 assert.deepEqual(parsed.parseDiagnostics.map(d=>ts.flattenDiagnosticMessageText(d.messageText,' ')),[],`${file}: TSX syntax`);
}
const arg=process.argv.find(v=>v.startsWith('--render-dir='));assert(arg,'External --render-dir required');const dir=path.resolve(arg.slice(13));fs.mkdirSync(dir,{recursive:true});
const {build}=await import(require.resolve('esbuild'));const modulePath=path.join(dir,'interval-tests-figures.mjs');
await build({stdin:{contents:figures.map(p=>`export {default as ${path.basename(p,'.astro')}} from ${JSON.stringify(path.join(root,p))};`).join('\n'),resolveDir:root,loader:'ts'},bundle:true,platform:'node',format:'esm',outfile:modulePath,logLevel:'silent',plugins:[{name:'scoped-astro',setup(b){
 b.onResolve({filter:/^astro\//},a=>({path:require.resolve(a.path),external:true}));
 b.onLoad({filter:/\.astro$/},async a=>{const r=await transform(fs.readFileSync(a.path,'utf8'),{filename:a.path,internalURL:'astro/compiler-runtime',resultScopedSlot:true});return {contents:r.code.replace(/createMetadata as \$\$createMetadata,?/g,'').replace(/export const \$\$metadata = [\s\S]*?\n(?=const \$\$Astro)/,''),loader:'ts',resolveDir:path.dirname(a.path)}});
}}]});
const {experimental_AstroContainer:AstroContainer}=await import(require.resolve('astro/container'));const modules=await import(pathToFileURL(modulePath));const container=await AstroContainer.create();
const attrs=tag=>Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));let assertions=0;
const close=(a,b)=>{assert(Math.abs(Number(a)-b)<1e-9,`${a} != ${b}`);assertions++;};
for(const lang of ['en','ru']) {
 let html='';for(const [slug,names] of Object.entries(components)) for(const name of names)html+=await container.renderToString(modules[name],{request:new Request(`https://fpakhurov.com/${lang==='ru'?'ru/':''}notes/probability/${slug}`)});
 assert.equal((html.match(/<figure\b/g)||[]).length,4);assert.equal((html.match(/<svg\b/g)||[]).length,6);assert.doesNotMatch(html,/NaN|undefined/);
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);
 for(const id of ['coverage-intervals','bootstrap-steps','test-logic','peeking']) assert(ids.includes('fig-'+id));
 for(const m of html.matchAll(/<svg\b([^>]*)>([\s\S]*?)<\/svg>/g)) {const a=attrs(m[1]);assert.equal(a.role,'img');assert(ids.includes(a['aria-labelledby']));assert(/<desc\b/.test(m[2]));}
 for(const m of html.matchAll(/<g\b([^>]*)>([\s\S]*?)<\/g>/g)) {
  const a=attrs(m[1]);
  if(a['data-method']) {const row=data.binomialIntervals[Number(a['data-k'])],bounds=row[a['data-method']];close(a['data-lo'],bounds[0]);close(a['data-hi'],bounds[1]);close(a['data-mass'],row.massAtPointOne);const line=attrs(m[2].match(/<line[^>]+>/)[0]);close(line.x1,54+(bounds[0]+.1)*230/1.2);close(line.x2,54+(bounds[1]+.1)*230/1.2);close(line.y1,56+row.k*20);close(line.y2,56+row.k*20);}
  if(a['data-n']) {const row=data.peeking.find(r=>r.n===Number(a['data-n']));close(a['data-critical'],row.critical);close(a['data-single'],row.singleLookSize);close(a['data-ever'],row.everCrossed);const circles=[...m[2].matchAll(/<circle[^>]+>/g)].map(m=>attrs(m[0]));for(const c of circles)close(c.cx,58+(row.n-10)*238/50);close(circles[0].cy,240-row.singleLookSize*180/.1);close(circles[1].cy,240-row.everCrossed*180/.1);}
 }
 for(const m of html.matchAll(/<line\b[^>]+>/g)) {const a=attrs(m[0]);if(!a['data-mean'])continue;const row=data.bootstrap.mass.find(r=>r.mean===Number(a['data-mean']));close(a['data-count'],row.count);close(a.x1,58+(row.mean-1)*238/7);close(a.x2,58+(row.mean-1)*238/7);close(a.y1,226);close(a.y2,226-row.probability*166/.15);}
 for(const m of html.matchAll(/<rect\b[^>]+>/g)) {const a=attrs(m[0]);if(!a['data-distribution'])continue;const row=data.exactTest.mass[Number(a['data-k'])],p=row[a['data-distribution']];close(a['data-p'],p);close(a.x,58+row.k*19.5-5);close(a.y,226-p*166/.3);close(a.height,p*166/.3);close(a.width,10);}
 for(const m of html.matchAll(/<polyline\b[^>]+>/g)) {const a=attrs(m[0]);const key=a.class.includes('f-blue')?'singleLookSize':'everCrossed';const points=a.points.split(' ').map(p=>p.split(',').map(Number));assert.equal(points.length,6);points.forEach((p,i)=>{close(p[0],58+(data.peeking[i].n-10)*238/50);close(p[1],240-data.peeking[i][key]*180/.1);});}
 const css=fs.readFileSync(path.join(host,'src/styles/global.css'),'utf8')+'\n'+figures.flatMap(p=>[...read(p).matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m=>m[1])).join('\n');
 fs.writeFileSync(path.join(dir,`interval-tests-${lang}.html`),`<!doctype html><html lang="${lang}" data-theme="light"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}\nbody{margin:0;padding:16px}main{max-width:1000px;margin:auto}</style><main class="prose">${html}</main></html>`);
}
assert.equal(assertions,1108,'All expected plotted coordinates must be checked');
result.figures={perLocale:4,svgPerLocale:6,coordinateAssertions:assertions,astroAndTsxParse:true,scope:'Every coverage interval, bootstrap stem, null/alternative bar, repeated-look line/marker, accessible IDs and descriptions; no browser measurements.'};
const output=JSON.stringify(result,null,2)+'\n';if(process.argv.includes('--write'))fs.writeFileSync(path.join(root,report,'verification.json'),output);else assert.equal(read(`${report}/verification.json`),output);console.log(output);
