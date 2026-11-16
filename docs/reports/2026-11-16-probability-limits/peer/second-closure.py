"""Independent frozen-file, metadata/source and actual rendered-figure closure."""
from html.parser import HTMLParser
from pathlib import Path
from math import log2, log10
import hashlib
import json
import re
import subprocess

ROOT=Path('/Users/fedorpakhurov/code/_work/fp-probability-limit-drafts')
HOST=ROOT.parent/'fpakhurov-renewal-release'
OUT=Path(__file__).parent
sha=lambda value:hashlib.sha256(value).hexdigest()
load=lambda path:json.loads(path.read_text())
manifest_path=ROOT/'limit-theorems-release-files.json'
manifest_hash=sha(manifest_path.read_bytes())
assert manifest_hash=='4ed5a5aa8e5367dc4fe3ff9e5471182cbd19ec4b0838cc16a153a0384332b91a'
manifest=load(manifest_path)
assert len(manifest['files'])==23 and set(manifest['files'])==set(manifest['sha256'])
for p,h in manifest['sha256'].items():
    assert sha((ROOT/p).read_bytes())==h,p
record=load(ROOT/'content-rights/reviews/probability-limits-complete.json')
assert len(record['files'])==22
for p,h in record['files'].items():assert manifest['sha256'][p]==h
for source in record['sources']:
    if source['use']=='original':
        for key in ['authorship','method','verification']:assert source.get(key)
    else:assert source['use']=='reference'

evidence=load(ROOT/'docs/reports/2026-11-16-probability-limits/source-evidence.json')
primary=evidence['sources'][0]
assert sha((ROOT/primary['snapshotPath']).read_bytes())==primary['sha256']
assert sha((ROOT/'sources/durrett5.txt').read_bytes())==primary['textSnapshotSha256']
for source in evidence['consultedButNotCited']:
    assert sha((ROOT/source['snapshot']).read_bytes())==source['sha256']
assert all(not p.startswith('sources/') for p in manifest['files'])
for helper in evidence['firstPartyHelpers']:
    actual=(ROOT/helper['path']).read_bytes()
    historic=subprocess.check_output(['git','show',helper['revision']+':'+helper['path']],cwd=HOST)
    assert actual==historic and sha(actual)==helper['sha256']

identity=load(ROOT/'docs/reports/2026-11-16-probability-limits/curriculum-identity.json')
allowed=['title','course','section','order','tags','prerequisites']
def extract(raw):
    front=raw.split('---',2)[1]
    return '\n'.join(next(line for line in front.splitlines() if line.startswith(key+':')) for key in allowed)
for topic,locales in identity['topics'].items():
    for locale,data in locales.items():
        historic=subprocess.check_output(['git','show',identity['sourceRevision']+':'+data['path']],cwd=HOST,text=True)
        assert extract(historic)==data['identity']
        fenced=False;headings=[]
        for line in historic.splitlines():
            if line.startswith('```') or line.startswith('~~~'):fenced=not fenced
            elif not fenced and re.match(r'^#{1,6} ',line):headings.append(line)
        assert headings==data['headings']
        imports=[line for line in historic.splitlines() if line.startswith('import ') and '.astro' in line]
        assert imports==data['figureImports']
        assert extract((ROOT/data['path']).read_text())==data['identity']
        # Only allowed identity fields are retained from the old object.
        del historic
assert manifest['deleteFiles']==['src/components/figures/law-of-large-numbers/MonteCarloPi.astro']
for p in manifest['deleteFiles']:
    assert sha((HOST/p).read_bytes())==manifest['deleteSourceSha256'][p]
source_refs=subprocess.run(['rg','-l','MonteCarloPi|fig-monte-carlo-pi','src'],cwd=HOST,text=True,capture_output=True)
assert source_refs.returncode==0
assert set(source_refs.stdout.splitlines()) <= {
    'src/components/figures/law-of-large-numbers/MonteCarloPi.astro',
    'src/content/notes/probability/law-of-large-numbers.mdx',
    'src/content/notes-ru/probability/law-of-large-numbers.mdx',
}

class Tags(HTMLParser):
    def __init__(self):
        super().__init__();self.items=[];self.figure=None;self.svg=None
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=='figure':self.figure=a['id']
        if tag=='svg':self.svg=len(self.items)
        self.items.append({'tag':tag,'a':a,'figure':self.figure,'svg':self.svg})
    def handle_endtag(self,tag):
        if tag=='svg':self.svg=None
        if tag=='figure':self.figure=None

