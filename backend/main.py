from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
import os
import asyncio
from engine.optimizer import TrainOptimizer

app = FastAPI(title="Project Aahavaan - Rail API")

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Global State ---
class SimulationState:
    def __init__(self):
        with open("data/network.json", "r") as f:
            self.network = json.load(f)
        with open("data/timetable.json", "r") as f:
            self.timetable = json.load(f)
            
        self.current_time = 0
        self.train_states = {}
        self.initialize_trains()
        self.is_running = False
        self.mode = "UNOPTIMIZED" # or "AI_OPTIMIZED"
        self.optimized_schedule = None

    def initialize_trains(self):
        for train in self.timetable['trains']:
            self.train_states[train['id']] = {
                "id": train['id'],
                "name": train['name'],
                "type": train['type'],
                "priority": train['priority'],
                "status": "WAITING",
                "current_stn": train['schedule'][0]['station_id'],
                "next_stn": train['schedule'][1]['station_id'],
                "pos_km": 0.0,
                "speed_kmph": 0.0,
                "delay_min": 0,
                "completed": False,
                "schedule": train['schedule']
            }

    def tick(self):
        self.current_time += 1
        
        # Run optimization if in AI mode and not yet optimized
        if self.mode == "AI_OPTIMIZED" and self.optimized_schedule is None:
            optimizer = TrainOptimizer(self.network, self.timetable['trains'])
            self.optimized_schedule = optimizer.solve()
            print("AI Optimization Complete.")

        # Simple movement logic for Phase 3
        for tid, state in self.train_states.items():
            if state["completed"]: continue
            
            # Find current schedule entry
            now = self.current_time
            
            # Check departure
            base_dept = state["schedule"][0]["departure_min"]
            
            # Resolution logic
            if self.mode == "AI_OPTIMIZED" and self.optimized_schedule:
                # Use AI-calculated departure time
                target_dept = self.optimized_schedule.get((tid, state["current_stn"]), base_dept)
            else:
                # Standard FIFO (just base schedule + delay)
                target_dept = base_dept + state["delay_min"]

            if state["status"] == "WAITING":
                if now >= target_dept:
                    # Check if next segment is clear (Standard FIFO rule)
                    # For prototype, we assume optimizer handled this for AI mode
                    state["status"] = "MOVING"
                    state["speed_kmph"] = state.get("max_speed_kmph", 100)
            
            elif state["status"] == "MOVING":
                # Move towards next station
                state["pos_km"] += 1.66
                if state["pos_km"] >= 15.0:
                    state["pos_km"] = 0.0
                    state["status"] = "WAITING"
                    # Progress current station...
        
        return self.train_states

sim_state = SimulationState()

@app.get("/api/network")
async def get_network():
    return sim_state.network

@app.get("/api/state")
async def get_state():
    return {
        "current_time": sim_state.current_time,
        "trains": list(sim_state.train_states.values())
    }

@app.post("/api/simulate/start")
async def start_simulation():
    sim_state.is_running = True
    return {"status": "started"}

@app.put("/api/mode")
async def set_mode(mode: str):
    sim_state.mode = mode
    if mode == "UNOPTIMIZED":
        sim_state.optimized_schedule = None
    return {"mode": sim_state.mode}

@app.post("/api/simulate/tick")
async def manual_tick():
    state = sim_state.tick()
    return {"time": sim_state.current_time, "trains": state}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
