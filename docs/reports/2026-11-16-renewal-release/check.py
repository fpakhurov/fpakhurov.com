from pathlib import Path
import copy,hashlib,json,re,subprocess
b=Path('/Users/fedorpakhurov/code/_work');r=b/'fpakhurov-renewal-release';e=b/'renewal-verification';o=e/'fp-six-integration-peer'
base='32fff9ab5de7e5da2aa083c9e397f2a1015fd796';sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
git=lambda *args:subprocess.check_output(['git',*args],cwd=r)
assert git('rev-parse','HEAD').decode().strip()==base
assert git('branch','--show-current').decode().strip()=='codex/renewal-limits-finetuning-nov16'
packs=[('limits','fp-probability-limit-drafts','limit-theorems-release-files.json','4ed5a5aa8e5367dc4fe3ff9e5471182cbd19ec4b0838cc16a153a0384332b91a','content-rights/reviews/probability-limits-complete.json'),('finetuning','fp-nlp-finetuning-drafts','finetuning-peft-release-files.json','5ea508f750a59acfa313b6ad3789eb424516c1be363a2b7b51735a0353da4ffe','content-rights/reviews/nlp-finetuning-peft-renewal.json'),('estimation','fp-probability-estimation-drafts','estimation-release-files.json','4632931f3d25b07a31c3b31948201c8ed0158e888bd6fa074d12f8cb9b658749','content-rights/reviews/probability-estimation-complete.json')]
copysets={}
copysets['limits']={f'probability-limits-root-{s}':f'root-{d}' for s,d in [('review.md','review.md'),('oracle.py','oracle.py'),('oracle.json','oracle.json'),('source-reading.json','source-reading.json'),('strict-final.json','strict.json'),('final-closure.json','final-closure.json')]}
copysets['limits'].update({f'probability-limits-peer/{s}':f'second-{d}' for s,d in [('peer-review.md','review.md'),('oracle.py','oracle.py'),('oracle.json','oracle.json'),('closure.py','closure.py'),('closure.json','closure.json')]})
copysets['finetuning']={f'finetuning-root-{s}':f'root-{s}' for s in ['review.md','oracle.py','oracle.json','strict.json','closure.json']}
copysets['finetuning'].update({f'fp-finetuning-peft-peer/{s}':f'second-{s}' for s in ['peer-review.md','oracle.py','oracle.json','closure.py','closure.json','metadata-closure.mjs','metadata-closure.json','fresh-check.json','reviewed-files.json']})
copysets['estimation']={f'estimation-root-{s}':f'root-{s}' for s in ['review.md','oracle.py','oracle.json','strict-final.json','source-reading.json','final-closure.json']}
copysets['estimation'].update({f'probability-estimation-peer/{s}':f'second-{s}' for s in ['peer-review.md','oracle.py','oracle.json','closure.py','closure.json','identity.py','identity.json','fresh-check.json','source-replay.json','reviewed-files.json']})
dirs={'limits':'docs/reports/2026-11-16-probability-limits/peer','finetuning':'docs/reports/2026-11-16-nlp-renewal/finetuning-peft-peer','estimation':'docs/reports/2026-11-16-probability-estimation/peer'}
allauthor={};deletions={};proofs={};recorddiffs={};scope=set();summaries=[]
for key,draftname,manifestname,expected,rp in packs:
 d=b/draftname;mp=d/manifestname;assert sha(mp)==expected
 m=json.loads(mp.read_text());files=m['sha256'] if key=='limits' else m['files'];deleted=m['deleteSourceSha256'] if key=='limits' else m.get('deleteFiles',{})
 for p,digest in files.items():
  assert sha(d/p)==digest
  if p in allauthor:assert allauthor[p]==digest
  allauthor[p]=digest
  if p!=rp:assert sha(r/p)==digest,p
 for p,digest in deleted.items():
  assert not (r/p).exists();assert hashlib.sha256(git('show',base+':'+p)).hexdigest()==digest;deletions[p]=digest
 copied={}
 for source,name in copysets[key].items():
  dest=dirs[key]+'/'+name;assert (r/dest).read_bytes()==(e/source).read_bytes(),dest;copied[dest]=sha(r/dest);proofs[dest]={'source':source,'sha256':sha(r/dest)}
 old=json.loads((d/rp).read_text());new=json.loads((r/rp).read_text())
 assert new['files']=={**old['files'],**copied}
 for p,digest in new['files'].items():assert sha(r/p)==digest,p
 # Permit only reviewed coordinator metadata updates; preserve source scope and notices.
 a=copy.deepcopy(old);n=copy.deepcopy(new)
 diffs={}
 for field in ['reviewer','summary','remainingReview']:
  if a.get(field)!=n.get(field):diffs[field]={'old':a.get(field),'new':n.get(field)}
  a.pop(field,None);n.pop(field,None)
 a.pop('files');n.pop('files')
 for field in ['limits','independentPeer','independentPeers']:
  if a['checks'].get(field)!=n['checks'].get(field):diffs['checks.'+field]={'old':a['checks'].get(field),'new':n['checks'].get(field)}
  a['checks'].pop(field,None);n['checks'].pop(field,None)
 for i,(x,y) in enumerate(zip(a['sources'],n['sources'])):
  assert x['id']==y['id']
  for field in ['locator','verification']:
   if x.get(field)!=y.get(field):
    if field=='locator':assert isinstance(x[field],list) and y[field]==' '.join(x[field])
    else:assert isinstance(y[field],str) and y[field]
    diffs[f"sources[{i}].{field}"]={'old':x.get(field),'new':y.get(field)}
    x.pop(field,None);y.pop(field,None)
 assert a==n,key
 recorddiffs[rp]=diffs
 listed=json.loads((e/f'{key}-integrated-release-files.json').read_text());assert len(listed)==len(set(listed));scope.update(listed)
 summaries.append({'package':key,'authorManifestSha256':expected,'authorPaths':len(files),'copiedPeerProofs':len(copied),'recordPins':len(new['files']),'recordSha256':sha(r/rp)})
