#!/usr/bin/env python3
"""Original finite GAN-scaling diagnostics for the Fedor Pakhurov project.
Authored with Codex assistance. No model, dataset, random input or external code.
This verifies the stated small examples, not training or image quality of a GAN.
Default: replay the saved JSON. --write: regenerate that file intentionally.
"""
import argparse
import json
import math
from fractions import Fraction as F
from pathlib import Path


def close(a, b, tol=1e-9):
    assert abs(a-b) <= tol, (a, b)


def mean(xs):
    return sum(xs) / len(xs)


def variance(xs):
    m = mean(xs)
    return mean([(x-m)**2 for x in xs])


def gradient_check(fun, point, wanted):
    errors = []
    for i, target in enumerate(wanted):
        high, low = list(point), list(point)
        high[i] += 1e-5
        low[i] -= 1e-5
        observed = (fun(high)-fun(low))/2e-5
        errors.append(abs(observed-target))
        close(observed, target, 1e-7)
    return max(errors)


def basic_cases():
    coarse = [-1, 3]
    a = [-1, -1, 3, 3]
    direction = [-1, 1, -1, 1]
    target = [x+2*d for x, d in zip(a, direction)]
    fade = []
    for alpha in [F(0), F(1, 4), F(1)]:
        theta = F(0)
        out = [x+alpha*theta*d for x, d in zip(a, direction)]
        loss = mean([(x-y)**2 for x, y in zip(out, target)])/2
        grad = mean([(x-y)*alpha*d for x, y, d in zip(out, target, direction)])
        assert loss == F(2) and grad == -2*alpha
        gradient_check(lambda t: mean([(x+float(alpha)*t[0]*d-y)**2 for x, d, y in zip(a, direction, target)])/2, [0.0], [float(grad)])
        fade.append({'alpha': str(alpha), 'loss': str(loss), 'gradient': str(grad)})
    batch_a = [[-2, 0], [0, 2], [2, 4], [4, 6]]
    batch_b = [[-2, 6], [0, 4], [2, 2], [4, 0]]
    batches = []
    for batch in [batch_a, batch_b, [[1, 3]]*4]:
        cols = list(zip(*batch))
        variances = [variance([F(x) for x in col]) for col in cols]
        covariance = mean([(F(x)-mean(cols[0]))*(F(y)-mean(cols[1])) for x, y in batch])
        batches.append({'rows': batch, 'variances': list(map(str, variances)), 'covariance': covariance, 'shared_std': mean([math.sqrt(v) for v in variances])})
    assert batches[0]['variances'] == batches[1]['variances'] == ['5', '5']
    assert batches[0]['covariance'] == 5 and batches[1]['covariance'] == -5
    adam = []
    for scale in [F(1, 2), F(2)]:
        stored_grad = scale * 3
        stored_step = -F(1, 10)*stored_grad/(abs(stored_grad)+F(1, 5))
        adam.append({'scale': str(scale), 'stored_step': str(stored_step), 'effective_step': str(scale*stored_step)})
    assert adam[0]['effective_step'] == '-3/68' and adam[1]['effective_step'] == '-6/31'
    vector = [1, 2, 2]
    normalized = [x/math.sqrt(F(13, 4)) for x in vector]
    close(mean([x*x for x in normalized]), F(12, 13))
    return {'coarse': coarse, 'upsampled': a, 'target': target, 'fade': fade, 'batches': batches, 'adam': adam, 'pixel': {'input': vector, 'epsilon': '1/4', 'output': normalized, 'mean_square': '12/13'}}


def attention_cases():
    scores = [0.0, math.log(2), math.log(3)]
    values = [-3, 0, 4]
    exp_scores = [math.exp(x) for x in scores]
    weights = [x/sum(exp_scores) for x in exp_scores]
    output = sum(w*v for w, v in zip(weights, values))
    close(output, F(3, 2))
    x, target, gamma = -1, 2, 0
    residual = x+gamma*output
    gate_gradient = (residual-target)*output
    score_gradient = [gamma*(residual-target)*w*(v-output) for w, v in zip(weights, values)]
    assert score_gradient == [0, 0, 0]
    gradient_check(lambda p: 0.5*(x+p[0]*output-target)**2, [0.0], [gate_gradient])
    gate_curve = [{'gamma': k/10, 'output': x+(k/10)*output} for k in range(-10, 21)]
    return {'scores': scores, 'values': values, 'weights': weights, 'attention_output': output, 'input': x, 'target': target, 'gate_gradient_at_zero': gate_gradient, 'score_gradients_at_zero': score_gradient, 'gate_curve': gate_curve}


