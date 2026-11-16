import cmath
import hashlib
import json
import math
from fractions import Fraction as Q
from pathlib import Path

root = Path('/Users/fedorpakhurov/code/_work/fp-probability-limit-drafts')
lln = json.loads((root / 'src/components/figures/law-of-large-numbers/cases.json').read_text())
clt = json.loads((root / 'src/components/figures/central-limit-theorem/cases.json').read_text())
checks = 0
max_error = 0.0

def same(a, b):
    global checks
    assert a == b, (a, b)
    checks += 1

def close(a, b, tolerance=2e-13):
    global checks, max_error
    difference = abs(float(a) - float(b))
    assert difference <= tolerance, (a, b, difference)
    max_error = max(max_error, difference)
    checks += 1

# Category-count enumeration independently reconstructs every sum mass,
# including n=384, without calling the author's recurrence or imports.
values = (-1, 2, 4)
probabilities = (Q(1, 2), Q(1, 3), Q(1, 6))
mean = sum(x * p for x, p in zip(values, probabilities))
variance = sum((x - mean) ** 2 * p for x, p in zip(values, probabilities))
third = sum(abs(x - mean) ** 3 * p for x, p in zip(values, probabilities))
same(mean, Q(5, 6)); same(variance, Q(137, 36)); same(third, Q(641, 72))
same(lln['law'], clt['law'])
same(lln['law']['mean'], str(mean)); same(lln['law']['variance'], str(variance))
same(lln['law']['absoluteThirdCentralMoment'], str(third))
close(lln['law']['standardizedThirdAbsoluteMoment'], float(third) / float(variance) ** 1.5)
laws = {}
for n in (1, 4, 6, 16, 24, 64, 96, 384):
    counts = [0] * (5 * n + 1)
    for fours in range(n + 1):
        choose_fours = math.comb(n, fours)
        for twos in range(n - fours + 1):
            negatives = n - fours - twos
            multiplicity = choose_fours * math.comb(n - fours, twos)
            counts[5 * fours + 3 * twos] += multiplicity * 3 ** negatives * 2 ** twos
    total = 6 ** n
    same(sum(counts), total)
    same(Q(sum((k - n) * c for k, c in enumerate(counts)), total), n * mean)
    same(sum(Q(c, total) * (k - n - n * mean) ** 2 for k, c in enumerate(counts)), n * variance)
    laws[n] = (counts, total)

for row in lln['weak']:
    n = row['n']; counts, total = laws[n]
    # Multiply the rational threshold inequality by 6n to avoid rounding.
    tail = Q(sum(c for k, c in enumerate(counts) if abs(6 * (k - n) - 5 * n) >= 3 * n), total)
    same(str(tail), row['exactTail']); close(tail, row['tail'])
    close(4 * variance / n, row['chebyshev'])
    close(2 * math.exp(-n / 50), row['hoeffding'])

for row in lln['events']:
    n = row['n']
    probability_none = math.prod(Q(k + 1, k + 2) for k in range(n, 4 * n + 1))
    same(probability_none, Q(n + 1, 4 * n + 2))
    close(row['atN'], Q(1, n + 2)); close(row['through4N'], 1 - probability_none)

# Direct monomial integrals and cross-moment give the equal-cost pair variance.
g_second = 1 + Q(2, 3) + Q(1, 5)
g_variance = g_second - Q(4, 3) ** 2
cross = 2 - 1 + 1 - Q(1, 2) + Q(1, 5)
covariance = cross - Q(4, 3) ** 2
pair_variance = (g_variance + covariance) / 2
same(g_variance, Q(4, 45)); same(covariance, Q(-7, 90)); same(pair_variance, Q(1, 180))
for row in lln['monteCarlo']['budget']:
    calls = row['evaluations']; pairs = calls // 2
    same(row['pairs'], pairs)
    plain = g_variance / calls; paired = pair_variance / pairs
    same(row['plainMse'], str(plain)); same(row['pairedMse'], str(paired))
    same(plain / paired, 8)
    close(row['plainRms'], math.sqrt(plain)); close(row['pairedRms'], math.sqrt(paired))

