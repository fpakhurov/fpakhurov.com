import json, math, re
from decimal import Decimal as D, getcontext
from fractions import Fraction as F
from pathlib import Path
from collections import Counter
from html.parser import HTMLParser
getcontext().prec=55
root=Path('/Users/fedorpakhurov/code/_work/fp-nlp-instruction-evaluation-drafts')
out=Path(__file__).parent
saved=json.loads((root/'docs/reports/2026-11-16-nlp-instruction-evaluation/results.json').read_text())
n=0; error=0

def check(a,b,tol=2e-13):
 global n,error
 n+=1
 if isinstance(a,(float,D,F)) or isinstance(b,(float,D,F)):
  delta=abs(float(a)-float(b));error=max(error,delta);assert delta<=tol,(a,b,delta)
 else:assert a==b,(a,b)

I=saved['instruction']; E=saved['evaluation']
probs=[list(map(D,['.75','.5'])),list(map(D,['.8','.6','.5','.25']))]
seqs=[['BOS','USER','x','ASSISTANT','a','EOS'],['BOS','USER','u','ASSISTANT','b','c','d','EOS']]
loss=[]
for c,p,seq in zip(I['sft']['conversations'],probs,seqs):
 check(c['tokens'],seq);check(c['scored_positions'],list(range(4,len(seq))));vals=[-x.ln() for x in p]
 for a,b in zip(c['negative_logs'],vals):check(a,b)
 check(c['sum_nll'],sum(vals));check(c['mean_nll'],sum(vals)/len(p));loss.append(sum(vals))
check(I['sft']['scored_tokens'],6);check(I['sft']['token_mean_nll'],sum(loss)/6);check(I['sft']['conversation_mean_nll'],(loss[0]/2+loss[1]/4)/2)
q=list(map(D,['.5','.3','.2']));r=[D(0),D(2).ln(),D(4).ln()];z=D('1.9');opt=[D(5)/19,D(6)/19,D(8)/19]
def KL(p,q):return sum(x*(x/y).ln() for x,y in zip(p,q) if x)
def J(p):return sum(x*y for x,y in zip(p,r))-KL(p,q)
for key,vals in [('reference',q),('rewards',r),('unnormalized',[D('.5'),D('.6'),D('.8')]),('optimum',opt)]:
 for a,b in zip(I['reward'][key],vals):check(a,b)
for key,val in [('beta',1),('partition',z),('kl_optimum_reference',KL(opt,q)),('objective_reference',J(q)),('objective_optimum',z.ln()),('gap_log3_preference',D(3)/4),('gap_log3_nll',-(D(3)/4).ln())]:check(I['reward'][key],val)
# Independent Decimal grid including zero-mass boundary faces, not the author's interior grid.
grid=0
for a in range(41):
 for b in range(41-a):
  p=[D(a)/40,D(b)/40,D(40-a-b)/40]
  check(J(p),z.ln()-KL(p,opt));check(J(p)<=z.ln()+D('1e-50'),True);grid+=1
check(I['grid_identity_checks'],math.comb(49,2))
policies=[q,list(map(D,['.2','.5','.3'])),list(map(D,['.2','.25','.55']))]
for row,p in zip(I['dpo'],policies):
 odds=(p[1]*q[0])/(p[0]*q[1]);s=odds.ln();pref=odds/(1+odds)
 for key,val in [('margin',s),('pair_probability',pref),('loss',-pref.ln()),('loss_margin_derivative',pref-1)]:check(row[key],val)
 # derivative via high precision symmetric difference of softplus(-margin)
 h=D('1e-12');v=((1+(-s-h).exp()).ln()-(1+(-s+h).exp()).ln())/(2*h);check(v,pref-1)
 for a,b in zip(row['policy'],p):check(a,b)
check(I['dpo'][2]['policy'][1]<I['dpo'][0]['policy'][1],True);check(I['dpo'][2]['loss']<I['dpo'][0]['loss'],True)
# Grade all authored answers using an independent single-key integer JSON syntax recognizer.
pairs=[(1,4),(2,5),(3,1),(4,6),(5,2),(6,3),(2,8),(7,4),(9,2),(-3,7),(8,-5),(-4,-2)]
graded={'a':[],'b':[]}; formats={'a':[],'b':[]}
for i,(row,pair) in enumerate(zip(E['fixture'],pairs)):
 check(row['inputs'],list(pair));check(row['expected'],sum(pair));check(row['id'],i+1);check(row['group'],'nonnegative' if i<9 else 'signed')
 for k in ['a','b']:
  m=re.fullmatch(r'\s*\{\s*"sum"\s*:\s*(-?(?:0|[1-9][0-9]*))\s*\}\s*',row['output_'+k]);fmt=bool(m);good=fmt and int(m[1])==sum(pair)
  check(row[k],{'format':fmt,'value':good,'pass':good});graded[k].append(good);formats[k].append(fmt)
for k in ['a','b']:
 vals=graded[k];g=[F(sum(vals[:9]),9),F(sum(vals[9:]),3)]
 check(E['rates'][k]['passed'],sum(vals));check(E['rates'][k]['total'],12);check(E['rates'][k]['micro'],F(sum(vals),12));check(E['rates'][k]['macro'],sum(g)/2);check(E['rates'][k]['format_passed'],sum(formats[k]))
 for name,slice_,rate in [('nonnegative',vals[:9],g[0]),('signed',vals[9:],g[1])]:
  check(E['rates'][k]['groups'][name]['passed'],sum(slice_));check(E['rates'][k]['groups'][name]['total'],len(slice_));check(E['rates'][k]['groups'][name]['rate'],rate)
