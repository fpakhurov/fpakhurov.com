"""Original GPT mechanism cases for the Fedor Pakhurov project, with Codex assistance."""
import json
import math
from collections import Counter, defaultdict

def softmax(values):
    peak = max(values)
    weights = [math.exp(value - peak) for value in values]
    total = sum(weights)
    return [value / total for value in weights]

def causal_attention(rows):
    result = []
    for i, query in enumerate(rows):
        scores = [sum(a * b for a, b in zip(query, key)) / math.sqrt(2)
                  for key in rows[:i + 1]]
        weights = softmax(scores)
        result.append([sum(weight * row[j] for weight, row in zip(weights, rows))
                       for j in range(2)])
    return result

def gpt_case():
    commands = [('amber', 'box', 'moves'), ('blue', 'box', 'waits'),
                ('amber', 'box', 'waits')]
    counts = defaultdict(Counter)
    pairs = []
    for command in commands:
        tokens = ('BOS',) + command + ('EOS',)
        for previous, target in zip(tokens, tokens[1:]):
            counts[previous][target] += 1
            pairs.append((previous, target))
    total_loss = -sum(math.log(counts[h][y] / sum(counts[h].values())) for h, y in pairs)
    logits = [math.log(value) for value in [4, 2, 1, 1]]
    base, sharp = softmax(logits), softmax([value / .5 for value in logits])
    nucleus = []
    for index in sorted(range(4), key=lambda j: (-base[j], j)):
        nucleus.append(index)
        if sum(base[j] for j in nucleus) >= .7:
            break
    retained = sum(base[j] for j in nucleus)
    nucleus_prob = [base[j] / retained if j in nucleus else 0 for j in range(4)]
    rows = [[1., 0.], [0., 2.], [1., 1.]]
    original = causal_attention(rows)
    changed = causal_attention(rows[:2] + [[-3., 4.]])
    assert original[:2] == changed[:2]
    cached_keys, cached_values = rows[:2], rows[:2]
    weights = softmax([sum(a * b for a, b in zip(rows[2], key)) / math.sqrt(2)
                       for key in cached_keys + [rows[2]]])
    cached_last = [sum(w * value[j] for w, value in zip(weights, cached_values + [rows[2]]))
                   for j in range(2)]
    assert cached_last == original[-1]
    sizes = []
    for d, m in [(4, 9), (6, 12)]:
        sizes.append(11 * d + 8 * d + 2 * (4 * d * d + 2 * d * m + 9 * d + m) + 2 * d)
    return {'commands': commands, 'pair_count': len(pairs), 'counts': dict(counts),
            'mean_mle_nll': total_loss / len(pairs), 'perplexity': math.exp(total_loss / len(pairs)),
            'base_probabilities': base, 'temperature_half': sharp, 'nucleus_07': nucleus_prob,
            'causal_states': original, 'changed_last_state': changed[-1], 'cached_last': cached_last,
            'hypothetical_parameter_counts': sizes, 'standard_kv_bytes': 2 * 2 * 8 * 4 * 2}

if __name__ == "__main__":
    print(json.dumps(gpt_case(), ensure_ascii=False, indent=2, sort_keys=True))
