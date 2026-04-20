import json
import os

class SimulationEngine:
    def __init__(self, route_file, timetable_file):
        with open(route_file, 'r') as f:
            self.route = json.load(f)
        with open(timetable_file, 'r') as f:
            self.timetable = json.load(f)
            
        self.stations = {s['id']: s for s in self.route['stations']}
        self.segments = {seg['id']: seg for seg in self.route['segments']}
        
        # Mapping for easy lookup
        self.segments_by_from = {seg['from']: seg for seg in self.route['segments']}
        
        self.train_states = {}
        self.initialize_trains()
        
        self.current_time = 0
        self.total_delay = 0

    def initialize_trains(self):
        for train in self.timetable['trains']:
            self.train_states[train['id']] = {
                "train": train,
                "current_station": "STN_A",
                "next_station": "STN_B",
                "current_segment": None,
                "position_in_segment": 0,
                "status": "WAITING", # WAITING, MOVING, ARRIVED
                "arrival_time_at_current_loc": train['schedule'][0]['arrival_min'],
                "departure_time_from_current_loc": train['schedule'][0]['departure_min'],
                "current_delay": 0,
                "completed": False
            }

    def get_occupancy(self):
        occupancy = {s['id']: [] for s in self.route['stations']}
        for seg_id in self.segments:
            occupancy[seg_id] = []
        
        for tid, state in self.train_states.items():
            if state['completed']: continue
            if state['current_segment']:
                occupancy[state['current_segment']].append(tid)
            elif state['current_station']:
                occupancy[state['current_station']].append(tid)
        return occupancy

    def tick(self, optimizer=None):
        """Advance simulation by 1 minute."""
        self.current_time += 1
        occupancy = self.get_occupancy()
        
        # We need to process trains. 
        # To avoid bias, we could sort by priority or ID.
        for tid in sorted(self.train_states.keys()):
            state = self.train_states[tid]
            if state['completed']:
                continue
            
            # --- Logic for trains at STATIONS ---
            if state['current_station'] and not state['current_segment']:
                # Ready to depart?
                if self.current_time >= state['departure_time_from_current_loc']:
                    # Which segment is next?
                    next_seg = self.segments_by_from.get(state['current_station'])
                    
                    if not next_seg:
                        # End of the line
                        state['completed'] = True
                        state['status'] = "ARRIVED"
                        print(f"Time {self.current_time}: {state['train']['name']} completed journey at {state['current_station']}")
                        continue

                    # Optimization Engine check
                    # Standard rules: Proceed if next segment is clear
                    can_proceed = len(occupancy[next_seg['id']]) == 0
                    
                    if optimizer:
                        # Optimization engine can block or allow
                        can_proceed = optimizer.should_proceed(tid, state, next_seg, occupancy)

                    if can_proceed:
                        # Move to segment
                        state['current_segment'] = next_seg['id']
                        state['current_station'] = None
                        state['position_in_segment'] = 0
                        state['status'] = "MOVING"
                        # Update occupancy for other trains in this tick (simplified)
                        occupancy[next_seg['id']].append(tid) 
                    else:
                        # Wait at station
                        state['status'] = "WAITING"
                        state['current_delay'] += 1
                        self.total_delay += 1
                        # Update schedule for subsequent stations
                        # (Simple: push all future arrival/departure times by 1 min)
                        # Actually, we can just track cumulative delay.

            # --- Logic for trains on SEGMENTS ---
            elif state['current_segment']:
                seg = self.segments[state['current_segment']]
                speed = state['train']['max_speed_km_min']
                state['position_in_segment'] += speed
                
                if state['position_in_segment'] >= seg['distance_km']:
                    # Reached next station
                    next_stn_id = seg['to']
                    state['current_station'] = next_stn_id
                    state['current_segment'] = None
                    state['position_in_segment'] = 0
                    state['status'] = "WAITING"
                    
                    # Log arrival
                    sched_entry = next((s for s in state['train']['schedule'] if s['station_id'] == next_stn_id), None)
                    if sched_entry:
                        state['departure_time_from_current_loc'] = max(self.current_time + 2, sched_entry['departure_min'] + state['current_delay'])
                    
                    # Update status for loop/platform usage? 
                    # For simplicity, we assume stations have enough capacity for now,
                    # or we can add capacity checks here.
        
        return all(s['completed'] for s in self.train_states.values())

    def run_simulation(self, optimizer=None, max_ticks=1000):
        while self.current_time < max_ticks:
            finished = self.tick(optimizer)
            if finished:
                break
        return self.total_delay

if __name__ == "__main__":
    sim = SimulationEngine("data/route.json", "data/timetable.json")
    delay = sim.run_simulation()
    print(f"Simulation finished with total delay: {delay} minutes")
