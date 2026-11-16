"""Independent finite-population and polynomial/Decimal checks; no author imports."""
import json
import hashlib
from fractions import Fraction as F
from decimal import Decimal as D, getcontext
from pathlib import Path
import subprocess
getcontext().prec=60
root=Path('/Users/fedorpakhurov/code/_work/fp-probability-conditioning-drafts')
out=Path(__file__).parent
c=json.loads((root/'src/components/figures/conditional-expectation/cases.json').read_text())
t=json.loads((root/'src/components/figures/inequalities-and-concentration/cases.json').read_text())
checks=0;errors=[]
def equal(a,b):
 global checks
 assert a==b,(a,b);checks+=1
def near(a,b):
 global checks
 err=abs(float(a)-float(b));assert err<2e-13,(a,b,err);errors.append(err);checks+=1
# Expand the joint law into 16 equiprobable outcomes, not conditional-row arithmetic.
groups={'A':[0,0,2,6],'B':[0,0,2,2,2,2,6,6],'C':[2,6,6,6]}
all_values=sum(groups.values(),[])
def mean(xs):return F(sum(xs),len(xs))
def mse(xs,a):return sum((F(y)-a)**2 for y in xs)/len(xs)
def absolute(xs,a):return sum(abs(F(y)-a) for y in xs)/len(xs)
means={g:mean(xs) for g,xs in groups.items()}
variances={g:mse(xs,means[g]) for g,xs in groups.items()}
for g,row in zip(groups,c['groups']):
 equal(means[g],F(row['mean']));equal(variances[g],F(row['variance']))
 for j,(x,y) in enumerate(row['points']):near(x,F(j,20));near(y,mse(groups[g],F(j,20)))
 equal(sum(y-means[g] for y in groups[g]),0)
within=sum(len(xs)*variances[g] for g,xs in groups.items())/16
between=sum(len(xs)*(means[g]-mean(all_values))**2 for g,xs in groups.items())/16
for key,value in [('mean',mean(all_values)),('totalVariance',mse(all_values,mean(all_values))),('withinVariance',within),('betweenVariance',between)]:equal(F(c[key]),value)
merged=groups['A']+groups['B'];coarse=(12*mse(merged,mean(merged))+4*variances['C'])/16
for key,value in [('coarseMean',mean(merged)),('coarseVariance',mse(merged,mean(merged))),('coarseMse',coarse),('refinementGain',coarse-within)]:equal(F(c[key]),value)
alt=sum(len(xs)*mse(xs,a) for xs,a in zip(groups.values(),[1,3,4]))/16
equal(F(c['alternativeMse']),alt);equal(F(c['alternativeExcess']),alt-within)
meds=[0,2,6]
equal(F(c['medianAbsoluteRisk']),sum(len(xs)*absolute(xs,a) for xs,a in zip(groups.values(),meds))/16)
equal(F(c['meanAbsoluteRisk']),sum(len(xs)*absolute(xs,means[g]) for g,xs in groups.items())/16)
equal(F(c['modeError']),F(sum(len(xs)-max(xs.count(y) for y in set(xs)) for xs in groups.values()),16))
for j in range(41):equal(absolute(groups['A'],F(j,20)),2)
# Polynomial multiplication produces the integer distribution of 400 trials.
poly=[1];rows={r['n']:r for r in t['tailRows']};previous=1
for n in range(1,401):
 poly=[3*poly[0]]+[3*poly[k]+2*poly[k-1] for k in range(1,len(poly))]+[2*poly[-1]]
 if n not in rows:continue
 row=rows[n];total=5**n;equal(sum(poly),total)
 tail=F(sum(mass for k,mass in enumerate(poly) if abs(F(k,n)-F(2,5))>=F(1,10)),total)
 equal(tail,F(row['exactProbability']));near(row['actual'],tail);equal(row['lowerCount'],3*n//10);equal(row['upperCount'],n//2)
 near(row['chebyshev'],F(24,n));near(row['hoeffding'],2*(-D(n)/50).exp())
 chernoff=D(0)
 for q in [D('.3'),D('.5')]:
  p=D('.4');div=q*(q/p).ln()+(1-q)*((1-q)/(1-p)).ln();chernoff+=(-n*div).exp()
 near(row['chernoff'],chernoff)
 assert float(tail)<previous;checks+=1;previous=float(tail)
 for bound in ['chebyshev','hoeffding','chernoff']:assert float(tail)<=row[bound];checks+=1
for m,epsilon in t['validation']['curve']:near(epsilon,((D(40)*m).ln()/2400).sqrt())
near(t['validation']['upperRisk'],D('.09')+((D(480)).ln()/2400).sqrt())
equal(t['dependenceCounterexample']['twoSidedDeviationProbability'],1)
near(t['sampleMeanVariance'],D('.24')/150)
manifest=json.loads((root/'conditioning-concentration-release-files.json').read_text())
record=json.loads((root/'content-rights/reviews/probability-conditioning-concentration-complete.json').read_text())
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
for p,d in manifest['sha256'].items():equal(sha(root/p),d)
for p,d in record['files'].items():equal(sha(root/p),d)
sources=json.loads((root/'docs/reports/2026-11-16-probability-renewal/conditioning-concentration-source-evidence.json').read_text())
for s in sources['sources']:equal(sha(root/'sources'/s['snapshot']),s['snapshotSha256']);equal((root/'sources'/s['snapshot']).stat().st_size,s['bytes'])
release=Path('/Users/fedorpakhurov/code/_work/fpakhurov-renewal-release')
for p in ['src/components/figures/Figure.astro','src/utils/lang.ts','src/plugins/remark-heading-ids.mjs']:
 equal((root/p).read_bytes(),subprocess.check_output(['git','show','b06b1f66040c4c4426955a1be0906c5baddc26cb:'+p],cwd=release))
# No source snapshots or held following-topic links are introduced.
for locale in ['notes','notes-ru']:
 for slug in ['conditional-expectation','inequalities-and-concentration']:
  import re
  body=(root/f'src/content/{locale}/probability/{slug}.mdx').read_text()
  for route in re.findall(r'\]\((/[^)]+)\)',body):
   note=route.split('#')[0].removeprefix('/ru').removeprefix('/notes/')
   p=f'src/content/{locale}/{note}.mdx';candidate=root/p if (root/p).exists() else release/p
   assert re.search(r'^status: published$',candidate.read_text(),re.M),route;checks+=1
result={'status':'PASS','independentAssertions':checks,'maximumFloatDifference':max(errors),'method':'16 equiprobable joint outcomes; exact integer generating-polynomial multiplication to n400; 60-digit Decimal exponent/log; all case coordinates and file/source/helper pins; no author code imported.','manifestSha256':sha(root/'conditioning-concentration-release-files.json'),'manifestFiles':len(manifest['files']),'reviewPins':len(record['files']),'sourceSnapshots':len(sources['sources']),'limits':'Numeric/source/identity verification only; full prose and primary source review documented separately. No browser/build/CI/publication.'}
(out/'oracle.json').write_text(json.dumps(result,indent=2)+'\n');(out/'reviewed-files.json').write_text(json.dumps(manifest['sha256'],indent=2)+'\n');print(json.dumps(result,indent=2))
