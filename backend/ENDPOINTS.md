# FastAPI Backend API Reference & Schema Specifications

Comprehensive documentation of all REST API endpoints and real-time WebSocket channels exposed by the FastAPI backend for **Project Aahavaan - Rail**, including request payloads, query parameters, headers, and response structures.

---

## 🌐 Base URL & Servers

- **REST API Base**: `http://localhost:8000`
- **WebSocket Base**: `ws://localhost:8000`
- **Interactive Swagger UI**: `http://localhost:8000/docs`
- **ReDoc Interactive UI**: `http://localhost:8000/redoc`

---

## 📋 Endpoint Summary Table

| Domain | Method | Endpoint | Description | Auth / Gate |
| :--- | :--- | :--- | :--- | :--- |
| **System & Health** | `GET` | `/` | Service metadata & navigation directory | None |
| | `GET` | `/healthcheck` | System health & latency diagnostics (DB + API) | None |
| | `GET` | `/health` | Alias for `/healthcheck` | None |
| **Authentication** | `POST` | `/api/v1/auth/register` | Register new user in MongoDB | None |
| | `POST` | `/api/v1/auth/login` | Authenticate user & issue JWT | None |
| | `GET` | `/api/v1/auth/me` | Fetch user profile & premium status | `Bearer <JWT>` |
| | `POST` | `/api/v1/auth/upgrade-premium` | Upgrade account to premium | `Bearer <JWT>` |
| **Simulator** | `GET` | `/api/v1/simulator/layout` | Station topology (6 platforms, 4 sidings) | None |
| | `GET` | `/api/v1/simulator/state` | Instantaneous train & signal state | None |
| | `POST` | `/api/v1/simulator/control/tick` | Advance simulation forward | None |
| | `POST` | `/api/v1/simulator/control/playback` | Playback speed & pause toggle | None |
| | `WS` | `/ws/simulator` | Real-time 60Hz train & signal stream | None |
| **Station Master** | `GET` | `/api/v1/station-master/radar` | Approaching train queue (30-min horizon) | None |
| | `GET` | `/api/v1/station-master/recommendations` | AI dispatch recommendations | None |
| | `POST` | `/api/v1/station-master/action/approve` | HITL approval & route lock | None |
| | `POST` | `/api/v1/station-master/action/override` | Manual override with safety check | None |
| | `POST` | `/api/v1/station-master/action/emergency-all-red` | Failsafe emergency stop | None |
| | `WS` | `/ws/station-master` | Bi-directional stream for recommendations & approvals | None |
| **Passenger** | `GET` | `/api/v1/passenger/train/search` | Search train by number or name | None |
| | `GET` | `/api/v1/passenger/train/{id}/status` | Public real-time train telemetry | None |
| | `GET` | `/api/v1/passenger/train/{id}/why-stopped` | Explainable delay reason diagnostics | `is_premium` or x402 |
| **x402 Payments** | `GET` | `/api/v1/payments/pricing` | ₹9 subscription pricing terms | None |
| | `POST` | `/api/v1/payments/verify-proof` | Verify on-chain Algorand TX & grant pass | None / Optional Bearer |
| | `GET` | `/api/v1/payments/subscription-status` | Check subscription status for wallet | None |
| **Baseline** | `GET` | `/api/network` | Phase 1 corridor network | None |
| | `GET` | `/api/state` | Phase 1 baseline train telemetry | None |
| | `PUT` | `/api/mode` | Toggle FIFO vs AI_OPTIMIZED mode | None |
| | `POST` | `/api/simulate/tick` | Phase 1 discrete minute simulation tick | None |
| | `POST` | `/api/simulate/start` | Phase 1 start simulation | None |

---

## 0. 🖥️ Root & Healthcheck Domain (`/`, `/healthcheck`)

### 0.1 `GET /`
Root discovery endpoint providing service identity, operational status, and navigational links to docs and primary endpoints.

- **HTTP Method**: `GET`
- **Request Headers**: None
- **Request Body**: None
- **Response (`200 OK`)**:
```json
{
  "service": "Project Aahavaan - Rail Digital Twin API",
  "version": "2.0.0",
  "status": "ONLINE",
  "message": "Welcome to Aahavaan Railway Digital Twin & HITL Station Master API.",
  "endpoints": {
    "docs": "/docs",
    "redoc": "/redoc",
    "healthcheck": "/healthcheck",
    "api_v1": "/api/v1",
    "simulator_ws": "/ws/simulator",
    "station_master_ws": "/ws/station-master"
  }
}
```

