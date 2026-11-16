"""Original finite constructions for Fedor Pakhurov notes, composed with Codex assistance.

Python standard library only. No model, external corpus, API or source-paper example.
"""
import itertools
import json
import math
from fractions import Fraction


def kl(p, q):
    return sum(a * math.log(a / b) for a, b in zip(p, q) if a)


def instruction_cases():
    conversations = [
        {'tokens': ['BOS', 'USER', 'x', 'ASSISTANT', 'a', 'EOS'],
         'scored_positions': [4, 5], 'correct_probabilities': [0.75, 0.5]},
        {'tokens': ['BOS', 'USER', 'u', 'ASSISTANT', 'b', 'c', 'd', 'EOS'],
         'scored_positions': [4, 5, 6, 7], 'correct_probabilities': [0.8, 0.6, 0.5, 0.25]},
    ]
    for row in conversations:
        row['negative_logs'] = [-math.log(p) for p in row['correct_probabilities']]
        row['sum_nll'] = sum(row['negative_logs'])
        row['mean_nll'] = row['sum_nll'] / len(row['negative_logs'])
        assert len(row['scored_positions']) == len(row['correct_probabilities'])
        shifted = list(zip(row['tokens'][:-1], row['tokens'][1:]))
        scored = [shifted[t - 1] for t in row['scored_positions']]
        assert scored[0][0] == 'ASSISTANT' and scored[-1][1] == 'EOS'
        assert [pair[1] for pair in scored] == row['tokens'][4:]
    total_tokens = sum(len(row['negative_logs']) for row in conversations)
    token_loss = sum(row['sum_nll'] for row in conversations) / total_tokens
    conversation_loss = sum(row['mean_nll'] for row in conversations) / len(conversations)
    q = [0.5, 0.3, 0.2]
    rewards = [0, math.log(2), math.log(4)]
    beta = 1.0
    weights = [qi * math.exp(ri / beta) for qi, ri in zip(q, rewards)]
    partition = sum(weights)
    optimum = [w / partition for w in weights]
    expected = [float(Fraction(n, 19)) for n in [5, 6, 8]]
    assert max(abs(a - b) for a, b in zip(optimum, expected)) < 1e-15
    objective = lambda p: sum(a * b for a, b in zip(p, rewards)) - beta * kl(p, q)
    grid_checks = 0
    for i in range(1, 50):
        for j in range(1, 50 - i):
            p = [i / 50, j / 50, (50 - i - j) / 50]
            assert abs(objective(p) - (beta * math.log(partition) - beta * kl(p, optimum))) < 1e-14
            assert objective(p) <= objective(optimum) + 1e-14
            grid_checks += 1
    policies = {'reference': q, 'larger_chosen': [0.2, 0.5, 0.3], 'smaller_chosen': [0.2, 0.25, 0.55]}
    comparisons = []
    for name, p in policies.items():
        margin = beta * (math.log(p[1] / q[1]) - math.log(p[0] / q[0]))
        probability = 1 / (1 + math.exp(-margin))
        loss = math.log1p(math.exp(-margin))
        derivative = -(1 - probability)
        eps = 1e-5
        numerical = (math.log1p(math.exp(-(margin + eps))) - math.log1p(math.exp(-(margin - eps)))) / (2 * eps)
        assert abs(numerical - derivative) < 1e-10
        comparisons.append({'name': name, 'policy': p, 'margin': margin, 'pair_probability': probability,
                            'loss': loss, 'loss_margin_derivative': derivative})
    assert abs(comparisons[1]['pair_probability'] - 25 / 31) < 1e-15
    assert abs(comparisons[2]['pair_probability'] - 25 / 37) < 1e-15
    return {'sft': {'conversations': conversations, 'scored_tokens': total_tokens,
                    'token_mean_nll': token_loss, 'conversation_mean_nll': conversation_loss},
            'reward': {'reference': q, 'rewards': rewards, 'beta': beta, 'unnormalized': weights,
                       'partition': partition, 'optimum': optimum, 'kl_optimum_reference': kl(optimum, q),
                       'objective_reference': objective(q), 'objective_optimum': objective(optimum),
                       'gap_log3_preference': 0.75, 'gap_log3_nll': math.log(4 / 3)},
            'dpo': comparisons, 'grid_identity_checks': grid_checks}


def grade_json_sum(raw, expected):
    try:
        value = json.loads(raw)
    except json.JSONDecodeError:
        return {'format': False, 'value': False, 'pass': False}
    format_ok = isinstance(value, dict) and set(value) == {'sum'} and type(value['sum']) is int
    value_ok = format_ok and value['sum'] == expected
    return {'format': format_ok, 'value': value_ok, 'pass': format_ok and value_ok}


