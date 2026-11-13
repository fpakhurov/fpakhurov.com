#!/usr/bin/env python3
"""Original analytic VAE checks for this project, authored with Codex assistance.

No external model, observation, image, or implementation is loaded. Default mode
compares fresh computed values with the saved artifact; --write refreshes it.
"""
import argparse
import importlib.util
import json
import math
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DEST = ROOT / 'docs/reports/2026-11-13-licensed-example-renewal/vae-numerical-checks.json'


def near(a, b, tolerance=1e-10):
    assert abs(a - b) <= tolerance, (a, b)


def normal_moment(k):
    if k % 2:
        return 0
    return math.prod(range(1, k, 2))


def poly_moment(coefficients):
    return sum(a * normal_moment(k) for k, a in enumerate(coefficients))


def square(coefficients):
    out = [0] * (2 * len(coefficients) - 1)
    for i, a in enumerate(coefficients):
        for j, b in enumerate(coefficients):
            out[i + j] += a * b
    return out


def normal_pdf(z, mean, variance):
    return math.exp(-0.5 * (z - mean) ** 2 / variance) / math.sqrt(2 * math.pi * variance)


def integrate(fn, lower=-12, upper=12, intervals=12000):
    h = (upper - lower) / intervals
    return h / 3 * sum((1 if i in (0, intervals) else 4 if i % 2 else 2) * fn(lower + i * h)
                       for i in range(intervals + 1))


