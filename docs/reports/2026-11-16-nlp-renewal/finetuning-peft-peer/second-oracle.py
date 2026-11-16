"""Independent complex-step and Decimal oracle for the fixed original inputs."""
from pathlib import Path
from decimal import Decimal as D, localcontext
from fractions import Fraction as Q
import cmath
import hashlib
import json
import math

ROOT=Path('/Users/fedorpakhurov/code/_work/fp-nlp-finetuning-drafts')
OUT=Path(__file__).parent
read=lambda name:json.loads((ROOT/'src/components/figures/nlp'/name/'cases.json').read_text())
ft,peft=read('fine-tuning'),read('peft')
checks=0
maximum=0
def near(actual,expected,tol=2e-12):
    global checks,maximum
    if isinstance(expected,(list,tuple)):
        assert len(actual)==len(expected)
        for a,e in zip(actual,expected):near(a,e,tol)
    else:
        error=abs(float(actual)-float(expected));assert error<tol,(actual,expected,error)
        maximum=max(maximum,error);checks+=1
def exact(actual,expected):
    global checks
    assert actual==expected,(actual,expected);checks+=1
def derivative(function,values):
    epsilon=1e-25
    result=[]
    for index in range(len(values)):
        changed=list(values);changed[index]+=1j*epsilon
        result.append(function(changed).imag/epsilon)
    return result

# Closed scalar objective evaluated without the author's gradient routines.
def logit(q):
    a,b,c,d,v,w=q
    return v*(2*a+b)+w*(2*c+d)
def objective(q):return cmath.log(1+cmath.exp(-logit(q)))
initial=[1.,0.,0.,1.,1.,-1.]
gradient=derivative(objective,initial)
full=[a-.1*g for a,g in zip(initial,gradient)]
probe=initial[:4]+[a-.1*g for a,g in zip(initial[4:],gradient[4:])]
second_gradient=derivative(objective,probe)
probe_full=[a-.1*g for a,g in zip(probe,second_gradient)]
for key,state,old_gradient in [('full',full,gradient),('probe',probe,gradient),('probe_then_full',probe_full,second_gradient)]:
    row=ft[key]
    near(row['matrix'],[state[:2],state[2:4]])
    near(row['head'],state[4:]);near(row['logit'],logit(state));near(row['loss'],objective(state).real)
    near(row['gradient_matrix'],[old_gradient[:2],old_gradient[2:4]])
    near(row['gradient_head'],old_gradient[4:])
near(ft['initial_logit'],1);near(ft['initial_probability'],1/(1+math.exp(-1)))
near(ft['initial_loss'],objective(initial).real)
near(ft['probe']['matrix'],ft['initial_matrix'])
assert ft['probe']['loss']>ft['full']['loss']>ft['probe_then_full']['loss']

with localcontext() as context:
    context.prec=80
    theta=D(0);trace=[]
    for step in range(41):
        # Independently average both labels and both x values at each point.
        exp_minus=(-theta).exp();train=(1+exp_minus).ln()
        flipped=(1+theta.exp()).ln();validation=(3*train+flipped)/4
        point=ft['checkpoint']['trace'][step]
        exact(point['step'],step)
        near(point['theta'],theta);near(point['train'],train);near(point['validation'],validation)
        trace.append((step,theta,train,validation))
        theta += D(1)/4*exp_minus/(1+exp_minus)
    best=min(trace,key=lambda x:x[3]);exact(best[0],12)
    exact(ft['checkpoint']['best'],ft['checkpoint']['trace'][12])
    near(ft['checkpoint']['optimal_theta'],D(3).ln())
    first=-(D('.4').ln()+D('.8').ln())/2;second=-D('.5').ln()
    for key,value in [('first_loss',first),('second_loss',second),('token_mean',(2*first+second)/3),('example_mean',(first+second)/2)]:
        near(ft['masked_loss'][key],value)
