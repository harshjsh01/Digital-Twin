"""Independent V5 validation helpers."""
from typing import List, Dict, Any

def check_safety(recommendations: List[Dict[str, Any]],
                 train_by_id: Dict[str, Any],
                 headway: int = 2) -> Dict[str, Any]:
    failures = []
    for kind in ("platform", "holding"):
        by_res = {}
        for r in recommendations:
            if r["resource_type"] == kind:
                by_res.setdefault(r["resource_id"], []).append(r)
        for res, items in by_res.items():
            items = sorted(items, key=lambda x: x["start"])
            for a, b in zip(items, items[1:]):
                if a["end"] > b["start"]:
                    failures.append(f"{kind}{res}: {a['train_id']} overlaps {b['train_id']}")

    by_approach = {}
    for r in recommendations:
        by_approach.setdefault(train_by_id[r["train_id"]].approach, []).append(r)
    for app, items in by_approach.items():
        items = sorted(items, key=lambda x: x["entry_start"])
        for a, b in zip(items, items[1:]):
            if b["entry_start"] - a["entry_start"] < headway:
                failures.append(f"approach {app}: headway violation")

    by_group = {}
    for r in recommendations:
        for g in train_by_id[r["train_id"]].conflict_groups:
            by_group.setdefault(g, []).append(r)
    for g, items in by_group.items():
        items = sorted(items, key=lambda x: x["route_start"])
        for a, b in zip(items, items[1:]):
            if a["route_end"] > b["route_start"]:
                failures.append(f"{g}: route-lock collision")

    return {"safe": not failures, "failures": failures}
