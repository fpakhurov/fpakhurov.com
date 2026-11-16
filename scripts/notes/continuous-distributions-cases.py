"""Original deterministic examples for the Fedor Pakhurov project, with Codex assistance.

No external data, model, random generator or library. --write saves the checked fixture.
The density, interval endpoints and parameter choices were composed for this replacement.
"""
import argparse
from fractions import Fraction as F
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

def rising_cdf(x):
    return 0 if x <= -1 else 1 if x >= 3 else (x + 1) ** 2 / 16

def beta_cdf(x):
    return 6*x*x - 8*x**3 + 3*x**4

def simpson(fn, a, b, n=20000):
    h = (b-a)/n
    return h/3 * (fn(a)+fn(b)+4*sum(fn(a+h*i) for i in range(1,n,2))+2*sum(fn(a+h*i) for i in range(2,n,2)))

def step_points(delta):
    # Exact rational endpoints avoid floor errors at jumps.
    p=F(3,5)*delta
    points=[[0.0,1.0]]
    for k in range(1,int(F(4)/delta)+1):
        points.extend([[float(k*delta),float((1-p)**(k-1))],[float(k*delta),float((1-p)**k)]])
    return points

def make_cases():
    edges=[F(-1),F(-1,2),F(1,2),F(3,2),F(5,2),F(3)]
    masses=[rising_cdf(b)-rising_cdf(a) for a,b in zip(edges,edges[1:])]
    assert masses==[F(1,64),F(1,8),F(1,4),F(3,8),F(15,64)] and sum(masses)==1
    assert rising_cdf(F(2))-rising_cdf(F(0))==F(1,2)
    assert F(2,7)==F(3-1,5-(-2)) and F(-2)+F(7)*F(3,4)==F(13,4)
    assert (F(4)-3)/(F(4)-1)==F(1,3) and (F(4)-2)/F(4)==F(1,2)
    assert 12*(F(1,2)-2*F(1,3)+F(1,4))==1
    assert rising_cdf(F(2))==F(9,16) and rising_cdf(F(0))==F(1,16)
    assert abs(rising_cdf(2*math.sqrt(2)-1)-.5)<1e-15
    assert beta_cdf(F(3,4))-beta_cdf(F(1,4))==F(11,16)
    assert beta_cdf(F(1))==1 and beta_cdf(F(0))==0
    # Independent quadrature checks the analytic integrations used in prose/plots.
    assert abs(simpson(lambda x:(x+1)/8,-1,3)-1)<1e-12
    assert abs(simpson(lambda x:(x+1)/8,0,2)-0.5)<1e-12
    assert abs(simpson(lambda x:12*x*(1-x)**2,.25,.75)-11/16)<1e-12
    assert abs(simpson(lambda x:4*x*x*math.exp(-2*x),0,30)-1)<1e-10
    assert abs(simpson(lambda x:4*x*x*math.exp(-2*x),0,1)-(1-5*math.exp(-2)))<1e-12
    phi=lambda x:math.exp(-x*x/2)/math.sqrt(2*math.pi)
    assert abs(simpson(phi,-10,10)-1)<1e-12
    normal=[{'k':k,'mass':math.erf(k/math.sqrt(2))} for k in [1,2,3]]
    for row in normal:
        assert abs(simpson(phi,-row['k'],row['k'])-row['mass'])<1e-12
    rows=[]
    for delta in [F(1,2),F(1,5),F(1,20)]:
        survival=(1-F(3,5)*delta)**int(F(2)/delta)
        rows.append({'delta':float(delta),'survival':float(survival),'limit':math.exp(-1.2),'error':float(survival)-math.exp(-1.2)})
    return {'rising':{'interval_mass':'1/2','median':2*math.sqrt(2)-1,'quantile_p':'9/16','quantile':2,'rounded_masses':[str(x) for x in masses],'grid':[{'x':-1+i/40,'density':i/320,'cdf':i*i/25600} for i in range(161)]},'plateau':{'intervals':[[-1,0],[2,4]],'weights':['1/2','1/2'],'lower_median':0},'uniform':{'a':-2,'b':5,'interval_mass':'2/7','upper_quartile':'13/4'},'exponential':{'rate':'3/5','rows':rows,'steps':[{'delta':float(d),'points':step_points(d)} for d in [F(1,2),F(1,5)]],'limit_grid':[[i/40,math.exp(-F(3,5)*i/40)] for i in range(161)]},'normal':{'mean':'7/4','sigma':'3/5','central':normal,'two_sided_2_5':math.erfc(2.5/math.sqrt(2))},'gamma':{'shape':3,'rate':2,'cdf_at_1':1-5*math.exp(-2)},'beta':{'a':2,'b':3,'interval_mass':'11/16','mode':'1/3'},'verification':{'quadrature':'Composite Simpson, 20000 panels; deterministic checks against independently integrated formulas','external_inputs':False}}

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--write',action='store_true');args=parser.parse_args()
    cases=make_cases();target=ROOT/'src/components/figures/continuous-distributions/cases.json'
    if args.write:target.write_text(json.dumps(cases,indent=2)+'\n')
    else:assert json.loads(target.read_text())==cases
    print('rising mass [0, 2]:',cases['rising']['interval_mass'])
    print('rising median: %.6f'%cases['rising']['median'])
    print('rounded masses:',', '.join(cases['rising']['rounded_masses']))
    for row in cases['exponential']['rows']:print('delta %.2f, survival at 2: %.6f'%(row['delta'],row['survival']))
    print('exponential limit at 2: %.6f'%math.exp(-1.2))
    for row in cases['normal']['central']:print('normal within %d sigma: %.6f'%(row['k'],row['mass']))
    print('normal outside 2.5 sigma: %.6f'%cases['normal']['two_sided_2_5'])
    print('gamma CDF at 1: %.6f'%cases['gamma']['cdf_at_1'])
    print('beta mass [1/4, 3/4]:',cases['beta']['interval_mass'])
    print('All exact and quadrature checks passed.')

if __name__=='__main__':main()
