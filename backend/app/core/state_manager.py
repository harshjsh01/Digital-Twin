import json
import os
import time
from typing import Dict, List, Optional, Any

class SimulationStateManager:
    def __init__(self):
        self.station_id = "STN_JUNCTION_01"
        self.station_name = "Aahavaan Central Junction"
        self.current_time_sec = 142.5
        self.current_time_min = 142
        self.is_running = True
        self.playback_speed = 1.0
        self.mode = "UNOPTIMIZED"  # or "AI_OPTIMIZED"

        # 6 Platforms
        self.platforms = [
            { "id": "PLATFORM_1", "track_id": "TRK_P1", "length_m": 650, "max_speed_kmph": 30, "is_occupied": False, "occupant_train_id": None },
            { "id": "PLATFORM_2", "track_id": "TRK_P2", "length_m": 650, "max_speed_kmph": 30, "is_occupied": True, "occupant_train_id": "T_12402" },
            { "id": "PLATFORM_3", "track_id": "TRK_P3", "length_m": 650, "max_speed_kmph": 30, "is_occupied": False, "occupant_train_id": None },
            { "id": "PLATFORM_4", "track_id": "TRK_P4", "length_m": 600, "max_speed_kmph": 30, "is_occupied": False, "occupant_train_id": None },
            { "id": "PLATFORM_5", "track_id": "TRK_P5", "length_m": 600, "max_speed_kmph": 30, "is_occupied": False, "occupant_train_id": None },
            { "id": "PLATFORM_6", "track_id": "TRK_P6", "length_m": 550, "max_speed_kmph": 30, "is_occupied": False, "occupant_train_id": None }
        ]

        # 4 Outer Waiting Tracks
        self.outer_waiting_tracks = [
            { "id": "OUTER_HOLD_1", "track_id": "TRK_OH1", "capacity": 1, "description": "Up Main Outer Loop", "is_occupied": True, "occupant_train_id": "T_12301" },
            { "id": "OUTER_HOLD_2", "track_id": "TRK_OH2", "capacity": 1, "description": "Up Freight Siding", "is_occupied": True, "occupant_train_id": "T_5012" },
            { "id": "OUTER_HOLD_3", "track_id": "TRK_OH3", "capacity": 1, "description": "Down Main Outer Loop", "is_occupied": False, "occupant_train_id": None },
            { "id": "OUTER_HOLD_4", "track_id": "TRK_OH4", "capacity": 1, "description": "Down Freight Siding", "is_occupied": False, "occupant_train_id": None }
        ]

        # Switch points
        self.switches = [
            { "id": "SW_01A", "location_km": 14.2, "state": "NORMAL", "locked_for_route_id": "ROUTE_ENTRY_P2" },
            { "id": "SW_02B", "location_km": 14.8, "state": "REVERSE", "locked_for_route_id": "ROUTE_ENTRY_P2" }
        ]

        # Dynamic Signals
        self.signals = [
            { "id": "SIG_HOME_UP", "type": "4_ASPECT", "aspect": "GREEN", "protecting_block_id": "SEG_02" },
            { "id": "SIG_HOME_DOWN", "type": "4_ASPECT", "aspect": "YELLOW", "protecting_block_id": "SEG_03" },
            { "id": "SIG_STARTER_P1", "type": "3_ASPECT", "aspect": "RED", "protecting_block_id": "TRK_P1" },
            { "id": "SIG_STARTER_P2", "type": "3_ASPECT", "aspect": "GREEN", "protecting_block_id": "TRK_P2" },
            { "id": "SIG_STARTER_P3", "type": "3_ASPECT", "aspect": "RED", "protecting_block_id": "TRK_P3" },
            { "id": "SIG_STARTER_P4", "type": "3_ASPECT", "aspect": "RED", "protecting_block_id": "TRK_P4" },
            { "id": "SIG_STARTER_P5", "type": "3_ASPECT", "aspect": "RED", "protecting_block_id": "TRK_P5" },
            { "id": "SIG_STARTER_P6", "type": "3_ASPECT", "aspect": "RED", "protecting_block_id": "TRK_P6" }
        ]

        # Active locked routes
        self.active_routes = {
            "ROUTE_ENTRY_P2": {
                "route_id": "ROUTE_ENTRY_P2",
                "train_id": "T_12402",
                "target_platform": "PLATFORM_2",
                "switches": {"SW_01A": "NORMAL", "SW_02B": "REVERSE"},
                "signal_id": "SIG_HOME_UP",
                "locked": True
            }
        }

        # Initialize Trains
        self.trains: Dict[str, Dict[str, Any]] = {}
        self._init_default_trains()
        self._load_additional_trains()

        # Recommendation Cache
        self.recommendations: List[Dict[str, Any]] = []
        self._refresh_recommendations()

    def _init_default_trains(self):
        default_train_list = [
            {
                "id": "T_12301",
                "train_number": "12301",
                "name": "Rajdhani Express",
                "type": "Rajdhani",
                "priority": 8,
                "origin": "NDLS (New Delhi)",
                "destination": "HWH (Howrah)",
                "x": 420.5,
                "y": 150.0,
                "speed_kmph": 0.0,
                "status": "WAITING_OUTER",
                "block_id": "TRK_OH1",
                "assigned_track": "OUTER_HOLD_1",
                "eta_min": 6,
                "delay_min": 4,
                "is_stopped": True,
                "stopped_location": "Outer Holding Track 1 (Before Junction)",
                "duration_stopped_min": 5,
                "expected_clearance_min": 3,
                "conflicting_train_id": "T_20901",
                "dwell_time_remaining_sec": 0
            },
            {
                "id": "T_20901",
                "train_number": "20901",
                "name": "Vande Bharat Express",
                "type": "Vande Bharat",
                "priority": 10,
                "origin": "BSB (Varanasi)",
                "destination": "NDLS (New Delhi)",
                "x": 680.0,
                "y": 120.0,
                "speed_kmph": 130.0,
                "status": "MOVING",
                "block_id": "SEG_02",
                "assigned_track": "PLATFORM_1",
                "eta_min": 2,
                "delay_min": 0,
                "is_stopped": False,
                "stopped_location": "",
                "duration_stopped_min": 0,
                "expected_clearance_min": 0,
                "conflicting_train_id": None,
                "dwell_time_remaining_sec": 120
            },
            {
                "id": "T_5012",
                "train_number": "5012",
                "name": "Container Freight 5012",
                "type": "Freight",
                "priority": 2,
                "origin": "TKD (Tughlakabad)",
                "destination": "JNPT (Navi Mumbai)",
                "x": 350.0,
                "y": 200.0,
                "speed_kmph": 0.0,
                "status": "WAITING_OUTER",
                "block_id": "TRK_OH2",
                "assigned_track": "OUTER_HOLD_2",
                "eta_min": 4,
                "delay_min": 14,
                "is_stopped": True,
                "stopped_location": "Outer Holding Track 2 (Freight Siding)",
                "duration_stopped_min": 8,
                "expected_clearance_min": 10,
                "conflicting_train_id": "T_12301",
                "dwell_time_remaining_sec": 0
            },
            {
                "id": "T_12402",
                "train_number": "12402",
                "name": "Gomti Express",
                "type": "Mail/Express",
                "priority": 6,
                "origin": "LKO (Lucknow)",
                "destination": "NDLS (New Delhi)",
                "x": 550.0,
                "y": 150.0,
                "speed_kmph": 15.0,
                "status": "DWELLING_PLATFORM",
                "block_id": "TRK_P2",
                "assigned_track": "PLATFORM_2",
                "eta_min": 0,
                "delay_min": 2,
                "is_stopped": False,
                "stopped_location": "Platform 2",
                "duration_stopped_min": 2,
                "expected_clearance_min": 1,
                "conflicting_train_id": None,
                "dwell_time_remaining_sec": 45
            }
        ]
        for t in default_train_list:
            self.trains[t["id"]] = t

    def _load_additional_trains(self):
        # Look for existing timetable files if present
        try:
            for candidate_path in ["data/timetable.json", "../data/timetable.json", "backend/data/timetable.json"]:
                if os.path.exists(candidate_path):
                    with open(candidate_path, "r") as f:
                        data = json.load(f)
                        for t in data.get("trains", []):
                            tid = t["id"]
                            if tid not in self.trains:
                                priority = t.get("priority", 4)
                                name = t.get("name", f"Train {tid}")
                                t_type = t.get("type", "Express")
                                self.trains[tid] = {
                                    "id": tid,
                                    "train_number": tid.replace("TRN_", "").replace("T_", ""),
                                    "name": name,
                                    "type": t_type,
                                    "priority": priority,
                                    "origin": t.get("schedule", [{}])[0].get("station_id", "STN_00"),
                                    "destination": t.get("schedule", [{}])[-1].get("station_id", "STN_07"),
                                    "x": 100.0,
                                    "y": 100.0,
                                    "speed_kmph": 60.0 if priority > 5 else 35.0,
                                    "status": "MOVING",
                                    "block_id": "SEG_01",
                                    "assigned_track": None,
                                    "eta_min": 15,
                                    "delay_min": 0,
                                    "is_stopped": False,
                                    "stopped_location": "",
                                    "duration_stopped_min": 0,
                                    "expected_clearance_min": 0,
                                    "conflicting_train_id": None,
                                    "dwell_time_remaining_sec": 0
                                }
                    break
        except Exception as e:
            print(f"Notice: timetable loading note: {e}")

    def get_layout(self) -> Dict[str, Any]:
        return {
            "station_id": self.station_id,
            "name": self.station_name,
            "platforms": self.platforms,
            "outer_waiting_tracks": self.outer_waiting_tracks,
            "switch_points": self.switches,
            "signals": self.signals
        }

    def get_state(self) -> Dict[str, Any]:
        occupied = set()
        for p in self.platforms:
            if p["is_occupied"]: occupied.add(p["track_id"])
        for o in self.outer_waiting_tracks:
            if o["is_occupied"]: occupied.add(o["track_id"])
        for t in self.trains.values():
            if t.get("block_id"): occupied.add(t["block_id"])

        train_telemetry = []
        for t in self.trains.values():
            train_telemetry.append({
                "id": t["id"],
                "name": t["name"],
                "type": t["type"],
                "priority": t["priority"],
                "x": round(t["x"], 1),
                "y": round(t["y"], 1),
                "speed_kmph": round(t["speed_kmph"], 1),
                "status": t["status"],
                "block_id": t["block_id"],
                "current_delay_min": t["delay_min"],
                "assigned_track": t.get("assigned_track")
            })

        signals_map = {s["id"]: s["aspect"] for s in self.signals}
        switches_map = {sw["id"]: sw["state"] for sw in self.switches}

        return {
            "timestamp": round(self.current_time_sec, 1),
            "is_running": self.is_running,
            "playback_speed": self.playback_speed,
            "trains": train_telemetry,
            "signals": signals_map,
            "switches": switches_map,
            "occupied_circuits": sorted(list(occupied))
        }

    def _refresh_recommendations(self):
        self.recommendations = [
            {
                "recommendation_id": "REC_8841",
                "train_id": "T_12301",
                "train_name": "Rajdhani Express",
                "priority": 8,
                "eta_min": 6,
                "recommended_action": "ASSIGN_PLATFORM",
                "assigned_track": "PLATFORM_2",
                "alternative_track": "OUTER_HOLD_1",
                "outer_wait_min": 0,
                "reasoning": "Platform 2 is clearing in 1 min. Grants express mainline passage ahead of Freight 5012.",
                "safety_interlock_approved": True,
                "status": "PENDING_APPROVAL"
            },
            {
                "recommendation_id": "REC_8842",
                "train_id": "T_5012",
                "train_name": "Container Freight 5012",
                "priority": 2,
                "eta_min": 4,
                "recommended_action": "DIVERT_TO_OUTER_HOLDING",
                "assigned_track": "OUTER_HOLD_2",
                "alternative_track": "PLATFORM_6",
                "outer_wait_min": 8,
                "reasoning": "Held at Outer Siding 2 for 8 mins to prevent bottle-necking Rajdhani 12301. Saves 14 min network delay.",
                "safety_interlock_approved": True,
                "status": "PENDING_APPROVAL"
            }
        ]

    def get_radar_trains(self) -> List[Dict[str, Any]]:
        # Return trains approaching or waiting within 30 mins
        results = []
        for t in self.trains.values():
            if t["eta_min"] <= 30:
                results.append({
                    "train_id": t["id"],
                    "train_name": t["name"],
                    "train_type": t["type"],
                    "priority": t["priority"],
                    "current_block": t["block_id"],
                    "eta_min": t["eta_min"],
                    "speed_kmph": t["speed_kmph"],
                    "delay_min": t["delay_min"],
                    "status": t["status"]
                })
        results.sort(key=lambda x: (x["eta_min"], -x["priority"]))
        return results

    def step(self, delta_sec: float = 1.0) -> Dict[str, Any]:
        if not self.is_running:
            return self.get_state()

        effective_delta = delta_sec * self.playback_speed
        self.current_time_sec += effective_delta
        self.current_time_min = int(self.current_time_sec // 60)

        # Update train kinematics
        for tid, t in self.trains.items():
            if t["status"] == "MOVING":
                # Advance x position
                t["x"] = (t["x"] + 0.5 * effective_delta) % 1000.0
                if t["speed_kmph"] == 0.0:
                    t["speed_kmph"] = 80.0 if t["priority"] > 5 else 45.0
                t["is_stopped"] = False
            elif t["status"] in ["WAITING_OUTER", "STOPPED"]:
                t["speed_kmph"] = 0.0
                t["is_stopped"] = True
                t["duration_stopped_min"] = int(t.get("duration_stopped_min", 0) + (effective_delta / 60.0))
            elif t["status"] == "DWELLING_PLATFORM":
                rem = t.get("dwell_time_remaining_sec", 60) - effective_delta
                if rem <= 0:
                    t["status"] = "MOVING"
                    t["dwell_time_remaining_sec"] = 0
                    t["speed_kmph"] = 25.0
                    # Platform cleared
                    for p in self.platforms:
                        if p["occupant_train_id"] == tid:
                            p["is_occupied"] = False
                            p["occupant_train_id"] = None
                else:
                    t["dwell_time_remaining_sec"] = rem

        return self.get_state()

state_mgr = SimulationStateManager()
