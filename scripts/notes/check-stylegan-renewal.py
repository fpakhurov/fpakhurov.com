#!/usr/bin/env python3
"""Scoped StyleGAN calculations, authored for this project with Codex assistance.

No network, pretrained model or external data. NumPy executes the note and
independently evaluates the scalar and convolution figure fixtures. --write saves.
"""
import ast
import contextlib
from fractions import Fraction as F
import io
import json
import math
from pathlib import Path
import re
import sys
import numpy as np

ROOT=Path(__file__).resolve().parents[2]
DEST=ROOT/'docs/reports/2026-11-13-licensed-example-renewal/stylegan-numerical-checks.json'

def rounded(x):
    if isinstance(x,float):return round(x,12)
    if isinstance(x,dict):return {k:rounded(v) for k,v in x.items()}
    if isinstance(x,(list,tuple)):return [rounded(v) for v in x]
    return x

def near(a,b,tol=1e-10):assert abs(a-b)<tol,(a,b)

def uniforms(seed):
    # Python adaptation of bryc's public-domain Mulberry32 JavaScript.
    # Pinned grant, adaptation details: /licenses/stylegan-verifier.txt.
    mask=(1<<32)-1
    while True:
        seed=(seed+0x6d2b79f5)&mask
        a=((seed^(seed>>15))*(seed|1))&mask
        a=(((a+(((a^(a>>7))*(a|61))&mask))&mask)^a)&mask
        yield ((a^(a>>14))&mask)/4294967296

def convolution_figure():
    stream=uniforms(7)
    def draw(shape):
        n=math.prod(shape)
        return np.array([math.sqrt(-2*math.log(1-next(stream)))*math.cos(2*math.pi*next(stream)) for _ in range(n)]).reshape(shape)
    x=draw((8,26,26));w=draw((8,8,3,3))/math.sqrt(72)
    styles=np.exp(1.5*draw((6,8)));big=draw((8,28,28))
    windows=np.lib.stride_tricks.sliding_window_view
    smooth=windows(big,(3,3),axis=(1,2)).sum(axis=(-2,-1))/3
    raw=windows(x,(3,3),axis=(1,2));corr=windows(smooth,(3,3),axis=(1,2))
    rows=[]
    for s in styles:
        wm=w*s[None,:,None,None];sigma=np.sqrt((wm*wm).sum(axis=(1,2,3)))
        wd=wm/np.sqrt(sigma[:,None,None,None]**2+1e-8)
        def std(p,k):return np.einsum('ichab,oiab->och',p,k).std(axis=(1,2)).tolist()
        rows.append({'mod':std(raw,wm),'dem':std(raw,wd),'smooth':std(corr,wd),'sigma':sigma.tolist()})
    bounds={k:[min(min(row[k]) for row in rows),max(max(row[k]) for row in rows)] for k in ['mod','dem','smooth']}
    assert [f'{v:.1f}' for v in bounds['mod']]==['1.4','14.9']
    assert [f'{v:.2f}' for v in bounds['dem']]==['0.93','1.05']
    assert [f'{v:.2f}' for v in bounds['smooth']]==['0.65','1.20']
    return {'samples':rows,'bounds':bounds,'inputShape':[8,26,26],'validOutputShape':[8,24,24],'seed':7}

