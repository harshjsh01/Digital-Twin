# System Workflows & Sequence Diagrams (`docs/workflow_chart.md`)

This document visualizes the complete end-to-end user journeys, system workflows, and protocol lifecycles across the **Phase 2** architecture of **Project Aahavaan - Rail**.

---

## 1. Multi-Frontend Ecosystem Architecture Flow

```mermaid
flowchart TD
    subgraph Data & AI Core [/models/]
        D1[(Raw IR Timetables)] --> ML[LightGBM Delay Predictor]
        D2[(Synthetic Stress Profiles)] --> ML
        ML -->|Dynamic ETAs| CPSAT[Google OR-Tools CP-SAT Solver]
        CPSAT -->|Ranked Platform & Outer Track Solution| BE
    end

    subgraph FastAPI Backend & Safety Core [/backend/]
        BE[FastAPI Event Engine] <--> STATEMGR[In-Memory Digital Twin State]
        BE <--> INTLOCK{Anti-Collision Interlocking Supervisor}
        INTLOCK -->|Validate Route Lock| SIG[Signal System & Point Switches]
        BE --> EXPLAIN[Wait-Log Reasoning Generator]
        BE <--> ALGO[Algorand Testnet & x402 Verifier]
    end

    subgraph Frontend 1: Station Simulator [/frontend/simulator/]
        BE ==WebSocket /ws/simulator==> SIM_UI[6-Platform Physical Canvas & Outer Holding Tracks]
    end

    subgraph Frontend 2: Station Commander [/frontend/station-commander/]
        BE ==WebSocket /ws/station-master==> CMD_UI[Incoming Radar & AI Suggestions]
        CMD_UI -->|HITL One-Click Approve / Override| BE
    end

    subgraph Frontend 3: Passenger Client Portal [/client/]
        CLIENT_UI[Train Search & Live Tracker] -->|GET /why-stopped| BE
        BE -->|HTTP 402 Payment Required| CLIENT_UI
        CLIENT_UI -->|Micro-Payment 0.1 ALGO| WALLET[Pera / Defly Wallet @x402-avm]
        WALLET -->|On-Chain TX| BLOCKCHAIN[(Algorand Testnet)]
        BLOCKCHAIN -->|Confirmed Round| ALGO
        CLIENT_UI -->|X-Payment-Proof| BE
        BE -->|Unlocked Explainable Wait Log| CLIENT_UI
    end
```

---

## 2. Station Master Human-in-the-Loop (HITL) Approval Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Train as Incoming Train (e.g. Rajdhani 12301)
    participant Radar as Station Radar (FastAPI)
    participant Solver as CP-SAT Optimization Solver
    actor SM as Station Master (Commander Portal)
    participant Interlock as Safety Interlocking Guard
    participant Signals as Physical Signals & Switches (Simulator)

    Train->>Radar: Crosses Outer Block Boundary (25 km out, ETA: 6 min)
    Radar->>Solver: Request Optimal Platform or Outer Holding Allocation
    Solver->>Solver: Evaluate Platform Occupancy (P1-P6) & Outer Siding (H1-H4)
    Solver-->>Radar: Recommendation: Assign Platform 2 (Avoids Freight conflict)
    Radar->>SM: Display AI Suggestion Card with Rationale
    
    alt Station Master Approves
        SM->>Radar: Clicks [APPROVE RECOMMENDATION]
        Radar->>Interlock: Request Route Lock for Platform 2
        Interlock->>Interlock: Verify Zero Conflicting Route Locks & Fouling Points Clear
        Interlock-->>Signals: Throw Switches (Normal/Reverse) & Set Home Signal = GREEN
        Signals-->>Train: Signal Green Aspect Displayed
        Radar-->>SM: Status: "ROUTE LOCKED & GREEN ASPECT SET"
    else Station Master Overrides
        SM->>Radar: Selects Manual Override: Platform 4
        Radar->>Interlock: Validate Platform 4 Feasibility
        alt Platform 4 Clear
            Interlock-->>Signals: Lock Route for Platform 4 & Set Signal = GREEN
            Radar-->>SM: Status: "OVERRIDE ACCEPTED - ROUTE LOCKED"
        else Platform 4 Occupied
            Interlock-->>Radar: SAFETY VIOLATION: Platform 4 Occupied!
            Radar-->>SM: Display Error: "CONFLICT PREVENTED - COMMAND REJECTED"
        end
    end
```

---

## 3. Passenger x402 + Algorand Micropayment Subscription Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Passenger as Commuter Passenger
    participant App as Client Portal (Next.js)
    participant API as FastAPI Backend (/api/v1/passenger)
    participant Wallet as Algorand Wallet (@x402-avm)
    participant Chain as Algorand Testnet Blockchain

    Passenger->>App: Clicks "Why is My Train Stopped?" on Train 12301
    App->>API: GET /api/v1/passenger/train/12301/why-stopped
    API-->>App: HTTP 402 Payment Required
    Note over App,API: Headers: X-Payment-Address, X-Payment-Amount: 100000 microAlgos (~Rs. 9)
    App->>Passenger: Open x402 Payment Modal: "₹9/mo Premium Pass"
    Passenger->>App: Click [Pay with Algorand Wallet]
    App->>Wallet: Invoke @x402-avm Payment Client
    Wallet->>Passenger: Request 1-Click Signature for 0.1 ALGO
    Passenger->>Wallet: Confirms Transaction
    Wallet->>Chain: Broadcast Payment Transaction to Algorand Testnet
    Chain-->>Wallet: Transaction Confirmed (~3.3s Finality, TX_ID: 0xW7X...)
    Wallet-->>App: Return TX_ID Proof
    App->>API: Retry GET /why-stopped with Header X-Payment-Proof: 0xW7X...
    API->>Chain: Verify Receiver == Treasury & Amount >= 100,000 microAlgos
    Chain-->>API: Verified Confirmed in Round 42109845
    API->>API: Issue 30-Day Subscription JWT Pass
    API-->>App: HTTP 200 OK with Explainable Wait Reason
    App->>Passenger: Display Plain-English Reason: "Held 6 mins to grant precedence to Vande Bharat"
```
