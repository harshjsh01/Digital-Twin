# Project Aahavaan - Rail: Complete File-by-File Technical Directory (`docs/file.md`)

This document provides an exhaustive, production-grade technical specification for **every single file and folder** across the Phase 2 architecture of **Project Aahavaan - Rail (Indian Railways Digital Twin, Decision Support & x402 Algorand Platform)**.

---

## 🌳 Complete System File Tree

```text
Railway/
├── models/                                      # [ENGINEER 1 DOMAIN] AI/ML & Optimization
│   ├── datasets/
│   │   ├── raw/                                 # Raw historical IR schedules & delay CSV/JSON
│   │   ├── processed/                           # Normalized feature matrices & graph edges
│   │   └── synthetic_generator.py               # Corridor traffic & delay distribution generator
│   ├── delay_predictor/
│   │   ├── train.py                             # ML delay model training script (LightGBM/TFT)
│   │   ├── evaluate.py                          # Metric validation (MAE, RMSE, R² scores)
│   │   └── model_weights/                       # Serialized model checkpoints (.bin / .onnx)
│   ├── station_optimizer/
│   │   ├── solver.py                            # Google OR-Tools CP-SAT 6-platform solver
│   │   ├── constraints.py                       # Interlocking, headway, safety math constraints
│   │   └── benchmarks.py                        # Solver stress tests (100k ticks, 0-collision proof)
│   └── README.md                                # Engineer 1 setup & model training guide
│
├── backend/                                     # [ENGINEER 2 DOMAIN] FastAPI & Safety Core
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── simulator.py                 # REST & WS for 6-platform physical simulation
│   │   │   │   ├── station_master.py            # Incoming radar feed & HITL approval endpoints
│   │   │   │   ├── passenger.py                 # Public train search & explainable wait logs
│   │   │   │   └── payments.py                  # HTTP 402 challenge & Algorand verification
│   │   │   └── router.py                        # Root API router assembling v1 routes
│   │   ├── core/
│   │   │   ├── simulation_engine.py             # Discrete tick scheduler (sub-second & minute)
│   │   │   ├── state_manager.py                 # In-memory synchronized digital twin state
│   │   │   └── websocket_manager.py             # High-concurrency WebSocket broadcaster
│   │   ├── safety/
│   │   │   ├── interlocking.py                  # Digital route locking & switch point verifier
│   │   │   ├── collision_guard.py               # Fail-safe invariant verifier (0-collision rule)
│   │   │   └── signal_system.py                 # 4-aspect signaling machine (R, Y, YY, G)
│   │   ├── services/
│   │   │   ├── recommendation_srv.py            # Connects CP-SAT solver to Station Commander
│   │   │   ├── explainability_srv.py            # Natural-language wait-reason semantic engine
│   │   │   └── train_tracking_srv.py            # GPS & block coordinate tracking service
│   │   ├── payments/
│   │   │   ├── algorand_client.py               # py-algorand-sdk Testnet indexer connection
│   │   │   ├── x402_verifier.py                 # RFC HTTP 402 header & on-chain tx validator
│   │   │   └── subscription_db.py               # SQLite/Postgres passenger subscription ledger
│   │   └── schemas/
│   │       ├── simulation.py                    # Pydantic schemas for simulator feeds
│   │       ├── station.py                       # Pydantic schemas for 6 platforms & loops
│   │       ├── train.py                         # Pydantic schemas for trains & schedules
│   │       └── payment.py                       # Pydantic schemas for x402 Algorand transactions
│   ├── main.py                                  # FastAPI application entry point, CORS, lifecycle
│   ├── requirements.txt                         # Backend dependencies (FastAPI, OR-Tools, algosdk)
│   └── README.md                                # Engineer 2 backend installation & setup guide
│
├── frontend/                                    # [ENGINEER 3 DOMAIN] Simulator & Station Commander
│   ├── simulator/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── StationCanvas.tsx            # SVG/Canvas rendering 6 platforms & 4 outer tracks
│   │   │   │   ├── TrainObject.tsx              # Animated train sprites with priority styling
│   │   │   │   ├── SwitchPoint.tsx              # Visual turnout switch points (Normal / Reverse)
│   │   │   │   ├── SignalHead.tsx               # Dynamic LED signal heads (R, Y, YY, G)
│   │   │   │   └── PlaybackControls.tsx         # Play, Pause, Speedup (1x, 5x, 20x), Reset
│   │   │   ├── hooks/
│   │   │   │   └── useSimulatorSocket.ts        # WebSocket listener for sub-second track updates
│   │   │   ├── pages/
│   │   │   │   └── index.tsx                    # Station Physical Visualizer primary page
│   │   │   ├── package.json                     # Vite/Next.js React dependencies
│   │   │   └── README.md                        # Simulator setup & run guide
│   ├── station-commander/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── IncomingRadar.tsx            # Real-time list of trains entering 30-min horizon
│   │   │   │   ├── AIRecommendationCard.tsx     # Ranked suggestions: Platform 1-6 vs Outer 1-4
│   │   │   │   ├── ApprovalDeck.tsx             # One-click [APPROVE], [OVERRIDE], [ALL-RED]
│   │   │   │   ├── InterlockingMonitor.tsx      # Visual route lock status (Cyan/Yellow/Amber)
│   │   │   │   └── StationMetrics.tsx           # Punctuality score, platform utilization %
│   │   │   ├── hooks/
│   │   │   │   └── useCommanderSocket.ts        # Bi-directional WebSocket for HITL approvals
│   │   │   ├── pages/
│   │   │   │   └── index.tsx                    # Station Master Cockpit main view
│   │   │   ├── package.json                     # Next.js / Tailwind CSS / Lucide / Recharts
│   │   │   └── README.md                        # Station Commander portal setup guide
│   └── README.md                                # Shared UI design system & token definitions
│
├── client/                                      # [ENGINEER 4 DOMAIN] Passenger Portal & x402 Algorand
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx                       # Header with Algorand wallet connection badge
│   │   │   ├── TrainSearch.tsx                  # Train search input by train number or station code
│   │   │   ├── JourneyTimeline.tsx              # Stations timeline with real-time train pin
│   │   │   ├── SpeedTelemetry.tsx               # Speedometer & current section limit indicator
│   │   │   ├── WaitReasonModal.tsx              # "Why is my train stopped?" explainable modal
│   │   │   ├── SubscriptionBanner.tsx           # ₹9/month premium tracking CTA banner
│   │   │   └── PaymentModal.tsx                 # x402 Algorand Testnet wallet checkout modal
│   │   ├── lib/
│   │   │   ├── x402_client.ts                   # @x402-avm client for autonomous HTTP 402 handling
│   │   │   ├── algorand.ts                      # Pera, Defly, & Algorand Testnet wallet connectors
│   │   │   └── api.ts                           # Axios API client with automatic 402 interceptors
│   │   ├── app/
│   │   │   ├── layout.tsx                       # Root passenger layout
│   │   │   └── page.tsx                         # Passenger homepage
│   │   ├── types/
│   │   │   └── passenger.ts                     # TypeScript interfaces matching backend schemas
│   │   ├── package.json                         # Next.js, @x402-avm, algosdk, framer-motion
│   │   └── README.md                            # Passenger portal setup & payment testing guide
│
├── docs/                                        # Complete Documentation Suite (Updated per commit)
│   ├── file.md                                  # This exhaustive file-by-file specification
│   ├── workflow_chart.md                        # Mermaid flowcharts for all workflows
│   ├── FEATURES.md                              # Complete feature breakdown & status matrix
│   ├── setup_guide.md                           # Multi-service installation & startup instructions
│   ├── architecture.md                          # Architectural principles & CP-SAT math formulation
│   ├── representation.md                        # Visual topology, 6 platforms, & FSM models
│   ├── api_docs.md                              # Complete REST & WebSocket API specification
│   ├── database_schema.md                       # Data models, telemetry, and schemas
│   ├── REFERENCES.md                            # Academic, IR systems, & solver citations
│   ├── mvp_specifications.md                    # MVP targets & verification criteria
│   └── transcript.md                            # Brainstorming transcripts & technical decisions
│
├── master_blueprint.md                          # Master technical blueprint
├── product.md                                   # Consolidated product specification
├── context.md                                   # Chronological project context & development logs
├── object.md                                    # Strategic Phase 2 Next-Level Master Blueprint
└── README.md                                    # Primary project landing page & documentation matrix
```

