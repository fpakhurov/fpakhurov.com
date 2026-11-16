"""Independent finite-law oracle; does not import the author's calculator."""
from collections import defaultdict
from decimal import Decimal as D, localcontext
from fractions import Fraction as Q
from functools import lru_cache
from math import comb, exp, sqrt, log, log2, log10
from pathlib import Path
import hashlib
import json

ROOT = Path('/Users/fedorpakhurov/code/_work/fp-probability-limit-drafts')
OUT = Path(__file__).parent
checks = 0
worst_error = 0

def equal(a, b):
    global checks
    assert a == b, (a, b)
    checks += 1

def close(a, b, tolerance=2e-13):
    global checks, worst_error
    error = abs(float(a) - float(b))
    assert error < tolerance, (a, b, error)
    worst_error = max(worst_error, error)
    checks += 1

def load(slug):
    return json.loads((ROOT / 'src/components/figures' / slug / 'cases.json').read_text())

@lru_cache(None)
def gaussian_cdf(z):
    # Integrate the Gaussian density by its entire power series at 100 digits.
    with localcontext() as context:
        context.prec = 100
        x = D(str(z))
        pi = D('3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679')
        total = term = x
        k = 0
        while True:
            term *= -(x*x) / 2 / (k+1) * D(2*k+1) / D(2*k+3)
            total += term
            k += 1
            if abs(term) < D('1e-85'):
                break
            assert k < 1500
        return float(D('.5') + total / (2*pi).sqrt())

def counts_for(n):
    # Condition on how many observations take 4, then enumerate remaining 2s.
    # Exact multiplicity recurrence is independent of sequential convolution.
    weights = defaultdict(int)
    for count4 in range(n+1):
        remaining = n - count4
        weight = comb(n, count4) * 3**remaining
        for count2 in range(remaining+1):
            weights[-n + 3*count2 + 5*count4] += weight
            if count2 < remaining:
                numerator = weight * (remaining-count2) * 2
                denominator = (count2+1)*3
                assert numerator % denominator == 0
                weight = numerator // denominator
    return dict(sorted(weights.items()))

lln, clt = load('law-of-large-numbers'), load('central-limit-theorem')
atoms = {Q(-1): Q(1,2), Q(2): Q(1,3), Q(4): Q(1,6)}
mu = sum(x*p for x,p in atoms.items())
variance = sum((x-mu)**2*p for x,p in atoms.items())
rho = sum(abs(x-mu)**3*p for x,p in atoms.items())
equal(mu, Q(5,6)); equal(variance, Q(137,36)); equal(rho, Q(641,72))
equal(lln['law'], clt['law'])
for key, value in [('mean',mu),('variance',variance),('absoluteThirdCentralMoment',rho)]:
    equal(Q(lln['law'][key]), value)
close(lln['law']['standardizedThirdAbsoluteMoment'], rho/float(variance)**1.5)
laws = {n: counts_for(n) for n in [1,4,6,16,24,64,96,384]}
for n, counts in laws.items():
    equal(sum(counts.values()), 6**n)
    equal(sum(Q(s*mass,6**n) for s,mass in counts.items()), n*mu)
    equal(sum((s-n*mu)**2*Q(mass,6**n) for s,mass in counts.items()), n*variance)
for row in lln['weak']:
    n = row['n']; counts = laws[n]
    tail = Q(sum(v for s,v in counts.items() if abs(6*s-5*n) >= 3*n),6**n)
    equal(tail, Q(row['exactTail'])); close(row['tail'], tail)
    close(row['chebyshev'], 4*variance/n)
    close(row['hoeffding'], 2*exp(-n/50))
for row in lln['events']:
    n = row['n']; no_event = Q(1)
    for t in range(n,4*n+1):
        no_event *= 1-Q(1,t+2)
    equal(no_event,Q(n+1,4*n+2))
    close(row['atN'],Q(1,n+2)); close(row['through4N'],1-no_event)

