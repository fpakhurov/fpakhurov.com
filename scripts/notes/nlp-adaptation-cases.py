"""Original small constructions for efficient attention and transfer learning.

Fedor Pakhurov project, authored with Codex assistance, 2026-11-16.
All arrays are mathematical inputs specified here. No external data or model.
"""
import itertools
import json
import math
from fractions import Fraction


def merge_rows(scores, values, blocks, allowed=None):
    allowed = [True] * len(scores) if allowed is None else allowed
    maximum = None
    denominator = 0.0
    numerator = [0.0] * len(values[0])
    trace = []
    for block in blocks:
        selected = [i for i in block if allowed[i]]
        if not selected:
            trace.append({"indices": list(block), "skipped": True})
            continue
        new_maximum = max(scores[i] for i in selected)
        if maximum is not None:
            new_maximum = max(maximum, new_maximum)
        scale = 0.0 if maximum is None else math.exp(maximum - new_maximum)
        weights = [math.exp(scores[i] - new_maximum) for i in selected]
        denominator = denominator * scale + sum(weights)
        numerator = [numerator[c] * scale + sum(w * values[i][c] for w, i in zip(weights, selected)) for c in range(len(numerator))]
        maximum = new_maximum
        trace.append({"indices": list(block), "maximum": maximum, "denominator": denominator,
                      "numerator": numerator[:], "output": [x / denominator for x in numerator]})
    if maximum is None:
        raise ValueError("An attention row needs at least one allowed key.")
    return [x / denominator for x in numerator], trace


def dense_row(scores, values, allowed=None):
    allowed = [True] * len(scores) if allowed is None else allowed
    ids = [i for i, ok in enumerate(allowed) if ok]
    if not ids:
        raise ValueError("An attention row needs at least one allowed key.")
    maximum = max(scores[i] for i in ids)
    weights = [math.exp(scores[i] - maximum) for i in ids]
    total = sum(weights)
    return [sum(w * values[i][c] for w, i in zip(weights, ids)) / total for c in range(len(values[0]))]


def efficient_cases():
    mass = [3, 1, 6, 2, 4]
    values = [[2, -1], [-3, 2], [1, 4], [5, 0], [-2, -2]]
    scores = list(map(math.log, mass))
    blocks = [[0, 1], [2], [3, 4]]
    output, trace = merge_rows(scores, values, blocks)
    expected = [float(Fraction(11, 16)), float(Fraction(15, 16))]
    comparisons = []
    for perm in itertools.permutations(range(3)):
        result, _ = merge_rows(scores, values, [blocks[j] for j in perm])
        comparisons.extend(abs(a - b) for a, b in zip(result, expected))
    for shift in [-1000, 1000]:
        result, _ = merge_rows([s + shift for s in scores], values, blocks)
        comparisons.extend(abs(a - b) for a, b in zip(result, expected))
    mask = [False, True, True, True, False]
    masked, _ = merge_rows(scores, values, blocks, mask)
    assert max(comparisons) < 1e-12
    assert all(abs(a-b) < 1e-14 for a,b in zip(output, dense_row(scores, values)))
    assert all(abs(a-b) < 1e-14 for a,b in zip(masked, [13/9, 26/9]))
    try:
        merge_rows(scores, values, blocks, [False] * 5)
    except ValueError:
        empty_rejected = True
    else:
        raise AssertionError("Empty row was accepted")
    memory = []
    for n in [192, 768, 3072]:
        common = 4 * n * 48 * 2
        scores_and_probabilities = 2 * n * n * 2
        statistics = 2 * n * 4
        memory.append({"n": n, "common_bytes": common, "dense_bytes": common + scores_and_probabilities,
                       "streamed_bytes": common + statistics, "dense_kib": (common+scores_and_probabilities)/1024,
                       "streamed_kib": (common+statistics)/1024})
    expert = 2 * 6 * 9 + 9 + 6
    router = 6 * 5 + 5
    p = [Fraction(1,2), Fraction(1,4), Fraction(1,8), Fraction(1,16), Fraction(1,16)]
    top2 = [float(p[i] / sum(p[:2])) for i in range(2)]
    routing_counts = [6, 4, 3, 2, 0]
    capacities = []
    for capacity in [3, 4, 5]:
        used = sum(min(capacity, count) for count in routing_counts)
        capacities.append({"capacity": capacity, "factor": capacity/3, "dropped": 15-used,
                           "used": used, "empty_slots": 5*capacity-used})
    f = [Fraction(c,15) for c in routing_counts]
    mean_p = list(map(Fraction, [".35", ".25", ".20", ".15", ".05"]))
    balance = 5 * sum(a*b for a,b in zip(f,mean_p))
    caches = [{"kv_heads": h, "bytes": 2*3*2*96*h*8*2, "kib": 2*3*2*96*h*8*2/1024} for h in [6,2,1]]
    return {"attention": {"masses": mass, "scores": scores, "values": values, "blocks": blocks,
                           "trace": trace, "output": output, "masked_output": masked,
                           "maximum_shift_permutation_error": max(comparisons), "empty_rejected": empty_rejected},
            "memory": memory, "moe": {"d":6,"f":9,"experts":5,"top_k":2,"expert_parameters":expert,
                       "router_parameters":router,"total_parameters":5*expert+router,"touched_parameters":2*expert+router,
                       "probabilities":list(map(float,p)),"top2_weights":top2,"top2_output":top2[0]*3+top2[1]*-6,
                       "switch_top1_output":float(p[0]*3),"counts":routing_counts,"capacities":capacities,
                       "mean_probabilities":list(map(float,mean_p)),"balance_without_alpha":float(balance)},
            "gqa_cache":caches,"equal_ffn_parameter_counts":{"relu":2*4*9,"swiglu":3*4*6}}