def verify():
    # Three finite training points leave unseen decoder values unidentified.
    points = [-2, 0, 2]
    g1 = lambda z: z + 0.75 * z * (z * z - 4)
    for z in points:
        near(g1(z), z)
    near(g1(1), -1.25)
    # Actual decoder mean pixels, rather than hand-morphed glyphs.
    sigmoid = lambda z: 1 / (1 + math.exp(-z))
    frames = []
    for t in [0, 0.25, 0.5, 0.75, 1]:
        a, b = -1 + 2.5 * t, 1.5 - 2 * t
        frames.append({'t': t, 'z': [a, b], 'pixels': [sigmoid(1.2*a), sigmoid(0.7*b), sigmoid(a-b)]})
    # Scalar Bayes figure: normalization and pointwise Bayes identity independently.
    scalar_weight, scalar_noise, observed = 1.4, 0.36, 0.7
    evidence_variance = scalar_weight**2 + scalar_noise
    scalar_mean = scalar_weight*observed/evidence_variance
    scalar_variance = scalar_noise/evidence_variance
    scalar_posterior = lambda z: normal_pdf(z, scalar_mean, scalar_variance)
    near(integrate(scalar_posterior), 1)
    near(integrate(lambda z: z*scalar_posterior(z)), scalar_mean)
    near(integrate(lambda z: (z-scalar_mean)**2*scalar_posterior(z)), scalar_variance)
    for z in [-2, -.7, 0, .4, 1, 2]:
        near(scalar_posterior(z), normal_pdf(observed, scalar_weight*z, scalar_noise)*normal_pdf(z, 0, 1)/normal_pdf(observed, 0, evidence_variance))
    # Fixed selected noise values show pathwise shifts, not a normal sampling run.
    noise_values, location, scale, change = [-1.5, -.5, .5, 1.5], .4, .7, .2
    fixed_rows = [[mean+sd*e for e in noise_values] for mean,sd in [(location,scale),(location+change,scale),(location,scale+change)]]
    for i,e in enumerate(noise_values):
        near((fixed_rows[1][i]-fixed_rows[0][i])/change, 1)
        near((fixed_rows[2][i]-fixed_rows[0][i])/change, e)
    # Independent one-latent, two-observation-coordinate PPCA conditioning.
    w = [1.2, -0.5]
    x, mu, noise_variance = [0.8, -0.1], [0.1, 0.2], 0.4
    m = sum(a*a for a in w) + noise_variance
    posterior_mean = sum(a*(b-c) for a, b, c in zip(w, x, mu)) / m
    posterior_variance = noise_variance / m
    c = [[w[0]**2+noise_variance, w[0]*w[1]], [w[0]*w[1], w[1]**2+noise_variance]]
    det = c[0][0]*c[1][1]-c[0][1]*c[1][0]
    inv = [[c[1][1]/det, -c[0][1]/det], [-c[1][0]/det, c[0][0]/det]]
    wc = [sum(w[i]*inv[i][j] for i in range(2)) for j in range(2)]
    near(posterior_mean, sum(wc[j]*(x[j]-mu[j]) for j in range(2)))
    near(posterior_variance, 1-sum(wc[j]*w[j] for j in range(2)))
    # Independent-coordinate relative variance, using the exact base before rounding.
    ratio = 11 / math.sqrt(21)
    mc = [{'d': d, 'second_moment_ratio': ratio**d, 'samples_for_relative_sd_point_one': math.ceil(100*(ratio**d-1))} for d in [1, 10, 100]]
    # One shared variance uses the average expected squared residual across cases.
    residual_sums, dimensions = [1.2, 4.8], 2
    r = sum(residual_sums)/len(residual_sums)
    optimum = r/dimensions
    objective = lambda variance: r/(2*variance) + dimensions/2*math.log(variance)
    for variance in [0.3, 0.8, 1.4, 1.6, 2.5, 8]:
        assert objective(variance) > objective(optimum)
    near(-r/(2*optimum**2)+dimensions/(2*optimum), 0)
    # Score gradient is epsilon + 2 epsilon^2 + epsilon^3, pathwise is 2+2epsilon.
    gradients = []
    for coefficients in [[0, 1, 2, 1], [2, 2]]:
        mean = poly_moment(coefficients)
        variance = poly_moment(square(coefficients))-mean**2
        gradients.append({'mean': mean, 'variance': variance})
    assert gradients == [{'mean': 2, 'variance': 30}, {'mean': 2, 'variance': 4}]
    # Gaussian KL and figure markers.
    kl = lambda mu, sigma: 0.5*(mu*mu+sigma*sigma-1-math.log(sigma*sigma))
    kl_rows = [{'mu': mu, 'sigma': sigma, 'kl': kl(mu,sigma)} for mu,sigma in [(0,1),(1,1),(2,1),(0,.5),(0,2),(0,.1),(0,.01)]]
    lo, hi = 1e-6, 1
    for _ in range(60):
        mid = (lo+hi)/2
        if kl(0,mid)>3.2:lo=mid
        else:hi=mid
    # A separate exact Gaussian correlation check.
    rho=.6
    near(1-rho*rho,.64)
    correlation_kl=-.5*math.log(1-rho*rho)
    # Numerical aggregate-KL identity for a fresh three-component scalar fixture.
    means, variances = [-1.1,.2,1.6], [.36,.64,.25]
    densities=lambda z:[normal_pdf(z,a,b) for a,b in zip(means,variances)]
    def quantities(z):
        qs=densities(z);q=sum(qs)/3;p=normal_pdf(z,0,1)
        marginal=q*math.log(q/p)
        mutual=sum(v*math.log(v/q) for v in qs)/3
        return mutual,marginal
    mutual=integrate(lambda z:quantities(z)[0])
    marginal=integrate(lambda z:quantities(z)[1])
    average_kl=sum(.5*(a*a+b-1-math.log(b)) for a,b in zip(means,variances))/3
    near(mutual+marginal,average_kl,2e-10)
    assert 0<=mutual<=math.log(3) and marginal>=0
    # The collapse family fits the same population distribution exactly.
    collapse=[]
    for weight, noise in [(1,.1),(.5,.85),(0,1.1)]:
        near(weight**2+noise,1.1)
        rate=.5*math.log1p(weight**2/noise)
        likelihood=-.5*(math.log(2*math.pi*1.1)+1/1.1)
        # Population average KL of the exact posterior has this same rate.
        post_var=noise/1.1
        expected_squared_mean=weight**2/1.1
        near(rate,.5*(expected_squared_mean+post_var-1-math.log(post_var)))
        collapse.append({'weight':weight,'noise_variance':noise,'rate':rate,'log_density_at_one':likelihood})
    condition_means=[1.4+0.8*c for c in [-1,1]]
    near(condition_means[1]-condition_means[0],1.6)
    # Fresh execution of the already-published four-observation optional practice.
    spec=importlib.util.spec_from_file_location('generative_practice',ROOT/'scripts/notes/generative-practice.py')
    practice=importlib.util.module_from_spec(spec)
    previous_bytecode_setting=sys.dont_write_bytecode
    try:
        sys.dont_write_bytecode=True
        spec.loader.exec_module(practice)
    finally:
        sys.dont_write_bytecode=previous_bytecode_setting
    vae=practice.vae()
    saved=json.loads((ROOT/'docs/reports/2026-11-13-licensed-example-renewal/generative-practice-results.json').read_text())
    assert practice.rounded(vae)==saved['experiments']['vae']
    return {'scope':'Constructed analytic mechanisms and actual formula-generated figures; no neural image training or external data.',
            'ae_counterexample':{'training':points,'g0_at_one':1,'g1_at_one':g1(1)},
            'three_pixel_interpolation':frames,
            'scalar_bayes_figure':{'weight':scalar_weight,'noise_variance':scalar_noise,'observation':observed,'evidence_variance':evidence_variance,'posterior_mean':scalar_mean,'posterior_variance':scalar_variance},
            'fixed_noise_reparameterization':{'epsilon':noise_values,'mu':location,'sigma':scale,'delta':change,'rows':fixed_rows},
            'ppca':{'weight':w,'observation':x,'offset':mu,'noise_variance':noise_variance,'posterior_mean':posterior_mean,'posterior_variance':posterior_variance},
            'prior_monte_carlo':mc,
            'shared_variance':{'expected_residual_sums':residual_sums,'dimensions':dimensions,'optimum':optimum,'profiled_objective':objective(optimum)},
            'gradient_estimators':{'score':gradients[0],'pathwise':gradients[1]},
            'kl_table':kl_rows,'kl_sigma_at_3_2':hi,'correlation_kl_rho_point_six':correlation_kl,
            'jensen':{'values':[.6,5.4],'log_mean':math.log(3),'mean_log':(math.log(.6)+math.log(5.4))/2},
            'aggregate_kl':{'means':means,'variances':variances,'average_kl':average_kl,'mutual_information':mutual,'marginal_kl':marginal,'quadrature':{'interval':[-12,12],'simpson_intervals':12000,'error_tolerance':2e-10}},
            'collapse':collapse,'conditional_means_at_z_one':condition_means,
            'shared_practice_exact_replay':{'mean_elbo':vae['mean_elbo'],'mean_log_likelihood':vae['mean_log_likelihood'],'mean_gap':vae['mean_gap'],'monte_carlo':vae['reparameterized_mc_reconstruction']}}


if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--write',action='store_true');args=parser.parse_args()
    result=verify()
    if args.write:DEST.write_text(json.dumps(result,indent=2,ensure_ascii=False)+'\n')
    else:assert json.loads(DEST.read_text())==result
    print(json.dumps(result,indent=2,ensure_ascii=False))