---

### 0.2 `GET /healthcheck` (Alias: `GET /health`)
Performs a comprehensive real-time system health evaluation, measuring and returning latency (in milliseconds) for the API gateway and underlying MongoDB connection.

- **HTTP Method**: `GET`
- **Request Headers**: None
- **Request Body**: None
- **Response (`200 OK`)**:
```json
{
  "status": "healthy",
  "timestamp": "2026-09-13T05:22:10.123456+00:00",
  "latency_ms": 2.33,
  "database": {
    "status": "connected",
    "latency_ms": 0.85
  },
  "simulation": {
    "is_running": true,
    "current_time_sec": 144.5,
    "trains_count": 14
  }
}
```

---

## 1. 🔐 Authentication & User Management Domain (`/api/v1/auth`)

### 1.1 `POST /api/v1/auth/register`
Creates a new passenger account in the MongoDB `users` collection with a bcrypt-hashed password.

- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "username": "rajesh_commuter",
  "email": "rajesh@example.com",
  "password": "SecurePassword123",
  "full_name": "Rajesh Kumar",
  "wallet_address": "ALGORAND_TESTNET_WALLET_ADDRESS",
  "is_premium": false
}
```
- **Response (`201 Created`)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "is_premium": false,
  "user": {
    "id": "66e4a28f42d1b8214309c001",
    "username": "rajesh_commuter",
    "email": "rajesh@example.com",
    "full_name": "Rajesh Kumar",
    "is_premium": false,
    "wallet_address": "ALGORAND_TESTNET_WALLET_ADDRESS",
    "created_at": "2026-09-13T10:30:00Z"
  },
  "message": "User registered successfully."
}
```
- **Error Response (`400 Bad Request`)**:
```json
{
  "detail": "Username 'rajesh_commuter' is already registered."
}
```

---

### 1.2 `POST /api/v1/auth/login`
Authenticates credentials and issues a signed JWT access token containing user identity and `is_premium` status.

