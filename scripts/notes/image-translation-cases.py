"""Original finite image-translation cases for the Fedor Pakhurov project.

Authored with Codex assistance. Standard library only, no random generator,
external data, pretrained weights or downloaded implementation. Normal execution
checks saved JSON bytes; --write intentionally refreshes the generated fixture.
"""
import json
import math
import sys
from fractions import Fraction as F
from itertools import product
from pathlib import Path


def mean(values):
    return sum(values) / len(values)


def mse(a, b):
    return mean([(x - y) ** 2 for x, y in zip(a, b)])


def content_style():
    contents, styles = (-1, 2), (-2, 1)

    def decode(c, s):
        return (3 * c + s, c - 2 * s)

    def encode(a, b):
        return (F(2 * a + b, 7), F(a - 3 * b, 7))

    rows = []
    target_counts = {}
    for c, old_s, new_s in product(contents, styles, styles):
        y = decode(c, new_s)
        recovered_c, recovered_s = encode(*y)
        assert (recovered_c, recovered_s) == (c, new_s)
        reconstructed = (recovered_c, old_s)
        assert reconstructed == (c, old_s)
        assert decode(*encode(*decode(c, old_s))) == decode(c, old_s)
        target_counts[y] = target_counts.get(y, 0) + 1
        rows.append({'source': [c, old_s], 'target_style': new_s, 'target': y})
    assert sorted(target_counts.values()) == [2, 2, 2, 2]
    valid = [decode(-1, s) for s in styles]
    invalid = [(-20, -20), (20, 20)]
    l1 = lambda a, b: sum(abs(x - y) for x, y in zip(a, b))
    assert l1(*valid) == 9 and l1(*invalid) == 80
    assert all(encode(*y)[0] == -1 for y in valid)
    assert all(y not in valid for y in invalid)
    return {'rows': rows, 'valid_outputs': valid, 'valid_distance': 9,
            'invalid_outputs': invalid, 'invalid_distance': 80,
            'valid_fraction': '1', 'invalid_valid_fraction': '0',
            'target_points': sorted(target_counts)}


def contrastive():
    def loss(scores, positive, tau):
        logits = [s / tau for s in scores]
        maximum = max(logits)
        denominator = sum(math.exp(z - maximum) for z in logits)
        probabilities = [math.exp(z - maximum) / denominator for z in logits]
        return maximum + math.log(denominator) - logits[positive], probabilities

    rows = []
    for tau in (1.0, 0.5):
        for name, scores in [('copy', [1., 0., 0.]),
                             ('rotated', [0., 1., 0.]),
                             ('constant', [1., 1., 1.])]:
            value, probabilities = loss(scores, 0, tau)
            gradient = [(p - (j == 0)) / tau for j, p in enumerate(probabilities)]
            for j in range(3):
                left, right = scores.copy(), scores.copy()
                left[j] -= 1e-5
                right[j] += 1e-5
                finite_difference = (loss(right, 0, tau)[0] - loss(left, 0, tau)[0]) / 2e-5
                assert abs(finite_difference - gradient[j]) < 1e-9
            rows.append({'tau': tau, 'case': name, 'loss': value,
                         'positive_probability': probabilities[0], 'gradient': gradient})
        assert abs(rows[-2]['loss'] - rows[-3]['loss'] - 1 / tau) < 1e-14
        assert abs(rows[-1]['loss'] - math.log(3)) < 1e-14
    return rows


def modulation():
    h = [1, 3, 1, 3, 1, 3]
    gamma = [1, 1, 2, 2, F(1, 2), F(1, 2)]
    beta = [-1, -1, 0, 0, 2, 2]
    mu = mean(h)
    variance = mean([(x - mu) ** 2 for x in h])
    epsilon = F(1, 4)
    normalized = [(x - mu) / math.sqrt(variance + epsilon) for x in h]
    shifted = [x + 7 for x in h]
    shifted_normalized = [(x - mean(shifted)) / math.sqrt(variance + epsilon) for x in shifted]
    assert normalized == shifted_normalized
    assert abs(mean([z * z for z in normalized]) - 0.8) < 1e-14
    output = [float(g) * z + b for g, z, b in zip(gamma, normalized, beta)]
    return {'h': h, 'shifted_h': shifted, 'mean': mu, 'variance': variance,
            'epsilon': str(epsilon), 'normalized_variance': '4/5',
            'labels': ['A', 'A', 'B', 'B', 'C', 'C'],
            'gamma': [float(g) for g in gamma], 'beta': beta,
            'normalized': normalized, 'output': output}


