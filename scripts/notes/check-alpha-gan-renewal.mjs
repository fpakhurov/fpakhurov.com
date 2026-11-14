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
const expectedIds=['what-each-family-is-missing','adversarial-autoencoders-a-discriminator-on-codes','what-the-code-discriminator-matches','alpha-gan-a-discriminator-on-images-as-well','why-all-three-parts-are-needed','alpha-wgan-two-wasserstein-critics','worked-example-a-code-critic-in-one-dimension','training-four-networks-three-optimizers','latent-interpolation-lerp-or-slerp','where-it-breaks','what-changed','what-you-should-remember','notebook','next','references'];
const normalized=[];let count=0;
for(const locale of ['notes','notes-ru']){
 const p=`src/content/${locale}/generative-models/alpha-gan.mdx`,body=read(p).replace(/^---\n[\s\S]*?\n---\n/,'');
 assert.doesNotMatch(body,/[\x00-\x09\x0B-\x1F]/);
 assert.doesNotMatch(body,/HSE-LAMBDA|CIFAR-10|Comet|11\.32|7\.99|interpolation\.ts/);
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
for(const name of ['AlphaFlow','LerpSlerp'])dependencies(`src/components/figures/alpha-gan/${name}.astro`);
for(const p of closure){
 if(p.endsWith('.astro')){const r=await transform(read(p),{filename:path.join(root,p),internalURL:'astro/compiler-runtime'});assert.equal(r.diagnostics.filter(d=>d.severity==='error').length,0);}
 hashes[p]=digest(p);
}
const py=spawnSync(process.env.PYTHON_BIN||'python3',[path.join(root,'scripts/notes/alpha-gan-cases.py')],{encoding:'utf8',timeout:10000});assert.equal(py.status,0,py.stderr);
const stdoutPath='docs/reports/2026-11-14-generative-renewal/alpha-gan-stdout.txt';
if(process.argv.includes('--write'))fs.writeFileSync(path.join(root,stdoutPath),py.stdout);else assert.equal(py.stdout,read(stdoutPath));
const data=JSON.parse(read('src/components/figures/alpha-gan/cases.json'));
assert.deepEqual(data.code_rows.map(r=>r.equal_class_C),['2/5','2/3','1/2']);
assert.deepEqual(data.code_rows.map(r=>r.one_third_class_C),['1/4','1/2','1/3']);
assert.equal(data.reconstruction_mse,'3');assert.equal(data.independent_code_mse,'41/4');
assert.equal(data.penalty_slope,'25/24');assert.equal(data.penalized_objective,'49/288');
assert.equal(data.wasserstein_1,'1/6');assert.equal(data.interpolation.paths.length,41);
assert.ok(Math.abs(data.average_conditional_kl-data.mutual_information-data.marginal_kl)<1e-14);
for(const locale of ['notes','notes-ru']){
 const body=read(`src/content/${locale}/generative-models/alpha-gan.mdx`);
 const pairs=[...body.matchAll(/```python\n([\s\S]*?)```\s*```text\n([\s\S]*?)```/g)];assert.equal(pairs.length,1);
 for(const [,code,expected] of pairs){const run=spawnSync(process.env.PYTHON_BIN||'python3',['-c',code],{encoding:'utf8',timeout:10000});assert.equal(run.status,0,run.stderr);assert.equal(run.stdout,expected);}
}
const result={mathSpansPerLocale:count,headings:expectedIds,closure:[...closure].sort(),exactPythonStdout:true,inlineReplays:2,caseChecks:'Finite conditional and marginal KL, exact decoder and class odds, independent-code failure, analytic and finite-difference gradient, linear gradient-penalty optimum, explicit equal/unequal-radius paths',limits:'Strict MDX/math, actual Astro compilation and exact fixture replay. Browser/layout/full-site/CI/production validation is separate.'};
const out='docs/reports/2026-11-14-generative-renewal/alpha-gan-checks.json';
if(process.argv.includes('--write'))fs.writeFileSync(path.join(root,out),JSON.stringify(result,null,2)+'\n');else assert.deepEqual(JSON.parse(read(out)),result);
// Optional actual Astro rendering writes only to the explicitly chosen review directory.
const renderDirArg=process.argv.find(s=>s.startsWith('--render-dir='));
if(renderDirArg){
 const dir=path.resolve(renderDirArg.slice('--render-dir='.length));fs.mkdirSync(dir,{recursive:true});
 const {build}=await import(require.resolve('esbuild'));
 const modulePath=path.join(dir,'figures.mjs');
 await build({stdin:{contents:['AlphaFlow','LerpSlerp'].map(n=>`export {default as ${n}} from ${JSON.stringify(path.join(root,`src/components/figures/alpha-gan/${n}.astro`))};`).join('\n'),resolveDir:root,loader:'ts'},bundle:true,platform:'node',format:'esm',outfile:modulePath,logLevel:'silent',plugins:[{
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
  for(const name of ['AlphaFlow','LerpSlerp'])body+=await container.renderToString(components[name],{request:new Request(`https://fpakhurov.com/${lang==='ru'?'ru/':''}notes/generative-models/alpha-gan`)});
  assert.equal((body.match(/<svg\b/g)||[]).length,4);assert.doesNotMatch(body,/NaN|undefined/);
  const ids=[...body.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);
  const css=fs.readFileSync(path.join(process.cwd(),'src/styles/global.css'),'utf8');
  const html=`<!doctype html><html lang="${lang}" data-theme="light"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}\nbody{margin:0;padding:16px;} main{max-width:1000px;margin:auto;}</style><body><main>${body}</main></body></html>`;
  const file=path.join(dir,`alpha-gan-${lang}.html`);fs.writeFileSync(file,html);rendered.push(file);
 }
 console.log('Actual Astro EN/RU figures rendered (4 SVGs per locale): '+rendered.join(', '));
}
console.log(`Alpha-GAN scoped checks passed: ${count} identical math spans, ${expectedIds.length} preserved headings, ${closure.size} figure-closure files; exact saved stdout.`);
