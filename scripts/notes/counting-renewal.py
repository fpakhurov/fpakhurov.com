"""Exact original finite counting cases for FP course renewal.

Fedor Pakhurov project, composed and checked with Codex assistance, 2026-11-14.
No external dataset or source exercise. Standard itertools/Fraction APIs only.
The new case is a mathematical construction, not a measured workload.
"""
from collections import Counter
from fractions import Fraction
from itertools import product, permutations, combinations, combinations_with_replacement
from math import comb, factorial
import json


def counting_case():
    labels = 'abcde'
    ordered = list(product(labels, repeat=3))
    distinct = list(permutations(labels, 3))
    subsets = list(combinations(labels, 3))
    allocations = list(combinations_with_replacement(labels, 3))
    counts = [len(ordered), len(distinct), len(subsets), len(allocations)]
    assert counts == [5**3, 5*4*3, comb(5, 3), comb(7, 3)]
    fibres = Counter(tuple(sorted(seq)) for seq in ordered)
    assert set(fibres) == set(allocations)
    for allocation, size in fibres.items():
        expected = factorial(3)
        for multiplicity in Counter(allocation).values():
            expected //= factorial(multiplicity)
        assert size == expected
    shape_rows = []
    for distinct_count in (1, 2, 3):
        selected = [a for a in allocations if len(set(a)) == distinct_count]
        weights = {fibres[a] for a in selected}
        assert len(weights) == 1
        shape_rows.append({'distinct_labels': distinct_count,
                           'allocations': len(selected),
                           'sequences_per_allocation': weights.pop(),
                           'sequences_total': sum(fibres[a] for a in selected)})
    assert sum(row['allocations'] for row in shape_rows) == 35
    assert sum(row['sequences_total'] for row in shape_rows) == 125
    event_a = {s for s in ordered if 'a' in s}
    event_first_a = {s for s in ordered if s[0] == 'a'}
    event_last_a = {s for s in ordered if s[-1] == 'a'}
    assert len(event_a) == 5**3-4**3 == 61
    assert len(event_first_a & event_last_a) == 5
    assert len(event_first_a | event_last_a) == 25+25-5 == 45
    distinct_fibres = Counter(tuple(sorted(s)) for s in distinct)
    assert set(distinct_fibres.values()) == {factorial(3)}
    assert len(distinct_fibres) == 10
    capacity_sequences = [s for s in ordered if s.count('a') <= 1]
    capacity_allocations = [s for s in allocations if s.count('a') <= 1]
    assert len(capacity_sequences) == 4**3+3*4**2 == 112
    assert len(capacity_allocations) == 35-4-1 == 30
    choices = {'A': ('u', 'v'), 'B': ('v',), 'C': ('u', 'v', 'w')}
    compatible = [(a, b) for a, options in choices.items() for b in options]
    assert len(compatible) == sum(map(len, choices.values())) == 6
    return {'four_counts': counts, 'allocation_shapes': shape_rows,
            'at_least_one_a': str(Fraction(len(event_a), len(ordered))),
            'first_and_last_a': str(Fraction(5, 125)),
            'first_or_last_a': str(Fraction(45, 125)),
            'capacity_max_one_a': {'uniform_sequences': str(Fraction(112, 125)),
                                   'uniform_allocations': str(Fraction(30, 35))},
            'variable_branch_counts': [len(v) for v in choices.values()],
            'compatible_pairs': compatible}


if __name__ == '__main__':
    print(json.dumps(counting_case(), indent=2))