exact(ft['masked_loss']['prefix'],['sort','teal','disk'])
exact(ft['masked_loss']['target'],['left','EOS'])
padding=ft['padding'];exact(padding['lengths'],[3,6,4])
exact(padding['valid_tokens'],13);exact(padding['padded_tokens'],18)
exact(padding['valid_square_slots'],61);exact(padding['padded_square_slots'],108)
exact(padding['local_tokens'],14);exact(padding['local_square_slots'],68)

# Five factor entries, with B first and A last; the base is kept literal.
def output(q):
    b0,b1,a0,a1,a2=q
    projected=2*a0+a1-a2
    return [3+2*b0*projected,2*b1*projected]
def squared(q):
    a,b=output(q)
    return ((a-2)**2+(b-2)**2)/2
factors=[0.,0.,1.,-1.,2.]
factor_gradient=derivative(squared,factors)
near(peft['gradient_B'],[[factor_gradient[0]],[factor_gradient[1]]])
near(peft['gradient_A'],[factor_gradient[2:]])
updated=[v-.1*g for v,g in zip(factors,factor_gradient)]
near(peft['B'],[[updated[0]],[updated[1]]]);near(peft['A'],[updated[2:]])
near(peft['initial_output'],output(factors));near(peft['initial_loss'],squared(factors))
near(peft['output'],output(updated));near(peft['loss'],squared(updated))
base=[[Q(1),Q(0),Q(-1)],[Q(0),Q(1),Q(1)]]
left=[Q(1,5),Q(-2,5)];right=[Q(1),Q(-1),Q(2)]
update=[[2*b*a for a in right] for b in left]
merged=[[base[i][j]+update[i][j] for j in range(3)] for i in range(2)]
near(peft['update'],update);near(peft['merged'],merged)
near(peft['both_zero']['gradient_A'] if 'gradient_A' in peft['both_zero'] else peft['both_zero']['gradient_right'],[[0,0,0]])
near(peft['both_zero']['gradient_left'],[[0],[0]])
near(derivative(squared,[0.]*5),[0.]*5)
second=derivative(squared,updated)
assert any(abs(x)>0 for x in second[2:])
# Check the general two-factor gradient formulas at nonzero factor states.
for q in [updated,[.3,-.2,.5,1.,-.4],[-.5,.2,2.,-.3,.7]]:
    b0,b1,a0,a1,a2=q;ax=2*a0+a1-a2
    prediction=output(q);g=[prediction[0]-2,prediction[1]-2]
    expected=[2*g[0]*ax,2*g[1]*ax]+[2*(b0*g[0]+b1*g[1])*x for x in [2,1,-1]]
    near(derivative(squared,q),expected)

nonlinear=peft['nonlinear']
exact(nonlinear['positive'],[8,-2]);exact(nonlinear['negative'],[-2,-1]);exact(nonlinear['sum'],[6,-3])
exact(peft['rank']['first'],[[1,0],[0,0]]);exact(peft['rank']['second'],[[0,0],[0,1]])
exact(peft['rank']['sum'],[[1,0],[0,1]]);exact(peft['rank']['determinants'],[0,0,1])
count=peft['count']
for key,value in {'base':4194304,'update':32768,'reduction':128,'full_bytes':67108864,'frozen_bytes':16777216,'update_bytes':524288,'full_mib':64,'frozen_mib':16,'update_mib':.5,'total_mib':16.5,'tiny_rank1':5,'tiny_rank2':10}.items():near(count[key],value)
exact(peft['prompt'],{'length':6,'width':16,'layers':4,'input_parameters':96,'kv_parameters':768})
result={'assertions':checks,'maxNumericDifference':maximum,'method':'Complex-step derivatives of independent scalar objectives for full/probe/LP-FT and zero/nonzero LoRA states; 80-digit Decimal checkpoint trajectory and masked losses; exact rational merge and explicit state/padding counts. No import of author calculator.','fixtureHashes':{name:hashlib.sha256((ROOT/'src/components/figures/nlp'/name/'cases.json').read_bytes()).hexdigest() for name in ['fine-tuning','peft']}}
(OUT/'oracle.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result,indent=2))
