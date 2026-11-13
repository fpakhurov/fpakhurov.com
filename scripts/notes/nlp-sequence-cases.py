"""Original constructed sequence-model cases, authored for the Fedor Pakhurov
project with Codex assistance. Standard library only; no external data/models.
These examples check mechanisms, not operational language-model quality.
"""
import json
import math
from collections import Counter
from fractions import Fraction


def sigmoid(x):
    return 1 / (1 + math.exp(-x))


def softmax(scores):
    if not scores or not all(math.isfinite(s) for s in scores):
        raise ValueError('Expected finite nonempty scores')
    weights = [math.exp(s - max(scores)) for s in scores]
    total = sum(weights)
    return [w / total for w in weights]


def dot(a, b):
    if len(a) != len(b):
        raise ValueError('Vector dimensions differ')
    return sum(x * y for x, y in zip(a, b))


def finite_gradient(function, point, epsilon=1e-5):
    result = []
    for j in range(len(point)):
        left, right = point.copy(), point.copy()
        left[j] -= epsilon
        right[j] += epsilon
        result.append((function(right) - function(left)) / (2 * epsilon))
    return result


def check_gradient(function, point, analytic):
    numerical = finite_gradient(function, point)
    error = max(abs(a - b) for a, b in zip(analytic, numerical))
    assert error < 1e-8, (analytic, numerical, error)
    return error


def cnn_loss_gradient(parameters):
    # Two width-two kernel rows, convolution bias, head weight/bias, three vectors.
    kernel = [parameters[:2], parameters[2:4]]
    bias, head, intercept = parameters[4:7]
    vectors = [parameters[7 + 2*j:9 + 2*j] for j in range(3)]
    pre = [bias + dot(kernel[0], vectors[t]) + dot(kernel[1], vectors[t+1]) for t in range(2)]
    active = [max(0, x) for x in pre]
    winner = max(range(2), key=lambda t: active[t])
    pooled = active[winner]
    z = head * pooled + intercept
    loss = math.log1p(math.exp(z)) - z  # Supplied positive target.
    error = sigmoid(z) - 1
    gradient = [0.0] * len(parameters)
    gradient[5], gradient[6] = error * pooled, error
    if pre[winner] > 0:
        local = error * head
        gradient[4] = local
        for offset in range(2):
            for j in range(2):
                gradient[2*offset+j] += local * vectors[winner+offset][j]
                gradient[7+2*(winner+offset)+j] += local * kernel[offset][j]
    return loss, gradient, {'preactivations': pre, 'activations': active, 'winner': winner,
                            'pooled': pooled, 'logit': z, 'probability': sigmoid(z)}


