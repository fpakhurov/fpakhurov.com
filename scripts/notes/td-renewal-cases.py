#!/usr/bin/env python3
"""Original finite TD teaching cases, authored for the project with Codex assistance.

No external data, simulator, source notebook or random benchmark is used.
Fraction arithmetic is exact; only the UCB logarithm/square root is floating point.
"""
import argparse
from fractions import Fraction as F
from itertools import product
import json
from math import log, sqrt
from pathlib import Path


# BEGIN NOTE CODE
def solve(matrix, rhs):
    rows = [list(row) + [b] for row, b in zip(matrix, rhs)]
    n = len(rows)
    for col in range(n):
        pivot = next(i for i in range(col, n) if rows[i][col])
        rows[col], rows[pivot] = rows[pivot], rows[col]
        divisor = rows[col][col]
        rows[col] = [x / divisor for x in rows[col]]
        for i in range(n):
            if i != col:
                multiplier = rows[i][col]
                rows[i] = [x - multiplier * y for x, y in zip(rows[i], rows[col])]
    return [row[-1] for row in rows]


def step(state, action):
    if action == 0:  # charge
        return min(2, state + 1), -F(1, 5)
    return max(0, state - 1), [-F(6), F(2), F(5, 2)][state]


def evaluate(skeleton, epsilon):
    gamma = F(4, 5)
    matrix = [[F(i == j) for j in range(3)] for i in range(3)]
    reward = [F(0) for _ in range(3)]
    for s in range(3):
        for a in range(2):
            probability = epsilon / 2 + (1 - epsilon) * (a == skeleton[s])
            nxt, r = step(s, a)
            matrix[s][nxt] -= gamma * probability
            reward[s] += probability * r
    return solve(matrix, reward)


def best(epsilon):
    candidates = [(p, evaluate(p, epsilon)) for p in product(range(2), repeat=3)]
    return max(candidates, key=lambda item: sum(item[1]))


def moments(outcomes):
    mean = sum(p * x for p, x in outcomes)
    return mean, sum(p * (x - mean) ** 2 for p, x in outcomes)


def demo():
    for epsilon in (F(0), F(1, 5)):
        policy, values = best(epsilon)
        print('epsilon', epsilon, 'skeleton', policy, 'V', [str(x) for x in values])
    print('exploring optimal skeleton: V(1)', evaluate((0, 1, 1), F(1, 5))[1])
    mc = [(F(3, 8), -F(1)), (F(3, 8), F(11, 5)),
          (F(1, 8), -F(1, 5)), (F(1, 8), F(7, 5))]
    print('MC mean, variance', [str(x) for x in moments(mc)])
    print('wrong TD mean, variance', [str(x) for x in moments([(F(3, 4), F(7)), (F(1, 4), -F(29, 5))])])
    scores = [hits / n + sqrt(2 * log(41) / n) for n, hits in zip([18, 12, 6, 4], [11, 5, 2, 1])]
    print('UCB1 scores', [round(x, 6) for x in scores])
# END NOTE CODE


