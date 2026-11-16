// Original scoped checks authored for the Fedor Pakhurov project with Codex assistance.
// Run from the installed FP repository. Optional first argument selects a draft root.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const ownRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const root=path.resolve(process.argv.find((s,i)=>i>=2&&!s.startsWith('--'))||ownRoot);
const require=createRequire(path.join(process.cwd(),'package.json'));
const {compile}=await import(require.resolve('@mdx-js/mdx'));
const {default:remarkMath}=await import(require.resolve('remark-math'));
const {default:remarkGfm}=await import(require.resolve('remark-gfm'));
const {default:rehypeKatex}=await import(require.resolve('rehype-katex'));
const {rehypeHeadingIds}=await import(require.resolve('@astrojs/markdown-remark'));
const {transform}=await import(require.resolve('@astrojs/compiler-rs'));
const {default:remarkHeadingIds}=await import(pathToFileURL(path.join(root,'src/plugins/remark-heading-ids.mjs')));
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const hashes={};
const digest=p=>createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex');
const expectedIds=['progan-growing-the-networks','fade-in-of-new-layers','minibatch-standard-deviation','equalized-learning-rate','pixelwise-feature-normalization','sagan-self-attention-for-long-range-structure','why-convolutions-miss-long-range-structure','the-self-attention-block','spectral-normalization-in-both-networks-and-two-learning-rates','the-hinge-loss','biggan-the-same-recipe-at-scale','class-conditioning-conditional-batch-norm-and-projection','a-hierarchical-latent','the-truncation-trick','orthogonal-regularization','where-it-breaks-collapse-at-scale','what-the-scores-hide','what-changed','what-you-should-remember','code','next','where-to-see-the-images','references'];
const normalized=[];let count=0;
for(const locale of ['notes','notes-ru']){
 const p=`src/content/${locale}/generative-models/gan-scaling.mdx`,body=read(p).replace(/^---\n[\s\S]*?\n---\n/,'');
 assert.doesNotMatch(body,/[\x00-\x09\x0B-\x1F]/);
 assert.doesNotMatch(body,/HSE-LAMBDA|CIFAR-10|Comet|6\.02|3\.01 dB/);
 const ids=[];
 const collect=()=>tree=>{function walk(n){if(/^h[1-6]$/.test(n.tagName||''))ids.push(n.properties?.id);for(const c of n.children||[])walk(c);}walk(tree);};
 const mdx=await compile(body,{remarkPlugins:[remarkGfm,remarkMath,remarkHeadingIds],rehypePlugins:[[rehypeKatex,{throwOnError:true,strict:'error'}],rehypeHeadingIds,collect]});
 assert.equal(mdx.messages.length,0,String(mdx.messages));assert.deepEqual(ids,expectedIds);
 const math=[...body.matchAll(/\$\$([\s\S]*?)\$\$|(?<!\\)\$(?!\$)([^\n$]*?)(?<!\\)\$/g)].map(m=>(m[1]??m[2]).replace(/\s+/g,''));
 normalized.push(math);count=math.length;hashes[p]=digest(p);
}
assert.deepEqual(normalized[0],normalized[1]);
const closure=new Set();
function dependencies(p){
 if(closure.has(p))return;closure.add(p);
 if(p.endsWith('.json'))return;
 for(const m of read(p).matchAll(/(?:from|import)\s+['"]([^'"]+)['"]/g)){
  if(!m[1].startsWith('.'))continue;
  let d=path.normalize(path.join(path.dirname(p),m[1]));if(!path.extname(d))d+='.ts';dependencies(d);
 }
}
for(const name of ['SelfAttentionFlow','TruncationCurves'])dependencies(`src/components/figures/gan-scaling/${name}.astro`);
for(const p of closure){
 if(p.endsWith('.astro')){const r=await transform(read(p),{filename:path.join(root,p),internalURL:'astro/compiler-runtime'});assert.equal(r.diagnostics.filter(d=>d.severity==='error').length,0);}
 hashes[p]=digest(p);
}
const py=spawnSync(process.env.PYTHON_BIN||'python3',[path.join(root,'scripts/notes/gan-scaling-cases.py')],{encoding:'utf8',timeout:10000});assert.equal(py.status,0,py.stderr);
const stdoutPath='docs/reports/2026-11-16-generative-renewal/gan-scaling-stdout.txt';
if(process.argv.includes('--write'))fs.writeFileSync(path.join(root,stdoutPath),py.stdout);else assert.equal(py.stdout,read(stdoutPath));
const data=JSON.parse(read('src/components/figures/gan-scaling/cases.json'));
assert.deepEqual(data.basic.fade.map(x=>x.gradient),['0','-1/2','-2']);
assert.deepEqual(data.basic.adam.map(x=>x.effective_step),['-3/68','-6/31']);
assert.equal(data.basic.pixel.mean_square,'12/13');
assert(Math.abs(data.attention.attention_output-1.5)<1e-12);
assert.equal(data.objectives.hinge_d,'11/6');assert.equal(data.objectives.hinge_g,'1/2');
assert.deepEqual(data.objectives.off_gradient,[12,36,24,0]);
assert.equal(data.truncation.grid.length,150);
for(const row of data.truncation.rows){
 const text=`| ${row.tau.toFixed(1)} | ${row.variance.toFixed(6)} | ${row.six_unchanged.toFixed(6)} |`;
 for(const locale of ['notes','notes-ru'])assert(read(`src/content/${locale}/generative-models/gan-scaling.mdx`).includes(text));
}
for(const locale of ['notes','notes-ru']){
 const body=read(`src/content/${locale}/generative-models/gan-scaling.mdx`);
 const pairs=[...body.matchAll(/```python\n([\s\S]*?)```\s*```text\n([\s\S]*?)```/g)];assert.equal(pairs.length,1);
 for(const [,code,expected] of pairs){const run=spawnSync(process.env.PYTHON_BIN||'python3',['-c',code],{encoding:'utf8',timeout:10000});assert.equal(run.status,0,run.stderr);assert.equal(run.stdout,expected);}
}
const result={mathSpansPerLocale:count,headings:expectedIds,closure:[...closure].sort(),exactPythonStdout:true,inlineReplays:2,caseChecks:'Fade-in chain rule; batch covariances; first Adam step; pixel normalization; attention gate; hinge gradients; four projection-law cells; orthogonal gradient; exact scalar spectral examples; normal integration and 150-point truncation grid',limits:'Strict MDX/math, actual Astro compilation and exact fixture replay. Browser/layout/full-site/CI/production validation is separate.'};
const out='docs/reports/2026-11-16-generative-renewal/gan-scaling-checks.json';
if(process.argv.includes('--write'))fs.writeFileSync(path.join(root,out),JSON.stringify(result,null,2)+'\n');else assert.deepEqual(JSON.parse(read(out)),result);
// Optional actual Astro rendering writes only to the explicitly chosen review directory.
const renderDirArg=process.argv.find(s=>s.startsWith('--render-dir='));
if(renderDirArg){
 const dir=path.resolve(renderDirArg.slice('--render-dir='.length));fs.mkdirSync(dir,{recursive:true});
 const {build}=await import(require.resolve('esbuild'));
 const modulePath=path.join(dir,'figures.mjs');
 await build({stdin:{contents:['SelfAttentionFlow','TruncationCurves'].map(n=>`export {default as ${n}} from ${JSON.stringify(path.join(root,`src/components/figures/gan-scaling/${n}.astro`))};`).join('\n'),resolveDir:root,loader:'ts'},bundle:true,platform:'node',format:'esm',outfile:modulePath,logLevel:'silent',plugins:[{
  name:'scoped-astro',setup(b){
   b.onResolve({filter:/^astro\//},args=>({path:require.resolve(args.path),external:true}));
   b.onLoad({filter:/\.astro$/},async args=>{
    // Installed compiler emits legacy metadata absent from Astro 7's runtime.
    // These static figures have no hydration/scripts; omit only that unused metadata.
    const r=await transform(fs.readFileSync(args.path,'utf8'),{filename:args.path,internalURL:'astro/compiler-runtime',resultScopedSlot:true});
    const code=r.code.replace(/createMetadata as \$\$createMetadata,?/g,'').replace(/export const \$\$metadata = [\s\S]*?\n(?=const \$\$Astro)/,'');
    return {contents:code,loader:'ts',resolveDir:path.dirname(args.path)};
   });
  }
 }]});
 const {experimental_AstroContainer:AstroContainer}=await import(require.resolve('astro/container'));
 const components=await import(pathToFileURL(modulePath).href+'?v='+Date.now());
 const container=await AstroContainer.create();const rendered=[];
 for(const lang of ['en','ru']){
  let body='';
  for(const name of ['SelfAttentionFlow','TruncationCurves'])body+=await container.renderToString(components[name],{request:new Request(`https://fpakhurov.com/${lang==='ru'?'ru/':''}notes/generative-models/gan-scaling`)});
  assert.equal((body.match(/<svg\b/g)||[]).length,3);assert.doesNotMatch(body,/NaN|undefined/);
  const ids=[...body.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);
  for(const series of ['variance','six_unchanged','valid_centered','valid_shifted']){
   const line=body.match(new RegExp(`<polyline[^>]*data-series="${series}"[^>]*points="([^"]+)"`));assert(line,series);
   const observed=line[1].split(' ').map(p=>p.split(',').map(Number));assert.equal(observed.length,150);
   observed.forEach((p,i)=>{assert(Math.abs(p[0]-(45+79*data.truncation.grid[i].tau))<1e-9);assert(Math.abs(p[1]-(190-154*data.truncation.grid[i][series]))<1e-9);});
  }
  const gate=body.match(/<polyline[^>]*data-series="gate"[^>]*points="([^"]+)"/);assert(gate);
  const gatePoints=gate[1].split(' ').map(p=>p.split(',').map(Number));assert.equal(gatePoints.length,31);
  gatePoints.forEach((p,i)=>{assert(Math.abs(p[0]-(48+78*(data.attention.gate_curve[i].gamma+1)))<1e-9);assert(Math.abs(p[1]-(192-31*(data.attention.gate_curve[i].output+3)))<1e-9);});
  for(let i=0;i<3;i++){
   const row=body.match(new RegExp(`<tr[^>]*data-position="${i}"[^>]*>([\\s\\S]*?)</tr>`));assert(row);
   assert(row[1].includes(`data-value="${data.attention.values[i]}"`));
   const weight=row[1].match(/data-weight="([^"]+)"/);assert(weight);assert(Math.abs(Number(weight[1])-data.attention.weights[i])<1e-12);
  }
  const css=fs.readFileSync(path.join(process.cwd(),'src/styles/global.css'),'utf8');
  const html=`<!doctype html><html lang="${lang}" data-theme="light"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}\nbody{margin:0;padding:16px;} main{max-width:1000px;margin:auto;}</style><body><main>${body}</main></body></html>`;
  const file=path.join(dir,`gan-scaling-${lang}.html`);fs.writeFileSync(file,html);rendered.push(file);
 }
 console.log('Actual Astro EN/RU figures rendered (3 SVGs per locale): '+rendered.join(', '));
}
console.log(`GAN-scaling scoped checks passed: ${count} identical math spans, ${expectedIds.length} preserved headings, ${closure.size} figure-closure files; exact saved stdout.`);