---

## 📦 SECTION 1: `/models/` — AI/ML & Optimization (Engineer 1)

### 1. `models/datasets/raw/`
- **Role**: Storage directory for raw Indian Railways historical data.
- **Contents**:
  - `ir_timetables_raw.csv`: Public timetable dataset containing ~12,000 trains with station codes, sequence IDs, arrival/departure times, distance (km), and train types.
  - `coa_historical_delays.csv`: Sample Centre for Railway Information Systems (CRIS) Control Office Application delay logs across Northern and North Central Railway corridors.
  - `weather_and_fog_seasonality.csv`: Monthly seasonal visibility and speed restriction coefficients across northern trunk routes.

### 2. `models/datasets/processed/`
- **Role**: Transformed, normalized datasets ready for model training and simulation ingestion.
- **Contents**:
  - `normalized_timetables.parquet`: Feature-engineered timetable with numeric priority scores (1–10), scheduled travel speed (km/h), and dwell times.
  - `junction_graph_edges.json`: Adjacency matrix of 6 platform lines, 4 outer waiting tracks, cross-overs, and headway clearance distances.

### 3. `models/datasets/synthetic_generator.py`
- **Role**: Synthetic high-density corridor traffic and disturbance generator.
- **Purpose**: Produces edge-case scenarios where express trains encounter heavy freight queues, signal failures, or fog-induced speed restrictions.
- **Inputs**: Number of stations (e.g., 8), number of trains (20 to 100), disturbance factor (0.0 to 1.0).
- **Outputs**: Generates dynamic `network.json` and `timetable.json` files for backend testing.
- **Key Functions**:
  - `generate_corridor_timings(train_count=30)`: Samples Poisson arrival times at outer station boundaries.
  - `inject_random_delays(severity="high")`: Applies Gamma-distributed delays to freight and local trains.
  - `export_dataset(output_dir)`: Exports formatted Parquet and JSON files to `models/datasets/processed/`.

