"""
PROJECT AAHAVAAN — V5 benchmark.

The benchmark distinguishes:
- SCHEDULABLE: the 60-minute window is feasible and safety-valid.
- OVERLOAD: deliberately pressure-tested scenario that may be mathematically
  infeasible because station capacity is exceeded.
- UNSAFE: solver returned a schedule but independent validation failed.

Do not report infeasible overload cases as optimizer failures.
"""
import random, statistics, time
from solver import Train, solve_station

def make_trains(n, seed):
    rng = random.Random(seed)
    types = [("VANDE_BHARAT", 10), ("RAJDHANI", 9), ("SUPERFAST", 7),
             ("MAIL_EXPRESS", 6), ("FREIGHT", 2)]
    out = []
    approaches = ["A", "B", "C", "D"]
    for i in range(n):
        typ, weight = rng.choice(types)
        # Spread arrivals across the full horizon. Higher n intentionally
        # creates a capacity-pressure test.
        sched = rng.randrange(0, 46)
        duration = rng.randint(7, 12) if typ != "FREIGHT" else rng.randint(10, 15)
        app = rng.choice(approaches)
        out.append(Train(
            train_id=f"T{i+1:03d}",
            scheduled_start=sched,
            duration=duration,
            priority_weight=weight,
            train_type=typ,
            current_delay=rng.randint(0, 4),
            approach=app,
            conflict_groups=[f"THROAT_{app}"],
        ))
    return out

def lower_bound_service_minutes(trains):
    # Ten station resources total (6 platforms + 4 holdings).
    return sum(t.duration for t in trains) / 10.0

def run_case(n, seed, limit=0.25):
    trains = make_trains(n, seed)
    t0 = time.perf_counter()
    result = solve_station(trains, time_limit_s=limit)
    elapsed = time.perf_counter() - t0
    capacity_lb = lower_bound_service_minutes(trains)
    if result["status"] in ("OPTIMAL", "FEASIBLE"):
        classification = "SCHEDULABLE" if result["safety"] else "UNSAFE"
    else:
        # A useful diagnostic: if raw service demand already exceeds the
        # 10-resource x 60-minute station capacity, call it overload.
        classification = "OVERLOAD" if capacity_lb > 60 else "INFEASIBLE"
    return {
        "trains": n,
        "status": result["status"],
        "classification": classification,
        "safe": result["safety"],
        "solve_ms": elapsed * 1000,
        "objective": result["objective"],
        "service_lb_min": round(capacity_lb, 2),
    }

def main():
    print("PROJECT AAHAVAAN — CP-SAT V5 BENCHMARK")
    print("Stages: approach -> entry -> route lock -> platform/holding")
    print()
    for n in (20, 30, 40, 60):
        rows = [run_case(n, 1000 + i, 0.25) for i in range(100)]
        times = [r["solve_ms"] for r in rows]
        feasible = sum(r["classification"] == "SCHEDULABLE" for r in rows)
        safe = sum(r["safe"] for r in rows)
        p95 = statistics.quantiles(times, n=20)[18]
        print(
            f"{n:>2} trains | schedulable {feasible:>3}/100 | "
            f"safe {safe:>3}/100 | mean {statistics.mean(times):>7.2f} ms | "
            f"P95 {p95:>7.2f} ms | max {max(times):>7.2f} ms"
        )

if __name__ == "__main__":
    main()
