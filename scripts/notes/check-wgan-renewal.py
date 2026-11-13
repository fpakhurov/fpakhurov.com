#!/usr/bin/env python3
"""Original scoped WGAN mechanism checks authored with Codex assistance.

Standard library only; no dataset, model, source implementation or network access.
Default verifies saved output. --write explicitly refreshes it.
"""
import importlib.util
import itertools
import json
import math
from pathlib import Path
import random
import sys
sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'docs/reports/2026-11-13-licensed-example-renewal/wgan-numerical-checks.json'
def close(a, b, tol=1e-11):
    assert abs(a-b) < tol, (a,b)
def mul(matrix, vector):
    return [sum(a*b for a,b in zip(row,vector)) for row in matrix]
def unit(vector):
    norm=math.sqrt(sum(x*x for x in vector))
    assert norm>0
    return [x/norm for x in vector]
def dot(a,b): return sum(x*y for x,y in zip(a,b))
def transpose(matrix): return [list(x) for x in zip(*matrix)]
def power(matrix, initial, count):
    vector=unit(initial); result=[]
    for _ in range(count):
        left=unit(mul(matrix,vector))
        vector=unit(mul(transpose(matrix),left))
        result.append(dot(left,mul(matrix,vector)))
    return result

thetas=[-5,-.7,-.01,0,.01,.7,5]
point_masses=[{'theta':t,'js':math.log(2) if t else 0,'w1':abs(t),'kl':'infinite' if t else 0} for t in thetas]
for t in thetas:
    close(0-(-abs(t)),abs(t))
    if t:
        h=min(abs(t)/4,1e-5)
        close((abs(t+h)-abs(t-h))/(2*h),math.copysign(1,t),1e-9)
# Newly chosen finite fixture: exhaustive assignments agree with sorted transport.
x=[-1.8,-.4,.2,.9,1.7]; y=[-1.1,-.2,.8,1.4,2.6]
paired=sum(abs(a-b) for a,b in zip(x,y))/len(x)
assignments=[sum(abs(a-b) for a,b in zip(x,p))/len(x) for p in itertools.permutations(y)]
close(paired,min(assignments))
def cdf_distance(a,b):
    knots=sorted(set(a+b)); n=len(a); m=len(b)
    return sum(abs(sum(v<=left for v in a)/n-sum(v<=left for v in b)/m)*(right-left) for left,right in zip(knots,knots[1:]))
close(paired,cdf_distance(x,y))
close(sum(y)/len(y)-sum(x)/len(x),paired)

# Reconstruct the original local scalar practice and check a second W1 formula.
rng=random.Random(9301)
model=sorted(rng.uniform(-1.4,.9) for _ in range(129))
data=[v+.65 for v in model]
close(cdf_distance(model,data),.65)
slope=1+.65/8
objective=lambda a:.65*a-4*(a-1)**2
close(.65-8*(slope-1),0)
close(objective(slope),.67640625)
assert objective(slope)>.65
assert all(objective(a)<=objective(slope)+1e-12 for a in [k/1000 for k in range(3001)])

real=[[1.4,.3],[1.7,.9],[2.2,.1],[1.6,-.4],[2.35,.5]]
fake=[[-1.6,-.6],[-2,.1],[-1.2,-.9],[-2.35,-.3],[-1.7,.45]]
alphas=[.2,.35,.5,.65,.8]
hats=[[a*rj+(1-a)*fj for rj,fj in zip(r,f)] for r,f,a in zip(real,fake,alphas)]
direction=[3/math.sqrt(10),1/math.sqrt(10)]
close(dot(direction,direction),1)
close(dot(direction,[-direction[1],direction[0]]),0)
for r,f,a,h in zip(real,fake,alphas,hats):
    for j in range(2):
        assert min(r[j],f[j])<=h[j]<=max(r[j],f[j])
        close(h[j]-f[j],a*(r[j]-f[j]))
# A global linear critic: unit norm makes GP zero on every selected point.
linear_gp=(math.sqrt(dot(direction,direction))-1)**2
close(linear_gp,0)

W=[[1.3,.7],[.3,.9]]
B=[[dot(column1,column2) for column2 in transpose(W)] for column1 in transpose(W)]
trace=B[0][0]+B[1][1]
disc=math.hypot(B[0][0]-B[1][1],2*B[0][1])
s1=math.sqrt((trace+disc)/2); s2=math.sqrt((trace-disc)/2)
estimates=power(W,[1,0],3)
assert [round(v,3) for v in estimates]==[1.601,1.656,1.657]
assert s1-estimates[1]<.001
assert all(v<s1 for v in estimates)
normalized=[[x/s1 for x in row] for row in W]
max_circle_norm=max(math.hypot(*mul(normalized,[math.cos(i*math.pi/720),math.sin(i*math.pi/720)])) for i in range(1440))
assert max_circle_norm<=1+1e-12
# An explicit counterexample to "only slightly above one": initial vector
# orthogonal to the dominant right singular vector stays at the smaller one.
badW=[[9,0],[0,1]]; bad_estimate=power(badW,[0,1],3)
assert bad_estimate==[1,1,1]
# Random initializations avoid exact orthogonality almost surely, but no uniform
# accuracy guarantee follows for one step. A nearby start is also inaccurate.
near_estimate=power(badW,[1e-6,1],1)[0]
assert near_estimate<1.000001

spec=importlib.util.spec_from_file_location('practice',ROOT/'scripts/notes/generative-practice.py')
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
practice=module.wgan()
saved=json.loads((ROOT/'docs/reports/2026-11-13-licensed-example-renewal/generative-practice-results.json').read_text())
reference=saved.get('experiments',saved)['wgan']
def compare(a,b):
    if isinstance(a,dict):
        assert a.keys()==b.keys()
        for k in a:compare(a[k],b[k])
    elif isinstance(a,(tuple,list)):
        assert len(a)==len(b)
        for x,y in zip(a,b):compare(x,y)
    elif isinstance(a,(int,float)):close(a,b)
    else:assert a==b
compare(practice,reference)
def rounded(x):
    if isinstance(x,float):return float(format(x,'.12g'))
    if isinstance(x,(list,tuple)):return [rounded(v) for v in x]
    if isinstance(x,dict):return {k:rounded(v) for k,v in x.items()}
    return x
result=rounded({'point_masses':point_masses,'finite_transport':{'model':x,'data':y,'assignment_count':len(assignments),'sorted_cost':paired,'cdf_integral':cdf_distance(x,y),'linear_dual_gap':sum(y)/5-sum(x)/5},'gradient_penalty_figure':{'real':real,'fake':fake,'alphas':alphas,'interpolates':hats,'gradient':direction,'penalty':linear_gp,'scope':'Fixed original diagram coordinates, no training or random sampling claim'},'spectral':{'matrix':W,'singular_values':[s1,s2],'ratio':s2/s1,'power_estimates':estimates,'normalized_circle_max_1440_angles':max_circle_norm,'counterexample':{'matrix':badW,'initial':[0,1],'power_estimates':bad_estimate,'actual_norm_after_estimated_normalization':9,'near_initial':[1e-6,1],'one_step_estimate':near_estimate}},'practice':practice,'checks':{'cdf_practice_distance':cdf_distance(model,data),'positive_soft_slope_optimum':slope,'soft_objective':objective(slope),'soft_is_lower_bound':False}})
if '--write' in sys.argv:OUT.write_text(json.dumps(result,indent=2)+'\n')
else:assert json.loads(OUT.read_text())==result
print('WGAN point masses, transport, soft penalty, figure geometry and spectral checks passed.')
