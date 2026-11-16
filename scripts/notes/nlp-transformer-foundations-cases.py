# Independently authored numerical cases for the Fedor Pakhurov project.
# Created with Codex assistance. Standard library only; no external data or models.
import itertools
import json
import math
from fractions import Fraction as F


def dot(a, b):
    assert len(a) == len(b)
    return sum(x * y for x, y in zip(a, b))


def transpose(a):
    assert a and a[0] and all(len(row) == len(a[0]) for row in a)
    return [list(col) for col in zip(*a)]


def matmul(a, b):
    bt = transpose(b)
    return [[dot(row, col) for col in bt] for row in a]


def plus(a, b):
    assert len(a) == len(b) and all(len(x) == len(y) for x, y in zip(a, b))
    return [[u + v for u, v in zip(x, y)] for x, y in zip(a, b)]


def flatten(a):
    return [x for row in a for x in row]


def softmax(values, allowed=None):
    if allowed is None:
        allowed = [True] * len(values)
    if len(values) != len(allowed) or not any(allowed):
        raise ValueError('A row needs at least one allowed key.')
    if not all(isinstance(a, bool) for a in allowed):
        raise ValueError('Allowed entries must be booleans.')
    maximum = max(v for v, a in zip(values, allowed) if a)
    terms = [math.exp(v - maximum) if a else 0.0 for v, a in zip(values, allowed)]
    total = sum(terms)
    return [v / total for v in terms]


def attend(q, k, v, allowed=None):
    if len(k) != len(v) or not q or not k:
        raise ValueError('Nonempty keys and values must have matching rows.')
    scale = math.sqrt(len(q[0]))
    scores = [[dot(x, y) / scale for y in k] for x in q]
    if allowed is None:
        allowed = [[True] * len(k) for _ in q]
    if len(allowed) != len(q):
        raise ValueError('Mask must have one row per query.')
    weights = [softmax(row, mask) for row, mask in zip(scores, allowed)]
    return matmul(weights, v), weights, scores


def central_difference(fn, parameters, step=1e-6):
    result = []
    for i in range(len(parameters)):
        left = parameters[:]
        right = parameters[:]
        left[i] -= step
        right[i] += step
        result.append((fn(right) - fn(left)) / (2 * step))
    return result


def unpack_attention(parameters):
    assert len(parameters) == 18
    x = [parameters[i:i+2] for i in range(0, 6, 2)]
    matrices = [[parameters[i:i+2], parameters[i+2:i+4]] for i in [6, 10, 14]]
    return x, matrices


def attention_loss_gradient(parameters, allowed=None):
    x, (wq, wk, wv) = unpack_attention(parameters)
    q, k, v = [matmul(x, w) for w in [wq, wk, wv]]
    y, a, scores = attend(q, k, v, allowed)
    target = [[0.2, -0.1], [0.4, 0.3], [-0.2, 0.5]]
    dy = [[u - t for u, t in zip(row, tr)] for row, tr in zip(y, target)]
    loss = sum(z * z for z in flatten(dy)) / 2
    da = matmul(dy, transpose(v))
    ds = [[weight * (upstream - dot(ar, dr)) for weight, upstream in zip(ar, dr)] for ar, dr in zip(a, da)]
    dq = [[z / math.sqrt(2) for z in row] for row in matmul(ds, k)]
    dk = [[z / math.sqrt(2) for z in row] for row in matmul(transpose(ds), q)]
    dv = matmul(transpose(a), dy)
    dx = plus(plus(matmul(dq, transpose(wq)), matmul(dk, transpose(wk))), matmul(dv, transpose(wv)))
    gradients = flatten(dx)
    for derivative in [dq, dk, dv]:
        gradients.extend(flatten(matmul(transpose(x), derivative)))
    return loss, gradients, {'x':x, 'wq':wq, 'wk':wk, 'wv':wv, 'q':q, 'k':k, 'v':v, 'scores':scores, 'weights':a, 'output':y, 'target':target}