- **Request Body**:
```json
{
  "username": "rajesh_commuter",
  "password": "SecurePassword123"
}
```
- **Response (`200 OK`)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "is_premium": false,
  "user": {
    "id": "66e4a28f42d1b8214309c001",
    "username": "rajesh_commuter",
    "email": "rajesh@example.com",
    "full_name": "Rajesh Kumar",
    "is_premium": false,
    "wallet_address": "ALGORAND_TESTNET_WALLET_ADDRESS",
    "created_at": "2026-09-13T10:30:00Z"
  },
  "message": "Login successful."
}
```
- **Error Response (`401 Unauthorized`)**:
```json
{
  "detail": "Invalid username or password."
}
```

---

### 1.3 `GET /api/v1/auth/me`
Fetches the profile and live `is_premium` status for the authenticated user from MongoDB.

- **Request Headers**: `Authorization: Bearer <ACCESS_TOKEN>`
- **Response (`200 OK`)**:
```json
{
  "id": "66e4a28f42d1b8214309c001",
  "username": "rajesh_commuter",
  "email": "rajesh@example.com",
  "full_name": "Rajesh Kumar",
  "is_premium": true,
  "wallet_address": "ALGORAND_TESTNET_WALLET_ADDRESS",
  "created_at": "2026-09-13T10:30:00Z"
}
```
- **Error Response (`401 Unauthorized`)**:
```json
{
  "detail": "Invalid or expired authentication token."
}
```

---

### 1.4 `POST /api/v1/auth/upgrade-premium`
Updates or toggles the user's `is_premium` status in MongoDB.

- **Request Headers**: `Authorization: Bearer <ACCESS_TOKEN>`
- **Request Body**:
```json
{
  "is_premium": true,
  "wallet_address": "ALGORAND_TESTNET_WALLET_ADDRESS"
}
```
- **Response (`200 OK`)**:
```json
{
  "username": "rajesh_commuter",
  "is_premium": true,
  "message": "Premium status updated successfully."
}
```

---

## 2. 🚆 Physical Simulator Domain (`/api/v1/simulator`)

### 2.1 `GET /api/v1/simulator/layout`
Returns the physical station topology of the 6 platform lines, 4 outer waiting tracks, switch points, and signals.

- **Response (`200 OK`)**:
```json
{
  "station_id": "STN_JUNCTION_01",
  "name": "Aahavaan Central Junction",
  "platforms": [
    { "id": "PLATFORM_1", "track_id": "TRK_P1", "length_m": 650, "max_speed_kmph": 30, "is_occupied": false, "occupant_train_id": null },
    { "id": "PLATFORM_2", "track_id": "TRK_P2", "length_m": 650, "max_speed_kmph": 30, "is_occupied": true, "occupant_train_id": "T_12402" },
    { "id": "PLATFORM_3", "track_id": "TRK_P3", "length_m": 650, "max_speed_kmph": 30, "is_occupied": false, "occupant_train_id": null },
    { "id": "PLATFORM_4", "track_id": "TRK_P4", "length_m": 600, "max_speed_kmph": 30, "is_occupied": false, "occupant_train_id": null },
    { "id": "PLATFORM_5", "track_id": "TRK_P5", "length_m": 600, "max_speed_kmph": 30, "is_occupied": false, "occupant_train_id": null },
    { "id": "PLATFORM_6", "track_id": "TRK_P6", "length_m": 550, "max_speed_kmph": 30, "is_occupied": false, "occupant_train_id": null }
  ],
  "outer_waiting_tracks": [
    { "id": "OUTER_HOLD_1", "track_id": "TRK_OH1", "capacity": 1, "description": "Up Main Outer Loop", "is_occupied": true, "occupant_train_id": "T_12301" },
    { "id": "OUTER_HOLD_2", "track_id": "TRK_OH2", "capacity": 1, "description": "Up Freight Siding", "is_occupied": true, "occupant_train_id": "T_5012" },
    { "id": "OUTER_HOLD_3", "track_id": "TRK_OH3", "capacity": 1, "description": "Down Main Outer Loop", "is_occupied": false, "occupant_train_id": null },
    { "id": "OUTER_HOLD_4", "track_id": "TRK_OH4", "capacity": 1, "description": "Down Freight Siding", "is_occupied": false, "occupant_train_id": null }
  ],
  "switch_points": [
    { "id": "SW_01A", "location_km": 14.2, "state": "NORMAL", "locked_for_route_id": "ROUTE_ENTRY_P2" },
    { "id": "SW_02B", "location_km": 14.8, "state": "REVERSE", "locked_for_route_id": "ROUTE_ENTRY_P2" }
  ],
  "signals": [
    { "id": "SIG_HOME_UP", "type": "4_ASPECT", "aspect": "GREEN", "protecting_block_id": "SEG_02" },
    { "id": "SIG_STARTER_P1", "type": "3_ASPECT", "aspect": "RED", "protecting_block_id": "TRK_P1" },
    { "id": "SIG_STARTER_P2", "type": "3_ASPECT", "aspect": "GREEN", "protecting_block_id": "TRK_P2" }
  ]
}
```

---

### 2.2 `GET /api/v1/simulator/state`
Returns the instantaneous state: train positions, velocities, occupied circuits, switches, and signal aspects.

- **Response (`200 OK`)**:
```json
{
  "timestamp": 142.5,
  "is_running": true,
  "playback_speed": 1.0,
  "trains": [
    {
      "id": "T_12301",
      "name": "Rajdhani Express",
      "type": "Rajdhani",
      "priority": 8,
      "x": 420.5,
      "y": 150.0,
      "speed_kmph": 0.0,
      "status": "WAITING_OUTER",
      "block_id": "TRK_OH1",
      "current_delay_min": 4,
      "assigned_track": "OUTER_HOLD_1"
    }
  ],
  "signals": {
    "SIG_HOME_UP": "GREEN",
    "SIG_STARTER_P1": "RED",
    "SIG_STARTER_P2": "GREEN"
  },
  "switches": {
    "SW_01A": "NORMAL",
    "SW_02B": "REVERSE"
  },
  "occupied_circuits": ["SEG_02", "TRK_OH1", "TRK_OH2", "TRK_P2"]
}
```

---

### 2.3 `POST /api/v1/simulator/control/tick`
Advances physical simulation forward by specified seconds or discrete step minutes.

- **Request Body**:
```json
{
  "seconds": 2.0,
  "step_minutes": null
}
```
- **Response (`200 OK`)**:
```json
{
  "status": "OK",
  "timestamp": 144.5,
  "current_time_min": 2,
  "trains_count": 14
}
```

---

### 2.4 `POST /api/v1/simulator/control/playback`
Controls simulation playback rate and running/pause state.

- **Request Body**:
```json
{
  "rate": 5.0,
  "is_running": true
}
```
- **Response (`200 OK`)**:
```json
{
  "status": "UPDATED",
  "rate": 5.0,
  "is_running": true,
  "timestamp": 144.5
}
```

---

## 3. 🏢 Station Master & HITL Control Domain (`/api/v1/station-master`)

### 3.1 `GET /api/v1/station-master/radar`
Returns the queue of approaching trains within the 30-minute lookahead horizon.

- **Response (`200 OK`)**:
```json
{
  "station_id": "STN_JUNCTION_01",
  "timestamp": 142.5,
  "lookahead_horizon_min": 30,
  "approaching_trains": [
    {
      "train_id": "T_20901",
      "train_name": "Vande Bharat Express",
      "train_type": "Vande Bharat",
      "priority": 10,
      "current_block": "SEG_02",
      "eta_min": 2,
      "speed_kmph": 130.0,
      "delay_min": 0,
      "status": "MOVING"
    },
    {
      "train_id": "T_12301",
      "train_name": "Rajdhani Express",
      "train_type": "Rajdhani",
      "priority": 8,
      "current_block": "TRK_OH1",
      "eta_min": 6,
      "speed_kmph": 0.0,
      "delay_min": 4,
      "status": "WAITING_OUTER"
    }
  ]
}
```

---

### 3.2 `GET /api/v1/station-master/recommendations`
Returns AI-generated platform allocation and holding track suggestions computed by the CP-SAT solver.

- **Response (`200 OK`)**:
```json
{
  "generated_at": 142,
  "recommendations": [
    {
      "recommendation_id": "REC_8841",
      "train_id": "T_12301",
      "train_name": "Rajdhani Express",
      "priority": 8,
      "eta_min": 6,
      "recommended_action": "ASSIGN_PLATFORM",
      "assigned_track": "PLATFORM_2",
      "alternative_track": "OUTER_HOLD_1",
      "outer_wait_min": 0,
      "reasoning": "Platform 2 is clearing in 1 min. Grants express mainline passage ahead of Freight 5012.",
      "safety_interlock_approved": true,
      "status": "PENDING_APPROVAL"
    },
    {
      "recommendation_id": "REC_8842",
      "train_id": "T_5012",
      "train_name": "Container Freight 5012",
      "priority": 2,
      "eta_min": 4,
      "recommended_action": "DIVERT_TO_OUTER_HOLDING",
      "assigned_track": "OUTER_HOLD_2",
      "alternative_track": "PLATFORM_6",
      "outer_wait_min": 8,
      "reasoning": "Held at Outer Siding 2 for 8 mins to prevent bottle-necking Rajdhani 12301. Saves 14 min network delay.",
      "safety_interlock_approved": true,
      "status": "PENDING_APPROVAL"
    }
  ]
}
```

---

### 3.3 `POST /api/v1/station-master/action/approve`
Approves an AI dispatch recommendation. The Safety Interlocking Supervisor verifies clearance, locks the route, aligns switch turnouts, and sets the home signal to Green.

- **Request Body**:
```json
{
  "recommendation_id": "REC_8841",
  "train_id": "T_12301",
  "assigned_track": "PLATFORM_1",
  "dispatcher_id": "SM_OFFICER_04"
}
```
- **Response (`200 OK - Approved & Locked`)**:
```json
{
  "status": "APPROVED_AND_LOCKED",
  "route_id": "ROUTE_ENTRY_P1",
  "signal_id": "SIG_HOME_UP",
  "signal_aspect": "GREEN",
  "switches_aligned": ["SW_01A:NORMAL", "SW_02B:REVERSE"],
  "timestamp": 144
}
```
- **Response (`409 Conflict - Interlocking Violation`)**:
Triggered if the requested platform is occupied or conflicting route is locked.
```json
{
  "status": "REJECTED_SAFETY_VIOLATION",
  "error_code": "INTERLOCKING_CONFLICT",
  "detail": "Cannot route to PLATFORM_2: Conflicting route currently locked for Train T_12402.",
  "signal_aspect": "RED"
}
```

---

### 3.4 `POST /api/v1/station-master/action/override`
Manual override of track assignment with real-time interlocking safety verification.

- **Request Body**:
```json
{
  "train_id": "T_12301",
  "assigned_track": "PLATFORM_3",
  "dispatcher_id": "SM_OFFICER_04",
  "reason": "Manual operator reassignment"
}
```
- **Response (`200 OK`)**:
```json
{
  "status": "OVERRIDE_APPROVED_AND_LOCKED",
  "train_id": "T_12301",
  "assigned_track": "PLATFORM_3",
  "route_id": "ROUTE_ENTRY_P3",
  "signal_aspect": "GREEN",
  "switches_aligned": ["SW_01A:NORMAL", "SW_02B:REVERSE"],
  "message": "Manual override to PLATFORM_3 verified by Safety Interlocking.",
  "timestamp": 144
}
```

---

### 3.5 `POST /api/v1/station-master/action/emergency-all-red`
Emergency stop command immediately setting all station signals to Danger (Red) and stopping all train movements.

- **Request Body**: None
- **Response (`200 OK`)**:
```json
{
  "status": "EMERGENCY_ALL_RED_ACTIVATED",
  "affected_signals": [
    "SIG_HOME_UP",
    "SIG_HOME_DOWN",
    "SIG_STARTER_P1",
    "SIG_STARTER_P2",
    "SIG_STARTER_P3",
    "SIG_STARTER_P4",
    "SIG_STARTER_P5",
    "SIG_STARTER_P6"
  ],
  "message": "All station entry and starter signals forced to Danger (RED). All movements halted.",
  "timestamp": 144
}
```

---

## 4. 📱 Passenger Web Portal & Explainability Domain (`/api/v1/passenger`)

### 4.1 `GET /api/v1/passenger/train/search?q={query}`
Searches trains by train number (e.g., `12301`) or name (e.g., `Rajdhani`).

- **Query Parameter**: `q` (string, optional)
- **Response (`200 OK`)**:
```json
{
  "results": [
    {
      "id": "T_12301",
      "name": "Rajdhani Express",
      "type": "Rajdhani",
      "priority": 8,
      "origin": "NDLS (New Delhi)",
      "destination": "HWH (Howrah)",
      "current_status": "RUNNING_DELAYED",
      "delay_min": 4
    }
  ]
}
```

---

### 4.2 `GET /api/v1/passenger/train/{id}/status`
Public real-time telemetry (speed, current track circuit, next station, delay).

- **Path Parameter**: `id` (e.g. `T_12301` or `12301`)
- **Response (`200 OK`)**:
```json
{
  "id": "T_12301",
  "name": "Rajdhani Express",
  "type": "Rajdhani",
  "priority": 8,
  "speed_kmph": 0.0,
  "current_track": "TRK_OH1",
  "next_station": "Aahavaan Central Junction",
  "delay_min": 4,
  "status": "WAITING_OUTER",
  "x": 420.5,
  "y": 150.0,
  "last_updated": 142.5
}
```
- **Error Response (`404 Not Found`)**:
```json
{
  "detail": "Train T_99999 not found."
}
```

---

### 4.3 `GET /api/v1/passenger/train/{id}/why-stopped`
Explainable AI delay reasoning endpoint explaining why a train is halted.

#### Access Control Rules:
1. **Premium Authenticated User** (`Authorization: Bearer <JWT>` with `is_premium: true`): **Unlocked** (`200 OK`).
2. **On-Chain Payment Proof** (`X-Payment-Proof: <TX_HASH>`): **Unlocked** (`200 OK`).
3. **Non-Premium User or Unauthenticated**: **Challenged** (`402 Payment Required`).

#### Case A: Unpaid / Non-Premium Response (`402 Payment Required`)
- **Response Headers**:
  - `X-Payment-Address`: `AAHAVAAN7RAILX402TREASURYTESTNETWALLET`
  - `X-Payment-Amount`: `100000`
  - `X-Payment-Network`: `algorand-testnet`
  - `X-Payment-Facilitator`: `GoPlausible-AVM-Facilitator`
- **Response Body**:
```json
{
  "error": "Payment Required",
  "message": "Access to explainable real-time delay diagnostics requires an active ₹9/month Aahavaan Pass settled via x402 on Algorand. Log in with a Premium account or purchase a pass.",
  "price_inr": 9.0,
  "price_microalgos": 100000,
  "currency": "ALGO",
  "network": "testnet"
}
```

#### Case B: Paid / Premium Authenticated Response (`200 OK`)
- **Request Headers**: `Authorization: Bearer <PREMIUM_JWT>` or `X-Payment-Proof: <TX_ID>`
- **Response Body**:
```json
{
  "train_id": "T_12301",
  "train_name": "Rajdhani Express",
  "is_stopped": true,
  "stopped_at_location": "Outer Holding Track 1 (Before Junction)",
  "duration_stopped_min": 5,
  "expected_clearance_min": 3,
  "plain_english_reason": "Your train is currently held at Outer Holding Track 1 (Before Junction) to grant precedence to Vande Bharat Express (Train 20901) clearing the crossover throat into Platform 1. Once Vande Bharat Express clears, your route will receive a Green signal immediately.",
  "technical_conflict": {
    "conflicting_train": "Vande Bharat Express (Train 20901)",
    "conflict_section": "Crossover Throat Switch SW_02B",
    "priority_comparison": "Vande Bharat Express (10) > Rajdhani Express (8)"
  }
}
```

---

## 5. 💳 x402 Payments Domain (`/api/v1/payments`)

### 5.1 `GET /api/v1/payments/pricing`
Returns the ₹9 monthly subscription terms and equivalent microAlgos on Algorand Testnet.

- **Response (`200 OK`)**:
```json
{
  "plan_name": "Aahavaan Rail Pass - Monthly",
  "price_inr": 9.0,
  "price_microalgos": 100000,
  "price_algo": 0.1,
  "network": "algorand-testnet",
  "treasury_address": "AAHAVAAN7RAILX402TREASURYTESTNETWALLET",
  "facilitator": "GoPlausible-AVM-Facilitator",
  "description": "30-day unrestricted access to explainable real-time delay diagnostics and deep telemetry."
}
```

---

### 5.2 `POST /api/v1/payments/verify-proof`
Validates an on-chain Algorand Testnet transaction hash (`tx_id`), saves the pass in MongoDB `subscriptions`, upgrades the user account to `is_premium: true`, and issues a 30-day JWT pass.

- **Request Headers**: `Optional Authorization: Bearer <TOKEN>`
- **Request Body**:
```json
{
  "tx_id": "W7X3K6Y2ABCXYZ1234567890TESTNETALGORANDTRANSACTIONHASH",
  "wallet_address": "USER_ALGORAND_TESTNET_WALLET_ADDRESS",
  "plan": "MONTHLY_PASS_INR_9"
}
```
- **Response (`200 OK`)**:
```json
{
  "status": "VERIFIED_ON_CHAIN",
  "confirmed_round": 42109845,
  "amount_microalgos": 100000,
  "subscription_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.pass_USER_ALG_W7X3K6Y2",
  "valid_until": "2026-10-13T10:30:00Z",
  "message": "Subscription active. Welcome to Aahavaan Premium Rail Telemetry."
}
```

---

### 5.3 `GET /api/v1/payments/subscription-status?wallet={wallet_address}`
Checks if an Algorand wallet address has an active 30-day pass in MongoDB.

- **Query Parameter**: `wallet` (string, required)
- **Response (`200 OK`)**:
```json
{
  "wallet_address": "USER_ALGORAND_TESTNET_WALLET_ADDRESS",
  "is_active": true,
  "expires_at": "2026-10-13T10:30:00Z",
  "plan": "MONTHLY_PASS_INR_9",
  "days_remaining": 30,
  "message": "Active 30-day subscription verified in MongoDB."
}
```

---

## 6. ⚡ Real-Time WebSocket Protocols

### 6.1 Simulator Stream Channel (`/ws/simulator`)
- **Connection URL**: `ws://localhost:8000/ws/simulator`
- **Direction**: Server $\to$ Client (Broadcast every 1s / 60Hz)
- **Message Payload**:
```json
{
  "event": "TRACK_CIRCUIT_UPDATE",
  "timestamp": 142.5,
  "trains": [
    {
      "id": "T_12301",
      "name": "Rajdhani Express",
      "type": "Rajdhani",
      "priority": 8,
      "x": 420.5,
      "y": 150.0,
      "speed_kmph": 0.0,
      "status": "WAITING_OUTER",
      "block_id": "TRK_OH1",
      "current_delay_min": 4,
      "assigned_track": "OUTER_HOLD_1"
    }
  ],
  "signals": {
    "SIG_HOME_UP": "GREEN",
    "SIG_STARTER_P1": "RED"
  },
  "switches": {
    "SW_01A": "NORMAL",
    "SW_02B": "REVERSE"
  },
  "occupied_circuits": ["SEG_02", "TRK_OH1", "TRK_P2"]
}
```

