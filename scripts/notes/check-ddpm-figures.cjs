#!/usr/bin/env node
// Original local verification authored for this project with Codex assistance.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..');
const ts=require(path.join(root,'node_modules/typescript'));
const katex=require(path.join(root,'node_modules/katex'));
const dir=path.join(root,'src/components/figures/ddpm-training-objective');
function load(file,capture='',lang='en'){
 const text=fs.readFileSync(file,'utf8');let source=file.endsWith('.astro')?text.split('---')[1]:text;
 if(capture)source+='\nexports.checked='+capture+';';
 const sandbox={exports:{},Astro:{url:new URL('https://fpakhurov.com/'+(lang==='ru'?'ru/':'')+'notes/generative-models/ddpm-training-objective')},URL};
 sandbox.require=p=>{if(p.endsWith('.astro'))return{default:()=>{}};let dest=path.resolve(path.dirname(file),p);if(!path.extname(dest))dest+='.ts';return load(dest,'',lang)};
 vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,sandbox,{filename:file,timeout:5000});return sandbox.exports;
}
const near=(a,b,tol=1e-10)=>assert.ok(Math.abs(a-b)<tol,`${a} differs from ${b}`);
const plain=x=>JSON.parse(JSON.stringify(x));
const chain=load(path.join(dir,'InverseProcessChain.astro'),'{photo,eps,tiles,nodes}').checked;
assert.equal(chain.photo.length,64);assert.equal(chain.eps.length,64);
for(let i=0;i<64;i++)for(let j=0;j<4;j++)near(chain.tiles[j][i],Math.min(1,Math.max(0,(Math.sqrt(chain.nodes[j].abar)*chain.photo[i]+Math.sqrt(1-chain.nodes[j].abar)*chain.eps[i]+1)/2))*.88);
const paths=load(path.join(dir,'AllPathsIntegral.astro'),'{widePaths,narrowPaths,wideL,narrowL}').checked;
for(const name of ['wide','narrow'])for(let i=0;i<11;i++){
 const curve=paths[name+'Paths'][i],layout=paths[name+'L'];assert.equal(curve.length,41);
 for(let k=0;k<2;k++){near(curve[0][k],layout.starts[i][k]);near(curve[40][k],layout.x0[k]);}
}
const kl=load(path.join(dir,'EqualVarianceKL.astro'),'{klNow,gap,sigma}').checked;near(kl.klNow,3.645);
// Integrate q log(q/p) numerically, independently of the squared-distance formula.
let integratedKL=0;const step=.0005;for(let x=-10;x<12;x+=step){const q=Math.exp(-((x-1.4)**2)/2)/Math.sqrt(2*Math.PI);integratedKL+=q*((x+1.3)**2-(x-1.4)**2)/2*step;}near(integratedKL,kl.klNow,1e-9);
const weight=load(path.join(dir,'LossWeight.astro'),'{wBeta,wTilde,tMin,panels,abar}').checked;
const numeric=JSON.parse(fs.readFileSync(path.join(root,'docs/reports/2026-11-13-licensed-example-renewal/ddpm-numerical-checks.json'),'utf8'));
assert.equal(weight.tMin,numeric.linear_schedule.minimum_t);near(weight.wBeta(2),numeric.linear_schedule.w2,1e-11);near(weight.wBeta(1000),numeric.linear_schedule.w1000,1e-11);
for(let t=2;t<=1000;t++)assert.ok(Number.isFinite(weight.wTilde(t))&&weight.wTilde(t)>=weight.wBeta(t));
const posterior=load(path.join(dir,'PosteriorGraph.astro'),'{aw,an}').checked;
assert.ok(!JSON.stringify(posterior).includes('NaN'));
const denoiser=load(path.join(dir,'DenoiserFlow.astro'),'{res,shape,wide,narrow}').checked;
assert.deepEqual(plain(denoiser.res),['32 × 32','16 × 16','8 × 8']);assert.equal(denoiser.shape,'3 × 32 × 32');
const figures=['InverseProcessChain','AllPathsIntegral','PosteriorGraph','EqualVarianceKL','TrainingStep','LossWeight','DenoiserFlow'];
const dependencies=['seqflow/Arrow.astro','seqflow/Box.astro','seqflow/Badge.astro','seqflow/Legend.astro','seqflow/Stepper.astro','generative-modeling/Sub.astro','Figure.astro'];
(async()=>{
 const {transform}=await import(path.join(root,'node_modules/@astrojs/compiler/dist/node/index.js'));
 for(const lang of ['en','ru'])for(const fig of figures)load(path.join(dir,fig+'.astro'),'',lang);
 for(const file of [...figures.map(x=>path.join(dir,x+'.astro')),...dependencies.map(x=>path.join(root,'src/components/figures',x))]){
   const result=await transform(fs.readFileSync(file,'utf8'),{filename:file});assert.equal(result.diagnostics.filter(x=>x.severity===1).length,0);
 }
 const {compile}=await import('@mdx-js/mdx');const {default:remarkMath}=await import('remark-math');const {default:rehypeKatex}=await import('rehype-katex');
 const bodies=['notes','notes-ru'].map(p=>fs.readFileSync(path.join(root,'src/content',p,'generative-models/ddpm-training-objective.mdx'),'utf8'));
 const counts=[];const normalized=[];
 for(const body of bodies){
  assert.ok(!/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(body));
  await compile(body.replace(/^---[\s\S]*?---\s*/,''),{remarkPlugins:[remarkMath],rehypePlugins:[[rehypeKatex,{throwOnError:true,strict:'error'}]]});
  const noCode=body.replace(/```[\s\S]*?```/g,'');const maths=[...noCode.matchAll(/\$\$([\s\S]*?)\$\$|(?<!\\)\$([^\n$]+?)\$/g)].map(m=>m[1]||m[2]);
  for(const math of maths)katex.renderToString(math,{throwOnError:true,strict:'error',displayMode:true});
  counts.push(maths.length);normalized.push(maths.map(x=>x.replaceAll('{,}',String.raw`\,`).replace('остальные состояния','other states').replace(/\s+/g,' ').trim()).sort());
 }
 assert.deepEqual(normalized[0],normalized[1]);
 const simple=fs.readFileSync(path.join(dir,'TrainingStep.astro'),'utf8');assert.ok(simple.includes("Uniform{'{'}1, …, T{'}'}"));assert.ok(!simple.includes('from 2 to T'));assert.ok(!simple.includes('от 2 до T'));
 const result={figureCount:figures.length,astroDependenciesCompiled:dependencies.length,mathSpansPerLocale:counts,mathParity:'exact multiset after whitespace, thousands separator and other-states label normalization',ringForegroundCells:chain.photo.filter(x=>x===1).length,pathsPerLayout:11,bridgePoints:41,gaussianKL:kl.klNow,integratedKL,minimumWeightT:weight.tMin,simpleObjectiveTimeRange:[1,'T'],networkScope:'architecture schematic only; condensed resolution levels',figures};
 const output=JSON.stringify(result,(_,v)=>typeof v==='number'?Number(v.toPrecision(12)):v,2)+'\n';const dest=path.join(root,'docs/reports/2026-11-13-licensed-example-renewal/ddpm-figure-checks.json');
 if(process.argv.includes('--write'))fs.writeFileSync(dest,output);else assert.deepEqual(JSON.parse(fs.readFileSync(dest,'utf8')),JSON.parse(output));
 console.log('DDPM figures passed: seven bilingual figure frontmatters, Astro and strict MDX/KaTeX, exact math parity and numerical checks.');
})().catch(err=>{console.error(err);process.exitCode=1});
