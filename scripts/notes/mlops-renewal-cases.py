#!/usr/bin/env python3
"""Original, deterministic MLOps teaching fixtures; no models or external data.

Authored for Fedor Pakhurov with Codex assistance on 2026-11-13.
All traces, labels, prices, service times and model outputs are fictional inputs.
This checks arithmetic and failure cases, not a production system's performance.
"""

import argparse
import hashlib
import itertools
import json
import math
from pathlib import Path


def digest(value):
    data = json.dumps(value, sort_keys=True, separators=(",", ":")).encode()
    return hashlib.sha256(data).hexdigest()


def design():
    # A reviewer spends two minutes; an undetected bad preview costs twelve.
    rows = []
    for name, true_positive, false_positive in [("rule", 48, 92), ("candidate", 68, 52)]:
        false_negative = 80 - true_positive
        true_negative = 920 - false_positive
        reviews = true_positive + false_positive
        rows.append({"name": name, "tp": true_positive, "fp": false_positive,
                     "fn": false_negative, "tn": true_negative, "reviews": reviews,
                     "accuracy": (true_positive + true_negative) / 1000,
                     "precision": true_positive / reviews, "recall": true_positive / 80,
                     "minutes": 2 * reviews + 12 * false_negative})
    assert rows[1]["minutes"] == 384 < rows[0]["minutes"] == 664
    return {"documents": 1000, "bad_previews": 80, "review_all_minutes": 2000,
            "accept_all_accuracy": 0.92, "options": rows,
            "latency_budget_ms": {"decode": 18, "features": 12, "queue": 25,
                                  "score": 35, "response": 10},
            "latency_bound_ms": 100, "daily_reviews_limit": 130}


def lifecycle():
    release = {"features": "contrast-v1", "weights": "fixture-score-v1",
               "schema": "preview-v1", "threshold": 0.6}
    next_release = {**release, "features": "contrast-v2"}
    assert digest(release) != digest(next_release)
    return {"release": release, "release_sha256": digest(release),
            "feature_change_sha256": digest(next_release),
            "joined_labels": 6, "submitted_documents": 8,
            "mature_cohort_coverage": 6 / 8}


def serve(arrivals, max_batch, wait, fixed, per_item):
    pending = list(enumerate(arrivals))
    now = 0
    finish = {}
    batches = []
    while pending:
        now = max(now, pending[0][1])
        deadline = pending[0][1] + wait
        count = sum(at <= now for _, at in pending)
        if count < max_batch and now < deadline:
            full_at = pending[max_batch - 1][1] if len(pending) >= max_batch else math.inf
            now = max(now, min(deadline, full_at))
        selected = [item for item in pending if item[1] <= now][:max_batch]
        start = now
        now += fixed + per_item * len(selected)
        for index, _ in selected:
            finish[index] = now
        pending = pending[len(selected):]
        batches.append({"start_ms": start, "finish_ms": now,
                        "requests": [index for index, _ in selected]})
    latencies = [finish[i] - at for i, at in enumerate(arrivals)]
    return {"batches": batches, "latencies_ms": latencies,
            "mean_latency_ms": sum(latencies) / len(latencies),
            "burst_finish_ms": now, "completed_per_second_in_burst": 1000 * len(arrivals) / now}


def serving():
    arrivals = [0, 2, 3, 9, 10, 17]
    single = serve(arrivals, 1, 0, 4, 2)
    batched = serve(arrivals, 3, 3, 4, 2)
    assert single["burst_finish_ms"] == 36
    assert batched["burst_finish_ms"] == 27
    return {"arrivals_ms": arrivals, "service_ms": "4 + 2 * batch_size",
            "single": single, "batched": batched}