def attention_case():
    x = [[1.0, 2.0], [-1.0, 1.0], [2.0, 0.0]]
    wq = [[0.5, -0.25], [0.0, 0.5]]
    wk = [[0.25, 0.5], [-0.5, 0.25]]
    wv = [[0.5, 0.0], [0.25, -0.5]]
    theta = flatten(x) + flatten(wq) + flatten(wk) + flatten(wv)
    loss, gradient, trace = attention_loss_gradient(theta)
    numerical = central_difference(lambda t: attention_loss_gradient(t)[0], theta)
    error = max(abs(a - b) for a, b in zip(gradient, numerical))
    assert error < 1e-8
    next_theta = [t - 0.02 * g for t, g in zip(theta, gradient)]
    next_loss = attention_loss_gradient(next_theta)[0]
    assert next_loss < loss
    causal = [[j <= i for j in range(3)] for i in range(3)]
    closs, cgrad, ctrace = attention_loss_gradient(theta, causal)
    cnumerical = central_difference(lambda t: attention_loss_gradient(t, causal)[0], theta)
    cerror = max(abs(a - b) for a, b in zip(cgrad, cnumerical))
    assert cerror < 1e-8
    changed = theta[:]
    changed[4:6] = [-3.0, 4.0]
    future_causal = attention_loss_gradient(changed, causal)[2]['output']
    future_full = attention_loss_gradient(changed)[2]['output']
    assert ctrace['output'][0] == future_causal[0]
    assert trace['output'][0] != future_full[0]
    permutation = [2, 0, 1]
    permuted = flatten([x[i] for i in permutation]) + theta[6:]
    poutput = attention_loss_gradient(permuted)[2]['output']
    equivariance = max(abs(a - b) for i, row in enumerate(poutput) for a, b in zip(row, trace['output'][permutation[i]]))
    assert equivariance < 1e-12
    assert softmax([0.0, 10000.0], [True, False]) == [1.0, 0.0]
    try:
        softmax([0.0, 1.0], [False, False])
    except ValueError:
        pass
    else:
        raise AssertionError('An empty mask was accepted.')
    dots = [sum(qi * ki for qi, ki in zip(q, k)) for q in itertools.product([-1, 1], repeat=4) for k in itertools.product([-1, 1], repeat=4)]
    independent_variance = F(sum(s*s for s in dots), len(dots))
    correlated_variance = F(sum((4*q*k)**2 for q in [-1,1] for k in [-1,1]), 4)
    assert independent_variance == 4 and correlated_variance == 16
    heads=[]
    for qproj,kproj,vproj in [([[1.0],[0.0]],[[0.0],[1.0]],[[0.5],[0.25]]), ([[0.0],[1.0]],[[1.0],[0.0]],[[0.0],[-0.5]])]:
        head,weights,_=attend(matmul(x,qproj),matmul(x,kproj),matmul(x,vproj));heads.append({'output':head,'weights':weights})
    joined=[[heads[0]['output'][i][0],heads[1]['output'][i][0]] for i in range(3)]
    wo=[[1.0,0.5],[-0.5,1.0]]
    return {'trace':trace,'loss':loss,'gradient':gradient,'gradient_max_error':error,'updated_loss':next_loss,'step':0.02,'causal':{'mask':causal,'trace':ctrace,'loss':closs,'gradient':cgrad,'gradient_max_error':cerror,'changed_future_output':future_causal},'unmasked_changed_future_output':future_full,'permutation':permutation,'permuted_output':poutput,'permutation_error':equivariance,'scale_variance':{'width':4,'independent':str(independent_variance),'shared_coordinates':str(correlated_variance)},'two_heads':{'heads':heads,'joined':joined,'wo':wo,'output':matmul(joined,wo)},'hypothetical_parameter_count':{'model_width':6,'heads':3,'per_head_width':2,'projection_weights':4*6*6,'projection_biases':4*6},'hypothetical_scores':{'batch':2,'heads':3,'length':5,'entries':2*3*5*5}}


def normalize(row, epsilon=0.1, rms=False):
    mean = 0.0 if rms else sum(row) / len(row)
    centered = [x - mean for x in row]
    denominator = math.sqrt(sum(x*x for x in centered) / len(row) + epsilon)
    return [x / denominator for x in centered]


def normalization_gradient(row, upstream, epsilon=0.01, rms=False):
    z = normalize(row, epsilon, rms)
    mean = 0.0 if rms else sum(row) / len(row)
    inverse = 1 / math.sqrt(sum((x-mean)**2 for x in row) / len(row) + epsilon)
    mean_g = 0.0 if rms else sum(upstream) / len(row)
    mean_gz = dot(upstream, z) / len(row)
    return [inverse * (g - mean_g - zi*mean_gz) for g, zi in zip(upstream, z)]


