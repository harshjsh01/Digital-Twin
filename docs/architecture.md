# System Architecture & Technical Specifications (`docs/architecture.md`)

This document outlines the software architecture, component separation, communication protocols, mathematical design patterns, and Web3 micropayment integration for **Project Aahavaan - Rail (Indian Railways Digital Twin)**.

---

## 🏛️ High-Level System Architecture

```text
+---------------------------------------------------------------------------------------------------------+
|                                  PROJECT AAHAVAAN - PHASE 2 ARCHITECTURE                                |
+---------------------------------------------------------------------------------------------------------+
|                                                                                                         |
|   +--------------------------+   +-------------------------------+   +-------------------------------+  |
|   | 1. STATION SIMULATOR     |   | 2. STATION COMMANDER          |   | 3. PASSENGER CLIENT PORTAL    |  |
|   | (6-Platform Track Canvas)|   | (Operational Radar & HITL)    |   | (Search, Wait Logs, x402 Sub) |  |
|   +--------------------------+   +-------------------------------+   +-------------------------------+  |
|                 ▲                               ▲                                    ▲                  |
|                 │ WebSocket /ws/simulator       │ WebSocket /ws/station-master       │ REST /x402       |
|                 └───────────────────────────────┼────────────────────────────────────┘                  |
|                                                 ▼                                                       |
|                               +------------------------------------+                                    |
|                               |       FastAPI REST & WS Engine     |                                    |
|                               +------------------------------------+                                    |
|                                                 ▲                                                       |
|                        ┌────────────────────────┼────────────────────────┐                              |
|                        ▼                        ▼                        ▼                              |
|          +--------------------------+ +--------------------+ +------------------------+                 |
|          | Anti-Collision Guard     | | In-Memory Digital  | | x402 & Algorand Client |                 |
|          | & Digital Interlocking   | | Twin State Manager | | (Testnet Finality ~3s) |                 |
|          +--------------------------+ +--------------------+ +------------------------+                 |
|                        ▲                        ▲                                                       |
|                        └────────────────────────┼────────────────────────┐                              |
|                                                 ▼                        ▼                              |
|                               +------------------------------------+ +------------------------+         |
|                               | Google OR-Tools CP-SAT Solver      | | ML Delay Predictor     |         |
|                               | (6-Platform + Outer Holding Tracks)| | (LightGBM / TFT Model) |         |
|                               +------------------------------------+ +------------------------+         |
|                                                                                                         |
+---------------------------------------------------------------------------------------------------------+
```

---

## 🧩 Component Breakdown & Domain Ownership

### 1. `/models/` — Machine Learning & Optimization Engine
- **Delay Prediction Tier**: Predicts expected section traversal times under varying congestion levels using LightGBM and Temporal Fusion Transformers.
- **CP-SAT Mathematical Solver**: Formulates the 6-platform allocation and outer holding sidings assignment problem across a 60-minute continuous horizon.

### 2. `/backend/` — State Management, Safety & APIs
- **Simulation State Engine**: Maintains sub-second physical simulation (for visual train animation) and minute-by-minute discrete event ticks.
- **Safety Interlocking Supervisor**: Fail-safe software barrier acting as digital interlocking. Conflicting route locks are mathematically prohibited, ensuring a **zero-accident invariant**.
- **Explainable Reasoning Service**: Translates complex operational constraints into plain-English wait logs.
- **x402 Algorand Service**: Interfaces with the Algorand Testnet Indexer and GoPlausible Facilitator to verify on-chain settlements.

### 3. `/frontend/` — Dual Industrial Operational Interfaces
- **`frontend/simulator/`**: Interactive canvas rendering 6 platform lines, 4 outer waiting tracks, switch points, and multi-aspect signals.
- **`frontend/station-commander/`**: Operational radar interface for the Station Master with one-click AI recommendation approvals and manual overrides.

### 4. `/client/` — Consumer Web Application
- Mobile-first passenger portal providing real-time train search, live speed and location telemetry, explainable wait-reason cards, and ₹9/month subscription checkout via `@x402-avm` and Algorand Testnet.

