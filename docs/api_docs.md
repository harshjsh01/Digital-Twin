# REST & WebSocket API Endpoint Documentation

This document provides exhaustive reference specifications for all REST API endpoints and real-time WebSocket channels exposed by the **FastAPI Backend** across both **Phase 1** and **Phase 2 (Next-Level)** of **Project Aahavaan - Rail**.

---

## 🌐 Base URL & Servers
- **REST API Base**: `http://localhost:8000`
- **WebSocket Base**: `ws://localhost:8000`
- **Interactive OpenAPI / Swagger UI**: `http://localhost:8000/docs`
- **ReDoc Interactive Documentation**: `http://localhost:8000/redoc`

---

## 📌 Complete Endpoint Matrix

| **Authentication** | `POST` | `/api/v1/auth/register` | Registers a new passenger account in MongoDB. |
| | `POST` | `/api/v1/auth/login` | Authenticates passenger credentials and issues JWT token. |
| | `GET` | `/api/v1/auth/me` | Retrieves authenticated user profile and live `is_premium` status. |
| | `POST` | `/api/v1/auth/upgrade-premium` | Upgrades/toggles user's `is_premium` status in MongoDB. |
| **Simulator** | `GET` | `/api/v1/simulator/layout` | 6 platforms, 4 outer waiting tracks, switch points, and signal coordinates. |
| | `GET` | `/api/v1/simulator/state` | Instantaneous physical state (train coordinates, occupied circuits, switches). |
| | `POST` | `/api/v1/simulator/control/tick` | Steps physical and discrete simulation forward. |
| | `POST` | `/api/v1/simulator/control/playback` | Controls playback rate ($1\times, 5\times, 20\times$) and pause state. |
| | `WS` | `/ws/simulator` | Real-time 60Hz stream of train positions and signal aspects. |
| **Station Master** | `GET` | `/api/v1/station-master/radar` | Approaching train queue within the 30-minute lookahead horizon. |
| | `GET` | `/api/v1/station-master/recommendations` | AI-generated platform allocation and holding track suggestions. |
| | `POST` | `/api/v1/station-master/action/approve` | Human-in-the-Loop approval: locks route, throws switches, sets Green aspect. |
| | `POST` | `/api/v1/station-master/action/override` | Manual override of platform/holding track assignment with safety check. |
| | `POST` | `/api/v1/station-master/action/emergency-all-red` | Failsafe emergency stop setting all station signals to Danger (Red). |
| | `WS` | `/ws/station-master` | Bi-directional channel streaming live recommendations and approval events. |
| **Passenger** | `GET` | `/api/v1/passenger/train/search` | Search trains by train number (e.g., `12301`) or name (e.g., `Rajdhani`). |
| | `GET` | `/api/v1/passenger/train/{id}/status` | Public real-time tracking (speed, current track, next station, delay). |
| | `GET` | `/api/v1/passenger/train/{id}/why-stopped` | **"Why is My Train Stopped?"** explainable reasoning (Protected by x402). |
| **x402 Payments** | `GET` | `/api/v1/payments/pricing` | Returns ₹9 subscription terms and equivalent microAlgos on Testnet. |
| | `POST` | `/api/v1/payments/verify-proof` | Verifies on-chain Algorand Testnet transaction and issues 30-day JWT pass. |
| | `GET` | `/api/v1/payments/subscription-status` | Checks active subscription status for a given Algorand wallet address. |
| **Core Baseline** | `GET` | `/api/network` | Phase 1 baseline static network topology. |
| | `GET` | `/api/state` | Phase 1 baseline train telemetry list. |
| | `PUT` | `/api/mode` | Toggles between `UNOPTIMIZED` (FIFO) and `AI_OPTIMIZED` modes. |
| | `POST` | `/api/simulate/tick` | Phase 1 discrete minute simulation tick. |

---

## 📖 Detailed Endpoint Specifications

### 1. 🚆 Physical Simulator Endpoints

#### `GET /api/v1/simulator/layout`
Returns the physical topology of the 6-platform junction station and 4 outer waiting tracks.

