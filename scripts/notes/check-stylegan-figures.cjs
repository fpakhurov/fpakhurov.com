#!/usr/bin/env node
// Original scoped verification authored for this project with Codex assistance.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..');
const ts=require(path.join(root,'node_modules/typescript'));
const katex=require(path.join(root,'node_modules/katex'));
const dir=path.join(root,'src/components/figures/stylegan');
function load(file,capture='',lang='en'){
 const text=fs.readFileSync(file,'utf8');let source=file.endsWith('.astro')?text.split('---')[1]:text;
 if(capture)source+='\nexports.checked='+capture+';';
 const sandbox={exports:{},Astro:{url:new URL('https://fpakhurov.com/'+(lang==='ru'?'ru/':'')+'notes/generative-models/stylegan')},URL};
 sandbox.require=p=>{if(p.endsWith('.astro'))return{default:()=>{}};let dest=path.resolve(path.dirname(file),p);if(!path.extname(dest))dest+='.ts';return load(dest,'',lang)};
 vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,sandbox,{filename:file,timeout:5000});return sandbox.exports;
}
const plain=x=>JSON.parse(JSON.stringify(x));
const near=(a,b,tol=1e-10)=>assert.ok(Math.abs(a-b)<tol,`${a} differs from ${b}`);
const numeric=JSON.parse(fs.readFileSync(path.join(root,'docs/reports/2026-11-13-licensed-example-renewal/stylegan-numerical-checks.json'),'utf8'));
(async()=>{
 const {transform}=await import(path.join(root,'node_modules/@astrojs/compiler/dist/node/index.js'));
 const actual=load(path.join(dir,'styleCases.ts'));
 actual.cases.forEach((r,i)=>{for(const key of ['mean','std','scale','shift','noiseScale'])near(r[key],numeric.styleCases[i][key]);for(const key of ['input','output'])r[key].forEach((v,j)=>near(v,numeric.styleCases[i][key][j]));});
 for(const lang of ['en','ru']){
  const mod=load(path.join(dir,'Demodulation.astro'),'{samples,checks}',lang).checked;
  mod.samples.forEach((r,i)=>{for(const key of ['mod','dem','smooth','sigma'])r[key].forEach((v,j)=>near(v,numeric.convolutionFigure.samples[i][key][j]));});
  load(path.join(dir,'StyleFlow.astro'),'t',lang);
 }
 const closure=new Set();
 function dependencies(file){
  if(closure.has(file))return;closure.add(file);
  for(const match of fs.readFileSync(file,'utf8').matchAll(/(?:from|import)\s+['"]([^'"]+)['"]/g)){
   if(!match[1].startsWith('.'))continue;
   let dest=path.resolve(path.dirname(file),match[1]);if(!path.extname(dest))dest+='.ts';dependencies(dest);
  }
 }
 for(const name of ['StyleFlow','Demodulation'])dependencies(path.join(dir,name+'.astro'));
 for(const file of closure)if(file.endsWith('.astro')){
  const result=await transform(fs.readFileSync(file,'utf8'),{filename:file});assert.equal(result.diagnostics.filter(x=>x.severity===1).length,0);
 }
 const {compile}=await import('@mdx-js/mdx');const {default:remarkMath}=await import('remark-math');const {default:rehypeKatex}=await import('rehype-katex');
 const normalized=[],counts=[],headings=[];
 for(const locale of ['notes','notes-ru']){
  const body=fs.readFileSync(path.join(root,'src/content',locale,'generative-models/stylegan.mdx'),'utf8');
  assert.ok(!/[\u0000-\u0008\u000B\u000C\u000E-\u001F\t]/.test(body));
  await compile(body.replace(/^---[\s\S]*?---\s*/,''),{remarkPlugins:[remarkMath],rehypePlugins:[[rehypeKatex,{throwOnError:true,strict:'error'}]]});
  const maths=[...body.matchAll(/\$\$([\s\S]*?)\$\$|(?<!\\)\$([^\n$]+?)\$/g)].map(m=>m[1]||m[2]);
  for(const math of maths)katex.renderToString(math,{throwOnError:true,strict:'error',displayMode:true});
  normalized.push(maths.map(x=>x.replace(/\s+/g,'')).sort());counts.push(maths.length);
  assert.ok(!/04_Lecture_StyleGAN|Oppenheim|long-haired men|длинноволосых мужчин/.test(body));
  const old=require('node:child_process').execFileSync('git',['show',`HEAD:src/content/${locale}/generative-models/stylegan.mdx`],{cwd:root,encoding:'utf8'});
  const hs=t=>t.match(/^#{2,3} .+$/gm);assert.deepEqual(hs(body),hs(old));headings.push(hs(body).length);
 }
 if(JSON.stringify(normalized[0])!==JSON.stringify(normalized[1])){
  console.error('EN-only',normalized[0].filter(x=>!normalized[1].includes(x)),'RU-only',normalized[1].filter(x=>!normalized[0].includes(x)));
 }
 assert.deepEqual(normalized[0],normalized[1]);
 const result={mathSpansPerLocale:counts,mathParity:'Identical modulo whitespace',preservedHeadingCounts:headings,closure:[...closure].map(f=>path.relative(root,f)).sort(),checks:'Every output of the six-style eight-channel convolution agrees with an independent NumPy implementation; exact four-position moments; strict MDX/KaTeX; all existing section headings preserved.'};
 const dest=path.join(root,'docs/reports/2026-11-13-licensed-example-renewal/stylegan-figure-checks.json');
 if(process.argv.includes('--write'))fs.writeFileSync(dest,JSON.stringify(result,null,2)+'\n');else assert.deepEqual(JSON.parse(fs.readFileSync(dest,'utf8')),result);
 console.log('StyleGAN figures passed: '+counts.join('/')+' math spans and '+closure.size+' import-closure files.');
})().catch(err=>{console.error(err);process.exitCode=1});