def check():
    assert solve([[F(0), F(1)], [F(1), F(1)]], [F(2), F(5)]) == [F(3), F(2)]
    control = []
    for epsilon in (F(0), F(1, 5)):
        winner, values = best(epsilon)
        candidates = []
        for skeleton in product(range(2), repeat=3):
            v = evaluate(skeleton, epsilon)
            q = [[r + F(4, 5) * v[nxt] for nxt, r in [step(s, a) for a in range(2)]] for s in range(3)]
            for s in range(3):
                assert v[s] == (1 - epsilon) * q[s][skeleton[s]] + epsilon * sum(q[s]) / 2
                assert values[s] >= v[s]
            candidates.append({'skeleton': skeleton, 'values': v, 'q': q})
        q = [[r + F(4, 5) * values[nxt] for nxt, r in [step(s, a) for a in range(2)]] for s in range(3)]
        assert tuple(row.index(max(row)) for row in q) == winner
        control.append({'epsilon': epsilon, 'best_skeleton': winner, 'values': values, 'q': q, 'all_policies': candidates})
    assert control[0]['values'] == [F(35, 9), F(46, 9), F(593, 90)]
    assert control[1]['values'] == [F(26751, 9890), F(976, 215), F(118217, 19780)]
    naive = evaluate((0, 1, 1), F(1, 5))
    assert naive[1] == F(784, 215)
    mc = [(F(3, 8), -F(1)), (F(3, 8), F(11, 5)), (F(1, 8), -F(1, 5)), (F(1, 8), F(7, 5))]
    exact_td = [(F(3, 4), F(3, 5)), (F(1, 4), F(3, 5))]
    wrong_td = [(F(3, 4), F(7)), (F(1, 4), -F(29, 5))]
    assert moments(mc) == (F(3, 5), F(52, 25))
    assert moments(exact_td) == (F(3, 5), F(0))
    assert moments(wrong_td) == (F(19, 5), F(768, 25))
    # One observed intake -> A -> terminal episode; fixed initial V(intake)=0, V(A)=3.
    td_target, mc_target = -F(1) + F(4, 5) * 3, -F(1) + F(4, 5) * 4
    assert (td_target, mc_target, td_target / 4, mc_target / 4) == (F(7, 5), F(11, 5), F(7, 20), F(11, 20))
    local_targets = [F(2) + F(4, 5) * v for v in (F(3), -F(2), F(9, 10) * 3 - F(1, 10) * 2)]
    local_updates = [F(1) + F(1, 4) * (y - 1) for y in local_targets]
    assert local_targets == [F(22, 5), F(2, 5), F(4)]
    assert local_updates == [F(37, 20), F(17, 20), F(7, 4)]
    # A separate, explicit three-step trace. Values are frozen throughout these identities.
    rewards, v, gamma = [-F(1), F(2), F(3)], [F(1, 2), F(3, 2), -F(1, 4), F(0)], F(4, 5)
    targets = [sum(gamma ** j * rewards[j] for j in range(n)) + gamma ** n * v[n] for n in range(1, 4)]
    delta = [rewards[i] + gamma * v[i + 1] - v[i] for i in range(3)]
    assert targets == [F(1, 5), F(11, 25), F(63, 25)]
    assert targets[-1] - v[0] == sum(gamma ** i * delta[i] for i in range(3))
    mixtures = []
    for lam in (F(0), F(1, 2), F(1)):
        weights = [1 - lam, (1 - lam) * lam, lam ** 2]
        value = sum(w * target for w, target in zip(weights, targets))
        assert sum(weights) == 1
        assert value - v[0] == sum((gamma * lam) ** i * delta[i] for i in range(3))
        mixtures.append({'lambda': lam, 'weights': weights, 'value': value})
    assert mixtures[1]['value'] == F(21, 25)
    # Repeated-state online TD need not satisfy the frozen-value identity.
    online_v = [F(1, 2), F(3, 2)]
    states, online_delta = [0, 0, 1], []
    for i, s in enumerate(states):
        nxt_value = online_v[states[i + 1]] if i + 1 < len(states) else F(0)
        error = rewards[i] + gamma * nxt_value - online_v[s]
        online_delta.append(error)
        online_v[s] += F(1, 4) * error
    assert sum(gamma ** i * online_delta[i] for i in range(3)) != targets[-1] - F(1, 2)
    scores = [hits / n + sqrt(2 * log(41) / n) for n, hits in zip([18, 12, 6, 4], [11, 5, 2, 1])]
    assert scores.index(max(scores)) == 3
    return {'provenance': 'Original specified finite fixtures, authored for Fedor Pakhurov project with Codex assistance; no external data.',
            'arithmetic': 'Exact fractions except UCB1 log/sqrt rounded to 12 decimals.',
            'ucb': {'next_t': 41, 'counts': [18, 12, 6, 4], 'successes': [11, 5, 2, 1], 'scores': [round(x, 12) for x in scores], 'chosen_arm': 4},
            'prediction': {'mc': moments(mc), 'exact_td': moments(exact_td), 'wrong_td': moments(wrong_td), 'wrong_td_bias': moments(wrong_td)[0] - F(3, 5),
                           'one_step': {'td_target': td_target, 'mc_target': mc_target, 'td_update': td_target / 4, 'mc_update': mc_target / 4}},
            'control': control, 'local_control_targets': local_targets, 'local_control_updates': local_updates,
            'exploring_unrestricted_optimum_values': naive, 'exploration_value_loss_at_1': control[1]['values'][1] - naive[1],
            'trace': {'rewards': rewards, 'frozen_values': v, 'n_step_targets': targets, 'td_errors': delta, 'mixtures': mixtures,
                      'repeated_state_online_weighted_error': sum(gamma ** i * online_delta[i] for i in range(3)), 'return_minus_initial_value': targets[-1] - F(1, 2)}}


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--write', action='store_true')
    parser.add_argument('--demo', action='store_true')
    args = parser.parse_args()
    if args.demo:
        demo()
    else:
        result = json.loads(json.dumps(check(), default=str))
        dest = Path(__file__).resolve().parents[2] / 'docs/reports/2026-11-13-licensed-example-renewal/td-numerical-checks.json'
        if args.write:
            dest.write_text(json.dumps(result, indent=2) + '\n')
        else:
            assert result == json.loads(dest.read_text())
        print('TD renewal passed: 16 exact policy evaluations, prediction moments, UCB snapshot and frozen/online trace checks.')