def cnn_case():
    vectors = {'lamp': [0, 0], 'not': [1, 0], 'ready': [0, 1]}
    parameters = [1, 0, 0, 1, -.7, .7, -.2, 0, 0, 1, 0, 0, 1]
    loss, gradient, trace = cnn_loss_gradient(parameters)
    fd = check_gradient(lambda p: cnn_loss_gradient(p)[0], parameters, gradient)
    updated = [p - .1*g for p, g in zip(parameters, gradient)]
    next_loss = cnn_loss_gradient(updated)[0]
    assert next_loss < loss
    def features(text):
        rows = [vectors[w] for w in text.split()]
        values = [max(0, rows[t][0]+rows[t+1][1]-.7) for t in range(len(rows)-1)]
        return values, max(values)
    messages = ['lamp not ready', 'lamp ready not', 'not ready lamp', 'ready not lamp']
    feature_rows = [features(text) for text in messages]
    labels = [1, 0, 1, 0]
    weight, intercept = 0.0, 0.0
    def objective(w, b):
        return sum(math.log1p(math.exp(w*f[1]+b))-y*(w*f[1]+b)
                   for f, y in zip(feature_rows, labels))/4 + .05*w*w/2
    initial = objective(weight, intercept)
    for _ in range(500):
        errors = [sigmoid(weight*f[1]+intercept)-y for f,y in zip(feature_rows,labels)]
        dw = sum(e*f[1] for e,f in zip(errors,feature_rows))/4+.05*weight
        db = sum(errors)/4
        weight -= .3*dw
        intercept -= .3*db
    probabilities = [sigmoid(weight*f[1]+intercept) for f in feature_rows]
    assert [int(p >= .5) for p in probabilities] == labels
    # Empty padded windows can win with a positive bias; exclude invalid windows.
    real_window_score = -1.0
    padded_window_score = .4
    assert max(real_window_score, padded_window_score) != real_window_score
    return {'embeddings': vectors, 'messages': messages, 'features': feature_rows,
            'hand_parameters': parameters, 'trace': trace, 'loss': loss,
            'gradient': gradient, 'gradient_max_error': fd, 'step': .1,
            'updated_parameters': updated, 'updated_loss': next_loss,
            'head_fit': {'labels': labels, 'steps': 500, 'learning_rate': .3, 'l2': .05,
                         'initial_loss': initial, 'final_loss': objective(weight,intercept),
                         'weight': weight, 'intercept': intercept, 'training_probabilities': probabilities},
            'padding_counterexample': {'real_window_score': real_window_score,
                                      'padded_window_score': padded_window_score,
                                      'masked_relu_pool': max(0,real_window_score),
                                      'unmasked_relu_pool': max(0,real_window_score,padded_window_score)},
            'two_layer_receptive_field': 1+(2-1)+(3-1),
            'parallel_filter_parameter_count': {'embedding':3*2,'filters':3*(2*2+1),'head':3+1,'total':3*2+3*(2*2+1)+(3+1)},
            'valid_window_counts': {'lengths': [3, 5, 2], 'kernel': 2, 'counts': [length-2+1 for length in [3,5,2]]}}


def recurrent_loss_gradient(parameters):
    # Recurrent/input/bias, classifier weight/bias, initial state, three inputs.
    a, b, bias, weight, intercept, initial = parameters[:6]
    inputs = parameters[6:]
    states = [initial]
    for x in inputs:
        states.append(math.tanh(a*states[-1] + b*x + bias))
    z = weight*states[-1]+intercept
    loss = math.log1p(math.exp(z))-z
    error = sigmoid(z)-1
    gradient = [0.0] * len(parameters)
    gradient[3], gradient[4] = error*states[-1], error
    carry = error*weight
    local_derivatives = []
    for t in reversed(range(len(inputs))):
        delta = carry*(1-states[t+1]**2)
        gradient[0] += delta*states[t]
        gradient[1] += delta*inputs[t]
        gradient[2] += delta
        gradient[6+t] = delta*b
        local_derivatives.append(a*(1-states[t+1]**2))
        carry = delta*a
    gradient[5] = carry
    return loss, gradient, {'states': states, 'logit': z, 'probability': sigmoid(z),
                            'local_state_derivatives': list(reversed(local_derivatives))}


def recurrent_case():
    parameters = [.6,.4,.1,.7,-.2,0,1,0,-1]
    loss, gradient, trace = recurrent_loss_gradient(parameters)
    fd = check_gradient(lambda p: recurrent_loss_gradient(p)[0],parameters,gradient)
    reversed_parameters = parameters[:6] + list(reversed(parameters[6:]))
    reversed_trace = recurrent_loss_gradient(reversed_parameters)[2]
    h = trace['states'][-1]
    padded = math.tanh(.6*h+.1)
    assert not math.isclose(h, padded)
    clipped = [3*2/5,4*2/5]
    assert math.isclose(math.hypot(*clipped),2)
    return {'parameters': parameters, 'trace': trace, 'loss': loss, 'gradient': gradient,
            'gradient_max_error': fd, 'reverse_order_final': reversed_trace['states'][-1],
            'unmasked_zero_padding_final': padded, 'masked_padding_final': h,
            'zero_trajectory_sensitivity': {'steps': 30, 'weight_0_7': .7**30,'weight_1_3':1.3**30},
            'global_norm_clipping': {'original':[3,4], 'threshold':2,'clipped':clipped},
            'combined_bias_parameter_count': {'input_width':3,'hidden_width':2,'count':2*(3+2+1)}}


