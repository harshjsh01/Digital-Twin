# System Architecture & Technical Specifications

This document outlines the software architecture, component separation, communication protocols, and mathematical design patterns for **Project Aahavaan - Rail (Indian Railways Digital Twin)**.

---

## 🏛️ Architectural Overview

Project Aahavaan is designed as a **Headless Discrete-Event Digital Twin** paired with an **Independent Control Room Frontend**:

```text
+-------------------------------------------------------------------------------+
|                         Next.js 15 Control Room (Frontend)                     |
|  +---------------------+  +------------------------+  +--------------------+  |
|  |  LiveMap.tsx (SVG)  |  | MetricsSidebar.tsx     |  | DecisionLog.tsx    |  |
|  +---------------------+  +------------------------+  +--------------------+  |
+---------------------------------------▲---------------------------------------+
                                        │ REST / JSON Polling (500ms ticks)
+---------------------------------------▼---------------------------------------+
|                            FastAPI REST Service                                |
|  - GET  /api/network       - PUT  /api/mode                                   |
|  - GET  /api/state         - POST /api/simulate/tick                          |
+---------------------------------------▲---------------------------------------+
                                        │
+---------------------------------------▼---------------------------------------+
|                          Simulation Engine (Core)                              |
|  - State Management & Minute Ticks  - Track & Platform Locks                  |
|  - Spatial Coordinates Tracking     - Delay Accumulator                       |
+---------------------------------------▲---------------------------------------+
                                        │
+---------------------------------------▼---------------------------------------+
|                    Google OR-Tools CP-SAT Optimization Engine                  |
|  - Conflict Horizon Scanner (60m)   - Precedence Decision Variables           |
|  - Delay Minimization Objective     - Station Loop Line Assignment            |
+-------------------------------------------------------------------------------+
```

---

## 🧩 Component Architecture

### 1. Backend Layer (Python & FastAPI)
- **FastAPI Framework**: High-throughput async REST framework providing OpenAPI spec and CORS middleware for frontend communication.
- **Simulation State Manager (`SimulationState`)**:
  - Maintains deterministic memory representation of all 20 trains and 8 stations.
  - Controls tick progression, velocity integration, and block clearance.
- **Optimization Solver (`TrainOptimizer`)**:
  - Encapsulates CP-SAT constraint modeling.
  - Formulates decision variables for station departures and segment intervals.

### 2. Frontend Layer (Next.js, React, Tailwind, Recharts)
- **App Router (`src/app/page.tsx`)**: Central state container handling the simulation loop, network metadata caching, and mode dispatch.
- **Visualization Subsystems**:
  - **`LiveMap.tsx`**: Dynamic SVG renderer projecting station nodes and animated train icons along track segments.
  - **`MetricsSidebar.tsx`**: Recharts visualizer computing live delay differentials and efficiency percentages.
  - **`DecisionLog.tsx`**: Terminal-inspired action feed rendering automated dispatch directives.

---

## 🧮 Mathematical Formulation of the Optimization Engine

The dispatch optimizer treats train routing across single-track segments as a **Job Shop Scheduling Problem with Disjunctive Constraints**.

### 1. Sets and Parameters
- $T$: Set of all trains $\{t_1, t_2, \dots, t_N\}$
- $S$: Set of all stations $\{s_1, s_2, \dots, s_M\}$
- $B$: Set of track block segments between stations
- $P_t$: Priority weight of train $t$ ($P_{\text{Vande Bharat}} = 10, P_{\text{Rajdhani}} = 8, P_{\text{Freight}} = 2$)
- $d^{\text{sched}}_{t, s}$: Scheduled departure time of train $t$ from station $s$
- $T^{\text{travel}}_{t, b}$: Free-flow travel duration of train $t$ over segment $b$:
  $$T^{\text{travel}}_{t, b} = \frac{\text{Distance}_b}{\text{MaxSpeed}_t}$$

### 2. Decision Variables
- $D_{t, s} \in [d^{\text{sched}}_{t, s}, d^{\text{sched}}_{t, s} + \text{MaxAllowedDelay}]$: Actual departure time of train $t$ from station $s$.
- $\theta_{t_1, t_2, b} \in \{0, 1\}$: Boolean indicator variable establishing precedence order between train $t_1$ and $t_2$ on segment $b$.

### 3. Constraints

#### A. Departure Feasibility
A train cannot depart before its scheduled time:
$$D_{t, s} \ge d^{\text{sched}}_{t, s} \quad \forall t \in T, s \in S$$

#### B. Single-Occupancy Disjunctive Block Constraints
For any two trains $t_1, t_2$ utilizing the same block segment $b$ originating at station $s_{\text{from}}$:
$$D_{t_1, s_{\text{from}}} + T^{\text{travel}}_{t_1, b} \le D_{t_2, s_{\text{from}}} \quad \text{if } \theta_{t_1, t_2, b} = 1$$
$$D_{t_2, s_{\text{from}}} + T^{\text{travel}}_{t_2, b} \le D_{t_1, s_{\text{from}}} \quad \text{if } \theta_{t_1, t_2, b} = 0$$

### 4. Objective Function
Minimize the system-wide priority-weighted delay at terminal stations $s_{\text{dest}}$:
$$\min \sum_{t \in T} \left( P_t \times \left( D_{t, s_{\text{dest}}} - d^{\text{sched}}_{t, s_{\text{dest}}} \right) \right)$$

---

## 📡 Communication Protocol

```text
[Next.js Client] ──(HTTP GET /api/state)──► [FastAPI Controller]
                 ◄──(JSON Telemetry)───────
[Next.js Client] ──(HTTP POST /api/simulate/tick)──► [FastAPI Controller]
                 ◄──(Updated Tick State)──
[Next.js Client] ──(HTTP PUT /api/mode?mode=AI_OPTIMIZED)──► [FastAPI Controller]
                                                                │
                                                    [OR-Tools CP-SAT Solver]
```
- **Payload Format**: Strict JSON models.
- **Latency**: Sub-millisecond solver execution for 20 trains over 60-minute horizons.
