# Project Aahavaan - Rail: Indian Railways Digital Twin Decision Support Simulation

An end-to-end full-stack Digital Twin simulation and decision support platform designed to optimize train dispatching, resolve track conflicts, and minimize system-wide delays on the Indian Railways network using AI and constraint programming.

---

## 📚 Project Documentation Matrix

| Document | Description |
| :--- | :--- |
| [**`object.md` (Phase 2 Master Plan)**](https://github.com/harshjsh01/Digital-Twin/blob/main/object.md) | **Next-Level Phase 2 Blueprint**: Reorganized monorepo, 6-Platform Simulator, Station Master Portal, Client Portal with explainable wait logs, x402 + Algorand ₹9/mo payment gateway, and 4-person zero-merge-conflict workflow. |
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
| [**REST & WebSocket API Docs**](https://github.com/harshjsh01/Digital-Twin/blob/main/docs/api_docs.md) | REST API endpoint reference with request and response schemas. |
| [**Database & Telemetry Schemas**](https://github.com/harshjsh01/Digital-Twin/blob/main/docs/database_schema.md) | Network topology, train timetable, and telemetry data models. |
| [**Academic & Technical References**](https://github.com/harshjsh01/Digital-Twin/blob/main/docs/REFERENCES.md) | Comprehensive academic, industrial, and technical literature references. |

---

## 🚂 Project Mission & Flagship Highlights
- **Look-Ahead Conflict Scanner (60-min Horizon)**: Evaluates oncoming traffic and eliminates bottlenecks before trains physically enter occupied blocks.
- **Google OR-Tools CP-SAT Solver**: Solves disjunctive precedence constraints to minimize priority-weighted total delay.
- **Station Master Portal & HITL Approval**: Real-time suggestion matrix where the Station Master reviews, approves, or overrides platform and holding track assignments.
- **Anti-Collision Interlocking Supervisor**: Fail-safe digital interlocking barrier guaranteeing 100% safety and zero route conflicts.
- **3 Purpose-Built Frontends**:
  1. *Station Simulator*: 6-Platform station with outer holding tracks, animated turnouts, and dynamic signal aspects.
  2. *Station Commander*: Operational radar feed with AI recommendations and route interlocking controls.
  3. *Passenger Portal*: Public search, live GPS tracking, and *"Why is My Train Stopped?"* explainable wait-reason cards.
- **x402 + Algorand Micropayments**: Native HTTP 402 integration on Algorand Testnet for ₹9/month passenger tracking subscriptions (`github.com/marotipatre/x402-Project`).

---

## 📂 Project Structure

```text
Railway/
├── models/                                      # [ENGINEER 1 DOMAIN] AI/ML & Optimization
│   ├── datasets/
│   │   ├── raw/                                 # Raw historical IR schedules & delay logs
│   │   └── processed/                           # Normalized feature matrices & graph edges
│   ├── delay_predictor/
│   │   └── model_weights/                       # Serialized model checkpoints
│   └── station_optimizer/                       # Google OR-Tools CP-SAT 6-platform solver
│
├── backend/                                     # [ENGINEER 2 DOMAIN] FastAPI & Safety Core
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/                              # REST & WebSocket route handlers
│   │   ├── core/                                # Simulation engine & digital twin state
│   │   ├── safety/                              # Anti-Collision interlocking guard
│   │   ├── services/                            # Recommendations & explainable wait logs
│   │   ├── payments/                            # x402 & Algorand verification services
│   │   └── schemas/                             # Shared Pydantic contract schemas
│   ├── data/                                    # Network & timetable JSON data
│   ├── engine/                                  # Simulation & baseline optimizer engine
│   ├── main.py                                  # FastAPI entry point & CORS
│   └── requirements.txt                         # Python dependencies
│
├── frontend/                                    # [ENGINEER 3 DOMAIN] Industrial Dashboards
│   ├── simulator/                               # 6-Platform Junction + Outer Waiting visualizer
│   └── station-commander/                       # Station Master Operational Radar & HITL cockpit
│
├── client/                                      # [ENGINEER 4 DOMAIN] Passenger Portal & x402
│   └── src/
│       ├── components/                          # Train search, wait reason modal, payment modal
│       ├── lib/                                 # @x402-avm client & Algorand wallet connector
│       ├── types/                               # TypeScript interfaces matching backend schemas
│       └── app/                                 # Passenger web portal layout & pages
│
├── control-room/                                # Next.js 15 Command Center (Working Prototype)
├── docs/                                        # Complete Documentation Suite
│   ├── file.md                                  # Complete file-by-file technical directory
│   ├── workflow_chart.md                        # Mermaid flowcharts & sequence diagrams
│   ├── FEATURES.md                              # Complete feature breakdown & status matrix
│   ├── setup_guide.md                           # Multi-service setup & execution guide
│   ├── architecture.md                          # Architecture & CP-SAT math formulation
│   ├── representation.md                        # Visual topologies & FSM state machines
│   ├── api_docs.md                              # Complete REST & WebSocket API specification
│   ├── database_schema.md                       # Data models, telemetry & SQL schemas
│   ├── REFERENCES.md                            # Academic, IR systems & solver literature
│   ├── mvp_specifications.md                    # MVP targets & verification criteria
│   └── transcript.md                            # Brainstorming transcripts & technical decisions
│
├── master_blueprint.md                          # Foundational blueprint (Phase 1 to Phase 2)
├── object.md                                    # Phase 2 Next-Level Master Blueprint
├── product.md                                   # Consolidated unified product specification
├── context.md                                   # Chronological context & development logs
└── README.md                                    # Primary project landing page & doc matrix
```

---

## 🚀 Quick Start

### 1. Launch Backend (FastAPI + Engine)
```bash
cd backend
pip install -r requirements.txt
python main.py
```
*Backend runs at `http://localhost:8000` (Swagger docs: `http://localhost:8000/docs`)*

### 2. Launch Frontend (Next.js Dashboard)
```bash
cd control-room
npm install
npm run dev
```
*Frontend runs at `http://localhost:3000`*

---

## 📄 License
This project is developed as part of the AI Architect Digital Twin initiative for Indian Railways Decision Support.
