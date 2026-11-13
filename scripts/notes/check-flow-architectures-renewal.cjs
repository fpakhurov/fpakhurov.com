#!/usr/bin/env node
// Original verification authored for this project with Codex assistance.
// Evaluate local figures; independently check numerical derivatives, inverses and examples.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
const ts = require(path.join(root, 'node_modules/typescript'));
const dir = path.join(root, 'src/components/figures/flow-architectures');
function load(file, capture = '', lang = 'en') {
  const input = fs.readFileSync(file, 'utf8');
  let source = file.endsWith('.astro') ? input.split('---')[1] : input;
  if (capture) source += '\nexports.checked = ' + capture + ';';
  const sandbox = {exports: {}, Astro: {url: new URL(`https://fpakhurov.com/${lang === 'ru' ? 'ru/' : ''}notes/generative-models/flow-architectures`)}, URL};
  sandbox.require = p => {
    if (p.endsWith('.astro')) return {default: () => {}};
    let dest = path.resolve(path.dirname(file), p);
    if (!path.extname(dest)) dest += '.ts';
    return load(dest, '', lang);
  };
  const js = ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022}}).outputText;
  vm.runInNewContext(js, sandbox, {filename: file, timeout: 10000});
  return sandbox.exports;
}
const plain = x => JSON.parse(JSON.stringify(x));
const near = (a,b,tol=1e-9) => assert.ok(Math.abs(a-b) <= tol, `${a} differs from ${b}`);
function simpson(f,a,b,n=10000) {
  const h=(b-a)/n;let sum=f(a)+f(b);
  for(let i=1;i<n;i++)sum+=(i%2?4:2)*f(a+i*h);
  return sum*h/3;
}
function det3(a) {return a[0][0]*(a[1][1]*a[2][2]-a[1][2]*a[2][1])-a[0][1]*(a[1][0]*a[2][2]-a[1][2]*a[2][0])+a[0][2]*(a[1][0]*a[2][1]-a[1][1]*a[2][0]);}
const phi=(x,sd=1)=>Math.exp(-x*x/(2*sd*sd))/(sd*Math.sqrt(2*Math.PI));
const gaussianConditional={mean:0,variance:4.01,modelAtZero:phi(0,Math.sqrt(4.01)),trueAtZero:phi(2,.1),modelAtTwo:phi(2,Math.sqrt(4.01)),trueAtTwo:.5*(phi(0,.1)+phi(4,.1))};
near(gaussianConditional.modelAtZero,.199,.001);near(gaussianConditional.trueAtZero/5.5e-87,1,.01);
near(gaussianConditional.modelAtTwo,.121,.001);near(gaussianConditional.trueAtTwo,1.99,.01);
const made=load(path.join(dir,'MadeMasks.astro'),'{M1,M2,paths,J}').checked;
assert.deepEqual(plain(made.paths),[[0,0,0],[2,0,0],[4,2,0]]);
for(let i=0;i<3;i++)for(let j=0;j<3;j++)assert.equal(made.J[i][j],i===j?'diag':j<i?'dense':'zero');
const coupling=load(path.join(dir,'CouplingJacobian.astro'),'W.cells').checked;
assert.equal(coupling.filter(c=>c.kind==='one').length,3);
assert.equal(coupling.filter(c=>c.kind==='diag').length,3);
assert.equal(coupling.filter(c=>c.kind==='dense').length,9);
const logdet=.2-.5+.1;near(Math.exp(logdet),.8187307530779818);
const lower=[[1,0,0],[.5,1,0],[-1,2,1]],upper=[[2,1,-1],[0,-.5,3],[0,0,1.5]];
const product=lower.map(row=>upper[0].map((_,j)=>row.reduce((v,x,k)=>v+x*upper[k][j],0)));
assert.deepEqual(product,[[2,1,-1],[1,0,2.5],[-2,-2,8.5]]);near(det3(product),-1.5);
const spline=load(path.join(dir,'RationalQuadraticSpline.astro'),'{rqs,rqsInv,xk,yk,dk}').checked;
let maxSplineInverseError=0,maxSplineDerivativeError=0;
for(let i=0;i<=200;i++){
 const x=-4+8*i/200,[y,d]=spline.rqs(x),h=1e-6;
 const central=(spline.rqs(x+h)[0]-spline.rqs(x-h)[0])/(2*h);
 maxSplineInverseError=Math.max(maxSplineInverseError,Math.abs(spline.rqsInv(y)-x));
 maxSplineDerivativeError=Math.max(maxSplineDerivativeError,Math.abs(central-d));
 assert.ok(d>0);
}
assert.ok(maxSplineInverseError<1e-12);assert.ok(maxSplineDerivativeError<1e-5);
const [g,dg]=spline.rqs(-.6);near(g,-2.4+3.06/2.225);near(dg,4.04,.01);
const k=1,w=1.2,height=3.6,chord=3,delta0=.4,delta1=2.5,dy=g+2.4;
const quadratic={a:height*(chord-delta0)+dy*(delta1+delta0-2*chord),b:height*delta0-dy*(delta1+delta0-2*chord),c:-chord*dy};
near(quadratic.a*.25+quadratic.b*.5+quadratic.c,0);
const grid=load(path.join(dir,'GridWarp.astro'),'{ratio,f}').checked;
const gridAverage=simpson(u=>Math.exp(.5*Math.tanh(u)),.5,1)/.5;
near(grid.ratio,gridAverage,1e-8);
let maxGridDetError=0;
for(const[a,b]of[[-1.2,.3],[0,.2],[.8,-.6]]){
 const h=1e-5,pa=grid.f(a+h,b),na=grid.f(a-h,b),pb=grid.f(a,b+h),nb=grid.f(a,b-h);
 const det=((pa[0]-na[0])*(pb[1]-nb[1])-(pb[0]-nb[0])*(pa[1]-na[1]))/(4*h*h);
 maxGridDetError=Math.max(maxGridDetError,Math.abs(det-Math.exp(.5*Math.tanh(a))));
}
assert.ok(maxGridDetError<1e-9);
// New radial inverse check, including the centre and negative beta.
let maxRadialInverseError=0,maxRadialDetError=0;
for(const alpha of [.4,1.7])for(const beta of [-.3,.7]){
 const radial=([x,y])=>{const r=Math.hypot(x,y),scale=1+beta/(alpha+r);return[x*scale,y*scale];};
 for(const z of [[0,0],[.3,-.4],[1.1,.7]]){
  const y=radial(z),rho=Math.hypot(...y),c=alpha+beta-rho;
  const r=rho===0?0:(Math.sqrt(c*c+4*alpha*rho)-c)/2;
  const back=rho===0?[0,0]:y.map(v=>v*r/rho);
  maxRadialInverseError=Math.max(maxRadialInverseError,...back.map((v,i)=>Math.abs(v-z[i])));
  const radius=Math.hypot(...z),analytic=(1+beta/(alpha+radius))*(1+alpha*beta/(alpha+radius)**2);
  const h=1e-6,px=radial([z[0]+h,z[1]]),nx=radial([z[0]-h,z[1]]),py=radial([z[0],z[1]+h]),ny=radial([z[0],z[1]-h]);
  const actual=((px[0]-nx[0])*(py[1]-ny[1])-(px[1]-nx[1])*(py[0]-ny[0]))/(4*h*h);
  maxRadialDetError=Math.max(maxRadialDetError,Math.abs(actual-analytic));
 }
}
assert.ok(maxRadialInverseError<1e-12);assert.ok(maxRadialDetError<3e-5);
let low=1,high=3;for(let i=0;i<70;i++){let m=(low+high)/2;if(m-2*Math.tanh(m)>0)high=m;else low=m;}
const planarPositiveRoot=(low+high)/2;near(planarPositiveRoot,1.915,.001);
const multiscale={factored:[6144,3072,1536,768,768],couplings:28,fullImageWork:6*(1+.5+.25+.125)+4/16};
assert.equal(multiscale.factored.reduce((a,b)=>a+b),64*64*3);assert.equal(multiscale.fullImageWork,11.5);
const squeeze=[0,1,2,3].map(offset=>Array.from({length:4},(_,i)=>1+(2*Math.floor(i/2)+Math.floor(offset/2))*4+2*(i%2)+offset%2));
assert.deepEqual(squeeze,[[1,3,9,11],[2,4,10,12],[5,7,13,15],[6,8,14,16]]);
const figures=['CouplingLayer','CouplingJacobian','MadeMasks','GlowConv','GridWarp','RationalQuadraticSpline'];
for(const lang of ['en','ru'])for(const fig of figures)load(path.join(dir,fig+'.astro'),'',lang);
const results={gaussianConditional,couplingLogdet:logdet,couplingDet:Math.exp(logdet),madePaths:plain(made.paths),luProduct:product,luDet:det3(product),luLogAbsDet:Math.log(1.5),spline:{g,dg,logDerivative:Math.log(dg),quadratic,maxSplineInverseError,maxSplineDerivativeError},gridAverage,maxGridDetError,radial:{maxRadialInverseError,maxRadialDetError},planarPositiveRoot,multiscale,squeeze,gaussianShell:{radius:Math.sqrt(12288),midpointRadius:Math.sqrt(12288/2)},figureFrontmatters:figures};
const output=JSON.stringify(results,(_,v)=>typeof v==='number'?Number(v.toPrecision(12)):v,2)+'\n';
const destination=path.join(root,'docs/reports/2026-11-13-licensed-example-renewal/flow-architectures-checks.json');
if(process.argv.includes('--write'))fs.writeFileSync(destination,output);else assert.deepEqual(JSON.parse(fs.readFileSync(destination,'utf8')),JSON.parse(output));
console.log('PASS: six figures in both locales, masks, conditional densities, LU, spline derivatives/inverses, cell area, radial inverse, squeeze and multiscale arithmetic.');
