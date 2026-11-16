from pathlib import Path
import json,re,subprocess,hashlib
r=Path('/Users/fedorpakhurov/code/_work/fp-probability-estimation-drafts');h=Path('/Users/fedorpakhurov/code/_work/fpakhurov-renewal-release');o=Path('/Users/fedorpakhurov/code/_work/renewal-verification/probability-estimation-peer');report=r/'docs/reports/2026-11-16-probability-estimation'
identity=json.loads((report/'curriculum-identity.json').read_text());revision=identity['sourceRevision'];notes=[]
for item in identity['notes']:
 # Extract only allowed identity data, never print or save historical teaching material.
 blob=subprocess.check_output(['git','show',revision+':'+item['path']],cwd=h,text=True)
 front=re.match(r'^---\n([\s\S]*?)\n---\n',blob).group(1)
 selected=[line for line in front.splitlines() if re.match(r'^(title|course|section|order|tags|prerequisites):',line)]
 assert selected==item['allowedFrontmatter']
 fence=None;headings=[];imports=[]
 for line in blob.splitlines():
  opening=re.match(r'^\s*(`{3,}|~{3,})',line)
  if opening:
   marker=opening.group(1)[0]
   if fence is None:fence=marker
   elif fence==marker:fence=None
   continue
  if fence:continue
  if re.match(r'^#{1,6}\s',line):headings.append(line)
  if re.match(r"^import .*\.astro';$",line):imports.append(line)
 assert headings==item['headingsOutsideFences'];assert imports==item['figureImportPaths']
 notes.append({'path':item['path'],'fields':len(selected),'headingIds':len(headings),'figureImports':len(imports),'exact':True})
figures=json.loads((report/'figure-identity.json').read_text())
for item in figures:
 blob=subprocess.check_output(['git','show',revision+':'+item['path']],cwd=h,text=True)
 ids=re.findall(r"const\s+id\s*=\s*['\"]([^'\"]+)['\"]",blob)
 assert ids==item['figureIdsOnly']
result={'status':'PASS','revision':revision,'notes':notes,'historicalFigureIdentity':figures,'scope':'Only allowlisted frontmatter, heading lines/IDs and Astro import declarations, plus literal figure ID strings. Historical descriptions, narrative, example/code/result/figure implementations were not shown or saved.'}
(o/'identity.json').write_text(json.dumps(result,indent=2)+'\n');print('PASS: four notes and four literal figure IDs')
