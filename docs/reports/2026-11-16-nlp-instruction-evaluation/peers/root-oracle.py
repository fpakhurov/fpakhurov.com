"""Independent root review: Decimal arithmetic, explicit outcomes and rendered marks."""
from pathlib import Path
from decimal import Decimal as D, getcontext
from fractions import Fraction as F
from math import comb
from html.parser import HTMLParser
import hashlib,json
getcontext().prec=50
root=Path('/Users/fedorpakhurov/code/_work/fp-nlp-instruction-evaluation-drafts')
out=Path('/Users/fedorpakhurov/code/_work/renewal-verification')
saved=json.loads((root/'docs/reports/2026-11-16-nlp-instruction-evaluation/results.json').read_text())
checks=[]
def near(name,a,b):
 assert abs(float(a)-float(b))<2e-12,(name,a,b)
 checks.append(name)
def same(name,a,b):
 assert a==b,(name,a,b)
 checks.append(name)
I=saved['instruction']; E=saved['evaluation']
logs=[[-D(p).ln() for p in row] for row in [['.75','.5'],['.8','.6','.5','.25']]]
for i,row in enumerate(logs):
 for j,v in enumerate(row): near(f'nll/{i}/{j}',v,I['sft']['conversations'][i]['negative_logs'][j])
 near(f'sum/{i}',sum(row),I['sft']['conversations'][i]['sum_nll'])
 near(f'mean/{i}',sum(row)/len(row),I['sft']['conversations'][i]['mean_nll'])
near('token loss',(sum(logs[0])+sum(logs[1]))/6,I['sft']['token_mean_nll'])
near('conversation loss',(sum(logs[0])/2+sum(logs[1])/4)/2,I['sft']['conversation_mean_nll'])
q=[D('.5'),D('.3'),D('.2')];r=[D(0),D(2).ln(),D(4).ln()];star=[D(n)/19 for n in [5,6,8]]
near('partition',D('1.9'),I['reward']['partition'])
for j,p in enumerate(star):near(f'optimum/{j}',p,I['reward']['optimum'][j])
near('optimum objective',D('1.9').ln(),I['reward']['objective_optimum'])
near('reference objective',sum(a*b for a,b in zip(q,r)),I['reward']['objective_reference'])
near('optimum KL',sum(p*(p/t).ln() for p,t in zip(star,q)),I['reward']['kl_optimum_reference'])
# Include boundary distributions absent from the author's positive-grid calculation.
for i,p in enumerate([[D(1),D(0),D(0)],[D(0),D(1),D(0)],[D(0),D(0),D(1)],[D('.2'),D('.2'),D('.6')],star]):
 kl=lambda a,b:sum(x*(x/y).ln() for x,y in zip(a,b) if x)
 objective=sum(x*y for x,y in zip(p,r))-kl(p,q)
 near(f'variational boundary/{i}',objective,D('1.9').ln()-kl(p,star))
 assert objective<=D('1.9').ln()+D('1e-45')
for i,pref in enumerate([F(1,2),F(25,31),F(25,37)]):
 v=D(pref.numerator)/pref.denominator
 near(f'dpo probability/{i}',v,I['dpo'][i]['pair_probability'])
 near(f'dpo nll/{i}',-v.ln(),I['dpo'][i]['loss'])
 near(f'dpo margin derivative/{i}',v-1,I['dpo'][i]['loss_margin_derivative'])
near('BT gap preference',F(3,4),I['reward']['gap_log3_preference'])
near('BT gap loss',(D(4)/3).ln(),I['reward']['gap_log3_nll'])
expected_a=[1]*8+[0]*4;expected_b=[1]*5+[0]*3+[1]*3+[0]
format_a=[1]*8+[0]+[1]*3;format_b=[1]*5+[0]+[1]*5+[0]
for i,row in enumerate(E['fixture']):
 same(f'input sum/{i}',sum(row['inputs']),row['expected'])
 same(f'pass A/{i}',bool(expected_a[i]),row['a']['pass'])
 same(f'pass B/{i}',bool(expected_b[i]),row['b']['pass'])
 same(f'format A/{i}',bool(format_a[i]),row['a']['format'])
 same(f'format B/{i}',bool(format_b[i]),row['b']['format'])
