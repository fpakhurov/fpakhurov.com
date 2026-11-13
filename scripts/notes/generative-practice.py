#!/usr/bin/env python3
"""Original small generative-model experiments for Fedor Pakhurov's notes.

Authored with Codex assistance in November 2026. All observations, feature fields
and token sequences below are generated here. No datasets, pretrained weights,
third-party example implementations or recorded source results are loaded.
Run without arguments for all results, or pass one experiment name.
These are mechanism checks, not implementations or benchmarks of the full models.
"""

import argparse
import itertools
import json
import math
import random
import statistics


def normal_log_density(x, mean=0.0, variance=1.0):
    return -0.5 * (math.log(2 * math.pi * variance) + (x - mean) ** 2 / variance)


def wgan():
    rng = random.Random(9301)
    model = sorted(rng.uniform(-1.4, 0.9) for _ in range(129))
    shift, penalty_weight = 0.65, 4.0
    data = [x + shift for x in model]
    transport = statistics.mean(abs(x - y) for x, y in zip(data, model))
    gaps = {str(slope): statistics.mean(slope * x for x in data)
            - statistics.mean(slope * x for x in model) for slope in (1, 3, 9)}
    # For this linear critic and positive shift, the soft-penalty optimum is exact.
    slope = 1 + shift / (2 * penalty_weight)
    raw_gap = slope * shift
    penalty = penalty_weight * (slope - 1) ** 2
    assert abs(transport - shift) < 1e-12
    assert gaps['9'] > gaps['3'] > gaps['1']
    assert abs(shift - 2 * penalty_weight * (slope - 1)) < 1e-12
    return {'sample_count': len(model), 'translation': shift,
            'empirical_w1': transport, 'unconstrained_linear_gaps': gaps,
            'one_lipschitz_optimal_slope': 1, 'gradient_penalty_weight': penalty_weight,
            'penalized_optimal_slope': slope, 'penalized_raw_gap': raw_gap,
            'penalty': penalty, 'penalized_objective': raw_gap - penalty}


def vae():
    observations = [-1.3, -0.2, 0.7, 1.8]
    weight, noise_variance = 1.4, 0.36
    variance_x = weight ** 2 + noise_variance
    posterior_variance = noise_variance / variance_x
    posterior_scale = weight / variance_x
    rows = []
    for x in observations:
        mean_q, variance_q = 0.5 * x, 0.4
        reconstruction = -0.5 * (math.log(2 * math.pi * noise_variance)
                          + ((x - weight * mean_q) ** 2 + weight ** 2 * variance_q)
                          / noise_variance)
        kl_prior = 0.5 * (mean_q ** 2 + variance_q - 1 - math.log(variance_q))
        elbo = reconstruction - kl_prior
        log_px = normal_log_density(x, variance=variance_x)
        posterior_kl = 0.5 * ((variance_q + (mean_q - posterior_scale * x) ** 2)
                             / posterior_variance - 1
                             + math.log(posterior_variance / variance_q))
        assert abs(log_px - elbo - posterior_kl) < 1e-12
        rows.append({'x': x, 'reconstruction': reconstruction, 'kl_prior': kl_prior,
                     'elbo': elbo, 'log_likelihood': log_px, 'gap': posterior_kl})
    # Reparameterized samples independently check the reconstruction expectation.
    rng = random.Random(9302)
    x, mean_q, variance_q = 0.7, 0.35, 0.4
    monte_carlo = statistics.mean(normal_log_density(x, weight * (mean_q + math.sqrt(variance_q)
                                   * rng.gauss(0, 1)), noise_variance) for _ in range(40000))
    expected = rows[2]['reconstruction']
    assert abs(monte_carlo - expected) < 0.025
    return {'decoder_weight': weight, 'decoder_noise_variance': noise_variance,
            'posterior_mean_scale': posterior_scale, 'posterior_variance': posterior_variance,
            'mean_elbo': statistics.mean(r['elbo'] for r in rows),
            'mean_log_likelihood': statistics.mean(r['log_likelihood'] for r in rows),
            'mean_gap': statistics.mean(r['gap'] for r in rows),
            'reparameterized_mc_reconstruction': monte_carlo,
            'exact_reconstruction_at_x_0_7': expected, 'observations': rows}