---

### 6.2 Station Master Bi-Directional Channel (`/ws/station-master`)
- **Connection URL**: `ws://localhost:8000/ws/station-master`
- **Direction**: Bi-Directional

#### Outbound Frame (Server $\to$ Client on Connection / Update):
```json
{
  "event": "RECOMMENDATIONS_STREAM",
  "timestamp": 142.5,
  "recommendations": [
    {
      "recommendation_id": "REC_8841",
      "train_id": "T_12301",
      "assigned_track": "PLATFORM_2",
      "status": "PENDING_APPROVAL"
    }
  ]
}
```

#### Inbound Action Frame (Client $\to$ Server):
```json
{
  "action": "SUBMIT_APPROVAL",
  "recommendation_id": "REC_8841",
  "assigned_track": "PLATFORM_1",
  "train_id": "T_12301",
  "dispatcher_id": "SM_OFFICER_04"
}
```

#### Outbound Confirmation (Server $\to$ Client):
```json
{
  "event": "APPROVAL_SUCCESS",
  "recommendation_id": "REC_8841",
  "details": {
    "status": "APPROVED_AND_LOCKED",
    "route_id": "ROUTE_ENTRY_P1",
    "signal_aspect": "GREEN"
  }
}
```

---

## 7. 🔄 Phase 1 Baseline Compatibility Endpoints

