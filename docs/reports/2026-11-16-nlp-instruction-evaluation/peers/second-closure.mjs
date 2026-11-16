import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';import {createRequire} from 'node:module';
const host=process.cwd(),root='/Users/fedorpakhurov/code/_work/fp-nlp-instruction-evaluation-drafts',out='/Users/fedorpakhurov/code/_work/renewal-verification/instruction-evaluation-peer';
const require=createRequire(path.join(host,'package.json')),yaml=require('yaml');const sha=b=>crypto.createHash('sha256').update(b).digest('hex');const read=p=>fs.readFileSync(path.join(root,p));const json=p=>JSON.parse(read(p));const report='docs/reports/2026-11-16-nlp-instruction-evaluation/';
const mp='instruction-evaluation-release-files.json',manifest=json(mp),record=json('content-rights/reviews/nlp-instruction-evaluation-renewal.json'),sources=json(report+'source-evidence.json'),curr=json(report+'curriculum.json');
assert.equal(sha(read(mp)),'40b7a9d38a0ce9fef8f6ba676f2a4f5147ffbabdd5190e6116ef42e87b0c8f6f');
for(const [p,h] of Object.entries(manifest.files)){assert.equal(sha(read(p)),h,p);assert(!p.startsWith('sources/'));assert(!/[ \t]+$/m.test(read(p).toString()),p+' trailing whitespace');}
for(const [p,h]of Object.entries(record.files)){assert.equal(manifest.files[p],h,p);assert.equal(sha(read(p)),h);}
assert.equal(Object.keys(manifest.files).length,26);assert.equal(Object.keys(record.files).length,25);
for(const s of record.sources){assert(s.verification);if(s.use==='original')for(const f of ['authorship','method'])assert(s[f]);if(s.use==='reference'){assert.equal(typeof s.locator,'string');assert(s.reuseDecision);}}
const pins=[];
for(const [id,s] of Object.entries(sources.sources)){
 const rs=record.sources.find(x=>x.id===id);assert(rs);assert.equal(rs.locator,s.locator);assert.deepEqual(rs.privateSnapshots,s.files);
 for(const [kind,f]of Object.entries(s.files)){const b=read(f.path);assert.equal(sha(b),f.sha256,f.path);assert.equal(b.length,f.bytes);pins.push({id,kind,...f});}
 if(s.files.abstract && id!=='dror'){const html=read(s.files.abstract.path).toString();for(const notice of rs.noticeLinks)assert(html.includes(notice));}
}
assert.equal(pins.length,27);assert.equal(sha(read(report+'plan.md')),sources.planSha256);assert.equal(read('PLAN.md').toString(),read(report+'plan.md').toString());
const firstparty=[];
for(const [p,v]of Object.entries(sources.existingProjectFiles)){const git=execFileSync('git',['show',v.revision+':'+p],{cwd:host});assert.equal(sha(git),v.sha256);assert.equal(sha(read(p)),v.sha256);firstparty.push({path:p,...v});}
const cw=sources.checkerWorkflow;assert.equal(sha(execFileSync('git',['show',cw.revision+':'+cw.path],{cwd:host})),cw.sha256);
const identities=[];
for(const [p,expected]of Object.entries(curr.files)){
 // Only the allowlisted projection escapes this process. No legacy prose or code is printed or retained.
 const raw=execFileSync('git',['show',curr.revision+':'+p],{cwd:host,encoding:'utf8'});const front=yaml.parse(raw.match(/^---\n([\s\S]*?)\n---\n/)[1]);const metadata=Object.fromEntries(sources.identity.allowedFields.map(k=>[k,front[k]]));assert.deepEqual(metadata,expected.metadata,p);
 let fence=null;const headings=[],importIds=[];
 for(const line of raw.split('\n')){const f=line.match(/^\s*(`{3,}|~{3,})/);if(f){if(!fence)fence=f[1][0];else if(fence===f[1][0])fence=null;continue;}if(fence)continue;
  const h=line.match(/^(#{2,6})\s+(.+)$/);if(h){const explicit=h[2].match(/\\?\{#([^}]+)\\?\}/);const id=explicit?explicit[1].replace(/\\$/,''):h[2].toLowerCase().replace(/[`*_]/g,'').replace(/[^a-z0-9 -]/g,'').trim().replace(/ +/g,'-');headings.push({level:h[1].length,id});}
  const i=line.match(/^import\s+(\w+)\s+from\s/);if(i)importIds.push(i[1]);
 }
 assert.deepEqual(headings,expected.headings,p);assert.deepEqual(importIds,expected.importIds,p);identities.push({path:p,metadata,headings,importIds});
}
const before=JSON.parse(fs.readFileSync(path.join(out,'reading-snapshot.json'),'utf8'));const output={status:'PASS',manifestSha256:sha(read(mp)),manifestFiles:Object.keys(manifest.files).length,recordPins:Object.keys(record.files).length,privateSourcePins:pins,firstPartyPins:firstparty,checkerWorkflowPin:cw,identityRevision:curr.revision,identities,planSha256:sources.planSha256,limits:'Exact source bytes and bounded scientific reading; no raw third-party assets in release, no withdrawn narrative/code retained; scoped peer is not full-course clearance or publication evidence.'};
fs.writeFileSync(path.join(out,'closure.json'),JSON.stringify(output,null,2)+'\n');fs.writeFileSync(path.join(out,'reviewed-files.json'),JSON.stringify({manifest:mp,manifestSha256:output.manifestSha256,files:manifest.files},null,2)+'\n');console.log(JSON.stringify({status:output.status,files:output.manifestFiles,pins:output.recordPins,snapshots:pins.length,identityFiles:identities.length,manifest:output.manifestSha256}));
