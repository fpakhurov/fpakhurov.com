#!/usr/bin/env python3
"""Original preview feature-time and small linear-model provenance fixtures.

Authored for Fedor Pakhurov's project with Codex assistance; all values fictional.
Standard library only. No untrusted serialization, model or external data is loaded.
"""
import argparse
import hashlib
import json
import math
from pathlib import Path


def digest(value):
    return hashlib.sha256(json.dumps(value,sort_keys=True,separators=(",",":"),allow_nan=False).encode()).hexdigest()


def point_in_time(rows,card,prediction_hour,ttl=None,require_available=True):
    candidates=[r for r in rows if r['card']==card and r['event_hour']<=prediction_hour
                and (not require_available or r['available_hour']<=prediction_hour)
                and (ttl is None or prediction_hour-r['event_hour']<=ttl)]
    seen = {}
    for row in candidates:
        key = (row['event_hour'], row['available_hour'])
        if key in seen and seen[key] != row['contrast']:
            raise ValueError('Conflicting values for the same feature clock key')
        seen[key] = row['contrast']
    if not candidates:return None
    return max(candidates,key=lambda r:(r['event_hour'],r['available_hour']))['contrast']


def features():
    rows=[dict(card=card,event_hour=e,available_hour=a,contrast=c)
          for card,e,a,c in [('A',8,8,.2),('A',8,20,.9),('A',25,25,.4),
                             ('B',7,7,.7),('B',9,15,.1)]]
    decisions=[('A',10),('B',10),('A',30)]
    correct=[point_in_time(rows,*item) for item in decisions]
    event_only=[point_in_time(rows,*item,require_available=False) for item in decisions]
    latest=[point_in_time(rows,card,100) for card,_ in decisions]
    stale=[point_in_time(rows,*item,ttl=4) for item in decisions]
    assert correct==[.2,.7,.4] and event_only==[.9,.1,.4] and latest==[.4,.1,.4]
    assert stale==[.2,.7,None]
    assert point_in_time(rows + [dict(rows[0])], 'A', 10) == .2
    try:
        point_in_time(rows + [{**rows[0], 'contrast': .3}], 'A', 10)
    except ValueError:
        pass
    else:
        raise AssertionError('Ambiguous clock-key ties must be rejected')
    future_conflict = {**rows[2], 'contrast': .6}
    assert point_in_time(rows + [future_conflict], 'A', 10) == .2
    changes=sum((a<.5)!=(b<.5) for a,b in zip(correct,event_only))
    assert changes==2
    return {'feature_rows':rows,'decisions':[dict(card=c,hour=h) for c,h in decisions],
            'available_point_in_time':correct,'event_time_only':event_only,'latest_now':latest,
            'ttl_four_hours':stale,'event_time_only_decision_disagreements':changes,
            'training_mean':sum(correct)/len(correct),'centered_features':[x-sum(correct)/len(correct) for x in correct]}


def predict(model,x):return model['weight']*x+model['bias']


def mse(model,rows):return sum((predict(model,x)-y)**2 for x,y in rows)/len(rows)


def registry():
    training=[(0,1),(1,2),(2,4)]
    evaluation=[(3,5),(4,7)]
    mean_x=sum(x for x,_ in training)/len(training)
    mean_y=sum(y for _,y in training)/len(training)
    weight=sum((x-mean_x)*(y-mean_y) for x,y in training)/sum((x-mean_x)**2 for x,_ in training)
    candidate={'weight':weight,'bias':mean_y-weight*mean_x}
    baseline={'weight':0.0,'bias':mean_y}
    assert math.isclose(weight,1.5) and math.isclose(candidate['bias'],5/6)
    assert math.isclose(mse(candidate,training),1/18)
    assert math.isclose(mse(candidate,evaluation),5/72)
    assert math.isclose(mse(baseline,training),14/9)
    assert math.isclose(mse(baseline,evaluation),130/9)
    dataset={'training':training,'evaluation':evaluation,'split':'separate-authored-inputs-v1'}
    source_id=digest(dataset)
    runs=[]
    for name,model in [('constant-v1',baseline),('ols-v1',candidate)]:
        run={'algorithm':name,'data_sha256':source_id,'parameters':model,
             'training_mse':mse(model,training),'evaluation_mse':mse(model,evaluation)}
        runs.append({'id':digest(run),'record':run})
    versions={str(i+1):run['id'] for i,run in enumerate(runs)}
    aliases={'serving':'1'}
    captured=aliases['serving']
    gate=runs[1]['record']['evaluation_mse']<=.1
    assert gate
    aliases['serving']='2'
    assert captured=='1' and aliases['serving']=='2'
    restored=json.loads(json.dumps(candidate,allow_nan=False))
    assert all(predict(restored,x)==predict(candidate,x) for x,_ in evaluation)
    return {'training':training,'evaluation':evaluation,'data_sha256':source_id,'runs':runs,
            'versions':versions,'captured_request_version':captured,'current_alias_version':aliases['serving'],
            'release_gate_mse_at_most_point_one':gate,
            'candidate_evaluation_predictions':[predict(candidate,x) for x,_ in evaluation],
            'json_roundtrip_exact':True}


def main():
    parser=argparse.ArgumentParser();parser.add_argument('--output',type=Path);args=parser.parse_args()
    result={'kind':'original synthetic feature-time and scalar regression fixtures; not a registry service integration',
            'features-and-skew':features(),'experiments-and-registry':registry()}
    text=json.dumps(result,ensure_ascii=False,indent=2,allow_nan=False)+'\n'
    if args.output:args.output.write_text(text)
    else:print(text,end='')


if __name__=='__main__':main()
