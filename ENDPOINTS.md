# REST & WebSocket API Endpoint Documentation

This document provides exhaustive reference specifications for all REST API endpoints and real-time WebSocket channels exposed by the **FastAPI Backend** across both baseline and advanced operations of **AAHAVAAN-RAIL: Predictive Railway Decision Support**.

---

## 🌐 Base URL & Servers
- **REST API Base**: `http://localhost:8000`
- **WebSocket Base**: `ws://localhost:8000`
- **Interactive OpenAPI / Swagger UI**: `http://localhost:8000/docs`
- **ReDoc Interactive Documentation**: `http://localhost:8000/redoc`

---

## 📌 Complete Endpoint Matrix

| Domain | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
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
| **Passenger** | `GET` | `/api/v1/passenger/train/search` | Search trains by train number (e.g., `12804`, `12301`) or name (e.g., `Purushottam Express`). |
| | `GET` | `/api/v1/passenger/train/{id}/status` | Public real-time tracking (speed, current track, next station, delay). |
| | `GET` | `/api/v1/passenger/train/{id}/why-stopped` | **"Why is My Train Stopped?"** explainable reasoning (Protected by x402). |
| **Payments** | `GET` | `/api/v1/payments/pricing` | Returns ₹9 subscription terms and equivalent microAlgos on Testnet. |
| | `POST` | `/api/v1/payments/verify-proof` | Verifies on-chain Algorand Testnet transaction and issues 30-day pass. |
| | `GET` | `/api/v1/payments/subscription-status` | Checks active subscription status for a given Algorand wallet address. |
| **Baseline Core** | `GET` | `/api/network` | Baseline static network topology. |
| | `GET` | `/api/state` | Baseline train telemetry list. |
| | `PUT` | `/api/mode` | Toggles between `UNOPTIMIZED` (FIFO) and `AI_OPTIMIZED` modes. |
| | `POST` | `/api/simulate/tick` | Discrete minute simulation tick. |

---

## 📖 Detailed Endpoint Specifications

### 1. Physical Simulator Endpoints

#### `GET /api/v1/simulator/layout`
Returns the physical topology of the 6-platform junction station and 4 outer waiting tracks.

