"""Independent bounded review oracle; imports no candidate calculation functions."""
import json, math, hashlib
from fractions import Fraction as F
from collections import Counter
from itertools import combinations
from pathlib import Path
R=Path('/Users/fedorpakhurov/code/_work/fp-probability-interval-tests-drafts')
V=Path('/Users/fedorpakhurov/code/_work/renewal-verification')
d=json.loads((R/'docs/reports/2026-11-16-probability-interval-tests/results.json').read_text())
n=0; error=0
def eq(a,b,tol=1e-10):
 global n,error
 delta=abs(float(a)-float(b)); assert delta<tol,(a,b,delta); n+=1;error=max(error,delta)
def yes(b):
 global n
 assert b;n+=1
def tail(n,k,p):return sum((F(math.comb(n,j))*p**j*(1-p)**(n-j) for j in range(k,n+1)),F())
z=1.959963984540054
for a,b in zip(d['normal']['bounds'],[2.8-.3*z,2.8+.3*z]):eq(a,b)
# Independent numerical quadrature of the t4 density, no analytic CDF inversion.
def simpson(t):
 N=8192;h=t/N
 vals=[(1+(i*h)**2/4)**(-2.5)*.375 for i in range(N+1)]
 return .5+h/3*(vals[0]+vals[-1]+4*sum(vals[1:-1:2])+2*sum(vals[2:-1:2]))
lo,hi=2.,3.
for _ in range(48):
 mid=(lo+hi)/2
 if simpson(mid)<.975:lo=mid
 else:hi=mid
t=(lo+hi)/2;eq(d['student']['t4'],t)
eq(d['student']['mean'],9);eq(d['student']['variance'],F(15,2))
for a,b in zip(d['student']['bounds'],[9-t*math.sqrt(1.5),9+t*math.sqrt(1.5)]):eq(a,b)
# Score inversion from the quadratic coefficients, not the center/half-width formula.
intervals=[]
for k in range(17):
 p=k/16;A=16+z*z;B=-2*k-z*z;C=k*k/16
 disc=math.sqrt(B*B-4*A*C);w=[(-B-disc)/(2*A),(-B+disc)/(2*A)]
 h=z*math.sqrt(p*(1-p)/16);wald=[p-h,p+h]
 intervals.append({'wilson':w,'wald':wald})
 for method in ['wilson','wald']:
  for a,b in zip(d['binomialIntervals'][k][method],intervals[k][method]):eq(a,b)
 eq(d['binomialIntervals'][k]['massAtPointOne'],F(math.comb(16,k))*F(1,10)**k*F(9,10)**(16-k))
for row in d['coverageCurve']:
 p=F(str(row['p']))
 for method in ['wilson','wald']:
  expected=sum((F(math.comb(16,k))*p**k*(1-p)**(16-k) for k in range(17) if intervals[k][method][0]<=p<=intervals[k][method][1]),F())
  eq(row[method],expected)
# Polynomial multiplication instead of enumerating ordered resamples.
poly=Counter({0:1})
for _ in range(4):
 nextpoly=Counter()
 for s,c in poly.items():
  for v in (1,2,4,8):nextpoly[s+v]+=c
 poly=nextpoly
yes(sum(poly.values())==256)
for row in d['bootstrap']['mass']:
 eq(row['count'],poly[int(row['mean']*4)]);eq(row['probability'],F(row['count'],256))
eq(d['bootstrap']['mean'],F(15,4));eq(d['bootstrap']['variance'],F(115,64))
cum=0;quant=[]
for s,c in sorted(poly.items()):
 cum+=c
 for q in (F(1,40),F(39,40)):
  if len(quant)==(0 if q==F(1,40) else 1) and F(cum,256)>=q:quant.append(s/4)
