"""
PROJECT AAHAVAAN — CP-SAT V5
Multi-stage, route-aware railway station scheduler.

Topology:
  APPROACH -> ENTRY BLOCK -> THROAT / ROUTE LOCK -> PLATFORM/HOLDING -> DEPART

The optimizer separates:
- approach headway (entry times)
- throat/route-lock occupancy
- platform dwell occupancy
- outer holding occupancy

This avoids the V4 modelling error where a train occupied its station resource
for its entire service movement and used that same interval for route conflicts.

Simulation/benchmark model only — not railway signalling or safety-certified
control software.
"""
from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any, Tuple
from ortools.sat.python import cp_model
import json, os, time

WINDOW = 60
PLATFORMS = tuple(range(1, 7))
HOLDINGS = tuple(range(1, 5))
DEFAULT_HEADWAY = 2
DEFAULT_ENTRY_MIN = 2
DEFAULT_ROUTE_LOCK_MIN = 2
MAX_DELAY = 45
MAX_SOLVER_DELAY = 1.0

@dataclass
class Train:
    train_id: str
    scheduled_start: int
    duration: int
    priority_weight: int
    train_type: str = "OTHER"
    current_delay: int = 0
    approach: str = "A"
    allowed_platforms: Optional[List[int]] = None
    allowed_holdings: Optional[List[int]] = None
    conflict_groups: List[str] = field(default_factory=list)
    entry_min: int = DEFAULT_ENTRY_MIN
    route_lock_min: int = DEFAULT_ROUTE_LOCK_MIN

def platform_set(t: Train) -> Tuple[int, ...]:
    vals = tuple(t.allowed_platforms) if t.allowed_platforms else PLATFORMS
    return tuple(p for p in vals if p in PLATFORMS)

def holding_set(t: Train) -> Tuple[int, ...]:
    vals = tuple(t.allowed_holdings) if t.allowed_holdings else HOLDINGS
    return tuple(h for h in vals if h in HOLDINGS)

def start_bounds(t: Train) -> Tuple[int, int]:
    lo = max(0, min(WINDOW - t.duration, t.scheduled_start + max(0, t.current_delay)))
    hi = min(WINDOW - t.duration, t.scheduled_start + MAX_DELAY)
    if hi < lo:
        hi = lo
    return lo, hi

def _overlap(a0, a1, b0, b1):
    return a0 < b1 and b0 < a1

def detect_deadlock(recs: List[Dict[str, Any]], trains: List[Train]) -> Tuple[bool, str]:
    """Static deadlock guard for this finite-horizon model.

    A deadlock is reported if a train's route lock begins after its service
    interval would already have had to begin, or if its selected resource is
    missing. The CP model itself has no circular wait because route locks are
    atomic intervals and resources are not dynamically acquired.
    """
    by_id = {t.train_id: t for t in trains}
    for r in recs:
        t = by_id[r["train_id"]]
        if r.get("resource_type") not in ("platform", "holding"):
            return True, "missing_station_resource"
        if r["start"] < 0 or r["end"] <= r["start"]:
            return True, "invalid_service_interval"
        route_start = r["route_start"]
        route_end = r["route_end"]
        if route_start < 0 or route_end <= route_start:
            return True, "invalid_route_lock"
        if route_end > r["start"]:
            return True, "route_lock_not_released_before_service"
    return False, "PASS"

def validate_schedule(recs: List[Dict[str, Any]], trains: List[Train],
                      headway: int = DEFAULT_HEADWAY) -> Tuple[bool, str]:
    by_id = {t.train_id: t for t in trains}
    if len(recs) != len(trains) or set(by_id) != {r["train_id"] for r in recs}:
        return False, "missing_or_duplicate_train"

    # Station resources.
    for kind in ("platform", "holding"):
        groups = {}
        for r in recs:
            if r["resource_type"] == kind:
                groups.setdefault(r["resource_id"], []).append(r)
        for items in groups.values():
            items.sort(key=lambda x: x["start"])
            for a, b in zip(items, items[1:]):
                if _overlap(a["start"], a["end"], b["start"], b["end"]):
                    return False, "resource_overlap"

    # Approach entry headway.
    groups = {}
    for r in recs:
        groups.setdefault(by_id[r["train_id"]].approach, []).append(r)
    for items in groups.values():
        items.sort(key=lambda x: x["entry_start"])
        for a, b in zip(items, items[1:]):
            if b["entry_start"] - a["entry_start"] < headway:
                return False, "approach_headway"

    # Shared throat / route-lock conflicts.
    groups = {}
    for r in recs:
        t = by_id[r["train_id"]]
        for g in t.conflict_groups:
            groups.setdefault(g, []).append(r)
    for items in groups.values():
        items.sort(key=lambda x: x["route_start"])
        for a, b in zip(items, items[1:]):
            if _overlap(a["route_start"], a["route_end"],
                        b["route_start"], b["route_end"]):
                return False, "route_lock_conflict"

    dead, reason = detect_deadlock(recs, trains)
    if dead:
        return False, "deadlock:" + reason
    return True, "PASS"

