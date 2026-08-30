# Project Aahavaan - Rail: Complete Feature Breakdown

This document provides a comprehensive breakdown of all features, flagship highlights, and capabilities implemented in **Project Aahavaan (Indian Railways Digital Twin Decision Support Simulation)**.

---

## 🌟 Flagship Highlights

### 1. 🧠 AI-Powered Look-Ahead Conflict Detection
- **60-Minute Horizon Evaluation**: Continuously scans future track occupancies to detect resource contention before trains physically encounter restrictive aspects.
- **Resource Contention Identification**: Detects when high-speed express trains (*Vande Bharat*, *Rajdhani*) are forecasted to be trapped behind lower-speed freight convoys in single or limited-track blocks.
- **Dynamic Precedence Determination**: Replaces rigid First-In, First-Out (FIFO) clearing with priority-aware mathematical precedence.

### 2. ⚡ Google OR-Tools CP-SAT Optimization Solver
- **Constraint Programming**: Formulates the rail dispatching challenge as a Resource-Constrained Precedence Scheduling problem.
- **Priority-Weighted Objective Function**:
  $$\min \sum_{t \in \text{Trains}} \left( \text{PriorityWeight}_t \times \text{CumulativeDelay}_t \right)$$
- **Station Loop Line Utilization**: Calculates the optimal siding/loop hold duration for freight trains to allow express services to overtake without throttling down.

### 3. ⏱️ High-Fidelity Discrete Minute-by-Minute Simulation Engine
- **Headless & Scalable**: Pure Python simulation core simulating train movement, speed profiles, dwell times, and section clearances.
- **Realistic Section Constraints**: Enforces single-occupancy block rules ($1 \text{ train} / \text{segment}$) and platform allocation.
- **Deterministic & Replayable**: Supports side-by-side comparative benchmarking against unoptimized baseline runs.

### 4. 🖥️ Next.js Command Center (Control Room Dashboard)
- **Interactive Network Map**: Real-time animated track layout displaying station nodes, interconnecting block segments, and train tokens.
- **Live Delay Comparison Analytics**: Recharts-powered side-by-side telemetry contrasting unoptimized baseline delays with AI-optimized savings.
- **Live Decision Action Feed**: Transparent, explainable AI feed logging every dispatch order (e.g., *"Train 12304 routed to Loop 1 at Station D for 8 mins"*).
- **Dual Mode Switching**: Seamless runtime switching between `UNOPTIMIZED` (Manual Dispatching) and `AI_OPTIMIZED` modes.

---

## 📋 Comprehensive Feature Matrix

| Category | Feature | Status | Description |
| :--- | :--- | :--- | :--- |
| **Data Generation** | Realistic Route Generator | ✅ Implemented | Generates 8-station railway network with mainline and dual loop tracks. |
| | Mixed Timetable Generator | ✅ Implemented | Synthesizes 20 active trains across Vande Bharat, Rajdhani, and Freight classes. |
| **Simulation Core** | Minute-by-Minute Ticks | ✅ Implemented | Advances train positions, computes speed transitions, and updates section locks. |
| | Block Occupancy Tracker | ✅ Implemented | Locks and releases block sections dynamically to prevent collisions. |
| | Delay Accumulation Engine | ✅ Implemented | Tracks scheduled vs. actual arrival and departure deviations at every station. |
| **Optimization Engine** | Conflict Horizon Scanner | ✅ Implemented | Computes time-window overlaps for shared segments. |
| | CP-SAT Solver Integration | ✅ Implemented | Google OR-Tools model minimizing priority-weighted total delay. |
| | Overtake & Siding Allocation | ✅ Implemented | Orders freight trains into station loop lines to maintain express velocity. |
| **Backend REST API** | `/api/network` | ✅ Implemented | Serves static topology, coordinates, platform counts, and segment lengths. |
| | `/api/state` | ✅ Implemented | Emits real-time train telemetry, coordinates, speeds, and statuses. |
| | `/api/simulate/tick` | ✅ Implemented | Advances simulation step synchronously and returns current state. |
| | `/api/mode` | ✅ Implemented | Switches between AI optimization and standard FIFO dispatch. |
| **Frontend UI/UX** | Dark-Themed Control Room | ✅ Implemented | High-contrast industrial UI built with Tailwind CSS & Next.js 15. |
| | Animated Track SVG Canvas | ✅ Implemented | Framer Motion & SVG rendering of trains traversing block sections. |
| | Recharts Delay Visualizer | ✅ Implemented | Visual bars and efficiency percentage metrics comparing modes. |
| | AI Audit Log Stream | ✅ Implemented | Scrollable terminal log highlighting solver decisions and dispatch orders. |

---

## 🎯 Train Class Profiles

```
🚄 Vande Bharat Express (Priority: 10, Max Speed: 160 km/h)
   - Highest track clearance priority.
   - Zero tolerance for avoidable loop sidings.

🚆 Rajdhani Superfast (Priority: 8, Max Speed: 130 km/h)
   - High passenger priority; prioritizes mainline transit.

🚚 Freight / Goods Train (Priority: 2, Max Speed: 60 km/h)
   - Strategic buffer train.
   - Held in station loop lines during peak overtaking windows.
```
