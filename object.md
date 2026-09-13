# Project Aahavaan - Rail: Phase 2 Next-Level Master Architecture & Execution Blueprint (`object.md`)

---

## 📌 Executive Summary & Strategic Intent

**Project Aahavaan - Rail** is evolving from a Phase 1 proof-of-concept into an **Enterprise-Grade Railway Digital Twin, Decision Support, and Web3 Micropayment Ecosystem**. 

Inspired by the mission defined in `Aahavaan-Rail_x402_Algorand.pptx`, Phase 2 bridges high-fidelity discrete railway simulation, **Google OR-Tools CP-SAT** mathematical constraint optimization, **Anti-Collision Interlocking Safety**, **Human-in-the-Loop (HITL) Station Master Command**, and a decentralized **x402 + Algorand** passenger micropayment subscription portal (`github.com/marotipatre/x402-Project`).

This blueprint defines the architecture, data pipelines, backend services, three distinct frontend applications, blockchain payment mechanics, and a **4-person parallel engineering workflow** engineered for **zero git merge conflicts**.

---

## 🗂️ 0. Monorepo Reorganization & Clean Directory Architecture

Currently, backend logic, models, and UI are co-located in legacy folders (`backend/`, `control-room/`, `src/`). To scale to Phase 2 with a 4-person team, the repository is restructured into four isolated, decoupled domains:

