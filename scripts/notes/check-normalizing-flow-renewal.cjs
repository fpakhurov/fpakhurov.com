#!/usr/bin/env node
// Independently specified numerical checks for the local normalizing-flow note.
// New verification code authored with Codex assistance. No external data/network.
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
const ts = require(path.join(root, 'node_modules/typescript'));
function load(file, capture = '') {
  const input = fs.readFileSync(file, 'utf8');
  let code = file.endsWith('.astro') ? input.split('---')[1] : input;
  if (capture) code += '\nexports.checked = ' + capture + ';';
  const sandbox = {exports: {}, Astro: {url: new URL('https://fpakhurov.com/notes/generative-models/normalizing-flows')}, URL};
  sandbox.require = (p) => {
    if (p.endsWith('.astro')) return {default: () => {}};
    let dest = path.resolve(path.dirname(file), p);
    if (!path.extname(dest)) dest += '.ts';
    return load(dest);
  };
  const js = ts.transpileModule(code, {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true}}).outputText;
  vm.runInNewContext(js, sandbox, {filename: file, timeout: 30000});
  return sandbox.exports;
}
const near = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} != ${b} within ${eps}`);
function integrate(f, a, b, n = 10000) {
  assert.equal(n % 2, 0);
  const h = (b - a) / n;
  let sum = f(a) + f(b);
  for (let i = 1; i < n; i++) sum += (i % 2 ? 4 : 2) * f(a + i * h);
  return sum * h / 3;
}
const dir = path.join(root, 'src/components/figures/normalizing-flows');
const m = load(path.join(dir, 'flow-math.ts'));
const phi = (x) => Math.exp(-x*x/2) / Math.sqrt(2*Math.PI);
const cdf = (x) => 0.5 + integrate(phi, 0, x, 4000);
const invCdf = (p) => { let a=-10,b=10; for(let i=0;i<60;i++){const c=(a+b)/2;if(cdf(c)<p)a=c;else b=c;} return(a+b)/2; };
const round = (x) => Number(x.toPrecision(12));
const opening = {densityAtTwo: (3-2)/2, totalMass: integrate(x => (3-x)/2, 1, 3), middleIntervalMass: integrate(x => (3-x)/2, 1.5, 2.5)};
near(opening.totalMass, 1); near(opening.middleIntervalMass, .5);
const table = [0,.5,1,2].map(z=>({z,x:m.flow1d(z),derivative:m.flow1dPrime(z),base:phi(z),density:m.px(m.flow1d(z))}));
for(let i=-40;i<=40;i++) {
 const z=i/10; near(m.flow1dInverse(m.flow1d(z)),z);
 const h=1e-5;near((m.flow1d(z+h)-m.flow1d(z-h))/(2*h),m.flow1dPrime(z),1e-8);
 near(m.normalCdf(z),cdf(z),8e-8);
}
const transformedMass=integrate(m.px,-10,10);near(transformedMass,1,1e-8);
let peak={x:0,density:0};for(let i=0;i<=40000;i++){let x=i/10000,p=m.px(x);if(p>peak.density)peak={x,density:p};}
near(peak.x,1.5,.01);near(peak.density,.234,.001);
const band={mass:cdf(.5)-cdf(.1),widthRatio:(m.flow1d(.5)-m.flow1d(.1))/.4};
band.baseAverage=band.mass/.4;band.targetAverage=band.baseAverage/band.widthRatio;
const localVolume=load(path.join(dir,'LocalVolume.astro'), 'cells').checked.map(c=>{
 const[a,b]=c.box;const exactAverage=(Math.exp(.35*b)-Math.exp(.35*a))/(.35*(b-a));
 // A 16-segment boundary approximates the curved edges; the plotted ratio rounds to two decimals.
 near(c.ratio,exactAverage,2e-4);
 return{box:Array.from(c.box),polygonRatio:c.ratio,exactAverage,centreDet:c.det};
});
let maxDetError=0,maxInverseError=0;
for(const[a,b]of[[-1.5,.8],[0,0],[.6,.9],[1,-.5],[.7,-1.35],[1.5,-.8]]){
 const[x,y]=m.flow2d([a,b]);const ai=x-.35*Math.sin(1.2*y),bi=(y-.2*ai)*Math.exp(-.35*ai);
 maxInverseError=Math.max(maxInverseError,Math.abs(ai-a),Math.abs(bi-b));
 const h=1e-5,pa=m.flow2d([a+h,b]),na=m.flow2d([a-h,b]),pb=m.flow2d([a,b+h]),nb=m.flow2d([a,b-h]);
 const det=((pa[0]-na[0])*(pb[1]-nb[1])-(pb[0]-nb[0])*(pa[1]-na[1]))/(4*h*h);
 maxDetError=Math.max(maxDetError,Math.abs(det-m.flow2dDet(a)));
}
assert.ok(maxDetError<1e-8&&maxInverseError<1e-12);
const mixture=[-4,-2,0].map(x=>{const p=phi((x+4)/.5)+phi((x-4)/.5),z=invCdf(.5*cdf((x+4)/.5)+.5*cdf((x-4)/.5));return{x,z,density:p,slope:phi(z)/p};});
const gapLatentEdge=invCdf(.5*cdf(6/.5)+.5*cdf(-2/.5));
assert.ok(Math.abs(gapLatentEdge)<4e-5);assert.ok(23**10>4e13);
const pixelCorrections=[.5,128.5,255.5].map(x=>{const p=.05+.9*x/256;return{x,p,bits:Math.log2(256*p*(1-p)/.9)};});
const conditional={u1:1-Math.exp(-1),u2:cdf(.5),joint:Math.exp(-1)*phi(.5)};
const figures=['ZXMapping','ChangeOfVariables1D','JacobianSquares','ModelFamilies','LocalVolume','DeterminantCases','TriangularJacobian'];
for(const f of figures)load(path.join(dir,f+'.astro'));
const result={opening,table,transformedMass,peak,band,localVolume,maxDetError,maxInverseError,mixture,gapLatentEdge,tenLayerNorm23Product:23**10,pixelCorrections,rescaleBits:Math.log2(127.5),conditional,figureFrontmatters:figures};
const output=JSON.stringify(result,(_,v)=>typeof v==='number'?round(v):v,2)+'\n';
const destination=path.join(root,'docs/reports/2026-11-13-licensed-example-renewal/normalizing-flow-checks.json');
if(process.argv.includes('--write'))fs.writeFileSync(destination,output);
else assert.deepEqual(JSON.parse(fs.readFileSync(destination,'utf8')),JSON.parse(output));
console.log('PASS: density normalization, derivatives, inverse, finite-cell area, separated-mode conditioning, pixel units and all seven figure frontmatters.');