```json
{
  "station_id": "STN_JUNCTION_01",
  "name": "Aahavaan Central Junction",
  "platforms": [
    { "id": "PLATFORM_1", "track_id": "TRK_P1", "length_m": 650, "max_speed_kmph": 30 },
    { "id": "PLATFORM_2", "track_id": "TRK_P2", "length_m": 650, "max_speed_kmph": 30 },
    { "id": "PLATFORM_3", "track_id": "TRK_P3", "length_m": 650, "max_speed_kmph": 30 },
    { "id": "PLATFORM_4", "track_id": "TRK_P4", "length_m": 600, "max_speed_kmph": 30 },
    { "id": "PLATFORM_5", "track_id": "TRK_P5", "length_m": 600, "max_speed_kmph": 30 },
    { "id": "PLATFORM_6", "track_id": "TRK_P6", "length_m": 550, "max_speed_kmph": 30 }
  ],
  "outer_waiting_tracks": [
    { "id": "OUTER_HOLD_1", "track_id": "TRK_OH1", "capacity": 1, "description": "Up Main Outer Loop" },
    { "id": "OUTER_HOLD_2", "track_id": "TRK_OH2", "capacity": 1, "description": "Up Freight Siding" },
    { "id": "OUTER_HOLD_3", "track_id": "TRK_OH3", "capacity": 1, "description": "Down Main Outer Loop" },
    { "id": "OUTER_HOLD_4", "track_id": "TRK_OH4", "capacity": 1, "description": "Down Freight Siding" }
  ],
  "switch_points": [
    { "id": "SW_01A", "location_km": 14.2, "state": "NORMAL" },
    { "id": "SW_02B", "location_km": 14.8, "state": "REVERSE" }
  ],
  "signals": [
    { "id": "SIG_HOME_UP", "type": "4_ASPECT", "aspect": "GREEN" },
    { "id": "SIG_STARTER_P1", "type": "3_ASPECT", "aspect": "RED" }
  ]
}
```

---

### 2. 🏢 Station Master & HITL Control Endpoints

#### `GET /api/v1/station-master/recommendations`
Returns optimal platform and outer holding recommendations generated by the Google OR-Tools CP-SAT solver.

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
      "reasoning": "Platform 2 is clear. Grants express mainline passage ahead of Freight 5012.",
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

#### `POST /api/v1/station-master/action/approve`
Approves an AI recommendation, engaging the digital interlocking safety supervisor to lock switch points and display the signal.

**Request Body**:
```json
{
  "recommendation_id": "REC_8841",
  "train_id": "T_12301",
  "assigned_track": "PLATFORM_2",
  "dispatcher_id": "SM_OFFICER_04"
}
```

**Response (`200 OK`)**:
```json
{
  "status": "APPROVED_AND_LOCKED",
  "route_id": "ROUTE_ENTRY_P2",
  "signal_id": "SIG_HOME_UP",
  "signal_aspect": "GREEN",
  "switches_aligned": ["SW_01A:NORMAL", "SW_02B:REVERSE"],
  "timestamp": 143
}
```

**Response (`409 Conflict - Safety Interlocking Violation`)**:
```json
{
  "status": "REJECTED_SAFETY_VIOLATION",
  "error_code": "INTERLOCKING_CONFLICT",
  "detail": "Cannot route to Platform 2: Conflicting route currently locked for Train T_12402.",
  "signal_aspect": "RED"
}
```

---

### 3. 📱 Passenger Web Portal & Explainability Endpoints

#### `GET /api/v1/passenger/train/search?q=12301`
```json
{
  "results": [
    {
      "id": "T_12301",
      "name": "New Delhi - Howrah Rajdhani Express",
      "type": "Rajdhani",
      "priority": 8,
      "origin": "STN_00",
      "destination": "STN_07",
      "current_status": "RUNNING_DELAYED",
      "delay_min": 4
    }
  ]
}
```

#### `GET /api/v1/passenger/train/T_12301/why-stopped`
Explainable AI endpoint delivering the transparent operational reason why a train is stationary.

*Case A: Unpaid / Non-Premium Request*
- Triggered if unauthenticated, or if logged in with standard account (`is_premium: false`), or without valid payment proof.
- **Response**: `HTTP 402 Payment Required`
- **Headers**:
  - `X-Payment-Address`: `AAHAVAAN7RAILX402TREASURYTESTNETWALLET`
  - `X-Payment-Amount`: `100000` (0.1 ALGO $\approx$ ₹9)
  - `X-Payment-Network`: `algorand-testnet`
  - `X-Payment-Facilitator`: `GoPlausible-AVM-Facilitator`
- **Body**:
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

*Case B: Paid / Premium Authenticated Request*
- **Request Headers**: `Authorization: Bearer <VALID_PREMIUM_JWT>` or `X-Payment-Proof: <ALGORAND_TX_ID>`
- **Response (`200 OK`)**:
```json
{
  "train_id": "T_12301",
  "train_name": "Rajdhani Express",
  "is_stopped": true,
  "stopped_at_location": "Outer Holding Track 1 (Before Junction)",
  "duration_stopped_min": 5,
  "expected_clearance_min": 3,
  "plain_english_reason": "Your train is currently held at Outer Holding Track 1 to grant precedence to Vande Bharat Express (Train 20901) clearing the crossover throat into Platform 1. Once Vande Bharat clears, your route will receive a Green signal immediately.",
  "technical_conflict": {
    "conflicting_train": "Vande Bharat Express (Train 20901)",
    "conflict_section": "Crossover Throat Switch SW_02B",
    "priority_comparison": "Vande Bharat (10) > Rajdhani (8)"
  }
}
```

