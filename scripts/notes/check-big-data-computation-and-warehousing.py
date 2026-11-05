"""Verify the toy amounts and work estimates in Big Data notes 10–18."""

from collections import defaultdict


def sum_by_store(rows):
    totals = defaultdict(int)
    for store, cents in rows:
        totals[store] += cents
    return dict(totals)


workers = [
    [(1, 100), (1, 200), (2, 50)],
    [(1, 150), (2, 70), (2, 30)],
    [(1, 100), (1, 50), (2, 200)],
    [(1, 200), (2, 120), (2, 80)],
]
rows = [row for worker in workers for row in worker]
partials = [list(sum_by_store(worker).items()) for worker in workers]
combined = [pair for partial in partials for pair in partial]
assert partials == [
    [(1, 300), (2, 50)],
    [(1, 150), (2, 100)],
    [(1, 150), (2, 200)],
    [(1, 200), (2, 200)],
]
assert sum_by_store(rows) == sum_by_store(combined) == {1: 800, 2: 550}
assert (len(rows) * 16, len(combined) * 16) == (192, 128)
assert (150 + 300) / 2 == 225
assert (100 + 200 + 300) / 3 == 200

reducers = defaultdict(list)
for store, cents in combined:
    reducers[(store - 1) % 2].append((store, cents))
assert {partition: sum_by_store(group) for partition, group in reducers.items()} == {
    0: {1: 800},
    1: {2: 550},
}

assert 600 / 4 == 150
assert (4 - 1) * 60 == 180
assert (600 * 3 / 4, 60 * 3 / 4) == (450, 45)
assert 600 / 2 == 300

gb = 10**9
assert (3 * gb * 80 / gb, 3 * gb * 24 / gb) == (240, 72)
balanced = [60, 60, 60, 60]
skewed = [120, 40, 40, 40]
assert sum(balanced) == sum(skewed) == 240
assert (max(balanced), max(skewed)) == (60, 120)
assert next(runs for runs in range(1, 10) if 90 + 25 * runs < 60 * runs) == 3
assert (90 + 25 * 3, 60 * 3) == (165, 180)

delivered = [
    ("store", "S1", 700),
    ("store", "S1", 700),
    ("web", "W1", 600),
    ("web", "W2", -350),
]
assert sum(cents for _, _, cents in delivered) == 1650
events = {(source, event): cents for source, event, cents in delivered}
assert sum(events.values()) == 950
assert sum(cents for cents in events.values() if cents > 0) == 1300

order_lines = [
    (101, "tea", 2, 350),
    (101, "coffee", 1, 600),
    (102, "tea", 1, 350),
    (103, "coffee", 2, 600),
    (103, "tea", 1, 350),
    (104, "cocoa", 3, 400),
]
amounts = defaultdict(int)
for _, product, quantity, price in order_lines:
    amounts[product] += quantity * price
assert amounts == {"tea": 1400, "coffee": 1800, "cocoa": 1200}
assert len({order for order, _, _, _ in order_lines}) == 4
units = sum(quantity for _, _, quantity, _ in order_lines)
assert units == 10
assert sum(amounts.values()) / units == 440
assert sum(price for _, _, _, price in order_lines) == 2650

print("Distributed computation and analytical warehouse examples verified")
