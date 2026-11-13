"""Original finite probability-measure examples, no external inputs.

Fedor Pakhurov project with Codex assistance, 2026-11-14.
This verifies finite algebra and partial sums, not an infinite-set construction.
"""
from fractions import Fraction
from itertools import combinations
import json


def axioms_case():
    weights = {'000': 13, '100': 5, '010': 7, '001': 3,
               '110': 4, '101': 2, '011': 1, '111': 1}
    denominator = sum(weights.values())
    assert denominator == 36
    probability = lambda keep: Fraction(sum(w for state, w in weights.items() if keep(state)), denominator)
    singles = [probability(lambda s, i=i: s[i] == '1') for i in range(3)]
    pairs = [probability(lambda s, ij=ij: all(s[i] == '1' for i in ij)) for ij in combinations(range(3), 2)]
    triple = probability(lambda s: s == '111')
    union = probability(lambda s: '1' in s)
    assert singles == [Fraction(1, 3), Fraction(13, 36), Fraction(7, 36)]
    assert pairs == [Fraction(5, 36), Fraction(1, 12), Fraction(1, 18)]
    assert sum(singles)-sum(pairs)+triple == union == Fraction(23, 36)
    assert sum(singles)-sum(pairs) <= union <= sum(singles)
    pointwise = []
    for m in range(4):
        pair_count = m*(m-1)//2
        triple_count = m*(m-1)*(m-2)//6
        coefficients = [m, m-pair_count, m-pair_count+triple_count]
        assert coefficients[-1] == int(m > 0)
        pointwise.append({'flags_present': m, 'coefficients': coefficients})
    limits = [Fraction(1, 100), Fraction(1, 80), Fraction(1, 200)]
    assert sum(limits) == Fraction(11, 400)
    partials = []
    for m in (1, 2, 5, 10, 25):
        partial = sum(Fraction(1, n*(n+1)) for n in range(1, m+1))
        assert partial == 1-Fraction(1, m+1)
        partials.append({'m': m, 'partial_sum': str(partial), 'remaining_mass': str(1-partial)})
    modes = {'A': ('u', 'v'), 'B': ('v',), 'C': ('u', 'v', 'w')}
    pairs_all = [(a, b) for a, outputs in modes.items() for b in outputs]
    one_stage = {a+b: Fraction(1, len(pairs_all)) for a, b in pairs_all}
    two_stage = {a+b: Fraction(1, len(modes)*len(modes[a])) for a, b in pairs_all}
    assert sum(one_stage.values()) == sum(two_stage.values()) == 1
    assert one_stage['Cw'] == Fraction(1, 6) and two_stage['Cw'] == Fraction(1, 9)
    return {'weights': weights, 'denominator': denominator,
            'singles': list(map(str, singles)), 'pairs_AB_AC_BC': list(map(str, pairs)),
            'triple': str(triple), 'union': str(union),
            'partial_inclusion_exclusion': [str(sum(singles)), str(sum(singles)-sum(pairs)), str(union)],
            'pointwise_coefficients': pointwise, 'failure_caps': list(map(str, limits)),
            'union_bound_for_caps': str(sum(limits)), 'countable_model_partials': partials,
            'uniform_pairs': {k: str(v) for k, v in one_stage.items()},
            'uniform_mode_then_format': {k: str(v) for k, v in two_stage.items()}}


if __name__ == '__main__':
    print(json.dumps(axioms_case(), indent=2))
