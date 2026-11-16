"""Independent review oracle; no import of the author's verifier."""
from fractions import Fraction as Q
from itertools import product
from collections import Counter
from pathlib import Path
import json,hashlib,subprocess
root=Path('/Users/fedorpakhurov/code/_work/fp-probability-foundations-drafts')
expect=json.loads((root/'docs/reports/2026-11-14-probability-foundations-renewal/joint-results.json').read_text())
checks=0
def eq(a,b):
    global checks
    assert a==b,(a,b)
    checks+=1
# Explicitly expand all distinguishable records; use pairwise difference identities.
rows=[]
for x, counts in zip([0,1,3],[(6,4,2),(2,8,2),(4,2,6)]):
    for y,n in zip([0,2,5],counts):rows.extend([(x,y)]*n)
mx=Q(sum(x for x,y in rows),36);my=Q(sum(y for x,y in rows),36)
vx=Q(sum((x-u)**2 for (x,y),(u,v) in product(rows,repeat=2)),2*36**2)
vy=Q(sum((y-v)**2 for (x,y),(u,v) in product(rows,repeat=2)),2*36**2)
cov=Q(sum((x-u)*(y-v) for (x,y),(u,v) in product(rows,repeat=2)),2*36**2)
for key,v in [('EX',mx),('EY',my),('varX',vx),('varY',vy),('covariance',cov),('EXY',cov+mx*my),('correlation_squared',cov*cov/(vx*vy))]:eq(str(v),expect[key])
for x in [0,1,3]:eq(Q(sum(u==x for u,v in rows),36),Q(expect['px'][str(x)]))
for y in [0,2,5]:
    eq(Q(sum(v==y for u,v in rows),36),Q(expect['py'][str(y)]))
    eq(Q(sum(u==1 and v==y for u,v in rows),12),Q(expect['conditional_y_given_x1'][str(y)]))
# Tensor Simpson is exact here: integrands have at most cubic degree in each coordinate.
def quad(f,a=Q(0),b=Q(1)):
    return (b-a)*(f(a)+4*f((a+b)/2)+f(b))/6
f=lambda x,y:1+Q(1,2)*(2*x-1)*(2*y-1)
for x in [Q(k,16) for k in range(17)]:
    eq(quad(lambda y:f(x,y)),1)
    eq(quad(lambda y:y*f(x,y)),Q(1,2)+(2*x-1)/12)
    for y in [Q(k,16) for k in range(17)]:assert Q(1,2)<=f(x,y)<=Q(3,2)
continuous={
 'mass':quad(lambda x:quad(lambda y:f(x,y))),
 'EXY':quad(lambda x:quad(lambda y:x*y*f(x,y))),
 'both_above_half':quad(lambda x:quad(lambda y:f(x,y),Q(1,2)),Q(1,2)),
}
continuous['covariance']=continuous['EXY']-Q(1,4)
continuous['correlation']=continuous['covariance']/Q(1,12)
for k,v in continuous.items():eq(str(v),expect['continuous'][k])
for x in [Q(1,4),Q(3,4)]:eq(str(quad(lambda y:y*f(x,y))),expect['continuous']['conditional_means'][str(x)])
# Use a common 18-record denominator for both zero-covariance tables.
dependent=[(-2,-1)]*3+[(-2,1)]*3+[(0,0)]*6+[(2,-1)]*3+[(2,1)]*3
independent=list(product([-2,0,2],[-1,0,1]))*2
for table in [dependent,independent]:
    eq(Counter(x for x,y in table),Counter({-2:6,0:6,2:6}))
    eq(Counter(y for x,y in table),Counter({-1:6,0:6,1:6}))
    eq(sum(x*y for x,y in table),0)
    eq(Q(sum(x*x for x,y in table),18),Q(8,3))
    eq(Q(sum(y*y for x,y in table),18),Q(2,3))
eq(sum(x==0 and y==0 for x,y in dependent),6)
eq(sum(x==0 and y==0 for x,y in independent),2)
# Dynamic integer convolution, not the author's binomial multiplicities.
law=Counter({0:1});average={}
for n in range(1,65):
    following=Counter()
    for s,count in law.items():
        following[s-1]+=count;following[s+1]+=count
    law=following
    if n in [1,4,16,64]:
        second=sum(Q(count,2**(n+1))*(Q(c)+2*Q(s,n))**2 for s,count in law.items() for c in [-1,1])
        eq(str(second),expect['shared_sign']['average_variances'][str(n)])
        average[str(n)]=str(second)
# All centered-sign pairs, not only coordinates zero and one.
centered=[tuple(Q(e)-Q(sum(es),4) for e in es) for es in product([-1,1],repeat=4)]
for row in centered:eq(sum(row),0)
for i in range(4):
    eq(sum(row[i]**2 for row in centered)/16,Q(3,4))
    for j in range(4):
        if i!=j:eq(sum(row[i]*row[j] for row in centered)/16,Q(-1,4))
# Expand independent costs into 3x6 equiprobable labels.
counts=Counter(a+b for a,b in product([1,1,4],[0,0,0,2,2,5]))
for s,c in counts.items():eq(str(Q(c,18)),expect['convolution'][str(s)])
eq(Q(sum(s*c for s,c in counts.items()),18),Q(7,2))
record=json.loads((root/'content-rights/reviews/probability-joint-distributions-renewal.json').read_text())
for p,h in record['files'].items():eq(hashlib.sha256((root/p).read_bytes()).hexdigest(),h)
sources=json.loads((root/'docs/reports/2026-11-14-probability-foundations-renewal/joint-source-evidence.json').read_text())
for s in sources['sources']:
    if 'snapshotPath' in s:eq(hashlib.sha256((root/s['snapshotPath']).read_bytes()).hexdigest(),s['sha256'])
    elif 'path' in s:
        b=subprocess.check_output(['git','show',s['comparisonRevision']+':'+s['path']],cwd='/Users/fedorpakhurov/code/_work/fpakhurov-renewal-release')
        eq(b,(root/s['path']).read_bytes())
print(json.dumps({'status':'PASS','exactAssertions':checks,'method':'Independent expanded 36-record pair differences; tensor Simpson exact through cubic integrands; 18-record matching-marginal populations; integer dynamic convolution to n64; all centered-sign coordinate pairs; expanded 18 cost paths. No author code imported.','averageVariances':average,'localPins':len(record['files']),'sourceSnapshots':6,'baselineHelpers':3},indent=2))
