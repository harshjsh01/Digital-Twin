# Indian Railways "Digital Twin" Simulation: Master Blueprint

This document serves as the architectural foundation for the Railway Decision Support Simulation.

## 1. Technical Stack
- **Language:** Python 3.x
- **Data Format:** JSON (for Route and Timetable)
- **Architecture:** Modular decoupling of Data, Simulation, and Optimization.
- **Simulation Type:** Discrete Time-Step (Minute-by-minute ticks).

## 2. Project Structure
```text
Railway/
├── data/                       # Generated JSON data
│   ├── route.json              # Station and track layout
│   └── timetable.json          # Train schedules and priorities
├── src/                        # Source Logic
│   ├── data_generator.py       # Module to create dummy data
│   ├── simulation_engine.py    # Core tick-based simulator
│   ├── optimization_engine.py  # Conflict detection & resolution
│   └── utils.py                # Logging and formatting helpers
├── main.py                     # Entry point (Scenario A vs Scenario B)
├── master_blueprint.md         # This document
└── implementation_plan.md      # Planning artifact
```

## 3. Data Flow & Models

### 3.1 Network Model (`route.json`)
- **Stations:** At least 5 stations (A, B, C, D, E).
- **Tracks:**
    - **Main Line:** High-speed connection between stations.
    - **Loop Lines:** 2 per station. Used for holding trains or allowing overtakes.
- **Capacity:** Each track segment (Main or Loop) can hold only 1 train at a time.

### 3.2 Train Model (`timetable.json`)
- **Properties:**
    - `id`: Unique identifier.
    - `type`: "Express" (High Priority) or "Freight" (Low Priority).
    - `priority`: Numeric value (e.g., 1 for Express, 0 for Freight).
    - `max_speed`: km/min.
    - `route`: List of stations and scheduled arrival/departure times.
    - `current_delay`: Minutes.

## 4. Simulation Engine Logic

### 4.1 Minute-by-Minute Tick
Every tick, the engine:
1. Updates each train's position based on speed and current track.
2. Checks if the train has reached a station.
3. If at a station, checks "Standard Rules" (Scenario A) or "Optimized Rules" (Scenario B) for permission to proceed.

### 4.2 Scenario A: Standard Rules (FIFO)
- Trains proceed strictly in the order they arrived at the station.
- If the track to the next station is occupied, the train waits at the current station platform/loop.

### 4.3 Scenario B: Optimization Engine
The engine looks ahead X minutes:
1. **Conflict Detection:** Identifies if a Freight train is ahead of an Express train on the same Main Line segment, causing the Express train to slow down or stop.
2. **Resolution:** 
    - If a conflict is predicted, the Freight train is instructed to move to a **Loop Line** at the nearest station.
    - The Freight train remains on the Loop Line until the Express train clears the segment.
    - Result: Express train maintains speed; Freight train takes a minor local delay to prevent a major system-wide cascade.

## 5. Metrics & Output
The simulation will track **Total Cumulative Delay (TCD)**.
- **Scenario A Output:** TCD based on manual-style FIFO logic.
- **Scenario B Output:** TCD using the Optimization Engine.
- **Comparison:** Total minutes saved.

## 6. Future Scalability
- Integration of actual Indian Railways COA (Control Office Application) data.
- GIS mapping for real-world route visualization.
- Multi-track main lines (Up/Down directionality).
