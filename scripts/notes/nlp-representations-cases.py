"""Original small NLP cases authored for the Fedor Pakhurov project with Codex assistance.

No downloaded corpus, pretrained model or third-party implementation is used.
The explicit inputs and full-batch optimizers are teaching cases, not benchmarks.
Run with Python 3.9.7 to reproduce the recorded float-backed JSON byte for byte.
"""
import json
import math
import platform
from collections import Counter
from fractions import Fraction


def dot(a, b):
    assert len(a) == len(b)
    return sum(x * y for x, y in zip(a, b))


def cosine(a, b):
    norm = math.sqrt(dot(a, a) * dot(b, b))
    if norm == 0:
        raise ValueError('Cosine requires nonzero vectors')
    return dot(a, b) / norm


def sigmoid(x):
    return 1 / (1 + math.exp(-x))


def softplus(x):
    return max(x, 0) + math.log1p(math.exp(-abs(x)))


def finite_difference(fn, params, analytic, eps=1e-5):
    errors = []
    for i in range(len(params)):
        left, right = params[:], params[:]
        left[i] -= eps
        right[i] += eps
        estimate = (fn(right) - fn(left)) / (2 * eps)
        errors.append(abs(estimate - analytic[i]))
    assert max(errors) < 1e-8
    return max(errors)


def ngram_case():
    corpus = ['lamp is ready', 'lamp is charging', 'tripod is ready', 'lamp stays ready']
    vocabulary = ['lamp', 'tripod', 'is', 'stays', 'ready', 'charging', '</s>', '<unk>']
    counts = Counter()
    for line in corpus:
        sequence = ['<s>'] + line.split() + ['</s>']
        counts.update(zip(sequence, sequence[1:]))
    totals = Counter()
    for (context, word), count in counts.items():
        totals[context] += count

    def probability(word, context, alpha=Fraction(0)):
        if word not in vocabulary:
            word = '<unk>'
        if context != '<s>' and context not in vocabulary:
            context = '<unk>'
        denominator = totals[context] + alpha * len(vocabulary)
        if denominator == 0:
            raise ValueError('MLE is undefined for an unseen history')
        return Fraction(counts[context, word] + alpha, denominator)

    def sequence_probability(words, alpha=Fraction(0)):
        seq = ['<s>'] + words + ['</s>']
        return math.prod(probability(w, h, alpha) for h, w in zip(seq, seq[1:]))

    mle = sequence_probability(['lamp', 'is', 'ready'])
    unseen_mle = sequence_probability(['tripod', 'stays', 'ready'])
    smoothed = sequence_probability(['tripod', 'stays', 'ready'], Fraction(1, 2))
    assert mle == Fraction(1, 3) and unseen_mle == 0
    assert smoothed == Fraction(9, 3200)
    for h in ['<s>'] + vocabulary:
        assert sum(probability(w, h, Fraction(1, 2)) for w in vocabulary) == 1
    assert probability('new-object', 'new-context', Fraction(1, 2)) == Fraction(1, 8)
    assert probability('new-object', 'is', Fraction(1, 2)) == probability('<unk>', 'is', Fraction(1, 2))
    try:
        probability('ready', 'new-context')
    except ValueError:
        pass
    else:
        raise AssertionError('Unseen MLE history must be explicit')
    history, generated = '<s>', []
    for quantile in map(Fraction, ['0.6', '0.4', '0.5', '0.2']):
        cumulative = Fraction(0)
        for word in vocabulary:
            cumulative += probability(word, history)
            if quantile < cumulative:
                generated.append(word)
                history = word
                break
    assert generated == ['lamp', 'is', 'ready', '</s>']
    unigram = Counter()
    for (h, w), count in counts.items():
        unigram[w] += count
    mixed = {w: Fraction(3, 4) * probability(w, 'is') + Fraction(1, 4) * Fraction(unigram[w], sum(unigram.values())) for w in vocabulary}
    assert sum(mixed.values()) == 1
    return {'corpus': corpus, 'prediction_vocabulary': vocabulary,
            'bigram_counts': {h + ' -> ' + w: c for (h, w), c in sorted(counts.items())},
            'mle_probability': str(mle), 'mle_perplexity': float(mle) ** (-1 / 4),
            'unseen_mle_probability': str(unseen_mle),
            'smoothed_probability': str(smoothed), 'smoothed_perplexity': float(smoothed) ** (-1 / 4),
            'smoothed_after_is': {w: str(probability(w, 'is', Fraction(1, 2))) for w in vocabulary},
            'interpolated_after_is': {w: str(p) for w, p in mixed.items()},
            'generation_quantiles': ['0.6', '0.4', '0.5', '0.2'], 'generated': generated}


