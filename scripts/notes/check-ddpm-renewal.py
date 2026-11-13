#!/usr/bin/env python3
"""Replay the local DDPM examples and independent numerical checks.

Original verifier authored for this project with Codex assistance. Requires
NumPy only for the existing inline experiment; no downloads or model training.
Default: compare saved evidence. --write: deliberately refresh that evidence.
"""
import contextlib
import importlib.util
import io
import json
import math
from pathlib import Path
import re
import sys

sys.dont_write_bytecode = True

ROOT = Path(__file__).resolve().parents[2]
REPORT = ROOT / 'docs/reports/2026-11-13-licensed-example-renewal/ddpm-numerical-checks.json'
EN = (ROOT / 'src/content/notes/generative-models/ddpm-training-objective.mdx').read_text()
RU = (ROOT / 'src/content/notes-ru/generative-models/ddpm-training-objective.mdx').read_text()
code = re.search(r'```python\n(.*?)\n```', EN, re.S).group(1)
assert code == re.search(r'```python\n(.*?)\n```', RU, re.S).group(1)
namespace = {}
stdout = io.StringIO()
with contextlib.redirect_stdout(stdout):
    exec(compile(code, 'ddpm-training-objective inline example', 'exec'), namespace)
expected_stdout = '[0.3202 0.6771 0.0715]\n[0.3194 0.6776 0.0714]\n0.2727 0.005 349 0.0102 54.9\n1000 4.04e-05 1.0 0.0\n10 4.04e-05 0.03 0.47\n'
assert stdout.getvalue() == expected_stdout

def close(actual, expected, tol=1e-10):
    assert abs(actual - expected) < tol, (actual, expected)

def cdf(x):
    return 0.5 * math.erfc(-x / math.sqrt(2))

# Joint Gaussian conditioning, independent of the precision derivation in the note.
var1, beta2 = 0.1, 0.2
cov = math.sqrt(1-beta2) * var1
var2 = (1-beta2)*var1 + beta2
slope = cov / var2
intercept = math.sqrt(0.9) - slope * math.sqrt(0.72)
conditional_variance = var1 - cov*cov/var2
close(conditional_variance, 1/14)
close(slope, math.sqrt(0.8)*0.1/0.28)
close(intercept, math.sqrt(0.9)*0.2/0.28)
# Same posterior mean under x0/epsilon parameterizations, for arbitrary scalars.
parameterization_error = 0
for b, previous in [(0.2,0.9),(0.005,0.4),(0.636,0.132)]:
    a, cumulative = 1-b, (1-b)*previous
    for x0, eps in [(-0.7,1.2),(0.4,-0.8),(0,0)]:
        xt = math.sqrt(cumulative)*x0 + math.sqrt(1-cumulative)*eps
        posterior = math.sqrt(previous)*b*x0/(1-cumulative) + math.sqrt(a)*(1-previous)*xt/(1-cumulative)
        noise_form = (xt-b*eps/math.sqrt(1-cumulative))/math.sqrt(a)
        parameterization_error=max(parameterization_error,abs(posterior-noise_form))
close(parameterization_error,0)

betas = [1e-4+(0.02-1e-4)*i/999 for i in range(1000)]
abar=[1.0]
for b in betas: abar.append(abar[-1]*(1-b))
weights = {t:betas[t-1]/(2*(1-betas[t-1])*(1-abar[t])) for t in range(2,1001)}
t_min=min(weights,key=weights.get)
assert t_min==349
few_beta=1-abar[-1]**0.1

def ambiguity(cumulative, threshold=0.1):
    # Both posterior class probabilities exceed threshold iff |x|<bound.
    mean=math.sqrt(cumulative); sd=math.sqrt(1-cumulative)
    bound=math.log((1-threshold)/threshold)*(1-cumulative)/(2*mean)
    # Symmetry means either mixture component gives the same interval mass.
    return cdf((bound-mean)/sd)-cdf((-bound-mean)/sd)

def standardized_gap(b,previous):
    cumulative=(1-b)*previous
    return 2*math.sqrt(previous*b/((1-cumulative)*(1-previous)))