### 4. `models/delay_predictor/train.py`
- **Role**: Machine Learning training script for ETA and delay deviation prediction.
- **Architecture**: LightGBM Regressor paired with a Temporal Fusion Transformer (TFT) baseline.
- **Features Extracted**: `train_priority`, `scheduled_dwell`, `preceding_headway`, `section_gradient`, `current_delay`, `weather_severity`, `time_of_day`.
- **Target Variable**: `actual_delay_at_next_station_min`.
- **Outputs**: Serialized model checkpoint in `models/delay_predictor/model_weights/lgbm_delay_v2.bin`.

### 5. `models/delay_predictor/evaluate.py`
- **Role**: Independent validation script for testing model accuracy.
- **Metrics Computed**: Mean Absolute Error (MAE), Root Mean Squared Error (RMSE), and R² score.
- **Target Thresholds**: MAE $< 1.2\text{ minutes}$, with 95% of high-priority express predictions within $\pm 2$ minutes.

### 6. `models/delay_predictor/model_weights/`
- **Role**: Directory containing trained model artifacts (`.bin`, `.onnx`) and feature scaler parameter files.

### 7. `models/station_optimizer/solver.py`
- **Role**: Core Google OR-Tools CP-SAT solver for the 6-platform junction station and outer waiting sidings.
- **Class**: `StationCPModelSolver`
- **Inputs**:
  - Station layout: 6 platform tracks ($P_1 - P_6$), 4 outer holding tracks ($H_1 - H_4$).
  - Train fleet: List of trains within a 60-minute arrival window.
- **Outputs**:
  - Optimal assignment dictionary: `{train_id: {"assigned_track": "PLATFORM_3", "outer_wait_min": 0, "target_departure": 142}}`.
- **Algorithm**: Constraint Programming with SAT solver (`cp_model.CpSolver()`).
  - Solves the disjunctive platform locking constraints and minimize weighted delay:
    $$\min \sum \left( Priority_t \times Delay_t \right) + \sum \left( HoldingPenalty \times OuterWait_t \right)$$

