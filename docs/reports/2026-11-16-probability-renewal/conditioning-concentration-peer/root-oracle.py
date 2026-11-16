"""Independent integer-atom and generating-polynomial review checks."""
from decimal import Decimal as D, localcontext
from fractions import Fraction as F
import hashlib
import json
from pathlib import Path

draft = Path('/Users/fedorpakhurov/code/_work/fp-probability-conditioning-drafts')
proof = Path(__file__).parent
conditional = json.loads((draft / 'src/components/figures/conditional-expectation/cases.json').read_text())
concentration = json.loads((draft / 'src/components/figures/inequalities-and-concentration/cases.json').read_text())
checks = 0
max_error = 0.0


def exact(actual, expected):
    global checks
    assert F(str(actual)) == expected, (actual, expected)
    checks += 1


def close(actual, expected, tolerance=2e-12):
    global checks, max_error
    error = abs(float(actual) - float(expected))
    assert error <= tolerance, (actual, expected, error)
    checks += 1
    max_error = max(max_error, error)


# Sixteen equiprobable atoms specify the joint law directly.
groups = {'A': [0, 0, 2, 6], 'B': [0, 0, 2, 2, 2, 2, 6, 6], 'C': [2, 6, 6, 6]}
all_values = sum(groups.values(), [])
means = {key: F(sum(values), len(values)) for key, values in groups.items()}
variances = {key: sum((F(x) - means[key]) ** 2 for x in values) / len(values) for key, values in groups.items()}
overall = F(sum(all_values), 16)
within = sum(len(groups[key]) * value for key, value in variances.items()) / 16
between = sum(len(values) * (means[key] - overall) ** 2 for key, values in groups.items()) / 16
total = sum((x - overall) ** 2 for x in all_values) / 16
for key, value in [('mean', overall), ('totalVariance', total), ('withinVariance', within), ('betweenVariance', between)]:
    exact(conditional[key], value)
for row in conditional['groups']:
    key = row['label']; values = groups[key]
    exact(row['mean'], means[key]); exact(row['variance'], variances[key])
    for index, (prediction, risk) in enumerate(row['points']):
        a = F(index, 20)
        close(prediction, a)
        close(risk, sum((x - a) ** 2 for x in values) / len(values))
coarse = groups['A'] + groups['B']
coarse_mean = F(sum(coarse), len(coarse))
coarse_variance = sum((x - coarse_mean) ** 2 for x in coarse) / len(coarse)
coarse_mse = (len(coarse) * coarse_variance + 4 * variances['C']) / 16
for key, value in [('coarseMean', coarse_mean), ('coarseVariance', coarse_variance), ('coarseMse', coarse_mse), ('refinementGain', coarse_mse - within)]:
    exact(conditional[key], value)
alternative = {'A': 1, 'B': 3, 'C': 4}
alternative_mse = sum((F(x) - alternative[key]) ** 2 for key, values in groups.items() for x in values) / 16
exact(conditional['alternativeMse'], alternative_mse); exact(conditional['alternativeExcess'], alternative_mse - within)
median = {'A': 0, 'B': 2, 'C': 6}
absolute = F(sum(abs(x - median[key]) for key, values in groups.items() for x in values), 16)
absolute_mean = sum(abs(x - means[key]) for key, values in groups.items() for x in values) / 16
classification_error = F(sum(x != median[key] for key, values in groups.items() for x in values), 16)
exact(conditional['medianAbsoluteRisk'], absolute)
exact(conditional['meanAbsoluteRisk'], absolute_mean)
exact(conditional['modeError'], classification_error)

rows = {row['n']: row for row in concentration['tailRows']}
coefficients = [1]
with localcontext() as ctx:
    ctx.prec = 60
    for n in range(1, max(rows) + 1):
        # Polynomial multiplication, independent of comb() or binomial recurrence.
        updated = [0] * (len(coefficients) + 1)
        for degree, coefficient in enumerate(coefficients):
            updated[degree] += 3 * coefficient
            updated[degree + 1] += 2 * coefficient
        coefficients = updated
        if n not in rows: continue
        row = rows[n]
        included = [k for k in range(n + 1) if abs(F(k, n) - F(2, 5)) >= F(1, 10)]
        tail = F(sum(coefficients[k] for k in included), 5 ** n)
        exact(row['exactProbability'], tail); close(row['actual'], tail)
        assert max(k for k in included if k < F(2 * n, 5)) == row['lowerCount']
        assert min(k for k in included if k > F(2 * n, 5)) == row['upperCount']
        checks += 2
        close(row['chebyshev'], F(24, n))
        close(row['hoeffding'], 2 * (-D(n) / 50).exp())
        # Optimize the Bernoulli exponential moment directly, without binary KL.
        p = D(2) / 5
        bounds = []
        for q in [D(3) / 10, D(1) / 2]:
            lam = (q * (1-p) / (p * (1-q))).ln()
            bounds.append((D(n) * ((1-p+p*lam.exp()).ln() - lam*q)).exp())
        close(row['chernoff'], sum(bounds))
        assert float(tail) <= min(row['chebyshev'], row['hoeffding'], row['chernoff'])
        checks += 1
    val = concentration['validation']
    for models, tolerance in val['curve']:
        epsilon = ((D(40) * models).ln() / 2400).sqrt()
        close(tolerance, epsilon)
    epsilon = (D(480).ln() / 2400).sqrt()
    close(val['epsilon'], epsilon); close(val['upperRisk'], D('0.09') + epsilon)

paths = ['src/content/notes/probability/conditional-expectation.mdx',
         'src/content/notes/probability/inequalities-and-concentration.mdx',
         'src/components/figures/conditional-expectation/cases.json',
         'src/components/figures/inequalities-and-concentration/cases.json',
         'scripts/notes/conditioning-concentration-cases.py']
result = {'assertions': checks, 'maximumAbsoluteError': max_error,
          'scope': 'Integer joint atoms, all risk curve points, all 37 exact binomial events by polynomial convolution, Decimal exponential bounds and all 256 finite-family tolerances. No author functions imported.',
          'inputHashes': {path: hashlib.sha256((draft / path).read_bytes()).hexdigest() for path in paths}}
(proof / 'conditioning-root-oracle.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps({key: value for key, value in result.items() if key != 'inputHashes'}))