def stargan():
    # The first two coordinates encode content. The last encodes domain and style.
    content = [(-0.8, 0.3), (0.2, -0.6), (0.7, 0.9)]
    offsets = {0: -2.0, 1: 2.0}
    originals = [(a, b, offsets[0] + 0.15) for a, b in content]

    def translate(x, target, style):
        return (x[0], x[1], offsets[target] + style)

    translated = [translate(x, 1, -0.25) for x in originals]
    restored = [translate(x, 0, 0.15) for x in translated]
    content_error = max(abs(y[i] - x[i]) for x, y in zip(originals, translated) for i in (0, 1))
    cycle_error = max(abs(y[i] - x[i]) for x, y in zip(originals, restored) for i in range(3))
    target_accuracy = statistics.mean(int(y[2] > 0) for y in translated)
    identity_accuracy = statistics.mean(int(x[2] > 0) for x in originals)
    a, b = translate(originals[0], 1, -0.4), translate(originals[0], 1, 0.4)
    diversity = abs(a[2] - b[2])
    assert content_error == cycle_error == 0 and target_accuracy == 1
    assert identity_accuracy == 0 and abs(diversity - 0.8) < 1e-12
    return {'content_points': len(content), 'content_error': content_error,
            'cycle_error': cycle_error, 'target_domain_accuracy': target_accuracy,
            'identity_cycle_error': 0, 'identity_target_domain_accuracy': identity_accuracy,
            'style_separation': diversity, 'style_ignoring_separation': 0,
            'scope': 'Analytic translation diagnostics; no adversarial network is trained.'}


def normalizing_flows():
    rng = random.Random(9303)
    data = [0.45 + 1.6 * rng.gauss(0, 1) for _ in range(4096)]
    mean = statistics.mean(data)
    scale = math.sqrt(statistics.mean((x - mean) ** 2 for x in data))

    def nll(s, include_jacobian):
        return -statistics.mean(normal_log_density((x - mean) / s)
                                - (math.log(s) if include_jacobian else 0) for x in data)

    fitted, doubled = nll(scale, True), nll(2 * scale, True)
    naive, naive_doubled = nll(scale, False), nll(2 * scale, False)
    assert fitted < doubled and naive_doubled < naive
    # Integrate over the same transformed z range; the wrong density has mass s.
    steps, bound = 16000, 8.0
    dx = 2 * bound * scale / steps
    mass = 0.0
    for i in range(steps + 1):
        x = mean - bound * scale + i * dx
        value = math.exp(normal_log_density((x - mean) / scale))
        mass += (0.5 if i in (0, steps) else 1) * value * dx
    assert abs(mass / scale - 1) < 1e-10
    return {'sample_count': len(data), 'fitted_mean': mean, 'fitted_scale': scale,
            'correct_nll': fitted, 'correct_nll_at_double_scale': doubled,
            'omitted_jacobian_nll': naive, 'omitted_jacobian_nll_at_double_scale': naive_doubled,
            'integrated_correct_mass': mass / scale, 'integrated_wrong_mass': mass}


def flow_architectures():
    def forward(z):
        a, b = z
        coupled = math.exp(0.3 * a) * b + 0.2 * a * a
        # Swap coordinates, then a nonsingular diagonal scale and translation.
        return (1.3 * coupled - 0.4, 0.7 * a + 0.2)

    def inverse(x):
        a = (x[1] - 0.2) / 0.7
        b = ((x[0] + 0.4) / 1.3 - 0.2 * a * a) * math.exp(-0.3 * a)
        return a, b

    points = [(-0.7, 0.4), (0.1, -1.1), (0.8, 0.6)]
    inverse_error, determinant_error = 0.0, 0.0
    density_rows = []
    h = 1e-5
    for z in points:
        x = forward(z)
        inverse_error = max(inverse_error, *(abs(a - b) for a, b in zip(z, inverse(x))))
        columns = []
        for axis in range(2):
            plus, minus = list(z), list(z)
            plus[axis] += h
            minus[axis] -= h
            columns.append([(a - b) / (2 * h) for a, b in zip(forward(plus), forward(minus))])
        determinant = columns[0][0] * columns[1][1] - columns[1][0] * columns[0][1]
        expected_logdet = math.log(1.3 * 0.7) + 0.3 * z[0]
        determinant_error = max(determinant_error, abs(math.log(abs(determinant)) - expected_logdet))
        density_rows.append({'z': z, 'x': x, 'log_abs_det': expected_logdet,
                             'log_density': sum(normal_log_density(v) for v in z) - expected_logdet})
    assert inverse_error < 1e-12 and determinant_error < 1e-8
    return {'inverse_max_error': inverse_error, 'logdet_finite_difference_max_error': determinant_error,
            'orientation': 'The coordinate swap makes the determinant negative; use its absolute value.',
            'singular_scale_determinant': 0, 'points': density_rows}