cont=Counter(zip(graded['a'],graded['b']));check(E['paired']['contingency'],[[cont[True,True],cont[True,False]],[cont[False,True],cont[False,False]]])
for j,row in enumerate(E['paired']['sign_distribution']):
 check(row['assignments'],math.comb(6,j));check(row['difference'],F(2*j-6,12));check(row['probability'],F(math.comb(6,j),64))
check(E['paired']['assignments'],2**6);check(E['paired']['two_sided_p'],1);check(E['paired']['difference'],0)
check(E['retrieval']['first_relevant_ranks'],[1,3,None,2]);check(E['retrieval']['hit_at_2'],F(1,2));check(E['retrieval']['mrr'],F(11,24))
for key,val in [('n',6),('c',2),('k',2),('subsets',15),('value',F(3,5))]:check(E['pass_at_k'][key],val)
# Ordered sampling without replacement gives the same ratio, independently of subset implementation.
win=total=0
for a in range(6):
 for b in range(6):
  if a!=b:total+=1;win+=int(a<2 or b<2)
check(F(win,total),F(3,5))
check(E['judge_order'],[{'item':i+1,'order_ab':a,'order_ba':b} for i,(a,b) in enumerate([('A','B'),('B','B'),('tie','tie'),('A','A')])])
check(E['agreement']['table'],[[6,2],[1,3]]);po=F(9,12);pe=F(8*7+4*5,144)
check(E['agreement']['observed'],po);check(E['agreement']['chance'],pe);check(E['agreement']['kappa'],(po-pe)/(1-pe))
times=[80,100,110,120,150,180,200,240,300,900];check(E['latency']['milliseconds'],times)
for p in ['0.5','0.9','0.95']:
 # Empirical CDF inversion, not ceil-index implementation.
 quant=next(t for t in times if F(sum(x<=t for x in times),10)>=F(p));check(E['latency']['nearest_rank_quantiles'][p],quant)
class Parser(HTMLParser):
 def __init__(self):super().__init__();self.tagged=[];self.svg=0;self.ids=[];self.refs=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='svg':self.svg+=1
  if 'id' in a:self.ids.append(a['id'])
  if 'aria-labelledby' in a:self.refs+=a['aria-labelledby'].split()
  if 'data-case' in a:self.tagged.append((tag,a))
render=[]
for lang in ['en','ru']:
 parser=Parser();parser.feed((out/'render'/('instruction-evaluation-'+lang+'.html')).read_text());check(parser.svg,8);check(len(parser.ids),len(set(parser.ids)))
 for x in parser.refs:check(x in parser.ids,True)
 counts=Counter()
 for tag,a in parser.tagged:
  key=a['data-case'];i=int(a.get('data-index','0'));j=int(a.get('data-series','0'));counts[key]+=1
  if key=='judge':check(a['data-ab'],['A','B','tie','A'][i]);check(a['data-ba'],['B','B','tie','A'][i]);continue
  expected={'mask':[0,0,0,1,1][i] if key=='mask' else 0,'reward':[q,opt][j][i] if key=='reward' else 0,'dpo':([p[1] for p in policies] if j==0 else [D('.5'),D(25)/31,D(25)/37])[i] if key=='dpo' else 0,'rate':[[F(8,9),0,F(2,3),F(4,9)],[F(2,3)]*4][j][i] if key=='rate' else 0,'sign':math.comb(6,i),'latency':times[i] if key=='latency' else 0}
  if key=='weight':row=int(a['data-row']);v=[[F(1,3),F(2,3)],[F(1,2),F(1,2)]][row][i]
  else:v=expected[key]
  check(float(a['data-value']),v)
  if key=='mask':continue
  scales={'weight':280,'reward':360,'dpo':255,'rate':240,'sign':7,'latency':F(6,25)}
  check(float(a['height' if key=='sign' else 'width']),v*scales[key])
  if key=='sign':check(float(a['y']),205-7*v);check(float(a['x']),29+i*40)
  elif key=='weight':check(float(a['x']),20+(0 if i==0 else float([[F(1,3),F(2,3)],[F(1,2),F(1,2)]][row][0])*280));check(float(a['y']),65+row*100)
  elif key=='reward':check(float(a['x']),64);check(float(a['y']),58+i*74+j*23)
  elif key=='dpo':check(float(a['x']),18);check(float(a['y']),70+i*85+j*24)
  elif key=='rate':check(float(a['x']),20);check(float(a['y']),47+i*77+j*21)
  elif key=='latency':check(float(a['x']),62);check(float(a['y']),40+i*29)
 render.append({'locale':lang,'caseCounts':dict(counts),'svg':parser.svg})
result={'status':'PASS','assertions':n,'maximumAbsoluteDifference':error,'decimalPrecision':55,'independentBoundaryGrid':grid,'render':render,'method':'Independent Decimal logarithms/derivatives including boundary simplex; regex contract grade; rational pair counts/binomial sign coefficients/ordered candidate draws/CDF quantiles; actual SVG data and x/y/width/height from independently computed values.'}
(out/'oracle.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2))
