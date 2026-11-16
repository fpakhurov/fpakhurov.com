"""Original finite-law and concentration calculations; stdlib, no random trials."""
import argparse
import json
import math
from fractions import Fraction as F
from pathlib import Path


def squared_risk(values, probabilities, prediction):
    return sum(p*(y-prediction)**2 for y,p in zip(values,probabilities))


def absolute_risk(values, probabilities, prediction):
    return sum(p*abs(y-prediction) for y,p in zip(values,probabilities))


def binary_kl(q, p):
    return q*math.log(q/p)+(1-q)*math.log((1-q)/(1-p))


def binomial_row(n):
    # Exact rational law for p=2/5. Thresholds are integer since n is a multiple of 10.
    numerator = [math.comb(n,k)*2**k*3**(n-k) for k in range(n+1)]
    denominator = 5**n
    low, high = 3*n//10, n//2
    probability = F(sum(numerator[:low+1])+sum(numerator[high:]),denominator)
    recurrence = [(3/5)**n]
    for k in range(n):
        recurrence.append(recurrence[-1]*(n-k)/(k+1)*2/3)
    direct_float = sum(recurrence[:low+1])+sum(recurrence[high:])
    assert abs(float(probability)-direct_float) < 2e-14
    assert sum(numerator) == denominator
    assert sum(k*x for k,x in enumerate(numerator)) == F(2*n,5)*denominator
    assert F(sum((F(k)-F(2*n,5))**2*x for k,x in enumerate(numerator)),denominator)==F(6*n,25)
    chebyshev = F(24,n)
    hoeffding = 2*math.exp(-n/50)
    chernoff = math.exp(-n*binary_kl(0.3,0.4))+math.exp(-n*binary_kl(0.5,0.4))
    for bound in (float(chebyshev),hoeffding,chernoff):
        assert float(probability) <= bound+1e-14
    return {'n':n,'lowerCount':low,'upperCount':high,'exactProbability':str(probability),
            'actual':float(probability),'chebyshev':float(chebyshev),
            'hoeffding':hoeffding,'chernoff':chernoff}