### 8. `models/station_optimizer/constraints.py`
- **Role**: Reusable constraint definitions imported by `solver.py`.
- **Functions**:
  - `add_platform_disjunction_constraints(model, train_intervals)`: Enforces that no two trains share the same platform track simultaneously.
  - `add_headway_constraints(model, trains, min_headway_min=3)`: Enforces safe 3-minute spacing between consecutive movements through station throat cross-overs.
  - `add_outer_holding_constraints(model, trains, outer_tracks=4)`: Routes low-priority freight to outer loops when all platforms are occupied.

### 9. `models/station_optimizer/benchmarks.py`
- **Role**: Automated stress-testing script validating safety and speed.
- **Execution**: Runs 100,000 simulated minutes under varying saturation levels (100% to 180% capacity).
- **Checks**: Asserts 0 collisions, 0 deadlock cycles, and solver runtime $< 50\text{ms}$.

### 10. `models/README.md`
- **Role**: Setup guide for Engineer 1 covering dataset download, Python environment, training instructions, and how to run solver benchmarks.

---

## ⚙️ SECTION 2: `/backend/` — FastAPI & Safety Systems (Engineer 2)

### 1. `backend/app/api/v1/simulator.py`
- **Role**: API router providing data to the 6-Platform Physical Simulator.
- **Endpoints**:
  - `GET /api/v1/simulator/layout`: Returns 6 platforms, 4 outer waiting tracks, switches, and signal coordinates.
  - `GET /api/v1/simulator/state`: Returns instantaneous coordinates, occupied track circuits, and active switch points.
  - `POST /api/v1/simulator/control/tick`: Steps the discrete simulation forward by $\Delta t$.
  - `POST /api/v1/simulator/control/playback`: Updates playback state (`speed: 1x | 5x | 20x`, `is_paused: bool`).
  - `WebSocket /ws/simulator`: Streams 60 Hz coordinate and signal aspect updates to `frontend/simulator`.

### 2. `backend/app/api/v1/station_master.py`
- **Role**: API router for Station Master operational control and Human-in-the-Loop decision approvals.
- **Endpoints**:
  - `GET /api/v1/station-master/radar`: Returns list of trains approaching within the 30-minute look-ahead window.
  - `GET /api/v1/station-master/recommendations`: Returns the latest AI-generated platform/holding recommendations.
  - `POST /api/v1/station-master/action/approve`: Approves an AI recommendation tuple:
    - **Request Body**: `{"recommendation_id": "REC_104", "train_id": "T_12301", "assigned_track": "PLATFORM_2"}`
    - **Response**: `{"status": "ROUTE_LOCKED", "signal_aspect": "GREEN", "switch_alignment": "NORMAL"}`
  - `POST /api/v1/station-master/action/override`: Manual override of a platform assignment with safety validation.
  - `POST /api/v1/station-master/action/emergency-all-red`: Immediate fail-safe emergency command setting all signals to Red.
  - `WebSocket /ws/station-master`: Real-time bi-directional channel for recommendation alerts and approval broadcasts.

### 3. `backend/app/api/v1/passenger.py`
- **Role**: Public API for passenger client web portal.
- **Endpoints**:
  - `GET /api/v1/passenger/train/search?q={query}`: Searches trains by train number (e.g. `12301`) or name (e.g. `Rajdhani`).
  - `GET /api/v1/passenger/train/{train_id}/status`: Public real-time tracking (speed, next station, delay).
  - `GET /api/v1/passenger/train/{train_id}/why-stopped`: **"Why is My Train Stopped?"** explainability endpoint.
    - Protected by x402 payment verification.
    - Returns structured wait log explaining signal holds, precedence overtakes, and expected departure time.