```text
Railway/
├── database/                         # [PERSISTENCE LAYER] - MongoDB Database & Collections
│   ├── __init__.py                   # MongoDB client connection & collection registry
│   ├── users.py                      # User accounts, login credentials & is_premium status
│   ├── subscriptions.py              # 30-day active passenger passes & Algorand proofs
│   ├── audit_logs.py                 # Station Master approval/override audit trail
│   └── wait_logs.py                  # Passenger explainable delay reason history
│
├── models/                           # [ENGINEER 1 DOMAIN] - AI/ML & Optimization
│   ├── datasets/                     # Raw & processed train movement/delay datasets
│   │   ├── raw/                      # Historical IR timetables, COA delay logs, NTES feeds
│   │   ├── processed/                # Normalized feature matrices & graph topologies
│   │   └── synthetic_generator.py    # High-density corridor synthetic delay generator
│   ├── delay_predictor/              # ML Delay Prediction Model (LightGBM / Transformer)
│   │   ├── train.py                  # Model training pipeline
│   │   ├── evaluate.py               # Accuracy evaluation & MAE benchmarking
│   │   └── model_weights/            # Saved checkpoints & serialized models
│   ├── station_optimizer/            # Google OR-Tools CP-SAT Station Platform & Holding Solver
│   │   ├── solver.py                 # Mathematical constraint programming formulation
│   │   ├── constraints.py            # Safety interlocking, platform clearance, headway rules
│   │   └── benchmarks.py             # Stress tests (100k ticks, 0-collision proof)
│   └── README.md                     # Model documentation & training guidelines
│
├── backend/                          # [ENGINEER 2 DOMAIN] - FastAPI & Safety Systems
│   ├── app/
│   │   ├── api/                      # REST & WebSocket API Routers
│   │   │   ├── v1/
│   │   │   │   ├── auth.py           # Passenger account registration, login & JWT auth
│   │   │   │   ├── simulator.py      # Simulator state, track circuits, signal aspect feeds
│   │   │   │   ├── station_master.py # Incoming queue, AI recommendations, HITL approval
│   │   │   │   ├── passenger.py      # Train search, live tracking, explainable wait-reasons
│   │   │   │   └── payments.py       # x402 HTTP verification & Algorand ledger hooks
│   │   │   └── router.py             # Root API router
│   │   ├── core/                     # Simulation Engine & Event Loop
│   │   │   ├── security.py           # Bcrypt hashing & JWT access token management
│   │   │   ├── auth.py               # User authentication dependencies & session resolution
│   │   │   ├── simulation_engine.py  # Discrete-event engine (minute/sub-second ticks)
│   │   │   ├── state_manager.py      # In-memory synchronized digital twin state
│   │   │   └── websocket_manager.py  # Real-time WebSocket connection hub
│   │   ├── safety/                   # Anti-Collision & Interlocking Supervisor
│   │   │   ├── interlocking.py       # Route locking, flank protection, switch verification
│   │   │   ├── collision_guard.py    # Zero-collision fail-safe validator (invariant checker)
│   │   │   └── signal_system.py      # Multi-aspect automatic block signaling (R/Y/YY/G)
│   │   ├── services/                 # Business Logic Services
│   │   │   ├── recommendation_srv.py # Bridges solver outputs to Station Master recommendations
│   │   │   ├── explainability_srv.py # Generates natural language wait-log reasons for clients
│   │   │   └── train_tracking_srv.py # Live position & speed telemetry service
│   │   ├── payments/                 # Algorand & x402 Engine
│   │   │   ├── algorand_client.py    # py-algorand-sdk Testnet connection & indexer client
│   │   │   ├── x402_verifier.py      # HTTP 402 header & transaction verification
│   │   │   └── subscription_db.py    # Active passenger pass database (SQLite/Postgres)
│   │   └── schemas/                  # Pydantic Request/Response Models (Frozen Contract)
│   │       ├── auth.py
│   │       ├── simulation.py
│   │       ├── station.py
│   │       ├── train.py
│   │       └── payment.py
│   ├── main.py                       # FastAPI application entry point & CORS
│   ├── requirements.txt              # Backend dependencies (fastapi, ortools, py-algorand-sdk)
│   └── README.md                     # Backend API & setup instructions
│
├── frontend/                         # [ENGINEER 3 DOMAIN] - Simulator & Station Commander
│   ├── simulator/                    # App 1: 6-Platform Station Physical Simulator
│   │   ├── src/
│   │   │   ├── components/           # 6 Platforms, Outer Waiting Tracks, Animated SVG Trains
│   │   │   ├── hooks/                # WebSocket live simulation stream hook
│   │   │   └── pages/                # Simulator visualizer view
│   │   ├── package.json              # Next.js / Vite React, Tailwind CSS, Framer Motion
│   │   └── README.md                 # Simulator frontend setup guide
│   ├── station-commander/            # App 2: Station Master Operational Control Room
│   │   ├── src/
│   │   │   ├── components/           # Radar feed, AI recommendation list, Approval Deck
│   │   │   ├── hooks/                # Real-time recommendation & override socket
│   │   │   └── pages/                # Station Master Cockpit
│   │   ├── package.json              # Next.js / Tailwind CSS, Lucide icons, Recharts
│   │   └── README.md                 # Station Commander setup guide
│   └── README.md                     # Shared UI components & design system guidelines
│
├── client/                           # [ENGINEER 4 DOMAIN] - Passenger Portal & x402 Algorand
│   ├── src/
│   │   ├── components/
│   │   │   ├── TrainSearch.tsx       # Live train search by number or station
│   │   │   ├── JourneyTimeline.tsx   # Live journey tracker & speed card
│   │   │   ├── WaitReasonModal.tsx   # "Why is my train stopped?" explainable wait card
│   │   │   └── PaymentModal.tsx      # ₹9/mo x402 + Algorand wallet checkout modal
│   │   ├── lib/
│   │   │   ├── x402_client.ts        # @x402-avm client integration
│   │   │   ├── algorand.ts           # Pera / Defly / Testnet wallet connector
│   │   │   └── api.ts                # Client API requests with 402 interceptors
│   │   ├── app/                      # Next.js App Router (Public passenger site)
│   │   └── types/                    # TypeScript interfaces matching backend schemas
│   ├── package.json                  # Next.js, @x402-avm, algosdk, lucide-react, tailwindcss
│   └── README.md                     # Passenger portal & payment gateway setup guide
│
├── docs/                             # Complete project documentation suite (updated per commit)
│   ├── workflow_chart.md             # System workflows & sequence diagrams
│   ├── FEATURES.md                   # Comprehensive feature breakdown
│   ├── setup_guide.md                # Installation & running instructions
│   ├── architecture.md               # Mathematical formulation & component architecture
│   ├── representation.md             # Visual representations, topologies & FSM diagrams
│   ├── api_docs.md                   # Complete REST & WebSocket API specification
│   ├── database_schema.md            # Data models, telemetry, and schemas
│   ├── REFERENCES.md                 # Academic, official railway, and solver literature
│   ├── mvp_specifications.md         # MVP targets and validation criteria
│   └── transcript.md                 # Brainstorming transcripts & technical decisions
│
├── master_blueprint.md               # Master technical blueprint
├── product.md                        # Consolidated product specification
├── context.md                        # Chronological project context & development logs
├── object.md                         # This strategic Phase 2 document
└── README.md                         # Primary project landing page & documentation matrix
```