def lstm_step(x,h,c):
    wx,wh,bias = [.5,-.4,.3,.2],[-.1,.2,.4,-.3],[.1,-.2,.05,0]
    pre = [u*x+v*h+b for u,v,b in zip(wx,wh,bias)]
    i,f,g,o = sigmoid(pre[0]),sigmoid(pre[1]),math.tanh(pre[2]),sigmoid(pre[3])
    new_c = f*c+i*g
    new_h = o*math.tanh(new_c)
    di,df,dg,do = i*(1-i)*wh[0],f*(1-f)*wh[1],(1-g*g)*wh[2],o*(1-o)*wh[3]
    dc_dh = df*c+di*g+i*dg
    dh_dc = o*(1-math.tanh(new_c)**2)*f
    dh_dh = do*math.tanh(new_c)+o*(1-math.tanh(new_c)**2)*dc_dh
    return {'preactivations':pre,'input':i,'forget':f,'candidate':g,'output':o,
            'cell':new_c,'hidden':new_h,'jacobian_state':[[dh_dh,dh_dc],[dc_dh,f]]}


def gated_case():
    x,h,c=.4,-.2,.6
    result=lstm_step(x,h,c)
    gaps=[]
    for output,row in zip(['hidden','cell'],result['jacobian_state']):
        gaps.append(check_gradient(lambda p:lstm_step(x,p[0],p[1])[output],[h,c],row))
    matrix=[[1,2],[3,4]]
    state=[Fraction(1,5),Fraction(-3,10)]
    reset=[Fraction(1,4),Fraction(3,4)]
    before=[dot(row,[r*s for r,s in zip(reset,state)]) for row in matrix]
    after=[r*dot(row,state) for r,row in zip(reset,matrix)]
    assert before==[Fraction(-2,5),Fraction(-3,4)]
    assert after==[Fraction(-1,10),Fraction(-9,20)]
    return {'input':x,'previous_hidden':h,'previous_cell':c,'step':result,'jacobian_max_errors':gaps,
            'fixed_gate_direct_path':{'steps':20,'forget_0_95':.95**20,'forget_0_5':.5**20},
            'gru_reset_before':list(map(str,before)),'gru_reset_after':list(map(str,after)),
            'combined_bias_counts':{'input_width':3,'hidden_width':2,'rnn':2*(3+2+1),'gru':3*2*(3+2+1),'lstm':4*2*(3+2+1)},
            'split_bias_lstm_count':4*2*(3+2+2)}


def ngram_counts(tokens,n):
    return Counter(tuple(tokens[i:i+n]) for i in range(max(0,len(tokens)-n+1)))


def bleu_two(candidates,references):
    if len(candidates)!=len(references) or not candidates:
        raise ValueError('Expected aligned nonempty sentence lists')
    totals,clipped=[],[]
    for n in [1,2]:
        total=hit=0
        for candidate,reference in zip(candidates,references):
            cc,rc=ngram_counts(candidate,n),ngram_counts(reference,n)
            total+=sum(cc.values());hit+=sum(min(count,rc[g]) for g,count in cc.items())
        totals.append(total);clipped.append(hit)
    c=sum(map(len,candidates));r=sum(map(len,references))
    if not c or any(x==0 for x in totals) or any(x==0 for x in clipped):
        return {'score':0.0,'candidate_length':c,'reference_length':r,'clipped':clipped,'totals':totals}
    precisions=[Fraction(h,t) for h,t in zip(clipped,totals)]
    bp=math.exp(min(0,1-r/c))
    score=bp*math.sqrt(float(precisions[0]*precisions[1]))
    return {'score':score,'brevity_penalty':bp,'candidate_length':c,'reference_length':r,
            'clipped':clipped,'totals':totals,'precisions':list(map(str,precisions))}


