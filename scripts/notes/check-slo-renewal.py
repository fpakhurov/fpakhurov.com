#!/usr/bin/env python3
"""Original deterministic SLO lesson fixture, authored for Fedor with AI assistance.

No external data or third-party example code. This models complete minute buckets,
not Prometheus sampling/extrapolation or the delivery of notifications.
"""

import json
from fractions import Fraction
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PERIOD = 14 * 24 * 60
OBJECTIVE = Fraction(995, 1000)
EVENTS = {
    "isolated": (2 * 1440 + 3 * 60, 1),
    "busy_failure": (4 * 1440 + 11 * 60 + 10, 12),
    "slow_ack": (9 * 1440 + 23 * 60, 180),
}


def series():
    attempts, bad = [], []
    for minute in range(PERIOD):
        hour = minute % 1440 // 60
        attempts.append(1000 if 8 <= hour < 18 else 100)
        bad.append(0)
    start, length = EVENTS["isolated"]
    attempts[start], bad[start] = 1, 1
    for event, count in [("busy_failure", 200), ("slow_ack", 3)]:
        start, length = EVENTS[event]
        bad[start:start + length] = [count] * length
    return attempts, bad


def prefix(values):
    result = [0]
    for value in values:
        result.append(result[-1] + value)
    return result


def run(attempts, bad, long_window, short_window, threshold, minimum):
    counts, failures = prefix(attempts), prefix(bad)
    firing = []
    for end in range(1, len(attempts) + 1):
        if end < long_window:
            continue
        total_long = counts[end] - counts[end - long_window]
        bad_long = failures[end] - failures[end - long_window]
        total_short = counts[end] - counts[end - short_window]
        bad_short = failures[end] - failures[end - short_window]
        if (total_long >= minimum and total_short > 0
                and bad_long * threshold.denominator >= total_long * threshold.numerator
                and bad_short * threshold.denominator >= total_short * threshold.numerator):
            firing.append(end)
    return firing


def timestamp(end):
    day, minute = divmod(end, 1440)
    hour, minute = divmod(minute, 60)
    return f"day {day} {hour:02d}:{minute:02d}"


def intervals(points):
    result = []
    for point in points:
        if not result or point != result[-1][1] + 1:
            result.append([point, point])
        else:
            result[-1][1] = point
    return [{"first": timestamp(start), "last": timestamp(end),
             "evaluations": end - start + 1} for start, end in result]


def evaluate():
    attempts, bad = series()
    pages = run(attempts, bad, 12, 3, Fraction(5, 100), 900)
    tickets = run(attempts, bad, 180, 30, Fraction(1, 100), 600)
    isolated, _ = EVENTS["isolated"]
    busy, busy_length = EVENTS["busy_failure"]
    slow, slow_length = EVENTS["slow_ack"]
    assert pages[0] == busy + 3
    assert pages[-1] == busy + busy_length + 2
    assert not any(isolated <= end <= isolated + 180 for end in pages + tickets)
    assert not any(slow <= end <= slow + slow_length for end in pages)
    slow_tickets = [end for end in tickets if slow <= end <= slow + slow_length]
    assert slow_tickets[0] == slow + 60

    # A ratio-of-sums gives each request one vote. A mean of minute ratios does not.
    fixture_attempts, fixture_bad = [100] * 11 + [1], [0] * 11 + [1]
    weighted = Fraction(sum(fixture_bad), sum(fixture_attempts))
    unweighted = sum((Fraction(b, n) for n, b in zip(fixture_attempts, fixture_bad)), Fraction()) / 12
    assert weighted < Fraction(5, 100) < unweighted

    # A full outage below the volume floor is intentionally invisible to this rule.
    assert run([1] * 20, [1] * 20, 12, 3, Fraction(5, 100), 900) == []
    # No requests is missing availability evidence, not a perfect SLI.
    assert run([0] * 20, [0] * 20, 12, 3, Fraction(5, 100), 900) == []

    total, failed = sum(attempts), sum(bad)
    allowed = (1 - OBJECTIVE) * total
    return {
        "provenance": "Original fictional answer-save traffic fixture; Fedor Pakhurov with AI assistance; no external dataset.",
        "evaluation": "Whole-minute buckets; event starts use zero-based day numbers; timestamps are exclusive bucket ends.",
        "attempts": total, "bad": failed,
        "sli_percent": round(float(1 - Fraction(failed, total)) * 100, 6),
        "allowed_bad": float(allowed),
        "budget_used_percent": round(float(Fraction(failed, 1) / allowed) * 100, 6),
        "page_intervals": intervals(pages), "ticket_intervals_before_deduplication": intervals(tickets),
        "slow_ticket_delay_minutes": slow_tickets[0] - slow,
        "unequal_traffic": {"ratio_of_sums_percent": round(float(weighted) * 100, 6),
                            "mean_of_ratios_percent": round(float(unweighted) * 100, 6)},
        "availability": {"series": 0.998 * 0.999, "independent_pair": 1 - 0.002 ** 2,
                         "pair_with_shared_failure": 0.999 * (1 - 0.002 ** 2)},
    }


def check_published_claims(result):
    for locale in ("notes", "notes-ru"):
        text = (ROOT / "src/content" / locale / "devops/slos-and-alerting.mdx").read_text()
        for claim in ("99.969287", "6.142503", "11:13", "11:24", "00:00"):
            assert claim in text, (locale, "missing checked claim", claim)
        for stale in ("14.4", "58.6", "ratio_rate1h", "four-week budget", "six approaches"):
            assert stale not in text, (locale, "stale example", stale)
    assert result["sli_percent"] == 99.969287
    assert result["budget_used_percent"] == 6.142503


if __name__ == "__main__":
    result = evaluate()
    if "--check-notes" in __import__("sys").argv:
        check_published_claims(result)
    print(json.dumps(result, ensure_ascii=False, indent=2))
