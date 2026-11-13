"""Original deterministic retraining cases for the Fedor Pakhurov project.

Authored with Codex assistance. No external data, trained model, network access
or source-paper experiment. Numbers are specified teaching cases.
"""
import json
import math
from fractions import Fraction


def fraction_text(value):
    return str(value)


def renewal_cost():
    cost = Fraction(12)
    decay = Fraction(3, 4)
    candidates = [
        {"hours": hours, "average_cost": float(cost / hours + decay * hours / 2)}
        for hours in range(1, 13)
    ]
    best = min(candidates, key=lambda row: row["average_cost"])
    assert best == {"hours": 6, "average_cost": 4.25}
    return {"training_cost": float(cost), "age_cost_rate": float(decay),
            "continuous_optimum_hours": math.sqrt(float(2 * cost / decay)),
            "integer_candidates": candidates, "best_integer": best}


def forgetting():
    settings = {"after_A": Fraction(1), "after_B": Fraction(-2),
                "equal_replay": Fraction(-1, 2), "quadratic_anchor": Fraction(0)}
    rows = []
    for name, weight in settings.items():
        loss_a, loss_b = (weight - 1) ** 2, (weight + 2) ** 2
        rows.append({"setting": name, "w": fraction_text(weight),
                     "loss_A": fraction_text(loss_a), "loss_B": fraction_text(loss_b)})
    assert rows[2]["loss_A"] == rows[2]["loss_B"] == "9/4"
    assert rows[3]["loss_A"] == "1" and rows[3]["loss_B"] == "4"
    return rows


COHORT = [
    {"id": "a", "decision": 0, "prediction": 0, "truth": 0, "label_available": 4},
    {"id": "b", "decision": 1, "prediction": 1, "truth": 1, "label_available": 2},
    {"id": "c", "decision": 2, "prediction": 0, "truth": 1, "label_available": 10},
    {"id": "d", "decision": 3, "prediction": 1, "truth": 0, "label_available": 12},
    {"id": "e", "decision": 4, "prediction": 0, "truth": 0, "label_available": 5},
    {"id": "f", "decision": 5, "prediction": 1, "truth": 1, "label_available": 7},
]


def delayed_labels():
    rows = []
    for cutoff in (6, 12):
        observed = [row for row in COHORT if row["label_available"] <= cutoff]
        correct = sum(row["prediction"] == row["truth"] for row in observed)
        rows.append({"cutoff": cutoff, "observed_ids": [row["id"] for row in observed],
                     "correct": correct, "observed": len(observed),
                     "cohort_size": len(COHORT), "accuracy": str(Fraction(correct, len(observed)))})
    assert rows[0]["accuracy"] == "1" and rows[1]["accuracy"] == "2/3"
    return {"cohort": COHORT, "snapshots": rows}


def exposure_feedback():
    share = Fraction(4, 5)
    path = [str(share)]
    for _ in range(3):
        share = share ** 2 / (share ** 2 + (1 - share) ** 2)
        path.append(str(share))
    assert path == ["4/5", "16/17", "256/257", "65536/65537"]
    return {"equal_click_probability": "1/2", "expected_exposure_share": path}


def paired_gate():
    rows = []
    for index in range(12):
        truth = index % 2
        baseline = truth if index < 7 else 1 - truth
        candidate = 1 - truth if index == 6 else truth
        rows.append({"id": index, "truth": truth, "baseline": baseline,
                     "candidate": candidate, "critical": index == 6})
    gains = sum(r["baseline"] != r["truth"] and r["candidate"] == r["truth"] for r in rows)
    losses = sum(r["baseline"] == r["truth"] and r["candidate"] != r["truth"] for r in rows)
    discordant = gains + losses
    tail = Fraction(sum(math.comb(discordant, k) for k in range(max(gains, losses), discordant + 1)),
                    2 ** discordant)
    p_value = min(Fraction(1), 2 * tail)
    critical_pass = all(r["candidate"] == r["truth"] for r in rows if r["critical"])
    assert (gains, losses, p_value, critical_pass) == (5, 1, Fraction(7, 32), False)
    return {"rows": rows, "baseline_correct": 7, "candidate_correct": 11,
            "gains": gains, "losses": losses, "two_sided_p": str(p_value),
            "critical_gate_pass": critical_pass}


if __name__ == "__main__":
    output = {"scope": "Original deterministic teaching fixtures; no real training or user experiment",
              "renewal_cost": renewal_cost(), "forgetting": forgetting(),
              "delayed_labels": delayed_labels(), "exposure_feedback": exposure_feedback(),
              "paired_gate": paired_gate()}
    print(json.dumps(output, ensure_ascii=False, indent=2, sort_keys=True))
