"""Original deterministic fine-tuning and low-rank arithmetic; Python standard library only."""
import json
import math

CHECKS = 0

def close(actual, expected, tolerance=1e-9):
    global CHECKS
    CHECKS += 1
    assert abs(actual - expected) <= tolerance, (actual, expected)

def sigmoid(value):
    return 1 / (1 + math.exp(-value))

def dot(left, right):
    return sum(a * b for a, b in zip(left, right))

def matvec(matrix, vector):
    return [dot(row, vector) for row in matrix]

def transpose(matrix):
    return [list(row) for row in zip(*matrix)]

def matmul(left, right):
    return [[dot(row, col) for col in transpose(right)] for row in left]

def binary_loss(matrix, head, vector):
    return math.log1p(math.exp(-dot(head, matvec(matrix, vector))))

def binary_step(matrix, head, vector, rate, update_features):
    hidden = matvec(matrix, vector)
    delta = sigmoid(dot(head, hidden)) - 1
    gradient_head = [delta * entry for entry in hidden]
    gradient_matrix = [[delta * entry * x for x in vector] for entry in head]
    new_head = [value - rate * gradient for value, gradient in zip(head, gradient_head)]
    new_matrix = [[value - (rate * gradient if update_features else 0) for value, gradient in zip(row, gradient_row)] for row, gradient_row in zip(matrix, gradient_matrix)]
    return {'matrix': new_matrix, 'head': new_head, 'gradient_matrix': gradient_matrix, 'gradient_head': gradient_head,
            'logit': dot(new_head, matvec(new_matrix, vector)), 'loss': binary_loss(new_matrix, new_head, vector)}

def fine_tuning():
    matrix, head, vector, rate = [[1., 0.], [0., 1.]], [1., -1.], [2., 1.], .1
    full = binary_step(matrix, head, vector, rate, True)
    probe = binary_step(matrix, head, vector, rate, False)
    probe_full = binary_step(probe['matrix'], probe['head'], vector, rate, True)
    epsilon = 1e-6
    for row in range(2):
        for col in range(2):
            plus, minus = [r[:] for r in matrix], [r[:] for r in matrix]
            plus[row][col] += epsilon
            minus[row][col] -= epsilon
            finite = (binary_loss(plus, head, vector) - binary_loss(minus, head, vector)) / (2 * epsilon)
            close(finite, full['gradient_matrix'][row][col])
    for col in range(2):
        plus, minus = head[:], head[:]
        plus[col] += epsilon
        minus[col] -= epsilon
        finite = (binary_loss(matrix, plus, vector) - binary_loss(matrix, minus, vector)) / (2 * epsilon)
        close(finite, full['gradient_head'][col])
    trace = []
    theta = 0.
    for step in range(41):
        train = math.log1p(math.exp(-theta))
        validation = .75 * train + .25 * math.log1p(math.exp(theta))
        trace.append({'step': step, 'theta': theta, 'train': train, 'validation': validation})
        close(validation, train + theta / 4)
        train_fn = lambda t: math.log1p(math.exp(-t))
        val_fn = lambda t: train_fn(t) + t / 4
        for fn, expected in [(train_fn, sigmoid(theta) - 1), (val_fn, sigmoid(theta) - .75)]:
            close((fn(theta + epsilon) - fn(theta - epsilon)) / (2 * epsilon), expected)
        theta -= .25 * (sigmoid(theta) - 1)
    best = min(trace, key=lambda point: point['validation'])
    close(sigmoid(math.log(3)), .75)
    assert trace[-1]['train'] < best['train'] and trace[-1]['validation'] > best['validation']
    target_probabilities = [.4, .8]
    first_loss = -sum(math.log(p) for p in target_probabilities) / 2
    second_loss = -math.log(.5)
    token_mean = (2 * first_loss + second_loss) / 3
    example_mean = (first_loss + second_loss) / 2
    close(first_loss, -math.log(.32) / 2)
    lengths = [3, 6, 4]
    return {'input': vector, 'initial_matrix': matrix, 'initial_head': head, 'rate': rate,
            'initial_logit': 1, 'initial_probability': sigmoid(1), 'initial_loss': binary_loss(matrix, head, vector),
            'full': full, 'probe': probe, 'probe_then_full': probe_full,
            'checkpoint': {'trace': trace, 'best': best, 'optimal_theta': math.log(3)},
            'masked_loss': {'prefix': ['sort', 'teal', 'disk'], 'target': ['left', 'EOS'], 'probabilities': target_probabilities,
                            'first_loss': first_loss, 'second_loss': second_loss, 'token_mean': token_mean, 'example_mean': example_mean},
            'padding': {'lengths': lengths, 'valid_tokens': sum(lengths), 'padded_tokens': len(lengths) * max(lengths),
                        'valid_square_slots': sum(n*n for n in lengths), 'padded_square_slots': len(lengths)*max(lengths)**2,
                        'local_batches': [[3, 4], [6]], 'local_tokens': 2*4 + 6, 'local_square_slots': 2*4**2 + 6**2}}

