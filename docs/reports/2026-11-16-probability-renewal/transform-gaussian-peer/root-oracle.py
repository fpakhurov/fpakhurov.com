import contextlib
import hashlib
import io
import json
import math
import re
from fractions import Fraction as F
from pathlib import Path

root = Path('/Users/fedorpakhurov/code/_work/fp-probability-transform-gaussian-drafts')
evidence = Path('/Users/fedorpakhurov/code/_work/renewal-verification')
checks = 0
def near(actual, expected, tolerance=2e-10):
    global checks
    assert abs(actual-expected) < tolerance, (actual, expected)
    checks += 1

t = json.loads((root/'src/components/figures/functions-of-random-variables/cases.json').read_text())
g = json.loads((root/'src/components/figures/multivariate-gaussian/cases.json').read_text())
assert {r['y']: F(r['mass']) for r in t['discrete']} == {1:F(5,8),9:F(3,8)}
for y,p in t['cdf']:
    half = math.sqrt(y)
    near(p, (min(4,half)-max(-2,-half))/6)
for x,y in t['square']:
    near(y, x*x)
for u,y in t['quantileCurve'] + t['quantiles']:
    # Recover a probability from the length of its input event.
    near((min(4,math.sqrt(y))-max(-2,-math.sqrt(y)))/6, u)
for case in t['flow']:
    z=case['z']; near(case['y'],z*(1+z*z/3))
    expected = math.exp(-z*z/2)/math.sqrt(2*math.pi)/(1+z*z)
    near(case['density'],expected); near(math.exp(case['logDensity']),expected)
near(t['clippedAtom'],2/6); near(t['lognormalMedian'],2)
near(t['lognormalDensityAtMedian'],1/math.sqrt(2*math.pi))

sigma = [[F(5),F(3)],[F(3),F(5)]]
inv = [[F(5,16),F(-3,16)],[F(-3,16),F(5,16)]]
for i in range(2):
    for j in range(2):
        near(g['inverse'][i][j],float(inv[i][j]))
        near(sum(g['cholesky'][i][k]*g['cholesky'][j][k] for k in range(2)),float(sigma[i][j]))
near(g['determinant'],16); near(g['peakDensity'],1/(8*math.pi))
near(g['affineMean'],-1); near(g['affineVariance'],13)
near(g['conditionalMean'],float(F(22,5))); near(g['conditionalVariance'],float(F(16,5)))
for row in g['mahalanobis']:
    a,b=row['delta']; near(row['squared'],((a+b)**2/16+(a-b)**2/4))
for ellipse in g['ellipses']:
    for x,y in ellipse['points']:
        a,b=x+1,y-2
        near((a+b)**2/16+(a-b)**2/4,ellipse['radius']**2)
    near(ellipse['probability'],1-math.exp(-ellipse['radius']**2/2))
for y,marginal,conditional in g['conditionalCurves']:
    near(marginal,math.exp(-(y-2)**2/10)/math.sqrt(10*math.pi))
    delta1,delta2=4,y-2
    distance=(delta1+delta2)**2/16+(delta1-delta2)**2/4
    joint=math.exp(-distance/2)/(8*math.pi)
    observed_marginal=math.exp(-16/10)/math.sqrt(10*math.pi)
    near(conditional,joint/observed_marginal)
for row in g['shellCurves']:
    d=row['dimension']
    for x,p in row['points']:
        # All recorded dimensions are even: Gamma(d/2) is an integer factorial.
        expected = (2*F(d,2)**(d//2)/math.factorial(d//2-1))
        expected = float(expected)*x**(d-1)*math.exp(-d*x*x/2)
        near(p,expected)
    near(row['relativeMode']**2,1-1/d)
near(g['shellBound']['failureBound'],float(F(2,512)/F(1,4)**2))
for r,squared in zip(g['shellBound']['radii'],[384,512,640]): near(r*r,squared)

inline=0
for folder in ['notes','notes-ru']:
    for slug in ['functions-of-random-variables','multivariate-gaussian']:
        text=(root/f'src/content/{folder}/probability/{slug}.mdx').read_text()
        for code,expected in re.findall(r'```python\n([\s\S]*?)```\s*```text\n([\s\S]*?)```',text):
            capture=io.StringIO()
            with contextlib.redirect_stdout(capture):exec(code,{})
            assert capture.getvalue()==expected
            inline+=1
assert inline==4

record=json.loads((root/'content-rights/reviews/probability-transform-gaussian-complete.json').read_text())
for p,h in record['files'].items():assert hashlib.sha256((root/p).read_bytes()).hexdigest()==h,p
sources=json.loads((root/'docs/reports/2026-11-16-probability-renewal/transform-gaussian-source-evidence.json').read_text())
for s in sources['sources']:
    b=(root/'sources'/s['snapshot']).read_bytes()
    assert len(b)==s['bytes'] and hashlib.sha256(b).hexdigest()==s['snapshotSha256']
result={'reviewer':'Codex root','scope':'Independent event-length/quantile checks, eigenbasis geometry, joint/marginal density ratios, factorial radial densities, exact inline outputs and current file/source hashes. No author functions imported.',
        'numericAssertions':checks,'inlineStdoutReplays':inline,'currentRecordPins':len(record['files']),
        'primarySnapshots':len(sources['sources']),'reviewedFileHashes':record['files']}
(evidence/'probability-transform-gaussian-root-oracle.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({k:v for k,v in result.items() if k!='reviewedFileHashes'}))
