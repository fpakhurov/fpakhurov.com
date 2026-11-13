"""Original fictional equipment-library cases, authored for the Fedor Pakhurov
project with Codex assistance. No downloaded text, models, or third-party code.
Run with Python 3.9+; stdout is the complete saved numerical evidence.
"""

import json
import math
import re
import unicodedata
from collections import Counter
from fractions import Fraction


def fraction_text(value):
    return str(Fraction(value))


def introduction():
    true_probabilities = [Fraction(4, 5), Fraction(1, 2), Fraction(1, 4), Fraction(9, 10)]
    product = math.prod(true_probabilities)
    loss = -sum(math.log(float(p)) for p in true_probabilities) / 4
    assert product == Fraction(9, 100)
    assert math.isclose(math.exp(loss), (100 / 9) ** 0.25)
    texts = ["return lamp", "return tripod", "reserve lamp", "reserve microphone"]
    counts = Counter(word for text in texts for word in text.split())
    assert sum(counts.values()) == 8 and len(counts) == 5
    order_a = "Верните сначала лампу, потом штатив"
    order_b = "Верните сначала штатив, потом лампу"
    assert Counter(re.findall(r"\w+", order_a.casefold())) == Counter(re.findall(r"\w+", order_b.casefold()))
    return {"true_probabilities": list(map(fraction_text, true_probabilities)),
            "joint_probability": fraction_text(product), "mean_nll": loss,
            "perplexity": math.exp(loss), "invented_messages": texts,
            "word_counts": dict(sorted(counts.items())),
            "tokens": sum(counts.values()), "types": len(counts)}


def text_data():
    composed = "réglage L7"
    decomposed = "re\u0301glage L7"
    normalized = unicodedata.normalize("NFC", decomposed)
    assert normalized == composed and decomposed != composed
    assert unicodedata.normalize("NFC", normalized) == normalized
    raw = "lamp  Ｌ7: not ready!"
    standardized = unicodedata.normalize("NFKC", raw).casefold()
    matches = [(m.group(), m.start(), m.end()) for m in re.finditer(r"\w+|[^\w\s]", standardized)]
    assert all(standardized[a:b] == word for word, a, b in matches)
    # Offsets address the normalized string; this fixture does not claim raw alignment.
    removed_not = " ".join(w for w, _, _ in matches if w not in {"not", ":", "!"})
    assert removed_not == "lamp l7 ready"
    labels = ["Lamp", "lamp", "Ｌamp", "lamp!", "lamps"]
    stages = [labels, [unicodedata.normalize("NFKC", s) for s in labels]]
    stages.append([s.casefold() for s in stages[-1]])
    stages.append([re.sub(r"[^\w\s]", "", s) for s in stages[-1]])
    assert [len(set(stage)) for stage in stages] == [5, 4, 3, 2]
    return {"unicode_database": unicodedata.unidata_version,
            "composed": {"text": composed, "code_points": len(composed), "utf8_bytes": len(composed.encode())},
            "decomposed": {"text": decomposed, "code_points": len(decomposed), "utf8_bytes": len(decomposed.encode())},
            "nfc_equal": normalized == composed, "raw": raw, "normalized": standardized,
            "normalized_offsets": matches, "destructive_stopword_result": removed_not,
            "type_counts_by_stage": [len(set(stage)) for stage in stages]}


def replace_pair(sequence, pair):
    result = []
    position = 0
    while position < len(sequence):
        if tuple(sequence[position:position + 2]) == pair:
            result.append("".join(pair))
            position += 2
        else:
            result.append(sequence[position])
            position += 1
    return result