def build():
    checks = 0
    def equal(a,b):
        nonlocal checks
        assert a==b,(a,b)
        checks+=1
    def near(a,b,tolerance=1e-11):
        nonlocal checks
        assert abs(a-b)<tolerance,(a,b)
        checks+=1
    values=[F(0),F(2),F(6)]
    weights=[F(1,4),F(1,2),F(1,4)]
    probabilities=[[F(1,2),F(1,4),F(1,4)], [F(1,4),F(1,2),F(1,4)], [F(0),F(1,4),F(3,4)]]
    means=[sum(y*p for y,p in zip(values,row)) for row in probabilities]
    variances=[squared_risk(values,row,m) for row,m in zip(probabilities,means)]
    equal(means,[F(2),F(5,2),F(5)])
    equal(variances,[F(6),F(19,4),F(3)])
    for row in probabilities:equal(sum(row),1)
    joint=[[w*p for p in row] for w,row in zip(weights,probabilities)]
    marginal=[sum(row[i] for row in joint) for i in range(3)]
    mean=sum(y*p for y,p in zip(values,marginal))
    total=squared_risk(values,marginal,mean)
    within=sum(w*v for w,v in zip(weights,variances))
    between=sum(w*(m-mean)**2 for w,m in zip(weights,means))
    equal(mean,3);equal(total,6);equal(within,F(37,8));equal(between,F(11,8));equal(total,within+between)
    alternate=[F(1),F(3),F(4)]
    alt_risk=sum(w*squared_risk(values,row,a) for w,row,a in zip(weights,probabilities,alternate))
    excess=sum(w*(m-a)**2 for w,m,a in zip(weights,means,alternate))
    equal(alt_risk,F(21,4));equal(excess,F(5,8));equal(alt_risk,within+excess)
    coarse_probabilities=[(joint[0][i]+joint[1][i])/F(3,4) for i in range(3)]
    coarse_mean=sum(y*p for y,p in zip(values,coarse_probabilities))
    coarse_variance=squared_risk(values,coarse_probabilities,coarse_mean)
    coarse_risk=F(3,4)*coarse_variance+F(1,4)*variances[2]
    equal(coarse_mean,F(7,3));equal(coarse_variance,F(47,9));equal(coarse_risk,F(14,3));equal(coarse_risk-within,F(1,24))
    equal((weights[0]*means[0]+weights[1]*means[1])/F(3,4),coarse_mean)
    medians=[F(0),F(2),F(6)]
    median_risk=sum(w*absolute_risk(values,row,a) for w,row,a in zip(weights,probabilities,medians))
    mean_abs_risk=sum(w*absolute_risk(values,row,a) for w,row,a in zip(weights,probabilities,means))
    mode_error=sum(w*(1-max(row)) for w,row in zip(weights,probabilities))
    equal(median_risk,F(3,2));equal(mean_abs_risk,F(7,4));equal(mode_error,F(7,16))
    curves=[]
    for label,w,row,m,v in zip('ABC',weights,probabilities,means,variances):
        grid=[]
        for i in range(121):
            a=F(i,20)
            risk=squared_risk(values,row,a)
            equal(risk,v+(m-a)**2)
            if label=='A' and a<=2:equal(absolute_risk(values,row,a),2)
            grid.append([float(a),float(risk)])
        curves.append({'label':label,'weight':str(w),'probabilities':list(map(str,row)),
                       'mean':str(m),'variance':str(v),'points':grid})
    # Centering removes conditional means but not conditional variation.
    for row,m in zip(probabilities,means):equal(sum((y-m)*p for y,p in zip(values,row)),0)
    conditional={'values':list(map(str,values)), 'groups':curves,'joint':[[str(p) for p in row] for row in joint],
                 'marginal':list(map(str,marginal)),'mean':str(mean),'totalVariance':str(total),
                 'withinVariance':str(within),'betweenVariance':str(between),
                 'alternativePredictions':list(map(str,alternate)),'alternativeMse':str(alt_risk),'alternativeExcess':str(excess),
                 'coarseMean':str(coarse_mean),'coarseVariance':str(coarse_variance),'coarseMse':str(coarse_risk),
                 'refinementGain':str(coarse_risk-within),'medianAbsoluteRisk':str(median_risk),
                 'meanAbsoluteRisk':str(mean_abs_risk),'modeError':str(mode_error)}
    rows=[]
    for n in range(40,401,10):
        rows.append(binomial_row(n));checks+=7
    primary=next(row for row in rows if row['n']==150)
    for q in (0.3,0.5):
        lam=math.log(q*(1-0.4)/(0.4*(1-q)))
        psi=-lam*150*q+150*math.log(0.6+0.4*math.exp(lam))
        near(psi,-150*binary_kl(q,0.4))
        derivative=-q+0.4*math.exp(lam)/(0.6+0.4*math.exp(lam))
        near(derivative,0)
    for i in range(-100,101):
        lam=i/10
        log_mgf=-0.4*lam+math.log(0.6+0.4*math.exp(lam))
        assert log_mgf<=lam*lam/8+1e-12;checks+=1
    validation=[]
    for models in range(1,257):
        epsilon=math.sqrt(math.log(2*models/0.05)/(2*1200))
        near(2*models*math.exp(-2*1200*epsilon*epsilon),0.05)
        validation.append([models,epsilon])
    eps12=validation[11][1]
    concentration={'p':'2/5','epsilon':'1/10','main':primary,'tailRows':rows,
                   'directMarkovOneSided':0.8,'sampleMeanVariance':float(F(6,25*150)),
                   'validation':{'n':1200,'delta':0.05,'models':12,'epsilon':eps12,'empiricalCount':108,
                                  'empiricalError':108/1200,'upperRisk':108/1200+eps12,'curve':validation},
                   'dependenceCounterexample':{'n':150,'varianceIfRepeated':float(F(6,25)),
                                              'twoSidedDeviationProbability':1.0}}
    return conditional,concentration,checks


def main():
    parser=argparse.ArgumentParser();parser.add_argument('--write',action='store_true');args=parser.parse_args()
    conditional,concentration,checks=build();root=Path(__file__).resolve().parents[2]
    for slug,data in [('conditional-expectation',conditional),('inequalities-and-concentration',concentration)]:
        p=root/'src/components/figures'/slug/'cases.json';text=json.dumps(data,ensure_ascii=False,indent=2)+'\n'
        if args.write:p.write_text(text)
        else:assert p.read_text()==text,'Fixture mismatch: '+str(p)
    print('conditional means:', ' '.join(row['mean'] for row in conditional['groups']))
    print('conditional variances:', ' '.join(row['variance'] for row in conditional['groups']))
    print('variance total='+conditional['totalVariance']+' within='+conditional['withinVariance']+' between='+conditional['betweenVariance'])
    print('MSE constant='+conditional['totalVariance']+' coarse='+conditional['coarseMse']+' full='+conditional['withinVariance']+' alternative='+conditional['alternativeMse'])
    print('absolute risk median='+conditional['medianAbsoluteRisk']+' mean='+conditional['meanAbsoluteRisk']+'; mode error='+conditional['modeError'])
    row=concentration['main']
    print(f"tail n={row['n']} counts<={row['lowerCount']} or >={row['upperCount']}")
    print(' '.join(f'{key}={row[key]:.9f}' for key in ['actual','chebyshev','hoeffding','chernoff']))
    val=concentration['validation'];print(f"validation epsilon={val['epsilon']:.9f} upper_risk={val['upperRisk']:.9f}")
    print('deterministic assertions:',checks)


if __name__=='__main__':main()