---

### 4. 💳 x402 + Algorand Payment Verification Endpoints

#### `POST /api/v1/payments/verify-proof`
Validates an on-chain transaction hash submitted by `@x402-avm` client or Pera Wallet, syncs with MongoDB `subscriptions`, and upgrades the associated user account to `is_premium: true`.

**Request Body**:
```json
{
  "tx_id": "W7X3K6Y2ABCXYZ1234567890TESTNETALGORANDTRANSACTIONHASH",
  "wallet_address": "USER_ALGORAND_TESTNET_WALLET_ADDRESS",
  "plan": "MONTHLY_PASS_INR_9"
}
```

**Response (`200 OK`)**:
```json
{
  "status": "VERIFIED_ON_CHAIN",
  "confirmed_round": 42109845,
  "amount_microalgos": 100000,
  "subscription_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "valid_until": "2026-10-13T09:39:16Z",
  "message": "Subscription active. Welcome to Aahavaan Premium Rail Telemetry."
}
```

---

### 5. 🔐 Passenger Authentication & User Management Endpoints

#### `POST /api/v1/auth/register`
Creates a new passenger account in the MongoDB `users` collection with encrypted password and initial `is_premium: false`.

**Request Body**:
```json
{
  "username": "rajesh_commuter",
  "email": "rajesh@example.com",
  "password": "SecurePassword123",
  "full_name": "Rajesh Kumar",
  "wallet_address": "ALGORAND_TESTNET_WALLET_ADDRESS"
}
```

**Response (`201 Created`)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "is_premium": false,
  "user": {
    "id": "66e4a28f42d1b821...",
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

#### `POST /api/v1/auth/login`
Authenticates existing credentials, issuing a signed JWT access token containing identity and premium tier permissions.

**Request Body**:
```json
{
  "username": "rajesh_commuter",
  "password": "SecurePassword123"
}
```

**Response (`200 OK`)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "is_premium": false,
  "user": {
    "id": "66e4a28f42d1b821...",
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

#### `GET /api/v1/auth/me`
Fetches authenticated user information and live `is_premium` status from MongoDB.
- **Request Header**: `Authorization: Bearer <TOKEN>`
- **Response (`200 OK`)**:
```json
{
  "id": "66e4a28f42d1b821...",
  "username": "rajesh_commuter",
  "email": "rajesh@example.com",
  "full_name": "Rajesh Kumar",
  "is_premium": true,
  "wallet_address": "ALGORAND_TESTNET_WALLET_ADDRESS",
  "created_at": "2026-09-13T10:30:00Z"
}
```

#### `POST /api/v1/auth/upgrade-premium`
Updates the user's `is_premium` status in MongoDB to `true`.
- **Request Header**: `Authorization: Bearer <TOKEN>`
- **Response (`200 OK`)**:
```json
{
  "username": "rajesh_commuter",
  "is_premium": true,
  "message": "Premium status updated successfully."
}
```

---

## ⚡ WebSocket Protocols & Event Frames

### 1. Simulator Channel (`/ws/simulator`)
- **Connection**: `ws://localhost:8000/ws/simulator`
- **Outbound Stream (Server $\to$ Client)**:
```json
{
  "event": "TRACK_CIRCUIT_UPDATE",
  "timestamp": 142.5,
  "trains": [
    {
      "id": "T_12301",
      "x": 420.5,
      "y": 150.0,
      "speed_kmph": 110.2,
      "status": "MOVING",
      "block_id": "SEG_02"
    }
  ],
  "signals": { "SIG_HOME_UP": "GREEN", "SIG_P2_START": "RED" },
  "switches": { "SW_01A": "NORMAL", "SW_02B": "REVERSE" }
}
```

### 2. Station Master Channel (`/ws/station-master`)
- **Connection**: `ws://localhost:8000/ws/station-master`
- **Outbound Stream**: Emits `NEW_RECOMMENDATION` whenever CP-SAT computes an optimal dispatch suggestion.
- **Inbound Message (Client $\to$ Server)**:
```json
{
  "action": "SUBMIT_APPROVAL",
  "recommendation_id": "REC_8841",
  "assigned_track": "PLATFORM_2"
}
```
