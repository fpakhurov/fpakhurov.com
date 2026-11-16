"""Independent stdlib oracle; never imports the author computation or plot code."""
import hashlib
import json
import math
import re
import subprocess
from collections import Counter
from decimal import Decimal, getcontext
from fractions import Fraction
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path('/Users/fedorpakhurov/code/_work/fp-probability-transform-gaussian-drafts')
OUT = Path(__file__).resolve().parent
HOST = Path('/Users/fedorpakhurov/code/_work/fpakhurov-renewal-release')
getcontext().prec = 64
D = lambda x: Decimal(str(x))
PI = D('3.1415926535897932384626433832795028841971693993751058209749445923')
counts = Counter()
maximum = {}

def same(label, actual, expected, tol=2e-12):
    error = abs(float(actual)-float(expected))
    assert error <= tol, (label, actual, expected, error, tol)
    counts[label] += 1
    maximum[label] = max(error, maximum.get(label, 0))

def truth(label, condition):
    assert condition, label
    counts[label] += 1

def cdf(y):
    # Direct event/support intersection, not the author's piecewise CDF.
    if y < 0:
        return D(0)
    r = D(y).sqrt()
    return max(D(0), min(D(4), r)-max(D(-2), -r))/6

def inverse_by_bisection(u):
    lo, hi = D(0), D(16)
    for _ in range(160):
        m = (lo+hi)/2
        if cdf(m) < D(u):
            lo = m
        else:
            hi = m
    return (lo+hi)/2

def gaussian(x, mu, var):
    x, mu, var = D(x), D(mu), D(var)
    return (-(x-mu)**2/(2*var)).exp()/(2*PI*var).sqrt()

def q_eigen(dx, dy):
    # Orthogonal principal-coordinate whitening; no polynomial form copied.
    dx, dy = D(dx), D(dy)
    a, b = (dx+dy)/D(2).sqrt(), (dx-dy)/D(2).sqrt()
    return a*a/8 + b*b/2

def radial(x, dimension):
    # Even-dimension integer-gamma formula; no lgamma or author's function.
    x = D(x)
    k = dimension//2
    assert dimension == 2*k
    return D(2*k**k)/D(math.factorial(k-1))*x**(2*k-1)*(-k*x*x).exp()

def radial_cdf(x, dimension):
    k = dimension//2
    z = k*D(x)**2
    return 1-(-z).exp()*sum(z**j/D(math.factorial(j)) for j in range(k))

t = json.loads((ROOT/'src/components/figures/functions-of-random-variables/cases.json').read_text())
g = json.loads((ROOT/'src/components/figures/multivariate-gaussian/cases.json').read_text())
masses = {}
for x, p in zip((-3,-1,1,3), (Fraction(1,8), Fraction(3,8), Fraction(1,4), Fraction(1,4))):
    masses[x*x] = masses.get(x*x, 0)+p
truth('discrete exact', masses == {r['y']: Fraction(r['mass']) for r in t['discrete']})
for y, p in t['cdf']:
    same('support-length CDF', p, cdf(y))
for x, y in t['square']:
    same('squared coordinate', y, D(x)**2)
for u, y in t['quantiles']+t['quantileCurve']:
    same('bisection quantile', y, inverse_by_bisection(u), 2e-13)
same('interval mass', cdf(1), Fraction(1,3))
same('interval mass', cdf(9)-cdf(4), Fraction(1,6))
same('clipping atom', t['clippedAtom'], Fraction(1,3))
same('lognormal median', t['lognormalMedian'], 2)
same('lognormal density at median', t['lognormalDensityAtMedian'], gaussian(0,0,1))
for row in t['flow']:
    z = D(row['z'])
    y = z+z*z*z/3
    jac = 1+z*z
    density = gaussian(z,0,1)/jac
    same('cubic flow', row['y'], y)
    same('cubic flow', row['derivative'], jac)
    same('cubic flow', row['density'], density)
    same('cubic flow', row['logDensity'], density.ln())
    # Verify density via a central difference of the transformed CDF, with an independently inverted cubic.
    def inv(v):
        low, high = -10., 10.
        for _ in range(80):
            middle=(low+high)/2
            if middle+middle**3/3 < v:
                low=middle
            else:
                high=middle
        return (low+high)/2
    def flow_cdf(v):
        return (1+math.erf(inv(v)/math.sqrt(2)))/2
    eps=1e-5
    same('flow CDF derivative', (flow_cdf(float(y)+eps)-flow_cdf(float(y)-eps))/(2*eps), density, 2e-10)
    same('composed flow correction', (density/2).ln(), gaussian(z,0,1).ln()-jac.ln()-D(2).ln())

