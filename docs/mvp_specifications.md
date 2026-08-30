# Minimum Viable Product (MVP) Specifications

This document outlines the scope, functional requirements, non-functional targets, and validation benchmarks for the **Project Aahavaan - Rail** Minimum Viable Product (MVP).

---

## 🎯 1. Objective & Target Audience
- **Goal**: Deliver a functional, interactive Digital Twin prototype demonstrating that AI-assisted dispatching minimizes total priority-weighted train delay compared to standard manual FIFO dispatching.
- **Target Audience**: Railway Operations Controllers, Digital Transformation Directors, and Transportation AI Researchers.

---

## 📋 2. Functional Requirements

### FR-1: Corridor & Topology Modeling
- The simulation must model at least **8 railway stations** along a continuous single/multi-block route.
- Each station must possess at least **1 Main Platform Line** and **2 Loop/Siding Lines** capable of holding stationary trains for overtakes.
- Inter-station distance must be parameterized (15 km per segment standard).

### FR-2: Train Fleet & Scheduling
- The simulation must manage at least **20 concurrent trains** categorized into three distinct priority classes:
  1. **Vande Bharat Express** (Priority Weight: 10, Speed: 160 km/h)
  2. **Rajdhani Express** (Priority Weight: 8, Speed: 130 km/h)
  3. **Freight / Goods Train** (Priority Weight: 2, Speed: 60 km/h)
- Timetable must generate realistic bottleneck scenarios where fast trains catch up to slower predecessors.

### FR-3: Simulation Engine
- Discrete time-step execution advancing minute-by-minute ($1 \text{ tick} = 1 \text{ minute}$).
- Hard block-occupancy safety enforcement ($1 \text{ train} / \text{segment}$).
- Delay tracking computing accumulated deviation against scheduled arrival/departure times.

### FR-4: Conflict Detection & Optimization Engine
- 60-minute look-ahead horizon evaluating upcoming track segment requests.
- Google OR-Tools CP-SAT solver formulating precedence constraints to resolve bottlenecks.
- Automated loop line diversion directives issued to freight trains to yield mainline right-of-way.

### FR-5: Control Room Dashboard (Frontend)
- Real-time animated track map visualizing station nodes, segments, and moving train positions.
- Live Delay Comparison widget comparing Unoptimized baseline vs. AI-Optimized metrics.
- Action feed logging transparent AI dispatch decisions in real-time.
- Interactive mode toggle switch (`UNOPTIMIZED` vs. `AI_OPTIMIZED`) and playback control (`HALT` / `RESUME`).

---

## ⚡ 3. Non-Functional Requirements
- **Performance**: Backend solver execution time must not exceed **100ms** per optimization cycle.
- **Frontend Smoothness**: 60 FPS rendering of animated trains with sub-500ms polling latency.
- **Portability**: Monorepo runnable across Windows, Linux, and macOS environments.
- **Modularity**: Fully decoupled engine, API, optimizer, and UI layers.