PAIR_COUNTS = [('lamp', 'charge', 4), ('lamp', 'inspect', 2),
               ('tripod', 'inspect', 3), ('tripod', 'adjust', 3),
               ('microphone', 'charge', 2), ('microphone', 'inspect', 1),
               ('microphone', 'adjust', 1)]
VOCABULARY = ['lamp', 'tripod', 'microphone', 'charge', 'inspect', 'adjust']


def cooccurrence():
    corpus = [a + ' ' + b for a, b, count in PAIR_COUNTS for _ in range(count)]
    index = {word: i for i, word in enumerate(VOCABULARY)}
    matrix = [[0 for _ in VOCABULARY] for _ in VOCABULARY]
    for line in corpus:
        left, right = map(index.get, line.split())
        matrix[left][right] += 1
        matrix[right][left] += 1
    assert len(corpus) == 16 and sum(map(sum, matrix)) == 32
    assert all(matrix[i][j] == matrix[j][i] for i in range(6) for j in range(6))
    assert sum(x > 0 for row in matrix for x in row) == 14
    return corpus, matrix


def embedding_case():
    corpus, matrix = cooccurrence()
    contexts = [row[3:] for row in matrix[:3]]
    assert contexts == [[4, 2, 0], [0, 3, 3], [2, 1, 1]]
    table = [[Fraction(1), Fraction(0)], [Fraction(0), Fraction(1)], [Fraction(3, 4), Fraction(1, 4)]]
    rotation = [[0, -1], [1, 0]]
    rotated = [[dot(row, axis) for axis in rotation] for row in table]
    for a in range(3):
        for b in range(3):
            assert dot(table[a], table[b]) == dot(rotated[a], rotated[b])
    first = [sum(row[j] for row in [table[0], table[1]]) / 2 for j in range(2)]
    second = [sum(row[j] for row in [table[1], table[0]]) / 2 for j in range(2)]
    assert first == second
    a, b = [1, 0, 4], [1, 0, -4]
    assert cosine(a[:2], b[:2]) == 1
    try:
        cosine([0, 0], [1, 0])
    except ValueError:
        pass
    else:
        raise AssertionError('A zero vector has no cosine direction')
    return {'pair_corpus': corpus, 'vocabulary': VOCABULARY, 'cooccurrence': matrix,
            'context_rows': contexts,
            'count_cosines': {'lamp_microphone': cosine(contexts[0], contexts[2]), 'lamp_tripod': cosine(contexts[0], contexts[1])},
            'hand_chosen_table': [[str(v) for v in row] for row in table],
            'rotated_table': [[str(v) for v in row] for row in rotated],
            'lookup_ids': [2, 0, 2], 'lookup_shape': [3, 2],
            'hypothetical_table': {'vocabulary': 12000, 'dimension': 48, 'parameters': 12000 * 48, 'float32_bytes': 12000 * 48 * 4},
            'order_collision_mean': [str(v) for v in first],
            'projection': {'a': a, 'b': b, 'full_cosine': cosine(a, b), 'projected_cosine': cosine(a[:2], b[:2])}}