def ddpm_training_objective():
    # New 8x8 grayscale signals: a fixed cosine background and a random stripe amplitude.
    size, alpha, prior_variance = 8, 0.55, 0.36
    pattern = [math.sin(2 * math.pi * (col + 0.5) / size) for row in range(size) for col in range(size)]
    background = [0.12 * math.cos(2 * math.pi * (row + 0.5) / size)
                  for row in range(size) for col in range(size)]
    norm = sum(p * p for p in pattern)
    posterior_variance = 1 / (1 / prior_variance + alpha * norm / (1 - alpha))
    rng = random.Random(9304)
    noise_error, zero_error, pixel_error = [], [], []
    for _ in range(256):
        amplitude = math.sqrt(prior_variance) * rng.gauss(0, 1)
        clean = [m + amplitude * p for m, p in zip(background, pattern)]
        noise = [rng.gauss(0, 1) for _ in clean]
        noisy = [math.sqrt(alpha) * x + math.sqrt(1 - alpha) * e for x, e in zip(clean, noise)]
        projection = sum(p * (y - math.sqrt(alpha) * m) for p, y, m in zip(pattern, noisy, background))
        estimate = posterior_variance * math.sqrt(alpha) * projection / (1 - alpha)
        predicted_clean = [m + estimate * p for m, p in zip(background, pattern)]
        predicted_noise = [(y - math.sqrt(alpha) * x) / math.sqrt(1 - alpha)
                           for y, x in zip(noisy, predicted_clean)]
        noise_error.extend((a - b) ** 2 for a, b in zip(predicted_noise, noise))
        zero_error.extend(e * e for e in noise)
        pixel_error.extend((a - b) ** 2 for a, b in zip(predicted_clean, clean))
    noise_mse, image_mse = statistics.mean(noise_error), statistics.mean(pixel_error)
    assert noise_mse < statistics.mean(zero_error)
    assert abs(image_mse - (1 - alpha) / alpha * noise_mse) < 1e-12
    return {'images': 256, 'shape': [size, size], 'alpha_bar': alpha,
            'zero_noise_prediction_mse': statistics.mean(zero_error),
            'conditional_noise_mse': noise_mse, 'reconstructed_signal_mse': image_mse,
            'posterior_amplitude_variance': posterior_variance,
            'scope': 'One forward-noising/conditional-denoising step; no U-Net training or reverse sampling chain.'}


def audio_generation():
    sample_rate, count = 8192, 2048
    signal = [0.53 * math.sin(2 * math.pi * 227 * i / sample_rate)
              + 0.19 * math.sin(2 * math.pi * 463 * i / sample_rate) for i in range(count)]
    first = [-0.75, -0.25, 0.25, 0.75]
    residual = [-0.1875, -0.0625, 0.0625, 0.1875]
    nearest = lambda value, book: min(book, key=lambda code: abs(value - code))
    coarse = [nearest(x, first) for x in signal]
    refined = [q + nearest(x - q, residual) for x, q in zip(signal, coarse)]
    coarse_mse = statistics.mean((x - q) ** 2 for x, q in zip(signal, coarse))
    refined_mse = statistics.mean((x - q) ** 2 for x, q in zip(signal, refined))
    assert refined_mse < coarse_mse
    # A separate token schedule example: five frames and three delayed codebooks.
    frames, books = 5, 3
    tokens = [[(3 * f + 2 * k) % 7 for k in range(books)] for f in range(frames)]
    schedule = [[None] * books for _ in range(frames + books - 1)]
    for f in range(frames):
        for k in range(books):
            schedule[f + k][k] = tokens[f][k]
    decoded = [[schedule[f + k][k] for k in range(books)] for f in range(frames)]
    assert decoded == tokens
    return {'signal_samples': count, 'sample_rate_hz': sample_rate, 'duration_seconds': count / sample_rate,
            'coarse_scalar_quantization_mse': coarse_mse, 'residual_scalar_quantization_mse': refined_mse,
            'frames': frames, 'codebooks': books, 'delayed_steps': len(schedule),
            'restored_frames_exactly': decoded == tokens, 'schedule': schedule,
            'scope': 'Synthetic tones and scalar quantizers; no speech/music model, learned codec or listening test.'}