lln=load(ROOT/'src/components/figures/law-of-large-numbers/cases.json')
clt=load(ROOT/'src/components/figures/central-limit-theorem/cases.json')
oracle=load(OUT/'oracle.json')
for slug,h in oracle['fixtureHashes'].items():
    assert sha((ROOT/'src/components/figures'/slug/'cases.json').read_bytes())==h
geometry=0
def near(a,b):
    global geometry
    assert abs(float(a)-float(b))<1e-9,(a,b)
    geometry+=1
render_hashes={}
for locale in ['en','ru']:
    render_path=OUT/'render'/('limits-'+locale+'.html')
    html=render_path.read_text();render_hashes[locale]=sha(render_path.read_bytes())
    tags=Tags();tags.feed(html)
    ids=[x['a']['id'] for x in tags.items if 'id' in x['a']]
    assert len(ids)==len(set(ids))
    assert sum(x['tag']=='figure' for x in tags.items)==4
    svgs=[x for x in tags.items if x['tag']=='svg'];assert len(svgs)==6
    for svg in svgs:
        assert svg['a']['role']=='img'
        refs=svg['a']['aria-labelledby'].split();assert len(refs)==2 and all(ref in ids for ref in refs)
        assert all(any(t['a'].get('id')==ref and t['tag'] in ['title','desc'] for t in tags.items) for ref in refs)
    curves=[x for x in tags.items if x['tag']=='polyline']
    assert len(curves)==12
    for curve in curves:
        a=curve['a'];series=a['data-series'];figure=curve['figure']
        points=[list(map(float,xy.split(','))) for xy in a['points'].split()]
        if figure=='fig-two-convergences':
            key={'point':'atN','window':'through4N'}[series]
            expected=[[48+40*log2(r['n']/4),212-160*r[key]] for r in lln['events']]
        elif figure=='fig-monte-carlo-precision':
            key={'plain':'plainRms','paired':'pairedRms'}[series]
            expected=[[60+30*log2(r['evaluations']/4),52+80*log10(.2/r[key])] for r in lln['monteCarlo']['budget']]
        else:
            assert figure=='fig-sums-become-normal'
            n=int(a['data-n']);row=next(r for r in clt['cdfs'] if r['n']==n)
            raw=clt['normalCdf'] if series=='normal' else row['plotPoints']
            expected=[[168+30*z,210-160*p] for z,p in raw]
        assert len(points)==len(expected)
        for actual,wanted in zip(points,expected):
            near(actual[0],wanted[0]);near(actual[1],wanted[1])
        svg=tags.items[curve['svg']];vb=list(map(float,svg['a']['viewbox'].split()))
        assert all(vb[0]<=x<=vb[2] and vb[1]<=y<=vb[3] for x,y in points)
    for circle in [x for x in tags.items if x['tag']=='circle']:
        a=circle['a'];series=a['data-series']
        if circle['figure']=='fig-two-convergences':
            n=int(a['data-n']);row=next(r for r in lln['events'] if r['n']==n)
            near(a['cx'],48+40*log2(n/4));near(a['cy'],212-160*row['atN' if series=='point' else 'through4N'])
        else:
            n=int(a['data-calls']);row=next(r for r in lln['monteCarlo']['budget'] if r['evaluations']==n)
            near(a['cx'],60+30*log2(n/4));near(a['cy'],52+80*log10(.2/row['plainRms' if series=='plain' else 'pairedRms']))
    mc_labels=[x for x in tags.items if x['tag']=='text' and x['figure']=='fig-monte-carlo-precision' and x['a'].get('text-anchor')=='end']
    assert len(mc_labels)==3 and all(float(x['a']['x'])==53 for x in mc_labels)
    for row in clt['modes'][:2]:
        for z,key in [(-3,'atZminus3'),(3,'atZplus3')]:
            assert re.search(r'<td\b[^>]*data-n="'+str(row['n'])+r'"[^>]*data-z="'+str(z)+r'"[^>]*>'+str(row[key])+r'</td>',html)

assert sha(manifest_path.read_bytes())==manifest_hash
assert all(sha((ROOT/p).read_bytes())==h for p,h in manifest['sha256'].items())
result={'manifestSha256':manifest_hash,'files':manifest['sha256'],'recordPins':22,'primarySnapshots':2,'auxiliarySnapshots':4,'helperGitPins':3,'preservedIdentities':4,'actualRenderedFiguresPerLocale':4,'svgPerLocale':6,'independentGeometryChecks':geometry,'renderHashes':render_hashes,'obsoleteFigureReferences':sorted(source_refs.stdout.splitlines()),'limits':'Scoped actual Astro output and source geometry; no browser/font measurement, full build or publication.'}
(OUT/'closure.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:v for k,v in result.items() if k not in ['files','renderHashes']},ensure_ascii=False,indent=2))