def sampled_loss_gradient(params):
    center, outputs = params[:2], [params[2 + 2 * j:4 + 2 * j] for j in range(3)]
    loss = 0.0
    gradient = [0.0] * len(params)
    for target, label in [(0, 1), (1, 0), (1, 0), (2, 0)]:
        score = dot(center, outputs[target])
        loss += softplus(score) - label * score
        error = sigmoid(score) - label
        for k in range(2):
            gradient[k] += error * outputs[target][k]
            gradient[2 + 2 * target + k] += error * center[k]
    return loss, gradient


def expected_sgns(params, matrix, noise, negatives=2):
    size, dim = len(matrix), 2
    inputs = [params[2 * i:2 * i + 2] for i in range(size)]
    outputs = [params[2 * size + 2 * j:2 * size + 2 * j + 2] for j in range(size)]
    total = sum(map(sum, matrix))
    gradient = [0.0] * len(params)
    loss = 0.0
    for i in range(size):
        for j in range(size):
            score = dot(inputs[i], outputs[j])
            positive = matrix[i][j] / total
            negative = negatives * sum(matrix[i]) * noise[j] / total
            loss += positive * softplus(-score) + negative * softplus(score)
            error = (positive + negative) * sigmoid(score) - positive
            for k in range(dim):
                gradient[2 * i + k] += error * outputs[j][k]
                gradient[2 * size + 2 * j + k] += error * inputs[i][k]
    return loss, gradient


def word2vec_case():
    example = [0.5, -0.25, 0.2, 0.4, -0.3, 0.1, 0.6, -0.2]
    loss, gradient = sampled_loss_gradient(example)
    error = finite_difference(lambda p: sampled_loss_gradient(p)[0], example, gradient)
    scores = [dot(example[:2], example[2 + 2 * j:4 + 2 * j]) for j in range(3)]
    z = sum(math.exp(x) for x in scores)
    softmax = [math.exp(x) / z for x in scores]
    softmax_gradient = [0.0] * 8
    for j in range(3):
        delta = softmax[j] - (j == 0)
        for k in range(2):
            softmax_gradient[k] += delta * example[2 + 2 * j + k]
            softmax_gradient[2 + 2 * j + k] += delta * example[k]
    def softmax_loss(p):
        logits = [dot(p[:2], p[2 + 2 * j:4 + 2 * j]) for j in range(3)]
        return math.log(sum(math.exp(x) for x in logits)) - logits[0]
    softmax_error = finite_difference(softmax_loss, example, softmax_gradient)
    updated = [p - 0.1 * g for p, g in zip(example, gradient)]
    assert sampled_loss_gradient(updated)[0] < loss
    _, matrix = cooccurrence()
    masses = [sum(row) ** 0.75 for row in matrix]
    noise = [x / sum(masses) for x in masses]
    # Unequal nonzero initial values avoid a zero-gradient bilinear fixed point.
    params = [(((i * 7) % 17) - 8) / 20 for i in range(24)]
    initial, grad = expected_sgns(params, matrix, noise)
    expected_error = finite_difference(lambda p: expected_sgns(p, matrix, noise)[0], params, grad)
    checkpoints = {'0': initial}
    for step in range(1, 1201):
        _, grad = expected_sgns(params, matrix, noise)
        params = [p - 0.4 * g for p, g in zip(params, grad)]
        if step in [100, 400, 1200]:
            checkpoints[str(step)] = expected_sgns(params, matrix, noise)[0]
    final, grad = expected_sgns(params, matrix, noise)
    assert final < initial
    final_error = finite_difference(lambda p: expected_sgns(p, matrix, noise)[0], params, grad)
    return {'sampled': {'parameters': example, 'scores': scores, 'softmax_probabilities': softmax,
                        'softmax_loss': softmax_loss(example), 'softmax_gradient': softmax_gradient,
                        'softmax_gradient_max_error': softmax_error,
                        'loss': loss, 'gradient': gradient, 'parameters_after_step': updated,
                        'loss_after_step': sampled_loss_gradient(updated)[0], 'gradient_max_error': error},
            'expected_training': {'negative_count': 2, 'noise_probabilities': noise, 'steps': 1200,
                                  'learning_rate': 0.4, 'loss_checkpoints': checkpoints, 'parameters': params,
                                  'initial_gradient_max_error': expected_error, 'final_gradient_max_error': final_error},
            'scalar_optimum': {'positive_count': 4, 'center_count': 6, 'noise_probability': noise[3],
                               'score': math.log(4 / (2 * 6 * noise[3]))}}


