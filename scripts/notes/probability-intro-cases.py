"""Original finite probability cases, authored for this project with Codex assistance.
No downloaded data, models or third-party worked examples.
The uint32 PRNG replay transcribes the reviewed public-domain Mulberry32
implementation by bryc (algorithm by Tommy Ettinger), not an original RNG.
Pinned source: github.com/bryc/code at 88c1317ea6f9b25c153afa9c369c365fed11b482,
jshash/PRNGs.md, Mulberry32. See public/licenses/mulberry32.txt.
"""
import hashlib
import itertools
import json
import math
from fractions import Fraction as F
from pathlib import Path
import sys

# BEGIN NOTE CODE
from fractions import Fraction
from math import prod, sqrt

mixes = [(140, 40, 20), (80, 40, 80)]
rates = [Fraction(1, 20), Fraction(1, 4), Fraction(4, 5)]
for counts in mixes:
    long_jobs = [n * rate for n, rate in zip(counts, rates)]
    posterior = long_jobs[2] / sum(long_jobs)
    print('long jobs:', [int(x) for x in long_jobs],
          'archive share:', str(posterior))

def collision(n, labels=64):
    if n > labels:
        return Fraction(1)
    return 1 - prod(Fraction(labels - i, labels) for i in range(n))

print('collision n=9,10:', *(f'{float(collision(n)):.6f}' for n in (9, 10)))
print('first n at least half:', next(n for n in range(1, 66) if collision(n) >= Fraction(1, 2)))
a = [(3, 4), (4, 8), (2, 8)]
b = [(8, 12), (1, 3), (0, 1)]
for label, groups in [('A', a), ('B', b)]:
    pooled = Fraction(sum(x for x, _ in groups), sum(n for _, n in groups))
    standardized = sum(Fraction(x, n) for x, n in groups) / 3
    print(label, 'pooled:', str(pooled), 'equal mix:', str(standardized))
for n in (4, 16, 64):
    print('n:', n, 'independent SD:', f'{2 / sqrt(n):.6f}',
          'shared-offset SD:', f'{sqrt(1 + 4 / n):.6f}')
# END NOTE CODE


def moments(values):
    mean = sum(values, F()) / len(values)
    variance = sum((x - mean) ** 2 for x in values) / len(values)
    return mean, variance


def draws(seed, n=4096):
    """Independent uint32 transcription to verify the retained Mulberry32 helper."""
    mask = 2 ** 32 - 1
    total = 0
    counts = []
    for _ in range(n):
        seed = (seed + 0x6D2B79F5) & mask
        x = ((seed ^ (seed >> 15)) * (seed | 1)) & mask
        x = ((x + (((x ^ (x >> 7)) * (x | 61)) & mask)) & mask) ^ x
        u = (x ^ (x >> 14)) & mask
        total += u < 3 * 2 ** 29
        counts.append(total)
    return counts


def evaluate():
    conditionals = []
    for counts in mixes:
        assert sum(counts) == 200
        selected = [F(n) * p for n, p in zip(counts, rates)]
        assert all(v.denominator == 1 for v in selected)
        # Explicit row construction independently checks the weighted fractions.
        rows = [category for category, n in enumerate(counts) for _ in range(n)]
        long_rows = [category for category, n in enumerate(selected) for _ in range(int(n))]
        assert len(rows) == 200
        assert F(long_rows.count(2), len(long_rows)) == selected[2] / sum(selected)
        conditionals.append({'jobs': list(counts), 'long': [int(x) for x in selected],
                             'total_long': int(sum(selected)), 'archive_given_long': str(selected[2] / sum(selected))})
    assert [r['archive_given_long'] for r in conditionals] == ['16/33', '32/39']
    # Small independent enumeration checks the product formula, including pigeonhole.
    for labels in range(1, 5):
        for n in range(0, 6):
            outcomes = list(itertools.product(range(labels), repeat=n))
            exact = F(sum(len(set(x)) < n for x in outcomes), len(outcomes))
            assert collision(n, labels) == exact
    assert collision(0) == collision(1) == 0
    assert collision(65) == 1
    assert collision(9) < F(1, 2) < collision(10)
    assert all(F(x, n) > F(y, m) for (x, n), (y, m) in zip(a, b))
    assert [F(sum(x for x, _ in group), sum(n for _, n in group)) for group in (a, b)] == [F(9, 20), F(9, 16)]
    assert [sum(F(x, n) for x, n in group) / 3 for group in (a, b)] == [F(1, 2), F(1, 3)]
    # Check both covariance formula and finite support enumeration for each n.
    averages = []
    for n in range(1, 9):
        independent = [sum(x, F()) / n for x in itertools.product((-2, 2), repeat=n)]
        common = [v + c for v in independent for c in (-1, 1)]
        assert moments(independent) == (0, F(4, n))
        assert moments(common) == (0, 1 + F(4, n))
        averages.append({'n': n, 'independent_variance': str(F(4, n)), 'shared_variance': str(1 + F(4, n))})
    paths = []
    for seed in (101, 103, 107):
        counts = draws(seed)
        checkpoints = {str(n): counts[n - 1] for n in (64, 256, 1024, 4096)}
        data = json.dumps(counts, separators=(',', ':')).encode()
        paths.append({'seed': seed, 'counts': checkpoints, 'full_count_array_sha256': hashlib.sha256(data).hexdigest()})
    return {'origin': 'New fictional cases specified for Fedor Pakhurov project with Codex assistance; scientific definitions separately cited.',
            'conditioning': conditionals,
            'collisions': {str(n): {'exact': str(collision(n)), 'decimal': float(collision(n))} for n in (8, 9, 10, 11)},
            'simpson': {'a_rates': [str(F(x, n)) for x, n in a], 'b_rates': [str(F(x, n)) for x, n in b],
                        'pooled': ['9/20', '9/16'], 'equal_mix': ['1/2', '1/3']},
            'average_enumeration': averages,
            'bernoulli': {'p': '3/8', 'n': 4096, 'variance_single': '15/64', 'paths': paths},
            'checks': ['Exact selected finite populations and Bayes fractions', 'Exhaustive small collision state spaces',
                       'Strict within-group reversal and common-weight rates', 'All sign-vector averaging outcomes n=1..8',
                       'Uint32 PRNG replay independent of JavaScript figure helper']}


if __name__ == '__main__':
    root = Path(__file__).resolve().parents[2]
    target = root / 'docs/reports/2026-11-13-licensed-example-renewal/probability-intro-numerical-checks.json'
    result = evaluate()
    if '--write' in sys.argv:
        target.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    else:
        assert result == json.loads(target.read_text()), 'Saved results differ'
    print('Probability introduction: exact finite cases and pseudorandom paths verified.')
