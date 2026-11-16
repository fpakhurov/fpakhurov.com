"""Independent finite-law and Decimal oracle; does not execute candidate code."""
from pathlib import Path
from decimal import Decimal, localcontext
from fractions import Fraction as F
from math import factorial, comb, sqrt, sin, asin, erf
from itertools import combinations
import hashlib, json
ROOT=Path('/Users/fedorpakhurov/code/_work/fp-probability-interval-tests-drafts')
OUT=Path(__file__).resolve().parent
raw=(ROOT/'docs/reports/2026-11-16-probability-interval-tests/results.json').read_bytes()
r=json.loads(raw); count=0; worst=0.0

def ok(test, name):
 global count
 assert test,name
 count+=1

def close(a,b,name,tol=3e-12):
 global worst
 error=abs(float(a)-float(b));worst=max(worst,error)
 ok(error<=tol,name+f': {a} != {b}')

def normal_cdf(x):
 with localcontext() as ctx:
  ctx.prec=60
  x=Decimal(str(x)); pi=Decimal('3.14159265358979323846264338327950288419716939937510582097494459')
  term=x; total=x
  for j in range(1,200):
   term *= -x*x/Decimal(2*j)
   add=term/Decimal(2*j+1);total+=add
   if abs(add)<Decimal('1e-56'):break
  return Decimal('.5')+total/(2*pi).sqrt()

lo,hi=Decimal(1),Decimal(3)
with localcontext() as ctx:
 ctx.prec=50
 for _ in range(170):
  mid=(lo+hi)/2
  if normal_cdf(mid)<Decimal('.975'):lo=mid
  else:hi=mid
 z=(lo+hi)/2
 close(r['normal']['z'],z,'normal quantile')
 close(r['normal']['se'],Decimal('1.5')/Decimal(25).sqrt(),'normal SE')
 for a,b in zip(r['normal']['bounds'],[Decimal('2.8')-z*Decimal('.3'),Decimal('2.8')+z*Decimal('.3')]):close(a,b,'normal interval')
 # Direct quadratic roots; not the candidate centre/half-width expression.
 roots=[]
 for k,row in enumerate(r['binomialIntervals']):
  ph=Decimal(k)/16
  A=Decimal(1)+z*z/16;B=-(2*ph+z*z/16);C=ph*ph
  d=(B*B-4*A*C).sqrt()
  interval=[(-B-d)/(2*A),(-B+d)/(2*A)]
  hw=z*(ph*(1-ph)/16).sqrt();wal=[ph-hw,ph+hw]
  roots.append((wal,interval))
  for i in range(2):
   close(row['wilson'][i],interval[i],f'Wilson root {k}/{i}')
   close(row['wald'][i],wal[i],f'Wald endpoint {k}/{i}')
  close(row['massAtPointOne'],F(comb(16,k)*9**(16-k),10**16),'interval row probability')
  for bound in interval:ok(abs(A*bound**2+B*bound+C)<Decimal('1e-45'),'quadratic residual')
 for j,row in enumerate(r['coverageCurve'],1):
  p=F(j,20);pd=Decimal(j)/20
  for method,index in [('wald',0),('wilson',1)]:
   accepted=[k for k,bounds in enumerate(roots) if bounds[index][0]<=pd<=bounds[index][1]]
   prob=sum(F(comb(16,k)*j**k*(20-j)**(16-k),20**16) for k in accepted)
   close(row[method],prob,'exact coverage')
 # Derive Student quantile by solving the cubic through the triple-angle identity.
 s=2*sin(asin(.95)/3); t=2*s/sqrt(1-s*s)
 close(r['student']['t4'],t,'Student t4 trig root')
 vals=[6,7,9,10,13];mean=F(sum(vals),5)
 var=(sum(F(v*v) for v in vals)-5*mean*mean)/4
 close(r['student']['mean'],mean,'sample mean');close(r['student']['variance'],var,'sample variance')
 se=sqrt(float(var/5));close(r['student']['se'],se,'student SE')
 for got,want in zip(r['student']['bounds'],[float(mean)-t*se,float(mean)+t*se]):close(got,want,'student interval')

# Multinomial occupancy compositions, rather than 256 ordered sample tuples.
counts={}
for c1 in range(5):
 for c2 in range(5-c1):
  for c4 in range(5-c1-c2):
   c8=4-c1-c2-c4
   weight=factorial(4)//(factorial(c1)*factorial(c2)*factorial(c4)*factorial(c8))
   total=c1+2*c2+4*c4+8*c8
   counts[total]=counts.get(total,0)+weight
ok(sum(counts.values())==256,'bootstrap total')
mu=sum(F(s*c,4*256) for s,c in counts.items());var=sum((F(s,4)-mu)**2*c/256 for s,c in counts.items())
b=r['bootstrap']
for key,value in [('count',256),('mean',mu),('variance',var),('se',sqrt(float(var))),('allZeroProbability',F(23,25)**12)]:close(b[key],value,'bootstrap '+key)
ok(len(b['mass'])==len(counts),'bootstrap support')
for row in b['mass']:
 s=int(row['mean']*4);ok(row['count']==counts[s],'multinomial count');close(row['probability'],F(counts[s],256),'bootstrap mass')
for q,got in zip([F(1,40),F(39,40)],b['percentile']):
 eligible=[s for s in counts if sum(c for x,c in counts.items() if x<=s)>=256*q]
 close(got,F(min(eligible),4),'bootstrap generalized inverse')
D=[1,1,1,-1]+[0]*8;mu=F(sum(D),12);v=(sum(F(d*d) for d in D)-12*mu*mu)/11
for key,value in [('mean',mu),('sampleVariance',v),('se',sqrt(float(v/12)))]:close(r['paired'][key],value,'paired '+key)
for got,want in zip(r['paired']['bounds'],[float(mu)-float(z)/6,float(mu)+float(z)/6]):close(got,want,'paired bounds')

