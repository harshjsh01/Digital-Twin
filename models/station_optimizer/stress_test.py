"""
PROJECT AAHAVAAN — 100,000-minute safety stress simulation.

This is an engineering validation simulator, not railway signalling software.
It exercises the V5 multi-stage topology for a long horizon and independently
checks the resulting reservations for:
  - platform collisions
  - holding collisions
  - route-lock collisions
  - approach headway violations
  - deadlock / stuck-train conditions

The simulator uses a conservative earliest-feasible reservation policy. It is
intended to validate safety invariants over a long synthetic horizon without
requiring 100,000 CP-SAT solves.

Run from Railway/:  python models/station_optimizer/stress_test.py
Optional: python ... --minutes 100000 --seed 20260913 --arrival-rate 0.16
"""
import argparse
import heapq
import random
import statistics
from dataclasses import dataclass

PLATFORMS = tuple(range(1, 7))
HOLDINGS = tuple(range(1, 5))
APPROACHES = ("A", "B", "C", "D")
HEADWAY = 2
ENTRY_MIN = 2
ROUTE_MIN = 2
MAX_WAIT = 45

@dataclass
class Reservation:
    train_id: str
    approach: str
    resource_type: str
    resource_id: int
    entry_start: int
    route_start: int
    route_end: int
    service_start: int
    service_end: int
    priority: int


def overlap(a0, a1, b0, b1):
    return a0 < b1 and b0 < a1


def first_free(intervals, start, duration):
    """Return earliest integer start not overlapping sorted half-open intervals."""
    t = start
    for a, b in sorted(intervals):
        if t + duration <= a:
            return t
        if t < b:
            t = b
    return t


def reserve_train(train_id, approach, priority, duration, arrival,
                  platform_busy, holding_busy, route_busy, approach_entries,
                  rng):
    """Find an earliest safe reservation using explicit stage ordering."""
    # Prefer platforms for passenger services; freight has a mild holding bias.
    resources = [("holding", h) for h in HOLDINGS] + [("platform", p) for p in PLATFORMS]
    if priority >= 6:
        resources = [("platform", p) for p in PLATFORMS] + [("holding", h) for h in HOLDINGS]
    elif rng.random() < 0.55:
        rng.shuffle(resources)

    best = None
    # Search a bounded horizon. If nothing fits, the train remains pending and
    # the caller counts it as overload/stuck rather than manufacturing a clash.
    for kind, rid in resources:
        busy = platform_busy[rid] if kind == "platform" else holding_busy[rid]
        service = first_free(busy, arrival, duration)

        # Route lock must finish before service starts.
        route_start = max(arrival, service - ROUTE_MIN)
        route_start = first_free(route_busy[approach], route_start, ROUTE_MIN)
        service = max(service, route_start + ROUTE_MIN)

        # Entry precedes route lock and respects approach headway.
        entries = approach_entries[approach]
        entry = max(arrival, route_start - ENTRY_MIN)
        changed = True
        while changed:
            changed = False
            for e in sorted(entries):
                if overlap(entry, entry + ENTRY_MIN, e, e + ENTRY_MIN) or abs(entry - e) < HEADWAY:
                    entry = e + HEADWAY
                    route_start = max(route_start, entry + ENTRY_MIN)
                    route_start = first_free(route_busy[approach], route_start, ROUTE_MIN)
                    service = max(service, route_start + ROUTE_MIN)
                    changed = True
                    break
        if service > arrival + MAX_WAIT + duration:
            continue
        candidate = (service, route_start, entry, kind, rid)
        if best is None or candidate[:3] < best[:3]:
            best = candidate

    if best is None:
        return None
    service, route_start, entry, kind, rid = best
    route_end = route_start + ROUTE_MIN
    end = service + duration
    r = Reservation(train_id, approach, kind, rid, entry, route_start,
                    route_end, service, end, priority)
    if kind == "platform":
        platform_busy[rid].append((service, end))
    else:
        holding_busy[rid].append((service, end))
    route_busy[approach].append((route_start, route_end))
    approach_entries[approach].append(entry)
    return r


def validate(reservations):
    failures = []
    # Resource collision checks.
    for kind in ("platform", "holding"):
        groups = {}
        for r in reservations:
            if r.resource_type == kind:
                groups.setdefault(r.resource_id, []).append(r)
        for rid, items in groups.items():
            items.sort(key=lambda x: x.service_start)
            for a, b in zip(items, items[1:]):
                if overlap(a.service_start, a.service_end, b.service_start, b.service_end):
                    failures.append(f"{kind}{rid}: {a.train_id}/{b.train_id}")

    # Route-lock collisions are checked by approach/conflict group in this
    # synthetic topology; each approach is its own throat group.
    groups = {}
    for r in reservations:
        groups.setdefault(r.approach, []).append(r)
    for app, items in groups.items():
        items.sort(key=lambda x: x.route_start)
        for a, b in zip(items, items[1:]):
            if overlap(a.route_start, a.route_end, b.route_start, b.route_end):
                failures.append(f"route-{app}: {a.train_id}/{b.train_id}")
            if b.entry_start - a.entry_start < HEADWAY:
                failures.append(f"headway-{app}: {a.train_id}/{b.train_id}")

    # Stage ordering / deadlock invariant.
    for r in reservations:
        if not (r.entry_start <= r.route_start < r.route_end <= r.service_start < r.service_end):
            failures.append(f"stage-order: {r.train_id}")

    return failures


