# Project Aahavaan - Rail: Indian Railways Digital Twin Decision Support Simulation

An end-to-end full-stack Digital Twin simulation and decision support platform designed to optimize train dispatching, resolve track conflicts, and minimize system-wide delays on the Indian Railways network using AI and constraint programming.

---

## 📚 Project Documentation Matrix

| Document | Description |
| :--- | :--- |
| [**MVP Specifications**](docs/mvp_specifications.md) | Minimum Viable Product (MVP) specifications, functional requirements, and benchmarks. |
| [**Transcript & Brainstorming**](docs/transcript.md) | Team discussion, technical brainstorming, and technology selection transcript. |
| [**product.md**](product.md) | Complete unified product specification combining all project dimensions. |
| [**context.md**](context.md) | Complete project context, resolved issues, bug fixes, and development logs. |
| [**./docs/workflow_chart.md**](docs/workflow_chart.md) | End-to-end user journey and system workflow Mermaid flowcharts. |
| [**./docs/FEATURES.md**](docs/FEATURES.md) | Complete feature breakdown with flagship highlights. |
| [**./docs/setup_guide.md**](docs/setup_guide.md) | Installation, configuration, and startup instructions. |
| [**./docs/architecture.md**](docs/architecture.md) | System architecture, FastAPI backend routing, Next.js frontend, and OR-Tools solver. |
| [**./docs/representation.md**](docs/representation.md) | System flow charts, finite state machines (FSM), and visual track representations. |
| [**./docs/api_docs.md**](docs/api_docs.md) | REST API endpoint reference with request and response schemas. |
| [**./docs/database_schema.md**](docs/database_schema.md) | Network topology, train timetable, and telemetry data models. |
| [**./docs/REFERENCES.md**](docs/REFERENCES.md) | Comprehensive academic, industrial, and technical literature references. |

---

## 🚂 Project Mission & Flagship Highlights
- **Look-Ahead Conflict Scanner (60-min Horizon)**: Evaluates oncoming traffic and eliminates bottlenecks before trains physically enter occupied blocks.
- **Google OR-Tools CP-SAT Solver**: Solves disjunctive precedence constraints to minimize priority-weighted total delay.
- **High-Fidelity Discrete Simulation**: Minute-by-minute headless Python engine enforcing track occupancy safety limits.
- **Next.js 15 Control Room Dashboard**: Animated SVG track map, live delay comparison charts (Recharts), and real-time explainable AI dispatch feed.

---

## 📂 Project Structure

```text
Railway/
├── backend/                  # FastAPI & Simulation Backend
│   ├── api/                  # API routes & schemas
│   ├── data/                 # Network & timetable JSON data
│   ├── engine/
│   │   ├── data_gen.py       # Realistic route & train generator
│   │   ├── optimizer.py      # Google OR-Tools CP-SAT conflict solver
│   │   └── simulation.py     # Discrete state manager & ticks
│   ├── main.py               # FastAPI application entry point
│   └── requirements.txt      # Python dependencies
├── control-room/             # Next.js 15 Command Center (Frontend)
│   ├── src/
│   │   ├── app/              # Next.js App Router (page.tsx, globals.css)
│   │   ├── components/       # LiveMap, MetricsSidebar, DecisionLog
│   │   └── lib/              # UI utilities
│   ├── package.json          # Node dependencies
│   └── tailwind.config.ts    # Tailwind styling config
├── docs/                     # Comprehensive documentation suite
│   ├── workflow_chart.md     # Workflow flowcharts
│   ├── FEATURES.md           # Feature breakdown
│   ├── setup_guide.md        # Setup & installation guide
│   ├── architecture.md       # Architecture & mathematical formulations
│   ├── representation.md     # Visual flowcharts & FSM state machines
│   ├── api_docs.md           # REST API endpoint reference
│   ├── database_schema.md    # Data models & schemas
│   ├── mvp_specifications.md # MVP requirements & targets
│   └── transcript.md         # Team discussions & transcript
├── master_blueprint.md       # Master technical blueprint
├── product.md                # Consolidated product file
├── context.md                # Development context & logs
└── README.md                 # Primary project overview
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