---

## 🧠 1. Model & Dataset Engineering (High Accuracy & Optimization)

To transition from synthetic mock scripts to a production-grade predictive and optimization engine, we establish a robust dataset pipeline and a **hybrid neuro-symbolic modeling architecture**.

```
+-----------------------------------------------------------------------------------------+
|                               MODELING ARCHITECTURE PIPELINE                            |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|   1. DATASET LAYER                                                                      |
|      - Real Indian Railways Schedules (10,000+ trains, 8,000+ stations)                 |
|      - Historical Delay Distributions (CRIS COA / NTES patterns)                        |
|      - High-Density Corridor Synthetic Stress Generator (Fog, Freight surges, Failures) |
|                                           │                                             |
|                                           ▼                                             |
|   2. PREDICTIVE TIER (Machine Learning Delay Estimator)                                 |
|      - LightGBM / Temporal Fusion Transformer                                           |
|      - Features: Priority, length, preceding headway, sectional gradient, weather       |
|      - Outputs: Dynamic Estimated Time of Arrival (ETA) with uncertainty bounds         |
|                                           │                                             |
|                                           ▼                                             |
|   3. OPTIMIZATION TIER (Google OR-Tools CP-SAT Solver)                                  |
|      - Lookahead: 60-minute continuous sliding window                                   |
|      - Decision Variables: Platform Allocation $P_{t} \in \{1..6\}$,                      |
|                            Outer Holding Siding $H_{t} \in \{1..4\}$,                   |
|                            Departure Time $D_{t, s}$                                    |
|      - Hard Constraints: 0 Collisions, Disjunctive Track Locks, Signaling Headway       |
|      - Objective: $\min \sum (Priority_t \times Delay_t) + HoldingPenalty$              |
|                                           │                                             |
|                                           ▼                                             |
|   4. SAFETY AUDIT TIER                                                                  |
|      - Mathematical verification of 0 deadlocks and 0 route conflicts                    |
|      - Output: Ranked platform selection list sent to Station Commander                 |
|                                                                                         |
+-----------------------------------------------------------------------------------------+
```

### 1.1 Dataset Acquisition & Synthesis
- **Historical Indian Railways Timetables**: Sourced from public IR timetable repositories, containing station codes, route kilometers, halts, platform lines, and scheduled run times.
- **Sectional Delay Profile Generator (`models/datasets/synthetic_generator.py`)**:
  - Models realistic delay distributions (Weibull and Gamma distributions) for goods trains, mail/express, and superfast services.
  - Simulates high-density trunk routes (e.g., Delhi–Kanpur, Howrah–Delhi) with 60+ trains/day, mixing 160 km/h Vande Bharat trains, 130 km/h Rajdhani expresses, and 60 km/h freight convoys.
- **Feature Matrix**:
  - `Train_Type`, `Priority_Weight` (1 to 10), `Section_Distance_KM`, `Max_Permissible_Speed`, `Scheduled_Dwell_Min`, `Current_Delay_Min`, `Outer_Signal_Queue_Depth`, `Platform_Occupancy_State`.

### 1.2 Mathematical Formulation for 6-Platform Station & Outer Holding Tracks
At a junction station with 6 platforms ($P_1, \dots, P_6$) and outer holding tracks ($H_1, \dots, H_4$):

1. **Platform Assignment Variable**:
   $$x_{t, p} \in \{0, 1\} \quad \forall t \in \text{Trains}, p \in \{1, \dots, 6\}$$
   Each train entering the station must occupy exactly one platform:
   $$\sum_{p=1}^{6} x_{t, p} = 1 \quad \forall t \text{ entering station}$$