def sigmoid(z):
    return 1/(1+math.exp(-z)) if z >= 0 else math.exp(z)/(1+math.exp(z))


def binary_loss(z, y):
    return max(z,0)-z*y+math.log1p(math.exp(-abs(z)))


def transfer_cases():
    inputs = [[-2,-1],[-2,1],[2,-1],[2,1]]
    target = [0,1,0,1]
    source = [0,0,1,1]
    a = [1.0,0.0]
    w, b = 1.0, 0.0
    history = []
    def state(step):
        logits = [w*sum(ai*xi for ai,xi in zip(a,x))+b for x in inputs]
        predictions = [int(z >= 0) for z in logits]
        return {"step":step,"encoder":a[:],"head_weight":w,"head_bias":b,"logits":logits,
                "target_nll":sum(binary_loss(z,y) for z,y in zip(logits,target))/4,
                "target_accuracy":sum(p==y for p,y in zip(predictions,target))/4,
                "old_rule_accuracy":sum(p==y for p,y in zip(predictions,source))/4}
    first_gradient = None
    for step in range(241):
        if step in [0,1,5,20,60,120,240]:history.append(state(step))
        if step == 240:break
        grad_a=[0.0,0.0];grad_w=grad_b=0.0
        for x,y in zip(inputs,target):
            h=sum(ai*xi for ai,xi in zip(a,x)); error=sigmoid(w*h+b)-y
            grad_w+=error*h/4;grad_b+=error/4
            for c in range(2):grad_a[c]+=error*w*x[c]/4
        if first_gradient is None:first_gradient={"encoder":grad_a[:],"head_weight":grad_w,"head_bias":grad_b}
        a=[ai-.2*g for ai,g in zip(a,grad_a)];w-=.2*grad_w;b-=.2*grad_b
    assert history[-1]['target_accuracy']==1
    assert history[-1]['old_rule_accuracy']==.5
    assert history[-1]['target_nll'] < .01
    fixed_adapter_logits=[2*x[1] for x in inputs]
    ideal_nll=sum(binary_loss(z,y) for z,y in zip(fixed_adapter_logits,target))/4
    frozen_nll=math.log(2)
    groups = [[y for x,y in zip(inputs,target) if x[0] == h] for h in [-2,2]]
    assert groups == [[0,1],[0,1]]
    for probability in [.05,.2,.5,.7,.95]:
        paired_loss = -(math.log(probability)+math.log1p(-probability))/2
        assert paired_loss >= frozen_nll - 1e-15
    assert abs(ideal_nll-math.log1p(math.exp(-2))) < 1e-15
    def initial_loss(params):
        a0,a1,weight,bias=params
        return sum(binary_loss(weight*(a0*x[0]+a1*x[1])+bias,y) for x,y in zip(inputs,target))/4
    params=[1.0,0.0,1.0,0.0]
    numerical=[]
    for j in range(4):
        plus=params[:];minus=params[:];plus[j]+=1e-5;minus[j]-=1e-5
        numerical.append((initial_loss(plus)-initial_loss(minus))/2e-5)
    analytical=first_gradient['encoder']+[first_gradient['head_weight'],first_gradient['head_bias']]
    assert max(abs(x-y) for x,y in zip(numerical,analytical)) < 1e-9
    return {"inputs":inputs,"target_labels":target,"old_labels":source,"learning_rate":.2,"steps":240,
            "first_gradient":first_gradient,"history":history,"frozen_optimal_target_nll":frozen_nll,
            "frozen_best_accuracy":.5,"explicit_alternative_encoder":[0,2],"explicit_alternative_nll":ideal_nll,
            "verbalizer":{"full_probabilities":[.3,.1,.6],"conditional_class_probability":.75},
            "cache_example":{"examples":30,"feature_width":7,"float_bytes":4,"feature_bytes":30*7*4,
                             "three_class_head_parameters":7*3+3}}


if __name__ == "__main__":
    print(json.dumps({"origin":"Newly specified mathematical inputs; stdlib calculation only; no external corpus/model.",
                      "efficient_transformers":efficient_cases(),"transfer_learning":transfer_cases()},indent=2,allow_nan=False))