# Integer binomial coefficients from polynomial multiplication, not comb formula.
def coefficients(n):
 a=[1]
 for _ in range(n):a=[a[0]]+[a[i-1]+a[i] for i in range(1,len(a))]+[a[-1]]
 return a
coef=coefficients(12);e=r['exactTest']
for k,row in enumerate(e['mass']):
 close(row['null'],F(coef[k],2**12),'null mass')
 close(row['alternative'],F(coef[k]*3**k,4**12),'alternative mass')
for key,want in [('size',F(sum(coef[10:]),4096)),('pAt10',F(sum(coef[10:]),4096)),('pAt9',F(sum(coef[9:]),4096)),('powerAtPoint75',sum(F(coef[k]*3**k,4**12) for k in range(10,13)))]:close(e[key],want,'exact test '+key)
for j,row in enumerate(e['powerCurve']):close(row['power'],sum(F(coef[k]*j**k*(20-j)**(12-k),20**12) for k in range(10,13)),'power grid')
# Tail p-values super-uniform at every attainable value, both one-sided and two-sided randomization.
tails=[F(sum(coef[k:]),4096) for k in range(13)]
for u in [F(0),F(1)]+tails:ok(sum(F(coef[k],4096) for k in range(13) if tails[k]<=u)<=u,'binomial p validity')
a,b=F(3,10),F(19,40);pool=F(31,80);effect=b-a
se0=sqrt(float(pool*(1-pool)/40));se1=sqrt(float((a*(1-a)+b*(1-b))/80));zz=float(effect)/se0
for key,want in [('pooled',pool),('effect',effect),('nullSE',se0),('estimateSE',se1),('z',zz),('pTwoSided',2*(1-normal_cdf(zz)))]:close(r['ab'][key],want,'A/B '+key)
for got,want in zip(r['ab']['bounds'],[float(effect)-float(z)*se1,float(effect)+float(z)*se1]):close(got,want,'A/B bounds')

# First-crossing decomposition: subtract paths with an earlier first hit from each
# complete binomial mass. Store first-hit counts, never prune a surviving-state DP.
first_hits=[]
for row in r['peeking']:
 n=row['n'];c=coefficients(n);boundary=next(k for k in range(n+2) if 20*sum(c[k:])<=2**n)
 ok(boundary==row['critical'],'exact boundary')
 hits={}
 for k in range(boundary,n+1):
  earlier=sum(weight*comb(n-m,k-j) for m,hit in first_hits for j,weight in hit.items() if 0<=k-j<=n-m)
  hits[k]=c[k]-earlier
  ok(hits[k]>=0,'first-hit count nonnegative')
 first_hits.append((n,hits))
 crossed=sum(sum(hit.values())*2**(n-m) for m,hit in first_hits)
 ok(row['survivingPaths']==2**n-crossed,'surviving paths via first hits')
 ok(row['totalPaths']==2**n,'total paths')
 close(row['everCrossed'],F(crossed,2**n),'ever crossed')
 close(row['singleLookSize'],F(sum(c[boundary:]),2**n),'single-look size')
 ok(F(sum(c[boundary:]),2**n)<=F(1,20),'individual level')
m=r['multiplicity'];close(m['independentFWER'],1-F(19,20)**8,'FWER');close(m['bonferroniCutoff'],F(1,160),'Bonferroni cutoff')
for j,t in enumerate(m['holmThresholds']):close(t,F(1,20*(5-j)),'Holm threshold')
ok(m['rejectedIndices']==[0],'Holm rejections')
y=[0,1,2,4,7,9];contrasts={}
# Iterate all 64 bit masks and condition on exactly 3 assigned units.
for mask in range(64):
 B=tuple(i for i in range(6) if mask>>i&1)
 if len(B)!=3:continue
 contrasts[B]=F(sum(y[i] if mask>>i&1 else -y[i] for i in range(6)),3)
for row in r['randomization']['assignments']:
 value=contrasts[tuple(row['B'])];ok(value==F(*row['exact']),'assignment exact contrast');close(row['difference'],value,'assignment float')
obs=F(17,3);p2=F(sum(abs(v)>=obs for v in contrasts.values()),20);p1=F(sum(v>=obs for v in contrasts.values()),20)
close(r['randomization']['observed'],obs,'observed contrast');close(r['randomization']['pTwoSided'],p2,'two-sided randomization');close(r['randomization']['pOneSided'],p1,'one-sided randomization')
for transform in [lambda x:abs(x),lambda x:x]:
 ps=[F(sum(transform(u)>=transform(v) for u in contrasts.values()),20) for v in contrasts.values()]
 for j in range(21):ok(F(sum(p<=F(j,20) for p in ps),20)<=F(j,20),'randomization rank p validity')
out={'status':'PASS','assertions':count,'maxAbsoluteNumericError':worst,'fixtureSha256':hashlib.sha256(raw).hexdigest(),'methods':['60-digit Gaussian power-series inversion','Direct Decimal Wilson quadratic roots','Student t4 cubic triple-angle root','Multinomial occupancy bootstrap distribution','Integer Pascal polynomial probability laws','First-crossing decomposition for all repeated looks','Bitmask fixed-size assignment distribution and p-value super-uniformity'],'scope':'All saved pedagogical numbers, interval rows, coverage grid, bootstrap distribution, test powers, repeated-look counts, A/B calculations, multiplicity thresholds and randomization assignments. No candidate code imported or executed.'}
(OUT/'oracle.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out,indent=2))
