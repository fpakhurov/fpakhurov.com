#!/usr/bin/env python3
"""Original mechanism checks for StarGAN teaching, with no model/data imports.

Authored for this project with Codex assistance. Standard library only.
Use --write to refresh the saved evidence; default verifies it.
"""
import importlib.util
import json
import math
from pathlib import Path
import statistics
import sys
sys.dont_write_bytecode = True
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/reports/2026-11-13-licensed-example-renewal/stargan-numerical-checks.json'
def close(a,b,tol=1e-10):
    assert abs(a-b)<tol,(a,b)
def sigmoid(x): return 1/(1+math.exp(-x))
def softplus(x): return max(x,0)+math.log1p(math.exp(-abs(x)))
target=[1,0,1,0]; logits=[.8,-.3,1.1,.4]
terms=[softplus(v)-y*v for v,y in zip(logits,target)]
prob=math.prod(sigmoid(v) if y else 1-sigmoid(v) for v,y in zip(logits,target))
close(sum(terms),-math.log(prob))
wrong=[-.8,-.3,-1.1,.4]
wrong_loss=sum(softplus(v)-y*v for v,y in zip(wrong,target))
close(wrong_loss-sum(terms),1.9)
h=1e-5
max_gradient_error=0
for v,y in zip(logits,target):
    actual=((softplus(v+h)-y*(v+h))-(softplus(v-h)-y*(v-h)))/(2*h)
    max_gradient_error=max(max_gradient_error,abs(actual-(sigmoid(v)-y)))
assert max_gradient_error<1e-10

# Independently construct a 128x128 first-convolution response from an all-ones
# 7x7 label-channel kernel. A nonconstant local image response prevents pure
# scale invariance from hiding the normalization effect.
size,radius=128,3
image_response=[math.sin(r*.073)+.3*math.cos(c*.11) for r in range(size) for c in range(size)]
coverage=[(min(size-1,r+radius)-max(0,r-radius)+1)*(min(size-1,c+radius)-max(0,c-radius)+1) for r in range(size) for c in range(size)]
changed=sum(v!=49 for v in coverage)
close(changed/(size*size),1-(122/128)**2)
def instance_norm(values):
    mean=statistics.mean(values); variance=statistics.mean((v-mean)**2 for v in values)
    return [(v-mean)/math.sqrt(variance+1e-5) for v in values]
base=instance_norm(image_response)
reflected=instance_norm([v+49*.2 for v in image_response])
zero=instance_norm([v+.2*n for v,n in zip(image_response,coverage)])
reflection_error=max(abs(a-b) for a,b in zip(base,reflected))
assert reflection_error<1e-12
interior_index=64*size+64
interior_difference=abs(zero[interior_index]-base[interior_index])
assert interior_difference>0.01

# Own initial state for the cited local Dirac-GAN linearization, not a source trace.
a,gamma=.5,1.0
theta0,psi0=.7,-.2
def damped(t):
    scale=math.exp(-t/2)
    return (scale*((1+.5*t)*theta0+.5*t*psi0),scale*(-.5*t*theta0+(1-.5*t)*psi0))
trace=[]
for t in [0,1,2,4,8]:
    theta,psi=damped(t);dot_theta=a*psi;dot_psi=-a*theta-gamma*psi
    close(2*theta*dot_theta+2*psi*dot_psi,-2*gamma*psi*psi)
    plus,minus=damped(t+h),damped(t-h)
    close((plus[0]-minus[0])/(2*h),dot_theta,1e-10)
    close((plus[1]-minus[1])/(2*h),dot_psi,1e-10)
    trace.append({'time':t,'theta':theta,'psi':psi,'squared_distance':theta*theta+psi*psi})
assert all(x['squared_distance']>y['squared_distance'] for x,y in zip(trace,trace[1:]))
# Euler discretization is not continuous flow: undamped steps expand the radius.
step=.1
undamped_radius_ratio=(1+(a*step)**2)**100
assert undamped_radius_ratio>1
close((.6**2+(-.8)**2),1)

spec=importlib.util.spec_from_file_location('practice',ROOT/'scripts/notes/generative-practice.py')
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
practice=module.stargan()
saved=json.loads((ROOT/'docs/reports/2026-11-13-licensed-example-renewal/generative-practice-results.json').read_text())
reference=saved['experiments']['stargan'] if 'experiments' in saved else saved['stargan']
# Round recursively exactly as the canonical authoring bundle does.
def rounded(x):
    if isinstance(x,float):return float(format(x,'.12g'))
    if isinstance(x,(tuple,list)):return [rounded(v) for v in x]
    if isinstance(x,dict):return {k:rounded(v) for k,v in x.items()}
    return x
# The bundle uses decimal rounding; compare nested numeric leaves with tolerance.
def compare(a,b):
    if isinstance(a,dict):
        assert a.keys()==b.keys()
        for key in a:compare(a[key],b[key])
    elif isinstance(a,(list,tuple)):
        assert len(a)==len(b)
        for x,y in zip(a,b):compare(x,y)
    elif isinstance(a,(int,float)):close(a,b)
    else:assert a==b
compare(practice,reference)
result=rounded({'classification':{'target':target,'logits':logits,'probabilities':[sigmoid(x) for x in logits],'terms':terms,'loss':sum(terms),'joint_probability':prob,'wrong_logits':wrong,'wrong_loss':wrong_loss,'max_gradient_error':max_gradient_error},'padding':{'size':size,'kernel_width':7,'border_cells':changed,'border_fraction':changed/(size*size),'reflection_normalized_difference':reflection_error,'zero_padding_interior_difference':interior_difference,'scope':'Current-image instance statistics; fixed local response/kernel, not neural training'},'r1':{'norm':1,'gp_penalty':0,'r1_penalty':.5,'initial':[theta0,psi0],'damped_linearized_trace':trace,'undamped_euler_squared_radius_ratio_100_steps':undamped_radius_ratio,'scope':'Local linearized minimax system; no global or non-saturating training guarantee'},'pair_counts':{'domains4':12,'domains8':56,'output_pairs10':45},'practice':practice})
if '--write' in sys.argv:OUT.write_text(json.dumps(result,indent=2)+'\n')
else:assert json.loads(OUT.read_text())==result
print('StarGAN synthetic, normalization, gradient and local-dynamics checks passed.')
