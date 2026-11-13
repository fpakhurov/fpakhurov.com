#!/usr/bin/env python3
"""Original hypothetical rollout arithmetic. No service, experiment or external data.

Authored for Fedor Pakhurov's project with Codex assistance.
"""
import argparse
from collections import defaultdict
from fractions import Fraction
import json
import math
from pathlib import Path
from statistics import NormalDist


def planning():
    baseline, alternative = .4, .44
    pooled = (baseline + alternative) / 2
    effect = alternative - baseline
    z_alpha = NormalDist().inv_cdf(.975)
    z_power = NormalDist().inv_cdf(.8)
    # Equal-variance normal approximation; independent Bernoulli units.
    samples = {str(q):math.ceil((z_alpha + z_power)**2 * pooled*(1-pooled)
                               / (effect**2*q*(1-q))) for q in [.5,.2,.1]}
    return dict(baseline=baseline, alternative=alternative, absolute_effect=effect,
                alpha_two_sided=.05, power=.8, planning_probability=pooled,
                total_sample_approximation=samples)


def comparison(success_a, count_a, success_b, count_b):
    a, b = success_a/count_a, success_b/count_b
    difference = b-a
    se = math.sqrt(a*(1-a)/count_a + b*(1-b)/count_b)
    pooled = (success_a+success_b)/(count_a+count_b)
    null_se = math.sqrt(pooled*(1-pooled)*(1/count_a+1/count_b))
    z = difference/null_se
    interval = [difference - NormalDist().inv_cdf(.975)*se,
                difference + NormalDist().inv_cdf(.975)*se]
    return dict(successes=[success_a,success_b],counts=[count_a,count_b],rates=[a,b],
                difference=difference,standard_error=se,interval_95_normal=interval,
                pooled_null_z=z,two_sided_normal_p=math.erfc(abs(z)/math.sqrt(2)),
                one_sided_lower_95=difference-NormalDist().inv_cdf(.95)*se)


def tail(n,k):
    return Fraction(sum(math.comb(n,j) for j in range(k,n+1)),2**n)


def peeking(looks,alpha):
    states={(0,False):1}
    thresholds={n:next((k for k in range(n+1) if tail(n,k)<=alpha),n+1) for n in looks}
    for n in range(1,max(looks)+1):
        updated=defaultdict(int)
        for (heads,hit),paths in states.items():
            for bit in [0,1]:
                new_heads=heads+bit
                crossed=hit or (n in looks and new_heads>=thresholds[n])
                updated[(new_heads,crossed)]+=paths
        states=updated
    all_paths=2**max(looks)
    assert sum(states.values())==all_paths
    false_paths=sum(count for (heads,hit),count in states.items() if hit)
    return dict(looks=looks,per_look_alpha=str(alpha),thresholds=thresholds,
                false_paths=false_paths,total_paths=all_paths,
                probability=str(Fraction(false_paths,all_paths)),fraction=false_paths/all_paths)


def assignment_check():
    observed=[2900,1900]
    expected=[2400,2400]
    statistic=sum((a-b)**2/b for a,b in zip(observed,expected))
    return dict(observed=observed,expected=expected,chi_square=statistic,
                approximate_df1_tail=math.erfc(math.sqrt(statistic/2)))


def interleave():
    rankings={'A':['quartz','cedar','reed','linen','plum'], 'B':['linen','quartz','spruce','reed','amber']}
    # Fixed illustrative coin outcomes at tied team sizes: B, then A.
    order=['B','A','A','B']
    selected=[]
    used=set()
    for team in order:
        doc=next(doc for doc in rankings[team] if doc not in used)
        selected.append(dict(document=doc,team=team))
        used.add(doc)
    assert selected==[dict(document='linen',team='B'),dict(document='quartz',team='A'),
                      dict(document='cedar',team='A'),dict(document='spruce',team='B')]
    clicks=['cedar']
    credited={team:sum(row['team']==team and row['document'] in clicks for row in selected) for team in rankings}
    return dict(rankings=rankings,illustrative_pick_order=order,slate=selected,clicks=clicks,credit=credited)


def mixture():
    rows=[dict(group='easy',baseline_success=16,baseline_count=20,candidate_success=60,candidate_count=80),
          dict(group='hard',baseline_success=24,baseline_count=80,candidate_success=5,candidate_count=20)]
    differences=[Fraction(r['candidate_success'],r['candidate_count'])-Fraction(r['baseline_success'],r['baseline_count']) for r in rows]
    pooled=Fraction(65,100)-Fraction(40,100)
    standardized=sum(differences)/2
    assert differences==[Fraction(-1,20)]*2 and pooled==Fraction(1,4) and standardized==Fraction(-1,20)
    return dict(rows=rows,within_group_differences=list(map(str,differences)),
                naive_total_difference=str(pooled),equal_group_standardized_difference=str(standardized))


def main():
    parser=argparse.ArgumentParser();parser.add_argument('--output',type=Path);args=parser.parse_args()
    looks=[4,8,12,16,20]
    repeated=peeking(looks,Fraction(1,20));fixed=peeking([20],Fraction(1,20));corrected=peeking(looks,Fraction(1,100))
    assert repeated['fraction']>.05 and fixed['fraction']<=.05 and corrected['fraction']<=.05
    improved=comparison(960,2400,1048,2400);cheaper=comparison(960,2400,948,2400)
    assert improved['interval_95_normal'][0]>0 and cheaper['one_sided_lower_95']<-.02
    result=dict(kind='Original fictional counts and exact null-path enumeration; no production experiment',
                planning=planning(),canary=dict(candidate_failures=14,baseline_failures=2,attempts_per_version=200,
                candidate_rate=14/200,baseline_rate=2/200,pause_above=.05,pause=14/200>.05),
                improvement=improved,noninferiority=dict(**cheaper,margin=.02,passes=False),
                peeking=dict(fixed=fixed,repeated=repeated,bonferroni=corrected),assignment=assignment_check(),
                interleaving=interleave(),mixture=mixture())
    text=json.dumps(result,ensure_ascii=False,indent=2)+'\n'
    if args.output:args.output.write_text(text)
    else:print(text,end='')


if __name__=='__main__':main()
