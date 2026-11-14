"""Original finite autoencoder and interpolation cases.

Authored for Fedor Pakhurov's project with Codex assistance, 2026-11-14.
Standard library only; no dataset, model, third-party code or random input.
This verifies finite objectives and geometry, not a trained image model.
"""
from fractions import Fraction as F
from pathlib import Path
from math import log, sqrt, acos, sin
import json
import sys


def cases():
    x = (-2, 1, 7)
    data = (F(1, 2), F(1, 3), F(1, 6))
    prior = (F(1, 3),) * 3
    conditional = ((F(1), F(0), F(0)), (F(0), F(1, 2), F(1, 2)), (F(0), F(0), F(1)))
    joint = [[data[i]*conditional[i][j] for j in range(3)] for i in range(3)]
    aggregate = [sum(row[j] for row in joint) for j in range(3)]
    assert aggregate == [F(1,2), F(1,6), F(1,3)]
    kl = lambda a,b: sum(float(v)*log(float(v/w)) for v,w in zip(a,b) if v)
    average_kl = sum(float(data[i])*kl(conditional[i],prior) for i in range(3))
    marginal_kl = kl(aggregate,prior)
    mutual_information = sum(float(joint[i][j])*log(float(conditional[i][j]/aggregate[j])) for i in range(3) for j in range(3) if joint[i][j])
    assert abs(average_kl-mutual_information-marginal_kl)<1e-14
    mean_decoder = [sum(joint[i][j]*x[i] for i in range(3))/aggregate[j] for j in range(3)]
    mse = sum(joint[i][j]*(x[i]-mean_decoder[j])**2 for i in range(3) for j in range(3))
    independent_mean = sum(v*w for v,w in zip(x,data))
    independent_mse = sum(w*(v-independent_mean)**2 for v,w in zip(x,data))
    assert mean_decoder == [F(-2),F(1),F(4)] and mse == 3
    assert independent_mean==F(1,2) and independent_mse==F(41,4)
    rows = []
    for j,(p,q) in enumerate(zip(prior,aggregate)):
        equal=p/(p+q)
        skew=p/(p+2*q)
        assert equal/(1-equal)==p/q
        assert 2*skew/(1-skew)==p/q
        rows.append({'z':j,'prior':str(p),'aggregate':str(q),'equal_class_C':str(equal),'one_third_class_C':str(skew),'prior_over_aggregate':str(p/q)})
    derivative = log(1.5)-log(.5)/3
    theta=0.5; step=0.1
    def marginal(t): return (t,(1-t)/3,2*(1-t)/3)
    h=1e-6
    finite_difference=(kl(marginal(theta+h),prior)-kl(marginal(theta-h),prior))/(2*h)
    assert abs(derivative-finite_difference)<1e-9
    moved=theta-step*derivative
    assert 0<moved<1 and kl(marginal(moved),prior)<marginal_kl
    cdf_gap=F(0); transport=F(0)
    for j in range(2):
        cdf_gap+=prior[j]-aggregate[j]
        transport+=abs(cdf_gap)
    assert transport==F(1,6)
    slope=1+transport/4
    penalized=slope*transport-2*(slope-1)**2
    assert slope==F(25,24) and penalized==F(49,288)
    u=(2.,-1.,2.);v=(-2.,2.,1.)
    norm=lambda a:sqrt(sum(t*t for t in a))
    dot=sum(a*b for a,b in zip(u,v));angle=acos(dot/9)
    assert dot==-4 and norm(u)==norm(v)==3
    paths=[]
    for i in range(41):
        t=i/40
        linear=[(1-t)*a+t*b for a,b in zip(u,v)]
        a=sin((1-t)*angle)/sin(angle);b=sin(t*angle)/sin(angle)
        arc=[a*ui+b*vi for ui,vi in zip(u,v)]
        naive=[a*ui+b*2*vi for ui,vi in zip(u,v)]
        radial=[(1+t)*coord for coord in arc]
        assert abs(norm(arc)-3)<2e-14
        assert abs(norm(radial)-(3+3*t))<2e-14
        paths.append({'t':t,'linear_norm':norm(linear),'arc_norm':norm(arc),'unequal_naive_norm':norm(naive),'unequal_radial_norm':norm(radial)})
    midpoint=paths[20]
    assert abs(midpoint['linear_norm']-sqrt(F(5,2)))<1e-14
    assert abs(midpoint['unequal_naive_norm']-sqrt(F(261,10)))<1e-14
    return {'data_values':x,'data_probabilities':list(map(str,data)), 'conditional':[[str(v) for v in row] for row in conditional], 'joint':[[str(v) for v in row] for row in joint], 'code_rows':rows, 'average_conditional_kl':average_kl,'mutual_information':mutual_information,'marginal_kl':marginal_kl,'mean_decoder':list(map(str,mean_decoder)), 'reconstruction_mse':str(mse),'independent_code_mse':str(independent_mse),'kl_gradient':derivative,'theta_after_step':moved,'kl_after_step':kl(marginal(moved),prior),'gradient_finite_difference':finite_difference,'wasserstein_1':str(transport),'penalty_slope':str(slope),'penalized_objective':str(penalized),'interpolation':{'u':u,'v':v,'cos_angle':str(F(-4,9)),'paths':paths}}


def main():
    root=Path(__file__).resolve().parents[2]
    result=cases()
    path=root/'src/components/figures/alpha-gan/cases.json'
    # Finite-difference diagnostic depends on floating evaluation details.
    result.pop('gradient_finite_difference')
    encoded=json.dumps(result,indent=2)+'\n'
    if '--write' in sys.argv: path.write_text(encoded)
    else: assert path.read_text()==encoded
    print('conditional_KL %.12f = MI %.12f + marginal_KL %.12f' % (result['average_conditional_kl'],result['mutual_information'],result['marginal_kl']))
    print('reconstruction_MSE %s; independent_code_MSE %s' % (result['reconstruction_mse'],result['independent_code_mse']))
    print('code_C equal %s; one_third %s' % ([r['equal_class_C'] for r in result['code_rows']],[r['one_third_class_C'] for r in result['code_rows']]))
    print('KL_gradient %.12f; theta %.12f; new_KL %.12f' % (result['kl_gradient'],result['theta_after_step'],result['kl_after_step']))
    print('W1 %s; penalty_slope %s; penalized_objective %s' % (result['wasserstein_1'],result['penalty_slope'],result['penalized_objective']))
    mid=result['interpolation']['paths'][20]
    print('midpoint_norms %.12f %.12f %.12f %.12f' % (mid['linear_norm'],mid['arc_norm'],mid['unequal_naive_norm'],mid['unequal_radial_norm']))


if __name__=='__main__': main()
