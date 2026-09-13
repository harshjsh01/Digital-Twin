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

### 5. 🏢 Station Master Command & Anti-Collision Interlocking
- **Human-in-the-Loop (HITL) Workflow**: Real-time AI suggestion queue for arriving trains. Station Master reviews, confirms, or manually overrides platform assignments.
- **Fail-Safe Route Interlocking**: Prevents safety hazards, switch point conflicts, and collisions by enforcing digital route locking.
- **Outer Holding Tracks Control**: Dynamically places lower-priority trains in outer holding loops before station throat entry.

### 6. 📱 Passenger Web Portal & Explainable Wait Logs
- **Real-Time GPS Tracking**: Public search for any train by number or name with live running telemetry.
- **"Why is My Train Stopped?" Explainability**: Instant natural-language diagnostics explaining signal holds and precedence overtakes.

### 7. 🔗 x402 + Algorand Blockchain Micropayment Gateway
- **RFC HTTP 402 Standard**: Autonomous web monetization implemented via `@x402-avm` client and Algorand Testnet.
- **₹9/Month Micro-Subscription**: Frictionless 1-click micro-payment settlement delivering 30-day verified passenger access passes.

---

## 📋 Comprehensive Feature Matrix

| Category | Feature | Status | Description |
| :--- | :--- | :--- | :--- |
| **Data Generation** | Realistic Route Generator | ✅ Implemented | Generates 8-station railway network with mainline and dual loop tracks. |
| | Mixed Timetable Generator | ✅ Implemented | Synthesizes 20 active trains across Vande Bharat, Rajdhani, and Freight classes. |
| **Simulation Core** | Minute-by-Minute Ticks | ✅ Implemented | Advances train positions, computes speed transitions, and updates section locks. |
| | Block Occupancy Tracker | ✅ Implemented | Locks and releases block sections dynamically to prevent collisions. |
| | 6-Platform Junction Physics | 🚀 Phase 2 Ready | Physical model of 6 platform tracks plus outer waiting tracks. |
| | Anti-Collision Guard | 🚀 Phase 2 Ready | Hardware-invariant interlocking simulator blocking conflicting route locks. |
| **Optimization Engine** | Conflict Horizon Scanner | ✅ Implemented | Computes time-window overlaps for shared segments. |
| | CP-SAT Solver Integration | ✅ Implemented | Google OR-Tools model minimizing priority-weighted total delay. |
| | Station Platform Allocation | 🚀 Phase 2 Ready | Assigns platforms $P_1-P_6$ or outer loops $H_1-H_4$ based on delay minimization. |
| **Backend REST & WS** | Core Telemetry APIs | ✅ Implemented | Serves `/api/network`, `/api/state`, and simulation controls. |
| | Station Master APIs | 🚀 Phase 2 Ready | `/api/v1/station-master/recommendations` and `/approve` routes. |
| | Passenger Explainability | 🚀 Phase 2 Ready | Generates semantic wait-reason explanations for passenger apps. |
| | x402 Payment Verifier | 🚀 Phase 2 Ready | Verifies on-chain Algorand Testnet transactions and issues 30-day passes. |
| **Frontend Ecosystem** | Control Room Dashboard | ✅ Implemented | Original Phase 1 command center with SVG map and delay widgets. |
| | 6-Platform Visual Simulator | 🚀 Phase 2 Ready | High-fidelity interactive track visualizer with outer holding sidings. |
| | Station Commander Cockpit | 🚀 Phase 2 Ready | Live incoming train radar with one-click AI approval and manual overrides. |
| | Client Passenger Portal | 🚀 Phase 2 Ready | Consumer search, live journey tracking, and x402 Algorand payment modal. |

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
