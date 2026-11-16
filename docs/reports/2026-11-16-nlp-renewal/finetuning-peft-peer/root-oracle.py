import cmath
import hashlib
import json
import math
from pathlib import Path

root = Path('/Users/fedorpakhurov/code/_work/fp-nlp-finetuning-drafts')
fp = root / 'src/components/figures/nlp/fine-tuning/cases.json'
pp = root / 'src/components/figures/nlp/peft/cases.json'
ft = json.loads(fp.read_text())
peft = json.loads(pp.read_text())
checks = 0
maximum = 0

def near(actual, expected):
    global checks, maximum
    if isinstance(expected, list):
        assert len(actual) == len(expected)
        for a, b in zip(actual, expected):
            near(a, b)
        return
    error = abs(actual - expected)
    assert error < 1e-12, (actual, expected, error)
    maximum = max(maximum, error)
    checks += 1

def grad(function, parameters):
    result = []
    for i in range(len(parameters)):
        perturbed = parameters[:]
        perturbed[i] += 1e-25j
        result.append(function(perturbed).imag / 1e-25)
    return result

# Independent complex-step differentiation of flattened scalar expressions.
def score(p):
    return p[4] * (2 * p[0] + p[1]) + p[5] * (2 * p[2] + p[3])

loss = lambda p: cmath.log(1 + cmath.exp(-score(p)))
initial = [1., 0., 0., 1., 1., -1.]
near(ft['initial_logit'], score(initial))
near(ft['initial_loss'], loss(initial).real)
near(ft['initial_probability'], 1 / (1 + math.exp(-score(initial))))
states = {'full': (initial, True), 'probe': (initial, False)}
for name in ['full', 'probe', 'probe_then_full']:
    before, update_features = states[name]
    derivative = grad(loss, before)
    after = [p - 0.1 * g if i >= 4 or update_features else p
             for i, (p, g) in enumerate(zip(before, derivative))]
    row = ft[name]
    near(row['matrix'], [after[:2], after[2:4]])
    near(row['head'], after[4:])
    near(row['gradient_matrix'], [derivative[:2], derivative[2:4]])
    near(row['gradient_head'], derivative[4:])
    near(row['logit'], score(after)); near(row['loss'], loss(after).real)
    if name == 'probe':
        states['probe_then_full'] = (after, True)

def expected_loss(theta, label_agreement):
    result = 0j
    for x in [-1, 1]:
        for y in [0, 1]:
            probability = label_agreement if (y == 1) == (x == 1) else 1 - label_agreement
            result += 0.5 * probability * (cmath.log(1 + cmath.exp(theta * x)) - y * theta * x)
    return result

theta = 0.0
validation_losses = []
for step, row in enumerate(ft['checkpoint']['trace']):
    near(row['step'], step); near(row['theta'], theta)
    training = expected_loss(theta, 1).real
    validation = expected_loss(theta, 0.75).real
    near(row['train'], training); near(row['validation'], validation)
    validation_losses.append(validation)
    theta -= 0.25 * grad(lambda p: expected_loss(p[0], 1), [theta])[0]
best = min(range(len(validation_losses)), key=validation_losses.__getitem__)
near(best, 12); near(ft['checkpoint']['best']['step'], best)
near(grad(lambda p: expected_loss(p[0], 0.75), [math.log(3)])[0], 0)
masked = ft['masked_loss']
near(masked['first_loss'], -math.log(0.4 * 0.8) / 2)
near(masked['second_loss'], -math.log(0.5))
near(masked['token_mean'], -math.log(0.4 * 0.8 * 0.5) / 3)
near(masked['example_mean'], (-math.log(0.4 * 0.8) / 2 - math.log(0.5)) / 2)
for key, expected in [('valid_tokens', 13), ('padded_tokens', 18), ('valid_square_slots', 61),
                      ('padded_square_slots', 108), ('local_tokens', 14), ('local_square_slots', 68)]:
    near(ft['padding'][key], expected)

