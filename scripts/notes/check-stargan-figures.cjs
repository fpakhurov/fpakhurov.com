#!/usr/bin/env node
// Original scoped verification authored for this project with Codex assistance.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..');
const ts=require(path.join(root,'node_modules/typescript'));
const katex=require(path.join(root,'node_modules/katex'));
const dir=path.join(root,'src/components/figures/stargan');
function load(file,capture='',lang='en'){
 const text=fs.readFileSync(file,'utf8');let source=file.endsWith('.astro')?text.split('---')[1]:text;
 if(capture)source+='\nexports.checked='+capture+';';
 const sandbox={exports:{},Astro:{url:new URL('https://fpakhurov.com/'+(lang==='ru'?'ru/':'')+'notes/generative-models/stargan')},URL};
 sandbox.require=p=>{if(p.endsWith('.astro'))return{default:()=>{}};let dest=path.resolve(path.dirname(file),p);if(!path.extname(dest))dest+='.ts';return load(dest,'',lang)};
 vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,sandbox,{filename:file,timeout:5000});return sandbox.exports;
}
const plain=x=>JSON.parse(JSON.stringify(x));
const figures=['StarGanFlow','StarGanV2Flow'];
const dependencies=['seqflow/Arrow.astro','seqflow/Box.astro','seqflow/Badge.astro','seqflow/Op.astro','seqflow/Vec.astro','seqflow/NewMark.astro','seqflow/Stepper.astro','generative-modeling/Sub.astro','Figure.astro'];
(async()=>{
 const {transform}=await import(path.join(root,'node_modules/@astrojs/compiler/dist/node/index.js'));
 for(const lang of ['en','ru']){
  const v1=load(path.join(dir,'StarGanFlow.astro'),'{cOrig,cTrg,inCh,t}',lang).checked;
  assert.deepEqual(plain(v1.cTrg),[1,0,1,0]);assert.deepEqual(plain(v1.cOrig),[0,1,0,1]);assert.equal(v1.inCh,7);assert.equal(v1.t.steps.length,4);
  const v2=load(path.join(dir,'StarGanV2Flow.astro'),'{latentDim,styleDim,t,wAda,wCyc,nAda}',lang).checked;
  assert.equal(v2.latentDim,16);assert.equal(v2.styleDim,64);assert.equal(v2.t.steps.length,5);
  for(const [point,center] of [[v2.wAda,[200,151]],[v2.wCyc,[200,273]],[v2.nAda,[120,143]]]) assert.ok(Math.abs(Math.hypot(point[0]-center[0],point[1]-center[1])-15)<.08);
 }
 for(const file of [...figures.map(x=>path.join(dir,x+'.astro')),...dependencies.map(x=>path.join(root,'src/components/figures',x))]){
  const result=await transform(fs.readFileSync(file,'utf8'),{filename:file});assert.equal(result.diagnostics.filter(x=>x.severity===1).length,0);
 }
 const {compile}=await import('@mdx-js/mdx');const {default:remarkMath}=await import('remark-math');const {default:rehypeKatex}=await import('rehype-katex');
 const bodies=['notes','notes-ru'].map(p=>fs.readFileSync(path.join(root,'src/content',p,'generative-models/stargan.mdx'),'utf8'));
 const normalized=[],counts=[];
 for(const body of bodies){
  assert.ok(!/[\u0000-\u0008\u000B\u000C\u000E-\u001F\t]/.test(body));
  await compile(body.replace(/^---[\s\S]*?---\s*/,''),{remarkPlugins:[remarkMath],rehypePlugins:[[rehypeKatex,{throwOnError:true,strict:'error'}]]});
  const maths=[...body.matchAll(/\$\$([\s\S]*?)\$\$|(?<!\\)\$([^\n$]+?)\$/g)].map(m=>m[1]||m[2]);
  for(const math of maths)katex.renderToString(math,{throwOnError:true,strict:'error',displayMode:true});
  normalized.push(maths.map(x=>x.replaceAll('счастливое','happy').replace(/\s+/g,' ').trim()).sort());counts.push(maths.length);
  assert.ok(body.includes('/licenses/stargan-v2-paper.txt'));
  assert.ok(!body.includes('02_hw_StarGAN.ipynb'));
 }
 assert.deepEqual(normalized[0],normalized[1]);
 const result={figures,figureCount:2,astroDependenciesCompiled:dependencies.length,mathSpansPerLocale:counts,mathParity:'exact multiset after whitespace normalization',v1:{syntheticAttributes:4,inputChannels:7,steps:4},v2:{latentDimension:16,styleDimension:64,steps:5,scope:'method schematic; no generated photographs or trained network outputs'},licenseNotice:'public/licenses/stargan-v2-paper.txt'};
 const dest=path.join(root,'docs/reports/2026-11-13-licensed-example-renewal/stargan-figure-checks.json');
 if(process.argv.includes('--write'))fs.writeFileSync(dest,JSON.stringify(result,null,2)+'\n');else assert.deepEqual(JSON.parse(fs.readFileSync(dest,'utf8')),result);
 console.log('StarGAN figures passed: bilingual data flow, Astro and strict MDX/KaTeX, math parity and scoped notice links.');
})().catch(err=>{console.error(err);process.exitCode=1});
