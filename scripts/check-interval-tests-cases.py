"""Original deterministic examples: exact enumerations and tiny scalar calculations."""
from collections import Counter
from fractions import Fraction
from itertools import combinations, product
from math import comb, erf, erfc, sqrt
from pathlib import Path
from statistics import NormalDist
import json
import sys

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/reports/2026-11-16-probability-interval-tests'
assert sys.argv[1:] in ([], ['--write']), 'Only --write is supported'
WRITE = sys.argv[1:] == ['--write']
if WRITE:
    OUT.mkdir(parents=True, exist_ok=True)
Z = NormalDist().inv_cdf(.975)

def binom(n, p):
    return [Fraction(comb(n, k)) * p**k * (1-p)**(n-k) for k in range(n+1)]

def wilson(n, k):
    p = k/n
    denom = 1+Z*Z/n
    centre = (p+Z*Z/(2*n))/denom
    half = Z*sqrt(p*(1-p)/n+Z*Z/(4*n*n))/denom
    return [centre-half, centre+half]

def wald(n, k):
    p = k/n
    half = Z*sqrt(p*(1-p)/n)
    return [p-half, p+half]

def t4cdf(t):
    s = t/sqrt(t*t+4)
    return .5+.75*s-.25*s**3

def simpson_t4(t, intervals=2048):
    h = t/intervals
    f = lambda x: .375*(1+x*x/4)**(-2.5)
    return .5+h/3*(f(0)+f(t)+sum((4 if i%2 else 2)*f(i*h) for i in range(1, intervals)))

lo, hi = 0., 10.
for _ in range(80):
    mid = (lo+hi)/2
    if t4cdf(mid) < .975: lo = mid
    else: hi = mid
crit = (lo+hi)/2
assert abs(simpson_t4(crit)-.975) < 1e-12
normal = {'z':Z,'mean':2.8,'n':25,'sigma':1.5,'se':.3,'bounds':[2.8-Z*.3,2.8+Z*.3]}
x = [6,7,9,10,13]
mean = Fraction(sum(x),len(x)); variance = sum((Fraction(a)-mean)**2 for a in x)/(len(x)-1)
student = {'x':x,'mean':float(mean),'variance':float(variance),'se':sqrt(float(variance)/len(x)), 't4':crit,'cdfCrosscheck':simpson_t4(crit)}
student['bounds'] = [float(mean)-crit*student['se'],float(mean)+crit*student['se']]
coverage=[]
for numerator in range(1,20):
    truth=Fraction(numerator,20)
    probs=binom(16,truth)
    row={'p':float(truth)}
    for name,fun in [('wald',wald),('wilson',wilson)]:
        row[name]=float(sum(prob for k,prob in enumerate(probs) if fun(16,k)[0]<=truth<=fun(16,k)[1]))
    coverage.append(row)
intervals=[{'k':k,'wald':wald(16,k),'wilson':wilson(16,k),'massAtPointOne':float(binom(16,Fraction(1,10))[k])} for k in range(17)]
values=[1,2,4,8]
counts=Counter(Fraction(sum(sample),4) for sample in product(values,repeat=4))
bootstrap_mean=sum(value*count for value,count in counts.items())/256
bootstrap_var=sum((value-bootstrap_mean)**2*count for value,count in counts.items())/256
assert bootstrap_mean==Fraction(15,4) and bootstrap_var==Fraction(115,64)
def boot_quantile(prob):
    cumulative=0
    for value,count in sorted(counts.items()):
        cumulative+=count
        if Fraction(cumulative,256)>=prob:return float(value)
bootstrap={'data':values,'count':256,'mean':float(bootstrap_mean),'variance':float(bootstrap_var),'se':sqrt(float(bootstrap_var)),'percentile':[boot_quantile(Fraction(1,40)),boot_quantile(Fraction(39,40))],'mass':[{'mean':float(v),'count':c,'probability':c/256} for v,c in sorted(counts.items())],'allZeroProbability':float(Fraction(23,25)**12)}
d=[1,1,1,-1]+[0]*8
dmean=Fraction(sum(d),12);dvar=sum((Fraction(v)-dmean)**2 for v in d)/11
paired={'differences':d,'mean':float(dmean),'sampleVariance':float(dvar),'se':sqrt(float(dvar)/12)}
paired['bounds']=[float(dmean)-Z*paired['se'],float(dmean)+Z*paired['se']]
p0=binom(12,Fraction(1,2));p1=binom(12,Fraction(3,4))
exact_test={'n':12,'critical':10,'size':float(sum(p0[10:])),'pAt9':float(sum(p0[9:])),'pAt10':float(sum(p0[10:])),'powerAtPoint75':float(sum(p1[10:])),'mass':[{'k':k,'null':float(p0[k]),'alternative':float(p1[k])} for k in range(13)],'powerCurve':[{'p':j/20,'power':float(sum(binom(12,Fraction(j,20))[10:]))} for j in range(21)]}
a,b=Fraction(24,80),Fraction(38,80);pooled=Fraction(62,160)
null_se=sqrt(float(pooled*(1-pooled)*Fraction(2,80)));estimate_se=sqrt(float(a*(1-a)/80+b*(1-b)/80));effect=float(b-a)
ab={'nA':80,'nB':80,'successA':24,'successB':38,'pooled':float(pooled),'effect':effect,'nullSE':null_se,'z':effect/null_se,'pTwoSided':erfc(effect/null_se/sqrt(2)),'estimateSE':estimate_se,'bounds':[effect-Z*estimate_se,effect+Z*estimate_se]}
# Exact number of fair-Bernoulli sequences that have not crossed any boundary.
alive={0:1};peeking=[]
for n in range(1,61):
    updated=Counter()
    for k,count in alive.items():updated[k]+=count;updated[k+1]+=count
    alive=dict(updated)
    if n%10==0:
        mass=binom(n,Fraction(1,2))
        critical=next(k for k in range(n+2) if sum(mass[k:])<=Fraction(1,20))
        alive={k:count for k,count in alive.items() if k<critical}
        peeking.append({'n':n,'critical':critical,'singleLookSize':float(sum(mass[critical:])),'everCrossed':float(1-Fraction(sum(alive.values()),2**n)),'survivingPaths':sum(alive.values()),'totalPaths':2**n})
