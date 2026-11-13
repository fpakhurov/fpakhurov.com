#!/usr/bin/env node
// Original scoped verification authored for this project with Codex assistance.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..');
const ts=require(path.join(root,'node_modules/typescript'));
const katex=require(path.join(root,'node_modules/katex'));
const dir=path.join(root,'src/components/figures/vae');
function load(file,capture='',lang='en'){
 const text=fs.readFileSync(file,'utf8');let source=file.endsWith('.astro')?text.split('---')[1]:text;
 if(capture)source+='\nexports.checked='+capture+';';
 const sandbox={exports:{},Astro:{url:new URL('https://fpakhurov.com/'+(lang==='ru'?'ru/':'')+'notes/generative-models/vae')},URL};
 sandbox.require=p=>{if(p.endsWith('.astro'))return{default:()=>{}};let dest=path.resolve(path.dirname(file),p);if(!path.extname(dest))dest+='.ts';return load(dest,'',lang)};
 vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,sandbox,{filename:file,timeout:5000});return sandbox.exports;
}
const plain=x=>JSON.parse(JSON.stringify(x));
const figures=['LatentGarbage','DataLatentMaps','ElboTerms','Reparameterization','LatentInterpolation','JensenLog','KlFine'];
const near=(a,b,tol=1e-10)=>assert.ok(Math.abs(a-b)<tol,`${a} differs from ${b}`);
const numeric=JSON.parse(fs.readFileSync(path.join(root,'docs/reports/2026-11-13-licensed-example-renewal/vae-numerical-checks.json'),'utf8'));
(async()=>{
 const {transform}=await import(path.join(root,'node_modules/@astrojs/compiler/dist/node/index.js'));
 for(const lang of ['en','ru']){
  const ae=load(path.join(dir,'LatentGarbage.astro'),'{training,g0,g1,variants}',lang).checked;
  assert.deepEqual(plain(ae.training),numeric.ae_counterexample.training);
  for(const z of ae.training){near(ae.g0(z),z);near(ae.g1(z),z)}
  near(ae.g0(1),1);near(ae.g1(1),-1.25);
  const interpolation=load(path.join(dir,'LatentInterpolation.astro'),'{frames,decoder,za,zb}',lang).checked;
  for(let i=0;i<5;i++){
   near(interpolation.frames[i].t,numeric.three_pixel_interpolation[i].t);
   for(let j=0;j<2;j++)near(interpolation.frames[i].z[j],numeric.three_pixel_interpolation[i].z[j]);
   for(let j=0;j<3;j++)near(interpolation.frames[i].pixels[j],numeric.three_pixel_interpolation[i].pixels[j]);
  }
  const jensen=load(path.join(dir,'JensenLog.astro'),'{a,b,mean,logMean,meanLog,layouts}',lang).checked;
  near(jensen.mean,3);near(jensen.logMean,numeric.jensen.log_mean);near(jensen.meanLog,numeric.jensen.mean_log);
  const kl=load(path.join(dir,'KlFine.astro'),'{sigmaTop,variants}',lang).checked;
  near(kl.sigmaTop,numeric.kl_sigma_at_3_2);
  const shapes=load(path.join(dir,'shapes.ts'));
  for(const row of numeric.kl_table)near(shapes.klStd(row.mu,row.sigma),row.kl);
  const e=load(path.join(dir,'ElboTerms.astro'),'{wp,np}',lang).checked;
  for(const p of [e.wp,e.np]){near(p.rx,15.4);near(p.ry,9.8)}
  const maps=load(path.join(dir,'DataLatentMaps.astro'),'{weight,noiseVariance,observation,evidenceVariance,posteriorMean,posteriorVariance,density}',lang).checked;
  for(const [key,saved] of Object.entries({weight:'weight',noiseVariance:'noise_variance',observation:'observation',evidenceVariance:'evidence_variance',posteriorMean:'posterior_mean',posteriorVariance:'posterior_variance'}))near(maps[key],numeric.scalar_bayes_figure[saved]);
  near(maps.density(maps.posteriorMean,maps.posteriorMean,maps.posteriorVariance),1/Math.sqrt(2*Math.PI*maps.posteriorVariance));
  const rp=load(path.join(dir,'Reparameterization.astro'),'{epsilon,mu,sigma,delta,rows}',lang).checked;
  assert.deepEqual(plain(rp.epsilon),numeric.fixed_noise_reparameterization.epsilon);
  for(const key of ['mu','sigma','delta'])near(rp[key],numeric.fixed_noise_reparameterization[key]);
  rp.rows.forEach((row,i)=>row.values.forEach((value,j)=>near(value,numeric.fixed_noise_reparameterization.rows[i][j])));
 }
 for(const file of [...figures.map(x=>path.join(dir,x+'.astro')),path.join(root,'src/components/figures/Figure.astro')]){
  const result=await transform(fs.readFileSync(file,'utf8'),{filename:file});assert.equal(result.diagnostics.filter(x=>x.severity===1).length,0);
 }
 const {compile}=await import('@mdx-js/mdx');const {default:remarkMath}=await import('remark-math');const {default:rehypeKatex}=await import('rehype-katex');
 const bodies=['notes','notes-ru'].map(p=>fs.readFileSync(path.join(root,'src/content',p,'generative-models/vae.mdx'),'utf8'));
 const normalized=[],counts=[];
 for(const body of bodies){
  assert.ok(!/[\u0000-\u0008\u000B\u000C\u000E-\u001F\t]/.test(body));
  await compile(body.replace(/^---[\s\S]*?---\s*/,''),{remarkPlugins:[remarkMath],rehypePlugins:[[rehypeKatex,{throwOnError:true,strict:'error'}]]});
  const maths=[...body.matchAll(/\$\$([\s\S]*?)\$\$|(?<!\\)\$([^\n$]+?)\$/g)].map(m=>m[1]||m[2]);
  for(const math of maths)katex.renderToString(math,{throwOnError:true,strict:'error',displayMode:true});
  normalized.push(maths.map(x=>x.replace(/\s+/g,'')).sort());counts.push(maths.length);
  assert.ok(!body.includes('VAE.ipynb'));assert.ok(!body.includes('CelebA'));
  assert.ok(body.includes('/licenses/bmml-vae.txt'));
 }
 assert.deepEqual(normalized[0],normalized[1]);
 const result={figures,figureCount:figures.length,additionalAstroSourcesCompiled:1,mathSpansPerLocale:counts,mathParity:'exact multiset after whitespace removal',newAeCounterexample:'Explicit two decoders, three training points and unseen value',newInterpolation:'Five computed three-pixel decoder means; no learned glyph experiment',numericScope:'Scalar Bayes density normalization, mean, variance and pointwise identity; fixed-noise parameter shifts; PPCA; Monte Carlo scaling; shared variance; Gaussian gradient moments and KL; finite-mixture KL split; collapse family; conditional means; replayed published scalar practice'};
 const dest=path.join(root,'docs/reports/2026-11-13-licensed-example-renewal/vae-figure-checks.json');
 if(process.argv.includes('--write'))fs.writeFileSync(dest,JSON.stringify(result,null,2)+'\n');else assert.deepEqual(JSON.parse(fs.readFileSync(dest,'utf8')),result);
 console.log('VAE figures passed: seven Astro figures, explicit fixture parity, strict MDX/KaTeX and bilingual math parity.');
})().catch(err=>{console.error(err);process.exitCode=1});