# Direct monomial moments, including the negative antithetic covariance.
eu2, eu4 = Q(1,3), Q(1,5)
e_u2_one_minus_u2 = Q(1,3)-Q(2,4)+Q(1,5)
covariance = e_u2_one_minus_u2 - eu2**2
plain_variance = eu4-eu2**2
paired_variance = (plain_variance + covariance)/2
equal(covariance,Q(-7,90)); equal(paired_variance,Q(1,180))
equal(Q(lln['monteCarlo']['integral']),1+eu2)
equal(Q(lln['monteCarlo']['secondMoment']),1+2*eu2+eu4)
equal(Q(lln['monteCarlo']['variance']),plain_variance)
equal(Q(lln['monteCarlo']['pairVariance']),paired_variance)
for row in lln['monteCarlo']['budget']:
    n = row['evaluations']; equal(row['pairs'],n//2)
    equal(Q(row['plainMse']),plain_variance/n)
    equal(Q(row['pairedMse']),2*paired_variance/n)
    close(row['plainRms'],sqrt(plain_variance/n))
    close(row['pairedRms'],sqrt(2*paired_variance/n))
    close(row['plainRms']/row['pairedRms'],sqrt(8))

for row in clt['cdfs']:
    n = row['n']; denominator = 6**n; sd = sqrt(n*float(variance))
    cumulative = 0; expected = []; distances = []
    for total, mass in laws[n].items():
        z = (6*total-5*n)/sqrt(137*n)
        left, right = cumulative/denominator,(cumulative+mass)/denominator
        cumulative += mass
        expected.extend([[z,left],[z,right]])
        distances.append((max(abs(left-gaussian_cdf(z)),abs(right-gaussian_cdf(z))),total))
    equal(len(expected),len(row['points']))
    for actual,wanted in zip(row['points'],expected):
        close(actual[0],wanted[0]);close(actual[1],wanted[1])
    supremum, where = max(distances)
    close(row['kolmogorov'],supremum);equal(row['worstSum'],where)
    close(row['berryEsseenConstant3'],3*float(rho)/float(variance)**1.5/sqrt(n))
    cdf_at = lambda point: sum(m for s,m in laws[n].items() if (6*s-5*n)/sqrt(137*n)<=point)/denominator
    cropped = [[-4,cdf_at(-4)]] + [p for p in expected if -4<p[0]<=4] + [[4,cdf_at(4)]]
    equal(len(cropped),len(row['plotPoints']))
    for actual,wanted in zip(row['plotPoints'],cropped):
        close(actual[0],wanted[0]);close(actual[1],wanted[1])

for z, p in clt['normalCdf']:
    close(p, gaussian_cdf(z), 2e-15)
for row in clt['knownSigmaCoverage']:
    n = row['n']; counts = laws[n]
    included = [s for s in counts if (25*(6*s-5*n))**2 <= 49**2*137*n]
    probability = Q(sum(counts[s] for s in included),6**n)
    equal(Q(row['exactCoverage']),probability);close(row['coverage'],probability)
    equal(row['lowerSum'],min(included));equal(row['upperSum'],max(included))
    close(row['standardError'],sqrt(float(variance)/n))
    close(row['halfWidth'],1.96*sqrt(float(variance)/n))

interval = clt['interval']; n = interval['n']; lower,upper=interval['lower'],interval['upper']
probability=Q(sum(m for s,m in laws[n].items() if lower<=s<=upper),6**n)
equal(Q(interval['exact']),probability);close(interval['probability'],probability)
scaled=lambda s:(6*s-5*n)/sqrt(137*n)
close(interval['uncorrected'],gaussian_cdf(scaled(upper))-gaussian_cdf(scaled(lower)))
close(interval['continuityCorrected'],gaussian_cdf(scaled(upper+.5))-gaussian_cdf(scaled(lower-.5)))
close(clt['normalNominalCoverage'],gaussian_cdf(1.96)-gaussian_cdf(-1.96))
for row in clt['modes']:
    n=row['n'];minus=(-1)**n*(-3);plus=(-1)**n*3
    equal(row['atZminus3'],minus);equal(row['atZplus3'],plus)
    close(row['probabilityDistanceFromZAbove1'],(int(abs(minus+3)>1)+int(abs(plus-3)>1))/2)

result={'assertions':checks,'maxNumericDifference':worst_error,'method':'Independent exact conditional-multiplicity recurrence at eight sizes through 384; 100-digit integrated Gaussian power series; rational antithetic covariance; exact squared coverage thresholds; all CDF points/jumps/clipped boundaries and saved table metrics.', 'fixtureHashes':{s:hashlib.sha256((ROOT/'src/components/figures'/s/'cases.json').read_bytes()).hexdigest() for s in ['law-of-large-numbers','central-limit-theorem']}}
(OUT/'oracle.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result,indent=2))
