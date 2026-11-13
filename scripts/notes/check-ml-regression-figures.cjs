const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const root=path.resolve(__dirname, '../..');
const ts = require(path.join(root,'node_modules/typescript'));
const load=(file)=>{
 const input=fs.readFileSync(file,'utf8');
 const code=file.endsWith('.astro')?input.split('---')[1]:input;
 const sandbox={exports:{},Astro:{url:new URL('https://fpakhurov.com/notes/ml/regularization')},console,URL};
 sandbox.require=(p)=>{
   if(p.endsWith('.astro'))return {default:()=>{}};
   let dest=path.resolve(path.dirname(file),p);
   if(p.endsWith('.json'))return JSON.parse(fs.readFileSync(dest,'utf8'));
   if(!path.extname(dest))dest+='.ts';
   return load(dest);
 };
 const js=ts.transpileModule(code,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
 vm.runInNewContext(js,sandbox,{filename:file,timeout:30000});return sandbox.exports;
};
for(const p of ['least-squares/ProjectionGeometry.astro','least-squares/RobustFits.astro','regularization/NormBalls.astro','regularization/RegularizationPath.astro','stochastic-and-adaptive-optimizers/NoiseBall.astro','stochastic-and-adaptive-optimizers/OptimizerPaths.astro']){
 load(path.join(root,'src/components/figures',p)); console.log('PASS',p);
}
