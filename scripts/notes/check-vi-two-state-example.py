"""Check the original two-state ELBO example in both VI notes.

Authored for fpakhurov.com with Codex assistance on 2026-11-13.
The supplied joint masses are fictional; no external data or code is used.
"""

import json
import math
from fractions import Fraction


joint = (Fraction(3, 25), Fraction(2, 25))
evidence = sum(joint)
posterior = tuple(mass / evidence for mass in joint)
q = (Fraction(1, 2), Fraction(1, 2))


def elbo(weights):
    return sum(float(weight) * math.log(float(mass / weight))
               for weight, mass in zip(weights, joint))


bound = elbo(q)
log_evidence = math.log(float(evidence))
gap = log_evidence - bound
kl = sum(float(weight) * math.log(float(weight / target))
         for weight, target in zip(q, posterior))
contributions = tuple(math.log(float(mass / weight))
                      for mass, weight in zip(joint, q))
variance = sum(float(weight) * (value - bound) ** 2
               for weight, value in zip(q, contributions))

assert posterior == (Fraction(3, 5), Fraction(2, 5))
assert math.isclose(gap, kl, abs_tol=1e-14)
assert math.isclose(gap, 0.5 * math.log(25 / 24), abs_tol=1e-14)
assert math.isclose(elbo(posterior), log_evidence, abs_tol=1e-14)
assert tuple(f"{value:.5f}" for value in (bound, log_evidence, gap)) == (
    "-1.62985", "-1.60944", "0.02041"
)

print(json.dumps({
    "joint": [float(value) for value in joint],
    "posterior": [float(value) for value in posterior],
    "elbo": bound,
    "log_evidence": log_evidence,
    "gap": gap,
    "direct_kl": kl,
    "exact_posterior_elbo": elbo(posterior),
    "iid_sample_mean_standard_error": {
        str(n): math.sqrt(variance / n) for n in (1, 100, 10000)
    }
}, indent=2))