admin={'content-rights/renewal-inventory.json','src/data/withdrawnNotes.json','docs/reports/2026-11-13-licensed-source-renewal/nlp-restoration-history.json'}
assert scope==set(allauthor)|set(deletions)|set(proofs)|admin
changed=set(git('diff','--name-only',base).decode().splitlines())|set(git('ls-files','--others','--exclude-standard').decode().splitlines())
assert changed<=scope,changed-scope
shared={'src/components/figures/Figure.astro','src/utils/lang.ts','src/plugins/remark-heading-ids.mjs'}
assert scope-changed==shared,(scope-changed)
for p in shared:assert (r/p).read_bytes()==git('show',base+':'+p)
# The whole diff allowlist excludes all baseline, graph, runtime, workflow and unrelated source paths.
baseline={}
for p in git('ls-files','content-rights').decode().splitlines():
 if 'baseline' in p:
  assert (r/p).read_bytes()==git('show',base+':'+p);baseline[p]=sha(r/p)
assert baseline

def oldjson(p):return json.loads(git('show',base+':'+p))
invpath='content-rights/renewal-inventory.json';old=oldjson(invpath);new=json.loads((r/invpath).read_text())
targets={'probability/law-of-large-numbers','probability/central-limit-theorem','nlp/fine-tuning','nlp/peft','probability/estimators','probability/maximum-likelihood'}
changedtopics=[]
for a,n in zip(old['fpTopics'],new['fpTopics']):
 assert a['id']==n['id']
 if a!=n:
  changedtopics.append(n['id']);assert n['id'] in targets;assert n['reviewStatus']=='reviewed-complete';assert n['publicationStatus']=='published'
  for p,digest in n['files'].items():assert sha(r/p)==digest
  urls=set()
  for p in n['files']:urls.update(re.findall(r'https?://[^\s)>\]"\x27]+',(r/p).read_text()))
  assert n['sourceUrls']==sorted(urls);assert n['sourceUrlCount']==len(urls)
  for k in set(a)|set(n):
   if k not in ['reviewStatus','publicationStatus','files','sourceUrls','sourceUrlCount','reviewRecord']:assert a.get(k)==n.get(k)