2. **Outer Waiting / Holding Track Assignment**:
   $$h_{t, k} \in \{0, 1\} \quad \forall t \in \text{Trains}, k \in \{1, \dots, 4\}$$
   If platforms are congested, lower priority trains are routed to hold at outer track $k$ before entering.

3. **No Overlapping Platform Occupancy (Single Track Platform Constraint)**:
   For any two trains $t_1, t_2$ assigned to platform $p$:
   $$D_{t_1} \le A_{t_2} \quad \lor \quad D_{t_2} \le A_{t_1}$$
   Enforced via boolean reification in CP-SAT:
   $$b_{t_1, t_2} \implies D_{t_1} + \text{ClearanceBuffer} \le A_{t_2}$$
   $$\neg b_{t_1, t_2} \implies D_{t_2} + \text{ClearanceBuffer} \le A_{t_1}$$

4. **Zero-Accident Invariant (Anti-Collision Guarantee)**:
   $$\text{Occupancy}(Track_j, Time_\tau) \le 1 \quad \forall j \in \{\text{Segments, Loops, Platforms}\}, \forall \tau$$

5. **Optimization Objective**:
   $$\min \sum_{t \in T} \left( Priority_t \times \max(0, D_t - \text{SchedDept}_t) \right) + \sum_{t \in T, k} \left( HoldingCost \times h_{t, k} \right)$$

### 1.3 Target Performance & Accuracy Benchmarks
- **ETA Prediction Accuracy**: Mean Absolute Error (MAE) $< 1.2 \text{ minutes}$.
- **Throughput Gain**: $> 22\%$ reduction in passenger-weighted delays vs. manual FIFO.
- **Safety Invariant**: $100\%$ zero-collision and zero-deadlock compliance across $100,000$ simulated stress minutes.
- **Inference & Solving Speed**: $< 45\text{ms}$ execution time on standard CPU hardware.

---

## ⚡ 2. Backend Architecture & Enterprise Features

The backend acts as the authoritative truth engine, decoupling raw computation from interface consumers.

```
+---------------------------------------------------------------------------------------+
|                               FASTAPI BACKEND ARCHITECTURE                            |
+---------------------------------------------------------------------------------------+
|                                                                                       |
|   [API LAYER]                                                                         |
|   ├── /api/v1/auth             -> Passenger registration, login, JWT token issuance   |
|   ├── /api/v1/simulator        -> Track circuits, switch points, signal aspects       |
|   ├── /api/v1/station-master   -> Live train radar, AI suggestions, HITL approvals    |
|   ├── /api/v1/passenger        -> Train search, live tracking, explainable wait logs  |
|   └── /api/v1/payments         -> x402 HTTP 402 challenge & Algorand verification     |
|                                                                                       |
|   [SERVICES & BRAIN]                                                                  |
|   ├── State Manager            -> Synchronized 1-second physical clock & 1-min sim    |
|   ├── Recommendation Engine    -> Solves optimal platform & holding queue             |
|   ├── Explainability Engine    -> Converts track constraints into plain English logs  |
|   ├── Safety Interlocking      -> Fail-safe route locking & anti-collision barrier    |
|   └── Auth & User Security     -> Bcrypt password encryption & JWT identity tokens    |
|                                                                                       |
|   [PERSISTENCE & BLOCKCHAIN]                                                          |
|   ├── MongoDB Database Layer   -> Users, subscriptions, audit logs & wait records     |
|   ├── Algorand Testnet Client  -> Validates transaction hashes & ASA tokens           |
|   └── GoPlausible Facilitator  -> Verifies HTTP 402 settlements                       |
|                                                                                       |
+---------------------------------------------------------------------------------------+
```