def train_bpe(frequencies, steps):
    if not frequencies or any(not isinstance(word, str) or not word or isinstance(count, bool)
                              or not isinstance(count, int) or count <= 0
                              for word, count in frequencies.items()):
        raise ValueError("Expected nonempty words with positive integer counts")
    sequences = {word: list(word) for word in frequencies}
    merges, trace = [], []
    for _ in range(steps):
        counts = Counter()
        for word, sequence in sequences.items():
            for pair in zip(sequence, sequence[1:]):
                counts[pair] += frequencies[word]
        if not counts:
            break
        chosen = min(counts, key=lambda pair: (-counts[pair], pair))
        before = sum(len(seq) * frequencies[word] for word, seq in sequences.items())
        sequences = {word: replace_pair(seq, chosen) for word, seq in sequences.items()}
        after = sum(len(seq) * frequencies[word] for word, seq in sequences.items())
        merges.append(chosen)
        trace.append({"pair": chosen, "adjacent_count": counts[chosen],
                      "tokens_before": before, "tokens_after": after})
        assert all("".join(seq) == word for word, seq in sequences.items())
    return merges, trace, sequences


def encode_bpe(word, merges, alphabet):
    if any(character not in alphabet for character in word):
        raise ValueError("Character outside this toy alphabet")
    sequence = list(word)
    for pair in merges:
        sequence = replace_pair(sequence, pair)
    assert "".join(sequence) == word
    return sequence


def tokenization():
    frequencies = {"lamp": 4, "lamps": 2, "clamp": 1, "camp": 2}
    merges, trace, sequences = train_bpe(frequencies, 4)
    alphabet = set("".join(frequencies))
    assert merges == [("a", "m"), ("am", "p"), ("l", "amp"), ("c", "amp")]
    assert [row["tokens_after"] for row in trace] == [30, 21, 14, 12]
    unseen = encode_bpe("clamps", merges, alphabet)
    assert unseen == ["c", "lamp", "s"]
    # The deterministic tie policy is part of the fitted tokenizer.
    assert train_bpe(dict(reversed(list(frequencies.items()))), 4) == (merges, trace, sequences)
    _, overlap, _ = train_bpe({"aaa": 1}, 1)
    assert overlap[0]["adjacent_count"] == 2 and overlap[0]["tokens_before"] - overlap[0]["tokens_after"] == 1
    try:
        encode_bpe("lampz", merges, alphabet)
    except ValueError:
        pass
    else:
        raise AssertionError("Unknown characters must not disappear")
    lengths = [2, 5, 3]
    padded = len(lengths) * max(lengths)
    real = sum(lengths)
    vocabulary = {"lamp", "cl", "##amp", "##s"}
    def wordpiece(word):
        parts, start = [], 0
        while start < len(word):
            candidates = [(end, word[start:end] if start == 0 else "##" + word[start:end])
                          for end in range(start + 1, len(word) + 1)]
            candidates = [(end, piece) for end, piece in candidates if piece in vocabulary]
            if not candidates:
                return ["[UNK]"]
            end, piece = max(candidates)
            parts.append(piece)
            start = end
        return parts
    assert wordpiece("clamps") == ["cl", "##amp", "##s"]
    assert wordpiece("lampz") == ["[UNK]"]
    return {"frequencies": frequencies, "initial_alphabet": sorted(alphabet),
            "initial_tokens": 39, "trace": trace, "final_sequences": sequences,
            "unseen_clamps": unseen, "overlapping_pair_trace": overlap,
            "wordpiece_vocabulary": sorted(vocabulary),
            "wordpiece_clamps": wordpiece("clamps"), "wordpiece_lampz": wordpiece("lampz"),
            "padding": {"lengths": lengths, "allocated_positions": padded,
                        "real_positions": real, "wasted_positions": padded - real}}


TICKETS = [
    ("lamp broken after pickup", 1),
    ("tripod broken at hinge", 1),
    ("microphone broken cable", 1),
    ("lamp sparks at switch", 1),
    ("replace broken carrying case", 0),
    ("is a broken seal acceptable", 0),
    ("extend the tripod booking", 0),
    ("return microphone tomorrow", 0),
    ("where is the pickup desk", 0),
    ("reserve a spare lamp", 0),
    ("change my collection time", 0),
    ("confirm the return receipt", 0),
]