def lora_output(base, left, right, vector, scale):
    base_output = matvec(base, vector)
    branch = matvec(left, matvec(right, vector))
    return [a + scale*b for a, b in zip(base_output, branch)]

def squared_loss(output, target):
    return .5 * sum((a-b)**2 for a, b in zip(output, target))

def peft():
    base = [[1., 0., -1.], [0., 1., 1.]]
    right, left = [[1., -1., 2.]], [[0.], [0.]]
    vector, target, scale, rate = [2., 1., -1.], [2., 2.], 2., .1
    output = lora_output(base, left, right, vector, scale)
    residual = [a-b for a,b in zip(output, target)]
    projected = matvec(right, vector)
    gradient_left = [[scale*g*a for a in projected] for g in residual]
    back = matvec(transpose(left), residual)
    gradient_right = [[scale*b*x for x in vector] for b in back]
    epsilon = 1e-6
    for factor, expected in [('left', gradient_left), ('right', gradient_right)]:
        values = left if factor == 'left' else right
        for i,row in enumerate(values):
            for j,_ in enumerate(row):
                plus, minus = [r[:] for r in values], [r[:] for r in values]
                plus[i][j] += epsilon
                minus[i][j] -= epsilon
                if factor == 'left':
                    p = lora_output(base, plus, right, vector, scale)
                    m = lora_output(base, minus, right, vector, scale)
                else:
                    p = lora_output(base, left, plus, vector, scale)
                    m = lora_output(base, left, minus, vector, scale)
                close((squared_loss(p,target)-squared_loss(m,target))/(2*epsilon), expected[i][j])
    new_left = [[value-rate*g for value,g in zip(row, gr)] for row,gr in zip(left, gradient_left)]
    new_right = [[value-rate*g for value,g in zip(row, gr)] for row,gr in zip(right, gradient_right)]
    product = matmul(new_left, new_right)
    update = [[scale*x for x in row] for row in product]
    merged = [[b+u for b,u in zip(br,ur)] for br,ur in zip(base,update)]
    new_output = lora_output(base,new_left,new_right,vector,scale)
    for a,b in zip(new_output, matvec(merged,vector)):
        close(a,b)
    close(squared_loss(output,target),2.5)
    close(squared_loss(new_output,target),.9)
    both_zero = {'gradient_left': [[0.], [0.]], 'gradient_right': [[0.,0.,0.]]}
    for value in matvec([[0.,0.,0.]],vector)+matvec(transpose(left),residual):
        close(value,0.)
    u1, u2 = [[1,0],[0,0]], [[0,0],[0,1]]
    summed = [[a+b for a,b in zip(r1,r2)] for r1,r2 in zip(u1,u2)]
    determinant = lambda m: m[0][0]*m[1][1]-m[0][1]*m[1][0]
    close(determinant(u1),0); close(determinant(u2),0); close(determinant(summed),1)
    for a in range(-3,4):
        for b in range(-3,4):
            for c in range(-3,4):
                for d in range(-3,4):
                    close(determinant([[a*c,a*d],[b*c,b*d]]),0)
    down, up, z = [1,1], [2,-1], [2,1]
    adapter = lambda value: [entry + weight * max(0,dot(down,value)) for entry,weight in zip(value,up)]
    adapter_plus,adapter_minus = adapter(z), adapter([-v for v in z])
    adapter_sum = [a+b for a,b in zip(adapter_plus,adapter_minus)]
    assert adapter_sum != [0,0]
    size, rank = 2048,8
    base_count, update_count = size**2,2*size*rank
    full_bytes, frozen_bytes, update_bytes = 16*base_count,4*base_count,16*update_count
    return {'base': base, 'initial_A':right, 'initial_B':left, 'x':vector, 'target':target, 'scale':scale, 'rate':rate,
            'initial_output':output, 'initial_loss':squared_loss(output,target), 'Ax':projected,
            'gradient_A':gradient_right, 'gradient_B':gradient_left, 'A':new_right,'B':new_left,
            'update':update,'merged':merged,'output':new_output,'loss':squared_loss(new_output,target), 'both_zero':both_zero,
            'rank': {'first':u1,'second':u2,'sum':summed,'determinants':[determinant(m) for m in [u1,u2,summed]]},
            'nonlinear':{'down':down,'up':up,'z':z,'positive':adapter_plus,'negative':adapter_minus,'sum':adapter_sum},
            'count':{'dimension':size,'rank':rank,'base':base_count,'update':update_count,'reduction':base_count/update_count,
                     'full_bytes':full_bytes,'frozen_bytes':frozen_bytes,'update_bytes':update_bytes,
                     'full_mib':full_bytes/2**20,'frozen_mib':frozen_bytes/2**20,'update_mib':update_bytes/2**20,
                     'total_mib':(frozen_bytes+update_bytes)/2**20,'tiny_rank1':5,'tiny_rank2':10},
            'prompt':{'length':6,'width':16,'layers':4,'input_parameters':6*16,'kv_parameters':2*4*6*16}}

if __name__ == '__main__':
    result = {'fine_tuning':fine_tuning(), 'peft':peft()}
    result['assertions'] = CHECKS
    print(json.dumps(result,ensure_ascii=False,indent=2) + '\n', end='')
