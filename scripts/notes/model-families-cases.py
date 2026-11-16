"""Original small calculation for the Fedor Pakhurov project, with Codex assistance.
No third-party corpus, weights, code or model output. Python 3.9.7 saved replay.
"""
import json
import math


def families_case():
    source = ['move', 'amber', 'crate', 'to', 'bay']
    damaged = ['move', 'S0', 'to', 'S1']
    target = ['S0', 'amber', 'crate', 'S1', 'bay', 'S2', 'EOS']
    s, t = len(damaged), len(target)
    encoder_edges = s * s
    decoder_edges = t * (t + 1) // 2
    cross_edges = t * s
    prefix_edges = s * s + s * t + t * (t + 1) // 2
    concatenated_causal = (s + t) * (s + t + 1) // 2
    assert prefix_edges == encoder_edges + decoder_edges + cross_edges
    # Positions: two input tokens and two output tokens, with no hidden channels.
    causal = [[int(j <= i) for j in range(4)] for i in range(4)]
    prefix = [[int(j < 2 or (i >= 2 and j <= i)) for j in range(4)] for i in range(4)]
    return {'original_tokens': source, 'corrupted_source': damaged, 'target_with_sentinels': target,
            'encoder_pairs': encoder_edges, 'decoder_pairs': decoder_edges, 'cross_pairs': cross_edges,
            'prefix_pairs': prefix_edges, 'concatenated_causal_pairs': concatenated_causal,
            'four_position_causal_mask': causal, 'four_position_prefix_mask': prefix,
            'full_original_target_tokens_with_eos': len(source) + 1,
            'target_label_loss': -sum(math.log(p) for p in [.5, .25, .5]) / 3}


if __name__ == "__main__":
    print(json.dumps(families_case(), ensure_ascii=False, indent=2, sort_keys=True))
