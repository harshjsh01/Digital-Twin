# Project Aahavaan - Rail: Master Blueprint

This document defines the architectural and technical specification for the full-stack Indian Railways Decision Support Simulation.

## 1. Monorepo Architecture & Evolution

### Phase 1 Baseline Prototype
- **/backend**: Python (FastAPI), Pandas, Google OR-Tools.
- **/control-room**: Next.js 15, Tailwind CSS, Recharts (Working Command Center).

### Phase 2 Next-Level Architecture (4 Independent Domains)
*For complete technical details, see [`object.md`](object.md) and [`docs/file.md`](docs/file.md).*
- **/models** [Engineer 1]: AI/ML datasets, LightGBM delay predictor, Google OR-Tools CP-SAT 6-platform solver.
- **/backend** [Engineer 2]: Modular FastAPI server (`/app/api/v1`), safety interlocking guard, explainability engine.
- **/frontend** [Engineer 3]: 6-Platform Junction Simulator (`/frontend/simulator`) & Station Master Cockpit (`/frontend/station-commander`).
- **/client** [Engineer 4]: Passenger Portal (`/client`) with train search, wait-reason cards, and ₹9/mo x402 + Algorand Testnet micropayments.

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

## 6. Phase 2 Parallel Development Workflow

The project is structured into four strictly decoupled domains allowing concurrent development with zero merge conflicts:

1. **Domain 1: AI & Optimization (`models/`)** [Engineer 1]: Synthetic high-density timetable generation, LightGBM delay prediction, and Google OR-Tools CP-SAT 6-platform solver (`models/station_optimizer/solver.py`).
2. **Domain 2: Backend & Safety Systems (`backend/`)** [Engineer 2]: FastAPI v1 API routers (`simulator.py`, `station_master.py`, `passenger.py`, `payments.py`), safety interlocking guard (`interlocking.py`), state engine, and Algorand verifier.
3. **Domain 3: Industrial Frontends (`frontend/`)** [Engineer 3]: Station Digital Twin Canvas (`frontend/simulator/`) with 6 platforms and 4 outer waiting tracks, plus Station Commander Cockpit (`frontend/station-commander/`) with 1-click HITL approval deck.
4. **Domain 4: Passenger Portal & x402 Micropayments (`client/`)** [Engineer 4]: Consumer train search, live journey tracking, "Why is My Train Stopped?" explainable card, and `@x402-avm` Algorand Testnet wallet checkout modal (0.1 ALGO / ₹9/mo).

*For complete implementation specifications, see [**`object.md` (Phase 2 Master Plan)**](https://github.com/harshjsh01/Digital-Twin/blob/main/object.md) and [**`docs/file.md` (Complete File Directory)**](https://github.com/harshjsh01/Digital-Twin/blob/main/docs/file.md).*
