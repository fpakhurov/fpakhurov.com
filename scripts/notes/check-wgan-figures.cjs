#!/usr/bin/env node
// Original scoped verification authored for this project with Codex assistance.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..');
const ts=require(path.join(root,'node_modules/typescript'));
const katex=require(path.join(root,'node_modules/katex'));
const dir=path.join(root,'src/components/figures/wgan');
function load(file,capture='',lang='en'){
 const text=fs.readFileSync(file,'utf8');let source=file.endsWith('.astro')?text.split('---')[1]:text;
 if(capture)source+='\nexports.checked='+capture+';';
 const sandbox={exports:{},Astro:{url:new URL('https://fpakhurov.com/'+(lang==='ru'?'ru/':'')+'notes/generative-models/wgan')},URL};
 sandbox.require=p=>{if(p.endsWith('.astro'))return{default:()=>{}};let dest=path.resolve(path.dirname(file),p);if(!path.extname(dest))dest+='.ts';return load(dest,'',lang)};
 vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,sandbox,{filename:file,timeout:5000});return sandbox.exports;
}
const plain=x=>JSON.parse(JSON.stringify(x));
const figures=['JsVsW1','GradientPenalty','SpectralNorm'];
const near=(a,b,tol=1e-10)=>assert.ok(Math.abs(a-b)<tol,`${a} differs from ${b}`);
const numeric=JSON.parse(fs.readFileSync(path.join(root,'docs/reports/2026-11-13-licensed-example-renewal/wgan-numerical-checks.json'),'utf8'));
(async()=>{
 const {transform}=await import(path.join(root,'node_modules/@astrojs/compiler/dist/node/index.js'));
 for(const lang of ['en','ru']){
  const point=load(path.join(dir,'JsVsW1.astro'),'{js,w1,thetaDemo,layouts}',lang).checked;
  for(const item of numeric.point_masses){near(point.js(item.theta),item.js);near(point.w1(item.theta),item.w1)}
  const gp=load(path.join(dir,'GradientPenalty.astro'),'{real,fake,alphas,hats,dir,k,layouts}',lang).checked;
  assert.deepEqual(plain(gp.real),numeric.gradient_penalty_figure.real);assert.deepEqual(plain(gp.fake),numeric.gradient_penalty_figure.fake);
  assert.deepEqual(plain(gp.alphas),numeric.gradient_penalty_figure.alphas);assert.equal(gp.k,2);
  for(let i=0;i<5;i++)for(let j=0;j<2;j++)near(gp.hats[i][j],numeric.gradient_penalty_figure.interpolates[i][j]);
  for(let j=0;j<2;j++)near(gp.dir[j],numeric.gradient_penalty_figure.gradient[j]);
  for(const o of gp.layouts){near(Math.abs(o.sx(1)-o.sx(0)),Math.abs(o.sy(1)-o.sy(0)));assert.ok(o.B+(o.narrow?54:22)+6<=o.h)}
  const sn=load(path.join(dir,'SpectralNorm.astro'),'{W,s1,s2,v1,v2,Wv1,Wv2,u1,Wn}',lang).checked;
  assert.deepEqual(plain(sn.W),numeric.spectral.matrix);near(sn.s1,numeric.spectral.singular_values[0]);near(sn.s2,numeric.spectral.singular_values[1]);
  near(Math.hypot(...sn.Wv1),sn.s1);near(Math.hypot(...sn.Wv2),sn.s2);near(sn.v1[0]*sn.v2[0]+sn.v1[1]*sn.v2[1],0);
  for(let i=0;i<2;i++)for(let j=0;j<2;j++)near(sn.Wn[i][j],sn.W[i][j]/sn.s1);
 }
 for(const file of [...figures.map(x=>path.join(dir,x+'.astro')),path.join(root,'src/components/figures/Figure.astro')]){
  const result=await transform(fs.readFileSync(file,'utf8'),{filename:file});assert.equal(result.diagnostics.filter(x=>x.severity===1).length,0);
 }
 const {compile}=await import('@mdx-js/mdx');const {default:remarkMath}=await import('remark-math');const {default:rehypeKatex}=await import('rehype-katex');
 const bodies=['notes','notes-ru'].map(p=>fs.readFileSync(path.join(root,'src/content',p,'generative-models/wgan.mdx'),'utf8'));
 const normalized=[],counts=[];
 for(const body of bodies){
  assert.ok(!/[\u0000-\u0008\u000B\u000C\u000E-\u001F\t]/.test(body));
  await compile(body.replace(/^---[\s\S]*?---\s*/,''),{remarkPlugins:[remarkMath],rehypePlugins:[[rehypeKatex,{throwOnError:true,strict:'error'}]]});
  const maths=[...body.matchAll(/\$\$([\s\S]*?)\$\$|(?<!\\)\$([^\n$]+?)\$/g)].map(m=>m[1]||m[2]);
  for(const math of maths)katex.renderToString(math,{throwOnError:true,strict:'error',displayMode:true});
  normalized.push(maths.map(x=>x.replace(/\s+/g,'')).sort());counts.push(maths.length);
  assert.ok(!body.includes('WGAN.ipynb'));assert.ok(body.includes('2505.06589v3'));
 }
 assert.deepEqual(normalized[0],normalized[1]);
 const result={figures,figureCount:3,additionalAstroSourcesCompiled:1,mathSpansPerLocale:counts,mathParity:'exact multiset after whitespace removal',gradientPenalty:{pairs:5,fixedFractions:[.2,.35,.5,.65,.8],calloutPair:2,scope:'Original selected coordinates; not random training outputs'},spectral:{matrix:numeric.spectral.matrix,singularValues:numeric.spectral.singular_values},pointMassBoundary:'JS and W1 zero at theta=0; finite slopes stated away from zero'};
 const dest=path.join(root,'docs/reports/2026-11-13-licensed-example-renewal/wgan-figure-checks.json');
 if(process.argv.includes('--write'))fs.writeFileSync(dest,JSON.stringify(result,null,2)+'\n');else assert.deepEqual(JSON.parse(fs.readFileSync(dest,'utf8')),result);
 console.log('WGAN figures passed: geometry, three Astro figures, strict MDX/KaTeX and bilingual math parity.');
})().catch(err=>{console.error(err);process.exitCode=1});
