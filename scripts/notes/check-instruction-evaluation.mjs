// Scoped author checks. Run from an installed FP checkout, with the outside draft as argument.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
const root=path.resolve(process.argv[2]);const host=process.cwd();assert.notEqual(root,host);
const require=createRequire(path.join(host,'package.json'));
const {compile}=await import(require.resolve('@mdx-js/mdx'));
const {default:remarkMath}=await import(require.resolve('remark-math'));
const {default:remarkGfm}=await import(require.resolve('remark-gfm'));
const {default:rehypeKatex}=await import(require.resolve('rehype-katex'));
const {rehypeHeadingIds}=await import(require.resolve('@astrojs/markdown-remark'));
const {transform}=await import(require.resolve('@astrojs/compiler-rs'));
const {convertToTSX}=await import(require.resolve('@astrojs/compiler'));
const ts=require('typescript');const yaml=require('yaml');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const report='docs/reports/2026-11-16-nlp-instruction-evaluation/';
const metadata=JSON.parse(read(report+'curriculum.json'));
const topics={'instruction-tuning':['AssistantMask','LossWeighting','RewardTilt','PreferenceShift'],'llm-evaluation':['StratumRates','PairedSigns','JudgeOrder','LatencyTail']};
const helper='src/plugins/remark-heading-ids.mjs';assert.equal(read(helper),fs.readFileSync(path.join(host,helper),'utf8'));
const {default:headingIds}=await import(pathToFileURL(path.join(host,helper)));
const saved=read(report+'results.json');
assert.equal(execFileSync('python3',['-B',path.join(root,'scripts/notes/instruction-evaluation-cases.py')],{encoding:'utf8'}),saved);
const data=JSON.parse(saved);
assert.deepEqual(JSON.parse(read('src/components/figures/instruction-tuning/cases.json')),data.instruction);
assert.deepEqual(JSON.parse(read('src/components/figures/llm-evaluation/cases.json')),data.evaluation);
const held=new Set(JSON.parse(fs.readFileSync(path.join(host,'src/data/withdrawnNotes.json'),'utf8')));
for(const slug of Object.keys(topics))held.delete('nlp/'+slug);
const output={topics:{},exactSavedReplay:true,fixtureSha256:sha(saved),finiteRewardGridVectors:data.instruction.grid_identity_checks,pairedSignAssignments:data.evaluation.paired.assignments,scope:'Strict MDX/KaTeX, metadata/IDs, bilingual math, exact stdlib replay, Astro transform and TypeScript TSX parse; optional actual scoped Astro SVG rendering. No browser/full build/CI/publication claim.'};
const closure=new Set();
function deps(p){if(closure.has(p))return;closure.add(p);if(p.endsWith('.json'))return;for(const m of read(p).matchAll(/(?:from|import)\s+['"]([^'"]+)['"]/g)){if(!m[1].startsWith('.'))continue;let d=path.normalize(path.join(path.dirname(p),m[1]));if(!path.extname(d))d+='.ts';deps(d);}}
for(const [slug,names] of Object.entries(topics)){
 const pairs=[];
 for(const [locale,folder] of [['en','notes'],['ru','notes-ru']]){
  const file=`src/content/${folder}/nlp/${slug}.mdx`;const full=read(file);const front=yaml.parse(full.match(/^---\n([\s\S]*?)\n---\n/)[1]);
  for(const [key,val] of Object.entries(metadata.files[file].metadata))assert.deepEqual(front[key],val,key);
  assert(full.split('\n').every(line=>!/[ \t]+$/.test(line)), 'Trailing whitespace '+file);
  const source=full.replace(/^---\n[\s\S]*?\n---\n/,'');
  assert(!source.includes('\\qquad'));assert(source.split('\n').every(l=>!l.includes('$$')||l.trim()==='$$'));
  const math=[...source.matchAll(/\$\$([\s\S]*?)\$\$|(?<!\$)\$(?!\$)([^$\n]+)\$(?!\$)/g)].map(m=>m[1]??m[2]);
  const ids=[];let parsed=0,displays=0,tables=0;
  const mathVisitor=()=>tree=>{function walk(n){if(['math','inlineMath'].includes(n.type)){parsed++;if(n.type==='math')displays++;assert(!n.value.includes('\n\n'));}for(const c of n.children||[])walk(c);}walk(tree);};
  const htmlVisitor=()=>tree=>{function walk(n){if(/^h[1-6]$/.test(n.tagName||''))ids.push(n.properties?.id);if(n.tagName==='table')tables++;for(const c of n.children||[])walk(c);}walk(tree);};
  const compiled=await compile(source,{remarkPlugins:[remarkGfm,remarkMath,headingIds,mathVisitor],rehypePlugins:[[rehypeKatex,{throwOnError:true,strict:'error'}],rehypeHeadingIds,htmlVisitor]});
  assert.equal(compiled.messages.length,0);assert.equal(parsed,math.length);assert.deepEqual(ids,metadata.files[file].headings.map(h=>h.id));assert.equal(ids.length,new Set(ids).size);
  for(const m of source.matchAll(/\]\(([^)]+)\)/g)){
   if(m[1].startsWith('#')){assert(ids.includes(m[1].slice(1)));continue;}
   const url=new URL(m[1],'https://fpakhurov.com');if(url.hostname!=='fpakhurov.com'||!url.pathname.replace(/^\/ru/,'').startsWith('/notes/'))continue;
   const slug=url.pathname.replace(/^\/ru/,'').slice(7);assert(!held.has(slug),'Active held target '+slug);
   const local='src/content/notes/'+slug+'.mdx';const target=fs.existsSync(path.join(root,local))?read(local):fs.readFileSync(path.join(host,local),'utf8');
   if(url.hash)assert(target.replaceAll('\\', '').includes('{#'+url.hash.slice(1)+'}'),'Missing linked anchor '+url.href);
  }
  pairs.push({math,ids});(output.topics[slug]??=[]).push({locale,mathSpans:parsed,displayMath:displays,headings:ids.length,tables,figures:names.length});
 }
 assert.deepEqual(pairs[0],pairs[1]);for(const name of names)deps(`src/components/figures/${slug}/${name}.astro`);
}
output.astroSyntax=[];
for(const p of closure)if(p.endsWith('.astro')){
 const result=await transform(read(p),{filename:path.join(root,p),internalURL:'astro/compiler-runtime'});
 assert.equal(result.diagnostics.filter(d=>d.severity==='error').length,0);
 const tsx=await convertToTSX(read(p),{filename:p});
 const parsed=ts.createSourceFile(p+'.tsx',tsx.code,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 assert.deepEqual(parsed.parseDiagnostics.map(d=>ts.flattenDiagnosticMessageText(d.messageText,'\n')),[],p);
 output.astroSyntax.push({file:p,transformDiagnostics:0,tsxParseDiagnostics:0});
}
output.localAssetClosure=[...closure].sort();
const renderArg=process.argv.find(s=>s.startsWith('--render-dir='));
if(renderArg){
 const dir=path.resolve(renderArg.slice(13));assert(!dir.startsWith(host+'/'));fs.mkdirSync(dir,{recursive:true});
 const {build}=await import(require.resolve('esbuild'));const modulePath=path.join(dir,'figures.mjs');
 const entries=Object.entries(topics).flatMap(([slug,names])=>names.map(name=>({slug,name})));
 await build({stdin:{contents:entries.map(({slug,name})=>`export {default as ${name}} from ${JSON.stringify(path.join(root,`src/components/figures/${slug}/${name}.astro`))};`).join('\n'),resolveDir:root,loader:'ts'},bundle:true,platform:'node',format:'esm',outfile:modulePath,logLevel:'silent',plugins:[{name:'scoped-astro',setup(b){
 b.onResolve({filter:/^astro\//},a=>({path:require.resolve(a.path),external:true}));
 b.onLoad({filter:/\.astro$/},async a=>{const result=await transform(fs.readFileSync(a.path,'utf8'),{filename:a.path,internalURL:'astro/compiler-runtime',resultScopedSlot:true});const code=result.code.replace(/createMetadata as \$\$createMetadata,?/g,'').replace(/export const \$\$metadata = [\s\S]*?\n(?=const \$\$Astro)/,'');return {contents:code,loader:'ts',resolveDir:path.dirname(a.path)};});}}]});
 const {experimental_AstroContainer:Container}=await import(require.resolve('astro/container'));
 const components=await import(pathToFileURL(modulePath).href);const container=await Container.create();
 output.actualAstroRendering=[];
 const expected={mask:[0,0,0,1,1],weight:[1/3,2/3,.5,.5],reward:data.instruction.reward.reference.flatMap((q,i)=>[q,data.instruction.reward.optimum[i]]),dpo:data.instruction.dpo.flatMap(r=>[r.policy[1],r.pair_probability]),rate:[data.evaluation.rates.a.groups.nonnegative.rate,data.evaluation.rates.b.groups.nonnegative.rate,0,2/3,2/3,2/3,4/9,2/3],sign:[1,6,15,20,15,6,1],latency:data.evaluation.latency.milliseconds};
 for(const lang of ['en','ru']){
  let html='';for(const {slug,name} of entries)html+=await container.renderToString(components[name],{request:new Request(`https://fpakhurov.com/${lang==='ru'?'ru/':''}notes/nlp/${slug}`)});
  assert.equal((html.match(/<svg\b/g)||[]).length,8);assert(!/NaN|undefined/.test(html));
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size);
  for(const m of html.matchAll(/aria-labelledby="([^"]+)"/g))for(const id of m[1].split(' '))assert(ids.includes(id));
  let numeric=0;const attrs=s=>Object.fromEntries([...s.matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));
  for(const [key,vals] of Object.entries(expected)){
   const elements=[...html.matchAll(new RegExp(`<[^>]+data-case="${key}"[^>]*>`,'g'))].map(m=>attrs(m[0]));assert.equal(elements.length,vals.length,key);
   elements.forEach((a,i)=>{assert(Math.abs(Number(a['data-value'])-vals[i])<1e-12,key);numeric++;if(a.width){const scale={weight:280,reward:360,dpo:255,rate:240,latency:.24}[key];if(scale)assert(Math.abs(Number(a.width)-vals[i]*scale)<1e-10,key);else if(key==='sign')assert.equal(Number(a.height),vals[i]*7);numeric++;}});
  }
  const judges=[...html.matchAll(/<g[^>]+data-case="judge"[^>]*>/g)].map(m=>attrs(m[0]));assert.equal(judges.length,4);judges.forEach((a,i)=>{assert.equal(a['data-ab'],data.evaluation.judge_order[i].order_ab);assert.equal(a['data-ba'],data.evaluation.judge_order[i].order_ba);});
  let geometry=0;
  for(const svg of html.matchAll(/<svg\b([^>]*)>([\s\S]*?)<\/svg>/g)){
   const [, ,w,h]=attrs(svg[1]).viewBox.split(' ').map(Number);
   for(const m of svg[2].matchAll(/<(rect|line|text)\b([^>]*)>/g)){
    const a=attrs(m[2]);for(const k of ['x','y','x1','x2','y1','y2','width','height'])if(a[k]!==undefined){const v=Number(a[k]);assert(Number.isFinite(v)&&v>=0&&v<=(k.startsWith('y')||k==='height'?h:w),`${k}=${v}`);geometry++;}
    if(m[1]==='rect'){assert(Number(a.x)+Number(a.width)<=w);assert(Number(a.y)+Number(a.height)<=h);}
   }
  }
  const css=fs.readFileSync(path.join(host,'src/styles/global.css'),'utf8')+'\n'+[...closure].filter(p=>p.endsWith('.astro')).flatMap(p=>[...read(p).matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m=>m[1])).join('\n');
  fs.writeFileSync(path.join(dir,`instruction-evaluation-${lang}.html`),`<!doctype html><html lang="${lang}"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}\nbody{margin:0;padding:16px}main{max-width:900px;margin:auto}</style><main class="prose">${html}</main></html>`);
  output.actualAstroRendering.push({locale:lang,svg:8,numericAssertions:numeric,geometryAttributes:geometry,judgeIdentityPairs:4,accessibleIds:ids.length});
 }
}
if(process.argv.includes('--write'))fs.writeFileSync(path.join(root,report+'checks.json'),JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify(output,null,2));
