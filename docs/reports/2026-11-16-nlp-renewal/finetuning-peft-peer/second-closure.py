from pathlib import Path
import hashlib, json, re, subprocess, xml.etree.ElementTree as ET
root=Path('/Users/fedorpakhurov/code/_work/fp-nlp-finetuning-drafts')
host=Path('/Users/fedorpakhurov/code/_work/fpakhurov-renewal-release')
out=Path('/Users/fedorpakhurov/code/_work/renewal-verification/fp-finetuning-peft-peer')
sha=lambda b:hashlib.sha256(b).hexdigest()
manifest_path=root/'finetuning-peft-release-files.json'; manifest=json.loads(manifest_path.read_text())
assert sha(manifest_path.read_bytes())=='5ea508f750a59acfa313b6ad3789eb424516c1be363a2b7b51735a0353da4ffe'
for p,h in manifest['files'].items(): assert sha((root/p).read_bytes())==h,p
record_path='content-rights/reviews/nlp-finetuning-peft-renewal.json';record=json.loads((root/record_path).read_text())
assert record['files']=={p:h for p,h in manifest['files'].items() if p!=record_path}
assert len(record['files'])==22
source=json.loads((root/'docs/reports/2026-11-16-nlp-renewal/finetuning-peft-source-evidence.json').read_text())
assert [s for s in record['sources'] if s['use']=='reference']==source['sources']
for s in record['sources']:
 if s['use']=='original':
  assert all(s.get(k) for k in ['authorship','method','verification'])
sourcepins={}
for s in source['sources']:
 for pathkey,hashkey in [('snapshotPath','sha256'),('textPath','textSha256')]:
  path=root/s[pathkey]; assert sha(path.read_bytes())==s[hashkey];sourcepins[s[pathkey]]=s[hashkey]
 assert (root/s['snapshotPath']).stat().st_size==s['bytes']
 text=(root/s['snapshotPath']).read_text(); notice=re.search(r'<a id="license-tr"[^>]*>([\s\S]*?)</a>',text).group(1).strip()
 assert notice=='License: '+s['observedLicense'],s['id']
 assert s['use']=='reference' and s['snapshotPath'] not in manifest['files']
helperpins={}
for dep in source['unchangedFirstPartyDependencies']:
 raw=subprocess.check_output(['git','show',dep['revision']+':'+dep['path']],cwd=host)
 assert raw==(root/dep['path']).read_bytes() and sha(raw)==dep['sha256'];helperpins[dep['path']]=dep['sha256']
plan=root/'docs/reports/2026-11-16-nlp-renewal/finetuning-peft-plan.md'
assert sha(plan.read_bytes())==source['planSha256'] and plan.read_bytes()==(root/'PLAN.md').read_bytes()
assert json.loads((out/'fresh-check.json').read_text())==json.loads((root/'docs/reports/2026-11-16-nlp-renewal/finetuning-peft-checks.json').read_text())
ft=json.loads((root/'src/components/figures/nlp/fine-tuning/cases.json').read_text());pf=json.loads((root/'src/components/figures/nlp/peft/cases.json').read_text())
count=0

def ck(a,b,tol=1e-10):
 global count
 count+=1
 if isinstance(a,(int,float)) and isinstance(b,(int,float)): assert abs(a-b)<=tol,(a,b)
 else: assert a==b,(a,b)

def textat(svg,x,y,expected):
 matches=[t for t in svg.iter('text') if float(t.get('x'))==x and float(t.get('y'))==y]
 ck(len(matches),1); ck(''.join(matches[0].itertext()),expected)

def rectat(svg,x,y,w,h):
 matches=[t for t in svg.iter('rect') if float(t.get('x'))==x and float(t.get('y'))==y]
 ck(len(matches),1); ck(float(matches[0].get('width')),w);ck(float(matches[0].get('height')),h)

