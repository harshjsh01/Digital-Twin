# Project Aahavaan - Rail: Complete Unified Product Specification (`product.md`)

---

## 📖 Table of Contents
1. [Executive Summary & Vision](#1-executive-summary--vision)
2. [Problem Statement & Operational Bottlenecks](#2-problem-statement--operational-bottlenecks)
3. [Phase 1 MVP vs. Phase 2 Next-Level Scope](#3-phase-1-mvp-vs-phase-2-next-level-scope)
4. [System Architecture & 4-Domain Monorepo Layout](#4-system-architecture--4-domain-monorepo-layout)
5. [The Three Purpose-Built Frontends](#5-the-three-purpose-built-frontends)
6. [Mathematical Modeling, Google OR-Tools & Anti-Collision Safety](#6-mathematical-modeling-google-or-tools--anti-collision-safety)
7. [Passenger Portal, Explainable AI & Wait Logs](#7-passenger-portal-explainable-ai--wait-logs)
8. [Payment Gateway: x402 Protocol + Algorand Testnet Settlement](#8-payment-gateway-x402-protocol--algorand-testnet-settlement)
9. [REST & WebSocket API Gateway Specifications](#9-rest--websocket-api-gateway-specifications)
10. [Data Models, Telemetry & Relational Schemas](#10-data-models-telemetry--relational-schemas)
11. [Multi-Service Setup & Verification Guide](#11-multi-service-setup--verification-guide)
12. [4-Person Concurrent Team Workflow & Zero Merge Conflicts](#12-4-person-concurrent-team-workflow--zero-merge-conflicts)
13. [Technical References, Academic Literature & Precedents](#13-technical-references-academic-literature--precedents)

---

## 1. Executive Summary & Vision
**Project Aahavaan - Rail** is a full-stack Indian Railways Digital Twin Decision Support and Passenger Telemetry Platform. It integrates high-fidelity discrete-event physical simulation, **Google OR-Tools CP-SAT** constraint optimization, **Digital Anti-Collision Route Interlocking**, a **Human-in-the-Loop (HITL) Station Master Operational Radar**, and an **RFC HTTP 402 + Algorand Testnet micropayment gateway** for ₹9/month passenger tracking subscriptions (`github.com/marotipatre/x402-Project`).

---

## 2. Problem Statement & Operational Bottlenecks
Manual First-In, First-Out (FIFO) clearing by sectional controllers causes high-speed express trains (*Vande Bharat*, *Rajdhani*) to become trapped behind lower-speed freight traffic. Section controllers lack holistic 60-minute lookahead optimization to pre-emptively divert freight trains into station loops or outer holding sidings. Simultaneously, passengers stranded during signal holds suffer from a total lack of transparency regarding why their train is stationary. Project Aahavaan solves both operational dispatching and passenger transparency through predictive AI and Web3 micro-monetization.

---

## 3. Phase 1 MVP vs. Phase 2 Next-Level Scope

| Dimension | Phase 1 (Proof-of-Concept) | Phase 2 (Next-Level Operational Platform) |
| :--- | :--- | :--- |
| **Topology** | 8 basic stations with single mainline & 2 loops. | Central Junction with **6 dedicated platform lines** + **4 outer waiting sidings**. |
| **Dispatch Mode** | Batch comparison (Unoptimized vs. AI-Optimized). | **Real-time HITL Station Master portal** with live approve/override controls. |
| **Safety System** | Basic segment occupancy locking. | **Failsafe digital interlocking supervisor** guaranteeing 0 collisions. |
| **User Interfaces** | 1 monolithic Next.js command center. | **3 dedicated frontends**: Physical Simulator, Station Commander, Passenger Portal. |
| **Passenger Features** | None. | Train search, live journey tracking, and explainable **"Why is My Train Stopped?"** wait logs. |
| **Monetization** | None. | **x402 protocol + Algorand Testnet** micropayments (₹9/mo subscription pass). |

---

## 4. System Architecture & 4-Domain Monorepo Layout
The project is strictly partitioned into four independent, decoupled domains:
1. **`/models/`** (Engineer 1): Datasets, LightGBM delay predictor, Google OR-Tools CP-SAT 6-platform solver.
2. **`/backend/`** (Engineer 2): FastAPI v1 APIs, simulation state engine, safety interlocking guard, explainability engine.
3. **`/frontend/`** (Engineer 3): 6-Platform Station Simulator (`frontend/simulator`) and Station Commander Portal (`frontend/station-commander`).
4. **`/client/`** (Engineer 4): Mobile-first passenger portal (`client/`) with `@x402-avm` Algorand wallet checkout.

---

## 5. The Three Purpose-Built Frontends
1. **Station Digital Twin Simulator (`frontend/simulator/`)**:
   - High-fidelity physical canvas rendering **6 platform tracks** and **4 outer holding sidings**.
   - Dynamic switch points and 4-aspect signal heads (Red, Yellow, Double Yellow, Green).
2. **Station Commander Operational Portal (`frontend/station-commander/`)**:
   - Operational radar feed of approaching trains within 30 minutes.
   - AI-ranked platform suggestions with one-click **[Approve]** and manual **[Override]** controls.
3. **Passenger Client Portal (`client/`)**:
   - Consumer search by train number or name.
   - Interactive journey timeline and live digital speedometer.
   - **"Why is My Train Stopped?"** card explaining signal holds and precedence overtakes.

---

## 6. Mathematical Modeling, Google OR-Tools & Anti-Collision Safety
- **Constraint Programming Formulation**:
  $$\min \sum_{t \in T} \left( Priority_t \times \max(0, D_t - \text{SchedDept}_t) \right) + \sum_{t \in T, h \in H} \left( \lambda_{\text{hold}} \times W_t \cdot x_{t, h} \right)$$
- **Subject to**:
  - Single-track platform occupancy: $\theta_{t_1, t_2, p} \implies D_{t_1} + \Delta_{\text{clear}} \le A_{t_2}$.
  - Throat switch headway spacing and platform length constraints.
  - Zero-accident invariant: $\text{Occupancy}(Track_r, Time_\tau) \le 1$ across all tracks at all times.

---

## 7. Passenger Portal, Explainable AI & Wait Logs
When a train speed drops to zero at an outer signal or station siding, the explainability service inspects active interlocking route locks and outputs plain English:
> *"Train 12301 (Rajdhani Express) is currently held at Outer Holding Track 1 for 6 minutes to allow Vande Bharat Express (Train 20901) to enter Platform 1 clear of the crossover throat. Expected departure in 4 minutes."*

---

## 8. Payment Gateway: x402 Protocol + Algorand Testnet Settlement
- Compliant with **RFC HTTP 402 Payment Required** and `@x402-avm` client specification (`github.com/marotipatre/x402-Project`).
- Deep delay diagnostics and explainable wait logs require a ₹9/month Aahavaan Pass.
- Settled in `0.1 ALGO` (`100,000` microAlgos) on **Algorand Testnet** with ~3.3 second block finality.
- Backend verifies on-chain transaction hash, updates SQLite subscription database, and unlocks telemetry.

---

## 9. REST & WebSocket API Gateway Specifications
- Complete documentation available in [`docs/api_docs.md`](file:///c:/Users/harsh/Downloads/Railway/docs/api_docs.md).
- Endpoints span `/api/v1/simulator/*`, `/api/v1/station-master/*`, `/api/v1/passenger/*`, and `/api/v1/payments/*`.
- WebSockets: `/ws/simulator` (60Hz physical updates) and `/ws/station-master` (bi-directional HITL channel).

---

## 10. Data Models, Telemetry & Relational Schemas
- Complete schemas available in [`docs/database_schema.md`](file:///c:/Users/harsh/Downloads/Railway/docs/database_schema.md).
- Defines raw/synthetic timetable datasets, real-time kinematic states, 6-platform physical layout, and SQL tables (`subscriptions`, `station_master_audit_log`, `passenger_wait_logs`).

---

## 11. Multi-Service Setup & Verification Guide
- Complete guide available in [`docs/setup_guide.md`](file:///c:/Users/harsh/Downloads/Railway/docs/setup_guide.md).
- Runs backend on port `8000`, Simulator on port `3000`, Station Commander on port `3001`, and Passenger Client on port `3002`.

---

## 12. 4-Person Concurrent Team Workflow & Zero Merge Conflicts
- Complete role allocation defined in [`object.md`](file:///c:/Users/harsh/Downloads/Railway/object.md).
- Enforces strict directory isolation (`/models`, `/backend`, `/frontend`, `/client`), contract-first schema freezing, and mandatory documentation updates on every commit.

---

## 13. Technical References, Academic Literature & Precedents
- Complete bibliography available in [`docs/REFERENCES.md`](file:///c:/Users/harsh/Downloads/Railway/docs/REFERENCES.md).
- Encompasses CRIS COA/FOIS, Corman & Meng (2015), D'Ariano et al. (2007), Google OR-Tools CP-SAT, and Algorand LoRA testnet.