yes(quant==d['bootstrap']['percentile']);eq(d['bootstrap']['allZeroProbability'],F(23,25)**12)
eq(d['paired']['mean'],F(1,6));eq(d['paired']['sampleVariance'],F(1,3));eq(d['paired']['se'],F(1,6))
for a,b in zip(d['paired']['bounds'],[(1-z)/6,(1+z)/6]):eq(a,b)
for row in d['exactTest']['mass']:
 k=row['k']
 for key,p in [('null',F(1,2)),('alternative',F(3,4))]:eq(row[key],math.comb(12,k)*p**k*(1-p)**(12-k))
for row in d['exactTest']['powerCurve']:eq(row['power'],tail(12,10,F(str(row['p']))))
eq(d['exactTest']['size'],F(79,4096));eq(d['exactTest']['pAt9'],tail(12,9,F(1,2)));eq(d['exactTest']['powerAtPoint75'],tail(12,10,F(3,4)))
pool=F(31,80);effect=F(7,40);null=math.sqrt(pool*(1-pool)/40);est=math.sqrt(F(3,10)*F(7,10)/80+F(19,40)*F(21,40)/80)
for key,value in [('pooled',pool),('effect',effect),('nullSE',null),('estimateSE',est),('z',effect/null),('pTwoSided',math.erfc(effect/null/math.sqrt(2)))]:eq(d['ab'][key],value)
for a,b in zip(d['ab']['bounds'],[effect-z*est,effect+z*est]):eq(a,b)
# Count unrestricted paths minus extensions of disjoint earlier first crossings.
first=[]; cumulative=F()
for row in d['peeking']:
 N=row['n'];boundary=next(k for k in range(N+1) if tail(N,k,F(1,2))<=F(1,20));yes(boundary==row['critical'])
 crossing={}
 for k in range(boundary,N+1):
  count=math.comb(N,k)
  for t,prior in first:
   count-=sum(c*math.comb(N-t,k-j) for j,c in prior.items() if 0<=k-j<=N-t)
  yes(count>=0);crossing[k]=count
 first.append((N,crossing));cumulative+=F(sum(crossing.values()),2**N)
 eq(row['everCrossed'],cumulative);eq(row['singleLookSize'],tail(N,boundary,F(1,2)))
 yes(row['survivingPaths']==int((1-cumulative)*2**N))
eq(d['multiplicity']['independentFWER'],1-F(19,20)**8);eq(d['multiplicity']['bonferroniCutoff'],F(1,160));yes(d['multiplicity']['rejectedIndices']==[0])
for i,a in enumerate(d['multiplicity']['holmThresholds']):eq(a,F(1,20*(5-i)))
values=[0,1,2,4,7,9]; contrasts={c:F(2*sum(values[i] for i in c)-sum(values),3) for c in combinations(range(6),3)}
for row in d['randomization']['assignments']:eq(row['difference'],contrasts[tuple(row['B'])]);yes(F(*row['exact'])==contrasts[tuple(row['B'])])
eq(d['randomization']['pTwoSided'],F(1,10));eq(d['randomization']['pOneSided'],F(1,20))
# Independent exact hash closure, including private primary snapshots (never published).
h=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
m=json.loads((R/'interval-tests-release-files.json').read_text())
for p,sha in m['files'].items():yes(h(R/p)==sha)
r=json.loads((R/'content-rights/reviews/probability-interval-tests-complete.json').read_text())
for p,sha in r['files'].items():yes(h(R/p)==sha)
for s in json.loads((R/'sources/manifest.json').read_text()):
 yes(h(R/'sources'/s['file'])==s['sha256']);yes(h(R/'sources'/Path(s['file']).with_suffix('.txt'))==s['textSha256'])
reading=json.loads((V/'interval-tests-root-reading.json').read_text())
print(json.dumps({'status':'PASS','assertions':n,'maximumAbsoluteError':error,'manifestSha256':h(R/'interval-tests-release-files.json'),'scope':'Independent numerical oracle plus exact frozen file and private snapshot hashes. Source readings and prose review recorded separately. No candidate functions imported; no full build or browser.'},indent=2))
