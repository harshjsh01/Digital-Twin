# REST API Endpoint Documentation

This document provides complete reference specifications for all REST API endpoints exposed by the **FastAPI Backend** in **Project Aahavaan - Rail**.

---

## 🌐 Base URL
```text
http://localhost:8000
```
Interactive OpenAPI / Swagger UI: `http://localhost:8000/docs`  
ReDoc Reference: `http://localhost:8000/redoc`

---

## 📌 Endpoint Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/network` | Retrieves the static railway network layout (stations & segments). |
| `GET` | `/api/state` | Returns the current real-time telemetry of all trains in the simulation. |
| `PUT` | `/api/mode` | Sets the simulation operational mode (`UNOPTIMIZED` or `AI_OPTIMIZED`). |
| `POST` | `/api/simulate/tick` | Advances the discrete simulation clock by one minute. |
| `POST` | `/api/simulate/start` | Starts the automated background simulation loop. |
| `POST` | `/api/simulate/stop` | Pauses the automated simulation loop. |

---

## 📖 Endpoint Details

### 1. `GET /api/network`
Retrieves static topological structure including stations, visual coordinates, platforms, loop tracks, and block segment lengths.

#### Response (`200 OK`)
```json
{
  "stations": [
    {
      "id": "STN_00",
      "name": "Station A",
      "coords": { "x": 0, "y": 50 },
      "platforms": 1,
      "loops": 2
    },
    {
      "id": "STN_01",
      "name": "Station B",
      "coords": { "x": 100, "y": 50 },
      "platforms": 1,
      "loops": 2
    }
  ],
  "segments": [
    {
      "id": "SEG_01",
      "from_stn": "STN_00",
      "to_stn": "STN_01",
      "distance_km": 15.0,
      "max_speed_kmph": 110,
      "capacity": 1
    }
  ]
}
```

---

### 2. `GET /api/state`
Returns the instantaneous live snapshot of all train states, coordinates, statuses, and accumulated delays.

#### Response (`200 OK`)
```json
{
  "current_time": 42,
  "trains": [
    {
      "id": "T_12301",
      "name": "Vande Bharat 1",
      "type": "Vande Bharat",
      "priority": 10,
      "status": "MOVING",
      "current_stn": "STN_02",
      "next_stn": "STN_03",
      "pos_km": 8.3,
      "speed_kmph": 160.0,
      "delay_min": 0,
      "completed": false,
      "schedule": [
        {
          "station_id": "STN_00",
          "arrival_min": 0,
          "departure_min": 2
        }
      ]
    }
  ]
}
```

---

### 3. `PUT /api/mode`
Configures the simulation dispatch logic between manual baseline FIFO rules and AI-optimized solver dispatching.

#### Query Parameters
- `mode` *(string, required)*: Either `"UNOPTIMIZED"` or `"AI_OPTIMIZED"`.

#### Example Request
```http
PUT /api/mode?mode=AI_OPTIMIZED HTTP/1.1
Host: localhost:8000
```

#### Response (`200 OK`)
```json
{
  "mode": "AI_OPTIMIZED"
}
```

---

### 4. `POST /api/simulate/tick`
Advances the discrete simulation clock by 1 minute, updates positions, processes departures/arrivals, evaluates block occupancy, and triggers solver re-runs if in AI mode.

#### Response (`200 OK`)
```json
{
  "time": 43,
  "trains": {
    "T_12301": {
      "id": "T_12301",
      "name": "Vande Bharat 1",
      "status": "MOVING",
      "pos_km": 9.96,
      "delay_min": 0
    }
  }
}
```

---

### 5. `POST /api/simulate/start` & `POST /api/simulate/stop`
Starts or halts continuous simulation ticking.

#### Response (`200 OK`)
```json
{
  "status": "started"
}
```