def seq2seq_case():
    source=[.5,-.25]
    context=0.0
    encoder=[]
    for x in source:
        context=math.tanh(.5*context+.4*x+.1);encoder.append(context)
    vocabulary=['pickup','return','lamp','tripod','EOS']
    embedding={'BOS':0,'pickup':.2,'return':-.3,'lamp':.5,'tripod':-.4,'EOS':0}
    output_weights=[.4,-.3,.2,-.1,.1]
    output_bias=[.2,.1,-.05,0,-.1]
    gold=['return','lamp','EOS']
    def decode(teacher):
        state=context;previous='BOS';rows=[]
        for target in gold:
            state=math.tanh(.6*state+.3*embedding[previous]+.4*context-.05)
            probabilities=softmax([w*state+b for w,b in zip(output_weights,output_bias)])
            chosen=vocabulary[max(range(5),key=lambda j:probabilities[j])]
            rows.append({'previous':previous,'state':state,'probabilities':probabilities,
                         'target':target,'target_probability':probabilities[vocabulary.index(target)],'argmax':chosen})
            previous=target if teacher else chosen
        return rows
    teacher,generated=decode(True),decode(False)
    assert teacher[0]==generated[0] and teacher[1]['previous']!=generated[1]['previous']
    # Separate hand-specified normalized conditional tree; not neural output above.
    tree={'BOS':{'pickup':Fraction(11,20),'return':Fraction(2,5),'EOS':Fraction(1,20)},
          'pickup':{'pickup':Fraction(3,10),'return':Fraction(1,4),'EOS':Fraction(9,20)},
          'return':{'pickup':Fraction(1,20),'return':Fraction(1,20),'EOS':Fraction(9,10)}}
    assert all(sum(row.values())==1 for row in tree.values())
    complete=[(['EOS'],tree['BOS']['EOS'])]
    for first in ['pickup','return']:
        complete.append(([first,'EOS'],tree['BOS'][first]*tree[first]['EOS']))
    best=max(complete,key=lambda item:item[1]);greedy=tree['BOS']['pickup']*tree['pickup']['EOS']
    assert best[0]==['return','EOS'] and best[1]==Fraction(9,25) and greedy==Fraction(99,400)
    # Beam width two, completed hypotheses stay in the beam without expansion.
    beam=[([],Fraction(1))]
    beam_history=[]
    for _ in range(2):
        expanded=[]
        for tokens,probability in beam:
            if tokens and tokens[-1]=='EOS':
                expanded.append((tokens,probability))
            else:
                row=tree[tokens[-1] if tokens else 'BOS']
                expanded.extend((tokens+[token],probability*p) for token,p in row.items())
        beam=sorted(expanded,key=lambda item:(-item[1],item[0]))[:2]
        beam_history.append([{'tokens':tokens,'probability':str(probability)} for tokens,probability in beam])
    assert beam[0]==(['return','EOS'],Fraction(9,25))
    references=[s.split() for s in ['return lamp tomorrow','collect tripod at desk']]
    candidates=[s.split() for s in ['return lamp now','collect tripod']]
    bleu=bleu_two(candidates,references)
    assert bleu['precisions']==['4/5','2/3']
    repeated=bleu_two([['lamp','lamp','lamp']],[['lamp','ready']])
    assert repeated['clipped'][0]==1 and repeated['totals'][0]==3 and repeated['score']==0
    assert bleu_two([[]],[['lamp']])['score']==0
    assert bleu_two([['lamp']],[['lamp']])['score']==0
    assert bleu_two([['lamp','ready']],[['lamp','ready']])['score']==1
    try:bleu_two([],[])
    except ValueError:pass
    else:raise AssertionError('Empty corpus needs an explicit policy')
    return {'source_values':source,'encoder_states':encoder,'vocabulary':vocabulary,
            'teacher_forced':teacher,'generated_prefixes_fixed_three_steps':generated,
            'mean_teacher_nll':-sum(math.log(row['target_probability']) for row in teacher)/3,
            'conditional_tree':{k:{t:str(p) for t,p in row.items()} for k,row in tree.items()},
            'beam_width_two':beam_history,
            'source_example':'bring-back lamp', 'target_example':'return lamp EOS',
            'greedy_probability':str(greedy),'best_completed_sequence':best[0],'best_probability':str(best[1]),
            'bleu2':bleu,'candidate_texts':[' '.join(x) for x in candidates],
            'reference_texts':[' '.join(x) for x in references],
            'finite_bit_context':{'alphabet_size':4,'length':6,'possible_inputs':4**6,'context_bits':8,'states':2**8}}


