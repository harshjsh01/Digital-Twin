# Minimum Viable Product (MVP) Specifications (`docs/mvp_specifications.md`)

This document outlines the scope, functional requirements, non-functional targets, and validation benchmarks for both **Phase 1 (Proof-of-Concept)** and **Phase 2 (Next-Level Operational Platform)** of **Project Aahavaan - Rail**.

---

## 🎯 1. Objective & Target Audience
- **Core Mission**: Deliver an end-to-end, enterprise-ready Railway Digital Twin and Decision Support System proving that AI-assisted dispatching minimizes total priority-weighted train delay while strictly maintaining a **Zero-Accident Safety Invariant**.
- **Phase 2 Expansion**: Introduces real-world 6-platform junction simulation with outer waiting sidings, Station Master Human-in-the-Loop (HITL) approval workflows, passenger-facing explainable delay logs, and an **RFC HTTP 402 + Algorand Testnet micropayment gateway** for ₹9/month passenger tracking subscriptions.
- **Target Audience**: Railway Sectional Controllers, Station Masters, Commuter Passengers, and Transportation AI Hackathon Evaluators.

---

## 📋 2. Functional Requirements

### FR-1: High-Fidelity Junction & Corridor Topology
- **Phase 1 Baseline**: 8 stations along a 105 km corridor with mainline and dual loop tracks.
- **Phase 2 Target**: High-fidelity central junction station featuring:
  - **6 Dedicated Platform Tracks** (Platforms 1 to 6, each with independent track circuit).
  - **4 Outer Waiting / Holding Tracks** (Holding Sidings located prior to the home signal to buffer trains before entering the throat).
  - Active crossover switch points and 4-aspect signaling heads (Red, Yellow, Double Yellow, Green).

### FR-2: Fleet Diversity & Train Priority Matrix
- Continuous management of 20 to 50 active trains running concurrently:
  1. **Vande Bharat Express**: Priority Weight: `10`, Speed: $160\text{ km/h}$.
  2. **Rajdhani Express**: Priority Weight: `8`, Speed: $130\text{ km/h}$.
  3. **Container Freight**: Priority Weight: `2`, Speed: $60\text{ km/h}$.
- High-density timetable where express trains catch up to slower freight traffic.

### FR-3: Google OR-Tools CP-SAT Station Platform & Holding Solver
- 60-minute lookahead horizon computing disjunctive precedence constraints across platforms $P_1-P_6$ and outer sidings $H_1-H_4$.
- Formulates decision variables for actual departure times and platform tracks.
- **Strict Anti-Collision Guarantee**: $100\%$ zero-collision and zero-deadlock compliance across all simulated ticks.

### FR-4: Station Master Human-in-the-Loop (HITL) Portal
- Real-time radar of approaching trains within 30 minutes.
- Ranked AI recommendation queue with transparent rationale.
- Station Master action deck:
  - `[APPROVE]`: Locks the route, sets switches, and displays Green signal.
  - `[OVERRIDE]`: Allows manual selection of alternative platform or holding track with real-time interlocking safety validation.
  - `[EMERGENCY ALL-RED]`: Instantly sets all signals to danger.

### FR-5: Passenger Web Portal & Explainable Wait Logs
- Consumer search by train number or station.
- Live journey progress stepper and digital speedometer.
- **"Why is My Train Stopped?"** explainable card translating operational dispatch constraints into natural language:
  > *"Held at Outer Holding Track 1 for 6 minutes to grant precedence to Vande Bharat 20901. Expected departure in 4 minutes."*

### FR-6: x402 + Algorand Micropayment Gateway
- Autonomous HTTP 402 Payment Required response when accessing deep telemetry without a pass.
- In-browser Algorand Testnet wallet checkout (`@x402-avm` client / Pera Wallet).
- ₹9 equivalent micro-payment (`100,000` microAlgos) per month.
- On-chain verification via Algorand Testnet indexer issuing 30-day cryptographically signed access tokens.

---

## ⚡ 3. Non-Functional & Performance Benchmarks

| Metric | Target Threshold | Validation Method |
| :--- | :--- | :--- |
| **Solver Latency** | $< 50\text{ms}$ per 60-min horizon | Automated benchmark script (`models/station_optimizer/benchmarks.py`) |
| **Simulation Clock** | $60\text{ Hz}$ physical tick / $500\text{ms}$ discrete tick | WebSocket payload timing audit |
| **Safety Invariant** | **0 Collisions, 0 Deadlocks** | 100,000 continuous tick stress test |
| **Blockchain Finality** | $\approx 3.3\text{ seconds}$ | Algorand Testnet round confirmation |
| **Frontend FPS** | Smooth $60\text{ FPS}$ track animation | Chrome DevTools Performance Profiler |
| **Team Collaboration** | **Zero Git Merge Conflicts** | 4 decoupled directories (`models/`, `backend/`, `frontend/`, `client/`) |
