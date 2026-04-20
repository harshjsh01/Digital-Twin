# Project Aahavaan - Rail: Master Blueprint

This document defines the architectural and technical specification for the full-stack Indian Railways Decision Support Simulation.

## 1. Monorepo Architecture
- **/backend**: Python (FastAPI), Pandas, Google OR-Tools.
- **/frontend**: Next.js, Tailwind CSS, Recharts.

---

## 2. Data Schema

### 2.1 Station Schema
```json
{
  "id": "STN_NDLS",
  "name": "New Delhi",
  "coordinates": {"x": 100, "y": 200},
  "platforms": 1,
  "loops": 2
}
```

### 2.2 Track Segment Schema
```json
{
  "id": "SEG_001",
  "from": "STN_A",
  "to": "STN_B",
  "distance_km": 15.0,
  "max_speed": 130,
  "current_occupant": null
}
```

### 2.3 Train Schema
```json
{
  "id": "T_12301",
  "type": "Vande Bharat",
  "priority_weight": 10,
  "current_loc": {"segment_id": "SEG_001", "dist_from_start": 5.2},
  "speed": 110,
  "schedule": [
    {"station_id": "STN_A", "arrival": "10:00", "departure": "10:02"},
    ...
  ],
  "cumulative_delay": 5
}
```

---

## 3. API Documentation (FastAPI)

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/network` | GET | Returns static station and track layout (for rendering the map). |
| `/api/state` | GET | Returns live positions, speeds, and delays for all trains. |
| `/api/simulate/tick` | POST | Manually advance simulation time (debug/dev mode). |
| `/api/mode` | PUT | Switch between `UNOPTIMIZED` and `AI_OPTIMIZED` modes. |

---

## 4. Mathematical Optimization Logic

The "Brain" uses **Constraint Programming (CP-SAT)** via Google OR-Tools to solve the **Precedence-Constrained Resource Allocation** problem.

### 4.1 Conflict Detection
A conflict is detected if:
`Train_A.interval(segment_S) ∩ Train_B.interval(segment_S) ≠ ∅`
Where `interval` is the time window a train occupies a specific track segment.

### 4.2 Resolution Solver
**Objective Function:**
`minimize ∑ (Priority_Weight[i] * Delay[i])`

**Decision Variables:**
- `Departure_Time[train][station]`: When a train leaves a station.
- `Platform_Usage[train][station]`: Which specific line (Main or Loop) the train occupies.

---

## 5. Next.js Component Hierarchy

- **IndexPage** (Root)
  - **NavBar**: Status indicators and mode switch (Manual/AI).
  - **DashboardLayout**:
    - **ControlRoomView**:
      - **LiveMap**: Track visualization using SVG or HTML5 Canvas.
      - **TrainDetailCard**: Real-time stats for the selected train.
    - **MetricsSidebar**:
      - **DelayComparisonChart**: Side-by-side live metrics (Recharts).
      - **DecisionFeed**: A scrolling list of AI resolution actions.

---

## 6. Development Workflow
1. **Phase 2**: Implement the engine and FastAPI service.
2. **Phase 3**: Develop the OR-Tools solver logic.
3. **Phase 4**: Build the Next.js visualizer and dashboard.