### 4. `backend/app/api/v1/payments.py`
- **Role**: Handles x402 HTTP challenges and Algorand Testnet verification.
- **Endpoints**:
  - `GET /api/v1/payments/pricing`: Returns ₹9 subscription details and equivalent microAlgos on Testnet.
  - `POST /api/v1/payments/verify-proof`: Validates Algorand transaction hash (`tx_id`) submitted in `X-Payment-Proof`.
    - Verifies on-chain settlement, registers 30-day pass in `subscription_db`, and returns signed JWT token.
  - `GET /api/v1/payments/subscription-status`: Checks if a passenger's Algorand wallet has an active 30-day pass.

### 5. `backend/app/api/router.py`
- **Role**: Assembles and prefixes all v1 routers under `/api/v1`.

### 6. `backend/app/core/simulation_engine.py`
- **Role**: High-fidelity discrete-event simulation core.
- **Logic**:
  - Advances simulation clock minute-by-minute (or sub-second for physical animation).
  - Updates train velocity curves, braking distances, platform dwell counters, and block section entries/exits.
  - Interacts with the Safety Collision Guard before permitting any train to enter a block.

### 7. `backend/app/core/state_manager.py`
- **Role**: In-memory single-source-of-truth state container.
- **Data Held**:
  - Track occupancy dictionary: `{track_id: occupant_train_id | None}`.
  - Train states: Position ($x, y, \text{km}$), speed, delay, assigned platform, dwell remaining.
  - Switch states: Normal vs. Reverse.
  - Signal aspects: Green, Double Yellow, Yellow, Red.

### 8. `backend/app/core/websocket_manager.py`
- **Role**: High-performance async connection manager for WebSockets.
- **Methods**:
  - `connect(ws, channel)`: Registers client under `simulator`, `station_master`, or `passenger`.
  - `broadcast(channel, payload)`: Sends sub-second updates without blocking FastAPI event loop.

### 9. `backend/app/safety/interlocking.py`
- **Role**: Software simulation of British / Indian Railways Solid State Interlocking (SSI).
- **Functions**:
  - `request_route_lock(train_id, route_id)`: Attempts to lock entry switch points, fouling points, and platform track.
  - `release_route_lock(train_id, route_id)`: Frees points once train clears track circuit.
  - `is_route_conflicting(route_a, route_b)`: Mathematically verifies whether two routes share common track points.

### 10. `backend/app/safety/collision_guard.py`
- **Role**: Fail-safe anti-collision invariant verifier.
- **Responsibility**: Runs before every tick. If an attempt is made to move a train into an occupied track or opposing route, it trips the emergency brake, sets signals to Red, and records a safety violation. Ensures **0-collision guarantee**.

### 11. `backend/app/safety/signal_system.py`
- **Role**: 4-Aspect signaling state machine.
- **States**:
  - `RED`: Next block occupied; stop immediately.
  - `YELLOW`: Next block clear, but block after is occupied; proceed with caution.
  - `DOUBLE_YELLOW`: Two blocks clear; prepare to reduce speed at next signal.
  - `GREEN`: Three or more blocks clear; proceed at line speed.

### 12. `backend/app/services/recommendation_srv.py`
- **Role**: Bridges the OR-Tools CP-SAT solver from `models/station_optimizer/solver.py` into the FastAPI service.
- **Functions**:
  - `generate_station_master_recommendations()`: Feeds arriving trains into solver, collects optimal platform/outer track choices, and packages them into clean approval cards for the Station Master.

### 13. `backend/app/services/explainability_srv.py`
- **Role**: Explainable AI semantic text generator for passenger wait reasons.
- **Functions**:
  - `generate_wait_explanation(train_id)`: Inspects conflicting track locks and produces plain-English explanations:
    > *"Train 12301 is held at Outer Holding Track 2 for 5 minutes. Reason: Precedence granted to Vande Bharat Express (Train 20901) to enter Platform 1. Estimated departure in 3 minutes."*

### 14. `backend/app/services/train_tracking_srv.py`
- **Role**: Live train telemetry provider.
- **Functions**:
  - `get_train_telemetry(train_id)`: Computes current km position, speed, next stop, and delay for passenger queries.

### 15. `backend/app/payments/algorand_client.py`
- **Role**: Algorand blockchain client using `py-algorand-sdk`.
- **Functions**:
  - `get_transaction_details(tx_id)`: Fetches transaction metadata from Algorand Testnet Indexer (`https://testnet-idx.algonode.cloud`).
  - `validate_recipient_and_amount(tx_info, expected_amount)`: Confirms funds arrived in the official railway treasury account.

