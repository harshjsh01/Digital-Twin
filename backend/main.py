from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request, status, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException
import asyncio
import json
import os
import sys
import traceback

# Ensure backend root is in sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(CURRENT_DIR)
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from app.api.router import api_v1_router
from app.core.state_manager import state_mgr
from app.core.websocket_manager import ws_manager
from app.safety.interlocking import InterlockingSupervisor

from contextlib import asynccontextmanager

# --- Lifespan Event Handler ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Start background simulation loop
    sim_task = asyncio.create_task(simulation_loop())
    yield
    # Shutdown: Cancel background simulation loop
    sim_task.cancel()

app = FastAPI(
    title="Project Aahavaan - Rail API",
    description="Enterprise Railway Digital Twin, Decision Support, HITL Station Master, Anti-Collision Interlocking & x402 Micropayments",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Enable CORS for Next.js and external frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=[
        "X-Payment-Address",
        "X-Payment-Amount",
        "X-Payment-Network",
        "X-Payment-Facilitator",
        "Authorization"
    ],
)

# --- Global Uncaught Exception Handler ---
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Global catch-all exception handler for uncaught runtime errors.
    Preserves HTTPExceptions with their specific status codes and headers,
    while capturing uncaught errors with full logging and returning structured 500 JSON.
    """
    if isinstance(exc, (HTTPException, StarletteHTTPException)):
        headers = getattr(exc, "headers", None)
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
            headers=headers
        )

    # Format stack trace for server diagnostics
    error_trace = traceback.format_exc()
    print(f"[CRITICAL ERROR] Uncaught exception on {request.method} {request.url.path}: {exc}\n{error_trace}")

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Server Error",
            "message": "An unexpected server error occurred while processing the request.",
            "detail": str(exc),
            "path": request.url.path,
            "method": request.method
        }
    )

# Mount REST API v1
app.include_router(api_v1_router)

# --- WebSocket Channels ---

@app.websocket("/ws/simulator")
async def websocket_simulator_endpoint(websocket: WebSocket):
    """
    Real-time continuous stream of train coordinates, speeds, signals, and switches.
    """
    await ws_manager.connect(websocket, "simulator")
    try:
        # Immediately send current state frame upon connection
        current_state = state_mgr.get_state()
        await websocket.send_json({
            "event": "TRACK_CIRCUIT_UPDATE",
            "timestamp": current_state["timestamp"],
            "trains": current_state["trains"],
            "signals": current_state["signals"],
            "switches": current_state["switches"],
            "occupied_circuits": current_state["occupied_circuits"]
        })

        while True:
            # Keep socket open and accept any inbound client messages/heartbeats
            data = await websocket.receive_text()
            # If client sends ping, respond with pong
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, "simulator")
    except Exception:
        ws_manager.disconnect(websocket, "simulator")


@app.websocket("/ws/station-master")
async def websocket_station_master_endpoint(websocket: WebSocket):
    """
    Bi-directional channel streaming live AI dispatch recommendations and receiving approvals.
    """
    await ws_manager.connect(websocket, "station_master")
    interlocking = InterlockingSupervisor(state_mgr)
    try:
        # Immediately send active recommendations on connection
        await websocket.send_json({
            "event": "RECOMMENDATIONS_STREAM",
            "timestamp": state_mgr.current_time_sec,
            "recommendations": state_mgr.recommendations
        })

        while True:
            raw_msg = await websocket.receive_text()
            try:
                payload = json.loads(raw_msg)
                action = payload.get("action")

                if action == "SUBMIT_APPROVAL":
                    rec_id = payload.get("recommendation_id")
                    track = payload.get("assigned_track")
                    train_id = payload.get("train_id", "T_12301")
                    dispatcher = payload.get("dispatcher_id", "SM_WS_USER")

                    success, details, err_msg = interlocking.check_and_lock_route(
                        train_id=train_id,
                        assigned_track=track,
                        dispatcher_id=dispatcher
                    )

                    if success:
                        # Broadcast confirmation
                        await ws_manager.broadcast("station_master", {
                            "event": "APPROVAL_SUCCESS",
                            "recommendation_id": rec_id,
                            "details": details
                        })
                    else:
                        await websocket.send_json({
                            "event": "SAFETY_VIOLATION_ALERT",
                            "recommendation_id": rec_id,
                            "error": err_msg
                        })

                elif action == "PING":
                    await websocket.send_json({"event": "PONG", "timestamp": state_mgr.current_time_sec})

            except json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, "station_master")
    except Exception:
        ws_manager.disconnect(websocket, "station_master")


# --- Background Simulation Loop ---

sim_background_task = None

async def simulation_loop():
    """
    Background simulation ticker broadcasting state updates at regular intervals.
    """
    while True:
        try:
            if state_mgr.is_running:
                state = state_mgr.step(delta_sec=1.0)
                # Broadcast to simulator channel
                await ws_manager.broadcast("simulator", {
                    "event": "TRACK_CIRCUIT_UPDATE",
                    "timestamp": state["timestamp"],
                    "trains": state["trains"],
                    "signals": state["signals"],
                    "switches": state["switches"],
                    "occupied_circuits": state["occupied_circuits"]
                })
        except Exception as e:
            print(f"Simulation tick background error: {e}")
        await asyncio.sleep(1.0)


# --- Phase 1 Baseline Compatibility Endpoints ---

@app.get("/api/network", tags=["Baseline Compatibility"])
async def get_baseline_network():
    # Return layout converted to legacy network format
    layout = state_mgr.get_layout()
    return {
        "station_id": layout["station_id"],
        "name": layout["name"],
        "stations": [
            {"id": "STN_00", "name": "Station A", "coords": {"x": 0, "y": 50}},
            {"id": "STN_JUNCTION_01", "name": layout["name"], "coords": {"x": 500, "y": 50}},
            {"id": "STN_07", "name": "Station H", "coords": {"x": 1000, "y": 50}}
        ],
        "platforms": layout["platforms"],
        "outer_waiting_tracks": layout["outer_waiting_tracks"],
        "signals": layout["signals"],
        "switches": layout["switch_points"]
    }

@app.get("/api/state", tags=["Baseline Compatibility"])
async def get_baseline_state():
    return {
        "current_time": state_mgr.current_time_min,
        "trains": list(state_mgr.trains.values())
    }

@app.post("/api/simulate/start", tags=["Baseline Compatibility"])
async def start_baseline_simulation():
    state_mgr.is_running = True
    return {"status": "started"}

@app.put("/api/mode", tags=["Baseline Compatibility"])
async def set_baseline_mode(mode: str):
    state_mgr.mode = mode
    return {"mode": state_mgr.mode}

@app.post("/api/simulate/tick", tags=["Baseline Compatibility"])
async def manual_baseline_tick():
    state = state_mgr.step(delta_sec=60.0)
    return {
        "current_time": state_mgr.current_time_min,
        "time": state_mgr.current_time_min,
        "trains": list(state_mgr.trains.values())
    }

if __name__ == "__main__":
    import uvicorn
    # Specify app_dir=CURRENT_DIR so uvicorn reliably imports backend/main.py from any working directory
    uvicorn.run("main:app", app_dir=CURRENT_DIR, host="0.0.0.0", port=8000, reload=True)