render_hashes={}
for locale in ['en','ru']:
 path=out/f'render/finetuning-peft-{locale}.html';html=path.read_text();render_hashes[path.name]=sha(path.read_bytes())
 svgs=[ET.fromstring(s) for s in re.findall(r'<svg\b[\s\S]*?</svg>',html)]
 ck(len(svgs),11)
 byid={s.find('title').get('id'):s for s in svgs}
 ck(len(byid),11)
 ids=re.findall(r'\bid="([^"]+)"',html);ck(len(ids),len(set(ids)))
 for svg in svgs:
  bounds=list(map(float,svg.get('viewBox').split()));ck(bounds[:2],[0.,0.])
  ck(svg.get('role'),'img')
  for aid in svg.get('aria-labelledby').split(): ck(aid in ids,True)
  for node in svg.iter():
   for key in ['x','cx','x1','x2']:
    if node.get(key) is not None: ck(0<=float(node.get(key))<=bounds[2],True)
   for key in ['y','cy','y1','y2']:
    if node.get(key) is not None: ck(0<=float(node.get(key))<=bounds[3],True)
   if node.tag=='rect':
    ck(float(node.get('x'))+float(node.get('width'))<=bounds[2],True)
    ck(float(node.get('y'))+float(node.get('height'))<=bounds[3],True)
 for key,result in [('full',ft['full']),('probe',ft['probe']),('probe-full',ft['probe_then_full'])]:
  svg=byid[f'ft-{key}-title'];ck(svg.get('viewBox'),'0 0 300 150')
  for i,row in enumerate(result['matrix']):
   for j,value in enumerate(row):
    textat(svg,47+j*72,60+i*46,f'{value:.3f}');rectat(svg,12+j*72,32+i*46,70,44)
  for i,value in enumerate(result['head']):
   textat(svg,239,60+i*46,f'{value:.3f}');rectat(svg,204,32+i*46,70,44)
  ck(f"{result['loss']:.6f}" in html,True)
 svg=byid['ft-loss-title'];ck(svg.get('viewBox'),'0 0 320 286')
 for line in svg.findall('polyline'):
  key=line.get('data-series');points=[list(map(float,p.split(','))) for p in line.get('points').split()]
  ck(len(points),41)
  for i,(point,row) in enumerate(zip(points,ft['checkpoint']['trace'])):
   ck(point[0],48+246*i/40);ck(point[1],220-207.5*row[key])
 marker=svg.find('circle');ck(float(marker.get('cx')),48+246*12/40);ck(float(marker.get('cy')),220-207.5*ft['checkpoint']['best']['validation'])
 for key in ['base','update','merged']:
  svg=byid[f'peft-{key}-title'];ck(svg.get('viewBox'),'0 0 280 140')
  for i,row in enumerate(pf[key]):
   for j,value in enumerate(row):
    textat(svg,62+j*78,65+i*44,f'{value:.1f}');rectat(svg,24+j*78,38+i*44,76,42)
 for key,rank in [('first',1),('second',1),('sum',2)]:
  svg=byid[f'rank-{key}-title'];ck(svg.get('viewBox'),'0 0 200 170')
  for i,row in enumerate(pf['rank'][key]):
   for j,value in enumerate(row):
    textat(svg,73+j*54,64+i*46,str(value));rectat(svg,47+j*54,35+i*46,52,44)
  textat(svg,100,151,('Ранг' if locale=='ru' else 'Rank')+f' {rank}')
 svg=byid['peft-budget-title'];ck(svg.get('viewBox'),'0 0 320 190')
 for key,x,y,w in [('full',24,34,272),('frozen',24,100,68),('update',92,100,2.125)]:
  rectat(svg,x,y,w,25)
 textat(svg,24,23,('Полное обучение' if locale=='ru' else 'Full training')+': 64 MiB')
 textat(svg,24,89,'LoRA: 16.5 MiB')
 textat(svg,24,151,('База' if locale=='ru' else 'Base')+': 16 MiB')
 textat(svg,24,177,('Обучаемые состояния' if locale=='ru' else 'Trainable state')+': 0.5 MiB')
result={'status':'PASS','manifestSha256':sha(manifest_path.read_bytes()),'manifestFiles':manifest['files'],'recordPins':len(record['files']),'sourcePins':sourcepins,'helperPins':helperpins,'independentRenderedAssertions':count,'renderHashes':render_hashes,'savedFreshChecksExact':True,'scope':'Independent matrix labels/boxes, scalar curves and marker, state bars, rank annotations, SVG numeric bounds and ARIA; no browser text-layout claim.'}
(out/'closure.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({k:v for k,v in result.items() if k not in ['manifestFiles','sourcePins','helperPins','renderHashes']},indent=2))
