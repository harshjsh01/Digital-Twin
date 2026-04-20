import json
import os
import random

def generate_network(output_path):
    stations = [
        {"id": f"STN_{i:02d}", "name": f"Station {chr(65+i)}", "coords": {"x": i * 100, "y": 50}, "platforms": 1, "loops": 2}
        for i in range(8)
    ]
    
    segments = []
    for i in range(len(stations) - 1):
        segment = {
            "id": f"SEG_{i}{i+1}",
            "from_stn": stations[i]["id"],
            "to_stn": stations[i+1]["id"],
            "distance_km": 15.0,
            "max_speed_kmph": 110 if i % 2 == 0 else 130,
            "capacity": 1
        }
        segments.append(segment)
        
    network_data = {
        "stations": stations,
        "segments": segments
    }
    
    with open(output_path, "w") as f:
        json.dump(network_data, f, indent=4)
    print(f"Generated network at {output_path}")

def generate_timetable(network_path, output_path):
    with open(network_path, "r") as f:
        network = json.load(f)
    
    stations = [s["id"] for s in network["stations"]]
    trains = []
    
    for i in range(1, 21):
        # 1-5: Vande Bharat (Priority 10, Speed 160)
        # 6-10: Rajdhani (Priority 8, Speed 130)
        # 11-20: Freight (Priority 2, Speed 60)
        
        if i <= 5:
            t_type, priority, speed = "Vande Bharat", 10, 160
        elif i <= 10:
            t_type, priority, speed = "Rajdhani", 8, 130
        else:
            t_type, priority, speed = "Freight", 2, 60
            
        start_time = (i - 1) * 12 # Staggered
        
        # Simple directional route A -> H
        schedule = []
        for j, stn_id in enumerate(stations):
            # Roughly 10-20 mins between stations
            arrival = start_time + j * 15
            departure = arrival + (2 if j < len(stations)-1 else 0)
            schedule.append({
                "station_id": stn_id,
                "arrival_min": arrival,
                "departure_min": departure
            })
            
        train = {
            "id": f"T_{12300 + i}",
            "name": f"{t_type} {i}",
            "type": t_type,
            "priority": priority,
            "max_speed_kmph": speed,
            "schedule": schedule
        }
        trains.append(train)
        
    with open(output_path, "w") as f:
        json.dump({"trains": trains}, f, indent=4)
    print(f"Generated timetable at {output_path}")

if __name__ == "__main__":
    data_dir = "backend/data"
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)
    net_path = os.path.join(data_dir, "network.json")
    table_path = os.path.join(data_dir, "timetable.json")
    generate_network(net_path)
    generate_timetable(net_path, table_path)