# Flatten A then B; the separate first-party expression is scalar throughout.
def outputs(p, x=(2, 1, -1)):
    ax = sum(p[i] * x[i] for i in range(3))
    return [x[0] - x[2] + 2 * p[3] * ax, x[1] + x[2] + 2 * p[4] * ax]

objective = lambda p: sum((y - 2) ** 2 for y in outputs(p)) / 2
initial = [1., -1., 2., 0., 0.]
derivative = grad(objective, initial)
near(peft['gradient_A'], [derivative[:3]])
near(peft['gradient_B'], [[g] for g in derivative[3:]])
near(peft['initial_output'], outputs(initial)); near(peft['initial_loss'], objective(initial))
after = [p - 0.1 * g for p, g in zip(initial, derivative)]
near(peft['A'], [after[:3]]); near(peft['B'], [[g] for g in after[3:]])
near(peft['output'], outputs(after)); near(peft['loss'], objective(after))
correction = [[2 * after[j + 3] * after[i] for i in range(3)] for j in range(2)]
near(peft['update'], correction)
merged = [[float(i == j) + correction[j][i] for i in range(3)] for j in range(2)]
merged[0][2] -= 1; merged[1][2] += 1
near(peft['merged'], merged)
for x in [(2, 1, -1), (-1, 0, 3), (0, 0, 0), (1, 1, 1), (-2, -1, 1)]:
    near(outputs(after, x), [sum(a * b for a, b in zip(row, x)) for row in merged])
near(grad(objective, [0., 0., 0., 0., 0.]), [0] * 5)
for p in [initial, after, [0.3, -0.7, 1.1, -0.4, 0.8]]:
    residual = [v - 2 for v in outputs(p)]
    ax = 2 * p[0] + p[1] - p[2]
    btg = p[3] * residual[0] + p[4] * residual[1]
    expected = [4 * btg, 2 * btg, -2 * btg, 2 * residual[0] * ax, 2 * residual[1] * ax]
    near(grad(objective, p), expected)

for u in [(1, 2), (-2, 3), (0, 4)]:
    for v in [(2, -1), (0, 1), (-3, -2)]:
        near((u[0] * v[0]) * (u[1] * v[1]) - (u[0] * v[1]) * (u[1] * v[0]), 0)
near(peft['rank']['sum'], [[1, 0], [0, 1]])
near(peft['rank']['determinants'], [0, 0, 1])
adapter = lambda h: [h[0] + 2 * max(0, h[0] + h[1]), h[1] - max(0, h[0] + h[1])]
near(peft['nonlinear']['positive'], adapter([2, 1]))
near(peft['nonlinear']['negative'], adapter([-2, -1]))
near(peft['nonlinear']['sum'], [6, -3])
near(adapter([0, 0]), [0, 0])
count = peft['count']
for key, expected in {'base': 4194304, 'update': 32768, 'reduction': 128,
    'full_bytes': 67108864, 'frozen_bytes': 16777216, 'update_bytes': 524288,
    'full_mib': 64, 'frozen_mib': 16, 'update_mib': 0.5, 'total_mib': 16.5,
    'tiny_rank1': 5, 'tiny_rank2': 10}.items():
    near(count[key], expected)
near(peft['prompt']['input_parameters'], 96)
near(peft['prompt']['kv_parameters'], 768)

print(json.dumps({'reviewer': 'Codex root', 'assertions': checks,
    'maximumFloatDifference': maximum,
    'fixtures': {str(p.relative_to(root)): hashlib.sha256(p.read_bytes()).hexdigest() for p in [fp, pp]},
    'method': 'Independent complex-step gradients of scalar expressions; all simultaneous/probe states; enumerated expected losses at41checkpoints; masking and padding; factor gradients atzero/nonzero states; exact matrix/rank/storage counts.',
    'scope': 'Numerical review only; complete peer proof and source/layout gates separate.'}, indent=2))
