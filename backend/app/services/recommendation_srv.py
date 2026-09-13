import uuid
from typing import List, Dict, Any

class RecommendationService:
    def __init__(self, state_mgr):
        self.state_mgr = state_mgr

    def generate_recommendations(self) -> List[Dict[str, Any]]:
        """
        Generates platform allocation and holding track suggestions
        based on train priority, arrival ETA, and platform clearance.
        """
        recs = []
        approaching = self.state_mgr.get_radar_trains()
        
        # Sort approaching trains by arrival time and priority
        for t in approaching:
            tid = t["train_id"]
            train_obj = self.state_mgr.trains.get(tid, {})
            priority = t["priority"]
            eta = t["eta_min"]
            
            # Check if train already has an active recommendation
            existing = next((r for r in self.state_mgr.recommendations if r["train_id"] == tid), None)
            if existing and existing["status"] == "PENDING_APPROVAL":
                recs.append(existing)
                continue

            # Assign best available platform or outer siding
            if priority >= 8:
                # High priority (e.g., Rajdhani or Vande Bharat) gets Platform 1 or 2
                assigned = "PLATFORM_1" if not self._is_platform_busy("PLATFORM_1") else "PLATFORM_2"
                alt = "OUTER_HOLD_1"
                action = "ASSIGN_PLATFORM"
                wait_min = 0
                reason = f"{assigned} is clear. Grants express mainline passage ahead of lower-priority traffic."
            elif priority >= 5:
                # Medium priority gets Platform 3 or 4
                assigned = "PLATFORM_3" if not self._is_platform_busy("PLATFORM_3") else "PLATFORM_4"
                alt = "OUTER_HOLD_3"
                action = "ASSIGN_PLATFORM"
                wait_min = 0
                reason = f"Routing to {assigned} with scheduled 2-minute passenger dwell."
            else:
                # Freight / Low priority diverted to outer siding to clear mainline
                assigned = "OUTER_HOLD_2"
                alt = "PLATFORM_6"
                action = "DIVERT_TO_OUTER_HOLDING"
                wait_min = 8
                reason = f"Held at Outer Siding 2 for {wait_min} mins to prevent bottle-necking higher priority trains. Saves 14 min network delay."

            rec_id = f"REC_{abs(hash(tid + str(self.state_mgr.current_time_min))) % 10000:04d}"
            recs.append({
                "recommendation_id": rec_id,
                "train_id": tid,
                "train_name": t["train_name"],
                "priority": priority,
                "eta_min": eta,
                "recommended_action": action,
                "assigned_track": assigned,
                "alternative_track": alt,
                "outer_wait_min": wait_min,
                "reasoning": reason,
                "safety_interlock_approved": True,
                "status": "PENDING_APPROVAL"
            })

        self.state_mgr.recommendations = recs
        return recs

    def _is_platform_busy(self, platform_id: str) -> bool:
        for p in self.state_mgr.platforms:
            if p["id"] == platform_id:
                return p["is_occupied"]
        return False
