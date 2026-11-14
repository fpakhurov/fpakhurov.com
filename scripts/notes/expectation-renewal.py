"""Original exact probability fixtures, Fedor Pakhurov project, AI-assisted.

Fictional costs and retry-stage parameters; no sampled data or external assets.
Finite calculations check displayed values, not infinite-limit theorems.
"""
from fractions import Fraction as F
from itertools import product
from collections import Counter
import json


def expectation_case():
    costs=[0,2,2,7]
    mean=sum(map(F,costs))/4
    second=sum(F(x*x) for x in costs)/4
    variance=sum((F(x)-mean)**2 for x in costs)/4
    assert (mean,second,variance)==(F(11,4),F(57,4),F(107,16))
    assert variance==second-mean**2
    support=sorted(set(costs))
    medians=[m for m in support if sum(x<=m for x in costs)>=2 and sum(x>=m for x in costs)>=2]
    assert medians==[2]
    squared=lambda a:sum((F(x)-a)**2 for x in costs)/4
    absolute=lambda a:sum(abs(F(x)-a) for x in costs)/4
    for a in [F(i,4) for i in range(-8,41)]:
        assert squared(a)==variance+(a-mean)**2
        assert absolute(a)>=absolute(F(2))
    assert squared(F(2))==F(29,4) and absolute(F(2))==F(7,4)
    # Two dependent flags on the same four equiprobable records.
    indicators=[int(x>0)+int(x==2) for x in costs]
    assert sum(indicators)==5
    indicator_mean=F(sum(indicators),4)
    indicator_variance=sum((x-indicator_mean)**2 for x in indicators)/4
    assert indicator_variance==F(11,16)
    # Independent resampling: enumerate the complete average distribution.
    averages={}
    for n in [1,2,4]:
        counts=Counter(sum(values) for values in product(costs,repeat=n))
        mass=4**n
        avg_mean=sum(F(s,n)*c for s,c in counts.items())/mass
        avg_variance=sum((F(s,n)-avg_mean)**2*c for s,c in counts.items())/mass
        assert avg_mean==mean and avg_variance==variance/n
        averages[str(n)]={'mean':str(avg_mean),'variance':str(avg_variance),'outcomes':mass}
    # Independent successive attempts; a success advances one stage.
    ps=[F(3,4),F(1,3),F(2,5)]
    stage_means=[1/p for p in ps]
    assert sum(stage_means)==F(41,6)
    remaining=[F(0)]*4
    for j in range(2,-1,-1):
        remaining[j]=1/ps[j]+remaining[j+1]
        assert remaining[j]==1+(1-ps[j])*remaining[j]+ps[j]*remaining[j+1]
    state=[F(1),F(0),F(0),F(0)]
    horizon=[]
    for t in range(1,13):
        nxt=[F(0)]*4
        for j,p in enumerate(ps):
            nxt[j]+=state[j]*(1-p);nxt[j+1]+=state[j]*p
        nxt[3]+=state[3];state=nxt
        assert sum(state)==1
        horizon.append({'attempts':t,'complete':str(state[3])})
    # A second exact enumeration validates the first six attempt probabilities.
    complete6=F(0)
    for bits in product([0,1],repeat=6):
        stage=0;weight=F(1)
        for b in bits:
            if stage==3:
                # Artificial fair unused bits preserve total path mass.
                weight*=F(1,2)
            else:
                weight*=ps[stage] if b else 1-ps[stage]
                stage+=b
        if stage==3:complete6+=weight
    assert str(complete6)==horizon[5]['complete']
    # Finite geometric sums for the separately defined heavy-tail families.
    tails=[]
    for kmax in [1,2,5,10]:
        mass=sum(F(3,4**k) for k in range(1,kmax+1))
        first=sum(F(3*2**k,4**k) for k in range(1,kmax+1))
        second_heavy=sum(F(3*4**k,4**k) for k in range(1,kmax+1))
        assert mass==1-F(1,4**kmax) and first==3*(1-F(1,2**kmax))
        assert second_heavy==3*kmax
        signed_mass=sum(F(1,2**k) for k in range(1,kmax+1))
        absolute_partial=sum(F(2**k,2**k) for k in range(1,kmax+1))
        assert signed_mass==1-F(1,2**kmax) and absolute_partial==kmax
        tails.append({'max_k':kmax,'mass':str(mass),'first':str(first),'second':str(second_heavy),'signed_mass':str(signed_mass),'signed_absolute':str(absolute_partial)})
    # Finite-support transforms at special arguments, exact values.
    char_pi=sum(F((-1)**x,4) for x in costs)
    assert char_pi==F(1,2)
    sum_counts=Counter(a+b for a,b in product(costs,repeat=2))
    return {'costs':costs,'pmf':{str(x):str(F(costs.count(x),4)) for x in support},
            'mean':str(mean),'second_moment':str(second),'variance':str(variance),
            'median':2,'mode':2,'quadratic_at_median':str(squared(F(2))),
            'absolute_at_median':str(absolute(F(2))),
            'indicator_count_mean':str(indicator_mean),'indicator_count_variance':str(indicator_variance),
            'averages':averages,'retry_probabilities':list(map(str,ps)),
            'stage_expected_attempts':list(map(str,stage_means)),
            'expected_total_attempts':str(sum(stage_means)),
            'remaining_expected_attempts':list(map(str,remaining)),
            'completion_by_horizon':horizon,'dyadic_partial_checks':tails,
            'characteristic_at_pi':str(char_pi),
            'two_independent_sum_pmf':{str(s):str(F(c,16)) for s,c in sorted(sum_counts.items())}}


if __name__=='__main__':
    print(json.dumps(expectation_case(),indent=2))
