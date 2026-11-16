"""Independent stdlib oracle: rational attention prefixes and symmetric logistic dynamics."""
import cmath
import hashlib
import importlib.util
import itertools
import json
import math
from fractions import Fraction as F
from pathlib import Path
import sys
sys.dont_write_bytecode=True
root=Path('/Users/fedorpakhurov/code/_work/fp-nlp-adaptation-renewal-drafts')
e=json.loads((root/'src/components/figures/efficient-transformers/cases.json').read_text())
t=json.loads((root/'src/components/figures/transfer-learning/cases.json').read_text())
checks=0
def close(a,b,tol=2e-12):
 global checks
 assert abs(a-b)<=tol,(a,b,abs(a-b));checks+=1
def eq(a,b):
 global checks
 assert a==b,(a,b);checks+=1
mass=[3,1,6,2,4];values=[(2,-1),(-3,2),(1,4),(5,0),(-2,-2)]
eq(e['attention']['masses'],mass);eq(e['attention']['values'],list(map(list,values)))
for row,ids in zip(e['attention']['trace'],[range(2),range(3),range(5)]):
 den=max(mass[i] for i in ids);close(row['maximum'],math.log(den));close(row['denominator'],F(sum(mass[i] for i in ids),den))
 for j in range(2):
  num=sum(mass[i]*values[i][j] for i in ids);close(row['numerator'][j],F(num,den));close(row['output'][j],F(num,sum(mass[i] for i in ids)))
for j,want in enumerate([F(11,16),F(15,16)]):close(e['attention']['output'][j],want)
for j,want in enumerate([F(13,9),F(26,9)]):close(e['attention']['masked_output'][j],want)
# Test candidate merge against independent exact rational weighted outcomes for every mask and ordering.
spec=importlib.util.spec_from_file_location('candidate',root/'scripts/notes/nlp-adaptation-cases.py');candidate=importlib.util.module_from_spec(spec);spec.loader.exec_module(candidate)
for mask_int in range(1,32):
 mask=[bool(mask_int&(1<<i)) for i in range(5)];den=sum(m for m,ok in zip(mass,mask) if ok)
 wants=[F(sum(m*v[j] for m,v,ok in zip(mass,values,mask) if ok),den) for j in range(2)]
 for permutation in itertools.permutations([[0,1],[2],[3,4]]):
  for shift in [0,-1000,1000]:
   got,_=candidate.merge_rows([math.log(m)+shift for m in mass],values,permutation,mask)
   for x,y in zip(got,wants):close(x,y)
try:candidate.merge_rows([0]*5,values,[[0,1],[2],[3,4]],[False]*5)
except ValueError:checks+=1
else:raise AssertionError('empty mask')
for row in e['memory']:
 n=row['n'];common=sum(n*48*2 for _ in range(4));eq(row['common_bytes'],common)
 dense=common+2*(n*n*2);streamed=common+2*n*4
 eq(row['dense_bytes'],dense);eq(row['streamed_bytes'],streamed);close(row['dense_kib'],dense/1024);close(row['streamed_kib'],streamed/1024)
m=e['moe'];eq(m['expert_parameters'],123);eq(m['router_parameters'],35);eq(m['total_parameters'],650);eq(m['touched_parameters'],281)
close(m['top2_weights'][0],F(2,3));close(m['top2_weights'][1],F(1,3));close(m['top2_output'],0);close(m['switch_top1_output'],F(3,2))
close(m['balance_without_alpha'],F(4,3))
for row in m['capacities']:
 cap=row['capacity'];used=sum(min(n,cap) for n in [6,4,3,2,0]);eq(row['used'],used);eq(row['dropped'],15-used);eq(row['empty_slots'],5*cap-used);close(row['factor'],F(cap,3))
for row,want in zip(e['gqa_cache'],[108,36,18]):eq(row['kib'],want);eq(row['bytes'],want*1024)
eq(e['equal_ffn_parameter_counts'],{'relu':72,'swiglu':72})
# Independent two-margin symmetric objective; no per-example gradient accumulation.
softplus=lambda z:math.log1p(math.exp(z))
sigmoid=lambda z:1/(1+math.exp(-z))
def objective(p):
 a1,a2,w,b=p
 return sum(cmath.log(1+cmath.exp(-(2*y-1)*(w*(a1*x1+a2*x2)+b))) for x1,x2,y in [(-2,-1,0),(-2,1,1),(2,-1,0),(2,1,1)])/4
p=[1.,0.,1.,0.];trace=[]
for step in range(241):
 a1,a2,w,b=p;zp=w*(a2+2*a1);zm=w*(a2-2*a1)
 sp,sm=sigmoid(-zp),sigmoid(-zm)
 grad=[w*(sm-sp),-.5*w*(sp+sm),-.5*((a2+2*a1)*sp+(a2-2*a1)*sm),0.]
 loss=.5*(softplus(-zp)+softplus(-zm))
 close(loss,objective(p).real)
 if step%10==0:
  for j in range(4):
   perturbed=p[:];perturbed[j]+=1e-25j;close(grad[j],objective(perturbed).imag/1e-25)
 if step==0:
  for x,y in zip(t['first_gradient']['encoder']+[t['first_gradient']['head_weight'],t['first_gradient']['head_bias']],grad):close(x,y)
 matching=[h for h in t['history'] if h['step']==step]
 if matching:
  h=matching[0]
  for x,y in zip(h['encoder']+[h['head_weight'],h['head_bias']],p):close(x,y)
  close(h['target_nll'],loss)
  logits=[w*(a1*x1+a2*x2)+b for x1,x2 in [(-2,-1),(-2,1),(2,-1),(2,1)]]
  for x,y in zip(h['logits'],logits):close(x,y)
  predictions=[int(z>=0) for z in logits]
  close(h['target_accuracy'],sum(x==y for x,y in zip(predictions,[0,1,0,1]))/4)
  close(h['old_rule_accuracy'],sum(x==y for x,y in zip(predictions,[0,0,1,1]))/4)
 trace.append([step,*p,loss])
 if step<240:p=[v-.2*g for v,g in zip(p,grad)]
close(t['frozen_optimal_target_nll'],math.log(2));close(t['explicit_alternative_nll'],math.log1p(math.exp(-2)))
for j in range(1,1000):
 q=j/1000;loss=-.5*math.log(q*(1-q));assert loss>=math.log(2)-1e-14;checks+=1
close(t['verbalizer']['conditional_class_probability'],F(3,4));eq(t['cache_example']['feature_bytes'],840);eq(t['cache_example']['three_class_head_parameters'],24)
result={'status':'PASS','assertions':checks,'methods':['Exact rational attention prefixes; all 31 nonempty masks x 6 block permutations x 3 shifts compared to exact weighted outcomes.','Independent two-margin symmetric logistic dynamics, all 241 losses, seven saved checkpoints and complex-step gradients at 25 parameter states.','Frozen pair optimum over 999 probabilities; allocation/capacity/GQA/feature counts checked.'],'numericLimit':'Constructed arithmetic only, no empirical model/accelerator result.'}
Path(__file__).with_name('oracle-result.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
