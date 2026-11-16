#!/usr/bin/env python3
"""Original deterministic examples. Python standard library only."""
from fractions import Fraction as F
from itertools import product
from math import comb, exp, log, sqrt, pi
import json
from pathlib import Path
import sys

checks = 0

def check(condition):
    global checks
    assert condition
    checks += 1

def summary(n, p):
    weights = [F(comb(n, k)) * p**k * (1-p)**(n-k) for k in range(n+1)]
    check(sum(weights) == 1)
    out = {}
    for name, values in [('mean',[F(k,n) for k in range(n+1)]),('shrink',[F(k+2,n+5) for k in range(n+1)])]:
        mean = sum(w*t for w,t in zip(weights,values))
        bias = mean-p
        variance = sum(w*(t-mean)**2 for w,t in zip(weights,values))
        mse = sum(w*(t-p)**2 for w,t in zip(weights,values))
        check(mse == variance+bias*bias)
        if name == 'mean':
            check(mean == p);check(variance == p*(1-p)/n)
        else:
            check(bias == (2-5*p)/(n+5));check(variance == n*p*(1-p)/(n+5)**2)
        out[name] = {key:float(value) for key,value in [('mean',mean),('bias',bias),('variance',variance),('mse',mse)]}
        out[name]['exact'] = {key:str(value) for key,value in [('mean',mean),('bias',bias),('variance',variance),('mse',mse)]}
    return out, [{'k':k,'mass':float(w),'mean':k/n,'shrink':(k+2)/(n+5)} for k,w in enumerate(weights)]

rows=[]
for p in [F(2,7),F(4,5)]:
    for n in [7,28,112]:
        s,pmf=summary(n,p);rows.append({'n':n,'p':str(p),**s})
s,pmf=summary(7,F(2,7))
# Enumerate individual Bernoulli sequences to check the n-1 correction independently.
p=F(2,7); ev=F(0); eu=F(0)
for bits in product([0,1],repeat=4):
    m=F(sum(bits),4); ss=sum((F(x)-m)**2 for x in bits)
    w=p**sum(bits)*(1-p)**(4-sum(bits));ev+=w*ss/4;eu+=w*ss/3
check(ev == F(3,4)*p*(1-p));check(eu == p*(1-p))
data=[-2,1,1,4]; m=F(sum(data),len(data));ss=sum((F(x)-m)**2 for x in data)
check(m==1 and ss==18)
variance={'data':data,'mean':float(m),'sumSquares':float(ss),'divideN':float(ss/4),'divideNMinus1':float(ss/3),'expectationDivideN':str(ev),'expectationDivideNMinus1':str(eu)}
se={'true':sqrt(float(p*(1-p)/7)),'plugin':sqrt(float(F(3,7)*F(4,7)/7))}
risks=[]
for n in [7,28]:
    curve=[]
    for j in range(101):
        q=F(j,100); a=q*(1-q)/n;b=(n*q*(1-q)+(2-5*q)**2)/(n+5)**2
        check(a>=0 and b>=0)
        curve.append({'p':float(q),'mean':float(a),'shrink':float(b)})
    risks.append({'n':n,'points':curve})
# Independently selected binary observations.
binary=[1,0,1,1,0,1,0,1,1,0,1,0,1];n=len(binary);k=sum(binary);phat=F(k,n)
check((n,k)==(13,8))
def ll(q):
    return k*log(q)+(n-k)*log(1-q)
peak=ll(float(phat))
likelihood=[]
for j in range(1,100):
    q=j/100;v=ll(q)-peak;check(v<=1e-12)
    likelihood.append({'p':q,'relativeLog':v,'relative':exp(v)})
comparisons=[{'p':float(q),'relative':exp(ll(float(q))-peak),'logLikelihood':ll(float(q))} for q in [F(1,4),F(1,2),phat,F(4,5)]]
residual=[-3,-1,0,2,5];mean=F(sum(residual),len(residual));median=0
sse=lambda mu:sum((F(x)-mu)**2 for x in residual)
sae=lambda mu:sum(abs(F(x)-mu) for x in residual)
check(mean==F(3,5) and sse(mean)==F(186,5) and sae(F(0))==11)
losses=[]
for j in range(-60,81):
    mu=F(j,20)
    g=(sse(mu)-sse(mean))/8;l=(sae(mu)-sae(F(0)))/2
    check(g>=0 and l>=0)
    losses.append({'shift':float(mu),'gaussian':float(g),'laplace':float(l)})
loss={'data':residual,'mean':float(mean),'median':median,'sseAtMean':float(sse(mean)),'saeAtMedian':float(sae(F(0))),'varianceMLE':float(sse(mean)/5),'varianceUnbiased':float(sse(mean)/4),'gaussianNLL':2.5*log(8*pi)+float(sse(mean)/8),'laplaceNLL':5*log(4)+float(sae(F(0))/2)}
fisher=[]
for q in [F(1,4),F(2,7),F(8,13),F(4,5)]:
    score=[-1/(1-q),1/q]; weights=[1-q,q]
    es=sum(w*z for w,z in zip(weights,score));info=sum(w*z*z for w,z in zip(weights,score))
    check(es==0);check(info==1/(q*(1-q)))
    fisher.append({'p':str(q),'information1':float(info),'information13':float(13*info),'cr13':float(1/(13*info))})
support={'data':[.4,1.1,1.9],'mle':.4,'n':3,'bias':1/3,'variance':1/9,'mse':2/9,'relativeLikelihood':[{'theta':t,'value':exp(3*(t-.4)) if t<=.4 else 0} for t in [0,.2,.4,.6]]}
check(abs(support['relativeLikelihood'][2]['value']-1)<1e-15)
result={'sampling':rows,'pmf':pmf,'risks':risks,'variance':variance,'se':se,'likelihood':{'binary':binary,'n':n,'k':k,'mle':float(phat),'peakLog':peak,'comparisons':comparisons,'curve':likelihood},'loss':loss,'lossCurve':losses,'fisher':fisher,'support':support,'assertions':checks}
root=Path(__file__).resolve().parents[2]
if '--write' in sys.argv:
    (root/'docs/reports/2026-11-16-probability-estimation/results.json').write_text(json.dumps(result,indent=2)+'\n')
    (root/'src/components/figures/estimators/cases.json').write_text(json.dumps({k:result[k] for k in ['sampling','pmf','risks']},indent=2)+'\n')
    (root/'src/components/figures/maximum-likelihood/cases.json').write_text(json.dumps({k:result[k] for k in ['likelihood','loss','lossCurve']},indent=2)+'\n')
print(json.dumps(result,indent=2))
