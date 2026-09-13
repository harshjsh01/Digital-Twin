# Multi-Service Installation, Configuration & Setup Guide (`docs/setup_guide.md`)

This guide provides step-by-step instructions to install, configure, and run all four decoupled domains of **Project Aahavaan - Rail**:
1. **AI & Optimization Core** (`models/`)
2. **FastAPI & Safety Backend** (`backend/`)
3. **Dual Industrial Frontends** (`frontend/simulator/` & `frontend/station-commander/`)
4. **Passenger Client Portal with x402 Algorand** (`client/`)

---

## 🛠️ Global Prerequisites

Ensure the following environments are installed on your host machine:
- **Python**: Version `3.10` or higher (`python --version`)
- **Node.js**: Version `18.17.0` or higher (`node -v`)
- **npm**: Version `9.x` or higher (`npm -v`)
- **Git**: For version control (`git --version`)
- **Algorand Wallet**: Pera Wallet or Defly (configured on **Algorand Testnet**) for payment verification testing.

---

## 📦 Service Port Allocation Matrix

| Service / Application | Directory Path | Technology Stack | Default Local URL / Port |
| :--- | :--- | :--- | :--- |
| **FastAPI Backend & WS** | `backend/` | Python 3.11, FastAPI, Uvicorn | `http://localhost:8000` |
| **Station Simulator** | `frontend/simulator/` | Next.js / Vite, Framer Motion | `http://localhost:3000` |
| **Station Commander** | `frontend/station-commander/` | Next.js 15, Recharts, Lucide | `http://localhost:3001` |
| **Passenger Client Portal** | `client/` | Next.js 15, @x402-avm, algosdk | `http://localhost:3002` |

---

## 🧠 STEP 1: AI & Optimization Setup (`models/`)

### 1.1 Generate Synthetic High-Density Corridor Dataset
```bash
# From project root
python models/datasets/synthetic_generator.py
```
*Outputs: Generates normalized timetable and section graph in `models/datasets/processed/`.*

### 1.2 Run OR-Tools CP-SAT Solver Stress Benchmark
```bash
python models/station_optimizer/benchmarks.py
```
*Verification: Confirms 0 collisions, 0 deadlocks, and solver latency $< 50\text{ms}$.*

---

## ⚙️ STEP 2: FastAPI & Safety Backend Setup (`backend/`)

### 2.1 Navigate and Activate Virtual Environment
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### 2.2 Install Backend Dependencies
```powershell
pip install -r requirements.txt
```
*(Packages installed: `fastapi`, `uvicorn`, `pydantic`, `ortools`, `py-algorand-sdk`, `pandas`, `websockets`)*

### 2.3 Configure Environment Variables (Optional)
Create `backend/.env`:
```env
PORT=8000
ALGORAND_INDEXER_URL=https://testnet-idx.algonode.cloud
ALGORAND_TREASURY_ADDRESS=AAHAVAAN7RAILX402TREASURYTESTNETWALLET
SUBSCRIPTION_PRICE_MICROALGOS=100000
```

### 2.4 Start the FastAPI Server
```powershell
python main.py
```
> Server will be listening on **`http://localhost:8000`**  
> Interactive OpenAPI documentation: **`http://localhost:8000/docs`**

---

## 🚆 STEP 3: Frontend Applications Setup (`frontend/`)

### 3.1 Start App 1: Station Digital Twin Simulator (Port 3000)
Open a new terminal:
```powershell
cd frontend/simulator
npm install
npm run dev -- -p 3000
```
> Station Simulator visualizer accessible at **`http://localhost:3000`**

### 3.2 Start App 2: Station Commander Operational Portal (Port 3001)
Open a new terminal:
```powershell
cd frontend/station-commander
npm install
npm run dev -- -p 3001
```
> Station Master Cockpit accessible at **`http://localhost:3001`**

---

## 📱 STEP 4: Passenger Client Web & x402 Algorand Setup (`client/`)

### 4.1 Install Client Dependencies
Open a new terminal:
```powershell
cd client
npm install
```
*(Installs `@x402-avm`, `algosdk`, `@perawallet/connect`, `lucide-react`, `tailwindcss`)*

### 4.2 Start the Passenger Web App (Port 3002)
```powershell
npm run dev -- -p 3002
```
> Passenger Portal accessible at **`http://localhost:3002`**

---

## 🧪 End-to-End Verification & Testing

### 1. Test Backend REST Telemetry
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/simulator/layout"
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/station-master/radar"
```

### 2. Test Station Master HITL Approval Flow
```powershell
$body = @{
    recommendation_id = "REC_TEST_01"
    train_id = "T_12301"
    assigned_track = "PLATFORM_2"
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "http://localhost:8000/api/v1/station-master/action/approve" -Body $body -ContentType "application/json"
```

### 3. Test HTTP 402 Payment Challenge
```powershell
try {
    Invoke-WebRequest -Uri "http://localhost:8000/api/v1/passenger/train/T_12301/why-stopped"
} catch {
    $response = $_.Exception.Response
    Write-Host "HTTP Status Code:" $response.StatusCode.value__
    Write-Host "X-Payment-Address:" $response.Headers["X-Payment-Address"]
    Write-Host "X-Payment-Amount:" $response.Headers["X-Payment-Amount"]
}
```
*Expected Output: HTTP Status 402 with Algorand payment headers.*