assert set(changedtopics)==targets and len(changedtopics)==6
for k in set(old)|set(new):
 if k not in ['fpTopics','counts']:assert old[k]==new[k],k
for k,v in new['counts'].items():
 if k=='fpReviewedComplete':assert v==83==sum(t['reviewStatus']=='reviewed-complete' for t in new['fpTopics'])
 elif k=='fpPublished':assert v==342==sum(t['publicationStatus']=='published' for t in new['fpTopics'])
 elif k=='fpWithheld':assert v==11==sum(t['publicationStatus']=='needs-review' for t in new['fpTopics'])
 else:assert old['counts'][k]==v,k
heldpath='src/data/withdrawnNotes.json';oldheld=oldjson(heldpath);newheld=json.loads((r/heldpath).read_text());assert newheld==[x for x in oldheld if x not in ['nlp/fine-tuning','nlp/peft']];assert len(newheld)==11
hp='docs/reports/2026-11-13-licensed-source-renewal/nlp-restoration-history.json';a=oldjson(hp);n=json.loads((r/hp).read_text());assert n['reviewedReplacements'][:len(a['reviewedReplacements'])]==a['reviewedReplacements'];added=n['reviewedReplacements'][len(a['reviewedReplacements']):];assert {x['id'] for x in added}=={'nlp/fine-tuning','nlp/peft'} and len(added)==2
for row in added:assert row=={'id':row['id'],'reviewRecord':'content-rights/reviews/nlp-finetuning-peft-renewal.json','previousStatus':'withheld','newStatus':'reviewed-replacement','withdrawalRegistryRevision':base}
for k in a:
 if k not in ['scope','reviewedReplacements']:assert a[k]==n[k]
# Distinguish formatting-only proof output differences from data changes.
comparison=[]
for fresh,saved in [('fp-finetuning-peft-peer/fresh-check.json','docs/reports/2026-11-16-nlp-renewal/finetuning-peft-checks.json'),('probability-estimation-peer/fresh-check.json','docs/reports/2026-11-16-probability-estimation/verification.json')]:
 x=(e/fresh).read_bytes();y=(r/saved).read_bytes();assert json.loads(x)==json.loads(y);assert x.rstrip()==y.rstrip()
 comparison.append({'freshProof':fresh,'savedReport':saved,'byteEqual':x==y,'sameJson':True,'difference':'none' if x==y else 'Only trailing newline whitespace','freshSha256':hashlib.sha256(x).hexdigest(),'savedSha256':hashlib.sha256(y).hexdigest()})
result={'status':'PASS','baseRevision':base,'branch':'codex/renewal-limits-finetuning-nov16','packages':summaries,'scopePaths':len(scope),'existingScopePaths':len(scope)-len(deletions),'changedPaths':len(changed),'uniqueFrozenAuthorPaths':len(allauthor),'byteExactNonrecordAuthorPaths':len(allauthor)-3,'copiedPeerProofs':len(proofs),'recordPins':sum(s['recordPins'] for s in summaries),'deletedFiles':deletions,'baseline':baseline,'inventoryChangedTopics':sorted(changedtopics),'counts':new['counts'],'heldTopics':newheld,'historyAppended':added,'jsonComparisons':comparison,'currentFiles':{p:sha(r/p) for p in sorted(scope-set(deletions))},'proofCopies':proofs,'scope':'Read-only bounded integration closure; inherits completed full scoped peers, no repeated math/build/browser/CI and no publication claim.'}
(o/'verification.json').write_text(json.dumps(result,indent=2)+'\n');(o/'record-deltas.json').write_text(json.dumps(recorddiffs,indent=2)+'\n')
print(json.dumps({k:result[k] for k in ['status','scopePaths','existingScopePaths','changedPaths','uniqueFrozenAuthorPaths','byteExactNonrecordAuthorPaths','copiedPeerProofs','recordPins','jsonComparisons']},indent=2))
