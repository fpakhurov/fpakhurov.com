import cmath, math, json, runpy, subprocess
from decimal import Decimal as D, localcontext
from fractions import Fraction as F
from pathlib import Path

# Portable path only; numerical oracle retained from the independent peer.
base=Path(__file__).resolve().parents[4]
source=base/'scripts/notes/nlp-sequence-cases.py'
saved=(base/'docs/reports/2026-11-13-licensed-source-renewal/nlp-sequence-results.json').read_bytes()
fresh=subprocess.check_output(['python3','-B',str(source)])
assert fresh==saved
r=json.loads(saved); api=runpy.run_path(str(source))

def cs(function, point):
    result=[]
    for k in range(len(point)):
        z=list(map(complex,point));z[k]+=1e-25j
        result.append(function(z).imag/1e-25)
    return result

def gap(a,b):
    assert len(a)==len(b)
    e=max(abs(x-y) for x,y in zip(a,b));assert e<2e-14,e
    return e

def cnn(p):
    # The second valid window is the unique positive maximum in these neighborhoods.
    pooled=p[4]+p[0]*p[9]+p[1]*p[10]+p[2]*p[11]+p[3]*p[12]
    z=p[5]*pooled+p[6]
    return cmath.log(1+cmath.exp(z))-z
cnn_errors=[]
for p in [r['cnn']['hand_parameters'],r['cnn']['updated_parameters']]:
    loss,gradient,trace=api['cnn_loss_gradient'](p)
    assert trace['winner']==1 and trace['preactivations'][1]>0
    cnn_errors.append(gap(cs(cnn,p),gradient))
# Independent two-distinct-feature fit, rather than repeating four message rows.
w=b=0.0
for _ in range(500):
    pos=1/(1+math.exp(-(1.3*w+b)))-1
    neg=1/(1+math.exp(-(.3*w+b)))
    w,b=w-.3*((1.3*pos+.3*neg)/2+.05*w),b-.3*(pos+neg)/2
assert abs(w-r['cnn']['head_fit']['weight'])<1e-12
assert abs(b-r['cnn']['head_fit']['intercept'])<1e-12

def rnn(p):
    state=p[5]
    for x in p[6:]:state=cmath.tanh(p[0]*state+p[1]*x+p[2])
    z=p[3]*state+p[4]
    return cmath.log(1+cmath.exp(z))-z
rnn_error=gap(cs(rnn,r['rnn']['parameters']),r['rnn']['gradient'])

def lstm(p, out):
    h,c=p;x=.4
    sig=lambda z:1/(1+cmath.exp(-z))
    i=sig(.5*x-.1*h+.1);f=sig(-.4*x+.2*h-.2)
    g=cmath.tanh(.3*x+.4*h+.05);o=sig(.2*x-.3*h)
    cell=f*c+i*g
    return o*cmath.tanh(cell) if out==0 else cell
jac=[cs(lambda p:lstm(p,i),[-.2,.6]) for i in range(2)]
gate_error=max(gap(row,target) for row,target in zip(jac,r['gates']['step']['jacobian_state']))
U=((F(1),F(2)),(F(3),F(4)));h=(F(1,5),F(-3,10));reset=(F(1,4),F(3,4))
before=[sum(row[k]*reset[k]*h[k] for k in range(2)) for row in U]
after=[reset[j]*sum(row[k]*h[k] for k in range(2)) for j,row in enumerate(U)]
assert before==[F(-2,5),F(-3,4)] and after==[F(-1,10),F(-9,20)]

def attention(p):
    q=p[:2];h=[p[2:4],p[4:6],p[6:8]]
    masses=[cmath.exp(q[0]*a+q[1]*b) for a,b in h];den=sum(masses)
    c=[sum(m*v[k] for m,v in zip(masses,h))/den for k in range(2)]
    return ((c[0]-.2)**2+(c[1]-.4)**2)/2
att_errors=[]
for p in [r['attention']['parameters'],[.3,-.4,.8,.1,-.2,1.1,1.2,.9]]:
    _,gradient,_=api['attention_loss_gradient'](p);att_errors.append(gap(cs(attention,p),gradient))

with localcontext() as ctx:
    ctx.prec=50
    tanh=lambda z:((2*z).exp()-1)/((2*z).exp()+1)
    enc=D(0)
    for x in [D('.5'),D('-.25')]:enc=tanh(D('.5')*enc+D('.4')*x+D('.1'))
    embeddings=[D(0),D('-.3'),D('.5')]
    ws=list(map(D,['.4','-.3','.2','-.1','.1']));bs=list(map(D,['.2','.1','-.05','0','-.1']))
    state=enc;teacher=[];probs=[]
    for prev,target in zip(embeddings,[1,2,4]):
        state=tanh(D('.6')*state+D('.3')*prev+D('.4')*enc-D('.05'))
        masses=[(w*state+b).exp() for w,b in zip(ws,bs)]
        teacher.append(float(state));probs.append(masses[target]/sum(masses))
    nll=-sum(p.ln() for p in probs)/3
    assert max(abs(x-y['state']) for x,y in zip(teacher,r['seq2seq']['teacher_forced']))<2e-15
    assert abs(float(nll)-r['seq2seq']['mean_teacher_nll'])<2e-15
bleu=math.exp(-.4)*math.sqrt(float(F(4,5)*F(2,3)))
assert abs(bleu-r['seq2seq']['bleu2']['score'])<1e-15
complete=[F(1,20),F(11,20)*F(9,20),F(2,5)*F(9,10)]
assert max(complete)==F(9,25) and complete[1]==F(99,400)
assert 4**6==4096 and 2**8==256
# Readout counts and fixed-gate sensitivity are independent closed calculations.
assert 3*2+3*(2*2+1)+(3+1)==25
assert [g*2*(3+2+1) for g in [1,3,4]]==[12,36,48]
assert 4*2*(3+2+2)==56
result={'freshStdout':'byte-identical Python3.9.7','complexStep':{'cnn13CoordinatesAtTwoPoints':cnn_errors,'rnn9Coordinates':rnn_error,'lstm4JacobianEntries':gate_error,'attention8CoordinatesAtTwoPoints':att_errors},'headFitIndependentTwoRows':{'weight':w,'intercept':b},'teacherStatesDecimal50':teacher,'teacherMeanNllDecimal50':str(nll),'bleu2':bleu,'completedSearchProbabilities':list(map(str,complete)),'gruResetBefore':list(map(str,before)),'gruResetAfter':list(map(str,after)),'scope':'Independent finite numerical review; no browser, full build, CI, production or external benchmark.'}
Path(__file__).with_suffix('.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result,indent=2))
