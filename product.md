# Project Aahavaan - Rail: Complete Product Specification

---

## 📖 Table of Contents
1. [Executive Summary & Vision](#1-executive-summary--vision)
2. [Problem Statement & Market Rationale](#2-problem-statement--market-rationale)
3. [MVP Specifications & Requirements](#3-mvp-specifications--requirements)
4. [System Architecture & Mathematical Engine](#4-system-architecture--mathematical-engine)
5. [End-to-End Workflows & User Journey](#5-end-to-end-workflows--user-journey)
6. [Complete Feature Breakdown](#6-complete-feature-breakdown)
7. [REST API Documentation](#7-rest-api-documentation)
8. [Data Models & Schema Reference](#8-data-models--schema-reference)
9. [Installation & Setup Guide](#9-installation--setup-guide)
10. [Development Logs & Retrospective](#10-development-logs--retrospective)

---

## 1. Executive Summary & Vision
**Project Aahavaan - Rail** is a full-stack Indian Railways Digital Twin Decision Support prototype. It integrates a discrete-event simulation engine with a Google OR-Tools CP-SAT mathematical optimization solver and a Next.js 15 Command Center. The system provides real-time conflict detection and automated resolution, enabling railway sectional controllers to eliminate cascading delays caused by slower traffic bottlenecks.

---

## 2. Problem Statement & Market Rationale
Under standard operating procedures, railway dispatchers manage single-track and double-track corridors using local heuristics and First-In, First-Out (FIFO) clearing. When high-speed express trains (*Vande Bharat*, *Rajdhani*) enter a section behind heavy freight trains, dispatchers lack the holistic look-ahead horizon required to pre-emptively hold freight trains in station loops. This leads to substantial delay penalties, passenger dissatisfaction, and reduced corridor throughput. Project Aahavaan solves this with predictive, priority-weighted constraint optimization.

---

## 3. MVP Specifications & Requirements
- **Network Corridor**: 8 railway stations with 1 mainline and 2 loop lines each.
- **Train Fleet**: 20 active trains across Vande Bharat (160 km/h), Rajdhani (130 km/h), and Freight (60 km/h) classes.
- **Simulation Engine**: 1-minute discrete tick resolution with strict single-occupancy safety blocks.
- **Optimization Horizon**: 60-minute look-ahead window.
- **Control Room UI**: Real-time interactive SVG track map, live delay comparison chart, and explainable AI decision feed.

---

## 4. System Architecture & Mathematical Engine
- **Backend**: Python, FastAPI, Pandas, Google OR-Tools CP-SAT.
- **Frontend**: Next.js 15, React, Tailwind CSS, Recharts, Framer Motion.
- **Mathematical Formulation**:
  $$\min \sum_{t \in \text{Trains}} \left( P_t \times \text{CumulativeDelay}_t \right)$$
  Subject to:
  $$D_{t, s} \ge d^{\text{sched}}_{t, s}$$
  $$D_{t_1, s} + T^{\text{travel}}_{t_1, b} \le D_{t_2, s} \quad (\text{if } \theta_{t_1, t_2, b} = 1)$$

---

## 5. End-to-End Workflows & User Journey
1. Controller launches the dashboard and reviews initial network topology and train schedules.
2. Controller starts simulation playback in either `UNOPTIMIZED` (manual baseline) or `AI_OPTIMIZED` mode.
3. In AI mode, the OR-Tools solver evaluates impending block conflicts across the 60-minute window.
4. When a conflict is predicted, the engine issues dispatch instructions routing slower trains into station loop lines.
5. The Next.js dashboard updates track positions, charts cumulative delay savings, and logs explainable dispatch actions.

---

## 6. Complete Feature Breakdown
- **Look-Ahead Conflict Scanner**: Scans 60 minutes ahead to detect block contention.
- **Precedence-Constrained Solver**: Optimizes departure sequences to maximize punctuality of express trains.
- **Dynamic Track Visualization**: Animated SVG map rendering train velocities and station nodes.
- **Live Delay Analytics**: Real-time side-by-side Recharts comparing manual vs. optimized metrics.
- **Explainable Decision Feed**: Audit trail of every automated siding hold and priority overtake.

---

## 7. REST API Documentation
- `GET /api/network`: Retrieves static topological data for stations and segments.
- `GET /api/state`: Retrieves instantaneous train telemetry (coordinates, speeds, delays).
- `PUT /api/mode`: Toggles between `UNOPTIMIZED` and `AI_OPTIMIZED` modes.
- `POST /api/simulate/tick`: Advances the simulation by one discrete minute.
- `POST /api/simulate/start` / `POST /api/simulate/stop`: Controls simulation execution.

---

## 8. Data Models & Schema Reference
- **Station Schema**: Unique ID, name, 2D coordinates, platform count, loop track count.
- **Segment Schema**: Origin/destination station IDs, length in km, max speed limit, capacity.
- **Train Schema**: Identifier, service class, priority weight (1-10), speed curve, scheduled timetable.

---

## 9. Installation & Setup Guide
1. **Backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   python main.py
   ```
2. **Frontend**:
   ```bash
   cd control-room
   npm install
   npm run dev
   ```
3. Access Dashboard at `http://localhost:3000`.

---

## 10. Development Logs & Retrospective
- Completed in 4 strict architectural phases (Blueprint, Data Layer/API, Optimization Engine, Next.js UI).
- Successfully validated sub-25ms solver execution and 60 FPS frontend animations.
- All code and documentation synchronized on GitHub.
