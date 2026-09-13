# Project Aahavaan - Rail
### Predictive Railway Decision Support & Command Center

An end-to-end full-stack simulation and predictive decision support platform designed to optimize train dispatching, resolve interlocking conflicts, and minimize network-wide delays on the Indian Railways arterial corridor using AI and constraint programming.

---

## 📚 Project Documentation Matrix

| Document | Description |
| :--- | :--- |
| [**`object.md` (Phase 2 Master Plan)**](https://github.com/harshjsh01/Digital-Twin/blob/main/object.md) | **Next-Level Phase 2 Blueprint**: Reorganized monorepo, 6-Platform Simulator, Station Master Portal, Client Portal with explainable wait logs, x402 + Algorand ₹9/mo payment gateway. |
| [**`docs/file.md` (Complete File Directory)**](https://github.com/harshjsh01/Digital-Twin/blob/main/docs/file.md) | **Exhaustive Technical Directory**: Detailed breakdown of every single file, folder, endpoint, inputs/outputs, real-time data structures, and role in the system. |
| [**MVP Specifications**](https://github.com/harshjsh01/Digital-Twin/blob/main/docs/mvp_specifications.md) | Minimum Viable Product (MVP) specifications, functional requirements, and benchmarks. |
| [**Transcript & Brainstorming**](https://github.com/harshjsh01/Digital-Twin/blob/main/docs/transcript.md) | Team discussion, technical brainstorming, and technology selection transcript. |
| [**product.md**](https://github.com/harshjsh01/Digital-Twin/blob/main/product.md) | Complete unified product specification combining all project dimensions. |
| [**context.md**](https://github.com/harshjsh01/Digital-Twin/blob/main/context.md) | Complete project context, resolved issues, bug fixes, and development logs. |
| [**Workflow Flowcharts**](https://github.com/harshjsh01/Digital-Twin/blob/main/docs/workflow_chart.md) | End-to-end user journey and system workflow Mermaid flowcharts. |
| [**Feature Breakdown & Status**](https://github.com/harshjsh01/Digital-Twin/blob/main/docs/FEATURES.md) | Complete feature breakdown with flagship highlights. |
| [**Setup & Execution Guide**](https://github.com/harshjsh01/Digital-Twin/blob/main/docs/setup_guide.md) | Installation, configuration, and startup instructions. |
| [**System Architecture**](https://github.com/harshjsh01/Digital-Twin/blob/main/docs/architecture.md) | System architecture, FastAPI backend routing, Next.js frontend, and OR-Tools solver. |
| [**Visual Topologies & State Machines**](https://github.com/harshjsh01/Digital-Twin/blob/main/docs/representation.md) | System flow charts, finite state machines (FSM), and visual track representations. |
| [**REST & WebSocket API Docs**](https://github.com/harshjsh01/Digital-Twin/blob/main/docs/api_docs.md) | REST API endpoint reference with request and response schemas (mirrored in `ENDPOINTS.md`). |
| [**Database & Telemetry Schemas**](https://github.com/harshjsh01/Digital-Twin/blob/main/docs/database_schema.md) | Network topology, train timetable, and telemetry data models. |
| [**Academic & Technical References**](https://github.com/harshjsh01/Digital-Twin/blob/main/docs/REFERENCES.md) | Comprehensive academic, industrial, and technical literature references. |

---

## 🚂 Core Narrative & Operational Workflow

AAHAVAAN-RAIL communicates one central operational story:

```
CURRENT NETWORK STATE (10:32 AM)
        ↓
60-MINUTE LOOK-AHEAD SCAN
        ↓
FUTURE CONFLICT DETECTED (C-104 at T+31m, Block B17)
        ↓
DISPATCH OPTIMIZATION (Google OR-Tools CP-SAT)
        ↓
BEST DISPATCH RECOMMENDATION (Hold Train 14632 · 3 min)
        ↓
CONFLICT RESOLVED & SIDING ROUTE LOCKED
        ↓
LOWER NETWORK-WIDE DELAY (18 min → 11 min, -39%)
```

---

## ⚡ Flagship Highlights & Feature Matrix

1. **60-Minute Look-Ahead Conflict Scanner**:
   - Evaluates oncoming traffic and eliminates bottlenecks before trains physically enter occupied blocks.
   - Interactive timeline scrubber with 10-minute milestones and playback speed toggles ($1\times, 2\times, 5\times$).

2. **Google OR-Tools CP-SAT Solver & Dispatch Optimization**:
   - Solves disjunctive precedence constraints in under 50 ms to minimize priority-weighted total delay.
   - Evaluates candidate dispatch options with transparent explainability.

3. **Anti-Collision Interlocking Supervisor**:
   - Failsafe digital interlocking barrier guaranteeing 100% safety and zero route conflicts across all track circuits.

4. **Dedicated 3-Page Application Architecture**:
   - **Command Center (`/`)**: 9-section master storytelling narrative, custom SVG topology visualizer, and corridor dispatch priority-order matrix.
   - **Station Simulator (`/simulator`)**: High-fidelity physical canvas rendering 6 platform tracks, 4 outer waiting tracks, crossover switches (`SW_01A`, `SW_02B`), and 4-aspect signals.
   - **Station Master Portal (`/station-master`)**: Approaching train radar (30-min horizon), CP-SAT recommendation deck, and Human-in-the-Loop action controls (`[APPROVE]`, `[OVERRIDE]`, `[EMERGENCY ALL-RED]`).
   - **Passenger Portal (`/passenger`)**: Public train search, live speedometer, and explainable **"Why is My Train Stopped?"** wait-reason diagnostics.

5. **x402 + Algorand Micropayments**:
   - Native HTTP 402 integration on Algorand Testnet for ₹9/month passenger tracking subscriptions (`github.com/marotipatre/x402-Project`).

---

## 📂 Project Structure

```text
Railway/
├── models/                                      # [ENGINEER 1] AI/ML & CP-SAT Optimization
│   ├── datasets/                                # Raw IR schedules & normalized graphs
│   ├── delay_predictor/                         # Model weights & prediction pipelines
│   └── station_optimizer/                       # Google OR-Tools CP-SAT 6-platform solver
│
├── backend/                                     # [ENGINEER 2] FastAPI Core & Interlocking Safety
│   ├── app/
│   │   ├── api/v1/                              # REST & WebSocket route handlers (/ws/simulator, /ws/station-master)
│   │   ├── core/                                # Simulation engine & state manager
│   │   ├── safety/                              # Anti-Collision interlocking guard
│   │   ├── services/                            # Recommendations & explainable wait logs
│   │   ├── payments/                            # x402 & Algorand verification services
│   │   └── schemas/                             # Shared Pydantic contract schemas
│   ├── data/                                    # Network & timetable JSON data
│   ├── main.py                                  # FastAPI entry point & CORS
│   └── requirements.txt                         # Python dependencies
│
├── src/                                         # [INTEGRATED FRONTEND] Next.js 15 Suite
│   ├── app/
│   │   ├── page.tsx                             # Command Center (9-Section Narrative + Priority List)
│   │   ├── simulator/page.tsx                   # Dedicated Physical Topology Simulator
│   │   ├── station-master/page.tsx              # Station Master HITL Cockpit & Radar
│   │   └── passenger/page.tsx                   # Passenger Portal & Explainable Wait Logs
│   ├── components/                              # Modular canvas, controls, panels, & sections
│   └── lib/api/                                 # Decoupled REST/WebSocket API client & mock fallback
│
├── docs/                                        # Complete Documentation Suite
├── ENDPOINTS.md                                 # REST & WebSocket API Specification Reference
└── README.md                                    # Primary project landing page & doc matrix
```

---

## 🚀 Quick Start

### 1. Launch Backend (FastAPI + CP-SAT Engine)
```bash
cd backend
pip install -r requirements.txt
python main.py
```
*Backend runs at `http://localhost:8000` (Swagger docs: `http://localhost:8000/docs`)*

### 2. Launch Integrated Frontend (Next.js 15 Command Suite)
```bash
npm install
npm run dev
```
*Frontend runs at `http://localhost:3000`*

- **Command Center**: [http://localhost:3000](http://localhost:3000)
- **Station Simulator**: [http://localhost:3000/simulator](http://localhost:3000/simulator)
- **Station Master Portal**: [http://localhost:3000/station-master](http://localhost:3000/station-master)
- **Passenger Portal**: [http://localhost:3000/passenger](http://localhost:3000/passenger)

### 3. Production Build
```bash
npm run build
npm run start
```

---

## 📄 License
This project is developed as part of the AI Architect initiative for Indian Railways Decision Support.
