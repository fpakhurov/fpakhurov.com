"""Original finite conditional-probability cases, exact arithmetic only.

Fedor Pakhurov project with Codex assistance, 2026-11-14.
Inputs are fictional complete population weights, not estimated measurements.
"""
from fractions import Fraction as F
from itertools import product, combinations
import json


def conditional_case():
    counts = {'H': {(1, 1): 12, (1, 0): 6, (0, 1): 4, (0, 0): 2},
              'L': {(1, 1): 2, (1, 0): 10, (0, 1): 6, (0, 0): 30}}
    population = [(mode, u, v, index) for mode, table in counts.items()
                  for (u, v), count in table.items() for index in range(count)]
    assert len(population) == 72
    def prob(event, given=lambda row: True):
        base = [row for row in population if given(row)]
        assert base
        return F(sum(bool(event(row)) for row in base), len(base))
    h = lambda r: r[0] == 'H'
    u = lambda r: r[1] == 1
    v = lambda r: r[2] == 1
    both = lambda r: u(r) and v(r)
    assert prob(h) == F(1, 3)
    conditionals = {}
    for mode in counts:
        given = lambda r, mode=mode: r[0] == mode
        p_u,p_v,p_both = prob(u,given),prob(v,given),prob(both,given)
        assert p_both == p_u*p_v
        conditionals[mode] = list(map(str,[p_u,p_v,p_both]))
    assert prob(both) != prob(u)*prob(v)
    prior = prob(h)/(1-prob(h))
    after_u = prior*(prob(u,h)/prob(u,lambda r:not h(r)))
    after_uv = after_u*(prob(v,h)/prob(v,lambda r:not h(r)))
    assert [prior,after_u,after_uv] == [F(1,2),F(3,2),F(6)]
    assert after_u/(1+after_u) == prob(h,u) == F(3,5)
    assert after_uv/(1+after_uv) == prob(h,both) == F(6,7)
    assert prob(h,lambda r:u(r) and u(r)) == prob(h,u)
    report = {}
    for name in ['priority_u','uniform_present']:
        h_mass = F(0); all_mass = F(0)
        for row in population:
            mode,u_bit,v_bit,_ = row
            report_v = F(v_bit and not u_bit) if name=='priority_u' else F(v_bit,u_bit+v_bit) if u_bit+v_bit else F(0)
            all_mass += report_v
            h_mass += report_v*int(mode=='H')
        report[name]={'h_report_weight':str(h_mass),'report_weight':str(all_mass),'posterior':str(h_mass/all_mass)}
    assert report['priority_u']['posterior']=='2/5'
    assert report['uniform_present']['posterior']=='10/17'
    def posterior(prior,likelihood_h,likelihood_l):
        return prior*likelihood_h/(prior*likelihood_h+(1-prior)*likelihood_l)
    shifted = {'u':posterior(F(1,2),F(3,4),F(1,4)),
               'uv':posterior(F(1,2),F(1,2),F(1,24)),
               'u_changed_conditional':posterior(F(1,2),F(1,2),F(1,4))}
    assert shifted == {'u':F(3,4),'uv':F(12,13),'u_changed_conditional':F(2,3)}
    ticket_weights = dict(zip(product(range(2),repeat=3),[11,5,7,1,13,3,5,3]))
    tickets=[bits for bits,weight in ticket_weights.items() for _ in range(weight)]
    event_prob=lambda indices:F(sum(all(bits[i] for i in indices) for bits in tickets),len(tickets))
    marginals=[event_prob([i]) for i in range(3)]
    assert marginals==[F(1,2),F(1,3),F(1,4)]
    pairs={str(ij):event_prob(ij) for ij in combinations(range(3),2)}
    for i,j in combinations(range(3),2):assert event_prob([i,j])==marginals[i]*marginals[j]
    triple=event_prob(range(3))
    assert triple==F(1,16)!=marginals[0]*marginals[1]*marginals[2]
    return {'counts':{mode:{f'{u}{v}':n for (u,v),n in table.items()} for mode,table in counts.items()},
            'population_size':len(population), 'conditional_u_v_uv':conditionals,
            'marginal_u_v_uv':list(map(str,[prob(u),prob(v),prob(both)])),
            'v_given_u':str(prob(v,u)), 'h_given_u_v_uv':list(map(str,[prob(h,u),prob(h,v),prob(h,both)])),
            'odds_prior_after_u_after_uv':list(map(str,[prior,after_u,after_uv])),
            'reporting':report, 'new_prior_one_half':{k:str(v) for k,v in shifted.items()},
            'pairwise_example':{'weights':{''.join(map(str,k)):v for k,v in ticket_weights.items()},'tickets':len(tickets),'marginals':list(map(str,marginals)),'pairs':{k:str(v) for k,v in pairs.items()},'triple':str(triple),'independent_triple_product':str(marginals[0]*marginals[1]*marginals[2])}}


if __name__=='__main__':
    print(json.dumps(conditional_case(),indent=2))
