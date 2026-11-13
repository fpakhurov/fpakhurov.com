#!/usr/bin/env python3
"""Original finite classifier fixtures, composed for the course with Codex assistance.

Only Python's standard library is used. No datasets, models, stochastic benchmark
outputs or source-paper code are inputs. --write saves the exact reproducible results.
"""
import argparse
from fractions import Fraction
from itertools import product
import json
from math import comb, exp, log, log1p, sqrt
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / 'docs/reports/2026-11-13-licensed-example-renewal/linear-classifiers-results.json'
GEOMETRY = [((-1, 1), -1), ((0, 2), -1), ((1, 0), 1), ((2, 1), 1),
            ((3, 1), 1), ((2, 4), 1), ((1, -2), -1)]


def logistic(margin):
    return (max(0, -margin) + log1p(exp(-abs(margin)))) / log(2)


def losses(margin):
    return {'logistic': logistic(margin), 'hinge': max(0, 1-margin),
            'exponential': exp(-margin), 'squared_hinge': max(0, 1-margin)**2,
            'square': (1-margin)**2}


def conditional_risk(probability, score, loss):
    return probability*loss(score)+(1-probability)*loss(-score)


def least_squares(xs, ys):
    n = len(xs)
    slope = Fraction(n*sum(x*y for x, y in zip(xs, ys))-sum(xs)*sum(ys),
                     n*sum(x*x for x in xs)-sum(xs)**2)
    intercept = Fraction(sum(ys), n)-slope*Fraction(sum(xs), n)
    return {'slope': str(slope), 'intercept': str(intercept),
            'boundary': str(-intercept/slope),
            'errors': sum(y*(slope*x+intercept) <= 0 for x, y in zip(xs, ys))}


def perceptron():
    xs = [(2, -1, 1), (-1, 2, 1), (3, 1, 1), (0, -3, 1)]
    ys = [1, -1, 1, -1]
    weights = [0, 0, 0]
    updates = []
    for epoch in range(1, 101):
        changed = False
        for index, (x, y) in enumerate(zip(xs, ys), 1):
            margin = y*sum(a*b for a, b in zip(x, weights))
            if margin <= 0:
                weights = [a+y*b for a, b in zip(weights, x)]
                updates.append({'epoch': epoch, 'point': index, 'margin': margin,
                                'weights_after': weights[:]})
                changed = True
        if not changed:
            break
    else:
        raise AssertionError('The explicitly separable fixture failed to terminate')
    final_margins = [y*sum(a*b for a, b in zip(x, weights)) for x, y in zip(xs, ys)]
    # A unit separating vector is (2, 0, -1)/sqrt(5) in the augmented space.
    radius_squared = max(sum(a*a for a in x) for x in xs)
    raw_min_margin = min(y*(2*x[0]-x[2]) for x, y in zip(xs, ys))
    bound = Fraction(5*radius_squared, raw_min_margin**2)
    assert final_margins == [5, 4, 8, 1] and len(updates) <= bound
    return {'inputs': xs, 'labels': ys, 'updates': updates, 'weights': weights,
            'final_margins': final_margins, 'radius_squared': radius_squared,
            'gamma_squared': str(Fraction(raw_min_margin**2, 5)), 'bound': str(bound)}