def calculate():
    joint=[[F(7,16),F(1,16)],[F(1,16),F(7,16)]]
    assert [sum(row) for row in joint]==[F(1,2)]*2
    assert [sum(joint[i][j] for i in range(2)) for j in range(2)]==[F(1,2)]*2
    p,q=7/8,3/4
    mi=math.log(2)+p*math.log(p)+(1-p)*math.log(1-p)
    bound=math.log(2)+p*math.log(q)+(1-p)*math.log(1-q)
    gap=p*math.log(p/q)+(1-p)*math.log((1-p)/(1-q))
    near(mi-bound,gap)
    # Eight equiprobable V intervals per U half realize the full table.
    counts=[[0,0],[0,0]]
    for u in [.25,.75]:
        for j in range(8):
            a=int(u<.5);bb=a if (j+.5)/8<7/8 else 1-a;counts[a][bb]+=1
    assert counts==[[7,1],[1,7]]
    feature=np.array([-3.,-1,1,3]);noise=np.array([1.,-1,-1,1]);cases=[]
    for b,s,t in [(.5,1,0),(.5,2,1),(-.5,1,0)]:
        r=feature+b*noise;out=s*(r-r.mean())/r.std()+t
        near(r.var(),5.25);near(out.mean(),t);near(out.std(),abs(s))
        cases.append({'noiseScale':b,'scale':s,'shift':t,'input':r.tolist(),'output':out.tolist(),'mean':float(out.mean()),'std':float(out.std())})
    spikes=[]
    for amplitude in [1,3]:
        for spike in [0,4,10,40]:
            values=np.array([amplitude]*8+[-amplitude]*7+[spike],float)
            norm=(values-values.mean())/values.std()
            spikes.append({'a':amplitude,'S':spike,'halfGap':float((norm[0]-norm[8])/2),'normalizedSpike':float(norm[-1])})
    assert [f'{r["halfGap"]:.3f}' for r in spikes[:4]]==['1.035','0.737','0.386','0.103']
    weights=np.array([1.8,.4]);dem=weights/np.linalg.norm(weights)
    near(float(dem@dem),1);correlated=float(dem@np.array([[1,.5],[.5,1]])@dem)
    near(correlated,103/85)
    # Direct complex sums, independent of the note's rFFT implementation.
    spectra=[]
    for n in [8,16]:
        row=[]
        for shift in [0,1/(2*n)]:
            values=[max(0,math.cos(2*math.pi*3*(j/n-shift))) for j in range(n)]
            coeff=[abs(sum(v*complex(math.cos(-2*math.pi*k*j/n),math.sin(-2*math.pi*k*j/n)) for j,v in enumerate(values)))/n for k in range(4)]
            row.append(coeff)
        spectra.append({'n':n,'unshifted':row[0],'shifted':row[1],'aliasChange':abs(row[0][2]-row[1][2])})
    for j in range(8):near(math.cos(2*math.pi*5*j/8),math.cos(2*math.pi*3*j/8))
    bodies=[(ROOT/'src/content'/loc/'generative-models/stylegan.mdx').read_text() for loc in ['notes','notes-ru']]
    blocks=[re.search(r'```python\n([\s\S]*?)```',b).group(1) for b in bodies]
    assert blocks[0]==blocks[1]
    out=io.StringIO();ns={}
    with contextlib.redirect_stdout(out):exec(compile(blocks[0],'stylegan-inline.py','exec'),ns)
    for row in spectra:
        for key,shift in [('unshifted',0),('shifted',1/(2*row['n']))]:
            assert np.allclose(row[key],ns['relu_spectrum'](row['n'],shift),rtol=0,atol=1e-13)
    expected='''modulated    channel std: min 1.97, max 7.12
demodulated  channel std: min 0.92, max 1.07
equal           Var|J^T y| = 0.51, formula 0.50
half 3x larger  Var|J^T y| = 0.84, formula 0.82
8 [0.302 0.    0.125 0.25 ] [0.327 0.    0.096 0.25 ]
16 [0.314 0.    0.015 0.25 ] [0.32  0.    0.006 0.25 ]
'''
    assert out.getvalue()==expected,out.getvalue()
    return rounded({'binaryJoint':[[str(x) for x in row] for row in joint],'jointConstructionCounts':counts,'information':{'mutualInformation':mi,'bound':bound,'gapKL':gap},'styleCases':cases,'spikes':spikes,'demodulation':{'weights':dem.tolist(),'correlatedVariance':correlated},'localPathVarianceApproximations':[.5,.82],'equalSingularRelativeQStd':math.sqrt(2/512),'reluCosine6Coefficient':2/(3*math.pi),'spectra':spectra,'convolutionFigure':convolution_figure(),'inlineStdout':out.getvalue(),'scope':'Synthetic scalar and convolution experiments only; no GAN training or paper benchmark replication.'})

if __name__=='__main__':
    result=calculate();serialized=json.dumps(result,indent=2,ensure_ascii=False)+'\n'
    if '--write' in sys.argv:DEST.write_text(serialized)
    else:assert json.loads(DEST.read_text())==result
    print('StyleGAN scalar, inline NumPy and convolution oracle checks passed.')