sigma = [[Fraction(5),Fraction(3)],[Fraction(3),Fraction(5)]]
aug = [sigma[i]+[Fraction(i==j) for j in range(2)] for i in range(2)]
for pivot in range(2):
    divisor=aug[pivot][pivot]
    aug[pivot]=[v/divisor for v in aug[pivot]]
    for i in range(2):
        if i != pivot:
            factor=aug[i][pivot]
            aug[i]=[v-factor*w for v,w in zip(aug[i],aug[pivot])]
for i in range(2):
    same('mean', g['mean'][i], (-1,2)[i])
    for j in range(2):
        same('covariance', g['covariance'][i][j], sigma[i][j])
        same('Gauss Jordan inverse', g['inverse'][i][j], aug[i][j+2])
        same('Cholesky product', sum(g['cholesky'][i][k]*g['cholesky'][j][k] for k in range(2)), sigma[i][j])
same('determinant', g['determinant'], 16)
truth('eigenvalues', g['eigenvalues'] == [8,2])
same('peak density', g['peakDensity'], 1/(8*PI))
same('affine mean', g['affineMean'], -1)
same('affine variance exact', g['affineVariance'], sum(Fraction((2,-1)[i])*sigma[i][j]*(2,-1)[j] for i in range(2) for j in range(2)))
same('Schur mean exact', g['conditionalMean'], Fraction(2)+Fraction(3,5)*(3-(-1)))
same('Schur variance exact', g['conditionalVariance'], Fraction(5)-Fraction(9,5))
for row in g['mahalanobis']:
    same('eigen Mahalanobis', row['squared'], q_eigen(*row['delta']))
for row in g['ellipses']:
    r = row['radius']
    for x,y in row['points']:
        same('ellipse whitening', q_eigen(D(x)+1,D(y)-2), r*r)
    same('polar coverage', row['probability'], 1-(-D(r*r)/2).exp())
for y, marginal, conditional in g['conditionalCurves']:
    same('marginal density decimal', marginal, gaussian(y,2,5))
    # Joint density in the eigenbasis divided by the X1 marginal at x1=3.
    joint=(-q_eigen(4,D(y)-2)/2).exp()/(8*PI)
    same('conditional joint ratio', conditional, joint/gaussian(3,-1,5))
for row in g['shellCurves']:
    d=row['dimension']
    for x, density in row['points']:
        same('integer gamma radial', density, radial(x,d), 1e-11)
    same('relative radial mode', row['relativeMode'], (D(d-1)/d).sqrt())
    truth('radial full mass', 0 <= 1-radial_cdf(8,d) < D('1e-25'))
    truth('finite radial displayed window', radial_cdf(2,d) < 1)
bound=g['shellBound']
truth('shell bound setup', bound['dimension']==512 and bound['epsilon']==.25)
same('Chebyshev exact', bound['failureBound'], Fraction(2,512)/Fraction(1,4)**2)
for observed, squared in zip(bound['radii'], (384,512,640)):
    same('shell radii', observed, D(squared).sqrt())
h=[Fraction(-2),Fraction(0),Fraction(2)]
probs=[Fraction(1,4),Fraction(1,2),Fraction(1,4)]
truth('zero covariance counterexample', sum(x*p for x,p in zip(h,probs))==sum(x**3*p for x,p in zip(h,probs))==0 and probs[1]==Fraction(1,2))
truth('singular line example', Fraction(1)*4-Fraction(2)*2==0)

