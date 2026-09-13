from typing import List, Tuple

class CollisionGuard:
    def __init__(self, state_mgr):
        self.state_mgr = state_mgr

    def verify_no_collisions(self) -> Tuple[bool, List[str]]:
        """
        Validates the zero-collision invariant:
        Occupancy(Track_j, Time_t) <= 1 for all platforms, outer holding tracks, and segments.
        """
        occupancy_map = {}
        violations = []

        for p in self.state_mgr.platforms:
            if p["is_occupied"] and p["occupant_train_id"]:
                occupancy_map[p["track_id"]] = p["occupant_train_id"]

        for o in self.state_mgr.outer_waiting_tracks:
            if o["is_occupied"] and o["occupant_train_id"]:
                occupancy_map[o["track_id"]] = o["occupant_train_id"]

        for tid, t in self.state_mgr.trains.items():
            blk = t.get("block_id")
            if blk:
                if blk in occupancy_map and occupancy_map[blk] != tid:
                    violations.append(
                        f"Collision Hazard: Block/Track {blk} concurrently occupied by {tid} and {occupancy_map[blk]}"
                    )
                else:
                    occupancy_map[blk] = tid

        is_safe = len(violations) == 0
        return is_safe, violations
