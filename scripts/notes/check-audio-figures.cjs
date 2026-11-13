#!/usr/bin/env node
// Original scoped verification authored for this project with Codex assistance.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..');
const ts=require(path.join(root,'node_modules/typescript'));
const katex=require(path.join(root,'node_modules/katex'));
const dir=path.join(root,'src/components/figures/audio-generation');
function load(file,capture='',lang='en'){
 const text=fs.readFileSync(file,'utf8');let source=file.endsWith('.astro')?text.split('---')[1]:text;
 if(capture)source+='\nexports.checked='+capture+';';
 const sandbox={exports:{},Astro:{url:new URL('https://fpakhurov.com/'+(lang==='ru'?'ru/':'')+'notes/generative-models/audio-generation')},URL};
 sandbox.require=p=>{if(p.endsWith('.astro'))return{default:()=>{}};let dest=path.resolve(path.dirname(file),p);if(!path.extname(dest))dest+='.ts';return load(dest,'',lang)};
 vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,sandbox,{filename:file,timeout:5000});return sandbox.exports;
}
const plain=x=>JSON.parse(JSON.stringify(x));
const near=(a,b,tol=1e-10)=>assert.ok(Math.abs(a-b)<tol,`${a} differs from ${b}`);
const numeric=JSON.parse(fs.readFileSync(path.join(root,'docs/reports/2026-11-13-licensed-example-renewal/audio-numerical-checks.json'),'utf8'));
(async()=>{
 const {transform}=await import(path.join(root,'node_modules/@astrojs/compiler/dist/node/index.js'));
 const figureResults=[];
 for(const lang of ['en','ru']){
  const f=load(path.join(dir,'ResidualVQ.astro'),'{N,SEED,M,STAGES,TRACK,data,inputs,books,errs,track,zhat,quoted}',lang).checked;
  assert.deepEqual([f.N,f.SEED,f.M,f.STAGES,f.TRACK],[160,2,4,3,97]);
  const squared=(p,q)=>p.reduce((a,v,i)=>a+(v-q[i])**2,0);
  for(let s=0;s<3;s++){
   let err=0;const groups=Array.from({length:4},()=>[]);
   for(let n=0;n<160;n++){
    const p=f.inputs[s][n], distances=f.books[s].map(c=>squared(p,c));
    const selected=distances.indexOf(Math.min(...distances));groups[selected].push(p);
    for(let j=0;j<2;j++)near(f.inputs[s+1][n][j],p[j]-f.books[s][selected][j]);
    err+=squared(f.inputs[s+1][n],[0,0]);
   }
   near(err/320,f.errs[s+1]);
   for(let k=0;k<4;k++)for(let j=0;j<2;j++)near(f.books[s][k][j],groups[k].reduce((a,p)=>a+p[j],0)/groups[k].length);
  }
  for(let j=0;j<2;j++)near(f.zhat[j],f.data[f.TRACK][j]-f.inputs[3][f.TRACK][j]);
  const p=load(path.join(dir,'CodebookPatterns.astro'),'{tokens,schedule,counts}',lang).checked;
  assert.deepEqual(plain(p.tokens),numeric.patterns.tokens);
  assert.deepEqual(plain(p.schedule.map(row=>row.map(cell=>cell?.value??null))),numeric.patterns.schedule);
  assert.deepEqual(plain(p.counts),{flattening:15,parallel:5,coarseFirst:10,delay:7});
  for(let t=0;t<5;t++)for(let k=0;k<3;k++)assert.equal(p.schedule[t+k][k].frame,t+1);
  figureResults.push({lang,quoted:plain(f.quoted),msePerCoordinate:plain(f.errs),trackedStages:plain(f.track),reconstruction:plain(f.zhat)});
 }
 const closure=new Set();
 function dependencies(file){
  if(closure.has(file))return;closure.add(file);
  for(const match of fs.readFileSync(file,'utf8').matchAll(/(?:from|import)\s+['"]([^'"]+)['"]/g)){
   if(!match[1].startsWith('.'))continue;
   let dest=path.resolve(path.dirname(file),match[1]);if(!path.extname(dest))dest+='.ts';dependencies(dest);
  }
 }
 for(const name of ['ResidualVQ','CodebookPatterns'])dependencies(path.join(dir,name+'.astro'));
 for(const file of closure)if(file.endsWith('.astro')){
  const result=await transform(fs.readFileSync(file,'utf8'),{filename:file});assert.equal(result.diagnostics.filter(x=>x.severity===1).length,0);
 }
 const {compile}=await import('@mdx-js/mdx');const {default:remarkMath}=await import('remark-math');const {default:rehypeKatex}=await import('rehype-katex');
 const normalized=[],counts=[];
 for(const locale of ['notes','notes-ru']){
  const body=fs.readFileSync(path.join(root,'src/content',locale,'generative-models/audio-generation.mdx'),'utf8');
  assert.ok(!/[\u0000-\u0008\u000B\u000C\u000E-\u001F\t]/.test(body));
  await compile(body.replace(/^---[\s\S]*?---\s*/,''),{remarkPlugins:[remarkMath],rehypePlugins:[[rehypeKatex,{throwOnError:true,strict:'error'}]]});
  const maths=[...body.matchAll(/\$\$([\s\S]*?)\$\$|(?<!\\)\$([^\n$]+?)\$/g)].map(m=>m[1]||m[2]);
  for(const math of maths)katex.renderToString(math,{throwOnError:true,strict:'error',displayMode:true});
  normalized.push(maths.map(x=>x.replace(/\\text\{(?:bits per second|бит в секунду)\}/g,'UNIT_RATE').replace(/\\text\{(?:bit per frame|бит на кадр)\}/g,'UNIT_FRAME').replace(/\s+/g,'')).sort());counts.push(maths.length);
  assert.ok(!/musicgen-small|GTZAN|2\^\{80\}/.test(body));
 }
 assert.deepEqual(normalized[0],normalized[1]);
 const result={mathSpansPerLocale:counts,mathParity:'Identical after whitespace and translated unit names',closure:[...closure].map(f=>path.relative(root,f)).sort(),figures:figureResults,checks:'All 480 nearest-residual decisions and fitted centroids; tracked vector; summed reconstruction; all 15 schedule values and frame indices; strict MDX and KaTeX'};
 const dest=path.join(root,'docs/reports/2026-11-13-licensed-example-renewal/audio-figure-checks.json');
 if(process.argv.includes('--write'))fs.writeFileSync(dest,JSON.stringify(result,null,2)+'\n');else assert.deepEqual(JSON.parse(fs.readFileSync(dest,'utf8')),result);
 console.log('Audio figures passed: '+counts.join('/')+' math spans; local RVQ arithmetic, delayed tokens and '+closure.size+' import-closure files.');
})().catch(err=>{console.error(err);process.exitCode=1});