first_ambiguous=next(t for t in range(2,1001) if ambiguity(abar[t])>=0.01)
assert first_ambiguous==110
ratios=[standardized_gap(betas[t-1],abar[t-1]) for t in range(first_ambiguous,1001)]
assert all(a>b for a,b in zip(ratios,ratios[1:]))
close(ratios[0],0.74,0.01)
last_ambiguous=ambiguity(1-few_beta) # mean tanh() lies in (-.8,.8) iff class prob in (.1,.9)
close(last_ambiguous,0.74,0.01)
# Exact decoder bin masses, including normalization at boundary bins.
half_width=1/255
sigma=.01
interior=2*cdf(half_width/sigma)-1
one_away=2*(cdf(3*half_width/sigma)-cdf(half_width/sigma))
for mean in [-1,-.3,0,1,1.5]:
    bounds=[-math.inf]+[-1+(2*k+1)/255 for k in range(255)]+[math.inf]
    mass=sum(cdf((right-mean)/sigma)-cdf((left-mean)/sigma) for left,right in zip(bounds,bounds[1:]))
    close(mass,1)
# Same observed scalar, different noise levels.
conditional_noise={str(t):math.sqrt(1-abar[t])/(.25*abar[t]+1-abar[t]) for t in [10,500]}
close(conditional_noise['10'],.17,.01); close(conditional_noise['500'],1.02,.01)
clipping_probability=cdf((-1-math.sqrt(.5)*.9)/math.sqrt(.5))+1-cdf((1-math.sqrt(.5)*.9)/math.sqrt(.5))
close(clipping_probability,.31,.01)

spec=importlib.util.spec_from_file_location('local_practice', ROOT/'scripts/notes/generative-practice.py')
practice=importlib.util.module_from_spec(spec); spec.loader.exec_module(practice)
practice_result=practice.ddpm_training_objective()
saved_practice=json.loads((ROOT/'docs/reports/2026-11-13-licensed-example-renewal/generative-practice-results.json').read_text())
# The canonical bundle rounds floats to 12 decimal places.
reference=saved_practice['experiments']['ddpm-training-objective'] if 'experiments' in saved_practice else saved_practice['ddpm-training-objective']
for key in ['conditional_noise_mse','reconstructed_signal_mse','posterior_amplitude_variance','zero_noise_prediction_mse']:
    close(practice_result[key], reference[key], 1e-10)
expected_amplitude_variance=1/(1/.36+.55*32/.45)
close(practice_result['posterior_amplitude_variance'],expected_amplitude_variance)
expected_signal_mse=expected_amplitude_variance*32/64
# Monte Carlo result approaches, but is not equal to, the Bayes risk.
assert abs(practice_result['reconstructed_signal_mse']/expected_signal_mse-1)<.15

result={
 'inline_stdout':stdout.getvalue(),
 'posterior':{'slope':slope,'intercept':intercept,'variance':conditional_variance},
 'max_parameterization_error':parameterization_error,
 'linear_schedule':{'T':1000,'alpha_bar_T':abar[-1],'w2':weights[2],'minimum_t':t_min,'minimum_weight':weights[t_min],'w1000':weights[1000],'ratio':weights[2]/weights[t_min]},
 'two_point_diagnostic':{'few_beta':few_beta,'first_one_percent_ambiguous_t':first_ambiguous,'gap_at_first':ratios[0],'gap_at_t2':standardized_gap(betas[1],abar[1]),'few_gap_t2':standardized_gap(few_beta,1-few_beta),'few_ambiguous_t2':ambiguity((1-few_beta)**2),'few_final_mean_inside_08':last_ambiguous},
 'decoder':{'same_bin':interior,'one_bin_away':one_away,'further':1-interior-one_away,'same_bin_bits':-math.log2(interior),'mass_checked_means':[-1,-.3,0,1,1.5]},
 'conditional_noise_at_x1':conditional_noise,'display_clipping_probability':clipping_probability,
 'ema_initial_weight':{'10000':.9999**10000,'50000':.9999**50000},
 'practice':practice_result,'practice_analytic_signal_bayes_risk':expected_signal_mse,
 'scope':'Local equations, Monte Carlo toy and rank-one signal; no source benchmark reproduced or neural model trained.'}
def rounded(value):
    if isinstance(value,float): return float(format(value,'.12g'))
    if isinstance(value,list): return [rounded(x) for x in value]
    if isinstance(value,dict): return {k:rounded(v) for k,v in value.items()}
    return value
result=rounded(result)
if '--write' in sys.argv: REPORT.write_text(json.dumps(result,indent=2)+'\n')
else: assert json.loads(REPORT.read_text())==result
print('DDPM numerical checks passed; inline code matches both locales and saved outputs.')