```json
{
  "station_id": "STN_JUNCTION_01",
  "name": "Dadri Central Junction",
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

#### `GET /api/v1/simulator/state`
Returns the physical coordinates, velocities, and block occupancy of all active trains.

```json
{
  "timestamp": 142.5,
  "trains": [
    {
      "id": "12804",
      "number": "12804",
      "name": "Purushottam Express",
      "x": 680.0,
      "y": 220.0,
      "speed_kmph": 88.5,
      "status": "APPROACHING",
      "block_id": "B17",
      "delay_min": 0
    },
    {
      "id": "14632",
      "number": "14632",
      "name": "Amritsar Passenger",
      "x": 660.0,
      "y": 320.0,
      "speed_kmph": 45.0,
      "status": "APPROACHING",
      "block_id": "B17",
      "delay_min": 6
    }
  ],
  "signals": { "SIG_HOME_UP": "YELLOW", "SIG_STARTER_P1": "RED" },
  "switches": { "SW_01A": "NORMAL", "SW_02B": "REVERSE" }
}
```

#### `POST /api/v1/simulator/control/tick`
Advances simulation time by specified step.

**Request Body**:
```json
{ "step_seconds": 60 }
```

#### `POST /api/v1/simulator/control/playback`
Adjusts playback speed and pause state.

**Request Body**:
```json
{ "speed_multiplier": 5.0, "is_paused": false }
```

---

### 2. Station Master & HITL Control Endpoints

#### `GET /api/v1/station-master/radar`
Returns approaching trains within the 30-minute horizon.

```json
{
  "horizon_min": 30,
  "queue": [
    {
      "train_id": "12804",
      "train_name": "Purushottam Express",
      "priority": 10,
      "eta_min": 4,
      "current_block": "B16",
      "assigned_route": "PLATFORM_1",
      "status": "CRITICAL_PATH"
    },
    {
      "train_id": "14632",
      "train_name": "Amritsar Passenger",
      "priority": 3,
      "eta_min": 5,
      "current_block": "B15_D",
      "assigned_route": "OUTER_HOLD_2",
      "status": "DIVERT_SCHEDULED"
    }
  ]
}
```

#### `GET /api/v1/station-master/recommendations`
Returns CP-SAT optimal platform and holding siding suggestions.

```json
{
  "generated_at": 142,
  "recommendations": [
    {
      "recommendation_id": "REC_8841",
      "train_id": "14632",
      "train_name": "Amritsar Passenger",
      "priority": 3,
      "eta_min": 5,
      "recommended_action": "DIVERT_TO_HOLDING",
      "assigned_track": "OUTER_HOLD_2",
      "alternative_track": "PLATFORM_3",
      "outer_wait_min": 3,
      "reasoning": "Hold Passenger 14632 in Loop Siding 2 for 3 minutes to clear Block B17 throat. Allows High-Priority Express 12804 (Weight 10) mainline pass. Saves 7.0 min network delay.",
      "safety_interlock_approved": true,
      "status": "PENDING_APPROVAL"
    }
  ]
}
```

#### `POST /api/v1/station-master/action/approve`
Approves an AI recommendation, engaging the interlocking supervisor to lock switches and set signal aspects.

**Request Body**:
```json
{
  "recommendation_id": "REC_8841",
  "train_id": "14632",
  "assigned_track": "OUTER_HOLD_2",
  "dispatcher_id": "SM_OFFICER_01"
}
```

**Response (`200 OK`)**:
```json
{
  "status": "APPROVED_AND_LOCKED",
  "route_id": "ROUTE_SIDING_2",
  "signal_id": "SIG_HOME_UP",
  "signal_aspect": "GREEN",
  "switches_aligned": ["SW_01A:NORMAL", "SW_02B:REVERSE"],
  "timestamp": 143
}
```

#### `POST /api/v1/station-master/action/override`
Manual override of track assignment.

**Request Body**:
```json
{
  "train_id": "14632",
  "manual_track": "PLATFORM_3",
  "dispatcher_id": "SM_OFFICER_01"
}
```

#### `POST /api/v1/station-master/action/emergency-all-red`
Failsafe emergency stop setting all station signals to Red.

**Request Body**:
```json
{
  "zone_id": "DADRI_CENTRAL",
  "reason": "MANUAL_EMERGENCY_TRIGGER",
  "dispatcher_id": "SM_OFFICER_01"
}
```

---

### 3. Passenger Portal Endpoints

#### `GET /api/v1/passenger/train/search?q=12804`
```json
{
  "results": [
    {
      "id": "12804",
      "number": "12804",
      "name": "Purushottam Express",
      "type": "Express",
      "priority": 10,
      "origin": "Anand Vihar (ANVT)",
      "destination": "Puri (PURI)",
      "current_status": "RUNNING",
      "delay_min": 0
    }
  ]
}
```

#### `GET /api/v1/passenger/train/14632/why-stopped`
Explainable delay diagnostics delivering operational clarity to passengers.

```json
{
  "train_id": "14632",
  "train_name": "Amritsar Passenger",
  "is_stopped": true,
  "stopped_at_location": "Loop Siding 2 (Dadri)",
  "duration_stopped_min": 3,
  "expected_clearance_min": 1,
  "plain_english_reason": "Your train is currently held at Loop Siding 2 to grant precedence to High-Priority Express 12804 clearing the Dadri interlocking throat. Route clears in 1 minute with Green aspect.",
  "technical_conflict": {
    "conflicting_train": "Purushottam Express (12804)",
    "conflict_section": "Dadri Interlocking Switch SW_02B (Block B17)",
    "priority_comparison": "Express (10) > Passenger (3)"
  }
}
```

---

## ⚡ WebSocket Protocols & Channels

### 1. Physical Simulator Channel (`/ws/simulator`)
- **Connection**: `ws://localhost:8000/ws/simulator`
- **Outbound Stream (Server $\to$ Client)**:
```json
{
  "event": "TRACK_CIRCUIT_UPDATE",
  "timestamp": 142.5,
  "trains": [
    {
      "id": "12804",
      "x": 680.0,
      "y": 220.0,
      "speed_kmph": 88.5,
      "status": "APPROACHING",
      "block_id": "B17"
    }
  ],
  "signals": { "SIG_HOME_UP": "GREEN", "SIG_STARTER_P1": "RED" },
  "switches": { "SW_01A": "NORMAL", "SW_02B": "REVERSE" }
}
```

### 2. Station Master Channel (`/ws/station-master`)
- **Connection**: `ws://localhost:8000/ws/station-master`
- **Outbound Stream**: Emits `NEW_RECOMMENDATION` whenever CP-SAT computes an optimal dispatch suggestion.
- **Inbound Stream (Client $\to$ Server)**:
```json
{
  "action": "SUBMIT_APPROVAL",
  "recommendation_id": "REC_8841",
  "assigned_track": "OUTER_HOLD_2"
}
```