def glove_loss_gradient(params, matrix):
    size, dim, xmax, power = len(matrix), 2, 4, 0.75
    inputs = [params[2 * i:2 * i + 2] for i in range(size)]
    outputs = [params[2 * size + 2 * j:2 * size + 2 * j + 2] for j in range(size)]
    bias, context_bias = params[4 * size:5 * size], params[5 * size:6 * size]
    nonzero = sum(x > 0 for row in matrix for x in row)
    gradient, loss = [0.0] * len(params), 0.0
    for i in range(size):
        for j in range(size):
            count = matrix[i][j]
            if count == 0:
                continue
            weight = min((count / xmax) ** power, 1.0)
            residual = dot(inputs[i], outputs[j]) + bias[i] + context_bias[j] - math.log(count)
            loss += weight * residual * residual / (2 * nonzero)
            factor = weight * residual / nonzero
            for k in range(dim):
                gradient[2 * i + k] += factor * outputs[j][k]
                gradient[2 * size + 2 * j + k] += factor * inputs[i][k]
            gradient[4 * size + i] += factor
            gradient[5 * size + j] += factor
    return loss, gradient


def glove_case():
    _, matrix = cooccurrence()
    params = [(((i * 11) % 19) - 9) / 30 for i in range(24)] + [0.0] * 12
    initial, gradient = glove_loss_gradient(params, matrix)
    initial_error = finite_difference(lambda p: glove_loss_gradient(p, matrix)[0], params, gradient)
    checkpoints = {'0': initial}
    for step in range(1, 801):
        _, gradient = glove_loss_gradient(params, matrix)
        params = [p - 0.3 * g for p, g in zip(params, gradient)]
        if step in [100, 400, 800]:
            checkpoints[str(step)] = glove_loss_gradient(params, matrix)[0]
    final, gradient = glove_loss_gradient(params, matrix)
    final_error = finite_difference(lambda p: glove_loss_gradient(p, matrix)[0], params, gradient)
    assert final < initial
    reconstructed = {}
    for i, row in enumerate(matrix):
        for j, count in enumerate(row):
            if count:
                reconstructed[VOCABULARY[i] + '/' + VOCABULARY[j]] = dot(params[2*i:2*i+2], params[12+2*j:14+2*j]) + params[24+i] + params[30+j]
    ratios = [Fraction(4, 6) / Fraction(2, 4), Fraction(2, 6) / Fraction(1, 4)]
    assert ratios == [Fraction(4, 3), Fraction(4, 3)]
    return {'count_matrix': matrix, 'nonzero_pairs': 14, 'xmax': 4, 'power': 0.75,
            'weights': {str(x): min((x / 4) ** 0.75, 1.0) for x in range(1, 5)},
            'lamp_microphone_ratios_charge_inspect': [str(v) for v in ratios],
            'steps': 800, 'learning_rate': 0.3, 'loss_checkpoints': checkpoints,
            'parameters': params, 'fitted_log_counts': reconstructed,
            'initial_gradient_max_error': initial_error, 'final_gradient_max_error': final_error}


def character_trigrams(word):
    if not isinstance(word, str) or not word or not word.isascii() or not word.isalpha():
        raise ValueError('This small fixture accepts nonempty ASCII alphabetic words')
    bounded = '<' + word + '>'
    return [bounded[i:i + 3] for i in range(len(bounded) - 2)]


def toy_bucket(text, buckets=7):
    return sum((i + 1) * ord(char) for i, char in enumerate(text)) % buckets


