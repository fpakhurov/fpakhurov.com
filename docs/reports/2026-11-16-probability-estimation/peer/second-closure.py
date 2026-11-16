from pathlib import Path
import hashlib,json,re,subprocess,xml.etree.ElementTree as ET
from fractions import Fraction as F
r=Path('/Users/fedorpakhurov/code/_work/fp-probability-estimation-drafts');h=Path('/Users/fedorpakhurov/code/_work/fpakhurov-renewal-release');o=Path('/Users/fedorpakhurov/code/_work/renewal-verification/probability-estimation-peer');report='docs/reports/2026-11-16-probability-estimation'
sha=lambda raw:hashlib.sha256(raw).hexdigest();m=json.loads((r/'estimation-release-files.json').read_text())
for p,d in m['files'].items():assert sha((r/p).read_bytes())==d,p
recordpath='content-rights/reviews/probability-estimation-complete.json';record=json.loads((r/recordpath).read_text());assert record['files']=={p:d for p,d in m['files'].items() if p!=recordpath}
source=json.loads((r/report/'source-evidence.json').read_text());assert [s for s in record['sources'] if s['use']=='reference']==source['sources']
for s in record['sources']:
 if s['use']=='original':assert all(s.get(k) for k in ['authorship','method','verification'])
sourcepins={}
for s in source['sources']:
 p=r/s['snapshotPath'];assert sha(p.read_bytes())==s['sha256'];assert sha(p.with_suffix('.txt').read_bytes())==s['textSha256'];sourcepins[s['snapshotPath']]=s['sha256'];sourcepins[str(p.with_suffix('.txt').relative_to(r))]=s['textSha256']
idx=source['attributionIndex'];assert sha((r/'sources'/idx['path']).read_bytes())==idx['sha256'];sourcepins['sources/'+idx['path']]=idx['sha256']
for d in source['firstPartyHelpers']:
 raw=subprocess.check_output(['git','show',d['revision']+':'+d['path']],cwd=h)
 assert raw==(r/d['path']).read_bytes() and sha(raw)==d['sha256'];assert subprocess.check_output(['git','rev-parse',d['revision']+':'+d['path']],cwd=h,text=True).strip()==d['gitBlob']
assert (r/'PLAN.md').read_bytes()==(r/report/'plan.md').read_bytes()
for p,d in m['deleteFiles'].items():
 raw=subprocess.check_output(['git','show',m['sourceIdentityRevision']+':'+p],cwd=h);assert sha(raw)==d
 # Filename-only consumer scan, excluding the four replaced bodies and components.
 hits=subprocess.run(['rg','-l',Path(p).stem,'src/content','src/components'],cwd=h,text=True,capture_output=True).stdout.splitlines()
 allowed={q for q in m['files'] if q.endswith('.mdx')}|set(m['deleteFiles'])
 assert set(hits)<=allowed,(p,hits)
assert json.loads((o/'fresh-check.json').read_text())==json.loads((r/report/'verification.json').read_text())
d=json.loads((r/report/'results.json').read_text());assert sha((r/report/'results.json').read_bytes())==json.loads((o/'oracle.json').read_text())['resultSha256']
count=0

def ck(a,b,tol=1e-9):
 global count
 count+=1
 if isinstance(a,(int,float)) and isinstance(b,(int,float)):assert abs(a-b)<=tol,(a,b)
 else:assert a==b,(a,b)

def compare_curve(svg,series,expected):
 lines=[x for x in svg.iter('polyline') if x.get('data-series')==series];ck(len(lines),1)
 points=[tuple(map(float,p.split(','))) for p in lines[0].get('points').split()];ck(len(points),len(expected))
 for (x,y),(ex,ey) in zip(points,expected):ck(x,ex);ck(y,ey);ck(0<=x<=320 and 0<=y<=270,True)

