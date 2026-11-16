"""Original small calculation for the Fedor Pakhurov project, with Codex assistance.
No third-party corpus, weights, code or model output. Python 3.9.7 saved replay.
"""
import json
import hashlib
import itertools
import math
import re
from fractions import Fraction
from html.parser import HTMLParser


class VisibleText(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []
        self.hidden = 0

    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style'):
            self.hidden += 1
        elif not self.hidden and tag in ('p', 'br', 'div', 'li'):
            self.parts.append(' ')

    def handle_endtag(self, tag):
        if tag in ('script', 'style') and self.hidden:
            self.hidden -= 1
        elif not self.hidden and tag in ('p', 'div', 'li'):
            self.parts.append(' ')

    def handle_data(self, data):
        if not self.hidden:
            self.parts.append(data)


def normalize_text(text):
    return ' '.join(re.findall(r'[a-z]+', text.casefold()))


def shingles(text, width=2):
    if not isinstance(width, int) or isinstance(width, bool) or width < 1:
        raise ValueError('width must be a positive integer')
    words = normalize_text(text).split()
    return {tuple(words[i:i + width]) for i in range(len(words) - width + 1)}


def jaccard(left, right):
    union = left | right
    return Fraction(len(left & right), len(union)) if union else Fraction(1)


def data_case():
    docs = {'d1': 'Keep the amber crate beside the gate.',
            'd2': 'KEEP  the amber crate beside the gate!',
            'd3': 'Keep the amber crate beside the wall.',
            'd4': 'Move the blue box beside the gate.',
            'd5': 'The lamp is stored inside bay seven.'}
    normalized = {key: normalize_text(value) for key, value in docs.items()}
    hashes = {key: hashlib.sha256(value.encode()).hexdigest() for key, value in normalized.items()}
    assert hashes['d1'] == hashes['d2'] and hashes['d1'] != hashes['d3']
    sets = {key: shingles(value) for key, value in docs.items()}
    union = sorted(sets['d1'] | sets['d3'])
    # Exhaustive permutations verify the ideal min-wise identity on this small universe.
    collisions = 0
    for perm in itertools.permutations(union):
        first_left = next(value for value in perm if value in sets['d1'])
        first_right = next(value for value in perm if value in sets['d3'])
        collisions += first_left == first_right
    total = math.factorial(len(union))
    assert Fraction(collisions, total) == jaccard(sets['d1'], sets['d3'])
    parser = VisibleText()
    parser.feed('<nav>Library</nav><p>Store <b>amber</b> crates.</p><script>secret()</script>')
    visible = ' '.join(''.join(parser.parts).split())
    eval_text = 'Where is the amber crate beside the wall?'
    match = sets['d3'] & shingles(eval_text)
    # Mixing probabilities refer to token draws, not uniformly sampled documents.
    counts = [80, 20]
    weights = [Fraction(1, 2), Fraction(1, 2)]
    exposures = [Fraction(200) * weight / count for weight, count in zip(weights, counts)]
    sizes = [4, 3, 5]
    return {'documents': docs, 'normalized': normalized, 'normalized_sha256': hashes,
            'bigram_sets': {key: sorted(value) for key, value in sets.items()},
            'd1_d3_jaccard': str(jaccard(sets['d1'], sets['d3'])),
            'ideal_minhash_collisions': collisions, 'ideal_minhash_permutations': total,
            'simple_visible_text': visible, 'evaluation_overlap_bigrams': sorted(match),
            'mixture_available_tokens': counts, 'mixture_training_tokens': 200,
            'mixture_token_weights': [str(value) for value in weights],
            'expected_exposures': [str(value) for value in exposures],
            'packed_document_lengths_including_eos': sizes, 'pack_width': 6,
            'raw_padded_slots': 3 * 5, 'concatenated_slots': sum(sizes),
            'separate_causal_pairs': sum(n * (n + 1) // 2 for n in sizes),
            'unrestricted_two_pack_pairs': 2 * (6 * 7 // 2)}


if __name__ == "__main__":
    print(json.dumps(data_case(), ensure_ascii=False, indent=2, sort_keys=True))