### 2.1 Station Master Human-in-the-Loop (HITL) Workflow
1. As trains approach within 25 km of the 6-platform station, the backend registers them in the **Approaching Train Queue**.
2. The optimization solver computes the optimal platform assignment ($P_1 - P_6$) or outer holding track ($H_1 - H_4$).
3. The backend publishes a recommendation payload to the Station Commander via WebSocket:
   ```json
   {
     "recommendation_id": "REC_9021",
     "train_id": "T_12301",
     "train_name": "Rajdhani Express",
     "priority": 8,
     "recommended_action": "ROUTE_TO_PLATFORM",
     "target_platform": "PLATFORM_2",
     "alternative_action": "HOLD_AT_OUTER_1",
     "reasoning": "Platform 2 is vacated by Train 12402 in 3 mins. Clears cross-over throat for oncoming Vande Bharat.",
     "safety_interlock_approved": true,
     "status": "PENDING_STATION_MASTER_APPROVAL"
   }
   ```
4. **Approval & Manual Override**:
   - If the Station Master clicks **[Approve]**: Route is locked, signal turns Green, points are set.
   - If the Station Master clicks **[Override to Platform 4]**: The Safety Interlocking Supervisor immediately validates whether Platform 4 is empty and free of conflicting conflicting routes. If safe, the change is applied; if unsafe, the system rejects the command with a prominent alert: `INTERLOCKING CONFLICT: Platform 4 occupied by Freight 7002`.

### 2.2 Explainable AI Reasoning Engine for Passengers (Wait Logs)
When a train is stopped at an outer signal, station loop, or platform, passengers typically experience frustration due to lack of visibility. The backend translates mathematical constraints into human-understandable context:
- *Template Generator*:
  `"Your train {train_name} ({train_id}) is currently held at {location} for approximately {duration} minutes. Reason: Precedence granted to higher-priority {conflicting_train_name} to clear single-track bottleneck. Expected departure: {est_departure}."`

### 2.3 Backend Payment Verification & Subscription Management
- Validates the incoming header `X-Payment-Proof` against Algorand Testnet.
- Checks whether the sender transferred `₹9` worth of microAlgos (e.g., 0.1 ALGO) to the official treasury wallet.
- Stores active subscriptions in `subscription_db` mapped to the user's Algorand wallet address, issuing an auth token valid for 30 days.

### 2.4 Passenger Authentication, MongoDB Persistence & Premium Access Tier
To support account management and persistent premium privileges across devices:
- **MongoDB Database**: Connected via the root `database/` folder (`aahavaan_rail` database).
- **Users Collection**: Stores passenger login credentials with bcrypt hashing (`hashed_password`), unique usernames/emails, linked Algorand wallet addresses, and `is_premium` status.
- **Access Control & Telemetry Gate**:
  - Registered passengers login via `/api/v1/auth/login` to receive a signed JWT token.
  - When accessing deep telemetry (`/api/v1/passenger/train/{id}/why-stopped`), passengers with `is_premium: true` gain instant unlocked access.
  - Standard passengers (`is_premium: false`) or unauthenticated visitors are presented with the RFC HTTP 402 challenge, with 1-click checkout on Algorand Testnet.
  - Verified on-chain transactions automatically update the user's `is_premium` flag to `true` in MongoDB.

### 2.5 System Health, Latency Diagnostics & Global Error Handling
To ensure high-availability monitoring and failsafe operations:
- **Root Discovery (`GET /`)**: Returns service metadata, OpenAPI docs links, and operational status.
- **Healthcheck & Latency (`GET /healthcheck`, alias `GET /health`)**: Continuously monitors the FastAPI gateway and MongoDB cluster, measuring and reporting processing and database ping round-trip latency in milliseconds (`latency_ms`).
- **Global Uncaught Exception Handler**: Intercepts unhandled runtime errors in `backend/main.py`, preserving HTTP status codes and headers while formatting runtime exceptions into structured JSON error models (`500 Internal Server Error`).

---

## 🖥️ 3. The Three Frontend Applications Breakdown

Phase 2 replaces the single monolithic view with **three purpose-built web applications**.

```
+---------------------+    +-------------------------+    +-----------------------+
| 1. STATION SIMULATOR |    | 2. STATION COMMANDER    |    | 3. PASSENGER PORTAL   |
| (Physical Topology) |    | (Operational Cockpit)   |    | (Client Web + x402)   |
+---------------------+    +-------------------------+    +-----------------------+
| - 6 Platforms       |    | - Live Train Radar      |    | - Search Train        |
| - Outer Wait Tracks |    | - AI Ranked Suggestions |    | - Live Speed/Location |
| - Dynamic Switches  |    | - 1-Click Approve/Divert|    | - "Why Are We Halted?"|
| - Signal Aspects    |    | - Interlock Status Locks|    | - ₹9/mo Algorand Sub  |
+---------------------+    +-------------------------+    +-----------------------+
```

