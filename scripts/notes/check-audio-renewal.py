#!/usr/bin/env python3
"""Scoped audio-note checks, authored for this project with Codex assistance.

Needs NumPy for the note's local synthetic k-means experiment. No downloads.
Default replays saved calculations; --write explicitly replaces the result file.
"""
import ast
import contextlib
from fractions import Fraction
import hashlib
import importlib.util
import io
import itertools
import json
import math
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[2]
DEST = ROOT / 'docs/reports/2026-11-13-licensed-example-renewal/audio-numerical-checks.json'

def rounded(value):
    if isinstance(value, float):
        return round(value, 12)
    if isinstance(value, dict):
        return {k: rounded(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [rounded(v) for v in value]
    return value

def calculate():
    # Exhaust every possible nonempty contiguous three-phoneme alignment.
    means = [Fraction(0), Fraction(2), Fraction(4)]
    frames = list(map(Fraction, ['-.2', '.3', '2.4', '.9', '3.7', '4.1']))
    candidates = []
    for b1, b2 in itertools.combinations(range(1, 6), 2):
        a = [0] * b1 + [1] * (b2-b1) + [2] * (6-b2)
        cost = sum((v-means[k])**2 for v, k in zip(frames, a))
        candidates.append((cost, a))
    cost, alignment = min(candidates)
    assert cost == Fraction(8, 5) and alignment == [0, 0, 1, 1, 2, 2]
    nearest = [min(range(3), key=lambda k: abs(x-means[k])) for x in frames]
    unconstrained = sum((x-means[k])**2 for x, k in zip(frames, nearest))
    assert unconstrained == Fraction(6, 5)
    p0, pc = [.5, .3, .2], [.2, .3, .5]
    weights = [c**3 / u**2 for u, c in zip(p0, pc)]
    guided = [w/sum(weights) for w in weights]
    entropy = lambda p: -sum(x*math.log2(x) for x in p if x)
    # Guidance need not reduce entropy: (.8,.2)^2 / (16/17,1/17) is uniform.
    entropy_counterexample = [.8**2/(16/17), .2**2/(1/17)]
    assert abs(entropy_counterexample[0] - entropy_counterexample[1]) < 1e-12
    codes = [[(3*t+2*k) % 7 for k in range(3)] for t in range(5)]
    schedule = [[None]*3 for _ in range(7)]
    for t in range(5):
        for k in range(3):
            schedule[t+k][k] = codes[t][k]
    assert [[schedule[t+k][k] for k in range(3)] for t in range(5)] == codes
    assert [schedule[2+k][k] for k in range(3)] == [6, 1, 3]
    # Teacher-forcing prediction sees precisely earlier pattern steps.
    for t in range(5):
        for k in range(3):
            assert all(t+j < t+k for j in range(k))
    bodies = [(ROOT/'src/content'/loc/'generative-models/audio-generation.mdx').read_text()
              for loc in ['notes', 'notes-ru']]
    blocks = [re.findall(r'```python\n([\s\S]*?)```', b) for b in bodies]
    assert len(blocks[0]) == len(blocks[1]) == 1
    assert ast.dump(ast.parse(blocks[0][0])) == ast.dump(ast.parse(blocks[1][0]))
    out = io.StringIO()
    namespace = {}
    with contextlib.redirect_stdout(out):
        exec(compile(blocks[0][0], 'audio-generation-inline.py', 'exec'), namespace)
    assert namespace['A'] == [1, 1, 2, 2, 3, 3]
    assert math.isclose(float(namespace['C'][-1, -1]), float(cost), abs_tol=1e-12)
    assert math.isclose(float(namespace['R']), 2200)
    assert math.isclose(float(namespace['prod'][namespace['joint'] == 0].sum()), .5)
    # Import the already published optional practice without creating bytecode.
    sys.dont_write_bytecode = True
    spec = importlib.util.spec_from_file_location('generative_practice', ROOT/'scripts/notes/generative-practice.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    practice = module.audio_generation()
    saved_practice = json.loads((ROOT/'docs/reports/2026-11-13-licensed-example-renewal/generative-practice-results.json').read_text())
    # The shared file records per-topic entries under experiments.
    entries = saved_practice['experiments']
    if isinstance(entries, list):
        entry = next(x for x in entries if x.get('topic') == 'audio-generation')
    else:
        entry = entries['audio-generation']
    assert rounded(practice) == rounded(entry)
    return rounded({
        'origin': 'Project-specified scalar inputs, local seeded synthetic clouds and fixed sinusoidal practice; no external data/model',
        'signal': {'unpadded_frames': 1+(22050-1024)//256, 'frame_rate': 22050/256,
                   'mel_1000': 2595*math.log10(1+1000/700), 'mel_nyquist': 2595*math.log10(1+11025/700),
                   'mel_values_per_second': 80*22050/256},
        'alignment': {'enumerated': len(candidates), 'minimum_cost': str(cost),
                      'best_alignment': [i+1 for i in alignment], 'unconstrained_cost': str(unconstrained),
                      'prior_log_likelihood': -3*math.log(2*math.pi)-float(cost)/2,
                      'large_alignment_count': math.comb(429, 49)},
        'fictional_codec': {'frames_per_second': 60, 'stages': 5, 'entries': 16, 'bits_per_frame': 20,
                            'bits_per_second': 1200, 'joint_book_vectors': 2**20, 'stored_rvq_vectors': 80},
        'guidance': {'weights': weights, 'probabilities': guided, 'conditional_entropy_bits': entropy(pc),
                     'guided_entropy_bits': entropy(guided), 'entropy_increase_counterexample':
                     {'conditional': [.8, .2], 'unconditional': [16/17, 1/17], 'scale': 2,
                      'guided': [.5, .5]}},
        'patterns': {'tokens': codes, 'schedule': schedule, 'flatten': 15, 'parallel': 5, 'coarse_first': 10, 'delay': 7},
        'parallel_counterexample': {'invalid_pair_probability': .5, 'total_correlation_bits': 1},
        'inline_python_sha256': hashlib.sha256(blocks[0][0].encode()).hexdigest(),
        'inline_stdout': out.getvalue(), 'synthetic_practice': practice,
    })

if __name__ == '__main__':
    result = calculate()
    if '--write' in sys.argv:
        DEST.write_text(json.dumps(result, indent=2, ensure_ascii=False)+'\n')
    else:
        assert result == json.loads(DEST.read_text()), 'Saved audio results differ'
    import numpy as np
    print('Audio checks passed: exact alignment enumeration, local synthetic NumPy experiment, guidance, schedules and optional practice.')
    print('Python '+sys.version.split()[0]+'; NumPy '+np.__version__)
