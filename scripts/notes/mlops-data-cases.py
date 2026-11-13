#!/usr/bin/env python3
"""Original offline preview-data fixtures, authored for Fedor Pakhurov with Codex assistance.

All event records and validation cases were specified for this lesson renewal.
Only Python's standard library is used; filesystem writes stay in a temporary directory.
"""
import argparse
from collections import Counter
import hashlib
import json
import math
import os
from pathlib import Path
import tempfile


def encoded(value):
    return json.dumps(value, sort_keys=True, separators=(",", ":"), allow_nan=False).encode()


def sha(value):
    return hashlib.sha256(encoded(value)).hexdigest()


def snapshot(events, day, observed_by):
    unique = {}
    for event in sorted(events, key=lambda row: row["observed_hour"]):
        if event["observed_hour"] <= observed_by:
            payload = {key: event[key] for key in ["event_id", "card", "event_hour"]}
            if event["event_id"] in unique and unique[event["event_id"]] != payload:
                raise ValueError("Conflicting payload for one event ID")
            unique[event["event_id"]] = payload
    selected = [row for row in unique.values() if row["event_hour"] // 24 == day]
    return sorted(selected, key=lambda row: row["event_id"])


def pipeline():
    events = [dict(event_id=i, card=card, event_hour=event, observed_hour=observed)
              for i, card, event, observed in [
                  ("e1", "A", 9, 9), ("e3", "C", 29, 29),
                  ("e2", "B", 15, 31), ("e1", "A", 9, 32), ("e4", "D", 33, 33)]]
    early, revised = snapshot(events, 0, 30), snapshot(events, 0, 36)
    assert [row["card"] for row in early] == ["A"]
    assert [row["card"] for row in revised] == ["A", "B"]
    assert revised == snapshot(list(reversed(events)), 0, 36)
    # Validate visible event IDs before partitioning, including cross-day conflicts.
    for conflicting_hour in [10, 25]:
        conflict = dict(event_id="e1", card="A", event_hour=conflicting_hour, observed_hour=34)
        assert snapshot(events + [conflict], 0, 33) == snapshot(events, 0, 33)
        for day in [0, 1]:
            try:
                snapshot(events + [conflict], day, 36)
            except ValueError:
                pass
            else:
                raise AssertionError("Visible conflicting IDs must fail before partition selection")
    with tempfile.TemporaryDirectory(prefix="preview-pipeline-") as directory:
        destination = Path(directory) / "day-0.json"
        temporary = Path(directory) / "day-0.staging.json"
        destination.write_bytes(encoded(early))
        temporary.write_bytes(encoded(revised))
        before_publish = destination.read_bytes() == encoded(early)
        os.replace(temporary, destination)
        published = destination.read_bytes()
        temporary.write_bytes(encoded(revised))
        os.replace(temporary, destination)
        retry_identical = destination.read_bytes() == published
    watermark, late = float("-inf"), []
    for event in events:
        if event["event_hour"] < watermark:
            late.append(event["event_id"])
        watermark = max(watermark, event["event_hour"] - 4)
    assert late == ["e2", "e1"]
    return {"events": events, "early_observed_by_hour": 30, "revised_observed_by_hour": 36,
            "early_day_0": early, "revised_day_0": revised,
            "early_sha256": sha(early), "revised_sha256": sha(revised),
            "replay_same_bytes": retry_identical, "old_snapshot_visible_before_publish": before_publish,
            "watermark_lag_hours": 4, "late_delivery_ids_including_duplicate": late,
            "final_watermark": watermark, "backfill_counts_at_36": [len(snapshot(events,d,36)) for d in [0,1]]}


def validate(rows):
    def valid_id(value):
        return isinstance(value, str) and bool(value.strip())

    counts = Counter(row.get("id") for row in rows
                     if isinstance(row, dict) and valid_id(row.get("id")))
    failures = []
    for index, row in enumerate(rows):
        if not isinstance(row, dict):
            failures.append({"row": index, "id": None, "reasons": ["invalid_record"]})
            continue
        reasons = []
        identifier = row.get("id")
        if not valid_id(identifier):
            reasons.append("invalid_id")
        contrast = row.get("contrast")
        if contrast is None:
            reasons.append("missing_contrast")
        elif (isinstance(contrast, bool) or not isinstance(contrast, (int, float))
              or not 0 <= contrast <= 1 or not math.isfinite(contrast)):
            reasons.append("invalid_contrast")
        width = row.get("width")
        if not isinstance(width, int) or isinstance(width, bool) or width <= 0:
            reasons.append("invalid_width")
        if row.get("format") not in ("png", "jpg"):
            reasons.append("unsupported_format")
        if valid_id(identifier) and counts[identifier] > 1:
            reasons.append("duplicate_id")
        if reasons:
            failures.append({"row": index, "id": identifier, "reasons": reasons})
    return failures


def quality():
    rows = [dict(id=i, contrast=c, width=w, format=f) for i,c,w,f in [
        ("c01", .8, 640, "png"), ("c02", .7, 640, "jpg"), ("c03", .25, 480, "png"),
        ("c04", None, 640, "jpg"), ("c05", .6, 0, "png"), ("c06", 1.1, 640, "png"),
        ("c07", .9, 640, "gif"), ("c07", .4, 640, "jpg")]]
    failures=validate(rows)
    counts=dict(Counter(reason for row in failures for reason in row["reasons"]))
    assert len(failures)==5 and sum(counts.values())==6
    # Adversarial schema checks are separate from the unchanged eight-row lesson.
    valid = dict(id="edge", contrast=.5, width=640, format="png")
    for value in [None, "", "   ", [], 7]:
        assert "invalid_id" in validate([{**valid, "id": value}])[0]["reasons"]
    for value in [True, False, float("nan"), float("inf"), "0.5", 10**1000]:
        assert "invalid_contrast" in validate([{**valid, "contrast": value}])[0]["reasons"]
    for field, reason in [("id", "invalid_id"), ("contrast", "missing_contrast"),
                          ("width", "invalid_width"), ("format", "unsupported_format")]:
        incomplete = dict(valid)
        del incomplete[field]
        assert reason in validate([incomplete])[0]["reasons"]
    assert validate([None])[0]["reasons"] == ["invalid_record"]
    assert "invalid_width" in validate([{**valid, "width": True}])[0]["reasons"]
    assert not validate([valid])
    a=[{"id":"c01","contrast":.8},{"id":"c02","contrast":.7}]
    same_content=list(reversed(a))
    canonical=lambda values: sorted(values,key=lambda row:row["id"])
    modified=[{"id":"c01","contrast":.81},{"id":"c02","contrast":.7}]
    assert sha(canonical(a))==sha(canonical(same_content))!=sha(canonical(modified))
    p=.75
    tail=sum(math.comb(40,k)*p**k*(1-p)**(40-k) for k in range(21))
    assert 0<tail<.01
    return {"rows":rows,"row_failures":failures,"reason_counts":counts,"rejected_rows":5,
            "remaining_rows":3,"batch_publish_pass":not failures,
            "reference_format_fraction_png":.75,"current_png_count":20,"current_count":40,
            "linfinity_discrepancy":.25,"one_sided_binomial_probability_at_most_20":tail,
            "binomial_assumption":"40 independent records, fixed true PNG probability .75; one predeclared direction",
            "canonical_original_sha256":sha(canonical(a)),"canonical_changed_sha256":sha(canonical(modified)),
            "raw_order_changes_bytes":sha(a)!=sha(same_content),"canonical_order_same_bytes":True}


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--output",type=Path)
    args=parser.parse_args()
    result={"kind":"original synthetic data and local filesystem fixture; not an external pipeline run",
            "data-pipelines":pipeline(),"data-quality-and-versioning":quality()}
    text=json.dumps(result,ensure_ascii=False,indent=2,allow_nan=False)+"\n"
    if args.output: args.output.write_text(text)
    else: print(text,end="")


if __name__=="__main__":
    main()