def inference():
    lengths = [2, 5, 1, 3]
    active = [(0, lengths[0]), (1, lengths[1])]
    next_id, tick, completion = 2, 0, {}
    trace = []
    while active:
        tick += 1
        trace.append([index for index, _ in active])
        remaining = []
        for index, left in active:
            if left == 1:
                completion[index] = tick
            else:
                remaining.append((index, left - 1))
        active = remaining
        while len(active) < 2 and next_id < len(lengths):
            active.append((next_id, lengths[next_id]))
            next_id += 1
    p, q = [0.2, 0.5, 0.3], [0.4, 0.4, 0.2]
    accepted = [min(a, b) for a, b in zip(p, q)]
    rejection = 1 - sum(accepted)
    residual = [max(a - b, 0) / rejection for a, b in zip(p, q)]
    recovered = [a + rejection * r for a, r in zip(accepted, residual)]
    assert all(math.isclose(a, b) for a, b in zip(recovered, p))
    tokens = [33, 65, 10]
    allocated = [math.ceil(length / 32) * 32 for length in tokens]
    return {"output_lengths": lengths, "continuous_trace": trace,
            "continuous_completion_ticks": [completion[i] for i in range(4)],
            "static_completion_ticks": [2, 5, 6, 8],
            "static_slot_utilization": sum(lengths) / 16,
            "continuous_slot_utilization": sum(lengths) / (2 * tick),
            "kv_bytes": 2 * 12 * 4 * 64 * 768 * 2,
            "kv_MiB": 2 * 12 * 4 * 64 * 768 * 2 / 2**20,
            "block_tokens": 32, "sequence_tokens": tokens,
            "allocated_tokens": allocated, "unused_tokens": sum(allocated) - sum(tokens),
            "speculative_p": p, "speculative_q": q, "acceptance_probability": sum(accepted),
            "rejection_distribution": residual, "recovered_p": recovered}


def score(blur, missing, document_id="", buggy=False):
    if not math.isfinite(blur) or not 0 <= blur <= 1 or missing not in (0, 1):
        raise ValueError("Input outside fixture schema")
    value = 0.1 + 0.8 * blur + 0.1 * missing
    if buggy and document_id.endswith("-export"):
        value += 0.25
    return min(1.0, value)


def testing():
    assert math.isclose(score(0, 0), 0.1)
    assert math.isclose(score(1, 1), 1.0)
    blurs = [0.1, 0.3, 0.45, 0.55, 0.7, 0.9]
    changes = sum((score(b, 0, "card", True) >= 0.6) !=
                  (score(b, 0, "card-export", True) >= 0.6) for b in blurs)
    assert changes == 2
    assert all(score(b, 0) <= score(min(1, b + 0.05), 0) for b in blurs)
    assert all(score(b, 0, "card") == score(b, 0, "card-export") for b in blurs)
    rejected = 0
    for b in [-0.01, 1.01, float("nan"), float("inf")]:
        try:
            score(b, 0)
        except ValueError:
            rejected += 1
    assert rejected == 4
    inputs, labels = [0.0, 1.0], [0.0, 1.0]
    weight, bias = 0.0, 0.0
    errors = [weight * x + bias - y for x, y in zip(inputs, labels)]
    loss_before = sum(e * e for e in errors) / 2
    weight -= 0.1 * sum(e * x for e, x in zip(errors, inputs))
    bias -= 0.1 * sum(errors)
    loss_after = sum((weight*x+bias-y)**2 for x,y in zip(inputs,labels)) / 2
    assert math.isclose(loss_after, 0.325) and loss_after < loss_before
    artifact = json.loads(json.dumps({"weight": weight, "bias": bias}))
    assert [artifact["weight"]*x+artifact["bias"] for x in inputs] == [weight*x+bias for x in inputs]
    return {"blur_values": blurs, "threshold": 0.6, "buggy_identifier_decision_changes": changes,
            "compared_pairs": len(blurs), "repaired_changes": 0,
            "invalid_inputs_rejected": rejected, "monotonicity_checks": len(blurs),
            "boundary_scores": [score(0, 0), score(1, 1)],
            "gradient_check_loss_before": loss_before, "gradient_check_loss_after": loss_after,
            "json_roundtrip_predictions": [weight*x+bias for x in inputs]}


def monitoring():
    p, q = [0.6, 0.3, 0.1], [0.2, 0.3, 0.5]
    psi = sum((b - a) * math.log(b / a) for a, b in zip(p, q))
    reference, current = [0, 1, 1, 2, 3], [1, 2, 3, 4, 5]
    def ks(left, right):
        return max(abs(sum(x <= t for x in left) / len(left) -
                       sum(x <= t for x in right) / len(right))
                   for t in set(left + right))
    observed = ks(reference, current)
    pooled = reference + current
    extreme = 0
    for indices in itertools.combinations(range(10), 5):
        selected = set(indices)
        left = [value for i, value in enumerate(pooled) if i in selected]
        right = [value for i, value in enumerate(pooled) if i not in selected]
        extreme += ks(left, right) >= observed - 1e-12
    return {"reference_bin_fractions": p, "current_bin_fractions": q, "psi": psi,
            "chi_square_against_fixed_reference": sum((10*b-10*a)**2/(10*a) for a,b in zip(p,q)),
            "ks_reference": reference, "ks_current": current, "ks_statistic": observed,
            "permutations": math.comb(10, 5), "extreme_permutations": extreme,
            "permutation_p_value": extreme / math.comb(10, 5),
            "linear_mmd_squared": (sum(reference)/5 - sum(current)/5)**2,
            "unchanged_mean_counterexample_mmd": ((-1+1)/2-(-2+2)/2)**2,
            "false_alarm_probability_20_independent_tests": 1 - 0.95**20}


