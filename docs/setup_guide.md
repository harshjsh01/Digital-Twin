# Installation, Configuration & Setup Guide

This guide provides step-by-step instructions to install, configure, and execute both the **FastAPI Backend** and the **Next.js Command Center** for **Project Aahavaan - Rail**.

---

## 🛠️ Prerequisites

Ensure the following environments are installed on your host system:
- **Python**: Version `3.10` or higher (`python --version`)
- **Node.js**: Version `18.17.0` or higher (`node -v`)
- **npm**: Version `9.x` or higher (`npm -v`)
- **Git**: For version control

---

## 📦 Repository Structure Overview

```text
Railway/
├── backend/
│   ├── api/                  # API routing and models
│   ├── data/                 # Generated route and timetable JSON files
│   ├── engine/
│   │   ├── data_gen.py       # Mock data generator (8 stations, 20 trains)
│   │   ├── optimizer.py      # Google OR-Tools CP-SAT conflict resolution engine
│   │   └── simulation.py     # Simulation state & tick management
│   ├── main.py               # FastAPI application entry point
│   └── requirements.txt      # Python dependencies
├── control-room/             # Next.js 15 Frontend Command Center
│   ├── src/
│   │   ├── app/              # Next.js App Router (page.tsx, layout.tsx, globals.css)
│   │   ├── components/       # LiveMap, MetricsSidebar, DecisionLog
│   │   └── lib/              # Tailwind and UI utilities
│   ├── package.json          # Node dependencies
│   └── tailwind.config.ts    # Tailwind CSS configuration
├── docs/                     # Full technical documentation suite
├── master_blueprint.md       # Master architectural blueprint
├── product.md                # Consolidated product specification
├── context.md                # Development context & logs
└── README.md                 # Primary project overview
```

---

## 🚀 Step 1: Backend Setup & Execution

### 1.1 Navigate to the Backend Directory
```bash
cd backend
```

### 1.2 Create & Activate a Virtual Environment (Recommended)
```bash
# Windows (PowerShell)
python -m venv venv
.\venv\Scripts\Activate.ps1

# Linux / macOS
python3 -m venv venv
source venv/bin/activate
```

### 1.3 Install Python Dependencies
```bash
pip install -r requirements.txt
```
*(Dependencies: `fastapi`, `uvicorn`, `pandas`, `ortools`, `pydantic`, `python-multipart`)*

### 1.4 Generate Initial Mock Data (Optional / Automatic)
```bash
python engine/data_gen.py
```

### 1.5 Start the FastAPI Service
```bash
python main.py
```
> The backend server will be live and listening on: **`http://localhost:8000`**  
> Interactive Swagger API Documentation: **`http://localhost:8000/docs`**

---

## 💻 Step 2: Frontend Setup & Execution

### 2.1 Navigate to the Frontend Directory
Open a new terminal window:
```bash
cd control-room
```

### 2.2 Install Node.js Dependencies
```bash
npm install
```

### 2.3 Start the Development Server
```bash
npm run dev
```
> The Next.js dashboard will be accessible at: **`http://localhost:3000`**

---

## 🧪 Verification & Health Check

### 1. Verify Backend Health
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/network"
Invoke-RestMethod -Uri "http://localhost:8000/api/state"
```

### 2. Test Optimization Activation via REST
```powershell
Invoke-RestMethod -Method Put -Uri "http://localhost:8000/api/mode?mode=AI_OPTIMIZED"
Invoke-RestMethod -Method Post -Uri "http://localhost:8000/api/simulate/tick"
```

---

## ⚙️ Configuration & Environment Parameters

| Variable / Setting | Default Value | Description |
| :--- | :--- | :--- |
| `API_BASE` | `http://localhost:8000/api` | Base URL used by the Next.js frontend to poll telemetry. |
| `Backend Port` | `8000` | Host port for FastAPI uvicorn runner. |
| `Simulation Tick Interval` | `500ms` | Frontend polling cadence mapping 1 physical tick to 1 minute of simulation time. |
| `Look-Ahead Horizon` | `60 minutes` | Time window analyzed by Google OR-Tools CP-SAT solver. |