### 3.1 App 1: Station Digital Twin Simulator (`frontend/simulator`)
- **Visual Canvas / SVG Map**:
  - **Station Throat & Layout**: 6 parallel platform tracks numbered 1 through 6.
  - **Outer Waiting Area**: 4 designated outer holding sidings (Waiting Track 1–4) located before the home signals where lower-priority trains wait safely.
  - **Animated Switches & Turnouts**: Visual points that physically animate when a train is routed between mainline and loops.
  - **Signal Heads**: Tri-color dynamic aspect indicators (Red = Stop, Yellow = Caution, Double Yellow = Attention, Green = Clear).
  - **Live Trains**: Color-coded train consists (Vande Bharat = Royal Blue, Rajdhani = Red/Gold, Freight = Slate Grey).

### 3.2 App 2: Station Commander / Master Portal (`frontend/station-commander`)
- **Operations Radar**: Live list of trains approaching the station within 30 minutes, showing current block, ETA, speed, and priority tier.
- **AI Recommendation Stream**: Card-based interface showing the AI's real-time suggestions:
  - *"Assign Freight 5012 to Outer Holding Track 2 (Wait: 8 min)"*
  - *"Assign Vande Bharat 20901 to Platform 1 (Mainline Clear)"*
- **Action Deck**:
  - `[APPROVE SUGGESTION]` (Green button - triggers signal aspect progression).
  - `[MANUAL OVERRIDE]` (Dropdown selection of Platform 1–6 or Outer 1–4).
  - `[EMERGENCY ALL-RED]` (Immediately trips all entry signals to danger).
- **Interlocking Guard Panel**: Real-time visualization of route locking. Shows locked routes in bright cyan, pending routes in flashing yellow, and occupied blocks in amber.

### 3.3 App 3: Passenger Client Portal (`client/`)
- **Clean Consumer UI**: Optimized for mobile and desktop passenger tracking.
- **Train Search Bar**: Search by train number (e.g. `12301`) or name (e.g. `Rajdhani Express`).
- **Real-Time Journey Tracker**: Displays distance traveled, current speed (km/h), next station, and ETA.
- **"Why is My Train Stopped?" Explainability Card**:
  - If a train speed drops to 0 km/h or enters an outer waiting track, a prominent card appears explaining the exact dispatch rationale with estimated clearance time.
- **₹9 / Month Premium Tracking Subscription**:
  - Unlocks detailed delay logs, historical punctuality stats, and priority alert notifications.
  - Handled seamlessly through **x402 + Algorand** wallet integration.

---

## 💳 4. Payment Gateway Implementation: x402 + Algorand Integration

As highlighted in Slide 9 of `Aahavaan-Rail_x402_Algorand.pptx` and the reference implementation at `github.com/marotipatre/x402-Project`, the subscription gateway is built upon the **RFC HTTP 402 Payment Required** standard settled on the **Algorand blockchain**.

