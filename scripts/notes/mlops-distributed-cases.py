#!/usr/bin/env python3
"""Original arithmetic and scheduling cases for distributed training.

Authored for Fedor Pakhurov's project with Codex assistance. No GPU, network,
external data, tensor library or distributed runtime is used.
"""
import argparse
import copy
from fractions import Fraction
import json
from pathlib import Path


def gradient_case():
    workers = [[(1, 0)], [(2, 1), (1, 2)], [(3, 1), (2, 0), (1, 1)]]
    sums = [sum((x - y) * x for x, y in rows) for rows in workers]
    means = [Fraction(total, len(rows)) for total, rows in zip(sums, workers)]
    pooled = Fraction(sum(sums), sum(map(len, workers)))
    rank_mean = sum(means) / len(means)
    assert pooled == 2 and rank_mean == Fraction(29, 18)
    return dict(rows=workers, counts=list(map(len, workers)), gradient_sums=sums,
                local_means=list(map(str, means)), pooled_mean=str(pooled),
                unweighted_rank_mean=str(rank_mean),
                update_from_one_with_lr_one_tenth=str(1 - pooled / 10))


def ring_case():
    # Independently specified small integer vectors split into three chunks.
    vectors = [[rank * 3 + coordinate - 4 for coordinate in range(12)] for rank in range(3)]
    ranks = len(vectors)
    width = len(vectors[0]) // ranks
    state = [[row[start:start + width] for start in range(0, len(row), width)] for row in vectors]
    sent_values = [0] * ranks
    phases = []
    for step in range(ranks - 1):
        messages = []
        for rank in range(ranks):
            chunk = (rank - step) % ranks
            messages.append(((rank + 1) % ranks, chunk, list(state[rank][chunk])))
            sent_values[rank] += width
        for dest, chunk, payload in messages:
            state[dest][chunk] = [a + b for a, b in zip(state[dest][chunk], payload)]
        phases.append(dict(phase='reduce-scatter', step=step, state=copy.deepcopy(state)))
    reduced_owner_chunks = [(rank + 1) % ranks for rank in range(ranks)]
    expected = [sum(items) for items in zip(*vectors)]
    for rank, chunk in enumerate(reduced_owner_chunks):
        assert state[rank][chunk] == expected[chunk * width:(chunk + 1) * width]
    for step in range(ranks - 1):
        messages = []
        for rank in range(ranks):
            chunk = (rank + 1 - step) % ranks
            messages.append(((rank + 1) % ranks, chunk, list(state[rank][chunk])))
            sent_values[rank] += width
        for dest, chunk, payload in messages:
            state[dest][chunk] = payload
        phases.append(dict(phase='all-gather', step=step, state=copy.deepcopy(state)))
    flattened = [[value for chunk in row for value in chunk] for row in state]
    assert flattened == [expected] * ranks and sent_values == [16] * ranks
    return dict(vectors=vectors, reduced_owner_chunks=reduced_owner_chunks,
                reduction=expected, final_vectors=flattened, phases=phases,
                sent_values_per_rank=sent_values, assumed_four_byte_payload_sent_per_rank=[4 * n for n in sent_values])


def memory_case():
    parameters = 12_000_000
    ranks = 3
    weight, gradient, master_and_moments = 2, 4, 12
    amounts = {
        'replicated': parameters * (weight + gradient + master_and_moments),
        'optimizer_and_master_sharded': parameters * (weight + gradient + Fraction(master_and_moments, ranks)),
        'gradient_optimizer_master_sharded': parameters * (weight + Fraction(gradient + master_and_moments, ranks)),
        'all_persistent_states_sharded': Fraction(parameters * (weight + gradient + master_and_moments), ranks),
    }
    assert list(amounts.values()) == [216_000_000, 120_000_000, 88_000_000, 72_000_000]
    payload = parameters * gradient
    ring_sent = 2 * Fraction(ranks - 1, ranks) * payload
    assert ring_sent == 64_000_000
    return dict(parameters=parameters, ranks=ranks, bytes_per_parameter=dict(weight=weight, gradient=gradient, master_and_moments=master_and_moments),
                persistent_bytes_per_rank={k:int(v) for k,v in amounts.items()},
                full_gradient_payload_bytes=payload, ring_sent_payload_per_rank_bytes=int(ring_sent))


