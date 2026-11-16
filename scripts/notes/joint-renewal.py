"""Original exact joint-distribution fixtures, project work with AI assistance.

All finite tables, sign variables and polynomial inputs are specified here.
No external data, simulation, model or third-party implementation is used.
"""
from fractions import Fraction as F
from itertools import product
from collections import defaultdict
from math import comb
import json


def joint_case():
    xs=[0,1,3];ys=[0,2,5];counts=[[6,4,2],[2,8,2],[4,2,6]]
    total=sum(map(sum,counts));assert total==36
    joint={(x,y):F(counts[i][j],total) for i,x in enumerate(xs) for j,y in enumerate(ys)}
    px={x:sum(p for (a,b),p in joint.items() if a==x) for x in xs}
    py={y:sum(p for (a,b),p in joint.items() if b==y) for y in ys}
    ex=sum(x*p for x,p in px.items());ey=sum(y*p for y,p in py.items())
    exy=sum(x*y*p for (x,y),p in joint.items())
    vx=sum((x-ex)**2*p for x,p in px.items());vy=sum((y-ey)**2*p for y,p in py.items())
    cov=exy-ex*ey
    assert (ex,ey,exy,vx,vy,cov)==(F(4,3),F(13,6),F(32,9),F(14,9),F(137,36),F(2,3))
    assert cov*cov/(vx*vy)==F(72,959)
    conditional={y:joint[1,y]/px[1] for y in ys}
    assert list(conditional.values())==[F(1,6),F(2,3),F(1,6)]
    assert joint[1,2]!=px[1]*py[2]
    # Positive, normalized polynomial on [0,1]^2.
    # f = 3/2 - x - y + 2xy, integrated monomial by monomial.
    polynomial={(0,0):F(3,2),(1,0):F(-1),(0,1):F(-1),(1,1):F(2)}
    integral=lambda ax,ay:sum(c/F(i+ax+1)/F(j+ay+1) for (i,j),c in polynomial.items())
    assert {i:sum(c/F(j+1) for (a,j),c in polynomial.items() if a==i) for i in [0,1]}=={0:F(1),1:F(0)}
    assert {j:sum(c/F(i+1) for (i,b),c in polynomial.items() if b==j) for j in [0,1]}=={0:F(1),1:F(0)}
    corners=[sum(c*x**i*y**j for (i,j),c in polynomial.items()) for x,y in product([0,1],repeat=2)]
    assert min(corners)==F(1,2) and max(corners)==F(3,2)
    assert integral(0,0)==1 and integral(1,0)==integral(0,1)==F(1,2)
    continuous_cov=integral(1,1)-F(1,4);assert continuous_cov==F(1,72)
    assert integral(2,0)-F(1,4)==F(1,12)
    half_integral=lambda ax,ay:sum(c*(1-F(1,2)**(i+ax+1))/F(i+ax+1)*(1-F(1,2)**(j+ay+1))/F(j+ay+1) for (i,j),c in polynomial.items())
    assert half_integral(0,0)==F(9,32)
    continuous_means={str(x):sum(c*x**i/F(j+2) for (i,j),c in polynomial.items()) for x in [F(1,4),F(3,4)]}
    assert continuous_cov/F(1,12)==F(1,6)
    assert list(continuous_means.values())==[F(11,24),F(13,24)]
    # Same uniform marginals: an independent grid versus a dependent five-point table.
    cx=[-2,0,2];cy=[-1,0,1];dependent_counts=[[1,0,1],[0,2,0],[1,0,1]]
    d={(x,y):F(dependent_counts[i][j],6) for i,x in enumerate(cx) for j,y in enumerate(cy)}
    independent={(x,y):F(1,9) for x,y in product(cx,cy)}
    for table in [d,independent]:
        assert sum(table.values())==1
        assert all(sum(p for (x,y),p in table.items() if x==a)==F(1,3) for a in cx)
        assert all(sum(p for (x,y),p in table.items() if y==b)==F(1,3) for b in cy)
        assert sum(x*p for (x,y),p in table.items())==sum(y*p for (x,y),p in table.items())==0
        assert sum(x*y*p for (x,y),p in table.items())==0
        assert sum(x*x*p for (x,y),p in table.items())==F(8,3)
        assert sum(y*y*p for (x,y),p in table.items())==F(2,3)
    assert d[0,0]==F(1,3)!=F(1,9)
    # Shared sign plus two times an individual sign; exact finite populations.
    average_variances={}
    for n in [1,4,16,64]:
        mean=F(0);second=F(0)
        for shared in [-1,1]:
            for plus in range(n+1):
                weight=F(comb(n,plus),2**(n+1))
                avg=F(shared)+F(2*(2*plus-n),n)
                mean+=weight*avg;second+=weight*avg*avg
        assert mean==0 and second==1+F(4,n)
        average_variances[str(n)]=str(second)
    four=[tuple(c+2*e for e in es) for c in [-1,1] for es in product([-1,1],repeat=4)]
    assert F(sum(row[0]**2 for row in four),32)==5
    assert F(sum(row[0]*row[1] for row in four),32)==1
    assert sum((F(sum(row),4))**2 for row in four)/32==2
    # A finite negative-correlation boundary: subtract a shared sample mean.
    centered=[tuple(F(e)-F(sum(es),4) for e in es) for es in product([-1,1],repeat=4)]
    assert all(sum(row)==0 for row in centered)
    assert sum(row[0]**2 for row in centered)/16==F(3,4)
    assert sum(row[0]*row[1] for row in centered)/16==F(-1,4)
    # Independent sum with two distinct paths to value six.
    a={1:F(2,3),4:F(1,3)};b={0:F(1,2),2:F(1,3),5:F(1,6)};convolution=defaultdict(F)
    for x,p in a.items():
        for y,q in b.items():convolution[x+y]+=p*q
    assert dict(convolution)=={1:F(1,3),3:F(2,9),4:F(1,6),6:F(2,9),9:F(1,18)}
    assert sum(convolution.values())==1 and convolution[6]==F(2,9)
    assert sum(s*p for s,p in convolution.items())==F(7,2)
    return {'x_values':xs,'y_values':ys,'counts':counts,'total':total,'px':{str(k):str(v) for k,v in px.items()},'py':{str(k):str(v) for k,v in py.items()},'conditional_y_given_x1':{str(k):str(v) for k,v in conditional.items()},'EX':str(ex),'EY':str(ey),'EXY':str(exy),'varX':str(vx),'varY':str(vy),'covariance':str(cov),'correlation_squared':str(cov*cov/(vx*vy)),'continuous':{'mass':str(integral(0,0)),'EXY':str(integral(1,1)),'covariance':str(continuous_cov),'correlation':'1/6','both_above_half':str(half_integral(0,0)),'conditional_means':{k:str(v) for k,v in continuous_means.items()}},'zero_covariance':{'x_values':cx,'y_values':cy,'dependent_counts':dependent_counts,'dependent_denominator':6,'independent_denominator':9,'varX':'8/3','varY':'2/3','covariance':'0'},'shared_sign':{'single_variance':'5','pair_covariance':'1','pair_correlation':'1/5','average_variances':average_variances,'four_population':len(four)},'negative_boundary':{'n':4,'variance':'3/4','covariance':'-1/4','correlation':'-1/3','average_variance':'0'},'convolution':{str(s):str(p) for s,p in sorted(convolution.items())}}


if __name__=='__main__':
    print(json.dumps(joint_case(),indent=2))
