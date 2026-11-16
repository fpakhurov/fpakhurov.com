import json, hashlib, itertools, math
from pathlib import Path
from fractions import Fraction as F
root=Path('/Users/fedorpakhurov/code/_work/fp-probability-foundations-drafts')
r=json.loads((root/'docs/reports/2026-11-14-probability-foundations-renewal/joint-results.json').read_text())
checks=[]
def equal(label, actual, expected):
 assert actual==expected,(label,actual,expected)
 checks.append({'check':label,'value':str(actual)})
records=[(x,y) for x,row in zip([0,1,3],[[6,4,2],[2,8,2],[4,2,6]]) for y,n in zip([0,2,5],row) for _ in range(n)]
def mean(v): return sum(v,F(0))/len(v)
x=[F(a) for a,b in records]; y=[F(b) for a,b in records]; ex=mean(x);ey=mean(y)
values={'EX':ex,'EY':ey,'EXY':mean([a*b for a,b in records]),'varX':mean([(a-ex)**2 for a in x]),'varY':mean([(b-ey)**2 for b in y]),'covariance':mean([(a-ex)*(b-ey) for a,b in records])}
values['correlation_squared']=values['covariance']**2/(values['varX']*values['varY'])
for key,v in values.items():equal(key,v,F(r[key]))
for val in [0,2,5]:equal('conditional '+str(val),F(sum(a==1 and b==val for a,b in records),sum(a==1 for a,b in records)),F(r['conditional_y_given_x1'][str(val)]))
# Integrate polynomial by explicit monomial antiderivatives.
p={(0,0):F(3,2),(1,0):F(-1),(0,1):F(-1),(1,1):F(2)}
def integral(dx=0,dy=0,lo=F(0),hi=F(1)):
 return sum(c*(hi**(i+dx+1)-lo**(i+dx+1))/F(i+dx+1)*(hi**(j+dy+1)-lo**(j+dy+1))/F(j+dy+1) for (i,j),c in p.items())
equal('continuous mass',integral(),F(1));equal('continuous EXY',integral(1,1),F(r['continuous']['EXY']))
equal('upper quarter',integral(lo=F(1,2)),F(r['continuous']['both_above_half']))
equal('continuous covariance',integral(1,1)-integral(1,0)*integral(0,1),F(1,72))
for a in [F(1,4),F(3,4)]:
 v=sum(c*a**i/F(j+2) for (i,j),c in p.items())
 equal('conditional mean '+str(a),v,F(r['continuous']['conditional_means'][str(a)]))
for n in [1,4,16,64]:
 # Exact distribution over the number of independent positive signs and shared sign.
 v=sum(F(math.comb(n,k),2**(n+1))*(F(c)+2*F(2*k-n,n))**2 for c in [-1,1] for k in range(n+1))
 equal('shared sign n='+str(n),v,F(r['shared_sign']['average_variances'][str(n)]))
centered=[]
for signs in itertools.product([-1,1],repeat=4):
 m=mean(signs); centered.append([s-m for s in signs])
for i in range(4):
 equal('centered variance '+str(i),mean([v[i]**2 for v in centered]),F(3,4))
 for j in range(i):equal('centered covariance '+str((i,j)),mean([v[i]*v[j] for v in centered]),F(-1,4))
for v in centered:equal('zero average',mean(v),F(0))
counts={}
for a,pa in [(1,F(2,3)),(4,F(1,3))]:
 for b,pb in [(0,F(1,2)),(2,F(1,3)),(5,F(1,6))]:counts[a+b]=counts.get(a+b,0)+pa*pb
for key,v in counts.items():equal('sum mass '+str(key),v,F(r['convolution'][str(key)]))
equal('sum mean',sum(k*v for k,v in counts.items()),F(7,2))
rec=json.loads((root/'content-rights/reviews/probability-joint-distributions-renewal.json').read_text())
for path,digest in rec['files'].items():equal('pin '+path,hashlib.sha256((root/path).read_bytes()).hexdigest(),digest)
out={'scope':'Independent exact finite/polynomial checks and current hashes; no browser or publication claim. General claims separately read.','checks':checks}
Path('joint-root-oracle.json').write_text(json.dumps(out,indent=2)+'\n')
print('PASS',len(checks),'exact checks and hashes')