def solve_station(trains: List[Train], headway: int = DEFAULT_HEADWAY,
                  time_limit_s: float = 0.20, num_workers: int = 1) -> Dict[str, Any]:
    model = cp_model.CpModel()

    starts, ends, delays = {}, {}, {}
    entry_starts, entry_ends = {}, {}
    route_starts, route_ends = {}, {}
    choices = {}
    platform_intervals = {p: [] for p in PLATFORMS}
    holding_intervals = {h: [] for h in HOLDINGS}
    route_intervals = {}

    for t in trains:
        lo, hi = start_bounds(t)
        s = model.NewIntVar(lo, hi, f"start_{t.train_id}")
        e = model.NewIntVar(lo + t.duration, hi + t.duration, f"end_{t.train_id}")
        d = model.NewIntVar(0, MAX_DELAY + WINDOW, f"delay_{t.train_id}")
        es = model.NewIntVar(max(0, lo - t.entry_min), hi, f"entry_{t.train_id}")
        ee = model.NewIntVar(max(0, lo - t.entry_min) + t.entry_min,
                              hi + t.entry_min, f"entry_end_{t.train_id}")
        rs = model.NewIntVar(max(0, lo - t.entry_min - t.route_lock_min), hi,
                              f"route_{t.train_id}")
        re = model.NewIntVar(max(0, lo - t.entry_min - t.route_lock_min) +
                              t.route_lock_min,
                              hi + t.route_lock_min, f"route_end_{t.train_id}")

        model.Add(e == s + t.duration)
        model.Add(ee == es + t.entry_min)
        model.Add(rs == es + t.entry_min)
        model.Add(re == rs + t.route_lock_min)
        model.Add(s >= re)
        model.Add(d >= s - t.scheduled_start)
        model.Add(d >= 0)

        starts[t.train_id], ends[t.train_id], delays[t.train_id] = s, e, d
        entry_starts[t.train_id], entry_ends[t.train_id] = es, ee
        route_starts[t.train_id], route_ends[t.train_id] = rs, re

        ch = []
        for p in platform_set(t):
            x = model.NewBoolVar(f"{t.train_id}_p{p}")
            it = model.NewOptionalIntervalVar(s, t.duration, e, x,
                                              f"{t.train_id}_p{p}_it")
            platform_intervals[p].append(it)
            choices[(t.train_id, "platform", p)] = x
            ch.append(x)

        for h in holding_set(t):
            x = model.NewBoolVar(f"{t.train_id}_h{h}")
            it = model.NewOptionalIntervalVar(s, t.duration, e, x,
                                              f"{t.train_id}_h{h}_it")
            holding_intervals[h].append(it)
            choices[(t.train_id, "holding", h)] = x
            ch.append(x)

        if not ch:
            raise ValueError(f"No compatible station resource for {t.train_id}")
        model.AddExactlyOne(ch)

        for g in t.conflict_groups:
            route_intervals.setdefault(g, []).append(
                model.NewIntervalVar(rs, t.route_lock_min, re,
                                      f"{t.train_id}_{g}_route"))

    for p in PLATFORMS:
        model.AddNoOverlap(platform_intervals[p])
    for h in HOLDINGS:
        model.AddNoOverlap(holding_intervals[h])
    for intervals in route_intervals.values():
        model.AddNoOverlap(intervals)

    # Entry-block headway is route/approach aware.
    by_approach = {}
    for t in trains:
        by_approach.setdefault(t.approach, []).append(t)
    for ts in by_approach.values():
        for i, a in enumerate(ts):
            for b in ts[i + 1:]:
                before = model.NewBoolVar(f"hw_{a.train_id}_{b.train_id}")
                model.Add(entry_starts[b.train_id] >=
                          entry_starts[a.train_id] + headway).OnlyEnforceIf(before)
                model.Add(entry_starts[a.train_id] >=
                          entry_starts[b.train_id] + headway).OnlyEnforceIf(before.Not())

    # Priority-weighted delay. Holding is penalized, but much less than
    # passenger-service delay.
    obj = []
    for t in trains:
        obj.append(t.priority_weight * delays[t.train_id])
        for h in holding_set(t):
            x = choices.get((t.train_id, "holding", h))
            if x is not None:
                obj.append(3 * x)
    model.Minimize(sum(obj))

    # Warm starts.
    for t in trains:
        lo, hi = start_bounds(t)
        target = min(max(t.scheduled_start + max(0, t.current_delay), lo), hi)
        try:
            model.AddHint(starts[t.train_id], target)
            model.AddHint(entry_starts[t.train_id],
                          max(0, target - t.entry_min - t.route_lock_min))
        except Exception:
            pass
        preferred = (holding_set(t)[0] if t.train_type.upper() == "FREIGHT"
                     and holding_set(t) else
                     platform_set(t)[0] if platform_set(t) else None)
        if preferred is not None:
            kind = "holding" if t.train_type.upper() == "FREIGHT" and holding_set(t) else "platform"
            try:
                model.AddHint(choices[(t.train_id, kind, preferred)], 1)
            except Exception:
                pass

    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = min(max(time_limit_s, 0.01), MAX_SOLVER_DELAY)
    solver.parameters.num_search_workers = num_workers
    solver.parameters.cp_model_presolve = True
    solver.parameters.linearization_level = 0

    t0 = time.perf_counter()
    status = solver.Solve(model)
    elapsed = time.perf_counter() - t0
    name = solver.StatusName(status)

    if status not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        return {"status": name, "objective": None, "solve_time_s": elapsed,
                "safety": False, "safety_reason": "no_solution",
                "recommendations": []}

    recs = []
    for t in trains:
        chosen = None
        for p in platform_set(t):
            x = choices.get((t.train_id, "platform", p))
            if x is not None and solver.Value(x):
                chosen = ("platform", p)
                break
        if chosen is None:
            for h in holding_set(t):
                x = choices.get((t.train_id, "holding", h))
                if x is not None and solver.Value(x):
                    chosen = ("holding", h)
                    break
        recs.append({
            "train_id": t.train_id,
            "resource_type": chosen[0],
            "resource_id": chosen[1],
            "entry_start": solver.Value(entry_starts[t.train_id]),
            "entry_end": solver.Value(entry_ends[t.train_id]),
            "route_start": solver.Value(route_starts[t.train_id]),
            "route_end": solver.Value(route_ends[t.train_id]),
            "start": solver.Value(starts[t.train_id]),
            "end": solver.Value(ends[t.train_id]),
            "delay": solver.Value(delays[t.train_id]),
        })

    safe, reason = validate_schedule(recs, trains, headway)
    return {
        "status": name,
        "objective": float(solver.ObjectiveValue()),
        "solve_time_s": elapsed,
        "safety": safe,
        "safety_reason": reason,
        "recommendations": recs,
    }

