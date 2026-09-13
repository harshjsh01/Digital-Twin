import json
import os
import random

def generate_route(output_dir):
    stations = ["Station A", "Station B", "Station C", "Station D", "Station E"]
    route_data = {
        "stations": [],
        "segments": []
    }

    # Generate Station data
    for i, name in enumerate(stations):
        station = {
            "name": name,
            "id": f"STN_{chr(65+i)}",
            "platforms": [
                {"id": f"STN_{chr(65+i)}_P1", "type": "main", "capacity": 1},
                {"id": f"STN_{chr(65+i)}_L1", "type": "loop", "capacity": 1},
                {"id": f"STN_{chr(65+i)}_L2", "type": "loop", "capacity": 1}
            ]
        }
        route_data["stations"].append(station)

    # Generate Segments between stations
    # Distance between each station is 20 km
    for i in range(len(stations) - 1):
        segment = {
            "id": f"SEG_{chr(65+i)}{chr(65+i+1)}",
            "from": f"STN_{chr(65+i)}",
            "to": f"STN_{chr(65+i+1)}",
            "distance_km": 20.0,
            "capacity": 1
        }
        route_data["segments"].append(segment)

    with open(os.path.join(output_dir, "route.json"), "w") as f:
        json.dump(route_data, f, indent=4)
    print("Generated route.json")

def generate_timetable(output_dir):
    # 6 Express trains, 4 Freight trains
    trains = []
    
    # Base speeds (km per minute)
    # Express: 1.5 km/min (~90 km/h)
    # Freight: 0.6 km/min (~36 km/h)
    
    for i in range(1, 11):
        # Trains 1-4 are Freight, 5-10 are Express
        # Starting with Freight first ensures Express catches up
        is_express = i >= 5
        train_type = "Express" if is_express else "Freight"
        priority = 1 if is_express else 0
        speed = 1.5 if is_express else 0.5 # Slowed down freight slightly to 0.5
        
        # Start times: Freight starts at 0, 5, 10, 15
        # Express starts at 2, 7, 12, 17, 22, 27
        if not is_express:
            start_time = (i - 1) * 5
        else:
            start_time = (i - 5) * 5 + 2
        
        train = {
            "id": f"TRN_{i:03d}",
            "name": f"{train_type} Train {i}",
            "type": train_type,
            "priority": priority,
            "max_speed_km_min": speed,
            "schedule": [
                {"station_id": "STN_A", "arrival_min": start_time, "departure_min": start_time + 2},
                {"station_id": "STN_B", "arrival_min": start_time + 30, "departure_min": start_time + 32},
                {"station_id": "STN_C", "arrival_min": start_time + 60, "departure_min": start_time + 62},
                {"station_id": "STN_D", "arrival_min": start_time + 90, "departure_min": start_time + 92},
                {"station_id": "STN_E", "arrival_min": start_time + 120, "departure_min": start_time + 122}
            ]
        }
        trains.append(train)

    with open(os.path.join(output_dir, "timetable.json"), "w") as f:
        json.dump({"trains": trains}, f, indent=4)
    print("Generated timetable.json")

if __name__ == "__main__":
    data_dir = "data"
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)
    generate_route(data_dir)
    generate_timetable(data_dir)