def subword_case():
    # Explicit invented vectors: no trained semantic meaning is claimed.
    buckets = [[Fraction(i - 3, 4), Fraction((2 * i) % 5 - 2, 4)] for i in range(7)]
    whole_words = {'lamp': [Fraction(1, 2), Fraction(-1, 4)]}
    words = ['lamp', 'lamps', 'clamp']
    output = {}
    for word in words:
        grams = character_trigrams(word)
        ids = [toy_bucket(g) for g in grams]
        components = [buckets[i] for i in ids]
        if word in whole_words:
            components.append(whole_words[word])
        summed = [sum(v[k] for v in components) for k in range(2)]
        mean = [v / len(components) for v in summed]
        output[word] = {'trigrams': grams, 'bucket_ids': ids, 'whole_word_row': word in whole_words,
                        'sum': [str(v) for v in summed], 'mean': [str(v) for v in mean]}
    assert character_trigrams('lamp') == ['<la', 'lam', 'amp', 'mp>']
    for invalid in ['', 'lamps2', 'лампа', None]:
        try:
            character_trigrams(invalid)
        except ValueError:
            pass
        else:
            raise AssertionError('The small ASCII input contract must be explicit')
    # Colliding occurrences remain repeated contributions; they are not deduplicated.
    repeated = character_trigrams('aaaa')
    assert repeated.count('aaa') == 2
    collision_groups = {}
    for gram in sorted(set(g for word in words for g in character_trigrams(word))):
        collision_groups.setdefault(str(toy_bucket(gram)), []).append(gram)
    collisions = {i: gs for i, gs in collision_groups.items() if len(gs) > 1}
    assert collisions
    # A separate, supplied two-label linear text-classifier calculation.
    embeddings = {'ready': [Fraction(1), Fraction(0)], 'repair': [Fraction(0), Fraction(1)],
                  'lamp': [Fraction(1, 2), Fraction(1, 2)]}
    classification = {}
    for phrase in ['lamp ready', 'ready lamp', 'lamp repair']:
        mean = [sum(embeddings[w][k] for w in phrase.split()) / 2 for k in range(2)]
        logits = [2 * mean[0], 2 * mean[1]]
        denominator = sum(math.exp(float(x)) for x in logits)
        classification[phrase] = {'mean': [str(v) for v in mean], 'logits': [str(v) for v in logits],
                                  'probabilities': [math.exp(float(x)) / denominator for x in logits]}
    assert classification['lamp ready'] == classification['ready lamp']
    # An independent local gradient check exposes collision multiplicity.
    parameters = [float(v) for row in buckets for v in row] + [0.5, -0.25]
    def component_loss(values):
        components = [values[2 * toy_bucket(g):2 * toy_bucket(g) + 2] for g in character_trigrams('lamp')]
        components.append(values[-2:])
        center = [sum(row[k] for row in components) for k in range(2)]
        return softplus(-dot(center, [0.25, -0.5]))
    delta = sigmoid(7 / 16) - 1
    gradient = [0.0] * len(parameters)
    for bucket in [0, 6, 0, 1, 7]:
        gradient[2 * bucket] += delta * 0.25
        gradient[2 * bucket + 1] += delta * -0.5
    gradient_error = finite_difference(component_loss, parameters, gradient)
    return {'hypothetical_table': {'words': 12000, 'buckets': 50000, 'dimension': 48,
                                    'parameters': 62000 * 48, 'float32_bytes': 62000 * 48 * 4},
            'collision_gradient': {'loss': component_loss(parameters), 'gradient': gradient, 'max_error': gradient_error},
            'bucket_count': 7, 'bucket_vectors': [[str(v) for v in row] for row in buckets],
            'word_vectors': output, 'collisions': collisions, 'repeated_trigrams': repeated,
            'classifier': classification}


def main():
    result = {'environment': {'python': platform.python_version(), 'dependencies': 'standard library only'},
              'ngram': ngram_case(), 'embeddings': embedding_case(), 'word2vec': word2vec_case(),
              'glove': glove_case(), 'fasttext': subword_case()}
    print(json.dumps(result, indent=2, ensure_ascii=False, allow_nan=False))


if __name__ == '__main__':
    main()
