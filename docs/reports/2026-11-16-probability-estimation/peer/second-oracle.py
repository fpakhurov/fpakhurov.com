from pathlib import Path
from fractions import Fraction as F
from decimal import Decimal as D, localcontext
from itertools import product
import cmath, hashlib, json, math
r=Path('/Users/fedorpakhurov/code/_work/fp-probability-estimation-drafts')
o=Path('/Users/fedorpakhurov/code/_work/renewal-verification/probability-estimation-peer')
saved=json.loads((r/'docs/reports/2026-11-16-probability-estimation/results.json').read_text())
checks=0; worst=0

def eq(a,b,tol=2e-13):
 global checks,worst
 checks+=1
 if isinstance(a,(float,int,F,D)) and isinstance(b,(float,int,F,D)):
  delta=abs(float(a)-float(b));worst=max(worst,delta);assert delta<=tol,(a,b,delta)
 else: assert a==b,(a,b)

def masses(n,p):
 # Integer coefficients of [(den-num)+num*z]^n, constructed by convolution.
 a,b=p.denominator-p.numerator,p.numerator;poly=[1]
 for _ in range(n):
  nxt=[0]*(len(poly)+1)
  for k,c in enumerate(poly):nxt[k]+=a*c;nxt[k+1]+=b*c
  poly=nxt
 return [F(c,p.denominator**n) for c in poly]

def moments(weights,values,p):
 center=sum(w*x for w,x in zip(weights,values))
 v=sum(w*x*x for w,x in zip(weights,values))-center*center
 mse=sum(w*(x-p)**2 for w,x in zip(weights,values))
 return {'mean':center,'bias':center-p,'variance':v,'mse':mse}

for row in saved['sampling']:
 n=row['n'];p=F(row['p']);w=masses(n,p);eq(sum(w),1)
 for key,values in [('mean',[F(k,n) for k in range(n+1)]),('shrink',[F(k+2,n+5) for k in range(n+1)])]:
  ans=moments(w,values,p)
  for q,value in ans.items():eq(row[key][q],value);eq(row[key]['exact'][q],str(value))
w=masses(7,F(2,7))
for k,row in enumerate(saved['pmf']):
 eq(row['k'],k);eq(row['mass'],w[k]);eq(row['mean'],F(k,7));eq(row['shrink'],F(k+2,12))
for curve in saved['risks']:
 n=curve['n']
 for j,row in enumerate(curve['points']):
  p=F(j,100);w=masses(n,p);eq(row['p'],p)
  for key,values in [('mean',[F(k,n) for k in range(n+1)]),('shrink',[F(k+2,n+5) for k in range(n+1)])]:eq(row[key],moments(w,values,p)['mse'])

values=[-2,1,1,4];mu=sum(map(F,values))/4;q=sum((F(x)-mu)**2 for x in values)
for key,v in [('mean',mu),('sumSquares',q),('divideN',q/4),('divideNMinus1',q/3)]:eq(saved['variance'][key],v)
p=F(2,7);biased=unbiased=F(0)
for bits in product([0,1],repeat=4):
 weight=math.prod(p if x else 1-p for x in bits);avg=F(sum(bits),4)
 ss=sum(F(x*x) for x in bits)-4*avg*avg
 biased+=weight*ss/4;unbiased+=weight*ss/3
 eq(ss,sum((F(x)-avg)**2 for x in bits))
eq(saved['variance']['expectationDivideN'],str(biased));eq(saved['variance']['expectationDivideNMinus1'],str(unbiased));eq(unbiased,p*(1-p))
eq(saved['se']['true'],math.sqrt(10/343));eq(saved['se']['plugin'],math.sqrt(12/343))

