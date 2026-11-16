import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
const host='/Users/fedorpakhurov/code/_work/fpakhurov-renewal-release';
const root='/Users/fedorpakhurov/code/_work/fp-nlp-finetuning-drafts';
const output='/Users/fedorpakhurov/code/_work/renewal-verification/fp-finetuning-peft-peer';
const require=createRequire(path.join(host,'package.json'));
const yaml=require('yaml');
const {default:Slugger}=await import(require.resolve('github-slugger'));
const record=JSON.parse(fs.readFileSync(path.join(root,'docs/reports/2026-11-16-nlp-renewal/finetuning-peft-curriculum.json'),'utf8'));
const allowed=['title','course','section','order','status','tags','prerequisites'];
const results=[];
for(const [slug,locales] of Object.entries(record.topics))for(const [locale,entry] of Object.entries(locales)){
 // Historical bytes stay inside the extraction process; no teaching prose is printed or saved.
 const blob=execFileSync('git',['show',`${record.revision}:${entry.path}`],{cwd:host,encoding:'utf8'});
 const front=blob.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/)[1];
 const lines=front.split(/\r?\n/).filter(line=>allowed.some(key=>line.startsWith(key+':')));
 const metadata=yaml.parse(lines.join('\n'));
 assert.deepEqual(metadata,entry.metadata);
 assert.deepEqual(lines,entry.identityLines);
 const clean=blob.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/,'').replace(/^```[^\n]*\n[\s\S]*?^```[^\n]*$/gm,'');
 const slugger=new Slugger();
 const anchors=[];
 for(const line of clean.split(/\r?\n/)){
  const heading=line.match(/^#{1,6}\s+(.+?)\s*$/);if(!heading)continue;
  const explicit=heading[1].match(/\\?\{#([^\s{}\\]+)\\?\}\s*$/);
  anchors.push(explicit?explicit[1]:slugger.slug(heading[1]));
 }
 assert.deepEqual(anchors,entry.anchors);
 results.push({topic:slug,locale,identityFields:allowed.length,anchors:anchors.length,exactIdentityAndAnchorMatch:true});
}
fs.writeFileSync(path.join(output,'metadata-closure.json'),JSON.stringify({status:'PASS',revision:record.revision,results,scope:'Historical allowlist and heading IDs only. No historical descriptions, narrative, imports, examples, code, figures or results shown or retained as teaching input.'},null,2)+'\n');
console.log(JSON.stringify({status:'PASS',results}));