```
+-----------------------------------------------------------------------------------------+
|                        x402 + ALGORAND SUBSCRIPTION PAYMENT LIFECYCLE                   |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|   1. REQUEST                                                                            |
|      Passenger requests premium live train diagnostics / explainable wait reason.       |
|      Client -> GET /api/v1/passenger/train/12301/deep-telemetry                         |
|                                           │                                             |
|                                           ▼                                             |
|   2. 402 PAYMENT REQUIRED                                                               |
|      Backend recognizes unauthenticated / unpaid session.                               |
|      Backend -> HTTP 402 Payment Required                                               |
|      Headers:                                                                           |
|        X-Payment-Address: ALGORAND_TREASURY_WALLET_ADDRESS                              |
|        X-Payment-Amount: 100000 (0.1 ALGO ~ ₹9 equivalent)                              |
|        X-Payment-Network: algorand-testnet                                              |
|        X-Payment-Facilitator: GoPlausible-AVM-Facilitator                               |
|                                           │                                             |
|                                           ▼                                             |
|   3. AUTONOMOUS / 1-CLICK WALLET SIGNING                                                |
|      Client application invokes `@x402-avm` client / Pera Wallet / Testnet Provider.     |
|      User approves 0.1 ALGO micro-transaction.                                          |
|      Transaction broadcast to Algorand Testnet (LoRA).                                  |
|                                           │                                             |
|                                           ▼                                             |
|   4. SETTLEMENT & ON-CHAIN VERIFICATION                                                 |
|      Algorand blockchain confirms block with ~3.3 second finality.                      |
|      Client retries request with header: `X-Payment-Proof: <ALGORAND_TX_ID>`            |
|      Backend verifies transaction on Algorand Indexer via GoPlausible Facilitator.      |
|                                           │                                             |
|                                           ▼                                             |
|   5. ACCESS GRANTED & SUBSCRIPTION TOKEN ISSUED                                         |
|      Backend issues 30-day cryptographically signed subscription token.                 |
|      Premium diagnostic data delivered to passenger portal.                             |
|                                                                                         |
+-----------------------------------------------------------------------------------------+
```

### 4.1 Client Package Dependencies
In `client/package.json`:
```json
{
  "dependencies": {
    "@x402-avm": "latest",
    "algosdk": "^2.7.0",
    "@perawallet/connect": "^1.3.4",
    "lucide-react": "^0.475.0",
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
```

### 4.2 Backend Payment Verification (`backend/app/payments/x402_verifier.py`)
```python
from algosdk.v2client import indexer
import os

ALGORAND_INDEXER_URL = "https://testnet-idx.algonode.cloud"
TREASURY_ADDRESS = os.getenv("ALGORAND_TREASURY_ADDRESS", "AAHAVAAN_RAIL_TESTNET_ADDRESS...")
EXPECTED_MICRO_ALGOS = 100000 # 0.1 ALGO (~Rs. 9 equivalent)

class X402AlgorandVerifier:
    def __init__(self):
        self.indexer_client = indexer.IndexerClient("", ALGORAND_INDEXER_URL)

    def verify_payment(self, tx_id: str) -> bool:
        try:
            tx_info = self.indexer_client.transaction(tx_id)
            tx = tx_info.get("transaction", {})
            payment = tx.get("payment-transaction", {})
            
            receiver = payment.get("receiver")
            amount = payment.get("amount")
            confirmed_round = tx.get("confirmed-round")
            
            if receiver == TREASURY_ADDRESS and amount >= EXPECTED_MICRO_ALGOS and confirmed_round > 0:
                return True
            return False
        except Exception as e:
            print(f"Algorand payment verification error: {e}")
            return False
```

---

## 👥 5. 4-Person Concurrent Team Workflow & Zero-Merge-Conflict Plan

To guarantee that 4 developers work simultaneously with **zero git merge conflicts**, complete autonomy, and full working interoperability, the work is strictly partitioned into distinct directory boundaries with **frozen API and schema contracts**.

### 5.1 Responsibility Matrix & Directory Ownership

| Developer | Core Role | Isolated Directory | Primary Responsibilities |
| :--- | :--- | :--- | :--- |
| **Engineer 1** | AI, Dataset & Optimization Lead | `/models/` | Ingest Indian Railways timetable datasets; build ML delay predictor; formulate Google OR-Tools CP-SAT 6-platform + outer holding solver; export model inference functions. |
| **Engineer 2** | Backend & Safety Systems Lead | `/backend/` | Implement FastAPI REST & WebSocket routes; build simulation state loop; develop Anti-Collision & Interlocking Supervisor; build wait-reason explainability generator. |
| **Engineer 3** | Station & Commander Frontend Lead | `/frontend/` | Build 6-platform station simulator canvas with animated tracks/signals; build Station Master operational cockpit with live radar, AI recommendation list, and HITL approve/override buttons. |
| **Engineer 4** | Client Web & x402 Blockchain Lead | `/client/` | Build passenger-facing portal; implement live train search and wait-reason modal; integrate `@x402-avm` client and Algorand Testnet wallet for ₹9/month subscription micropayments. |