def ffn(row):
    w1 = [[0.5, -0.25, 0.75], [0.25, 0.5, -0.5]]
    b1 = [0.1, -0.2, 0.05]
    w2 = [[0.5, 0.25], [-0.25, 0.5], [0.25, -0.5]]
    b2 = [0.05, -0.1]
    pre = [x+b for x,b in zip(matmul([row],w1)[0],b1)]
    hidden = [max(x,0) for x in pre]
    output = [x+b for x,b in zip(matmul([hidden],w2)[0],b2)]
    return output, {'preactivation':pre,'hidden':hidden,'w1':w1,'b1':b1,'w2':w2,'b2':b2}


def fixed_block(x, pre_norm=True):
    wq=[[0.5,-0.25],[0.0,0.5]]
    wk=[[0.25,0.5],[-0.5,0.25]]
    wv=[[0.5,0.0],[0.25,-0.5]]
    attention_input=[normalize(r) for r in x] if pre_norm else x
    mixed,weights,_=attend(*[matmul(attention_input,w) for w in [wq,wk,wv]])
    residual=plus(x,mixed)
    if pre_norm:
        ffn_input=[normalize(r) for r in residual]
        output=plus(residual,[ffn(r)[0] for r in ffn_input])
    else:
        residual=[normalize(r) for r in residual]
        ffn_input=residual
        output=[normalize(r) for r in plus(residual,[ffn(r)[0] for r in ffn_input])]
    return output,{'attention_input':attention_input,'weights':weights,'attention_output':mixed,'first_residual':residual,'ffn_input':ffn_input}


def linear_classifier(parameters, features, labels, classes, l2=0.0):
    width=len(features[0]);weights=[parameters[i*classes:(i+1)*classes] for i in range(width)];bias=parameters[width*classes:]
    assert len(bias)==classes and len(features)==len(labels)
    gradient=[0.0]*len(parameters);loss=0.0;probabilities=[]
    for row,label in zip(features,labels):
        scores=[x+b for x,b in zip(matmul([row],weights)[0],bias)];prob=softmax(scores);probabilities.append(prob)
        maximum=max(scores);loss+=(maximum+math.log(sum(math.exp(z-maximum) for z in scores))-scores[label])/len(features)
        residual=[(v-(i==label))/len(features) for i,v in enumerate(prob)]
        for j,x in enumerate(row):
            for k,g in enumerate(residual):gradient[j*classes+k]+=x*g
        for k,g in enumerate(residual):gradient[width*classes+k]+=g
    for i in range(width*classes):loss+=l2*parameters[i]**2/2;gradient[i]+=l2*parameters[i]
    return loss,gradient,probabilities


