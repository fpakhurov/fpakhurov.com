#!/usr/bin/env python3
"""Original discrete-count fixtures for Fedor Pakhurov's project, with Codex assistance.

No external data. The two 512-window simulations are specified here from scratch;
they are illustrations of known mechanisms, not empirical evidence about sensors.
"""
import argparse
from collections import Counter
from fractions import Fraction
from itertools import combinations, product
import json
from math import comb, exp, factorial, fsum, isclose
from pathlib import Path
from random import Random
from statistics import mean, pvariance

ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "docs/reports/2026-11-13-licensed-example-renewal/discrete-distributions-results.json"
FIGURE_DATA = ROOT / "src/components/figures/discrete-distributions/countData.ts"


def binomial(n, p, k):
    if not 0 <= k <= n:
        return 0
    return comb(n, k) * p**k * (1-p)**(n-k)


def poisson(lam, k):
    return exp(-lam) * lam**k / factorial(k)


def simulate(group_size, seed):
    rng = Random(seed)
    counts = [group_size * sum(rng.random() < 1/40 for _ in range(48//group_size))
              for _ in range(512)]
    histogram = [counts.count(k) for k in range(6)] + [sum(k >= 6 for k in counts)]
    assert sum(histogram) == len(counts)
    return {"group_size": group_size, "seed": seed, "windows": 512,
            "counts": counts, "histogram_0_to_5_and_6plus": histogram,
            "mean": mean(counts), "variance_denominator_N": pvariance(counts)}


def evaluate():
    F = Fraction
    two = {k: F(0) for k in range(3)}
    for a, b in product([0, 1], repeat=2):
        two[a+b] += (F(1,4) if a else F(3,4)) * (F(1,2) if b else F(1,2))
    assert list(two.values()) == [F(3,8), F(1,2), F(1,8)]
    bp = [binomial(12, F(1,5), k) for k in range(13)]
    assert sum(bp) == 1
    memoryless = F(4,5)**8 / F(4,5)**3
    assert memoryless == F(4,5)**5
    limit = [{"n": n, "p": 1.2/n, "zero_probability": (1-1.2/n)**n,
              "variance": 1.2*(1-1.2/n),
              "pmf_0_to_5_and_6plus": [float(binomial(n,F(6,5)/n,k)) for k in range(6)]
                  + [float(1-sum(binomial(n,F(6,5)/n,k) for k in range(6)))]}
             for n in [12,48,192]]
    pois = [poisson(1.2,k) for k in range(6)]
    pois.append(1-fsum(pois))
    assert all(x >= 0 for x in pois) and isclose(sum(pois),1)
    independent = simulate(1,2026111305)
    grouped = simulate(4,2026111308)
    assert independent["histogram_0_to_5_and_6plus"] == [152,191,113,42,12,1,1]
    assert grouped["histogram_0_to_5_and_6plus"] == [368,0,0,0,121,0,23]
    # Direct moment sums independently verify the closed-form count moments.
    for groups, size, expected_var in [(48,1,F(117,100)),(12,4,F(117,25))]:
        pmf = [binomial(groups,F(1,40),k) for k in range(groups+1)]
        mu = sum(size*k*p for k,p in enumerate(pmf))
        variance = sum((size*k-mu)**2*p for k,p in enumerate(pmf))
        assert mu == F(6,5) and variance == expected_var
    independent_p0 = F(39,40)**48
    grouped_p0 = F(39,40)**12
    assert grouped_p0 > 2*independent_p0
    # Enumerate all equally likely subsets independently of the PMF formula.
    sample_counts = Counter(sum(i < 5 for i in sample) for sample in combinations(range(18),6))
    hyper = {k:F(comb(5,k)*comb(13,6-k),comb(18,6)) for k in range(6)}
    assert sum(hyper.values()) == 1
    assert all(F(sample_counts[k],comb(18,6)) == hyper[k] for k in hyper)
    assert hyper[2] == F(275,714)
    hetero = [F(9,100),F(82,100),F(9,100)]
    same = [F(1,4),F(1,2),F(1,4)]
    shared = [F(1,2),F(0),F(1,2)]
    variances = [sum((k-1)**2*p for k,p in enumerate(dist)) for dist in [hetero,same,shared]]
    assert variances == [F(9,50),F(1,2),F(1)]
    return {
        "origin": "New fictional count mechanisms and simulations specified for Fedor Pakhurov's project with Codex assistance; no external data or benchmark results.",
        "random_variables": {"pmf": [str(p) for p in two.values()], "cdf_at_1": "7/8"},
        "binomial": {"n":12,"p":"1/5","probability_three":float(bp[3]),"probability_at_least_four":float(sum(bp[4:]))},
        "geometric": {"p":"1/5","tail_five":float(memoryless),"tail_five_exact":str(memoryless)},
        "poisson": {"lambda":1.2,"pmf_0_to_5_and_6plus":pois,"probability_at_least_four":1-fsum(pois[:4]),"limit":limit},
        "synthetic_windows": {"independent":independent,"groups_of_four":grouped,
            "theory": {"mean_both":1.2,"variance_independent":1.17,"variance_grouped":4.68,
                       "p0_independent":float(independent_p0),"p0_grouped":float(grouped_p0)}},
        "hypergeometric": {"N":18,"K":5,"n":6,"pmf":{str(k):str(v) for k,v in hyper.items()},
            "probability_two":float(hyper[2]),"probability_two_binomial":float(binomial(6,F(5,18),2)),
            "subsets_enumerated":comb(18,6)},
        "unequal_and_dependent_trials": {"heterogeneous_pmf":[str(x) for x in hetero],
            "equal_pmf":[str(x) for x in same],"shared_pmf":[str(x) for x in shared],
            "variances":[str(x) for x in variances]}}


def figure_source(result):
    windows = result["synthetic_windows"]
    data = {"poisson":result["poisson"],"independent":windows["independent"]["histogram_0_to_5_and_6plus"],
            "grouped":windows["groups_of_four"]["histogram_0_to_5_and_6plus"],"windows":512}
    return ("// Generated by scripts/notes/discrete-distributions-renewal.py from original fixtures.\n"
            "// Fedor Pakhurov project, composed with Codex assistance; no external dataset.\n"
            "export const countData = " + json.dumps(data,indent=2,ensure_ascii=False) + " as const;\n")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--write",action="store_true")
    args = parser.parse_args()
    result = evaluate()
    text = json.dumps(result,indent=2,ensure_ascii=False,allow_nan=False)+"\n"
    figure = figure_source(result)
    if args.write:
        OUTPUT.write_text(text)
        FIGURE_DATA.write_text(figure)
    else:
        assert OUTPUT.read_text() == text, "Saved result differs from replay"
        assert FIGURE_DATA.read_text() == figure, "Figure data differs from replay"
    print("PASS discrete counts: exact arithmetic, 18564 subsets, two saved 512-window fixtures, figure data")


if __name__ == "__main__":
    main()
