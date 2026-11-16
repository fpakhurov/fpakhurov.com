"""Original exact finite-law and integration examples; stdlib, no random samples.
Fedor Pakhurov project with Codex assistance, 2026-11-16.
"""
import json
import math
from fractions import Fraction as F
from pathlib import Path
import argparse


def normal_cdf(x):
    return (1+math.erf(x/math.sqrt(2)))/2


def polynomial_integral(coefficients):
    return sum(F(c,k+1) for k,c in enumerate(coefficients))


def square(coefficients):
    product=[F(0)]*(2*len(coefficients)-1)
    for i,a in enumerate(coefficients):
        for j,b in enumerate(coefficients):product[i+j]+=a*b
    return product


def build():
    checks=0
    def eq(a,b):
        nonlocal checks
        assert a==b,(a,b);checks+=1
    def near(a,b):
        nonlocal checks
        assert abs(a-b)<1e-12,(a,b);checks+=1
    values=[-1,2,4];masses=[3,2,1];probabilities=[F(m,6) for m in masses]
    mu=sum(x*p for x,p in zip(values,probabilities))
    variance=sum(p*(x-mu)**2 for x,p in zip(values,probabilities))
    rho=sum(p*abs(x-mu)**3 for x,p in zip(values,probabilities))
    eq(mu,F(5,6));eq(variance,F(137,36));eq(rho,F(641,72))
    law={'values':values,'probabilities':list(map(str,probabilities)),'mean':str(mu),'variance':str(variance),'absoluteThirdCentralMoment':str(rho),'standardizedThirdAbsoluteMoment':float(rho)/float(variance)**1.5}
    # Each polynomial index is S_n+n, so the convolution has nonnegative exponents.
    coefficients=[1];laws={}
    wanted={1,4,6,16,24,64,96,384}
    for n in range(1,385):
        following=[0]*(len(coefficients)+5)
        for i,a in enumerate(coefficients):
            following[i]+=3*a;following[i+3]+=2*a;following[i+5]+=a
        coefficients=following
        if n in wanted:
            denominator=6**n
            eq(sum(coefficients),denominator)
            eq(F(sum((k-n)*a for k,a in enumerate(coefficients)),denominator),n*mu)
            eq(sum(F(a,denominator)*(F(k-n)-n*mu)**2 for k,a in enumerate(coefficients)),n*variance)
            laws[n]=(coefficients[:],denominator)
    # Independent count by category multiplicities, rather than repeated convolution.
    for n in [1,4,6,16,24,64]:
        direct=[0]*(5*n+1)
        for b in range(n+1):
            for c in range(n-b+1):
                a=n-b-c
                direct[3*b+5*c]+=math.comb(n,b)*math.comb(n-b,c)*3**a*2**b
        for actual,expected in zip(laws[n][0],direct):eq(actual,expected)
    weak=[]
    for n in [6,24,96,384]:
        counts,total=laws[n]
        tail=sum(F(a,total) for k,a in enumerate(counts) if abs(F(k-n,n)-mu)>=F(1,2))
        cheb=variance/(n*F(1,2)**2);hoeff=2*math.exp(-2*n*.5**2/25)
        assert float(tail)<=min(1,float(cheb),hoeff)+1e-14;checks+=1
        weak.append({'n':n,'exactTail':str(tail),'tail':float(tail),'chebyshev':float(cheb),'hoeffding':hoeff})
    events=[]
    for n in [4,16,64,256]:
        no_event=F(1)
        for j in range(n,4*n+1):no_event*=F(j+1,j+2)
        eq(no_event,F(n+1,4*n+2))
        events.append({'n':n,'atN':float(F(1,n+2)),'through4N':float(1-no_event)})
    g=[F(1),F(0),F(1)];paired=[F(3,2),F(-1),F(1)]
    integral=polynomial_integral(g);second=polynomial_integral(square(g));v=second-integral**2
    pair_mean=polynomial_integral(paired);pair_v=polynomial_integral(square(paired))-pair_mean**2
    eq(integral,F(4,3));eq(second,F(28,15));eq(v,F(4,45));eq(pair_mean,integral);eq(pair_v,F(1,180))
    budget=[]
    for calls in [4,16,64,256,1024]:
        plain=v/calls;antithetic=pair_v/(calls//2);eq(plain/antithetic,8)
        budget.append({'evaluations':calls,'pairs':calls//2,'plainMse':str(plain),'pairedMse':str(antithetic),'plainRms':math.sqrt(plain),'pairedRms':math.sqrt(antithetic)})
    lln={'law':law,'epsilon':'1/2','weak':weak,'events':events,'monteCarlo':{'integral':str(integral),'secondMoment':str(second),'variance':str(v),'pairVariance':str(pair_v),'budget':budget}}
    cdfs=[];coverage=[]
    for n in [1,4,16,64]:
        counts,total=laws[n];sd=math.sqrt(n*float(variance));cumulative=0;points=[];distance=0;worst=None
        for k,a in enumerate(counts):
            if not a:continue
            value=k-n;z=(value-n*float(mu))/sd
            left=cumulative/total;cumulative+=a;right=cumulative/total;normal=normal_cdf(z)
            local=max(abs(left-normal),abs(right-normal))
            if local>distance:distance=local;worst=value
            points.extend([[z,left],[z,right]])
        eq(cumulative,total)
        bound=3*law['standardizedThirdAbsoluteMoment']/math.sqrt(n)
        assert distance<=bound;checks+=1
        boundary=lambda z: next((y for x,y in reversed(points) if x<=z),0)
        clipped=[[-4,boundary(-4)],*[p for p in points if -4<p[0]<=4],[4,boundary(4)]]
        assert all(-4<=x<=4 and 0<=y<=1 for x,y in clipped);checks+=1
        cdfs.append({'n':n,'points':points,'plotPoints':clipped,'kolmogorov':distance,'worstSum':worst,'berryEsseenConstant3':bound})
        if n>1:
            lower=math.ceil(n*float(mu)-1.96*sd);upper=math.floor(n*float(mu)+1.96*sd)
            exact=F(sum(a for k,a in enumerate(counts) if lower<=k-n<=upper),total)
            coverage.append({'n':n,'standardError':math.sqrt(float(variance)/n),'halfWidth':1.96*math.sqrt(float(variance)/n),'lowerSum':lower,'upperSum':upper,'coverage':float(exact),'exactCoverage':str(exact)})
    n=16;counts,total=laws[n];sd=math.sqrt(n*float(variance));lower=8;upper=22
    exact=F(sum(a for k,a in enumerate(counts) if lower<=k-n<=upper),total)
    uncorrected=normal_cdf((upper-n*float(mu))/sd)-normal_cdf((lower-n*float(mu))/sd)
    corrected=normal_cdf((upper+.5-n*float(mu))/sd)-normal_cdf((lower-.5-n*float(mu))/sd)
    interval={'n':n,'lower':lower,'upper':upper,'exact':str(exact),'probability':float(exact),'uncorrected':uncorrected,'continuityCorrected':corrected}
    normal=[[x/40,normal_cdf(x/40)] for x in range(-160,161)]
    # Alternating +/-Z, Z uniform on {-3,3}: identical marginals but no common-space convergence.
    modes=[]
    for n in range(1,9):
        outcomes=[((-1)**n)*z for z in [-3,3]]
        same=sum(abs(x-z)>1 for x,z in zip(outcomes,[-3,3]))/2
        eq(sorted(outcomes),[-3,3]);eq(same,1 if n%2 else 0)
        modes.append({'n':n,'atZminus3':outcomes[0],'atZplus3':outcomes[1],'probabilityDistanceFromZAbove1':same})
    clt={'law':law,'cdfs':cdfs,'normalCdf':normal,'interval':interval,'knownSigmaCoverage':coverage,'normalNominalCoverage':normal_cdf(1.96)-normal_cdf(-1.96),'modes':modes}
    return lln,clt,checks


def main():
    parser=argparse.ArgumentParser();parser.add_argument('--write',action='store_true');args=parser.parse_args();root=Path(__file__).resolve().parents[2]
    lln,clt,checks=build()
    for slug,data in [('law-of-large-numbers',lln),('central-limit-theorem',clt)]:
        target=root/'src/components/figures'/slug/'cases.json';text=json.dumps(data,indent=2,allow_nan=False)+'\n'
        if args.write:target.write_text(text)
        else:assert target.read_text()==text
    result={'law':lln['law'],'weak':[{k:v for k,v in row.items() if k!='exactTail'} for row in lln['weak']],'events':lln['events'],'monteCarlo':lln['monteCarlo'],'clt':[{'n':r['n'],'kolmogorov':r['kolmogorov'],'berryEsseenConstant3':r['berryEsseenConstant3']} for r in clt['cdfs']],'interval':clt['interval'],'coverage':clt['knownSigmaCoverage'],'normalNominalCoverage':clt['normalNominalCoverage'],'assertions':checks}
    print(json.dumps(result,indent=2,allow_nan=False))


if __name__=='__main__':main()