def tensor_case():
    x = [2, -1, 3]
    weight = [[1, -1], [2, 1], [-1, 2]]
    full = [sum(a * row[j] for a, row in zip(x, weight)) for j in range(2)]
    partials = [[sum(x[i] * weight[i][j] for i in indices) for j in range(2)]
                for indices in [[0, 1], [2]]]
    combined = [sum(items) for items in zip(*partials)]
    relu_after = [max(0, value) for value in combined]
    relu_before = [sum(max(0, value) for value in items) for items in zip(*partials)]
    assert full == combined == [-3, 3]
    assert partials == [[0, -3], [-3, 6]] and relu_after == [0, 3] and relu_before == [0, 6]
    return dict(input=x, weight=weight, full=full, input_shard_partials=partials,
                reduced_then_relu=relu_after, relu_before_reduction=relu_before)


def pipeline_case(stages, microbatches):
    # Each forward or backward operation uses one slot on one stage.
    # Fill/drain all forward work before beginning any backward work.
    schedule = [[None] * (2 * (microbatches + stages - 1)) for _ in range(stages)]
    forward_end = microbatches + stages - 1
    for microbatch in range(microbatches):
        for stage in range(stages):
            schedule[stage][microbatch + stage] = f'F{microbatch + 1}'
            backward_start = forward_end + (microbatches - 1 - microbatch) + (stages - 1 - stage)
            assert schedule[stage][backward_start] is None
            schedule[stage][backward_start] = f'B{microbatch + 1}'
    slots = len(schedule[0])
    busy = sum(value is not None for row in schedule for value in row)
    assert busy == 2 * stages * microbatches
    for microbatch in range(microbatches):
        forwards = [row.index(f'F{microbatch + 1}') for row in schedule]
        backwards = [row.index(f'B{microbatch + 1}') for row in schedule]
        assert forwards == sorted(forwards) and backwards == sorted(backwards, reverse=True)
        assert min(backwards) > max(forwards)
    return dict(stages=stages, microbatches=microbatches, slots=slots, busy_stage_slots=busy,
                utilization=str(Fraction(busy, stages * slots)), schedule=schedule)


def checkpoint_case():
    layers = [(1, 1), (2, -1), (1, 2), (1, -2), (2, 1), (1, 1), (1, -1), (2, 0), (1, 3)]
    initial = 2
    full_values = [initial]
    for weight, bias in layers:
        full_values.append(weight * full_values[-1] + bias)
    gradient = full_values[-1]
    full_weight_gradients = [None] * len(layers)
    for index in range(len(layers) - 1, -1, -1):
        full_weight_gradients[index] = gradient * full_values[index]
        gradient *= layers[index][0]
    full_input_gradient = gradient
    boundaries = {index:full_values[index] for index in [0, 3, 6]}
    replay_gradient = full_values[-1]
    replay_weight_gradients = [None] * len(layers)
    replay_steps = 0
    for start in [6, 3, 0]:
        local = [boundaries[start]]
        for weight, bias in layers[start:start + 3]:
            local.append(weight * local[-1] + bias)
            replay_steps += 1
        for index in range(start + 2, start - 1, -1):
            replay_weight_gradients[index] = replay_gradient * local[index - start]
            replay_gradient *= layers[index][0]
    assert full_values[-1] == 25 and full_input_gradient == replay_gradient == 200
    assert replay_weight_gradients == full_weight_gradients
    assert replay_steps == 9
    return dict(layers=layers, initial=initial, forward_values=full_values, output=full_values[-1],
                input_gradient=full_input_gradient, weight_gradients=full_weight_gradients,
                saved_full_inputs=len(layers), saved_boundary_inputs=len(boundaries),
                temporary_segment_values=4, replayed_forward_operations=replay_steps,
                checkpoint_gradients_equal=True)


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--output',type=Path)
    args=parser.parse_args()
    result=dict(kind='Original scalar, byte-ledger and abstract scheduling cases; not a distributed runtime benchmark',
                gradient=gradient_case(),ring=ring_case(),memory=memory_case(),tensor=tensor_case(),
                pipeline=[pipeline_case(3,n) for n in [1,5,9]],checkpoint=checkpoint_case())
    text=json.dumps(result,ensure_ascii=False,indent=2)+'\n'
    if args.output:args.output.write_text(text)
    else:print(text,end='')


if __name__=='__main__':main()