### 16. `backend/app/payments/x402_verifier.py`
- **Role**: RFC HTTP 402 middleware and header inspector.
- **Functions**:
  - `verify_x402_header(request)`: Checks for `Authorization: Bearer <SUBSCRIPTION_TOKEN>` or `X-Payment-Proof: <TX_ID>`. If missing or invalid, raises `HTTPException(status_code=402, detail="Payment Required")` with Algorand payment headers.

### 17. `backend/app/payments/subscription_db.py`
- **Role**: SQLite/Postgres persistence layer for active passenger passes.
- **Schema**: Stores `wallet_address`, `tx_id`, `created_at`, `expires_at`, `is_active`.

### 18. `backend/app/schemas/` (`simulation.py`, `station.py`, `train.py`, `payment.py`)
- **Role**: Official Pydantic schema models defining the frozen contract for the entire monorepo.
- **Properties**:
  - `simulation.py`: `SimulationTickState`, `TrackOccupancyPayload`, `PlaybackCommand`.
  - `station.py`: `StationLayout`, `PlatformInfo`, `OuterHoldingTrackInfo`, `SwitchPointState`.
  - `train.py`: `TrainTelemetry`, `ScheduleStop`, `WaitReasonExplanation`, `HITLRecommendation`.
  - `payment.py`: `X402PaymentRequest`, `PaymentProofPayload`, `SubscriptionStatus`.

### 19. `backend/main.py`
- **Role**: Application entry point, instantiating FastAPI, configuring CORS middleware for the three frontend ports (`3000`, `3001`, `3002`), registering routers, and managing startup/shutdown event loops.

### 20. `backend/requirements.txt`
- **Role**: Dependency manifest: `fastapi`, `uvicorn`, `pydantic`, `ortools`, `py-algorand-sdk`, `pandas`, `websockets`.

### 21. `backend/README.md`
- **Role**: Complete setup guide for Engineer 2 covering Python virtual environment, running Uvicorn, testing endpoints via Swagger, and checking WebSocket streams.

---

## 🖥️ SECTION 3: `/frontend/` — Simulator & Station Commander (Engineer 3)

### Sub-App 1: Station Digital Twin Simulator (`frontend/simulator/`)

#### 1. `frontend/simulator/src/components/StationCanvas.tsx`
- **Role**: Primary SVG/HTML5 Canvas visualizer rendering the 6-platform station physical layout.
- **Visual Elements**:
  - 6 horizontal Platform Tracks labeled Platform 1 through Platform 6 with station platform canopies.
  - 4 Outer Waiting Tracks / Holding Sidings located prior to the home signals.
  - Mainline run-through bypass tracks.
  - Crossover ladder and diamond switch turnouts.

#### 2. `frontend/simulator/src/components/TrainObject.tsx`
- **Role**: Animated train sprite with realistic consist graphics.
- **Features**: Smooth Framer Motion transitions along track lines, train number badge, priority indicator color, and speed readout.

#### 3. `frontend/simulator/src/components/SwitchPoint.tsx`
- **Role**: Interactive visual turnout indicator that flips between **Normal (Straight)** and **Reverse (Diverging)** when route interlocking throws points.

#### 4. `frontend/simulator/src/components/SignalHead.tsx`
- **Role**: 4-aspect physical signal head sprite displaying live colored glow (Red, Yellow, Double Yellow, Green).

#### 5. `frontend/simulator/src/components/PlaybackControls.tsx`
- **Role**: Floating control bar with Play, Pause, Step Tick, Speed Multipliers ($1\times, 5\times, 20\times$), and Reset buttons.

#### 6. `frontend/simulator/src/hooks/useSimulatorSocket.ts`
- **Role**: Custom React hook maintaining WebSocket connection to `ws://localhost:8000/ws/simulator`. Reconnects automatically on disconnect.

#### 7. `frontend/simulator/src/pages/index.tsx`
- **Role**: Main Next.js/Vite page uniting `StationCanvas`, `PlaybackControls`, and live FPS/tick statistics.

