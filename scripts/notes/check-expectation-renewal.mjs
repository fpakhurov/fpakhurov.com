// Scoped original check; run from the FP repository, optional draft root argument.
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
const require = createRequire(path.resolve('package.json'));
const load = name => import(require.resolve(name));
const {compile} = await load('@mdx-js/mdx');
const {default: remarkMath} = await load('remark-math');
const {default: rehypeKatex} = await load('rehype-katex');
const {default: katex} = await load('katex');
const {transform} = await load('@astrojs/compiler-rs');
const {experimental_AstroContainer: AstroContainer} = await load('astro/container');
const {default: ts} = await load('typescript');
const root=path.resolve(process.argv[2] || '.');
const read=p=>fs.readFile(path.join(root,p),'utf8');
const helper='src/plugins/remark-heading-ids.mjs';
assert.equal(await read(helper),await fs.readFile(path.resolve(helper),'utf8'));
const {default: remarkHeadingIds}=await import(pathToFileURL(path.resolve(helper)));
const base='docs/reports/2026-11-14-probability-foundations-renewal/';
const replay=execFileSync('python3',['-B',path.join(root,'scripts/notes/expectation-renewal.py')],{encoding:'utf8'});
assert.equal(replay,await read(base+'expectation-results.json'));
const exact=JSON.parse(replay);
const ids=['expectation','linearity','the-expectation-of-a-function','variance','moment-and-characteristic-functions','what-changed','limitations','what-you-should-remember','code','next','references'];
const pair=[];
const math=s=>[...s.matchAll(/\$\$([\s\S]*?)\$\$|(?<!\$)\$(?!\$)([^$\n]+?)\$(?!\$)/g)].map(m=>({tex:m[1]??m[2],display:!!m[1]}));
const result={scope:'Exact finite enumeration, bilingual strict MDX and actual standalone Astro rendering; no browser, full build, CI or production claim.',notes:[],figures:[]};
for(const folder of ['notes','notes-ru']){
 const raw=await read(`src/content/${folder}/probability/expectation-and-variance.mdx`);
 assert(!/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(raw));
 assert(raw.split('\n').every(l=>!l.includes('$$')||l.trim()==='$$'));
 const source=raw.replace(/^---\n[\s\S]*?\n---\n/,'');
 const formulas=math(source);pair.push(formulas.map(x=>x.tex));
 for(const x of formulas)katex.renderToString(x.tex,{displayMode:x.display,throwOnError:true,strict:'error'});
 const code=[...source.matchAll(/```python\n([\s\S]*?)```/g)],stdout=[...source.matchAll(/```text\n([\s\S]*?)```/g)];
 assert.equal(code.length,1);assert.equal(stdout.length,1);
 assert.equal(execFileSync('python3',['-B','-c',code[0][1]],{encoding:'utf8'}),stdout[0][1]);
 const actualIds=[];let displays=0,codeNodes=0;
 const inspect=()=>tree=>{const visit=n=>{if(n.type==='heading')actualIds.push(n.data?.hProperties?.id);if(n.type==='math')displays++;if(n.type==='code')codeNodes++;for(const c of n.children||[])visit(c)};visit(tree)};
 await compile(source,{remarkPlugins:[remarkMath,remarkHeadingIds,inspect],rehypePlugins:[[rehypeKatex,{strict:'error',throwOnError:true}]]});
 assert.deepEqual(actualIds,ids);assert.equal(displays,formulas.filter(x=>x.display).length);assert.equal(codeNodes,2);
 assert(!/100_000|1_000_000|Secret Santa|Тайный Санта|14\.7|1\.6487|0\.0095|np\.random|standard_cauchy/.test(source));
 result.notes.push({locale:folder==='notes'?'en':'ru',mathSpans:formulas.length,displayMath:displays,headingIds:actualIds,inlineReplay:'Exact stdout'});
}
assert.deepEqual(pair[0],pair[1]);
const scratch=await fs.mkdtemp(path.join(os.tmpdir(),'expectation-astro-'));
const cache=new Map();
try{
 async function moduleFile(file){
  if(cache.has(file))return cache.get(file);
  const target=path.join(scratch,`${cache.size}.mjs`);cache.set(file,target);
  let code=await fs.readFile(file,'utf8');
  if(file.endsWith('.astro')){
   const compiled=transform(code,{filename:file,internalURL:'astro/compiler-runtime',resultScopedSlot:true});
   assert(!compiled.diagnostics.some(d=>d.severity==='error'));
   code=compiled.code.replace(/createMetadata as \$\$createMetadata,?/g,'').replace(/export const \$\$metadata = [\s\S]*?\n(?=const \$\$Astro)/,'').replace(/^import\s+['"][^'"]+\?astro&type=style[^'"]*['"];?\s*$/gm,'');
  }
  for(const m of [...code.matchAll(/from\s+(['"])([^'"]+)\1/g)]){
   let url;
   if(m[2].startsWith('.')){let next=path.resolve(path.dirname(file),m[2]);if(!path.extname(next))next+='.ts';url=pathToFileURL(await moduleFile(next)).href;}
   else url=pathToFileURL(require.resolve(m[2])).href;
   code=code.replaceAll(`${m[1]}${m[2]}${m[1]}`,JSON.stringify(url));
  }
  await fs.writeFile(target,ts.transpileModule(code,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText);return target;
 }
 const container=await AstroContainer.create();
 for(const [name,id] of [['MeanMedianMode','mean-median-mode'],['CouponCollector','coupon-collector']]){
  const component=(await import(pathToFileURL(await moduleFile(path.join(root,`src/components/figures/expectation-and-variance/${name}.astro`))))).default;
  for(const loc of ['en','ru']){
   const html=await container.renderToString(component,{request:new Request(`https://fpakhurov.com/${loc==='ru'?'ru/':''}notes/probability/expectation-and-variance`)});
   assert(!/NaN|undefined/.test(html));assert(html.includes(`id="fig-${id}"`));
   const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size);
   const visible=html.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
   const clean=s=>s.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
   if(name==='MeanMedianMode'){
    for(const [x,p] of Object.entries(exact.pmf)){
     const group=html.match(new RegExp(`<g[^>]*data-cost="${x}"[^>]*>([\\s\\S]*?)</g>`));assert(group);
     assert.equal(clean(group[1]),`${p} ${x}`);
     const [num,den]=p.split('/').map(Number),prob=num/(den||1);
     const cy=Number(group[1].match(/cy="([^"]+)"/)[1]);assert.equal(cy,180-200*prob);
    }
    assert(visible.includes('μ = 2.75'));assert(visible.includes(loc==='ru'?'медиана = мода = 2':'median = mode = 2'));
   }else{
    for(let i=0;i<3;i++){
     const section=html.match(new RegExp(`<li[^>]*data-retry-stage="${i+1}"[^>]*>([\\s\\S]*?)</li>`));assert(section);const v=clean(section[1]);
     assert(v.includes(`${loc==='ru'?'Успех':'Success'}: ${exact.retry_probabilities[i]}`),v);
     assert(v.includes(`] = ${exact.stage_expected_attempts[i]}`),v);
    }
    assert(visible.includes('41/6 ≈ 6.833'));
   }
   result.figures.push({name,locale:loc,render:'Actual Astro component; each displayed row compared to exact Python fixture'});
  }
 }
 result.closure=[...cache.keys()].map(f=>path.relative(root,f)).sort();
}finally{await fs.rm(scratch,{recursive:true,force:true})}
await fs.writeFile(path.join(root,base+'expectation-verification.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