def confusion(truth, predictions):
    if len(truth) != len(predictions) or not truth:
        raise ValueError("Aligned nonempty vectors required")
    if any(value not in (0, 1) for value in [*truth, *predictions]):
        raise ValueError("Binary labels required")
    tp = sum(y == 1 and p == 1 for y, p in zip(truth, predictions))
    fp = sum(y == 0 and p == 1 for y, p in zip(truth, predictions))
    fn = sum(y == 1 and p == 0 for y, p in zip(truth, predictions))
    tn = sum(y == 0 and p == 0 for y, p in zip(truth, predictions))
    return tp, fp, fn, tn


def evaluation():
    truth = [label for _, label in TICKETS]
    predictions = [int("broken" in text.split()) for text, _ in TICKETS]
    tp, fp, fn, tn = confusion(truth, predictions)
    assert (tp, fp, fn, tn) == (3, 2, 1, 6)
    accuracy = Fraction(tp + tn, len(truth))
    precision, recall = Fraction(tp, tp + fp), Fraction(tp, tp + fn)
    f1 = Fraction(2 * tp, 2 * tp + fp + fn)
    f1_negative = Fraction(2 * tn, 2 * tn + fp + fn)
    # Artificial replicas share each underlying issue. The split policies are fixed here.
    pairs = [(group, copy) for group in range(6) for copy in range(2)]
    row_train = [i for i, (_, copy) in enumerate(pairs) if copy == 0]
    row_test = [i for i, (_, copy) in enumerate(pairs) if copy == 1]
    group_train = [i for i, (group, _) in enumerate(pairs) if group < 4]
    group_test = [i for i, (group, _) in enumerate(pairs) if group >= 4]
    def overlap(train, test):
        return sorted({pairs[i][0] for i in train} & {pairs[i][0] for i in test})
    assert overlap(row_train, row_test) == list(range(6))
    assert overlap(group_train, group_test) == []
    gold_spans = {(0, 4, "ITEM"), (14, 20, "DATE")}
    predicted_spans = {(0, 4, "ITEM"), (15, 20, "DATE")}
    correct_spans = len(gold_spans & predicted_spans)
    span_f1 = Fraction(2 * correct_spans, len(gold_spans) + len(predicted_spans))
    assert span_f1 == Fraction(1, 2)
    return {"tickets": [{"text": text, "gold_inspection": label, "rule_prediction": pred}
                         for (text, label), pred in zip(TICKETS, predictions)],
            "confusion": {"tp": tp, "fp": fp, "fn": fn, "tn": tn},
            "accuracy": fraction_text(accuracy), "precision": fraction_text(precision),
            "recall": fraction_text(recall), "f1": fraction_text(f1),
            "negative_f1": fraction_text(f1_negative), "macro_f1": fraction_text((f1 + f1_negative) / 2),
            "always_no_inspection_accuracy": fraction_text(Fraction(8, 12)),
            "row_split_shared_groups": overlap(row_train, row_test),
            "group_split_shared_groups": overlap(group_train, group_test),
            "strict_span_f1": fraction_text(span_f1)}


