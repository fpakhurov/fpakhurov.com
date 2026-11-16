"""Original small calculation for the Fedor Pakhurov project, with Codex assistance.
No third-party corpus, weights, code or model output. Python 3.9.7 saved replay.
"""
import json
import itertools
import math
from collections import Counter
from fractions import Fraction


def evolution_case():
    original = ['store', 'the', 'amber', 'crate', 'inside']
    selected = [2, 3]
    corrupted = original.copy()
    corrupted[2], corrupted[3] = 'amber', 'box'
    labels = [int(a == b) for a, b in zip(original, corrupted)]
    real_probabilities = [.9, .8, .6, .3, .7]
    disc_loss = -sum(math.log(p if y else 1 - p) for p, y in zip(real_probabilities, labels)) / 5
    generator_loss = -(math.log(.4) + math.log(.25)) / 2
    masks = list(itertools.combinations(range(6), 2))
    coverage = Counter(len(set(a) | set(b) | set(c)) for a, b, c in itertools.product(masks, repeat=3))
    expected = Fraction(sum(size * count for size, count in coverage.items()), len(masks) ** 3)
    assert expected == Fraction(38, 9)
    lengths = [2, 5, 3]
    return {'original': original, 'selected_zero_based': selected, 'corrupted': corrupted,
            'real_labels': labels, 'real_probabilities': real_probabilities,
            'mean_discriminator_loss': disc_loss, 'mean_generator_loss': generator_loss,
            'expected_changed_tokens': str((1 - Fraction(2, 5)) + (1 - Fraction(1, 4))), 'dynamic_coverage_counts': dict(sorted(coverage.items())),
            'dynamic_expected_coverage': str(expected), 'static_coverage': 2,
            'batch_lengths': lengths, 'padded_tokens': len(lengths) * max(lengths),
            'unpadded_tokens': sum(lengths), 'padded_dense_pairs': len(lengths) * max(lengths) ** 2,
            'separate_dense_pairs': sum(length ** 2 for length in lengths)}


if __name__ == "__main__":
    print(json.dumps(evolution_case(), ensure_ascii=False, indent=2, sort_keys=True))
