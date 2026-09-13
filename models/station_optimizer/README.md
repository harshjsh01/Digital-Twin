# Project Aahavaan — Station Optimizer V5

## What changed from V4

V5 separates the station movement into explicit stages:

`APPROACH -> ENTRY BLOCK -> THROAT / ROUTE LOCK -> PLATFORM or HOLDING -> DEPART`

This fixes the main V4 modelling limitation: a train no longer occupies a platform/holding and a throat conflict group for the same full service interval.

### CP-SAT model

- 6 platforms
- 4 outer holding tracks
- route/approach-aware entry headway
- explicit throat / route-lock intervals
- shared conflict groups enforced with `NoOverlap`
- platform compatibility and holding compatibility
- priority-weighted passenger delay objective
- holding penalty
- independent safety validation
- static deadlock guard
- warm-start hints
- 60-minute scheduling horizon

### Important benchmark interpretation

The benchmark intentionally includes capacity-pressure cases. A 60-train / 60-minute case can be mathematically overloaded because the station has only 10 service resources.

Therefore V5 reports:

- `SCHEDULABLE` — solver found a schedule and independent safety checks passed.
- `OVERLOAD` — no schedule because aggregate service demand exceeds the station's coarse capacity lower bound.
- `INFEASIBLE` — no schedule despite the coarse capacity test not proving overload.
- `UNSAFE` — a solver schedule existed but independent validation failed.

Do not claim that every extreme overload scenario must be feasible.

## Run

From `models/station_optimizer`:

```bash
pip install ortools
python solver.py
python benchmarks.py
```

Expected demo output is machine/environment dependent. The important acceptance conditions are:

1. solver returns `OPTIMAL` or `FEASIBLE`
2. `Safety check: PASS`
3. no platform/holding overlap
4. no approach headway violation
5. no route-lock collision
6. no deadlock flag

## Engineering note

This is a research/simulation scheduler, not railway signalling software. Real deployment requires certified interlocking, signalling, fail-safe hardware/software, timetable/route data, operational rules, and formal verification.