def fit_head(features,labels,classes,steps,rate,l2):
    theta=[0.0]*((len(features[0])+1)*classes)
    initial=linear_classifier(theta,features,labels,classes,l2)
    initial_numerical=central_difference(lambda t:linear_classifier(t,features,labels,classes,l2)[0],theta)
    initial_error=max(abs(x-y) for x,y in zip(initial[1],initial_numerical));assert initial_error<1e-8
    checkpoints=[[0,initial[0]]]
    for step in range(steps):
        _,g,_=linear_classifier(theta,features,labels,classes,l2)
        theta=[t-rate*grad for t,grad in zip(theta,g)]
        if step+1 in [steps//2,steps]:checkpoints.append([step+1,linear_classifier(theta,features,labels,classes,l2)[0]])
    loss,g,prob=linear_classifier(theta,features,labels,classes,l2)
    numerical=central_difference(lambda t:linear_classifier(t,features,labels,classes,l2)[0],theta)
    error=max(abs(x-y) for x,y in zip(g,numerical));assert error<1e-8 and loss<initial[0]
    return {'features':features,'labels':labels,'classes':classes,'initial_parameters':[0.0]*len(theta),'parameters':theta,'steps':steps,'learning_rate':rate,'l2_weights_only':l2,'loss_checkpoints':checkpoints,'probabilities':prob,'initial_gradient_max_error':initial_error,'final_gradient_max_error':error}


def transformer_case():
    x=[[1.0,2.0],[-1.0,1.0],[2.0,0.0]]
    pre,pretrace=fixed_block(x,True);post,posttrace=fixed_block(x,False)
    row=[1.0,3.0,8.0];gamma=[1.0,1.5,0.5];beta=[0.1,-0.2,0.3];coeff=[0.3,-0.2,0.7];upstream=[g*c for g,c in zip(gamma,coeff)]
    normalization={}
    for rms,name in [(False,'layer'),(True,'rms')]:
        value=[z*g+(0 if rms else b) for z,g,b in zip(normalize(row,0.01,rms),gamma,beta)]
        gradient=normalization_gradient(row,upstream,0.01,rms)
        objective=lambda r:dot([z*g+(0 if rms else b) for z,g,b in zip(normalize(r,0.01,rms),gamma,beta)],coeff)
        numerical=central_difference(objective,row);error=max(abs(a-b) for a,b in zip(gradient,numerical));assert error<1e-8
        shifted=normalize([v+5 for v in row],0.01,rms)
        normalization[name]={'output':value,'input_gradient':gradient,'gradient_max_error':error,'shifted_normalized':shifted}
    assert max(abs(a-b) for a,b in zip(normalize(row,0.01),normalize([v+5 for v in row],0.01)))<1e-12
    assert normalize([2.0]*3,0.01)==[0.0]*3
    examples=[[[1.0,0.0],[0.5,-0.5]],[[1.5,0.0],[0.5,-1.0]],[[-1.0,0.0],[-0.5,0.5]],[[-1.5,0.0],[-0.5,1.0]]]
    features=[]
    for example in examples:
        states,_=fixed_block(example,True);features.append([sum(r[j] for r in states)/len(states) for j in range(2)])
    trained=fit_head(features,[0,0,1,1],2,500,0.2,0.02)
    d,m=4,7
    return {'x':x,'epsilon':0.1,'pre_norm':{'trace':pretrace,'output':pre},'post_norm':{'trace':posttrace,'output':post},'ffn':dict(input=[0.6,-0.2],output=ffn([0.6,-0.2])[0],**ffn([0.6,-0.2])[1]),'normalization':{'input':row,'epsilon':0.01,'gamma':gamma,'layer_only_beta':beta,'linear_loss_coefficients':coeff,'results':normalization},'parameter_count':{'model_width':d,'ffn_width':m,'projection_weights':4*d*d,'ffn_weights':2*d*m,'projection_biases':4*d,'ffn_biases':m+d,'two_affine_norms':4*d,'total':4*d*d+2*d*m+m+9*d},'head_only_fit':dict(examples=examples,**trained)}


def rotation(angle, vector):
    c,s=math.cos(angle),math.sin(angle)
    return [c*vector[0]-s*vector[1],s*vector[0]+c*vector[1]]


def sinusoidal(position,width=4,base=16):
    assert width>0 and width%2==0 and base>0
    return [f(position/base**(2*i/width)) for i in range(width//2) for f in [math.sin,math.cos]]


def positions_case():
    values=[sinusoidal(i) for i in range(4)];shift=2;shift_errors=[]
    for position in [0,1,4]:
        old=sinusoidal(position);expected=sinusoidal(position+shift);actual=[]
        for i in range(2):
            angle=shift/(16**(2*i/4));s,c=old[2*i:2*i+2]
            actual.extend([math.cos(angle)*s+math.sin(angle)*c,-math.sin(angle)*s+math.cos(angle)*c])
        shift_errors.append(max(abs(a-b) for a,b in zip(expected,actual)))
    assert max(shift_errors)<1e-12
    q=[2.0,-1.0];k=[-1.0,3.0];frequency=math.pi/6;m,n=2,5
    norms={'query_before':dot(q,q),'query_after':dot(rotation(m*frequency,q),rotation(m*frequency,q)),'key_before':dot(k,k),'key_after':dot(rotation(n*frequency,k),rotation(n*frequency,k))}
    assert abs(norms['query_before']-norms['query_after'])<1e-12 and abs(norms['key_before']-norms['key_after'])<1e-12
    direct=dot(rotation(m*frequency,q),rotation(n*frequency,k));relative=dot(q,rotation((n-m)*frequency,k));shifted=dot(rotation((m+5)*frequency,q),rotation((n+5)*frequency,k));assert abs(direct+5)<1e-12 and abs(direct-relative)<1e-12 and abs(direct-shifted)<1e-12
    scores=[dot(q,rotation(offset*frequency,k)) for offset in range(13)]
    assert abs(scores[0]-scores[12])<1e-12
    # A nonorthogonal projection after rotation breaks the simple relative-only identity.
    stretch=lambda v:[2*v[0],v[1]]
    after=dot(stretch(rotation(m*frequency,q)),stretch(rotation(n*frequency,k)))
    after_shift=dot(stretch(rotation((m+1)*frequency,q)),stretch(rotation((n+1)*frequency,k)))
    assert abs(after-after_shift)>0.1
    position=7
    cached_key=rotation(position*frequency,k)
    doubled=rotation(position*frequency,cached_key)
    assert max(abs(a-b) for a,b in zip(cached_key,doubled))>0.1
    return {'sinusoidal':{'base':16,'width':4,'positions':values,'shift':shift,'shift_errors':shift_errors},'rotary':{'q':q,'k':k,'squared_norm_checks':norms,'frequency':frequency,'query_position':m,'key_position':n,'rotated_query':rotation(m*frequency,q),'rotated_key':rotation(n*frequency,k),'score':direct,'relative_score':relative,'common_shift_score':shifted,'offset_scores_0_through_12':scores,'post_rotation_stretch_score':after,'post_rotation_stretch_shifted_score':after_shift,'cached_position':position,'cached_key':cached_key,'incorrectly_rotated_twice':doubled},'learned_table':{'maximum_positions':6,'width':4,'parameters':6*4,'first_out_of_range_index':6}}


def translation_distribution(prefix, source_sign, remove_cross=False):
    vocabulary=['check','light','stand','<eos>']
    if not prefix:q=[1.0,0.0];base=[2.0,0.0,0.0,0.0]
    elif prefix[-1]=='check':q=[0.0,1.0];base=[0.0,0.0,0.0,0.0]
    else:q=[1.0,1.0];base=[0.0,0.0,0.0,2.0]
    keys=[[1.0,0.0],[0.0,1.0]];values=[[0.0,0.0],[source_sign,0.0]]
    context,weights,_=attend([q],keys,values);c=0.0 if remove_cross else context[0][0]
    if prefix and prefix[-1]=='check':base=[0.0,3*c,-3*c,0.0]
    return softmax(base),{'query':q,'attention':weights[0],'context':context[0],'logits':base,'vocabulary':vocabulary}


def translation_case():
    results={}
    for sign,item in [(1.0,'light'),(-1.0,'stand')]:
        target=['check',item,'<eos>'];prefix=[];probabilities=[];traces=[];ablated=[]
        for word in target:
            p,trace=translation_distribution(prefix,sign);probabilities.append(p[trace['vocabulary'].index(word)]);traces.append(trace)
            p0,_=translation_distribution(prefix,sign,True);ablated.append(p0[trace['vocabulary'].index(word)]);prefix.append(word)
        decoded=[]
        for _ in range(5):
            p,trace=translation_distribution(decoded,sign);word=trace['vocabulary'][max(range(len(p)),key=lambda i:p[i])];decoded.append(word)
            if word=='<eos>':break
        assert decoded==target
        results[item]={'source_sign':sign,'target':target,'decoder_input':['<bos>']+target[:-1],'target_probabilities':probabilities,'trace':traces,'mean_nll':-sum(map(math.log,probabilities))/len(target),'removed_cross_probabilities':ablated,'removed_cross_mean_nll':-sum(map(math.log,ablated))/len(target),'greedy':decoded}
    target_prob=softmax(results['light']['trace'][1]['logits']);epsilon=0.2;smoothed=[epsilon/4]*4;smoothed[1]+=1-epsilon
    smooth_loss=-sum(t*math.log(p) for t,p in zip(smoothed,target_prob));gradient=[p-t for p,t in zip(target_prob,smoothed)]
    logits=results['light']['trace'][1]['logits'];fd=central_difference(lambda z:-sum(t*math.log(p) for t,p in zip(smoothed,softmax(z))),logits)
    assert max(abs(a-b) for a,b in zip(gradient,fd))<1e-8
    # A separate finite tree isolates beam bookkeeping, not translation quality.
    paths={'a':{'<eos>':F(3,5),'x':F(2,5)},'b':{'<eos>':F(9,10),'x':F(1,10)}};first={'a':F(11,20),'b':F(9,20)}
    completed={prefix+' '+suffix:str(first[prefix]*prob) for prefix,nexts in paths.items() for suffix,prob in nexts.items()}
    assert first['b']*paths['b']['<eos>']>first['a']*paths['a']['<eos>']
    return {'fixed_decoder_cases':results,'label_smoothing':{'epsilon':epsilon,'uniform_includes_gold':True,'target':smoothed,'probabilities':target_prob,'loss':smooth_loss,'logit_gradient':gradient},'beam_tree':{'first':{k:str(v) for k,v in first.items()},'second':{k:{x:str(v) for x,v in row.items()} for k,row in paths.items()},'joint_probabilities':completed,'two_step_limit':'Paths ending in x are unfinished; they must not be labeled complete EOS hypotheses.'},'attention_masks':{'source_real':[True,True,False],'target_causal':[[True,False,False],[True,True,False],[True,True,True]],'loss_labels':['check','light','<eos>']}}


def bert_case():
    feature_rows=[];contexts=[]
    for right in [[1.0,0.0],[0.8,0.0],[0.0,1.0],[0.0,0.8]]:
        states,weights,_=attend([[1.0,0.0]],[[0.0,1.0],[1.0,0.0]],[[0.2,0.2],right])
        feature_rows.append(states[0]);contexts.append({'right_value':right,'weights':weights[0],'masked_state':states[0]})
    fit=fit_head(feature_rows,[0,0,1,1],6,600,0.3,0.01)
    # Chosen corruption quantiles for twenty already-selected positions.
    quantiles=[(i+0.5)/20 for i in range(20)];actions=['mask' if u<0.8 else 'random' if u<0.9 else 'unchanged' for u in quantiles]
    assert actions.count('mask')==16 and actions.count('random')==2 and actions.count('unchanged')==2
    selection_probability=F(3,20);replace=F(4,5);random=F(1,10);unchanged=F(1,10)
    event_probabilities={'mask':str(selection_probability*replace),'random':str(selection_probability*random),'selected_unchanged':str(selection_probability*unchanged),'not_selected':str(1-selection_probability)}
    selected_probs=[F(7,10),F(1,5)];masked_loss=-sum(math.log(float(p)) for p in selected_probs)/len(selected_probs)
    d,m,layers,vocab,positions,segments=4,8,2,9,6,2
    components={'word_embeddings':vocab*d,'position_embeddings':positions*d,'segment_embeddings':segments*d,'embedding_norm':2*d,'encoder_blocks':layers*(4*d*d+2*d*m+m+9*d),'mlm_transform_and_norm':d*d+d+2*d,'tied_mlm_output_bias':vocab,'pooler':d*d+d,'binary_pair_head':2*d+2}
    assert sum(components.values())==487
    return {'contextual_diagnostic':{'query':[1.0,0.0],'keys':[[0.0,1.0],[1.0,0.0]],'left_value':[0.2,0.2],'contexts':contexts,'output_vocabulary':['lamp','tripod','bright','folded','carry','storage'],'head_only_fit':fit},'corruption':{'selection_probability':str(selection_probability),'event_probabilities':event_probabilities,'already_selected_quantiles':quantiles,'actions':actions,'random_replacement_may_equal_original':True},'loss_mask':{'real_positions':6,'selected_positions':[1,4],'correct_probabilities':[str(p) for p in selected_probs],'mean_selected_nll':masked_loss,'incorrect_six_position_denominator':masked_loss/3},'hypothetical_parameter_count':{'model_width':d,'ffn_width':m,'layers':layers,'word_vocabulary':vocab,'position_rows':positions,'segment_rows':segments,'components':components,'total':sum(components.values()),'output_embedding_tied':True}}


def main():
    cases={'attention':attention_case(),'transformers':transformer_case(),'positions':positions_case(),'translation':translation_case(),'bert':bert_case()}
    print(json.dumps(cases,indent=2))


if __name__ == '__main__':
    main()
