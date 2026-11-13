// Verify the original discrete-count lesson and render its actual Astro figures.
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { transform } from '@astrojs/compiler-rs';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import ts from 'typescript';
import katex from 'katex';
import { compile } from '@mdx-js/mdx';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkHeadingIds from '../../src/plugins/remark-heading-ids.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const scratch = await fs.mkdtemp(path.join(os.tmpdir(),'discrete-figures-'));
const assert = (ok,why) => { if (!ok) throw new Error(why); };
execFileSync('python3',[path.join(root,'scripts/notes/discrete-distributions-renewal.py')],{stdio:'inherit'});
const content = await Promise.all(['notes','notes-ru'].map(folder => fs.readFile(path.join(root,`src/content/${folder}/probability/discrete-distributions.mdx`),'utf8')));
const maths = text => [...text.matchAll(/\$\$([\s\S]*?)\$\$|(?<!\$)\$(?!\$)([^$\n]+)\$(?!\$)/g)].map(m => m[1]||m[2]);
assert(JSON.stringify(maths(content[0]))===JSON.stringify(maths(content[1])),'Bilingual mathematics differs');
for (const [i,text] of content.entries()) {
  for (const match of text.matchAll(/\$\$([\s\S]*?)\$\$|(?<!\$)\$(?!\$)([^$\n]+)\$(?!\$)/g)) katex.renderToString(match[1]||match[2],{throwOnError:true,strict:'error',displayMode:!!match[1]});
  const codes=[...text.matchAll(/```python\n([\s\S]*?)```/g)].map(m=>m[1]);
  const outputs=[...text.matchAll(/```text\n([\s\S]*?)```/g)].map(m=>m[1]);
  assert(codes.length===1&&outputs.length===1,'Expected one standalone example and output');
  assert(execFileSync('python3',['-c',codes[0]],{encoding:'utf8'})===outputs[0],'Inline output differs');
  const otherCode=[...content[1-i].matchAll(/```python\n([\s\S]*?)```/g)][0][1];
  assert(codes[0]===otherCode,'Bilingual code differs');
  assert(!/horse|Bortkiewicz|копыт|Борткевич|109,\s*65,\s*22|corps-years/i.test(text),'Retired example remains');
  await compile(text.replace(/^---\n[\s\S]*?\n---\n/,''),{remarkPlugins:[remarkMath,remarkHeadingIds],rehypePlugins:[[rehypeKatex,{strict:'error',throwOnError:true}]]});
  console.log(`PASS ${i?'RU':'EN'}: ${maths(text).length} mathematical spans, inline replay, MDX compile`);
}
const cache=new Map();
async function moduleFile(file) {
  if(cache.has(file))return cache.get(file);
  const target=path.join(scratch,`${cache.size}.mjs`);
  cache.set(file,target);
  let code=await fs.readFile(file,'utf8');
  if(file.endsWith('.astro')) {
    const compiled=transform(code,{filename:file,internalURL:'astro/compiler-runtime',resultScopedSlot:true});
    assert(!compiled.diagnostics.some(d=>d.severity==='error'),'Astro compilation failed');
    // Omit build-only import metadata; the standalone container needs the component factory.
    code=compiled.code.replace(/createMetadata as \$\$createMetadata,?/g,'')
      .replace(/export const \$\$metadata = [\s\S]*?\n(?=const \$\$Astro)/,'');
  }
  for(const m of [...code.matchAll(/from\s+(['"])([^'"]+)\1/g)]) {
    let spec=m[2], url;
    if(spec.startsWith('.')) {
      let source=path.resolve(path.dirname(file),spec);
      if(!path.extname(source))source+='.ts';
      url=pathToFileURL(await moduleFile(source)).href;
    } else url=import.meta.resolve(spec);
    code=code.replaceAll(`${m[1]}${spec}${m[1]}`,JSON.stringify(url));
  }
  code=ts.transpileModule(code,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
  await fs.writeFile(target,code);
  return target;
}
const container=await AstroContainer.create();
const css=await fs.readFile(path.join(root,'src/styles/global.css'),'utf8');
for(const lang of ['en','ru']) {
  let html='';
  for(const name of ['PoissonLimit','CountMechanisms']) {
    const target=await moduleFile(path.join(root,`src/components/figures/discrete-distributions/${name}.astro`));
    const component=(await import(pathToFileURL(target).href)).default;
    html+=await container.renderToString(component,{request:new Request(`https://fpakhurov.com/${lang==='ru'?'ru/':''}notes/probability/discrete-distributions`)});
  }
  assert((html.match(/<svg /g)||[]).length===4,'Missing wide/narrow SVG');
  assert(!/NaN|undefined/.test(html), 'Invalid rendered figure: '+html.match(/.{0,70}(?:NaN|undefined).{0,70}/)?.[0]);
  await fs.writeFile(path.join(scratch,`${lang}.html`),`<!doctype html><html lang="${lang}"><meta charset="utf-8"><style>${css}\nbody{margin:0;padding:16px}main{max-width:840px;margin:auto}</style><main class="prose">${html}</main></html>`);
}
console.log('PASS Astro figures: render-time arithmetic, both locales, wide and narrow SVGs');
if(process.argv.includes('--render'))console.log(`Rendered figure previews: ${scratch}`);
else await fs.rm(scratch,{recursive:true,force:true});