#### 8. `frontend/simulator/package.json` & `README.md`
- **Role**: Dependencies (`framer-motion`, `lucide-react`, `tailwindcss`) and standalone setup guide.

---

### Sub-App 2: Station Commander Portal (`frontend/station-commander/`)

#### 1. `frontend/station-commander/src/components/IncomingRadar.tsx`
- **Role**: High-density operational radar feed of all trains within 30 minutes of arrival.
- **Columns**: Train No, Train Name, Priority Badge, Speed (km/h), Current Block, ETA, Status (`On-Time` / `Delayed +4m`).

#### 2. `frontend/station-commander/src/components/AIRecommendationCard.tsx`
- **Role**: Visual card presenting the AI's ranked suggestions:
  - *"Route Vande Bharat 20901 $\to$ Platform 1 (Mainline Clear)"*
  - *"Divert Freight 5012 $\to$ Outer Holding Track 2 (Wait: 8 min)"*
  - Displays explainable rationale and delay savings score.

#### 3. `frontend/station-commander/src/components/ApprovalDeck.tsx`
- **Role**: Station Master action deck:
  - **[APPROVE SUGGESTION]** button (Green): Dispatches approval to `/api/v1/station-master/action/approve`.
  - **[MANUAL OVERRIDE]** dropdown: Allows selecting alternative platform ($P_1-P_6$) or outer holding track ($H_1-H_4$).
  - **[EMERGENCY ALL-RED]** button: Safety emergency override.

#### 4. `frontend/station-commander/src/components/InterlockingMonitor.tsx`
- **Role**: Route locking status board. Displays which track segments are currently `LOCKED`, `UNLOCKED`, or `OCCUPIED`.

#### 5. `frontend/station-commander/src/components/StationMetrics.tsx`
- **Role**: Live performance widgets rendering Station Punctuality %, Average Dwell Time, and Platform Occupancy bar chart.

#### 6. `frontend/station-commander/src/hooks/useCommanderSocket.ts`
- **Role**: Real-time bi-directional WebSocket hook streaming recommendations and posting Station Master approval decisions.

#### 7. `frontend/station-commander/src/pages/index.tsx`
- **Role**: Operational control room dashboard page combining Radar, Recommendations, and Interlocking Monitor.

#### 8. `frontend/station-commander/package.json` & `README.md`
- **Role**: Dependencies (`recharts`, `lucide-react`, `tailwindcss`) and setup guide.

---

## 📱 SECTION 4: `/client/` — Passenger Web & x402 Algorand (Engineer 4)

### 1. `client/src/components/Navbar.tsx`
- **Role**: Consumer navigation bar with Indian Railways branding, search shortcut, and **Algorand Wallet Connect** button displaying connected wallet address and active 30-day pass status badge.

### 2. `client/src/components/TrainSearch.tsx`
- **Role**: Interactive autocomplete search bar enabling passengers to look up any train by number (e.g. `12301`) or name (e.g. `Rajdhani Express`).

### 3. `client/src/components/JourneyTimeline.tsx`
- **Role**: Vertical/horizontal journey progress stepper showing completed stations, current live position pin, upcoming stations, and delay delta.

### 4. `client/src/components/SpeedTelemetry.tsx`
- **Role**: Live digital speedometer widget showing train speed ($0-160\text{ km/h}$) and section speed limits.

### 5. `client/src/components/WaitReasonModal.tsx`
- **Role**: **"Why is My Train Stopped?"** explainability card/modal.
  - Automatically pops up when speed is 0 km/h or user taps **"Check Wait Reason"**.
  - Fetches from `/api/v1/passenger/train/{id}/why-stopped`.
  - Renders plain-English dispatch reasoning:
    > *"Your train is currently held at Outer Holding Track 1 for 6 minutes to allow Vande Bharat Express to clear the junction throat. Expected departure in 4 minutes."*

### 6. `client/src/components/SubscriptionBanner.tsx`
- **Role**: Value-proposition callout explaining the ₹9/month premium tracking pass (unlimited explainable wait logs, live delay predictions, and SMS alerts).