assert peeking[-1]['everCrossed']>.05
pvals=[Fraction(3,1000),Fraction(14,1000),Fraction(21,1000),Fraction(18,100),Fraction(4,10)]
thresholds=[Fraction(1,20)/(5-i) for i in range(5)];reject=[]
for i,p in enumerate(pvals):
    if p>thresholds[i]:break
    reject.append(i)
multiplicity={'independentFWER':float(1-Fraction(19,20)**8),'bonferroniCutoff':.05/8,'pValues':[float(p) for p in pvals],'holmThresholds':[float(t) for t in thresholds],'rejectedIndices':reject}
y=[0,1,2,4,7,9]
permutation=[]
for group in combinations(range(6),3):
    treated=sum(y[i] for i in group)
    contrast=Fraction(2*treated-sum(y),3)
    permutation.append({'B':list(group),'difference':float(contrast),'exact':[contrast.numerator,contrast.denominator]})
observed=Fraction(17,3)
p_two=Fraction(sum(abs(Fraction(*row['exact']))>=observed for row in permutation),20)
p_one=Fraction(sum(Fraction(*row['exact'])>=observed for row in permutation),20)
assert p_two==Fraction(1,10) and p_one==Fraction(1,20)
randomization={'outcomes':y,'assignments':permutation,'observed':float(observed),'pTwoSided':float(p_two),'pOneSided':float(p_one)}
# Cross-check model identities and independent finite enumerations.
assertions = 0
def check(condition):
    global assertions
    assert condition
    assertions += 1

check(abs((.5 * erfc(-Z/sqrt(2))) - .975) < 1e-14)
check(abs(t4cdf(crit) - .975) < 1e-14)
check(abs(simpson_t4(crit, 4096) - simpson_t4(crit, 2048)) < 1e-12)
check(variance == Fraction(15, 2))
check(dmean == Fraction(1, 6) and dvar == Fraction(1, 3))
check(sum(counts.values()) == 256)
check(bootstrap_var == sum((Fraction(v)-bootstrap_mean)**2 for v in values)/16)
for row in intervals:
    check(-1e-14 <= row['wilson'][0] <= row['wilson'][1] <= 1+1e-14)
for row in coverage:
    check(0 <= row['wald'] <= 1 and 0 <= row['wilson'] <= 1)
null_counts = Counter(sum(bits) for bits in product((0, 1), repeat=12))
for k in range(13):
    check(Fraction(null_counts[k], 4096) == p0[k])
check(sum(p0) == 1 and sum(p1) == 1)
check(sum(p0[10:]) <= Fraction(1, 20) < sum(p0[9:]))
# A separate recurrence advances whole ten-trial blocks between looks.
block = {0: 1}
for row in peeking:
    extended = Counter()
    for k, count in block.items():
        for added in range(11):
            extended[k+added] += count * comb(10, added)
    block = {k: count for k, count in extended.items() if k < row['critical']}
    check(sum(block.values()) == row['survivingPaths'])
    check(row['singleLookSize'] <= .05)
check(len(permutation) == 20)
contrasts = [Fraction(*row['exact']) for row in permutation]
check(sum(contrasts) == 0)
randomization_p = [Fraction(sum(abs(other) >= abs(value) for other in contrasts), 20) for value in contrasts]
for j in range(21):
    check(Fraction(sum(p <= Fraction(j, 20) for p in randomization_p), 20) <= Fraction(j, 20))
check(reject == [0])
results={'normal':normal,'student':student,'binomialIntervals':intervals,'coverageCurve':coverage,'bootstrap':bootstrap,'paired':paired,'exactTest':exact_test,'ab':ab,'peeking':peeking,'multiplicity':multiplicity,'randomization':randomization,'verificationAssertions':assertions}
serialized = json.dumps(results, indent=2) + '\n'
if WRITE:
    (OUT/'results.json').write_text(serialized)
else:
    assert (OUT/'results.json').read_text() == serialized, 'Saved results differ; inspect before explicit --write'
summary={k:({kk:vv for kk,vv in v.items() if kk not in ('mass','powerCurve','assignments')} if isinstance(v,dict) else v) for k,v in results.items() if k not in ('binomialIntervals','coverageCurve')}
summary['intervalK2']=intervals[2];summary['coverageAtPointOne']=coverage[1]
print(json.dumps(summary,indent=2))
