#!/usr/bin/env python3
"""Original scoped drag-note verification for this project, with Codex assistance.

NumPy runs the note's inline example; all independent scalar/2D checks use stdlib.
No images, datasets, pretrained weights or network requests. --write saves evidence.
"""
import ast
import contextlib
from fractions import Fraction as F
import hashlib
import importlib.util
import io
import json
import math
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[2]
DEST = ROOT / 'docs/reports/2026-11-13-licensed-example-renewal/drag-numerical-checks.json'

def rounded(x):
    if isinstance(x,float): return round(x,12)
    if isinstance(x,dict): return {k:rounded(v) for k,v in x.items()}
    if isinstance(x,(tuple,list)): return [rounded(v) for v in x]
    return x

def near(a,b,tol=1e-8):
    assert abs(a-b)<tol, (a,b)

def field(q,s):
    u,v = q[0]-9-s[0], q[1]-10-s[1]
    g = math.exp(-(u*u+v*v)/18)
    return (g,u*g/3,v*g/3)

def patch(p):
    return [(x,y) for x in range(32) for y in range(20) if (x-p[0])**2+(y-p[1])**2<9]

def loss(p,s,reference_s=None):
    length=math.dist(p,(21,13))
    if length==0:return 0.
    d=((21-p[0])/length,(13-p[1])/length)
    total=0.
    for q in patch(p):
        a=field((q[0]+d[0],q[1]+d[1]),s)
        b=field(q,s if reference_s is None else reference_s)
        total+=sum(abs(x-y) for x,y in zip(a,b))
    return total

def gradient(p,s,sg):
    length=math.dist(p,(21,13))
    if length==0:return [0.,0.]
    d=((21-p[0])/length,(13-p[1])/length)
    out=[0.,0.]
    def jac(q):
        u,v=q[0]-9-s[0],q[1]-10-s[1]
        g=math.exp(-(u*u+v*v)/18);gx,gy=-u*g/9,-v*g/9
        return ((gx,gy),((g+u*gx)/3,u*gy/3),(v*gx/3,(g+v*gy)/3))
    for q in patch(p):
        shifted=(q[0]+d[0],q[1]+d[1]);a,b=field(shifted,s),field(q,s)
        ja,jb=jac(shifted),jac(q)
        for c in range(3):
            sign=(a[c]>b[c])-(a[c]<b[c])
            for j in range(2):out[j]+=sign*(-ja[c][j]+(0 if sg else jb[c][j]))
    return out

def run(sg,maximum=80):
    p=(11,9);s=(0.,0.);reference=field(p,s);hist=[{'k':0,'p':p,'s':s}]
    for k in range(1,maximum+1):
        if math.dist(p,(21,13))<=1:break
        g=gradient(p,s,sg);s=tuple(s[j]-.1*g[j] for j in range(2))
        candidates=[(x,y) for x in range(32) for y in range(20) if abs(x-p[0])<5 and abs(y-p[1])<5]
        p=min(candidates,key=lambda q:sum(abs(a-b) for a,b in zip(field(q,s),reference)))
        hist.append({'k':k,'p':p,'s':s})
    return hist

def calculate():
    # Finite differences use a separately expressed scalar loss and freeze b at the evaluation point.
    finite=[]
    for p,s in [((11,9),(0.,0.)),((15,11),(4.13,1.71)),((20,13),(8.89,3.87))]:
        for sg in [True,False]:
            analytic=gradient(p,s,sg);fd=[]
            for j in range(2):
                plus=list(s);minus=list(s);plus[j]+=1e-6;minus[j]-=1e-6
                fd.append((loss(p,plus,s if sg else None)-loss(p,minus,s if sg else None))/2e-6)
            for a,b in zip(analytic,fd):near(a,b,2e-8)
            finite.append({'point':p,'translation':s,'stopGradient':sg,'analytic':analytic,'finiteDifference':fd})
    history=run(True);without=run(False,len(history)-1)
    assert len(history)==14 and history[-1]['p']==(20,13) and without[-1]['p']==(10,10)
    assert gradient((21,13),(0.,0.),True)==[0.,0.]
    # Exact two-level DDIM experiment: sqrt(alpha_A)=4/5, sqrt(alpha_B)=3/5.
    a=F(1);eps_a=a/2;clean_a=(a-F(3,5)*eps_a)/F(4,5)
    b=F(3,5)*clean_a+F(4,5)*eps_a;eps_b=b/2
    clean_b=(b-F(4,5)*eps_b)/F(3,5);back=F(4,5)*clean_b+F(3,5)*eps_b
    reuse=F(4,5)*((b-F(4,5)*eps_a)/F(3,5))+F(3,5)*eps_a
    assert (clean_a,b,eps_b,clean_b,back,reuse)==(F(7,8),F(37,40),F(37,80),F(37,40),F(407,400),F(1))
    weights=[[F(3,4),F(1,4)],[F(1,4),F(3,4)]];values=[(2,-1),(-2,3)]
    outputs=[[sum(w[k]*values[k][j] for k in range(2)) for j in range(2)] for w in weights]
    assert outputs==[[F(1),F(0)],[F(-1),F(2)]]
    bodies=[(ROOT/'src/content'/loc/'generative-models/drag-editing.mdx').read_text() for loc in ['notes','notes-ru']]
    blocks=[re.findall(r'```python\n([\s\S]*?)```',b)[0] for b in bodies]
    assert ast.dump(ast.parse(blocks[0]))==ast.dump(ast.parse(blocks[1]))
    out=io.StringIO();ns={}
    with contextlib.redirect_stdout(out):exec(compile(blocks[0],'drag-inline.py','exec'),ns)
    near(float(ns['grad_sg']),-.3032653298563167)
    near(float(ns['grad_no']),.248295234259055)
    near(float(ns['L_sg'](1)),0)
    sys.dont_write_bytecode=True
    spec=importlib.util.spec_from_file_location('practice',ROOT/'scripts/notes/generative-practice.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
    practice=m.drag_editing();saved=json.loads((ROOT/'docs/reports/2026-11-13-licensed-example-renewal/generative-practice-results.json').read_text())['experiments']['drag-editing']
    assert rounded(practice)==rounded(saved)
    return rounded({'origin':'Independent scalar/analytic project fixtures with Codex assistance; no external input/media/model',
      'history':history,'withoutStopGradient':without,'finiteDifferences':finite,
      'losses':[loss(h['p'],h['s'],h['s']) for h in history[:-1]],
      'ddim':{'cleanA':str(clean_a),'noisyB':str(b),'predictionB':str(eps_b),'cleanB':str(clean_b),'roundTrip':str(back),'reusedPredictionRoundTrip':str(reuse)},
      'attention':{'keys':[[1,0],[0,1]],'values':values,'weights':[[float(v) for v in w] for w in weights],'outputs':[[int(v) for v in o] for o in outputs]},
      'inline_python_sha256':hashlib.sha256(blocks[0].encode()).hexdigest(),'inline_stdout':out.getvalue(),'synthetic_practice':practice})

if __name__=='__main__':
    result=calculate()
    if '--write' in sys.argv:DEST.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
    else:assert result==json.loads(DEST.read_text()),'Saved drag results differ'
    import numpy
    print('Drag checks passed: full analytic trajectories, 12 finite-difference derivatives, exact DDIM/attention, inline code and optional practice.')
    print('Python '+sys.version.split()[0]+'; NumPy '+numpy.__version__)