binary=[1,0,1,1,0,1,0,1,1,0,1,0,1];eq(saved['likelihood']['binary'],binary)
eq(saved['likelihood']['n'],13);eq(saved['likelihood']['k'],8);eq(saved['likelihood']['mle'],F(8,13))
with localcontext() as ctx:
 ctx.prec=90
 toD=lambda q:D(q.numerator)/D(q.denominator)
 peak_prob=F(8,13)**8*F(5,13)**5
 eq(saved['likelihood']['peakLog'],toD(peak_prob).ln())
 for i,row in enumerate(saved['likelihood']['curve'],1):
  p=F(i,100);ratio=p**8*(1-p)**5/peak_prob
  eq(row['p'],p);eq(row['relative'],ratio);eq(row['relativeLog'],toD(ratio).ln())
  # Complex-step derivative of the thirteen independent log factors.
  z=complex(float(p),1e-25)
  derivative=sum(cmath.log(z if x else 1-z) for x in binary).imag/1e-25
  eq(derivative,float(F(8)/p-F(5)/(1-p)),tol=3e-12)
 for p,row in zip([F(1,4),F(1,2),F(8,13),F(4,5)],saved['likelihood']['comparisons']):
  raw=p**8*(1-p)**5
  eq(row['p'],p);eq(row['relative'],raw/peak_prob);eq(row['logLikelihood'],toD(raw).ln())
 eq(toD(peak_prob).ln(),D(8)*toD(F(8,13)).ln()+D(5)*toD(F(5,13)).ln())
 for row in saved['support']['relativeLikelihood']:
  theta=F(str(row['theta']));expected=(D(3)*toD(theta-F(2,5))).exp() if theta<=F(2,5) else D(0)
  eq(row['value'],expected)

samples=[-3,-1,0,2,5];mean=F(3,5);median=F(0);squares=sum((F(x)-mean)**2 for x in samples);absolute=sum(abs(F(x)) for x in samples)
eq(saved['loss']['data'],samples)
for key,value in [('mean',mean),('median',median),('sseAtMean',squares),('saeAtMedian',absolute),('varianceMLE',squares/5),('varianceUnbiased',squares/4)]:eq(saved['loss'][key],value)
eq(saved['loss']['gaussianNLL'],sum(math.log(math.sqrt(8*math.pi))+float((F(x)-mean)**2)/8 for x in samples))
eq(saved['loss']['laplaceNLL'],sum(math.log(4)+abs(x)/2 for x in samples))
for j,row in zip(range(-60,81),saved['lossCurve']):
 m=F(j,20)
 eq(row['shift'],m)
 # Gaussian centered-sum identity; Laplace direct five residuals.
 eq(row['gaussian'],F(5,8)*(m-mean)**2)
 eq(row['laplace'],(sum(abs(F(x)-m) for x in samples)-absolute)/2)
for n in [1,5,13]:
 for q in [F(1,4),F(2,7),F(8,13),F(4,5)]:
  weights=masses(n,q);t=[F(k,n) for k in range(n+1)];u=[F(k)/q-F(n-k)/(1-q) for k in range(n+1)]
  eq(sum(w*x for w,x in zip(weights,u)),0)
  eq(sum(w*a*b for w,a,b in zip(weights,t,u)),1)
  variance_score=sum(w*x*x for w,x in zip(weights,u));variance_t=moments(weights,t,q)['variance']
  eq(variance_score*variance_t,1)
for q,row in zip([F(1,4),F(2,7),F(8,13),F(4,5)],saved['fisher']):
 info=F(1)/q+F(1)/(1-q)
 eq(row['p'],str(q));eq(row['information1'],info);eq(row['information13'],13*info);eq(row['cr13'],1/(13*info))
for key,v in [('mle',F(2,5)),('n',3),('bias',F(1,3)),('variance',F(1,9)),('mse',F(2,9))]:eq(saved['support'][key],v)
# Check support-order statistics with the exact product survivor and gamma moments.
for n in [1,3,13]:
 for t in [0,.1,.8,2]:eq(math.exp(-t)**n,math.exp(-n*t))
 first=F(math.factorial(1),n);second=F(math.factorial(2),n*n)
 eq(second-first*first,F(1,n*n))
report={'status':'PASS','assertions':checks,'maxAbsoluteDifference':worst,'methods':['Integer polynomial convolution for every sampling distribution and all 202 risk points','Exact rational moments, variance correction and finite-sample score covariance','90-digit Decimal log of exact rational likelihoods; complex-step score derivative','Independent centered-sum Gaussian and piecewise-linear Laplace objectives','Shifted exponential product survivor and exact gamma moments'],'resultSha256':hashlib.sha256((r/'docs/reports/2026-11-16-probability-estimation/results.json').read_bytes()).hexdigest()}
(o/'oracle.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
