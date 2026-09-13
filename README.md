# AAHAVAAN-RAIL
### Predictive Railway Decision Support & Command Center

A high-fidelity, mission-critical railway operations command center and decision support platform engineered for dispatch optimization and 60-minute look-ahead conflict intelligence.

---

## 🚂 Core Narrative & Operational Workflow

AAHAVAAN-RAIL communicates one central operational story:

```
CURRENT NETWORK STATE (10:32 AM)
        ↓
60-MINUTE LOOK-AHEAD SCAN
        ↓
FUTURE CONFLICT DETECTED (C-104 at T+31m, Block B17)
        ↓
DISPATCH OPTIMIZATION (CP-SAT Constraint Solver)
        ↓
BEST DISPATCH RECOMMENDATION (Hold Train 14632 · 3 min)
        ↓
CONFLICT RESOLVED & SIDING ROUTE LOCKED
        ↓
LOWER NETWORK-WIDE DELAY (18 min → 11 min, -39%)
```

A judge or operator can understand the concept within 10 seconds and experience the complete workflow in 60–90 seconds.

---

## ⚡ Key Features

1. **Custom SVG Schematic Topology Visualizer**:
   - 12 Station Hubs along the 110 km Anand Vihar to Khurja arterial corridor.
   - 22 Track Blocks with distinct operational states: `AVAILABLE`, `OCCUPIED`, `RESERVED`, `AT_RISK`, `CONFLICT` (pulsing crimson radar), and `RESOLVED` (emerald clear corridor).
   - Multi-aspect railway signals (Green, Yellow, Red) dynamically reacting to route occupancy.
   - Smoothly animating train tokens with priority badges, speed tags, delay indicators, and direction vectors.
   - Interactive zoom, drag pan, and instant auto-focus on critical junction switches.

2. **60-Minute Look-Ahead Simulation Engine**:
   - Hero action: `RUN 60-MIN LOOK-AHEAD`.
   - Realistic progression through simulation phases: Initializing → Scanning Future Conflicts → Conflict Predicted → Analyzing Resolutions → Optimal Resolution Found → Conflict Resolved.
   - Interactive timeline scrubber with 10-minute milestones.
   - Simulation playback speed toggle: `1x`, `2x`, `5x`.

3. **Deterministic Hero Conflict C-104**:
   - At T+31 min (11:03 AM IST), **Train 12804** (Express, High Priority, Weight 10) and **Train 14632** (Passenger, Normal Priority, Weight 3) converge on **Block B17** (Dadri Central Interlocking Throat Switch).
   - Downstream network delay cascades to 3 trailing trains if unmitigated (+18 min delay).

4. **Dispatch Optimization & Explainable AI**:
   - Evaluates discrete candidate dispatch actions:
     - **Option A (RECOMMENDED)**: Hold Train 14632 in Loop Siding 2 for 3 minutes (Low Network Impact).
     - **Option B**: Hold Train 12804 for 5 minutes (Medium Network Impact).
     - **Option C**: Reroute Train 14632 via outer bypass (High Network Impact).
   - Plain-English **"WHY THIS DECISION?"** explainability card detailing priority weighting formulations, single-occupancy safety invariants, and global delay savings.

5. **Before / After Impact Verification**:
   - **Network Delay**: 18 min $\longrightarrow$ **11 min** ($-39\%$)
   - **Active Conflicts**: 1 $\longrightarrow$ **0** ($-100\%$)
   - **Trains at Risk**: 3 $\longrightarrow$ **1** ($-67\%$)

6. **Operational Forecast Analytics (Recharts)**:
   - Delay Over Time comparison curve (FIFO baseline vs AI look-ahead optimized).
   - Interlocking Conflict Risk Density curve.
   - Track Block Section Utilization heatmap.

7. **Judge Presentation Mode & Command Palette**:
   - Presentation Mode: Fullscreen maximized storytelling canvas for mentors and judges.
   - Command Palette (`Ctrl+K` / `⌘K`): Rapid keyboard access to lookahead simulation, dispatch triggers, camera focus, and scenario switching.

8. **Clean Decoupled Architecture**:
   - Fully functional out-of-the-box in **Mock Mode** with deterministic synthetic operational data (`DEMO MODE · SYNTHETIC OPERATIONAL DATA`).
   - Integrated FastAPI service adapter (`src/lib/api/api.ts`): simply set `NEXT_PUBLIC_API_URL=http://localhost:8000` to connect to a live backend.

---

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router, Server & Client Components)
- **UI & Styling**: React 19, Tailwind CSS v4, Lucide React
- **Data Visualization**: Recharts, Custom Interactive Scalable Vector Graphics (SVG)
- **Language**: TypeScript (Strict type safety across domain models)

---

## 🚀 Getting Started

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to experience the command center.

### Production Build
```bash
npm run build
npm run start
```