phi = lambda z: math.erfc(-z / math.sqrt(2)) / 2
for row in clt['cdfs']:
    n = row['n']; counts, total = laws[n]
    sigma = math.sqrt(float(n * variance)); accumulated = 0
    points = []; distances = []
    for k, count in enumerate(counts):
        if count == 0:
            continue
        z = float(Q(k - n) - n * mean) / sigma
        before = accumulated / total
        accumulated += count
        after = accumulated / total
        points.extend([[z, before], [z, after]])
        distances.extend([abs(before - phi(z)), abs(after - phi(z))])
    same(len(points), len(row['points']))
    for expected, actual in zip(points, row['points']):
        close(expected[0], actual[0]); close(expected[1], actual[1])
    close(max(distances), row['kolmogorov'])
    close(3 * float(third) / float(variance) ** 1.5 / math.sqrt(n), row['berryEsseenConstant3'])
    clipped = [[-4, max((p for z, p in points if z <= -4), default=0)],
               *[p for p in points if -4 < p[0] <= 4],
               [4, max((p for z, p in points if z <= 4), default=0)]]
    same(len(clipped), len(row['plotPoints']))
    for expected, actual in zip(clipped, row['plotPoints']):
        close(expected[0], actual[0]); close(expected[1], actual[1])
for z, probability in clt['normalCdf']:
    close(phi(z), probability)
for row in clt['knownSigmaCoverage']:
    n = row['n']; counts, total = laws[n]
    # Test the squared rational event directly, independent of ceil/floor.
    accepted = [k - n for k, c in enumerate(counts)
                if (Q(k - n) - n * mean) ** 2 <= Q(49, 25) ** 2 * n * variance]
    coverage = Q(sum(counts[s + n] for s in accepted), total)
    same(row['lowerSum'], min(accepted)); same(row['upperSum'], max(accepted))
    same(row['exactCoverage'], str(coverage)); close(row['coverage'], coverage)
    close(row['standardError'], math.sqrt(float(variance / n)))
    close(row['halfWidth'], 1.96 * math.sqrt(float(variance / n)))
row = clt['interval']; n = 16; counts, total = laws[n]
same(row['exact'], str(Q(sum(counts[s + n] for s in range(8, 23)), total)))
sigma = math.sqrt(float(n * variance)); mu = float(n * mean)
close(row['uncorrected'], phi((22 - mu) / sigma) - phi((8 - mu) / sigma))
close(row['continuityCorrected'], phi((22.5 - mu) / sigma) - phi((7.5 - mu) / sigma))
close(clt['normalNominalCoverage'], phi(1.96) - phi(-1.96))
for row in clt['modes']:
    sign = -1 if row['n'] % 2 else 1
    same(row['atZminus3'], -3 * sign); same(row['atZplus3'], 3 * sign)
    same(row['probabilityDistanceFromZAbove1'], int(sign == -1))

# The analytical remainder bound follows from the integral first-order
# remainder; sampled values additionally guard the displayed algebra.
for k in range(-200, 201):
    t = k / 10
    remainder = cmath.exp(1j * t) - 1 - 1j * t + t * t / 2
    assert abs(remainder) <= t * t + 1e-12
    checks += 1

manifest = root / 'limit-theorems-release-files.json'
data = json.loads(manifest.read_text())
for path, expected in data['sha256'].items():
    same(hashlib.sha256((root / path).read_bytes()).hexdigest(), expected)
print(json.dumps({'reviewer': 'Codex root', 'assertions': checks,
    'maximumFloatDifference': max_error,
    'manifestSha256': hashlib.sha256(manifest.read_bytes()).hexdigest(),
    'method': 'Independent full category-count enumeration through n=384; exact rational deviation and squared coverage events; direct cross-moment integration; every saved CDF point and boundary; normal erfc; all figure input rows.',
    'scope': 'Numerical evidence for complete scoped peer review; not browser or rights clearance.'}, indent=2))
