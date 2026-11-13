#!/usr/bin/env python3
"""Original finite allocation examples, authored for this project with Codex assistance.

No external environment, dataset, training implementation or network access.
Enumerate the eight length-three binary schedules exactly. --write saves results.
"""
from fractions import Fraction as F
from itertools import product
import json
import math
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "docs/reports/2026-11-13-licensed-example-renewal/policy-gradient-allocation-results.json"


def schedules(p, baseline=F(0), bonus=F(0)):
    rows = []
    for actions in product((0, 1), repeat=3):
        k = sum(actions)
        mass = p ** k * (1 - p) ** (3 - k)
        reward = F(k == 2)
        score = k - 3 * p
        rows.append((actions, mass, reward, score, (reward + bonus - baseline) * score))
    assert sum(row[1] for row in rows) == 1
    assert sum(row[1] * row[3] for row in rows) == 0
    mean = sum(row[1] * row[4] for row in rows)
    var = sum(row[1] * (row[4] - mean) ** 2 for row in rows)
    return rows, mean, var


def gae(rewards, values, gamma, lam):
    assert len(values) == len(rewards) + 1
    deltas = [r + gamma * values[i + 1] - values[i] for i, r in enumerate(rewards)]
    advantages = [F(0)] * len(rewards)
    carry = F(0)
    for i in reversed(range(len(rewards))):
        carry = deltas[i] + gamma * lam * carry
        advantages[i] = carry
    return deltas, advantages


def clipped(ratio, advantage, epsilon=F(3, 20)):
    return min(ratio * advantage, min(max(ratio, 1 - epsilon), 1 + epsilon) * advantage)


def bernoulli_kl(p, q):
    return p * math.log(p / q) + (1 - p) * math.log((1 - p) / (1 - q))


def run():
    p = F(2, 5)
    rows, mean, var = schedules(p)
    J = 3 * p * p * (1 - p)
    analytic_gradient = (6 * p - 9 * p * p) * p * (1 - p)
    assert J == F(36, 125) and mean == analytic_gradient == F(144, 625)
    best_baseline = sum(m * r * s * s for _, m, r, s, _ in rows) / sum(m * s * s for _, m, _, s, _ in rows)
    assert best_baseline == F(32, 125)
    baselines = []
    for name, b in [("none", F(0)), ("value", J), ("optimal_constant", best_baseline)]:
        _, mu, v = schedules(p, b)
        _, shifted_mu, shifted_v = schedules(p, b + 7, F(7))
        assert mu == mean and (mu, v) == (shifted_mu, shifted_v)
        baselines.append({"name": name, "baseline": str(b), "mean": float(mu), "variance": float(v)})
    assert baselines[2]["variance"] < baselines[1]["variance"] < float(var)
    _, _, noisy = schedules(p, bonus=F(7))
    _, at_optimum_mean, at_optimum_var = schedules(F(2, 3))
    assert (at_optimum_mean, at_optimum_var) == (0, 0)
    assert 3 * F(2, 3) ** 2 * (1 - F(2, 3)) == F(4, 9)
    # Finite differences validate the exact score estimator in logit coordinates.
    for prob in [F(1, 5), F(2, 5), F(2, 3), F(9, 10)]:
        _, gradient, _ = schedules(prob)
        h = math.log(float(prob / (1 - prob)))
        def objective(logit):
            q = 1 / (1 + math.exp(-logit))
            return 3 * q * q * (1 - q)
        fd = (objective(h + 1e-5) - objective(h - 1e-5)) / 2e-5
        assert abs(fd - float(gradient)) < 1e-9
    rewards = [F(1), F(-1, 2), F(0), F(2)]
    values = [F(4, 5), F(3, 5), F(9, 10), F(7, 5), F(0)]
    gamma = F(4, 5)
    variants = {}
    for lam in [F(0), F(3, 5), F(1)]:
        deltas, adv = gae(rewards, values, gamma, lam)
        variants[str(lam)] = {"deltas": list(map(float, deltas)), "advantages": list(map(float, adv))}
        if lam == 1:
            for t in range(4):
                assert adv[t] == sum(gamma ** (k - t) * rewards[k] for k in range(t, 4)) - values[t]
    _, truncated = gae(rewards, values[:-1] + [F(7, 10)], gamma, F(1))
    assert truncated[0] - F(str(variants["1"]["advantages"][0])) == gamma ** 4 * F(7, 10)
    ratios = [F(7, 10), F(1), F(13, 10)]
    ppo = [{"ratio": float(r), "positive_three": float(clipped(r, F(3))), "negative_two": float(clipped(r, F(-2)))} for r in ratios]
    plateau = [{"new_probability": q, "clipped_positive_term": float(clipped(F(str(q)) / p, F(3))), "old_to_new_kl": bernoulli_kl(float(p), q)} for q in [.5, .9, .99, .999]]
    assert all(x["clipped_positive_term"] == 3.45 for x in plateau)
    assert plateau[-1]["old_to_new_kl"] > 3
    entropy = -float(p) * math.log(float(p)) - float(1 - p) * math.log(float(1 - p))
    entropy_gradient = float(p * (1 - p)) * math.log(float((1 - p) / p))
    return {
        "origin": "Original three-slot allocation task authored for the Fedor Pakhurov project with Codex assistance; exact enumeration, no benchmark training",
        "specification": {"slots": 3, "actions": ["routine", "priority"], "reward": "one exactly when two priority jobs were selected; zero otherwise", "policy": "independent Bernoulli choices with one shared probability p", "gamma": 1},
        "at_p_two_fifths": {"expected_reward": float(J), "logit_gradient": float(mean), "schedules": [{"actions": list(a), "probability": str(m), "reward": int(r), "score": str(s), "gradient": str(g)} for a, m, r, s, g in rows], "baseline_comparison": baselines, "variance_bonus_seven_no_baseline": float(noisy)},
        "optimum_in_shared_policy": {"p": "2/3", "expected_reward": "4/9", "unbaselined_gradient_variance": float(at_optimum_var), "state_aware_deterministic_reward": 1},
        "gae": {"rewards": list(map(float, rewards)), "values": list(map(float, values)), "gamma": float(gamma), "variants": variants, "cutoff_bootstrap_extra_at_start": float(gamma ** 4 * F(7, 10))},
        "ppo": {"epsilon": .15, "terms": ppo, "positive_term_plateau": plateau},
        "entropy": {"p": float(p), "nats": entropy, "logit_gradient": entropy_gradient},
    }


if __name__ == "__main__":
    result = run()
    output = json.dumps(result, ensure_ascii=False, indent=2) + "\n"
    if "--write" in sys.argv:
        OUT.write_text(output)
    else:
        assert json.loads(OUT.read_text()) == result
    print(output, end="")