class FigureHTML(HTMLParser):
    def __init__(self):
        super().__init__()
        self.series={}
        self.ids=[]
        self.refs=[]
        self.circles=[]
        self.svg=0
        self.figures=0
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if 'id' in a: self.ids.append(a['id'])
        if 'aria-labelledby' in a: self.refs+=a['aria-labelledby'].split()
        if tag=='svg': self.svg+=1
        if tag=='figure': self.figures+=1
        if tag=='circle': self.circles.append((float(a['cx']),float(a['cy'])))
        if 'data-series' in a:
            name=a['data-series']
            assert name not in self.series
            self.series[name]=[list(map(float,p.split(','))) for p in a['points'].split()]

for locale in ('en','ru'):
    parsed=FigureHTML()
    parsed.feed((OUT/'render'/('transform-gaussian-'+locale+'.html')).read_text())
    truth('render structure', parsed.svg==6 and parsed.figures==5 and len(parsed.series)==10)
    truth('render accessible IDs', len(parsed.ids)==len(set(parsed.ids)) and set(parsed.refs)<=set(parsed.ids))
    for name, points in parsed.series.items():
        for px,py in points:
            truth('SVG coordinate finite/bounds', math.isfinite(px) and math.isfinite(py) and 48-1e-10<=px<=288+1e-10 and 32<=py<=276)
            if name=='square':
                x=(px-48)/40-2; y=(224-py)/11
                same('render square law', y, x*x)
            elif name=='cdf':
                y=(px-48)/15; p=(224-py)/176
                same('render CDF law', p, cdf(y))
            elif name=='quantile':
                u=(px-48)/240; y=(224-py)/11
                same('render quantile law', cdf(y), u)
            elif name.startswith('ellipse-'):
                x=(px-48)/24-6; y=(276-py)/24-3
                same('render ellipse law', q_eigen(x+1,y-2), int(name[-1])**2)
            elif name in ('marginal','conditional'):
                y=(px-48)*3/40-6; p=(224-py)/704
                expected=gaussian(y,2,5) if name=='marginal' else (-q_eigen(4,D(y)-2)/2).exp()/(8*PI)/gaussian(3,-1,5)
                same('render conditional laws', p, expected)
            else:
                d=int(name.split('-')[1]); x=(px-48)/120; p=(224-py)*7/176
                same('render radial law', p, radial(x,d), 1e-11)
    truth('render example markers', parsed.circles==[(88,213),(168,213),(248,125),(108,106.66666666666667),(88,221.25),(128,213),(168,199.25),(208,180),(248,125),(168,156),(216,108),(192,180)])

# Replay body cells directly, recording exact strings rather than source-level claims.
replays=[]
for locale in ('notes','notes-ru'):
    for topic in ('functions-of-random-variables','multivariate-gaussian'):
        path=ROOT/'src/content'/locale/'probability'/(topic+'.mdx')
        body=path.read_text()
        pairs=re.findall(r'```python\n(.*?)```\s*```text\n(.*?)```',body,re.S)
        truth('one inline replay',len(pairs)==1)
        for code,expected in pairs:
            stdout=subprocess.check_output(['python3','-c',code],text=True)
            truth('inline exact stdout',stdout==expected)
            replays.append({'path':str(path.relative_to(ROOT)),'stdout':stdout})

result={'reviewer':'pretraining_author independent peer','assertions':sum(counts.values()),'counts':dict(counts),'maxAbsoluteErrors':maximum,'inlineReplays':replays,'method':'No author code imported. Decimal 64-digit support lengths, inverse CDF bisection, integer-gamma factorial radial formula, exact Fraction elimination and Schur calculation, eigen-coordinate joint density ratios, actual Astro SVG reverse-coordinate laws.','limits':'Local numeric/source and component evidence, not browser/full-site/production validation.'}
(OUT/'oracle.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'assertions':result['assertions'],'categories':len(counts),'maxError':max(maximum.values())}))
