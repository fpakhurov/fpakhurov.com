#!/usr/bin/env node
// Original scoped verification authored for this project with Codex assistance.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..');
const ts=require(path.join(root,'node_modules/typescript'));
const katex=require(path.join(root,'node_modules/katex'));
const dir=path.join(root,'src/components/figures/drag-editing');
function load(file,capture='',lang='en'){
 const text=fs.readFileSync(file,'utf8');let source=file.endsWith('.astro')?text.split('---')[1]:text;
 if(capture)source+='\nexports.checked='+capture+';';
 const sandbox={exports:{},Astro:{url:new URL('https://fpakhurov.com/'+(lang==='ru'?'ru/':'')+'notes/generative-models/drag-editing')},URL};
 sandbox.require=p=>{if(p.endsWith('.astro'))return{default:()=>{}};let dest=path.resolve(path.dirname(file),p);if(!path.extname(dest))dest+='.ts';return load(dest,'',lang)};
 vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,sandbox,{filename:file,timeout:5000});return sandbox.exports;
}
const plain=x=>JSON.parse(JSON.stringify(x));
const near=(a,b,tol=1e-10)=>assert.ok(Math.abs(a-b)<tol,`${a} differs from ${b}`);
const numeric=JSON.parse(fs.readFileSync(path.join(root,'docs/reports/2026-11-13-licensed-example-renewal/drag-numerical-checks.json'),'utf8'));
(async()=>{
 const {transform}=await import(path.join(root,'node_modules/@astrojs/compiler/dist/node/index.js'));
 const toy=load(path.join(dir,'toy.ts'));
 for(const [actual,expected] of [[toy.runDrag(true),numeric.history],[toy.runDrag(false,13),numeric.withoutStopGradient]]){
  assert.equal(actual.length,expected.length);
  actual.forEach((row,i)=>{assert.equal(row.k,expected[i].k);assert.deepEqual(plain(row.p),expected[i].p);row.s.forEach((v,j)=>near(v,expected[i].s[j]));});
 }
 assert.deepEqual(plain(toy.msGrad(toy.GOAL,[0,0],true)),{g:[0,0],loss:0,d:[0,0]});
 for(const check of numeric.finiteDifferences){const actual=toy.msGrad(check.point,check.translation,check.stopGradient);actual.g.forEach((v,j)=>near(v,check.analytic[j]));}
 for(const lang of ['en','ru']){
  load(path.join(dir,'DragToy.astro'),'checks',lang);
  const schematic=load(path.join(dir,'DragGanIteration.astro'),'{omega1,D,P2}',lang).checked;
  assert.equal(schematic.omega1.length,9);assert.deepEqual(plain(schematic.D),[.8,.6]);
  const attention=load(path.join(dir,'DragDiffusionFlow.astro'),'{keys,values,rows}',lang).checked;
  assert.deepEqual(plain(attention.keys),numeric.attention.keys);assert.deepEqual(plain(attention.values),numeric.attention.values);
  attention.rows.forEach((r,i)=>{r.weights.forEach((v,j)=>near(v,numeric.attention.weights[i][j]));r.output.forEach((v,j)=>near(v,numeric.attention.outputs[i][j]));});
 }
 const closure=new Set();
 function dependencies(file){
  if(closure.has(file))return;closure.add(file);
  for(const match of fs.readFileSync(file,'utf8').matchAll(/(?:from|import)\s+['"]([^'"]+)['"]/g)){
   if(!match[1].startsWith('.'))continue;
   let dest=path.resolve(path.dirname(file),match[1]);if(!path.extname(dest))dest+='.ts';dependencies(dest);
  }
 }
 for(const name of ['DragToy','DragGanIteration','DragDiffusionFlow'])dependencies(path.join(dir,name+'.astro'));
 for(const file of closure)if(file.endsWith('.astro')){
  const result=await transform(fs.readFileSync(file,'utf8'),{filename:file});assert.equal(result.diagnostics.filter(x=>x.severity===1).length,0);
 }
 const {compile}=await import('@mdx-js/mdx');const {default:remarkMath}=await import('remark-math');const {default:rehypeKatex}=await import('rehype-katex');
 const normalized=[],counts=[];
 for(const locale of ['notes','notes-ru']){
  const body=fs.readFileSync(path.join(root,'src/content',locale,'generative-models/drag-editing.mdx'),'utf8');
  assert.ok(!/[\u0000-\u0008\u000B\u000C\u000E-\u001F\t]/.test(body));
  await compile(body.replace(/^---[\s\S]*?---\s*/,''),{remarkPlugins:[remarkMath],rehypePlugins:[[rehypeKatex,{throwOnError:true,strict:'error'}]]});
  const maths=[...body.matchAll(/\$\$([\s\S]*?)\$\$|(?<!\\)\$([^\n$]+?)\$/g)].map(m=>m[1]||m[2]);
  for(const math of maths)katex.renderToString(math,{throwOnError:true,strict:'error',displayMode:true});
  normalized.push(maths.map(x=>x.replace('16{,}384','16\\,384').replace(/\s+/g,'')).sort());counts.push(maths.length);
  assert.ok(!/draggan\.ipynb|128\s*×\s*128/.test(body));
 }
 assert.deepEqual(normalized[0],normalized[1]);
 const result={mathSpansPerLocale:counts,mathParity:'Equivalent after whitespace and thousands separator',closure:[...closure].map(f=>path.relative(root,f)).sort(),checks:'Both complete TypeScript trajectories match Python; six gradient vectors; at-goal finite convention; schematic disc/direction; both attention mixtures; strict MDX and KaTeX'};
 const dest=path.join(root,'docs/reports/2026-11-13-licensed-example-renewal/drag-figure-checks.json');
 if(process.argv.includes('--write'))fs.writeFileSync(dest,JSON.stringify(result,null,2)+'\n');else assert.deepEqual(JSON.parse(fs.readFileSync(dest,'utf8')),result);
 console.log('Drag figures passed: '+counts.join('/')+' math spans and '+closure.size+' import-closure files.');
})().catch(err=>{console.error(err);process.exitCode=1});
