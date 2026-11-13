import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { checkRights } from './check-source-rights.mjs';

const digest = (text) => createHash('sha256').update(text).digest('hex');
function fixture(t, project = 'fpakhurov') {
  const root = mkdtempSync(path.join(os.tmpdir(), 'course-rights-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const write = (name, data) => {
    mkdirSync(path.dirname(path.join(root, name)), { recursive: true });
    writeFileSync(path.join(root, name), typeof data === 'string' ? data : `${JSON.stringify(data)}\n`);
  };
  const en = 'src/content/notes/demo/example.mdx';
  const ru = 'src/content/notes-ru/demo/example.mdx';
  const initial = '---\nstatus: published\n---\nOriginal baseline.\n';
  write(en, initial); write(ru, initial);
  write('content-rights/config.json', {schemaVersion:1, project, protectedDirectories:['src/content/notes','src/content/notes-ru']});
  write('content-rights/baseline.json', {schemaVersion:1,status:'inventory-not-clearance',revision:'a'.repeat(40),files:{[en]:digest(initial),[ru]:digest(initial)}});
  const text = '---\nstatus: published\n---\nIndependently revised example.\n';
  const review = {schemaVersion:1,id:'demo-example',status:'reviewed',scope:'complete',reviewer:'Test reviewer',reviewedAt:'2026-11-13',summary:'Checks only this synthetic test.',files:{[en]:digest(text),[ru]:digest(text)},sources:[{id:'original',title:'Original example',creator:'Fixture author',use:'original',material:'Example prose',authorship:'New fixture text',method:'Hand calculation',verification:'Recomputed'}],checks:{technical:'Checked',bilingual:'Checked',independence:'Checked',assets:'No third-party assets'}};
  const approve = () => write('content-rights/reviews/demo-example.json', review);
  const revise = () => { write(en,text); write(ru,text); };
  return {root,write,en,ru,text,review,approve,revise};
}
test('unchanged baseline is counted as unreviewed, not approved', async (t) => {
  const f=fixture(t); const result=await checkRights(f.root);
  assert.equal(result.reviewedRecords,0); assert.equal(result.baselineFilesWithoutNewReview,2);
});
test('new teaching file cannot silently inherit baseline clearance', async (t) => {
  const f=fixture(t); f.write('src/content/notes/demo/new.mdx','New text');
  await assert.rejects(checkRights(f.root),/New or changed teaching files/);
});
test('changed teaching files require current review', async (t) => {
  const f=fixture(t); f.revise();
  await assert.rejects(checkRights(f.root),/New or changed teaching files/);
  f.approve(); assert.equal((await checkRights(f.root)).reviewedRecords,1);
});
test('draft review cannot clear changed files', async (t) => {
  const f=fixture(t); f.revise(); f.review.status='draft'; f.approve();
  await assert.rejects(checkRights(f.root),/New or changed teaching files/);
});
test('subsequent content edits invalidate approval', async (t) => {
  const f=fixture(t); f.revise(); f.approve(); f.write(f.en,f.text+'Changed after review.');
  await assert.rejects(checkRights(f.root),/stale review/);
});
test('review cannot cover only one language', async (t) => {
  const f=fixture(t); f.revise(); delete f.review.files[f.ru]; f.approve();
  await assert.rejects(checkRights(f.root),/missing bilingual review/);
});
test('unlicensed adaptation is refused while factual reference remains possible', async (t) => {
  const f=fixture(t); f.revise();
  const source={id:'external',title:'External source',creator:'Maintainer',use:'reuse',material:'Exact adapted example',verification:'Checked file',url:'https://example.org/source',revision:'v1',locator:'Section 1',license:'NOASSERTION',licenseUrl:'https://example.org/license',scope:'Named example',changes:'Translated'};
  f.review.sources=[source]; f.approve();
  await assert.rejects(checkRights(f.root),/specific compatibility\/permission review/);
  source.use='reference'; source.material='Checked a fact; no example or prose copied'; f.approve();
  await checkRights(f.root);
});
test('permissive adaptation still needs a delivered and hash-pinned notice', async (t) => {
  const f=fixture(t); f.revise();
  const source={id:'external',title:'External source',creator:'Maintainer',use:'reuse',material:'Exact adapted example',verification:'Checked file',url:'https://example.org/source',revision:'v1',locator:'Section 1',license:'MIT',licenseUrl:'https://example.org/license',scope:'Named example',changes:'Translated'};
  f.review.sources=[source]; f.approve();
  await assert.rejects(checkRights(f.root),/requires delivered notices/);
  source.notices=[{path:'public/notices/example.txt',text:'Copyright maintainer'}]; f.approve();
  await assert.rejects(checkRights(f.root),/missing notice/);
  f.write('public/notices/example.txt','Copyright maintainer'); f.review.files['public/notices/example.txt']=digest('Copyright maintainer'); f.approve();
  await checkRights(f.root);
});
test('BIASED cannot publish a new review without pinned reviewed notes', async (t) => {
  const f=fixture(t,'biased'); f.revise(); f.approve();
  await assert.rejects(checkRights(f.root),/reviewed fpakhurov.com source/);
});
test('BIASED verifies upstream bytes and review coverage, not just a URL', async (t) => {
  const f=fixture(t,'biased'); f.revise();
  const upstreamReview=JSON.stringify({...f.review});
  f.review.upstream={repository:'fpakhurov/fpakhurov.com',revision:'b'.repeat(40),reviewPath:'content-rights/reviews/demo-example.json',reviewSha256:digest(upstreamReview),notes:[{path:f.en,sha256:digest(f.text)},{path:f.ru,sha256:digest(f.text)}]};
  f.approve();
  const fetcher=async(url)=>new Response(url.endsWith('.json')?upstreamReview:f.text);
  await checkRights(f.root,{verifyRemote:true,fetcher});
  await assert.rejects(checkRights(f.root,{verifyRemote:true,fetcher:async()=>new Response('unexpected')}),/hash mismatch/);
  await assert.rejects(checkRights(f.root,{verifyRemote:true,fetcher:async()=>new Response('',{status:404})}),/HTTP 404/);
});
test('retired material can be removed without inventing a clearance record', async (t) => {
  const f=fixture(t); rmSync(path.join(f.root,f.en)); rmSync(path.join(f.root,f.ru));
  assert.equal((await checkRights(f.root)).teachingFiles,0);
});

test('baseline hashes must match the actual pinned Git objects', async (t) => {
  const f=fixture(t);
  const git=(args)=>execFileSync('git',args,{cwd:f.root,encoding:'utf8'}).trim();
  git(['init','-q']); git(['add','src']);
  git(['-c','user.name=Rights Test','-c','user.email=rights-test@example.invalid','-c','commit.gpgsign=false','commit','-qm','Original baseline']);
  const baseline={schemaVersion:1,status:'inventory-not-clearance',revision:git(['rev-parse','HEAD']),files:{[f.en]:digest('---\nstatus: published\n---\nOriginal baseline.\n'),[f.ru]:digest('---\nstatus: published\n---\nOriginal baseline.\n')}};
  f.write('content-rights/baseline.json',baseline);
  await checkRights(f.root,{verifyGitBaseline:true,baselineAnchor:baseline.revision});
  f.revise(); baseline.files[f.en]=digest(f.text); f.write('content-rights/baseline.json',baseline);
  await assert.rejects(checkRights(f.root,{verifyGitBaseline:true,baselineAnchor:baseline.revision}),/Baseline hash differs/);
});
test('maintenance is bounded to baseline files and is not full clearance', async (t) => {
  const f=fixture(t); f.revise(); f.review.scope='maintenance'; f.review.baselineRevision='a'.repeat(40); f.review.remainingReview='Unchanged legacy examples remain pending'; f.approve();
  const result=await checkRights(f.root); assert.equal(result.reviewedRecords,0); assert.equal(result.maintenanceRecords,1);
  f.write('src/content/notes/demo/new.mdx',f.text); f.review.files['src/content/notes/demo/new.mdx']=digest(f.text); f.approve();
  await assert.rejects(checkRights(f.root),/new files require a complete review/);
});

test('a complete review cannot omit an imported legacy figure', async (t) => {
  const f=fixture(t); f.revise();
  const figure='src/components/figures/Legacy.astro'; f.write(figure,'<svg></svg>');
  const text=f.text+"\nimport Legacy from '../../../components/figures/Legacy.astro';\n<Legacy />\n";
  f.write(f.en,text); f.write(f.ru,text); f.review.files[f.en]=digest(text); f.review.files[f.ru]=digest(text); f.approve();
  await assert.rejects(checkRights(f.root),/omits local dependency/);
  f.review.files[figure]=digest('<svg></svg>'); f.approve(); await checkRights(f.root);
});
test('BIASED notebook preview and download routes require the actual reviewed notebook', async (t) => {
  const f=fixture(t,'biased'); f.revise();
  f.review.upstream={repository:'fpakhurov/fpakhurov.com',revision:'b'.repeat(40),reviewPath:'content-rights/reviews/demo-example.json',reviewSha256:'c'.repeat(64),notes:[{path:f.en,sha256:digest(f.text)},{path:f.ru,sha256:digest(f.text)}]};
  const text=f.text+'\n[Preview](/notebooks/demo-lab/?lang=en#code)\n[Download](/api/notebooks/demo-lab)\n';
  f.write(f.en,text); f.write(f.ru,text); f.review.files[f.en]=digest(text); f.review.files[f.ru]=digest(text); f.approve();
  await assert.rejects(checkRights(f.root),/Cannot resolve reviewed local dependency/);
  const notebook='content/notebooks/demo-lab.ipynb';
  const bytes=JSON.stringify({cells:[],nbformat:4,nbformat_minor:5,metadata:{}});
  f.write(notebook,bytes);
  await assert.rejects(checkRights(f.root),/omits local dependency content\/notebooks\/demo-lab.ipynb/);
  f.review.files[notebook]=digest(bytes); f.approve(); await checkRights(f.root);
  f.write(notebook,bytes+'\n');
  await assert.rejects(checkRights(f.root),/stale review: content\/notebooks\/demo-lab.ipynb/);
});
test('notebook files with extensions keep static asset resolution on both sites', async (t) => {
  for (const project of ['fpakhurov','biased']) {
    const f=fixture(t,project); f.revise();
    if (project==='biased') f.review.upstream={repository:'fpakhurov/fpakhurov.com',revision:'b'.repeat(40),reviewPath:'content-rights/reviews/demo-example.json',reviewSha256:'c'.repeat(64),notes:[{path:f.en,sha256:digest(f.text)},{path:f.ru,sha256:digest(f.text)}]};
    const text=f.text+'\n[Static download](/notebooks/example.ipynb)\n';
    f.write(f.en,text); f.write(f.ru,text); f.review.files[f.en]=digest(text); f.review.files[f.ru]=digest(text);
    const asset=(project==='biased'?'apps/web/public':'public')+'/notebooks/example.ipynb';
    f.write(asset,'{}'); f.review.files[asset]=digest('{}'); f.approve(); await checkRights(f.root);
  }
});
test('the baseline cannot be advanced to a newer real commit', async (t) => {
  const f=fixture(t); const git=(args)=>execFileSync('git',args,{cwd:f.root,encoding:'utf8'}).trim();
  git(['init','-q']); git(['add','src']);
  const commit=()=>git(['-c','user.name=Rights Test','-c','user.email=rights-test@example.invalid','-c','commit.gpgsign=false','commit','-qm','Fixture']);
  commit(); const anchor=git(['rev-parse','HEAD']); f.revise(); git(['add','src']); commit();
  f.write('content-rights/baseline.json',{schemaVersion:1,status:'inventory-not-clearance',revision:git(['rev-parse','HEAD']),files:{[f.en]:digest(f.text),[f.ru]:digest(f.text)}});
  await assert.rejects(checkRights(f.root,{verifyGitBaseline:true,baselineAnchor:anchor}),/inventory anchor cannot move/);
});
