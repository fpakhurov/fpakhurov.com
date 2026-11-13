"""Original responsible-ML arithmetic for the Fedor Pakhurov project.

Authored with Codex assistance. Synthetic counts and fixed illustrative values.
This is not a private release mechanism, attack, model training or demographic study.
"""
import itertools
import json
import math
from fractions import Fraction


def fairness():
    matrices = {"A": {"tp": 30, "fn": 10, "fp": 15, "tn": 45},
                "B": {"tp": 15, "fn": 5, "fp": 20, "tn": 60}}
    result = {}
    for group, row in matrices.items():
        total = sum(row.values())
        positives, negatives = row["tp"] + row["fn"], row["fp"] + row["tn"]
        selected = row["tp"] + row["fp"]
        rates = {"base_rate": Fraction(positives, total),
                 "selection": Fraction(selected, total), "tpr": Fraction(row["tp"], positives),
                 "fpr": Fraction(row["fp"], negatives), "ppv": Fraction(row["tp"], selected)}
        expected_ppv = rates["tpr"] * rates["base_rate"] / (
            rates["tpr"] * rates["base_rate"] + rates["fpr"] * (1 - rates["base_rate"]))
        assert expected_ppv == rates["ppv"]
        result[group] = {"counts": row, "rates": {k: str(v) for k, v in rates.items()}}
    assert result['A']['rates']['tpr'] == result['B']['rates']['tpr'] == '3/4'
    assert result['A']['rates']['fpr'] == result['B']['rates']['fpr'] == '1/4'
    assert result['A']['rates']['ppv'] == '2/3' and result['B']['rates']['ppv'] == '3/7'
    return result


def proxy():
    rows = [("A", 1), ("A", 1), ("A", 1), ("A", 0),
            ("B", 1), ("B", 0), ("B", 0), ("B", 0)]
    # The decision uses the flag only; the group is used solely for reporting.
    return {group: str(Fraction(sum(flag for g, flag in rows if g == group),
                                sum(g == group for g, flag in rows))) for group in ('A', 'B')}


def privacy_arithmetic():
    epsilon = .7
    scale = 1 / epsilon
    illustrative_u = .8
    noise_quantile = -scale * math.log(2 * (1 - illustrative_u))
    release_arithmetic = 7 + noise_quantile
    # Exhaustively check a tiny count domain, not the privacy of floating sampling.
    sensitivity = 0
    for bits in itertools.product((0, 1), repeat=5):
        for index in range(5):
            changed = bits[:index] + (1 - bits[index],) + bits[index + 1:]
            sensitivity = max(sensitivity, abs(sum(bits) - sum(changed)))
    assert sensitivity == 1
    # The paper proof is analytic; these points only check the displayed formula.
    log_ratios = [(abs(z - 8) - abs(z - 7)) / scale for z in (-20, 7, 7.5, 8, 20)]
    assert all(abs(value) <= epsilon + 1e-12 for value in log_ratios)
    assert math.isclose(release_arithmetic, 8.308986759820222)
    return {"epsilon": epsilon, "count_sensitivity": sensitivity, "count_scale": scale,
            "fixed_n_mean_sensitivity": .01, "fixed_n_mean_scale": .01 / epsilon,
            "illustrative_uniform_quantile": illustrative_u, "noise_quantile": noise_quantile,
            "count_plus_quantile": release_arithmetic,
            "pointwise_log_density_ratios_for_counts_7_8": log_ratios,
            "basic_composition_epsilon": str(Fraction(1, 5) + Fraction(3, 10)),
            "warning": "Fixed quantile is not a random private release; no production sampler/accountant implemented"}


def clipping():
    gradients = [(3, 4), (-6, 8), (0, 2)]
    bound = 5
    clipped = []
    for gradient in gradients:
        norm = math.sqrt(sum(value * value for value in gradient))
        clipped.append([value / max(1, norm / bound) for value in gradient])
    raw_mean = [sum(g[i] for g in gradients) / len(gradients) for i in (0, 1)]
    clipped_mean = [sum(g[i] for g in clipped) / len(clipped) for i in (0, 1)]
    assert clipped == [[3., 4.], [-3., 4.], [0., 2.]]
    assert math.sqrt(sum(v*v for v in raw_mean)) < bound
    assert raw_mean != clipped_mean
    return {"per_example_gradients": gradients, "norm_bound": bound,
            "clipped_gradients": clipped, "raw_mean": raw_mean,
            "clipped_mean": clipped_mean,
            "warning": "Clipping arithmetic only; no noise, DP-SGD training or privacy guarantee"}


if __name__ == '__main__':
    result = {"scope": "New synthetic teaching counts, analytic mechanism arithmetic, no private release",
              "fairness": fairness(), "proxy_selection": proxy(),
              "privacy_arithmetic": privacy_arithmetic(), "clipping": clipping()}
    print(json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True))