hashes={}
for locale in ['en','ru']:
 p=o/f'render/estimation-{locale}.html';html=p.read_text();hashes[p.name]=sha(p.read_bytes())
 svgs=[ET.fromstring(x) for x in re.findall(r'<svg\b[\s\S]*?</svg>',html)];ck(len(svgs),8)
 byid={s.find('title').get('id'):s for s in svgs};ck(len(byid),8)
 ids=re.findall(r'\bid="([^"]+)"',html);ck(len(ids),len(set(ids)))
 for svg in svgs:
  ck(svg.get('viewBox'),'0 0 320 270');ck(svg.get('role'),'img')
  for aid in svg.get('aria-labelledby').split():ck(aid in ids,True)
  for node in svg.iter():
   for a in ['x','cx','x1','x2']:
    if node.get(a) is not None:ck(0<=float(node.get(a))<=320,True)
   for a in ['y','cy','y1','y2']:
    if node.get(a) is not None:ck(0<=float(node.get(a))<=270,True)
 for rule in ['mean','shrink']:
  svg=byid[f'uniform-estimators-{rule}-title'];ck(any(t.text==('Вероятность' if locale=='ru' else 'Probability') and t.get('y')=='47' for t in svg.iter('text')),True)
  # Corrected plot top65 remains18px below the probability label baseline47.
  ck(any(t.get('d')=='M60 65V210H290' for t in svg.iter('path')),True)
  for k,row in enumerate(d['pmf']):
   groups=[g for g in svg.iter('g') if g.get('data-k')==str(k) and g.get('data-rule')==rule];ck(len(groups),1)
   line=groups[0].find('line');circle=groups[0].find('circle');x=60+230*row[rule];y=210-362.5*row['mass']
   for a,v in [('x1',x),('x2',x),('y1',210),('y2',y)]:ck(float(line.get(a)),v)
   ck(float(circle.get('cx')),x);ck(float(circle.get('cy')),y)
  ck(any(t.get('d')==f'M{60+230*2/7} 65V210' for t in svg.iter('path')),True)
 for risk in d['risks']:
  n=risk['n'];svg=byid[f'bias-variance-polys-{n}-title'];scale=170/(.07 if n==7 else .01)
  for name in ['mean','shrink']:compare_curve(svg,f'{name}-{n}',[(60+230*row['p'],210-scale*row[name]) for row in risk['points']])
 for key in ['relative','relativeLog']:
  svg=byid[f'likelihood-curves-{key}-title']
  compare_curve(svg,key,[(60+230*row['p'],210-170*row[key] if key=='relative' else 40-170/32*row[key]) for row in d['likelihood']['curve']])
  marker=next(c for c in svg.iter('circle') if c.get('data-mle')==key);ck(float(marker.get('cx')),60+230*8/13);ck(float(marker.get('cy')),40)
 for key,opt in [('gaussian',.6),('laplace',0)]:
  svg=byid[f'losses-as-likelihoods-{key}-title'];compare_curve(svg,key,[(60+(row['shift']+3)*230/7,210-row[key]*170/9) for row in d['lossCurve']])
  marker=next(c for c in svg.iter('circle') if c.get('data-optimum')==key);ck(float(marker.get('cx')),60+(opt+3)*230/7);ck(float(marker.get('cy')),210)
result={'status':'PASS','manifestSha256':sha((r/'estimation-release-files.json').read_bytes()),'files':m['files'],'deleteFiles':m['deleteFiles'],'recordPins':len(record['files']),'sourcePins':sourcepins,'independentRenderedAssertions':count,'renderHashes':hashes,'scope':'Exact candidate/source/helper/identity/deletion closure; actual Astro curves, sampling stems, optimum markers, coordinate bounds and ARIA. Fixed probability label/grid separation checked; no browser glyph-layout claim.'}
(o/'closure.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({k:v for k,v in result.items() if k not in ['files','deleteFiles','sourcePins','renderHashes']},indent=2))