def llmops():
    # Authored format/evidence fixtures, not actual completions from a model.
    references = ["Map", "Queue", "Cache", "Trace", "Budget", "Clock", "Schema", "Drift"]
    previous = ["Map", "Queue", "Cache", "Trace", "Budget", "Time", "Schema", "Change"]
    candidate = ["Map", "Queue", "Cache", "Trace", "Budget", "Clock", "Format", "Drift"]
    old = [int(a == b) for a, b in zip(previous, references)]
    new = [int(a == b) for a, b in zip(candidate, references)]
    differences = [b-a for a,b in zip(old,new)]
    critical_index = 6
    gate = sum(differences) >= 0 and new[critical_index] == 1
    assert not gate
    trace = [{"operation": name, "start_ms": start, "finish_ms": end}
             for name, start, end in [("validate", 0, 2), ("retrieve", 2, 37),
                                      ("generate", 37, 112), ("parse", 112, 117)]]
    assert sum(span["finish_ms"]-span["start_ms"] for span in trace) == 117
    return {"references": references, "previous_outputs": previous, "candidate_outputs": candidate,
            "previous_correct": sum(old), "candidate_correct": sum(new), "items": len(old),
            "paired_differences": differences, "candidate_release_pass": gate,
            "critical_item": references[critical_index],
            "fictional_input_tokens": 800, "fictional_output_tokens": 120,
            "fictional_cost_per_call": 800 * 0.000002 + 120 * 0.000006,
            "with_one_retry_probability_0_2": (800 * 0.000002 + 120 * 0.000006) * 1.2,
            "judge_true_positive": 90, "judge_false_positive": 180,
            "judge_positive_precision": 90 / (90 + 180), "fictional_trace": trace,
            "trace_total_ms": 117}


def cost():
    rows = [{"name": name, "cost_per_hour": price, "requests_per_hour": capacity,
             "p95_ms": latency, "cost_per_request_at_capacity": price / capacity}
            for name, price, capacity, latency in [("A", .72, 180, 90), ("B", 1.08, 300, 65),
                                                   ("C", 1.62, 420, 45), ("D", 1.44, 300, 80)]]
    for row in rows:
        row["dominated"] = any(other["p95_ms"] <= row["p95_ms"] and
                               other["cost_per_request_at_capacity"] <= row["cost_per_request_at_capacity"] and
                               (other["p95_ms"] < row["p95_ms"] or
                                other["cost_per_request_at_capacity"] < row["cost_per_request_at_capacity"])
                               for other in rows)
    assert [r["name"] for r in rows if not r["dominated"]] == ["B", "C"]
    return {"fictional_configurations": rows, "B_cost_per_request_at_60_per_hour": 1.08/60,
            "two_devices_three_hours_energy_kWh_with_overhead": 2*.15*3*1.2,
            "mfu_from_30_achieved_100_peak": 30/100,
            "checkpoint_minutes": 4, "work_interval_minutes": 60,
            "checkpoint_fraction": 4/(60+4), "mean_lost_work_minutes_uniform_failure": 60/2}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    results = {"kind": "original synthetic teaching fixtures; not measured hardware or model results",
               "what-mlops-is": lifecycle(), "ml-system-design": design(), "serving-models": serving(),
               "llm-inference-systems": inference(), "testing-ml-systems": testing(),
               "monitoring-and-drift": monitoring(), "llmops": llmops(), "cost-and-efficiency": cost()}
    text = json.dumps(results, ensure_ascii=False, indent=2, allow_nan=False) + "\n"
    if args.output:
        args.output.write_text(text)
    else:
        print(text, end="")


if __name__ == "__main__":
    main()
