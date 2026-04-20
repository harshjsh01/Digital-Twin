class OptimizationEngine:
    def __init__(self, simulation):
        self.sim = simulation
        self.enabled = False

    def set_enabled(self, val):
        self.enabled = val

    def should_proceed(self, train_id, state, next_segment, occupancy):
        """
        Decision support logic.
        Standard Rule: Proceed if next segment is clear.
        Optimized Rule: Predictive overtaking.
        """
        # Standard check: next segment must be clear
        segment_clear = len(occupancy[next_segment['id']]) == 0
        if not segment_clear:
            return False

        if not self.enabled:
            return True

        # --- Optimization Logic: Scenario B ---
        train = state['train']
        
        # If this is an Express train, always proceed if clear
        if train['type'] == "Express":
            return True
        
        # If this is a Freight train, check if we should 'Wait' to let an Express pass.
        if train['type'] == "Freight":
            # LOOK AHEAD: Are there any Express trains that will catch up to us?
            # We check trains that are currently behind us.
            for tid, other_state in self.sim.train_states.items():
                if tid == train_id or other_state['completed']:
                    continue
                
                other_train = other_state['train']
                if other_train['type'] == "Express":
                    # Is this express train behind us?
                    # Simplified check: compare station indices
                    current_stn_idx = self.get_station_index(state['current_station'])
                    other_stn_idx = self.get_station_index(other_state['current_station'])
                    
                    if other_stn_idx is not None and current_stn_idx is not None:
                        if other_stn_idx < current_stn_idx:
                            # Express is behind. Will it catch up?
                            # Distance to next station for us:
                            dist_to_go = 20 # For simplicity, 1 segment
                            time_for_us = dist_to_go / train['max_speed_km_min'] # 20 / 0.6 = 33 min
                            
                            # Distance for them:
                            # They are at station other_stn_idx. 
                            # Distance = (current_stn_idx - other_stn_idx) * 20
                            dist_for_them = (current_stn_idx - other_stn_idx) * 20
                            time_for_them = dist_for_them / other_train['max_speed_km_min'] # e.g. 20 / 1.5 = 13 min
                            
                            # If they will reach this station before we reach the NEXT station,
                            # AND they are within 1 station of us.
                            if time_for_them < 15 and (current_stn_idx - other_stn_idx) == 1:
                                print(f"Optimization: Holding {train['name']} at {state['current_station']} to let {other_train['name']} pass.")
                                return False
                                
        return True

    def get_station_index(self, station_id):
        if not station_id: return None
        stations = ["STN_A", "STN_B", "STN_C", "STN_D", "STN_E"]
        try:
            return stations.index(station_id)
        except ValueError:
            return None