def objectives():
    real, fake = [F(2), F(0), F(-1)], [F(-2), F(-1, 2), F(1)]
    ld = mean([max(0, 1-x) for x in real])+mean([max(0, 1+x) for x in fake])
    lg = -mean(fake)
    assert ld == F(11, 6) and lg == F(1, 2)
    gradient_check(lambda xs: mean([max(0, 1-x) for x in xs[:3]])+mean([max(0, 1+x) for x in xs[3:]]), list(map(float, real+fake)), [0, -1/3, -1/3, 0, 1/3, 1/3])
    gradient_check(lambda xs: -mean(xs), list(map(float, fake)), [-1/3]*3)
    projection = []
    a = math.log(3)/2
    psi = -math.log(math.cosh(a))
    for x in [-1, 1]:
        for label, sign in [('A', 1), ('B', -1)]:
            p_joint = F(3, 8) if sign*x == 1 else F(1, 8)
            q_joint = F(1, 4)
            log_ratio = psi+sign*a*x
            close(math.exp(log_ratio), p_joint/q_joint)
            projection.append({'x': x, 'class': label, 'p_joint': str(p_joint), 'q_joint': str(q_joint), 'ratio': str(p_joint/q_joint), 'log_ratio': log_ratio})
    assert sum(F(r['p_joint']) for r in projection) == sum(F(r['q_joint']) for r in projection) == 1
    w = [3.0, 1.0, 0.0, 2.0]
    def off_penalty(v):
        a, b, c, d = v
        return 2*(a*b+c*d)**2
    grad = [12, 36, 24, 0]
    error = gradient_check(off_penalty, w, grad)
    assert off_penalty(w) == 18
    full_penalty = (9-1)**2 + (5-1)**2 + 18
    assert full_penalty == 98
    assert off_penalty([3, 0, 0, 2]) == off_penalty([0, 0, 0, 0]) == 0
    return {'real_scores': list(map(str, real)), 'fake_scores': list(map(str, fake)), 'hinge_d': str(ld), 'hinge_g': str(lg), 'projection': projection, 'projection_a': a, 'projection_psi': psi, 'off_penalty': 18, 'full_penalty': full_penalty, 'off_gradient': grad, 'off_gradient_max_error': error, 'spectral_exact': [[1, 0], [0, F(1, 3).__float__()]], 'estimated_norm_amplification': 1.5, 'residual_norm': 2}


def mass_between(lo, hi):
    return (math.erf(hi/math.sqrt(2))-math.erf(lo/math.sqrt(2)))/2 if lo < hi else 0.0


def simpson(fun, lo, hi, n=400):
    h = (hi-lo)/n
    return h/3*(fun(lo)+fun(hi)+sum((4 if i % 2 else 2)*fun(lo+i*h) for i in range(1, n)))


def truncated(tau, verify=False):
    mass = math.erf(tau/math.sqrt(2))
    phi = math.exp(-tau*tau/2)/math.sqrt(2*math.pi)
    var = 1-2*tau*phi/mass
    if verify:
        density = lambda z: math.exp(-z*z/2)/math.sqrt(2*math.pi)
        close(simpson(density, -tau, tau), mass, 1e-9)
        close(simpson(lambda z: z*z*density(z), -tau, tau)/mass, var, 1e-9)
    return {'tau': tau, 'mass': mass, 'variance': var, 'six_unchanged': mass**6, 'expected_scalar_draws': 6/mass, 'valid_centered': mass_between(-min(tau, 1), min(tau, 1))/mass, 'valid_shifted': mass_between(max(-tau, -3), min(tau, -1))/mass}


def evaluate():
    grid = [truncated(k/50) for k in range(1, 151)]
    rows = [truncated(t, True) for t in [0.6, 1.2, 2.4]]
    assert rows[0]['valid_shifted'] == 0 and rows[0]['valid_centered'] == 1
    # Exact matrix checks isolate one affine layer and a residual sum.
    for x in [(1, 0), (0, 1), (0.6, 0.8)]:
        norm = math.hypot(*x)
        assert math.hypot(x[0], x[1]/3) <= norm+1e-12
        assert math.hypot(2*x[0], 4*x[1]/3) <= 2*norm+1e-12
    return {'origin': 'Original explicit diagnostics for the Fedor Pakhurov project, authored with Codex assistance; no external inputs.', 'basic': basic_cases(), 'attention': attention_cases(), 'objectives': objectives(), 'truncation': {'dimension': 6, 'rows': rows, 'grid': grid, 'untruncated_valid_centered': mass_between(-1, 1), 'untruncated_valid_shifted': mass_between(-3, -1)}}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--write', action='store_true')
    args = parser.parse_args()
    result = evaluate()
    destination = Path(__file__).resolve().parents[2]/'src/components/figures/gan-scaling/cases.json'
    text = json.dumps(result, ensure_ascii=False, indent=2, allow_nan=False)+'\n'
    if args.write:
        destination.write_text(text)
    else:
        assert destination.read_text() == text, 'Saved cases differ; investigate before regenerating.'
    print('Fade-in gradients:', ', '.join(row['gradient'] for row in result['basic']['fade']))
    print('Shared minibatch variance: 5; covariances: 5 and -5')
    print('Effective first Adam steps: -3/68, -6/31')
    print('Pixel mean square: 12/13')
    print('Attention output: 3/2; gate gradient: -9/2')
    print('Hinge losses: D=11/6, G=1/2; projection ratios: 1/2 or 3/2')
    print('Orthogonal penalties: off=18, full=98; gradient=[12, 36, 24, 0]')
    for row in result['truncation']['rows']:
        print('tau={tau:.1f} mass={mass:.9f} var={variance:.9f} all6={six_unchanged:.9f} draws={expected_scalar_draws:.9f} valid0={valid_centered:.9f} valid2={valid_shifted:.9f}'.format(**row))
    print('All original finite diagnostics passed. No GAN trained.')


if __name__ == '__main__':
    main()
