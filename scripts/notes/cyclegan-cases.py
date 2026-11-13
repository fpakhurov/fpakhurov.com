#!/usr/bin/env python3
"""Original finite CycleGAN cases, authored for this project with Codex assistance.

Explicit scalar supports replace external image/model/notebook chains.
This is exhaustive arithmetic, not image training or a GAN benchmark.
"""
from fractions import Fraction as F
from itertools import permutations, product
from pathlib import Path
import json
import sys


def cases():
    x, y = (-3, -1, 2, 5), (8, 13, 21, 34)
    reference = (2, 0, 3, 1)
    rows = []
    for perm in permutations(range(4)):
        g = dict(zip(x, [y[j] for j in perm]))
        f = {v: k for k, v in g.items()}
        assert sorted(g.values()) == list(y) and sorted(f.values()) == list(x)
        assert sum(abs(f[g[a]]-a) for a in x) == 0
        assert sum(abs(g[f[b]]-b) for b in y) == 0
        # Disjoint supports in one ambient scalar space: identity constraints
        # on target-domain inputs leave the cross-domain permutation free.
        g.update({b: b for b in y})
        f.update({a: a for a in x})
        assert sum(abs(g[b]-b) for b in y) + sum(abs(f[a]-a) for a in x) == 0
        error = F(sum(abs(y[perm[i]]-y[reference[i]]) for i in range(4)), 4)
        rows.append({'permutation': list(perm), 'outputs': [g[a] for a in x],
                     'cycle_loss': 0, 'identity_loss': 0, 'reference_mae': str(error)})
    anchors = [sum(all(r['permutation'][i] == reference[i] for i in range(k)) for r in rows)
               for k in range(5)]
    assert anchors == [24, 6, 2, 1, 1]
    # An L1 optimum for each finite scalar group can be chosen at a sample
    # median. These finite reconstruction choices attain the real optimum.
    bottleneck = []
    for code in product(range(2), repeat=4):
        best = min((F(sum(abs(x[i]-recon[code[i]]) for i in range(4)), 4), recon)
                   for recon in product(x, repeat=2))
        bottleneck.append((best[0], code, best[1]))
    best = min(bottleneck)
    assert best[0] == F(5,4)
    one_code = min(F(sum(abs(a-r) for a in x),4) for r in x)
    assert one_code == F(11,4)
    scores = (F(-1,4), F(7,4))
    score_mean = sum(scores)/2
    score_variance = sum((a-score_mean)**2 for a in scores)/2
    patch_loss = sum((a-1)**2 for a in scores)/2
    mean_loss = (score_mean-1)**2
    assert patch_loss == mean_loss+score_variance == F(17,16)
    delta = F(1,100)
    assert sum(abs(a) for a in (-delta,delta))/2 == delta
    size,jump,field = 256,1,1
    network = []
    for stride in (2,2,2,1,1):
        field += 3*jump
        size = (size+2-4)//stride+1
        jump *= stride
        network.append({'size':size,'jump':jump,'field':field})
    assert network[-1] == {'size':30,'jump':8,'field':70}
    return {'origin':'Original explicit finite fixtures for the Fedor Pakhurov project, authored with Codex assistance; no external data/model.',
            'x':list(x),'y':list(y),'reference_permutation':list(reference),
            'permutations':rows,'anchor_counts':anchors,
            'two_code_optimum':{'mae':str(best[0]),'encoding':list(best[1]),'reconstruction':list(best[2]),'assignments_tested':16,'reconstructions_per_assignment':16},
            'one_code_mae':str(one_code),'patch':{'scores':[str(a) for a in scores],'mean':str(score_mean),'variance':str(score_variance),'mean_then_loss':str(mean_loss),'loss_then_mean':str(patch_loss)},
            'noninjective_cycle_mae':str(delta),'conv_footprints':network}


if __name__ == '__main__':
    result=cases()
    target=Path(__file__).resolve().parents[2]/'src/components/figures/cyclegan/cases.json'
    if '--write' in sys.argv:target.write_text(json.dumps(result,indent=2)+'\n')
    else:assert json.loads(target.read_text()) == result
    print('Permutations with exact marginals, cycles and identity:',len(result['permutations']))
    print('After 0/1/2/3/4 reference anchors:',result['anchor_counts'])
    for perm in ([0,1,2,3],result['reference_permutation']):
        row=next(r for r in result['permutations'] if r['permutation']==perm)
        print('Map',row['outputs'],'reference MAE',row['reference_mae'])
    print('Best cycle MAE with one/two output codes:',result['one_code_mae'],result['two_code_optimum']['mae'])
    print('Patch loss after/before averaging:',result['patch']['mean_then_loss'],result['patch']['loss_then_mean'])
    print('Noninjective close-point cycle MAE:',result['noninjective_cycle_mae'])
    print('Convolution-only output/footprint:',result['conv_footprints'][-1])