def bag_of_words():
    documents = ["desk lamp lamp pickup", "desk lamp return", "desk tripod return", "desk tripod tripod pickup"]
    vocabulary = sorted({word for document in documents for word in document.split()})
    counts = [[document.split().count(word) for word in vocabulary] for document in documents]
    df = [sum(row[column] > 0 for row in counts) for column in range(len(vocabulary))]
    idf = [1 + math.log((1 + len(documents)) / (1 + frequency)) for frequency in df]
    raw = [[count * weight for count, weight in zip(row, idf)] for row in counts]
    def normalized(row):
        norm = math.sqrt(sum(value * value for value in row))
        return [value / norm for value in row] if norm else [0.0] * len(row)
    vectors = [normalized(row) for row in raw]
    query = "lamp pickup"
    query_counts = [query.split().count(word) for word in vocabulary]
    query_vector = normalized([count * weight for count, weight in zip(query_counts, idf)])
    cosine = [sum(a * b for a, b in zip(row, query_vector)) for row in vectors]
    order = sorted(range(4), key=lambda index: (-cosine[index], index))
    assert vocabulary == ["desk", "lamp", "pickup", "return", "tripod"]
    assert df == [4, 2, 2, 2, 2]
    assert order == [0, 1, 3, 2]
    doubled = normalized([2 * value for value in raw[0]])
    assert all(math.isclose(a, b) for a, b in zip(doubled, vectors[0]))
    permutation_a = Counter("lamp before tripod".split())
    permutation_b = Counter("tripod before lamp".split())
    assert permutation_a == permutation_b
    unknown = ["calendar".split().count(word) for word in vocabulary]
    assert normalized(unknown) == [0.0] * len(vocabulary)
    # A hand-specified linear score illustrates inference, not fitted performance.
    coefficients = [0, 0, -1, 2, 0]
    logits = [-0.5 + sum(x * w for x, w in zip(row, coefficients)) for row in counts]
    labels = [0, 1, 1, 0]
    def objective(parameters):
        value = 0.0
        for row, label in zip(vectors, labels):
            z = parameters[0] + sum(a * b for a, b in zip(row, parameters[1:]))
            value += math.log1p(math.exp(z)) - label * z
        return value / len(labels) + 0.1 * sum(w * w for w in parameters[1:]) / 2
    def gradient(parameters):
        result = [0.0] + [0.1 * w for w in parameters[1:]]
        for row, label in zip(vectors, labels):
            z = parameters[0] + sum(a * b for a, b in zip(row, parameters[1:]))
            error = 1 / (1 + math.exp(-z)) - label
            for j, value in enumerate([1.0, *row]):
                result[j] += error * value / len(labels)
        return result
    parameters = [0.0] * (len(vocabulary) + 1)
    start_objective = objective(parameters)
    for _ in range(400):
        parameters = [w - 0.2 * g for w, g in zip(parameters, gradient(parameters))]
    epsilon = 1e-5
    for j, analytic in enumerate(gradient(parameters)):
        plus, minus = parameters.copy(), parameters.copy()
        plus[j] += epsilon
        minus[j] -= epsilon
        numerical = (objective(plus) - objective(minus)) / (2 * epsilon)
        assert math.isclose(numerical, analytic, abs_tol=1e-9)
    probabilities = [1 / (1 + math.exp(-(parameters[0] + sum(a * b for a, b in zip(row, parameters[1:])))))
                     for row in vectors]
    assert objective(parameters) < start_objective
    assert [int(p >= 0.5) for p in probabilities] == labels
    return {"documents": documents, "vocabulary": vocabulary, "counts": counts,
            "document_frequencies": df, "idf": idf, "tfidf_raw": raw,
            "tfidf_l2": vectors, "query": query, "query_l2": query_vector,
            "cosines": cosine, "ranked_document_ids": [index + 1 for index in order],
            "hand_set_logits": logits, "zero_vector_unknown_query": normalized(unknown),
            "nonzero_count": sum(value != 0 for row in counts for value in row),
            "training_only_logistic": {"labels": labels, "steps": 400, "learning_rate": 0.2,
                                       "l2": 0.1, "initial_objective": start_objective,
                                       "final_objective": objective(parameters),
                                       "bias_and_weights": parameters, "training_probabilities": probabilities}}


def main():
    result = {"authorship": "Fictional inputs and stdlib calculations authored for the Fedor Pakhurov project with Codex assistance.",
              "introduction": introduction(), "text_data": text_data(),
              "tokenization": tokenization(), "evaluation": evaluation(), "bag_of_words": bag_of_words()}
    print(json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