def calculate():
    rows = []
    for name, (x, y) in zip('ABCDEFG', GEOMETRY):
        score = 2*x[0]-x[1]-1
        rows.append({'id': name, 'x': x, 'label': y, 'score': score,
                     'margin': y*score, 'losses': losses(y*score)})
    upper_bounds = {key: sum(row['losses'][key] for row in rows)/len(rows)
                    for key in losses(0)}
    error = sum(row['margin'] <= 0 for row in rows)/len(rows)
    assert all(value >= error for value in upper_bounds.values())
    # This checks the defined formulas on a grid; the text supplies the inequalities.
    for i in range(-120, 121):
        margin = i/20
        assert all(value+1e-12 >= int(margin <= 0) for value in losses(margin).values())
    # Three equally likely feature values. Counts specify a fictional distribution.
    counts = [1, 7, 1]
    probability = [count/8 for count in counts]
    scores = [log(p/(1-p)) for p in probability]
    pooled = sum(counts)/24
    pooled_score = log(pooled/(1-pooled))
    independent_loss = sum(conditional_risk(p, f, logistic) for p, f in zip(probability, scores))/3
    linear_loss = sum(conditional_risk(p, pooled_score, logistic) for p in probability)/3
    gradients = [1/(1+exp(-pooled_score))-p for p in probability]
    assert abs(sum(gradients)) < 1e-12
    assert abs(sum(x*g for x, g in zip([-1, 0, 1], gradients))) < 1e-12
    # Strict convexity for this full-rank fixture makes this stationary linear fit unique.
    conditional = []
    for p in [1/8, 7/8, 3/8]:
        optima = {'logistic': log(p/(1-p)), 'hinge': 1 if p > .5 else -1,
                  'exponential': .5*log(p/(1-p)), 'squared_hinge': 2*p-1, 'square': 2*p-1}
        for name, best in optima.items():
            best_risk = conditional_risk(p, best, lambda m: losses(m)[name])
            for delta in [-2, -.1, .1, 2]:
                assert best_risk <= conditional_risk(p, best+delta, lambda m: losses(m)[name])+1e-12
        conditional.append({'probability': p, 'optima': optima})
    separability = []
    # Points (t,t^2), t=0..n-1: a linear score is a quadratic in t.
    # Its strict signs switch at most twice. Conversely place roots between switches.
    for n in [3, 6, 7, 9]:
        count = sum(sum(a != b for a, b in zip(labels, labels[1:])) <= 2
                    for labels in product([-1, 1], repeat=n))
        expected = 2*sum(comb(n-1, k) for k in range(min(2, n-1)+1))
        assert count == expected
        separability.append({'n': n, 'dimension': 2, 'separable_labelings': count,
                             'total_labelings': 2**n, 'probability': count/2**n})
    result = {
        'origin': 'Independently specified finite teaching fixtures; composed with Codex assistance; no empirical benchmark claim.',
        'least_squares': {'base': least_squares([-4, -2, 1, 3], [-1, -1, 1, 1]),
                          'with_far_positive': least_squares([-4, -2, 1, 3, 40], [-1, -1, 1, 1, 1])},
        'geometry': {'rows': rows, 'normal': [2, -1], 'bias': -1, 'example': [3, 1],
                     'projection': [1.4, 1.8], 'distance': 4/sqrt(5), 'error_fraction': error,
                     'average_losses': upper_bounds},
        'conditional': {'positive_counts': counts, 'group_size': 8, 'feature_values': [-1, 0, 1],
                        'flexible_scores': scores, 'linear_weights': [0, pooled_score],
                        'flexible_loss': independent_loss, 'linear_loss': linear_loss,
                        'flexible_error': 3/24, 'linear_error': 9/24, 'pointwise_optima': conditional},
        'perceptron': perceptron(), 'separability': separability,
    }
    assert result['least_squares']['base']['errors'] == 0
    assert result['least_squares']['with_far_positive']['errors'] == 1
    return result


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--write', action='store_true')
    args = parser.parse_args()
    result = calculate()
    encoded = json.dumps(result, ensure_ascii=False, indent=2)+'\n'
    if args.write:
        OUTPUT.parent.mkdir(parents=True, exist_ok=True)
        OUTPUT.write_text(encoded)
        print('Saved classifier renewal results.')
    else:
        assert json.loads(encoded) == json.loads(OUTPUT.read_text()), 'Saved classifier results are stale'
        print('Classifier renewal results reproduced exactly.')
    print(json.dumps({'least_squares': result['least_squares'], 'loss_bounds': result['geometry']['average_losses'],
                      'conditional': {k: v for k, v in result['conditional'].items() if k != 'pointwise_optima'},
                      'perceptron': result['perceptron'], 'separability': result['separability']}, indent=2))