def super_resolution():
    candidates = [(0, 4, 1, 3), (2, 2, 3, 1), (3, 1, 0, 4)]
    probabilities = [F(1, 5), F(1, 2), F(3, 10)]
    low = lambda row: [F(row[0] + row[1], 2), F(row[2] + row[3], 2)]
    assert all(low(row) == [2, 2] for row in candidates)
    average = [sum(p * row[j] for p, row in zip(probabilities, candidates)) for j in range(4)]
    assert average == [F(19, 10), F(21, 10), F(17, 10), F(23, 10)]
    pair_errors = [[mse([F(x) for x in a], b) for b in candidates] for a in candidates]
    bayes = sum(p * mse(a, average) for p, a in zip(probabilities, candidates))
    sampler = sum(probabilities[i] * probabilities[j] * pair_errors[i][j]
                  for i, j in product(range(3), repeat=2))
    deterministic = sum(p * mse(a, [F(x) for x in candidates[1]]) for p, a in zip(probabilities, candidates))
    assert sampler == 2 * bayes
    assert deterministic == bayes + mse(candidates[1], average)
    assert mse(candidates[1], average) == F(17, 20)  # Mean distance, not conditional variance.
    match_probability = sum(p * p for p in probabilities)
    assert match_probability == F(19, 50)
    # Conditional risk identity at 125 explicit outputs, without any fitting.
    for offset in product((-1, 0, 1, 2, 3), repeat=3):
        candidate = [F(offset[0]), F(offset[1]), F(offset[2]), F(2)]
        error = sum(p * mse(a, candidate) for p, a in zip(probabilities, candidates))
        assert error == bayes + mse(candidate, average)
    peak = 4
    scores = [10 * math.log10(peak ** 2 / float(m)) for m in (bayes, sampler, deterministic)]
    assert abs(scores[0] - scores[1] - 10 * math.log10(2)) < 1e-14
    return {'candidates': candidates, 'probabilities': [str(p) for p in probabilities],
            'low': [2, 2], 'mean': [str(x) for x in average],
            'mean_float': [float(x) for x in average],
            'pair_mse': [[str(x) for x in row] for row in pair_errors],
            'mean_mse': str(bayes), 'sample_mse': str(sampler),
            'deterministic_b_mse': str(deterministic),
            'exact_match_probability': str(match_probability),
            'aggregate_psnr': scores, 'peak': peak}


def cases():
    return {'authorship': 'Original project finite cases with Codex assistance; no external assets.',
            'multimodal': content_style(), 'contrastive': contrastive(),
            'modulation': modulation(), 'super_resolution': super_resolution()}


def main():
    data = cases()
    destination = Path(__file__).resolve().parents[2] / 'src/components/figures/image-translation/cases.json'
    encoded = json.dumps(data, indent=2, ensure_ascii=False) + '\n'
    if '--write' in sys.argv:
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_text(encoded)
    else:
        assert destination.read_text() == encoded
    print('Multimodal: 8 exact round trips; valid diversity 9, invalid diversity 80')
    for row in data['contrastive']:
        print('NCE tau={:.1f} {}: p={:.12f}, loss={:.12f}'.format(
            row['tau'], row['case'], row['positive_probability'], row['loss']))
    print('SPADE output:', ' '.join('{:.9f}'.format(x) for x in data['modulation']['output']))
    sr = data['super_resolution']
    print('SR MSE: mean={}, sample={}, fixed_b={}'.format(sr['mean_mse'], sr['sample_mse'], sr['deterministic_b_mse']))
    print('Aggregate PSNR:', ' '.join('{:.9f}'.format(x) for x in sr['aggregate_psnr']))
    print('Independent exact-match probability:', sr['exact_match_probability'])


if __name__ == '__main__':
    main()