for name,vec in [('a',expected_a),('b',expected_b)]:
 for group,segment in [('nonnegative',vec[:9]),('signed',vec[9:])]:
  same(f'{name}/{group}/passed',sum(segment),E['rates'][name]['groups'][group]['passed'])
 near(f'{name}/micro',F(sum(vec),12),E['rates'][name]['micro'])
 near(f'{name}/macro',(F(sum(vec[:9]),9)+F(sum(vec[9:]),3))/2,E['rates'][name]['macro'])
same('paired contingency',[[5,3],[3,1]],E['paired']['contingency'])
for i,row in enumerate(E['paired']['sign_distribution']):
 same(f'sign binomial/{i}',comb(6,i),row['assignments'])
 near(f'sign probability/{i}',F(comb(6,i),64),row['probability'])
 near(f'sign difference/{i}',F(2*i-6,12),row['difference'])
near('paired p at zero',1,E['paired']['two_sided_p'])
near('retrieval MRR',(F(1)+F(1,3)+F(0)+F(1,2))/4,E['retrieval']['mrr'])
near('retrieval Hit2',F(1,2),E['retrieval']['hit_at_2'])
near('pass2',F(9,15),E['pass_at_k']['value'])
near('raw agreement',F(9,12),E['agreement']['observed'])
near('chance agreement',F(19,36),E['agreement']['chance'])
near('kappa',F(8,17),E['agreement']['kappa'])
same('quantiles',{'0.5':150,'0.9':300,'0.95':900},E['latency']['nearest_rank_quantiles'])
same('order outcomes',[('A','B'),('B','B'),('tie','tie'),('A','A')],[(x['order_ab'],x['order_ba']) for x in E['judge_order']])
expected={'mask':[0,0,0,1,1],'weight':[F(1,3),F(2,3),F(1,2),F(1,2)],'reward':[F(1,2),F(5,19),F(3,10),F(6,19),F(1,5),F(8,19)],'dpo':[F(3,10),F(1,2),F(1,2),F(25,31),F(1,4),F(25,37)],'rate':[F(8,9),F(2,3),0,F(2,3),F(2,3),F(2,3),F(4,9),F(2,3)],'sign':[comb(6,i) for i in range(7)],'latency':[80,100,110,120,150,180,200,240,300,900]}
class Marks(HTMLParser):
 def __init__(self):super().__init__();self.marks={}
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if a.get('data-case') in expected:self.marks.setdefault(a['data-case'],[]).append(a)
for lang in ['en','ru']:
 parser=Marks();parser.feed((out/f'instruction-evaluation-root/instruction-evaluation-{lang}.html').read_text())
 for key,values in expected.items():
  same(f'marks/{lang}/{key}',len(values),len(parser.marks[key]))
  for i,(v,a) in enumerate(zip(values,parser.marks[key])):
   near(f'mark/{lang}/{key}/{i}',v,a['data-value'])
   if key=='sign':near(f'height/{lang}/{key}/{i}',v*7,a['height'])
   elif key!='mask':near(f'width/{lang}/{key}/{i}',float(v)*{'weight':280,'reward':360,'dpo':255,'rate':240,'latency':.24}[key],a['width'])
manifest=json.loads((root/'instruction-evaluation-release-files.json').read_text())
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
for p,h in manifest['files'].items():same('manifest/'+p,h,sha(root/p))
record=json.loads((root/'content-rights/reviews/nlp-instruction-evaluation-renewal.json').read_text())
for p,h in record['files'].items():same('record/'+p,h,sha(root/p))
sources=json.loads((root/'docs/reports/2026-11-16-nlp-instruction-evaluation/source-evidence.json').read_text())
private=0
for source in sources['sources'].values():
 for item in source.get('files',{}).values():
  same('source/'+item['path'],item['sha256'],sha(root/item['path']));private+=1
print(json.dumps({'status':'PASS','assertions':len(checks),'manifestSha256':sha(root/'instruction-evaluation-release-files.json'),'frozenFiles':len(manifest['files']),'recordPins':len(record['files']),'privateSourcePins':private,'checks':checks},indent=2))
