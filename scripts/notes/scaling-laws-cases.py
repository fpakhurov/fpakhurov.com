"""Original small calculation for the Fedor Pakhurov project, with Codex assistance.
No third-party corpus, weights, code or model output. Python 3.9.7 saved replay.
"""
import json
import math


def synthetic_loss(n, d):
    return 1 + 8 / math.sqrt(n) + 18 / math.sqrt(d)


def scaling_case():
    # N and D are dimensionless planning units, not a fitted real model or corpus.
    budget = 1296
    rows = []
    for n in [4, 9, 16, 36, 81]:
        d = budget / n
        rows.append({'N': n, 'D': d, 'loss': synthetic_loss(n, d)})
    n_opt = (8 / 18) * math.sqrt(budget)
    d_opt = budget / n_opt
    assert n_opt == 16 and d_opt == 81
    four_budget = 4 * budget
    assert (8 / 18) * math.sqrt(four_budget) == 32
    # Total proxy cost includes serving allowance G in training-equivalent units.
    lifetime = []
    for n in range(1, 50):
        d = budget / n - 16
        if d > 0:
            lifetime.append({'N': n, 'D': d, 'loss': synthetic_loss(n, d)})
    best = min(lifetime, key=lambda row: row['loss'])
    return {'training_product_budget': budget, 'candidate_rows': rows,
            'continuous_optimum': {'N': n_opt, 'D': d_opt, 'loss': synthetic_loss(n_opt, d_opt)},
            'four_times_budget_optimum': {'N': 32, 'D': 162},
            'lifetime_proxy_G': 16, 'lifetime_integer_optimum': best,
            'lifetime_neighbor_rows': [row for row in lifetime if abs(row['N'] - best['N']) <= 1],
            'threshold_success': {str(n): synthetic_loss(n, budget / n) < 5.1 for n in [4, 9, 16, 36]}}


if __name__ == "__main__":
    print(json.dumps(scaling_case(), ensure_ascii=False, indent=2, sort_keys=True))
