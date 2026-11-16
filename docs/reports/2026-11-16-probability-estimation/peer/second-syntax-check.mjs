import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {createRequire} from 'node:module';import {execFileSync} from 'node:child_process';import {pathToFileURL} from 'node:url';import {createHash} from 'node:crypto';
const host=process.cwd(),r=createRequire(host+'/package.json'),dir=path.dirname(new URL(import.meta.url).pathname);
const file='src/components/figures/estimators/ShrinkageRisk.astro',absolute=path.join(host,file),old=execFileSync('git',['show','HEAD:'+file],{encoding:'utf8'}),fresh=fs.readFileSync(absolute,'utf8');
const ts=await import(r.resolve('typescript')),{transform}=await import(r.resolve('@astrojs/compiler-rs')),{convertToTSX}=await import(r.resolve('@astrojs/compiler')),{build}=await import(r.resolve('esbuild')),{experimental_AstroContainer:Container}=await import(r.resolve('astro/container'));
const result={file,head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),hashes:{before:createHash('sha256').update(old).digest('hex'),after:createHash('sha256').update(fresh).digest('hex')},tsx:{},render:{}};
for(const [label,source]of [['before',old],['after',fresh]]){
 const transformed=await convertToTSX(source,{filename:absolute});
 const sf=ts.createSourceFile('figure.tsx',transformed.code,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 result.tsx[label]=sf.parseDiagnostics.map(d=>({code:d.code,message:ts.flattenDiagnosticMessageText(d.messageText,' ')}));
 if(label==='after')assert.equal(sf.parseDiagnostics.length,0);
 const outfile=path.join(dir,label+'.mjs');
 await build({stdin:{contents:`export {default} from ${JSON.stringify(absolute)};`,resolveDir:host,loader:'ts'},bundle:true,platform:'node',format:'esm',outfile,logLevel:'silent',plugins:[{name:'one-figure',setup(b){b.onResolve({filter:/^astro\//},a=>({path:r.resolve(a.path),external:true}));b.onLoad({filter:/\.astro$/},async a=>{const c=await transform(a.path===absolute?source:fs.readFileSync(a.path,'utf8'),{filename:a.path,internalURL:'astro/compiler-runtime',resultScopedSlot:true});assert.equal(c.diagnostics.filter(d=>d.severity==='error').length,0);return{contents:c.code.replace(/createMetadata as \$\$createMetadata,?/g,'').replace(/export const \$\$metadata = [\s\S]*?\n(?=const \$\$Astro)/,''),loader:'ts',resolveDir:path.dirname(a.path)};});}}]});
 const mod=await import(pathToFileURL(outfile).href),container=await Container.create();
 for(const lang of ['en','ru']){const html=await container.renderToString(mod.default,{request:new Request(`https://fpakhurov.com/${lang==='ru'?'ru/':''}notes/probability/estimators/`)});fs.writeFileSync(path.join(dir,`${label}-${lang}.html`),html);if(label==='after')assert.equal(html.replace(/>\s+</g,'><'),fs.readFileSync(path.join(dir,`before-${lang}.html`),'utf8').replace(/>\s+</g,'><'));result.render[`${label}-${lang}`]={bytes:Buffer.byteLength(html),sha256:createHash('sha256').update(html).digest('hex')};}
}
assert.ok(result.tsx.before.length>0);result.status='PASS';result.scope='One source refactor; language-server TSX parsing and old/new actual Astro HTML identical after inter-tag whitespace normalization in both locales. No full build or browser.';
fs.writeFileSync(path.join(dir,'verification.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