def attention_loss_gradient(parameters):
    query=parameters[:2];states=[parameters[2+2*j:4+2*j] for j in range(3)]
    scores=[dot(query,h) for h in states];weights=softmax(scores)
    context=[sum(a*h[k] for a,h in zip(weights,states)) for k in range(2)]
    target=[.2,.4];error=[c-t for c,t in zip(context,target)]
    loss=sum(e*e for e in error)/2
    de=[a*dot(error,[h[k]-context[k] for k in range(2)]) for a,h in zip(weights,states)]
    dq=[sum(d*h[k] for d,h in zip(de,states)) for k in range(2)]
    dh=[a*error[k]+d*query[k] for a,d in zip(weights,de) for k in range(2)]
    return loss,dq+dh,{'scores':scores,'weights':weights,'context':context,'score_gradients':de}


def masked_weights(scores,valid):
    if len(scores)!=len(valid) or not any(valid) or any(type(v) is not bool for v in valid):
        raise ValueError('Expected an aligned nonempty boolean mask with a valid position')
    selected=[s for s,v in zip(scores,valid) if v]
    probabilities=iter(softmax(selected))
    return [next(probabilities) if v else 0.0 for v in valid]


def attention_case():
    point=[.6,-.2,1,0,0,1,1,1]
    loss,gradient,trace=attention_loss_gradient(point)
    gap=check_gradient(lambda p:attention_loss_gradient(p)[0],point,gradient)
    query=point[:2];states=[point[2+2*j:4+2*j] for j in range(3)]
    additive=[dot([.7,-.4],[math.tanh(.3*query[0]-.2*query[1]+h[0]+.1),
                               math.tanh(.1*query[0]+.5*query[1]+.6*h[1]-.1)]) for h in states]
    weights=masked_weights(trace['scores']+[99],[True,True,True,False])
    assert weights[:3]==trace['weights'] and weights[3]==0
    try:masked_weights([1,2],[False,False])
    except ValueError:pass
    else:raise AssertionError('All-masked softmax needs an explicit policy')
    square=[[1,0],[0,1],[1,1],[0,0]]
    a=[Fraction(1,4)]*4;b=[Fraction(2,5),Fraction(2,5),Fraction(1,10),Fraction(1,10)]
    ca=[sum(w*h[k] for w,h in zip(a,square)) for k in range(2)]
    cb=[sum(w*h[k] for w,h in zip(b,square)) for k in range(2)]
    assert a!=b and ca==cb==[Fraction(1,2),Fraction(1,2)]
    return {'parameters':point,'trace':trace,'loss':loss,'gradient':gradient,'gradient_max_error':gap,
            'additive_scores':additive,'additive_weights':softmax(additive),'masked_weights':weights,
            'same_context_different_weights':{'states':square,'weights_a':list(map(str,a)),
                                             'weights_b':list(map(str,b)),'context':list(map(str,ca))}}


def main():
    result={'authorship':'Original fictional inputs and stdlib code authored for the Fedor Pakhurov project with Codex assistance.',
            'cnn':cnn_case(),'rnn':recurrent_case(),'gates':gated_case(),
            'seq2seq':seq2seq_case(),'attention':attention_case()}
    print(json.dumps(result,ensure_ascii=False,indent=2,sort_keys=True))


if __name__=='__main__':
    main()
