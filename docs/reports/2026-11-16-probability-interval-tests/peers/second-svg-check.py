"""Independent semantic encodings and viewport-coordinate check of actual Astro SVG."""
from pathlib import Path
from xml.etree import ElementTree as ET
from fractions import Fraction as F
from math import comb,isfinite
import json,re,hashlib
OUT=Path(__file__).resolve().parent
ROOT=Path('/Users/fedorpakhurov/code/_work/fp-probability-interval-tests-drafts')
assert '.tail { fill: var(--fig-amber); }' in (ROOT/'src/components/figures/hypothesis-tests/TestLogic.astro').read_text()
assert '.ever { fill: var(--fig-amber); }' in (ROOT/'src/components/figures/hypothesis-tests/Peeking.astro').read_text()
data=json.loads((ROOT/'docs/reports/2026-11-16-probability-interval-tests/results.json').read_text())
count=0

def ok(test,msg):
 global count
 assert test,msg
 count+=1

def close(a,b,msg):ok(abs(float(a)-float(b))<2e-10,msg)

for lang in ['en','ru']:
 html=(OUT/f'rendered/interval-tests-{lang}.html').read_text()
 svgs=[ET.fromstring(s) for s in re.findall(r'<svg\b[^>]*>.*?</svg>',html,re.S)]
 ok(len(svgs)==6,'six panels')
 ids=[]
 for svg in svgs:
  vb=list(map(float,svg.attrib['viewBox'].split()));w,h=vb[2:]
  ok(svg.attrib['role']=='img','image role')
  title=svg.find('title');desc=svg.find('desc')
  ok(title is not None and (title.text or '').strip(),'accessible title')
  ok(desc is not None and (desc.text or '').strip(),'accessible description')
  ok(svg.attrib['aria-labelledby']==title.attrib['id'],'title target')
  ids.append(title.attrib['id'])
  for node in svg.iter():
   for axis,limit in [('x',w),('x1',w),('x2',w),('cx',w),('y',h),('y1',h),('y2',h),('cy',h)]:
    if axis in node.attrib:
     value=float(node.attrib[axis]);ok(isfinite(value) and 0<=value<=limit,f'{node.tag}/{axis} within viewBox')
   if node.tag=='rect':
    ok(float(node.attrib.get('x',0))+float(node.attrib.get('width',0))<=w,'rect right edge')
    ok(float(node.attrib.get('y',0))+float(node.attrib.get('height',0))<=h,'rect bottom edge')
  for group in svg.findall('g'):
   a=group.attrib
   if 'data-method' in a:
    k=int(a['data-k']);lo=float(a['data-lo']);hi=float(a['data-hi']);line=group.find('line');c=line.attrib['class'].split()
    should_cover=lo<=.1<=hi
    ok(('f-blue' in c)==should_cover and ('f-amber' in c)==(not should_cover),'coverage color encodes truth inclusion')
    weight=F(comb(16,k)*9**(16-k),10**16)
    width=float(re.search(r'stroke-width:([^p]+)px',line.attrib['style']).group(1))
    close(width,2+10*float(weight),'probability stroke width')
   if 'data-n' in a:
    n=int(a['data-n']);circles=group.findall('circle');ok(len(circles)==2,'two look series')
    ok('f-solid-blue' in circles[0].attrib['class'].split() and 'ever' in circles[1].attrib['class'].split(),'look color correspondence')
  for line in svg.findall('line'):
   a=line.attrib
   if 'data-mean' in a:
    mean=float(a['data-mean']);inside=1.5<=mean<=6.5
    ok(('f-blue' in a['class'])==inside and ('f-amber' in a['class'])==(not inside),'bootstrap interval color')
  for rect in svg.findall('rect'):
   a=rect.attrib
   if 'data-distribution' in a:
    k=int(a['data-k']);reject=k>=10
    ok(('tail' in a['class'].split())==reject and ('f-solid-blue' in a['class'].split())==(not reject),'test rejection color')
 ok(len(set(ids))==6,'unique accessible title IDs')
 # Corrected description refers to encodings actually present in the rendered SVG.
 boot=svgs[2]
 ok('3.75' in ''.join(boot.find('desc').itertext()),'bootstrap description mean')
 meanlines=[n for n in boot.findall('line') if 'f-dash' in n.attrib.get('class','')]
 ok(len(meanlines)==1,'one dashed mean line');close(meanlines[0].attrib['x1'],58+(3.75-1)*238/7,'actual mean line')
result={'status':'PASS','assertions':count,'scope':'All actual SVG numeric coordinate attributes and rectangle extents inside viewBoxes; probability stroke widths; coverage truth, bootstrap interval, test rejection and peeking series color semantics; title/description IDs. No browser text-size or font measurement.','renderedSha256':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted((OUT/'rendered').glob('*.html'))}}
(OUT/'svg-check.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2))