Maintained for backwards compatibility with Phase 1 frontend applications.

### 7.1 `GET /api/network`
Returns corridor network topology and stations.
- **Response (`200 OK`)**:
```json
{
  "station_id": "STN_JUNCTION_01",
  "name": "Aahavaan Central Junction",
  "stations": [
    { "id": "STN_00", "name": "Station A", "coords": { "x": 0, "y": 50 } },
    { "id": "STN_JUNCTION_01", "name": "Aahavaan Central Junction", "coords": { "x": 500, "y": 50 } },
    { "id": "STN_07", "name": "Station H", "coords": { "x": 1000, "y": 50 } }
  ],
  "platforms": [...],
  "outer_waiting_tracks": [...],
  "signals": [...],
  "switches": [...]
}
```

### 7.2 `GET /api/state`
Returns the active train telemetry list.
- **Response (`200 OK`)**:
```json
{
  "current_time": 142,
  "trains": [...]
}
```

### 7.3 `PUT /api/mode?mode={UNOPTIMIZED|AI_OPTIMIZED}`
Toggles dispatch engine mode.
- **Response (`200 OK`)**:
```json
{
  "mode": "AI_OPTIMIZED"
}
```

### 7.4 `POST /api/simulate/tick`
Performs a 1-minute discrete simulation step.
- **Response (`200 OK`)**:
```json
{
  "current_time": 143,
  "time": 143,
  "trains": [...]
}
```

### 7.5 `POST /api/simulate/start`
Starts simulation clock.
- **Response (`200 OK`)**:
```json
{
  "status": "started"
}
```

---

## 8. 🚨 Global Error Response Schemas

### 8.1 Standard Uncaught Error (`500 Internal Server Error`)
Returned by the global exception handler in `backend/main.py`:
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected server error occurred while processing the request.",
  "detail": "Runtime failure description",
  "path": "/api/v1/endpoint",
  "method": "POST"
}
```

### 8.2 Safety Interlocking Conflict (`409 Conflict`)
Returned when an action violates anti-collision safety constraints:
```json
{
  "status": "REJECTED_SAFETY_VIOLATION",
  "error_code": "INTERLOCKING_CONFLICT",
  "detail": "Cannot route to PLATFORM_2: Conflicting route currently locked for Train T_12402.",
  "signal_aspect": "RED"
}
```