---

## 🧮 Mathematical Formulation: 6-Platform Junction with Outer Holding Sidings

The station dispatch problem is formulated as a **Disjunctive Precedence Scheduling Problem with Multi-Track Alternative Routing**.

### 1. Sets & Indices
- $T$: Set of trains approaching the station $\{t_1, t_2, \dots, t_N\}$.
- $P$: Set of 6 platform tracks $\{P_1, P_2, P_3, P_4, P_5, P_6\}$.
- $H$: Set of 4 outer waiting / holding tracks $\{H_1, H_2, H_3, H_4\}$.
- $R = P \cup H$: All assignable tracks at the station.

### 2. Decision Variables
- $x_{t, r} \in \{0, 1\}$: Binary variable indicating if train $t$ is assigned to track $r \in R$.
- $A_{t} \in [0, T_{\max}]$: Actual arrival time of train $t$ at its assigned track.
- $D_{t} \in [A_{t} + \text{MinDwell}_t, T_{\max}]$: Actual departure time of train $t$.
- $W_{t} \ge 0$: Outer holding duration (0 if routed directly to platform).
- $\theta_{t_1, t_2, r} \in \{0, 1\}$: Boolean indicator establishing precedence between train $t_1$ and $t_2$ on shared track $r$.

### 3. Constraints

#### A. Unique Track Assignment
Every train must be assigned to either an outer holding track or directly to a platform:
$$\sum_{r \in R} x_{t, r} = 1 \quad \forall t \in T$$

#### B. Single-Occupancy Disjunctive Track Constraints
If two trains $t_1, t_2$ are both assigned to the same track $r$ ($x_{t_1, r} = 1$ and $x_{t_2, r} = 1$):
$$D_{t_1} + \text{ClearanceBuffer} \le A_{t_2} \quad \lor \quad D_{t_2} + \text{ClearanceBuffer} \le A_{t_1}$$
Enforced via boolean reification in Google OR-Tools CP-SAT:
$$\theta_{t_1, t_2, r} \implies D_{t_1} + \Delta_{\text{clear}} \le A_{t_2}$$
$$\neg \theta_{t_1, t_2, r} \implies D_{t_2} + \Delta_{\text{clear}} \le A_{t_1}$$

#### C. Throat Switch Locking & Headway Spacing
Consecutive movements through the throat cross-over must maintain minimum headway:
$$|A_{t_1} - A_{t_2}| \ge \text{HeadwayMin} \quad (\text{if movements share throat points})$$

#### D. Failsafe Anti-Collision Invariant
$$\text{Occupancy}(Track_r, Time_\tau) \le 1 \quad \forall r \in R, \forall \tau \in [0, T_{\max}]$$

### 4. Objective Function
Minimize total passenger-weighted delay and avoidable outer siding holds:
$$\min \sum_{t \in T} \left( Priority_t \times \max(0, D_t - \text{SchedDept}_t) \right) + \sum_{t \in T, h \in H} \left( \lambda_{\text{hold}} \times W_t \cdot x_{t, h} \right)$$
Where:
- $Priority_t = 10$ for Vande Bharat, $8$ for Rajdhani, $2$ for Freight.
- $\lambda_{\text{hold}}$ is the penalty weight for holding a train at an outer track.

---

## ⛓️ Blockchain Settlement Layer: x402 + Algorand Testnet

```text
[Client Application] ──(Request Deep Telemetry)──► [FastAPI Gateway]
                     ◄──(HTTP 402 Payment Required)
                     [Headers: Address, 100k microAlgos, Network]
          │
[Pera / Defly Wallet via @x402-avm]
          │ (0.1 ALGO Micro-Transaction)
          ▼
[Algorand Testnet (LoRA)] ──(Confirmed Round ~3.3s)──► [FastAPI Verifier]
                                                              │
[Client Receives 30-Day JWT Pass] ◄───────────────────────────┘
```
- **Transaction Cost**: 0.001 ALGO network fee.
- **Latency**: Algorand Pure Proof of Stake (PPoS) delivers finality in ~3.3 seconds without soft forks.