def evaluation_cases():
    pairs = [(1, 4), (2, 5), (3, 1), (4, 6), (5, 2), (6, 3), (2, 8), (7, 4), (9, 2), (-3, 7), (8, -5), (-4, -2)]
    # Explicitly authored candidate outputs; these are not model generations.
    output_a = ['{"sum":5}', '{"sum":7}', '{"sum":4}', '{"sum":10}', '{"sum":7}', '{"sum":9}',
                '{"sum":10}', '{"sum":11}', '11', '{"sum":10}', '{"sum":13}', '{"sum":6}']
    output_b = ['{"sum":5}', '{"sum":7}', '{"sum":4}', '{"sum":10}', '{"sum":7}', 'The sum is 9.',
                '{"sum":9}', '{"sum":10}', '{"sum":11}', '{"sum":4}', '{"sum":3}', '{"sum":"-6"}']
    rows = []
    for i, ((a, b), out_a, out_b) in enumerate(zip(pairs, output_a, output_b)):
        rows.append({'id': i + 1, 'group': 'nonnegative' if i < 9 else 'signed', 'inputs': [a, b],
                     'expected': a + b, 'output_a': out_a, 'output_b': out_b,
                     'a': grade_json_sum(out_a, a + b), 'b': grade_json_sum(out_b, a + b)})
    rates = {}
    for name in ['a', 'b']:
        grouped = {g: [row[name]['pass'] for row in rows if row['group'] == g] for g in ['nonnegative', 'signed']}
        rates[name] = {'groups': {g: {'passed': sum(v), 'total': len(v), 'rate': sum(v) / len(v)} for g, v in grouped.items()},
                       'passed': sum(row[name]['pass'] for row in rows), 'total': len(rows),
                       'micro': sum(row[name]['pass'] for row in rows) / len(rows),
                       'macro': sum(sum(v) / len(v) for v in grouped.values()) / len(grouped),
                       'format_passed': sum(row[name]['format'] for row in rows)}
    contingency = [[sum(int(row['a']['pass']) == a and int(row['b']['pass']) == b for row in rows) for b in [1, 0]] for a in [1, 0]]
    assert contingency == [[5, 3], [3, 1]]
    difference = sum(int(row['a']['pass']) - int(row['b']['pass']) for row in rows) / len(rows)
    sign_counts = {}
    for signs in itertools.product([-1, 1], repeat=6):
        total = sum(signs)
        sign_counts[total] = sign_counts.get(total, 0) + 1
    sign_distribution = [{'difference': total / 12, 'assignments': count, 'probability': count / 64} for total, count in sorted(sign_counts.items())]
    p_two_sided = sum(row['probability'] for row in sign_distribution if abs(row['difference']) >= abs(difference))
    ranks = [1, 3, None, 2]
    hit2 = sum(rank is not None and rank <= 2 for rank in ranks) / len(ranks)
    mrr = sum(Fraction(1, rank) if rank else Fraction(0) for rank in ranks) / len(ranks)
    k, n, c = 2, 6, 2
    all_subsets = list(itertools.combinations(range(n), k))
    pass_at_k = sum(any(i < c for i in subset) for subset in all_subsets) / len(all_subsets)
    assert pass_at_k == 1 - math.comb(n - c, k) / math.comb(n, k)
    judge = [{'item': 1, 'order_ab': 'A', 'order_ba': 'B'}, {'item': 2, 'order_ab': 'B', 'order_ba': 'B'},
             {'item': 3, 'order_ab': 'tie', 'order_ba': 'tie'}, {'item': 4, 'order_ab': 'A', 'order_ba': 'A'}]
    table = [[6, 2], [1, 3]]
    observed = Fraction(sum(table[i][i] for i in range(2)), 12)
    chance = sum(Fraction(sum(table[i]), 12) * Fraction(sum(row[i] for row in table), 12) for i in range(2))
    kappa = (observed - chance) / (1 - chance)
    assert kappa == Fraction(8, 17)
    latencies = [80, 100, 110, 120, 150, 180, 200, 240, 300, 900]
    quantiles = {str(p): latencies[math.ceil(p * len(latencies)) - 1] for p in [0.5, 0.9, 0.95]}
    assert quantiles == {'0.5': 150, '0.9': 300, '0.95': 900}
    assert not grade_json_sum('{"sum":true}', 1)['format']
    assert not grade_json_sum('{"sum":1,"extra":0}', 1)['format']
    assert not grade_json_sum('{"sum":1.0}', 1)['format']
    return {'fixture': rows, 'rates': rates, 'paired': {'contingency': contingency, 'difference': difference,
             'sign_distribution': sign_distribution, 'assignments': 64, 'two_sided_p': p_two_sided},
            'retrieval': {'first_relevant_ranks': ranks, 'hit_at_2': hit2, 'mrr': float(mrr)},
            'pass_at_k': {'n': n, 'c': c, 'k': k, 'subsets': len(all_subsets), 'value': pass_at_k},
            'judge_order': judge, 'agreement': {'table': table, 'observed': float(observed), 'chance': float(chance), 'kappa': float(kappa)},
            'latency': {'milliseconds': latencies, 'nearest_rank_quantiles': quantiles}}


if __name__ == '__main__':
    print(json.dumps({'instruction': instruction_cases(), 'evaluation': evaluation_cases()}, indent=2, ensure_ascii=False))
