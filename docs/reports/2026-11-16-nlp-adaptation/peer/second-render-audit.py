"""Peer checks of actual rendered SVG accessibility and all projection halves."""
from html.parser import HTMLParser
from pathlib import Path
import json,math,re
root=Path('/Users/fedorpakhurov/code/_work/fp-nlp-adaptation-renewal-drafts')
evidence=Path(__file__).parent
class Read(HTMLParser):
 def __init__(self):super().__init__();self.tags=[];self.svgs=[];self.current=None;self.ids=[];self.arias=[]
 def handle_starttag(self,name,attrs):
  a=dict(attrs);self.tags.append((name,a))
  if 'id' in a:self.ids.append(a['id'])
  if 'aria-labelledby' in a:self.arias.extend(a['aria-labelledby'].split())
  if name=='svg':self.current=[a,[]];self.svgs.append(self.current)
  elif self.current:self.current[1].append((name,a))
 def handle_endtag(self,name):
  if name=='svg':self.current=None
checks=0
for locale in ['en','ru']:
 p=Read();p.feed((evidence/f'rendered/adaptation-{locale}.html').read_text())
 assert len(p.svgs)==7;assert len(p.ids)==len(set(p.ids));assert all(a in p.ids for a in p.arias);checks+=3
 for attr,tags in p.svgs:
  assert any(t=='title' for t,_ in tags);assert any(t=='desc' for t,_ in tags);checks+=2
  _,_,w,h=map(float,attr['viewbox'].split())
  for name,a in tags:
   for k in ['x','x1','x2','cx']:
    if k in a:assert 0<=float(a[k])<=w;checks+=1
   for k in ['y','y1','y2','cy']:
    if k in a:assert 0<=float(a[k])<=h;checks+=1
   if name=='rect':assert float(a['x'])+float(a['width'])<=w;assert float(a['y'])+float(a['height'])<=h;checks+=2
 for idx,expected in [(4,['blue','amber','blue','amber']),(5,['blue','blue','amber','amber'])]:
  tags=p.svgs[idx][1];paths=[a for tag,a in tags if tag=='path']
  assert len(paths)==4
  for j,(a,color) in enumerate(zip(paths,expected)):
   assert a['fill']==f'var(--fig-{color})';x=80+160*(j//2);sweep=j%2
   assert a['d']==f'M{x} 88 A17 17 0 0 {sweep} {x} 122 Z';checks+=2
result={'status':'PASS','assertions':checks,'scope':'Actual SVG IDs, title/desc references, axis/rect/marker coordinate bounds and both projection semicircle paths/colors in both locales. Browser typography and screenshots not claimed.'}
(evidence/'render-audit.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
