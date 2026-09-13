# Project Aahavaan - Rail: FastAPI Backend

High-performance digital twin simulation backend, Human-in-the-Loop (HITL) dispatch decision support, Anti-Collision Interlocking safety system, and x402 Algorand subscription micropayment verification endpoints.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run the Server
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
- **Interactive OpenAPI Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc Interactive Documentation**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### 3. Run Automated Endpoint & WebSocket Tests
```bash
python test_api.py
python test_ws.py
```

---

## 📌 Endpoint Summary

| Domain | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Authentication** | `POST` | `/api/v1/auth/register` | Registers passenger account in MongoDB with bcrypt password hash |
| | `POST` | `/api/v1/auth/login` | Authenticates credentials and issues JWT token |
| | `GET` | `/api/v1/auth/me` | Retrieves user profile and live `is_premium` status |
| | `POST` | `/api/v1/auth/upgrade-premium` | Upgrades/toggles user's `is_premium` status in MongoDB |
| **Simulator** | `GET` | `/api/v1/simulator/layout` | 6 platforms, 4 outer waiting tracks, switches, signals |
| | `GET` | `/api/v1/simulator/state` | Instantaneous train coordinates, track circuits, switches, signals |
| | `POST` | `/api/v1/simulator/control/tick` | Steps physical and discrete simulation forward |
| | `POST` | `/api/v1/simulator/control/playback` | Controls playback rate ($1\times, 5\times, 20\times$) and pause state |
| | `WS` | `/ws/simulator` | Real-time 60Hz stream of train positions and signal aspects |
| **Station Master** | `GET` | `/api/v1/station-master/radar` | Approaching train queue within 30-minute lookahead horizon |
| | `GET` | `/api/v1/station-master/recommendations` | AI-generated platform allocation and holding track suggestions |
| | `POST` | `/api/v1/station-master/action/approve` | HITL approval: locks route, aligns switches, displays Green aspect (or returns 409 Conflict) |
| | `POST` | `/api/v1/station-master/action/override` | Manual override with real-time safety interlocking validation |
| | `POST` | `/api/v1/station-master/action/emergency-all-red` | Failsafe emergency stop setting all station signals to Danger (Red) |
| | `WS` | `/ws/station-master` | Bi-directional stream for recommendations and approvals |
| **Passenger** | `GET` | `/api/v1/passenger/train/search` | Search trains by train number or name |
| | `GET` | `/api/v1/passenger/train/{id}/status` | Public real-time tracking (speed, track, next station, delay) |
| | `GET` | `/api/v1/passenger/train/{id}/why-stopped` | Explainable AI delay reasoning (Protected by x402 Algorand) |
| **x402 Payments** | `GET` | `/api/v1/payments/pricing` | Returns ₹9 subscription terms and equivalent microAlgos (100,000) |
| | `POST` | `/api/v1/payments/verify-proof` | Validates transaction hash and issues 30-day JWT pass |
| | `GET` | `/api/v1/payments/subscription-status` | Checks active subscription status for a wallet address |
| **Baseline** | `GET` | `/api/network` | Phase 1 baseline static network topology |
| | `GET` | `/api/state` | Phase 1 baseline train telemetry list |
| | `PUT` | `/api/mode` | Toggles between `UNOPTIMIZED` and `AI_OPTIMIZED` modes |
| | `POST` | `/api/simulate/tick` | Phase 1 discrete minute simulation tick |