### 5.2 The "Zero Merge Conflict" Technical Invariants
1. **Directory Boundary Isolation**: No engineer edits files outside their designated folder (`/models`, `/backend`, `/frontend`, `/client`).
2. **Contract-First Development**:
   - `backend/app/schemas/` defines the official Pydantic models.
   - These schemas are mirrored as TypeScript interfaces in `frontend/src/types/` and `client/src/types/`.
   - Once committed on Day 1, schema changes require a cross-team consensus meeting.
3. **Mock Data Fallbacks**:
   - Engineers 3 and 4 can use mock JSON files matching the contract if Engineer 2 is updating backend endpoints, preventing blocking dependencies.
4. **Git Branching Strategy**:
   - `main`: Protected production branch (always green and functional).
   - `feature/p1-models`: Engineer 1 branch.
   - `feature/p2-backend-safety`: Engineer 2 branch.
   - `feature/p3-simulator-commander`: Engineer 3 branch.
   - `feature/p4-client-x402`: Engineer 4 branch.
   - Merges into `main` occur via Pull Requests (PRs) after end-to-end integration tests pass.

### 5.3 Mandatory Documentation & Codebase Protocol
- **Every Commit Must Update Documentation**:
  Whenever an engineer modifies an API, adds a component, or updates a solver parameter, they are required to update the corresponding document in `/docs/` (e.g., `api_docs.md`, `architecture.md`, `FEATURES.md`, `object.md`) in the *same commit*.
- **Pre-PR Reading Requirement**:
  Before opening any PR or merging branches, every team member must read the updated `/docs/` files to verify that all interface contracts, port mappings, and data formats remain fully aligned.

---

## 📅 6. Step-by-Step Implementation Roadmap

```
+---------------------------------------------------------------------------------------+
| PHASE 2 IMPLEMENTATION TIMELINE                                                       |
+---------------------------------------------------------------------------------------+
|                                                                                       |
|   MILESTONE 1: Scaffolding & Contract Freezing (Hours 1 - 4)                          |
|   - Reorganize monorepo into /models, /backend, /frontend, /client                    |
|   - Publish Pydantic & TypeScript contract schemas                                    |
|   - Initialize Git feature branches for all 4 team members                            |
|                                                                                       |
|   MILESTONE 2: Autonomous Core Construction (Hours 5 - 16)                            |
|   - Eng 1: Build 6-platform + outer holding CP-SAT solver in /models                  |
|   - Eng 2: Build FastAPI state loop, interlocking supervisor, and wait-log generator  |
|   - Eng 3: Build 6-platform visual canvas & Station Commander radar UI                |
|   - Eng 4: Build passenger train search UI & x402 Algorand checkout modal             |
|                                                                                       |
|   MILESTONE 3: System Integration & Live Connecting (Hours 17 - 22)                   |
|   - Connect Simulator & Commander to Backend WebSockets                               |
|   - Connect Client Portal to Explainability & x402 Verification endpoints             |
|   - Conduct test transactions on Algorand Testnet                                     |
|                                                                                       |
|   MILESTONE 4: Stress Testing, Demo Rehearsal & Submission (Hours 23 - 24)             |
|   - Run 100k-tick stress test (verify 0 collisions, 0 deadlocks)                      |
|   - Validate ₹9 payment verification flow live on Algorand Testnet                    |
|   - Finalize documentation matrix, update README, and deploy to GitHub                |
|                                                                                       |
+---------------------------------------------------------------------------------------+
```

---

## 🎯 Verification & Sign-Off Checklist
- [x] Master Blueprint `object.md` drafted and approved.
- [ ] Monorepo structure reorganized into `/models`, `/backend`, `/frontend`, `/client`.
- [ ] Model dataset synthesis and 6-platform CP-SAT solver operational.
- [ ] FastAPI backend with WebSocket feeds and Anti-Collision Interlocking ready.
- [ ] 6-Platform Simulator and Station Commander operational.
- [ ] Client passenger portal with x402 + Algorand ₹9/month subscription verified on Testnet.
- [ ] Full documentation updated across `/docs` and synced to GitHub repository.
