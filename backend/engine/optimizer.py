from ortools.sat.python import cp_model
import pandas as pd

class TrainOptimizer:
    def __init__(self, network, trains):
        self.network = network
        self.trains = trains
        self.model = cp_model.CpModel()
        
    def solve(self, lookahead_min=60):
        """
        Solves the conflict resolution problem for a 60-min window.
        """
        # Variables: departure times for each train at each station
        vars = {}
        for train in self.trains:
            for entry in train['schedule']:
                key = (train['id'], entry['station_id'])
                # Bounds: [scheduled_time, scheduled_time + max_delay]
                vars[key] = self.model.NewIntVar(entry['departure_min'], entry['departure_min'] + 120, f'd_{train["id"]}_{entry["station_id"]}')

        # Constraints: Segment occupancy (No two trains on the same segment at the same time)
        # This is a simplified version for the prototype.
        # In a real system, we'd use IntervalVars.
        
        for i in range(len(self.network['segments'])):
            seg = self.network['segments'][i]
            potential_trains = [t for t in self.trains if self.uses_segment(t, seg)]
            
            for j in range(len(potential_trains)):
                for k in range(j + 1, len(potential_trains)):
                    t1 = potential_trains[j]
                    t2 = potential_trains[k]
                    
                    # Entry/Exit times for t1 on segment
                    # t1_entry = d[t1][seg['from']]
                    # t1_exit = d[t1][seg['from']] + travel_time
                    
                    travel_time_1 = int(seg['distance_km'] / (t1['max_speed_kmph'] / 60))
                    travel_time_2 = int(seg['distance_km'] / (t2['max_speed_kmph'] / 60))
                    
                    t1_d = vars[(t1['id'], seg['from_stn'])]
                    t2_d = vars[(t2['id'], seg['from_stn'])]
                    
                    # Constraint: Either t1 finishes segment before t2 starts, OR vice versa
                    b = self.model.NewBoolVar(f'order_{t1["id"]}_{t2["id"]}_{seg["id"]}')
                    
                    # t1 before t2: t1_d + travel_time <= t2_d
                    self.model.Add(t1_d + travel_time_1 <= t2_d).OnlyEnforceIf(b)
                    # t2 before t1: t2_d + travel_time <= t1_d
                    self.model.Add(t2_d + travel_time_2 <= t1_d).OnlyEnforceIf(b.Not())

        # Objective: Minimize weighted delay
        obj_expr = []
        for train in self.trains:
            last_stn = train['schedule'][-1]['station_id']
            delay = vars[(train['id'], last_stn)] - train['schedule'][-1]['departure_min']
            obj_expr.append(delay * train['priority'])
            
        self.model.Minimize(sum(obj_expr))

        # Solve
        solver = cp_model.CpSolver()
        status = solver.Solve(self.model)
        
        results = {}
        if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
            for key, var in vars.items():
                results[key] = solver.Value(var)
            return results
        return None

    def uses_segment(self, train, segment):
        # Checks if train schedule includes the segment (from -> to)
        stns = [s['station_id'] for s in train['schedule']]
        if segment['from_stn'] in stns and segment['to_stn'] in stns:
            return stns.index(segment['from_stn']) < stns.index(segment['to_stn'])
        return False
