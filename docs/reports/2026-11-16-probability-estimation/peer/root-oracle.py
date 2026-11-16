import hashlib
import json
import math
from decimal import Decimal, localcontext
from fractions import Fraction as F
from itertools import product
from pathlib import Path

root = Path('/Users/fedorpakhurov/code/_work/fp-probability-estimation-drafts')
result_path = root / 'docs/reports/2026-11-16-probability-estimation/results.json'
data = json.loads(result_path.read_text())
checks = 0
maximum = 0.0

def near(actual, expected):
    global checks, maximum
    difference = abs(float(actual) - float(expected))
    assert difference < 2e-12, (actual, expected, difference)
    maximum = max(maximum, difference)
    checks += 1

def pmf(n, p):
    # Coefficients of the probability-generating polynomial, without binomial coefficients.
    distribution = [F(1)]
    for _ in range(n):
        next_row = [F(0)] * (len(distribution) + 1)
        for k, mass in enumerate(distribution):
            next_row[k] += (1 - p) * mass
            next_row[k + 1] += p * mass
        distribution = next_row
    assert sum(distribution) == 1
    return distribution

def moments(weights, values, p):
    mean = sum(w * x for w, x in zip(weights, values))
    second = sum(w * x * x for w, x in zip(weights, values))
    return {'mean': mean, 'bias': mean - p, 'variance': second - mean * mean,
            'mse': second - 2 * p * mean + p * p}

for row in data['sampling']:
    n, p = row['n'], F(row['p'])
    weights = pmf(n, p)
    for name, values in [('mean', [F(k, n) for k in range(n + 1)]),
                         ('shrink', [F(k + 2, n + 5) for k in range(n + 1)])]:
        expected = moments(weights, values, p)
        for key, value in expected.items():
            assert F(row[name]['exact'][key]) == value
            near(row[name][key], value)
        near(expected['mse'], expected['variance'] + expected['bias'] ** 2)
for row, probability in zip(data['pmf'], pmf(7, F(2, 7))):
    near(row['mass'], probability)
    near(row['mean'], F(row['k'], 7))
    near(row['shrink'], F(row['k'] + 2, 12))
for curve in data['risks']:
    n = curve['n']
    for point in curve['points']:
        p = F(str(point['p']))
        weights = pmf(n, p)
        for name, values in [('mean', [F(k, n) for k in range(n + 1)]),
                             ('shrink', [F(k + 2, n + 5) for k in range(n + 1)])]:
            near(point[name], moments(weights, values, p)['mse'])

observations = list(map(F, [-2, 1, 1, 4]))
center = sum(observations) / 4
# Pairwise-distance variance identity is independent of the centered residual implementation.
pairwise = sum((x - y) ** 2 for x in observations for y in observations)
centered = pairwise / 8
for key, value in {'mean': center, 'sumSquares': centered, 'divideN': centered / 4,
                   'divideNMinus1': centered / 3}.items():
    near(data['variance'][key], value)
expectations = [F(0), F(0)]
p = F(2, 7)
for observations in product([0, 1], repeat=4):
    k = sum(observations)
    weight = p ** k * (1 - p) ** (4 - k)
    pairwise = sum((x - y) ** 2 for x in observations for y in observations)
    for i, denominator in enumerate([32, 24]):
        expectations[i] += weight * F(pairwise, denominator)
assert F(data['variance']['expectationDivideN']) == expectations[0] == F(3, 4) * p * (1 - p)
assert F(data['variance']['expectationDivideNMinus1']) == expectations[1] == p * (1 - p)
near(data['se']['true'], math.sqrt(float(p * (1 - p) / 7)))
near(data['se']['plugin'], math.sqrt(12 / 343))

likelihood = data['likelihood']
assert len(likelihood['binary']) == 13 and sum(likelihood['binary']) == 8
peak = F(8, 13) ** 8 * F(5, 13) ** 5
near(likelihood['mle'], F(8, 13))
with localcontext() as context:
    context.prec = 70
    decimal = lambda x: Decimal(x.numerator) / Decimal(x.denominator)
    near(likelihood['peakLog'], decimal(peak).ln())
    for row in likelihood['curve'] + likelihood['comparisons']:
        p = F(str(row['p']))
        if abs(float(p) - 8 / 13) < 1e-15:
            p = F(8, 13)
        probability = p ** 8 * (1 - p) ** 5
        ratio = probability / peak
        near(row['relative'], ratio)
        if 'relativeLog' in row:
            near(row['relativeLog'], decimal(ratio).ln())
        if 'logLikelihood' in row:
            near(row['logLikelihood'], decimal(probability).ln())
    for n, k in [(13, 0), (13, 13), (13, 8)]:
        values = [(F(j, 100), F(j, 100) ** k * (1 - F(j, 100)) ** (n - k)) for j in range(101)]
        maximum_point = max(values, key=lambda item: item[1])[0]
        near(maximum_point, [F(0), F(1), F(62, 100)][[0, 13, 8].index(k)])

observations = list(map(F, [-3, -1, 0, 2, 5]))
mean = sum(observations) / len(observations)
median = sorted(observations)[2]
sse = sum(x * x for x in observations) - len(observations) * mean * mean
sae = sum(abs(x - median) for x in observations)
for key, value in {'mean': mean, 'median': median, 'sseAtMean': sse, 'saeAtMedian': sae,
                   'varianceMLE': sse / 5, 'varianceUnbiased': sse / 4}.items():
    near(data['loss'][key], value)
near(data['loss']['gaussianNLL'], -sum(math.log(math.exp(-float((x-mean)**2)/8) / math.sqrt(8*math.pi)) for x in observations))
near(data['loss']['laplaceNLL'], -sum(math.log(math.exp(-float(abs(x-median))/2) / 4) for x in observations))
for point in data['lossCurve']:
    location = F(str(point['shift']))
    near(point['gaussian'], 5 * (location - mean) ** 2 / 8)
    near(point['laplace'], (sum(abs(x - location) for x in observations) - sae) / 2)
for row in data['fisher']:
    p = F(row['p'])
    score = lambda x: (x - p) / (p * (1 - p))
    mean_score = (1 - p) * score(0) + p * score(1)
    information = (1 - p) * score(0) ** 2 + p * score(1) ** 2
    near(mean_score, 0)
    near(row['information1'], information)
    near(row['information13'], 13 * information)
    near(row['cr13'], p * (1 - p) / 13)
    weights = pmf(13, p)
    covariance = sum(w * (F(k, 13) - p) * (k - 13 * p) / (p * (1 - p)) for k, w in enumerate(weights))
    near(covariance, 1)

endpoint = data['support']
near(endpoint['mle'], min(endpoint['data']))
for row in endpoint['relativeLikelihood']:
    probability = math.prod(math.exp(-(x - row['theta'])) if x >= row['theta'] else 0 for x in endpoint['data'])
    peak = math.prod(math.exp(-(x - endpoint['mle'])) for x in endpoint['data'])
    near(row['value'], probability / peak)
near(endpoint['bias'], F(1, 3)); near(endpoint['variance'], F(1, 9)); near(endpoint['mse'], F(2, 9))

print(json.dumps({'reviewer': 'Codex root', 'assertions': checks, 'maximumFloatDifference': maximum,
    'resultsSha256': hashlib.sha256(result_path.read_bytes()).hexdigest(),
    'method': 'Exact generating-polynomial sampling distributions and all risk-grid points; pairwise variance identity; rational likelihood with 70-digit logs; independent noise-density/score/covariance calculations; product endpoint likelihood.',
    'scope': 'Independent numeric review; complete prose/source/render review and publication gates separate.'}, indent=2))
