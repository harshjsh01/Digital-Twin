import uuid
from typing import Dict, Any, Optional
from app.payments.subscription_db import subscription_db

class ExplainabilityService:
    def __init__(self, state_mgr):
        self.state_mgr = state_mgr

    def explain_train_halt(self, train_id: str) -> Optional[Dict[str, Any]]:
        train = self.state_mgr.trains.get(train_id)
        if not train:
            # Check if match by numeric train number
            for t in self.state_mgr.trains.values():
                if t.get("train_number") == train_id or t.get("id") == f"T_{train_id}":
                    train = t
                    break
        if not train:
            return None

        is_stopped = train.get("is_stopped", False) or train.get("speed_kmph", 0.0) == 0.0 or train.get("status") in ["WAITING_OUTER", "STOPPED"]
        location = train.get("stopped_location") or f"Section {train.get('block_id', 'Main Track')}"
        duration = train.get("duration_stopped_min", 4)
        expected_clearance = train.get("expected_clearance_min", 3)
        
        conflicting_id = train.get("conflicting_train_id", "T_20901")
        conflicting_train = self.state_mgr.trains.get(conflicting_id, {})
        conflict_name = conflicting_train.get("name", "Vande Bharat Express (Train 20901)")
        conflict_priority = conflicting_train.get("priority", 10)
        train_priority = train.get("priority", 8)

        if is_stopped:
            plain_reason = (
                f"Your train is currently held at {location} to grant precedence to "
                f"{conflict_name} clearing the crossover throat into Platform 1. "
                f"Once {conflict_name.split('(')[0].strip()} clears, your route will receive a Green signal immediately."
            )
            technical_conflict = {
                "conflicting_train": conflict_name,
                "conflict_section": "Crossover Throat Switch SW_02B",
                "priority_comparison": f"{conflict_name.split('(')[0].strip()} ({conflict_priority}) > {train['name']} ({train_priority})"
            }
        else:
            plain_reason = f"Train {train['name']} is currently moving at {train.get('speed_kmph', 80.0)} km/h along track {train.get('block_id')}."
            technical_conflict = None

        # Record wait log in SQLite database
        subscription_db.log_passenger_wait(
            log_id=str(uuid.uuid4()),
            train_id=train["id"],
            station_or_outer_block=location,
            started_at_min=int(self.state_mgr.current_time_min - duration),
            cleared_at_min=int(self.state_mgr.current_time_min + expected_clearance) if is_stopped else int(self.state_mgr.current_time_min),
            conflicting_train_id=conflicting_id if is_stopped else None,
            plain_english_reason=plain_reason
        )

        return {
            "train_id": train["id"],
            "train_name": train["name"],
            "is_stopped": is_stopped,
            "stopped_at_location": location if is_stopped else "In Transit",
            "duration_stopped_min": duration if is_stopped else 0,
            "expected_clearance_min": expected_clearance if is_stopped else 0,
            "plain_english_reason": plain_reason,
            "technical_conflict": technical_conflict
        }