def run(minutes, seed, arrival_rate):
    rng = random.Random(seed)
    platform_busy = {p: [] for p in PLATFORMS}
    holding_busy = {h: [] for h in HOLDINGS}
    route_busy = {a: [] for a in APPROACHES}
    approach_entries = {a: [] for a in APPROACHES}
    reservations = []
    pending = []
    next_id = 1
    generated = 0
    admitted = 0
    max_queue = 0
    total_wait = []

    # Per-minute arrival process. This deliberately stays below extreme
    # capacity pressure so the safety test exercises normal/stress operation.
    for minute in range(minutes):
        # Bernoulli arrivals with a tunable mean. Multiple arrivals are allowed
        # occasionally to create bursts.
        arrivals = 1 if rng.random() < arrival_rate else 0
        if rng.random() < arrival_rate * 0.10:
            arrivals += 1
        for _ in range(arrivals):
            approach = rng.choice(APPROACHES)
            typ = rng.choices(
                ["VANDE_BHARAT", "RAJDHANI", "SUPERFAST", "MAIL_EXPRESS", "FREIGHT"],
                weights=[10, 9, 7, 6, 2], k=1)[0]
            priority = {"VANDE_BHARAT":10,"RAJDHANI":9,"SUPERFAST":7,"MAIL_EXPRESS":6,"FREIGHT":2}[typ]
            duration = rng.randint(7, 12) if typ != "FREIGHT" else rng.randint(10, 15)
            pending.append((minute, f"S{next_id:06d}", approach, priority, duration))
            next_id += 1
            generated += 1

        # Try all pending trains, oldest first. A reservation is only committed
        # when every stage is available, so conflicts are never intentionally
        # introduced.
        pending.sort(key=lambda x: (x[0], -x[3], x[1]))
        still = []
        for arrival, tid, app, priority, duration in pending:
            r = reserve_train(tid, app, priority, duration, arrival,
                              platform_busy, holding_busy, route_busy,
                              approach_entries, rng)
            if r is None:
                still.append((arrival, tid, app, priority, duration))
            else:
                reservations.append(r)
                admitted += 1
                total_wait.append(r.service_start - arrival)
        pending = still
        max_queue = max(max_queue, len(pending))

        # Keep only recent intervals for efficient long-horizon checking.
        cutoff = minute - 120
        for d in (platform_busy, holding_busy):
            for k in d:
                d[k] = [(a,b) for a,b in d[k] if b >= cutoff]
        for k in route_busy:
            route_busy[k] = [(a,b) for a,b in route_busy[k] if b >= cutoff]
        for k in approach_entries:
            approach_entries[k] = [e for e in approach_entries[k] if e >= cutoff]

    failures = validate(reservations)

    # Deadlock/stuck criterion: pending trains older than MAX_WAIT are reported.
    stuck = [x for x in pending if minutes - x[0] > MAX_WAIT]
    deadlock_count = len(stuck)

    # Utilization over the simulated horizon based on committed service time.
    platform_minutes = sum(sum(max(0,b-a) for a,b in intervals) for intervals in platform_busy.values())
    holding_minutes = sum(sum(max(0,b-a) for a,b in intervals) for intervals in holding_busy.values())
    # Busy dictionaries only retain recent intervals; utilization is therefore
    # reported as a recent-window diagnostic, not full-horizon accounting.
    recent_capacity = (len(PLATFORMS) + len(HOLDINGS)) * 120
    utilization = (platform_minutes + holding_minutes) / recent_capacity if recent_capacity else 0

    return {
        "minutes": minutes,
        "seed": seed,
        "arrival_rate": arrival_rate,
        "generated": generated,
        "admitted": admitted,
        "pending_end": len(pending),
        "max_queue": max_queue,
        "deadlocks": deadlock_count,
        "failures": failures,
        "avg_wait": statistics.mean(total_wait) if total_wait else 0.0,
        "recent_resource_utilization": utilization,
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--minutes", type=int, default=100000)
    ap.add_argument("--seed", type=int, default=20260913)
    ap.add_argument("--arrival-rate", type=float, default=0.16,
                    help="Approximate trains/minute; lower than 1 to avoid artificial overload")
    args = ap.parse_args()
    if args.minutes <= 0 or not (0 < args.arrival_rate <= 1):
        raise SystemExit("minutes must be >0 and arrival-rate must be in (0,1]")

    r = run(args.minutes, args.seed, args.arrival_rate)
    safety_pass = (not r["failures"] and r["deadlocks"] == 0)

    print("PROJECT AAHAVAAN — 100,000-MINUTE SAFETY STRESS TEST")
    print("Stages: approach -> entry -> route lock -> platform/holding -> departure")
    print("NOTE: engineering simulation; not railway safety certification")
    print()
    print(f"Simulation minutes:          {r['minutes']:,}")
    print(f"Random seed:                  {r['seed']}")
    print(f"Approx arrival rate:          {r['arrival_rate']:.3f} trains/min")
    print(f"Generated movements:          {r['generated']:,}")
    print(f"Admitted movements:           {r['admitted']:,}")
    print(f"Pending at horizon end:       {r['pending_end']:,}")
    print(f"Maximum queue depth:          {r['max_queue']:,}")
    print(f"Average service wait:         {r['avg_wait']:.2f} min")
    print(f"Deadlocks / stuck trains:     {r['deadlocks']:,}")
    print(f"Safety invariant violations:  {len(r['failures']):,}")
    print(f"Recent resource utilization:  {r['recent_resource_utilization']*100:.1f}%")
    print()
    if r["failures"]:
        print("First violations:")
        for x in r["failures"][:10]:
            print("  -", x)
    print("Safety compliance:            " + ("100.000%" if safety_pass else "FAIL"))
    print("Result:                        " + ("PASS" if safety_pass else "FAIL"))
    if safety_pass:
        print("Interpretation: zero simulated collisions, route conflicts, headway violations, and deadlocks.")
        print("This validates the implemented safety invariants for this synthetic stress workload;")
        print("it does not constitute formal signalling certification or prove all possible traffic cases.")

if __name__ == "__main__":
    main()
