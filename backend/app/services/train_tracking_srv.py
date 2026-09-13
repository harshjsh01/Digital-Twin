from typing import List, Dict, Any, Optional

class TrainTrackingService:
    def __init__(self, state_mgr):
        self.state_mgr = state_mgr

    def search_trains(self, query: str) -> List[Dict[str, Any]]:
        query_str = query.strip().lower()
        results = []
        for t in self.state_mgr.trains.values():
            tid = t.get("id", "").lower()
            name = t.get("name", "").lower()
            t_num = t.get("train_number", "").lower()
            t_type = t.get("type", "").lower()
            if query_str in tid or query_str in name or query_str in t_num or query_str in t_type:
                results.append({
                    "id": t["id"],
                    "name": t["name"],
                    "type": t["type"],
                    "priority": t["priority"],
                    "origin": t.get("origin", "STN_00"),
                    "destination": t.get("destination", "STN_07"),
                    "current_status": "RUNNING_DELAYED" if t.get("delay_min", 0) > 0 else "ON_TIME",
                    "delay_min": t.get("delay_min", 0)
                })
        return results

    def get_train_status(self, train_id: str) -> Optional[Dict[str, Any]]:
        train = self.state_mgr.trains.get(train_id)
        if not train:
            for t in self.state_mgr.trains.values():
                if t.get("train_number") == train_id or t.get("id") == f"T_{train_id}":
                    train = t
                    break
        if not train:
            return None

        return {
            "id": train["id"],
            "name": train["name"],
            "type": train["type"],
            "priority": train["priority"],
            "speed_kmph": round(train["speed_kmph"], 1),
            "current_track": train.get("block_id", "TRK_P1"),
            "next_station": self.state_mgr.station_name,
            "delay_min": train.get("delay_min", 0),
            "status": train["status"],
            "x": round(train.get("x", 0.0), 1),
            "y": round(train.get("y", 0.0), 1),
            "last_updated": round(self.state_mgr.current_time_sec, 1)
        }