### 7. `client/src/components/PaymentModal.tsx`
- **Role**: **x402 + Algorand Testnet Checkout Modal**.
  - Displays payable amount: `0.1 ALGO` ($\approx$ ₹9).
  - Displays Algorand Treasury address and QR code.
  - Provides a 1-click **[Pay with Algorand Wallet]** button triggering `@x402-avm` / Pera Wallet.
  - Submits the resulting transaction hash to backend for verification.

### 8. `client/src/lib/x402_client.ts`
- **Role**: Implementation of the `@x402-avm` client protocol from `github.com/marotipatre/x402-Project`.
- **Functions**:
  - `handle402Response(response, wallet)`: Automatically parses HTTP 402 headers, prompts wallet for signature, submits transaction to Algorand Testnet, and retries the original request with `X-Payment-Proof`.

### 9. `client/src/lib/algorand.ts`
- **Role**: Algorand wallet connection utility (`@perawallet/connect`, `algosdk`).
- **Functions**:
  - `connectWallet()`: Opens Pera or Defly wallet connection modal.
  - `sendMicroPayment(amountMicroAlgos, toAddress)`: Dispatches payment transaction to Algorand Testnet.

### 10. `client/src/lib/api.ts`
- **Role**: Axios client with interceptors catching HTTP 402 responses and opening `PaymentModal`.

### 11. `client/src/types/passenger.ts`
- **Role**: TypeScript definitions for `TrainStatus`, `WaitReasonExplanation`, and `PaymentState` matching the backend Pydantic schemas.

### 12. `client/src/app/page.tsx` & `layout.tsx`
- **Role**: Clean Next.js 15 App Router landing and tracking interface.

### 13. `client/package.json` & `README.md`
- **Role**: Package dependencies and setup instructions for passenger portal and payment testing.

---

## 📚 SECTION 5: `/docs/` — Complete Documentation Suite

| Document | File Path | Core Role & Contents |
| :--- | :--- | :--- |
| **File Directory** | `docs/file.md` | *This document*: Complete technical blueprint of all files, functions, and endpoints. |
| **Workflow Chart** | `docs/workflow_chart.md` | End-to-end Mermaid flowcharts: Simulation loop, Station Master HITL approval, x402 Algorand payment lifecycle. |
| **Features Breakdown** | `docs/FEATURES.md` | Flagship highlights, 6-platform simulation, HITL station approvals, passenger explainability, x402 micropayments. |
| **Setup Guide** | `docs/setup_guide.md` | Multi-service installation and execution instructions for all four domains. |
| **Architecture** | `docs/architecture.md` | Mathematical CP-SAT formulations, digital interlocking design, and system decoupling. |
| **Visual Representations** | `docs/representation.md` | Visual layout of 6 platforms and outer tracks, finite state machines (FSM), and route-lock indicators. |
| **API Documentation** | `docs/api_docs.md` | Complete OpenAPI reference with sample requests, responses, and WebSocket frames. |
| **Database Schemas** | `docs/database_schema.md` | Data models for timetables, station layout, real-time telemetry, and SQLite subscription ledger. |
| **References** | `docs/REFERENCES.md` | Academic citations, CRIS COA precedents, OR-Tools documentation, and Algorand repos. |
| **MVP Specifications** | `docs/mvp_specifications.md` | Phase 2 functional and non-functional validation targets. |
| **Transcript & Brainstorming**| `docs/transcript.md` | Technical discussion logs, design decisions, and architectural justifications. |

---

## 🏛️ SECTION 6: Root System Documents

1. **`master_blueprint.md`**: Foundational blueprint covering overall system principles and Phase 1 to Phase 2 evolution.
2. **`object.md`**: Master strategic blueprint detailing the Phase 2 Next-Level transformation, the 4 core pillars, and the 4-person zero-merge-conflict plan.
3. **`product.md`**: Consolidated executive product specification combining all dimensions of the project.
4. **`context.md`**: Chronological development log, resolved technical challenges, and engineering retrospective.
5. **`README.md`**: Primary repository landing page featuring the master documentation matrix and quick start guide.
