"""Independent exact/Decimal calculations; no author functions imported."""
from decimal import Decimal as D, localcontext
from fractions import Fraction as F
import hashlib
import json
from pathlib import Path

draft = Path('/Users/fedorpakhurov/code/_work/fp-nlp-adaptation-renewal-drafts')
out = Path(__file__).parent
saved = json.loads((draft / 'docs/reports/2026-11-16-nlp-adaptation/results.json').read_text())
checks = 0
maximum_error = 0.0


def close(actual, expected, tolerance=1e-12):
    global checks, maximum_error
    error = abs(float(actual) - float(expected))
    assert error <= tolerance, (actual, expected, error)
    checks += 1
    maximum_error = max(maximum_error, error)


efficient = saved['efficient_transformers']
masses = [F(x) for x in [3, 1, 6, 2, 4]]
vectors = [[2, -1], [-3, 2], [1, 4], [5, 0], [-2, -2]]
for stage, count in zip(efficient['attention']['trace'], [2, 3, 5]):
    maximum_mass = max(masses[:count])
    close(stage['denominator'], sum(masses[:count]) / maximum_mass)
    with localcontext() as ctx:
        ctx.prec = 60
        close(stage['maximum'], D(maximum_mass.numerator).ln())
    for coordinate in range(2):
        numerator = sum(masses[i] * vectors[i][coordinate] for i in range(count))
        close(stage['numerator'][coordinate], numerator / maximum_mass)
        close(stage['output'][coordinate], numerator / sum(masses[:count]))
for coordinate in range(2):
    close(efficient['attention']['output'][coordinate], sum(masses[i] * vectors[i][coordinate] for i in range(5)) / 16)
    close(efficient['attention']['masked_output'][coordinate], sum(masses[i] * vectors[i][coordinate] for i in [1, 2, 3]) / 9)
for row in efficient['memory']:
    n = row['n']
    common = sum(n * 48 * 2 for _ in range(4))
    dense = common + sum(n * n * 2 for _ in range(2))
    streamed = common + sum(n * 4 for _ in range(2))
    for key, value in [('common_bytes', common), ('dense_bytes', dense), ('streamed_bytes', streamed),
                       ('dense_kib', F(dense, 1024)), ('streamed_kib', F(streamed, 1024))]:
        close(row[key], value, 0)
moe = efficient['moe']
for key, value in [('expert_parameters', 123), ('router_parameters', 35), ('total_parameters', 650),
                   ('touched_parameters', 281), ('top2_output', 0), ('switch_top1_output', F(3, 2)),
                   ('balance_without_alpha', F(4, 3))]:
    close(moe[key], value)
close(moe['top2_weights'][0], F(2, 3)); close(moe['top2_weights'][1], F(1, 3))
for row in moe['capacities']:
    c = row['capacity']
    used = sum(sum(j <= c for j in range(1, count + 1)) for count in [6, 4, 3, 2, 0])
    close(row['used'], used, 0); close(row['dropped'], 15 - used, 0)
    close(row['empty_slots'], 5 * c - used, 0)
for row, kib in zip(efficient['gqa_cache'], [108, 36, 18]):
    close(row['kib'], kib, 0); close(row['bytes'], kib * 1024, 0)
for value in efficient['equal_ffn_parameter_counts'].values(): close(value, 72, 0)

transfer = saved['transfer_learning']
with localcontext() as ctx:
    ctx.prec = 60
    a1, a2, w = D(1), D(0), D(1)
    history = {row['step']: row for row in transfer['history']}
    # Opposite vectors have complementary target labels, so two terms give
    # the exact four-point objective; the bias stays zero by symmetry.
    for step in range(241):
        h_plus, h_minus = 2 * a1 + a2, 2 * a1 - a2
        z_plus, z_minus = w * h_plus, w * h_minus
        loss = ((1 + (-z_plus).exp()).ln() + (1 + z_minus.exp()).ln()) / 2
        if step in history:
            row = history[step]
            close(row['encoder'][0], a1); close(row['encoder'][1], a2)
            close(row['head_weight'], w); close(row['head_bias'], 0)
            close(row['target_nll'], loss)
            logits = [-z_plus, -z_minus, z_minus, z_plus]
            for value, expected in zip(row['logits'], logits): close(value, expected)
            predictions = [int(z >= 0) for z in logits]
            close(row['target_accuracy'], F(sum(x == y for x, y in zip(predictions, [0, 1, 0, 1])), 4), 0)
            close(row['old_rule_accuracy'], F(sum(x == y for x, y in zip(predictions, [0, 0, 1, 1])), 4), 0)
        if step == 240: break
        e_plus = 1 / (1 + (-z_plus).exp()) - 1
        e_minus = 1 / (1 + (-z_minus).exp())
        g1 = w * (e_plus + e_minus)
        g2 = w * (e_plus - e_minus) / 2
        gw = (e_plus * h_plus + e_minus * h_minus) / 2
        if step == 0:
            close(transfer['first_gradient']['encoder'][0], g1)
            close(transfer['first_gradient']['encoder'][1], g2)
            close(transfer['first_gradient']['head_weight'], gw)
            close(transfer['first_gradient']['head_bias'], 0)
        a1, a2, w = a1 - D('.2') * g1, a2 - D('.2') * g2, w - D('.2') * gw
    close(transfer['frozen_optimal_target_nll'], D(2).ln())
    close(transfer['explicit_alternative_nll'], (1 + D(-2).exp()).ln())
close(transfer['frozen_best_accuracy'], F(1, 2), 0)
close(transfer['verbalizer']['conditional_class_probability'], F(3, 4), 0)
close(transfer['cache_example']['feature_bytes'], 840, 0)
close(transfer['cache_example']['three_class_head_parameters'], 24, 0)

paths = ['src/content/notes/nlp/efficient-transformers.mdx', 'src/content/notes/nlp/transfer-learning.mdx',
         'scripts/notes/nlp-adaptation-cases.py', 'docs/reports/2026-11-16-nlp-adaptation/results.json']
result = {'scope': 'Independent exact mass sums, memory inventories, expert counts, routing capacity, KV cache and 60-digit symmetric gradient replay. No author implementation imported.',
          'assertions': checks, 'maximumAbsoluteError': maximum_error,
          'inputHashes': {path: hashlib.sha256((draft / path).read_bytes()).hexdigest() for path in paths}}
(out / 'nlp-adaptation-root-oracle.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps({key: value for key, value in result.items() if key != 'inputHashes'}))
