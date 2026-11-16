"""Read-only candidate/source/identity closure; historical bodies are never printed."""
import hashlib,json,re,subprocess
from pathlib import Path
ROOT=Path('/Users/fedorpakhurov/code/_work/fp-probability-interval-tests-drafts')
HOST=Path('/Users/fedorpakhurov/code/_work/fpakhurov-renewal-release')
OUT=Path(__file__).resolve().parent
sha=lambda b:hashlib.sha256(b).hexdigest()
def readj(p):return json.loads((ROOT/p).read_text())
def git(rev,p):return subprocess.check_output(['git','show',f'{rev}:{p}'],cwd=HOST)
manifest_name='interval-tests-release-files.json';manifest=readj(manifest_name)
files=manifest['files'];record_path='content-rights/reviews/probability-interval-tests-complete.json';record=readj(record_path)
assert len(files)==24 and len(record['files'])==23
for p,h in files.items():assert sha((ROOT/p).read_bytes())==h,p
assert record['files']=={p:h for p,h in files.items() if p!=record_path}
assert set(record['perFileProvenance'])==set(record['files'])
ids={s['id'] for s in record['sources']}
for p,origin in record['perFileProvenance'].items():
 assert origin['sourceIds'] and set(origin['sourceIds'])<=ids,p
assert set(record['perFileProvenance']['scripts/check-interval-tests-renewal.mjs']['sourceIds'])=={'probability-interval-tests-original','fp-rendering-helpers'}
for source in record['sources']:
 for key in ['id','title','creator','use','material','verification']:assert isinstance(source[key],str) and source[key]
 if source['use']=='original':
  for key in ['authorship','method']:assert isinstance(source[key],str) and source[key]
 else:
  assert source['use']=='reference'
  for key in ['url','revision','locator']:assert isinstance(source[key],str) and source[key]
assert manifest['deleteFiles']=={}
assert not any(p.startswith('sources/') or p.endswith(('.pdf','.png')) for p in files)
identity=readj('curriculum-identity.json');rev=identity['revision'];allowed=set(identity['allowedFields'])
assert identity==readj('docs/reports/2026-11-16-probability-interval-tests/curriculum-identity.json')
for row in identity['files']:
 raw=git(rev,row['path']);assert sha(raw)==row['sha256']==manifest['replacedFiles'][row['path']]
 # Project only approved metadata, import bindings and headings outside fences.
 text=raw.decode();fm=text.split('---\n',2)[1]
 metadata={line.split(':',1)[0]:line.split(':',1)[1].strip() for line in fm.splitlines() if ':' in line and line.split(':',1)[0] in allowed}
 headings=[];fence=False
 for line in text.splitlines():
  if line.startswith('```'):fence=not fence
  elif not fence and re.match(r'^#{1,6} ',line):headings.append(line)
 imports=re.findall(r'^import \w+ from [^\n]+;$',text,re.M)
 assert metadata==row['metadata'] and headings==row['headingsOutsideFences'] and imports==row['importIdentityOnly']
 del raw,text,fm
figures=readj('figure-identity.json')
assert figures==readj('docs/reports/2026-11-16-probability-interval-tests/figure-identity.json')
for row in figures:
 raw=git(rev,row['path']);assert sha(raw)==row['sha256']==manifest['replacedFiles'][row['path']]
 literals=re.findall(rb'const\s+id\s*=\s*[\x27\x22]([^\x27\x22]+)[\x27\x22]',raw)
 assert [v.decode() for v in literals]==row['staticIdLiterals']
 del raw,literals
sources=readj('docs/reports/2026-11-16-probability-interval-tests/source-evidence.json')
assert len(sources['sources'])==8
for s in sources['sources']:
 assert s in record['sources']
 assert sha((ROOT/s['snapshotPath']).read_bytes())==s['snapshotSha256']
 assert sha((ROOT/s['snapshotPath']).with_suffix('.txt').read_bytes())==s['textSha256']
 assert s['use']=='reference'
for helper in sources['firstPartyHelpers']:
 p=helper['path'];raw=git(helper['revision'],p)
 assert raw==(ROOT/p).read_bytes()
 assert sha(raw)==helper['sha256']==files[p]
 assert subprocess.check_output(['git','rev-parse',f"{helper['revision']}:{p}"],cwd=HOST,text=True).strip()==helper['gitBlob']
reuse=sources['checkerReuse']
assert subprocess.check_output(['git','rev-parse',f"{reuse['sourceRevision']}:{reuse['source']}"],cwd=HOST,text=True).strip()==reuse['sourceGitBlob']
assert sha((ROOT/'PLAN.md').read_bytes())==sources['preSourcePlanSha256']==files['docs/reports/2026-11-16-probability-interval-tests/plan.md']
for suffix in ['.mdx','.astro','.py','.mjs']:
 for p in files:
  if p.endswith(suffix):assert all(line==line.rstrip() for line in (ROOT/p).read_text().splitlines()),p
out={'status':'PASS','manifestSha256':sha((ROOT/manifest_name).read_bytes()),'releaseFiles':len(files),'recordPins':len(record['files']),'historicalReplacements':len(manifest['replacedFiles']),'historicalProjection':'Four note hashes plus allowlisted frontmatter/headings/imports; four figure hashes and literal static IDs. No old narrative/code/result displayed or used.','sourcePdfHashes':{s['id']:s['snapshotSha256'] for s in sources['sources']},'helperPins':sources['firstPartyHelpers'],'reusedCheckerPin':reuse,'preSourcePlanSha256':sources['preSourcePlanSha256'],'privateSourceAssetsExcluded':True}
(OUT/'closure.json').write_text(json.dumps(out,indent=2)+'\n')
(OUT/'reviewed-files.json').write_text(json.dumps({'manifestSha256':out['manifestSha256'],'candidateRoot':str(ROOT),'files':files},indent=2)+'\n')
print(json.dumps({k:v for k,v in out.items() if k not in ['sourcePdfHashes','helperPins','reusedCheckerPin']},indent=2))
