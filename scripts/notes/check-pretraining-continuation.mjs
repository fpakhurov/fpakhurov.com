// Original bounded author checks; run from the FP repository with draft root argument.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
const require=createRequire(path.resolve('package.json'));
const {compile}=await import(require.resolve('@mdx-js/mdx'));
const {default:remarkMath}=await import(require.resolve('remark-math'));
const {default:remarkGfm}=await import(require.resolve('remark-gfm'));
const {default:rehypeKatex}=await import(require.resolve('rehype-katex'));
const {rehypeHeadingIds}=await import(require.resolve('@astrojs/markdown-remark'));
const root=path.resolve(process.argv[2]||'.');
const slug=process.argv[3];
assert(['evolution-of-pretrained-models','model-families','scaling-laws','pretraining-data'].includes(slug));
const report='docs/reports/2026-11-16-nlp-pretraining-foundations';
const helper='src/plugins/remark-heading-ids.mjs';
assert(fs.readFileSync(path.join(root,helper)).equals(fs.readFileSync(helper)));
const {default:headingIds}=await import(pathToFileURL(path.resolve(helper)));
const metadata=JSON.parse(fs.readFileSync(path.join(root,report,`${slug}-curriculum.json`))).metadata;
const expected=metadata.ru.headings.map(x=>x.match(/\\\{#([^}]+)\\\}/)[1]);
const saved=fs.readFileSync(path.join(root,report,`${slug}-results.json`));
const replay=execFileSync('python3',['-B',path.join(root,`scripts/notes/${slug}-cases.py`)]);
assert(saved.equals(replay));
const result={topic:slug,scope:'Full paired strict MDX/KaTeX and saved stdlib replay; no browser, build, CI or publication claim',locales:[]};
const pairs=[];
for(const [locale,folder] of [['en','notes'],['ru','notes-ru']]){
 const full=fs.readFileSync(path.join(root,`src/content/${folder}/nlp/${slug}.mdx`),'utf8');
 const front=full.match(/^---\n([\s\S]*?)\n---\n/)[1];
 for(const key of ['title','course','section','order','status','tags','prerequisites']){
  const line=x=>x.split('\n').find(l=>l.startsWith(key+':'));
  assert.equal(line(front),line(metadata[locale].frontmatter));
 }
 const source=full.replace(/^---\n[\s\S]*?\n---\n/,'');
 assert(!/^import |<img|!\[/m.test(source.replace(/```[\s\S]*?```/g,'')));
 assert(source.split('\n').every(l=>!l.includes('$$')||l.trim()==='$$'));
 const math=[...source.matchAll(/\$\$([\s\S]*?)\$\$|(?<!\$)\$(?!\$)([^$\n]+)\$(?!\$)/g)].map(x=>x[1]??x[2]);
 const snippets=[...source.matchAll(/```python\n([\s\S]*?)```/g)].map(x=>x[1]);
 const outputs=[...source.matchAll(/```text\n([\s\S]*?)```/g)].map(x=>x[1]);
 assert.equal(snippets.length,1);assert.equal(outputs.length,1);
 assert.equal(execFileSync('python3',['-B','-c',snippets[0]],{encoding:'utf8'}),outputs[0]);
 let parsed=0,displays=0,tables=0;const ids=[];
 const mathInspector=()=>tree=>{function walk(n){if(['math','inlineMath'].includes(n.type)){parsed++;if(n.type==='math')displays++;assert(!n.value.includes('\n\n'));}for(const c of n.children||[])walk(c)}walk(tree)};
 const htmlInspector=()=>tree=>{function walk(n){if(/^h[1-6]$/.test(n.tagName||''))ids.push(n.properties?.id);if(n.tagName==='table')tables++;for(const c of n.children||[])walk(c)}walk(tree)};
 const compiled=await compile(source,{remarkPlugins:[remarkGfm,remarkMath,headingIds,mathInspector],rehypePlugins:[[rehypeKatex,{throwOnError:true,strict:'error'}],rehypeHeadingIds,htmlInspector]});
 assert.equal(compiled.messages.length,0);assert.deepEqual(ids,expected);assert.equal(parsed,math.length);
 assert.equal(ids.length,new Set(ids).size);
 pairs.push({math,snippets,outputs,ids});
 result.locales.push({locale,headings:ids.length,mathSpans:parsed,displayMath:displays,tables,inlineReplay:'exact'});
}
assert.deepEqual(pairs[0],pairs[1]);
result.python=execFileSync('python3',['--version'],{encoding:'utf8'}).trim();
result.fixtureSha256=crypto.createHash('sha256').update(saved).digest('hex');
fs.writeFileSync(path.join(root,report,`${slug}-verification.json`),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
