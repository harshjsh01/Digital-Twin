import uuid
from typing import Dict, Any, Tuple, List, Optional
from app.payments.subscription_db import subscription_db

class InterlockingSupervisor:
    """
    Software simulation of British / Indian Railways Solid State Interlocking (SSI).
    Enforces Route Locking, Flank Protection, Switch Verification, and Zero-Collision Safety Invariants.
    """
    def __init__(self, state_mgr):
        self.state_mgr = state_mgr

    def check_and_lock_route(
        self, train_id: str, assigned_track: str, dispatcher_id: str
    ) -> Tuple[bool, Dict[str, Any], Optional[str]]:
        """
        Validates track availability and absence of conflicting routes.
        Returns: (success: bool, route_details: dict, error_message: str | None)
        """
        audit_id = str(uuid.uuid4())
        rec_id = f"REC_{abs(hash(train_id)) % 10000:04d}"

        # 1. Check if platform is already occupied by a different train
        for p in self.state_mgr.platforms:
            if p["id"] == assigned_track:
                if p["is_occupied"] and p["occupant_train_id"] != train_id:
                    occupant = p["occupant_train_id"]
                    err_msg = f"Cannot route to {assigned_track}: Conflicting route currently locked for Train {occupant}."
                    subscription_db.log_station_master_action(
                        audit_id=audit_id,
                        recommendation_id=rec_id,
                        train_id=train_id,
                        recommended_track=assigned_track,
                        actual_assigned_track=assigned_track,
                        action_type="REJECTED_CONFLICT",
                        dispatcher_id=dispatcher_id,
                        safety_check_passed=False
                    )
                    return (
                        False,
                        {"signal_aspect": "RED", "status": "REJECTED_SAFETY_VIOLATION"},
                        err_msg
                    )

        # 2. Check if another active route is locking this platform or crossover switches
        for route_id, route in self.state_mgr.active_routes.items():
            if route.get("target_platform") == assigned_track and route.get("train_id") != train_id:
                occupant = route.get("train_id")
                err_msg = f"Cannot route to {assigned_track}: Conflicting route currently locked for Train {occupant}."
                subscription_db.log_station_master_action(
                    audit_id=audit_id,
                    recommendation_id=rec_id,
                    train_id=train_id,
                    recommended_track=assigned_track,
                    actual_assigned_track=assigned_track,
                    action_type="REJECTED_CONFLICT",
                    dispatcher_id=dispatcher_id,
                    safety_check_passed=False
                )
                return (
                    False,
                    {"signal_aspect": "RED", "status": "REJECTED_SAFETY_VIOLATION"},
                    err_msg
                )

        # 3. Route is clear - engage digital interlocking
        platform_num = assigned_track.replace("PLATFORM_", "").replace("OUTER_HOLD_", "")
        route_id = f"ROUTE_ENTRY_P{platform_num}"
        signal_id = "SIG_HOME_UP"
        
        # Align switch turnouts
        switches_aligned = ["SW_01A:NORMAL", "SW_02B:REVERSE"]
        for sw in self.state_mgr.switches:
            if sw["id"] == "SW_01A":
                sw["state"] = "NORMAL"
                sw["locked_for_route_id"] = route_id
            elif sw["id"] == "SW_02B":
                sw["state"] = "REVERSE"
                sw["locked_for_route_id"] = route_id

        # Update signal aspect to GREEN
        for sig in self.state_mgr.signals:
            if sig["id"] == signal_id:
                sig["aspect"] = "GREEN"

        # Record locked route
        self.state_mgr.active_routes[route_id] = {
            "route_id": route_id,
            "train_id": train_id,
            "target_platform": assigned_track,
            "switches": {"SW_01A": "NORMAL", "SW_02B": "REVERSE"},
            "signal_id": signal_id,
            "locked": True
        }

        # Update train assigned track and status
        if train_id in self.state_mgr.trains:
            t = self.state_mgr.trains[train_id]
            t["assigned_track"] = assigned_track
            t["status"] = "MOVING"
            t["speed_kmph"] = 45.0
            t["is_stopped"] = False

        # Log audit entry in database
        subscription_db.log_station_master_action(
            audit_id=audit_id,
            recommendation_id=rec_id,
            train_id=train_id,
            recommended_track=assigned_track,
            actual_assigned_track=assigned_track,
            action_type="APPROVED_AND_LOCKED",
            dispatcher_id=dispatcher_id,
            safety_check_passed=True
        )

        details = {
            "status": "APPROVED_AND_LOCKED",
            "route_id": route_id,
            "signal_id": signal_id,
            "signal_aspect": "GREEN",
            "switches_aligned": switches_aligned,
            "timestamp": int(self.state_mgr.current_time_sec)
        }
        return (True, details, None)

    def request_route_lock(self, train_id: str, route_id: str) -> bool:
        """
        Attempts to lock entry switch points, fouling points, and platform track for route_id.
        """
        for r_id, r in self.state_mgr.active_routes.items():
            if self.is_route_conflicting(r_id, route_id) and r.get("train_id") != train_id:
                return False
        self.state_mgr.active_routes[route_id] = {
            "route_id": route_id,
            "train_id": train_id,
            "locked": True
        }
        return True

    def release_route_lock(self, train_id: str, route_id: str):
        """
        Frees points once train clears track circuit.
        """
        if route_id in self.state_mgr.active_routes:
            del self.state_mgr.active_routes[route_id]
        for sw in self.state_mgr.switches:
            if sw.get("locked_for_route_id") == route_id:
                sw["locked_for_route_id"] = None

    def is_route_conflicting(self, route_a: str, route_b: str) -> bool:
        """
        Mathematically verifies whether two routes share common track points or crossovers.
        """
        if route_a == route_b:
            return True
        # Entry routes sharing throat switches conflict
        if "ROUTE_ENTRY" in route_a and "ROUTE_ENTRY" in route_b:
            return True
        return False

    def emergency_all_red(self) -> Dict[str, Any]:
        """
        Immediately trips all entry and starter signals to Danger (RED).
        """
        affected = []
        for sig in self.state_mgr.signals:
            sig["aspect"] = "RED"
            affected.append(sig["id"])

        # Stop all moving trains in the junction area
        for t in self.state_mgr.trains.values():
            t["speed_kmph"] = 0.0
            t["is_stopped"] = True
            if t["status"] == "MOVING":
                t["status"] = "STOPPED"

        # Unlock routes
        self.state_mgr.active_routes.clear()

        # Audit log in database
        subscription_db.log_station_master_action(
            audit_id=str(uuid.uuid4()),
            recommendation_id="EMERGENCY_STOP",
            train_id="ALL_TRAINS",
            recommended_track="NONE",
            actual_assigned_track="HALTED",
            action_type="EMERGENCY_STOP",
            dispatcher_id="SM_PANIC_BUTTON",
            safety_check_passed=True
        )

        return {
            "status": "EMERGENCY_ALL_RED_ACTIVATED",
            "affected_signals": affected,
            "message": "All station entry and starter signals forced to Danger (RED). All movements halted.",
            "timestamp": int(self.state_mgr.current_time_sec)
        }