def demo_trains():
    return [
        Train("VB_101", 8, 8, 10, "VANDE_BHARAT", approach="A",
              conflict_groups=["THROAT_A"]),
        Train("RJD_201", 10, 10, 9, "RAJDHANI", approach="B",
              conflict_groups=["THROAT_B"]),
        Train("SF_301", 14, 7, 7, "SUPERFAST", approach="A",
              conflict_groups=["THROAT_A"]),
        Train("ME_401", 13, 9, 6, "MAIL_EXPRESS", approach="C",
              conflict_groups=["THROAT_C"]),
        Train("FR_501", 18, 15, 2, "FREIGHT", approach="B",
              conflict_groups=["THROAT_B"]),
        Train("VB_102", 15, 8, 10, "VANDE_BHARAT", approach="C",
              conflict_groups=["THROAT_C"]),
        Train("SF_302", 19, 7, 7, "SUPERFAST", approach="A",
              conflict_groups=["THROAT_A"]),
        Train("FR_502", 20, 15, 2, "FREIGHT", approach="D",
              conflict_groups=["THROAT_D"]),
    ]

if __name__ == "__main__":
    r = solve_station(demo_trains(), time_limit_s=0.20)
    print("PROJECT AAHAVAAN — CP-SAT V5")
    print("MULTI-STAGE / ROUTE LOCK / 6 PLATFORMS / 4 OUTER HOLDINGS")
    print("Solver status:", r["status"])
    print("Objective:    ", r["objective"])
    print("Solve time:   ", f'{r["solve_time_s"]:.4f}s')
    print("Safety check: ", "PASS" if r["safety"] else "FAIL", r.get("safety_reason", ""))
    print("\nRecommendations:")
    for x in r["recommendations"]:
        print(f'{x["train_id"]:<8} -> {x["resource_type"]} {x["resource_id"]} | '
              f'entry={x["entry_start"]:>2} route={x["route_start"]:>2}->{x["route_end"]:>2} '
              f'platform={x["start"]:>2}->{x["end"]:>2} delay={x["delay"]}')
    out = os.path.join(os.path.dirname(__file__), "last_recommendation.json")
    with open(out, "w", encoding="utf-8") as f:
        json.dump(r, f, indent=2)
    print("\nSaved recommendation:", out)