def drag_editing():
    # An analytic 2-D feature field with translation as its only editable variable.
    def features(x, y, shift):
        u, v = x - shift[0], y - shift[1]
        return math.sin(0.7 * u), math.cos(0.4 * v), u + 2 * v

    handle, goal_shift = (-1, 2), (2, -1)
    reference = features(*handle, (0, 0))
    candidates = list(itertools.product(range(-3, 4), repeat=2))
    distance = lambda p: sum((a - b) ** 2 for a, b in zip(features(*p, goal_shift), reference))
    tracked = min(candidates, key=distance)
    ambiguous = min(candidates, key=lambda p: (features(*p, goal_shift)[0] - reference[0]) ** 2)
    target = tuple(a + b for a, b in zip(handle, goal_shift))
    assert tracked == target and distance(tracked) < 1e-20
    assert ambiguous != target
    # Minimize half the squared handle error using the known translation Jacobian.
    shift = [0.0, 0.0]
    for _ in range(20):
        for i in range(2):
            shift[i] -= 0.3 * (handle[i] + shift[i] - target[i])
    remaining = math.dist(shift, goal_shift)
    assert remaining < 0.002
    return {'original_handle': handle, 'target_handle': target, 'tracked_with_three_features': tracked,
            'tracked_with_one_feature': ambiguous, 'steps': 20, 'remaining_handle_error': remaining,
            'protected_point_displacement': math.hypot(*shift),
            'scope': 'Analytic feature tracking and translation-only optimization; no DragGAN/DragDiffusion checkpoint.'}


def autoregressive_models():
    rng = random.Random(9305)
    length = 12

    def sample():
        row = [rng.randrange(2)]
        for _ in range(length - 1):
            row.append(row[-1] ^ int(rng.random() < 0.17))
        return row

    training = [sample() for _ in range(2048)]
    held_out = [sample() for _ in range(256)]
    initial = [1, 1]
    transitions = [[1, 1], [1, 1]]
    for row in training:
        initial[row[0]] += 1
        for before, after in zip(row, row[1:]):
            transitions[before][after] += 1
    first = [x / sum(initial) for x in initial]
    conditional = [[x / sum(row) for x in row] for row in transitions]

    def complete(prefix, generator):
        row = list(prefix)
        if not row:
            row.append(int(generator.random() < first[1]))
        while len(row) < length:
            row.append(int(generator.random() < conditional[row[-1]][1]))
        return row

    def probability(row):
        p = first[row[0]]
        for before, after in zip(row, row[1:]):
            p *= conditional[before][after]
        return p

    mass = sum(probability(row) for row in itertools.product((0, 1), repeat=length))
    bits = -statistics.mean(math.log2(probability(row)) / length for row in held_out)
    generated = [complete([1, 0, 0], random.Random(9410 + i)) for i in range(3)]
    assert abs(mass - 1) < 1e-12 and 0 < bits < 1
    assert all(row[:3] == [1, 0, 0] and len(row) == length for row in generated)
    return {'sequence_length': length, 'training_sequences': len(training),
            'held_out_sequences': len(held_out), 'initial_probabilities': first,
            'transition_probabilities': conditional, 'enumerated_probability_mass': mass,
            'held_out_bits_per_symbol': bits, 'uniform_bits_per_symbol': 1,
            'conditional_completions': generated,
            'scope': 'A fitted binary Markov model with causal prefix sampling; no PixelCNN or poster corpus.'}


EXPERIMENTS = {
    'wgan': wgan, 'vae': vae, 'stargan': stargan,
    'normalizing-flows': normalizing_flows, 'flow-architectures': flow_architectures,
    'ddpm-training-objective': ddpm_training_objective, 'audio-generation': audio_generation,
    'drag-editing': drag_editing, 'autoregressive-models': autoregressive_models,
}


def rounded(value):
    if isinstance(value, float):
        return round(value, 12)
    if isinstance(value, dict):
        return {key: rounded(item) for key, item in value.items()}
    if isinstance(value, (list, tuple)):
        return [rounded(item) for item in value]
    return value


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('experiment', nargs='?', choices=list(EXPERIMENTS))
    args = parser.parse_args()
    selected = {args.experiment: EXPERIMENTS[args.experiment]} if args.experiment else EXPERIMENTS
    result = {'provenance': 'New synthetic mechanism experiments; Fedor Pakhurov project with Codex assistance.',
              'external_inputs': [], 'experiments': {name: function() for name, function in selected.items()}}
    print(json.dumps(rounded(result), ensure_ascii=False, indent=2, sort_keys=True))
