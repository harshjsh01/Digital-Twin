# System Workflow & User Journey

This document visualizes the end-to-end user journey and internal system workflows for **Project Aahavaan - Rail (Indian Railways Digital Twin)**.

---

## 1. End-to-End System Workflow

```mermaid
flowchart TD
    subgraph Data Layer
        A1[Network Configuration: network.json] --> S[Simulation Engine]
        A2[Train Timetable: timetable.json] --> S
    end

    subgraph Simulation & Intelligence Core
        S -->|Current State & Topology| CD{Conflict Detection<br/>60-min Lookahead}
        CD -->|No Overlap| EXEC[Execute Default Schedule]
        CD -->|Track Bottleneck Detected| OPT[Google OR-Tools CP-SAT Solver]
        OPT -->|Minimize Priority-Weighted Delay| RES[Generate Optimal Departures & Loop Holds]
        RES --> S
    end

    subgraph FastAPI REST Service
        S --> API1[GET /api/network]
        S --> API2[GET /api/state]
        API3[PUT /api/mode] --> S
        API4[POST /api/simulate/tick] --> S
    end

    subgraph Next.js Command Center
        API1 --> UI[Control Room Dashboard]
        API2 --> UI
        UI -->|Mode Toggle: UNOPTIMIZED / AI_OPTIMIZED| API3
        UI -->|Manual/Auto Simulation Clock| API4
        UI --> MAP[Live Track Map: SVG/Canvas]
        UI --> METRICS[Delay Comparison Chart]
        UI --> LOG[Decision Action Feed]
    end
```

---

## 2. Dispatcher / Controller User Journey

```mermaid
sequenceDiagram
    autonumber
    actor Controller as Chief Train Controller
    participant UI as Next.js Control Room
    participant API as FastAPI Backend
    participant Sim as Simulation Engine
    participant Brain as OR-Tools CP-SAT Brain

    Controller->>UI: Opens Dashboard (http://localhost:3000)
    UI->>API: GET /api/network & GET /api/state
    API-->>UI: Static Topology & Initial Train States
    UI->>Controller: Render 8-Station Route & 20 Active Trains

    Controller->>UI: Click "RESUME" (Start Simulation)
    loop Every 500ms (1 Sim Minute Tick)
        UI->>API: POST /api/simulate/tick
        API->>Sim: Advance Time Step
        Sim-->>API: Updated Coordinates, Delays, Status
        API-->>UI: Live Telemetry Payload
        UI->>UI: Smoothly Animate Trains & Update Delay Widgets
    end

    Controller->>UI: Toggle Mode to "AI MODE ACTIVE"
    UI->>API: PUT /api/mode?mode=AI_OPTIMIZED
    API->>Brain: Trigger Lookahead Conflict Resolver
    Brain->>Brain: Evaluate Precedence Constraints & Loop Hold Costs
    Brain-->>API: Optimized Dispatch Timetable
    API-->>UI: AI Decisions Broadcast
    UI->>Controller: Log Actions (e.g., Hold Freight at Loop for Vande Bharat)
```

---

## 3. Conflict Detection & Resolution Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Idle: Train at Station
    Idle --> Moving: Departure Time Reached
    
    state Moving {
        [*] --> CheckNextBlock
        CheckNextBlock --> MainLine: Block Clear
        CheckNextBlock --> LoopLine: AI Held / Overtake Required
        MainLine --> Transit: Moving at Speed (60-160 km/h)
        LoopLine --> WaitLoop: Hold until Express clears
        WaitLoop --> Transit: Signal Green
    }
    
    Transit --> ArrivedStation: Reached Next Station
    ArrivedStation --> Idle: Dwell & Next Leg
    ArrivedStation --> Completed: Final Destination Reached
    Completed --> [*]
```
