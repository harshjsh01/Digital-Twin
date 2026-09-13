from fastapi import APIRouter
from app.core.state_manager import state_mgr
from app.schemas.simulation import (
    StationLayoutResponse,
    SimulatorStateResponse,
    TickControlRequest,
    PlaybackControlRequest,
    SimulationTickResponse,
)

router = APIRouter()

@router.get(
    "/layout",
    response_model=StationLayoutResponse,
    summary="Get 6-Platform Junction Layout",
    description="Returns the physical topology of the 6-platform junction station and 4 outer waiting tracks."
)
async def get_layout():
    return state_mgr.get_layout()

@router.get(
    "/state",
    response_model=SimulatorStateResponse,
    summary="Get Simulator Instantaneous State",
    description="Returns current coordinates, speeds, track circuit occupancy, switch alignments, and signal aspects."
)
async def get_state():
    return state_mgr.get_state()

@router.post(
    "/control/tick",
    response_model=SimulationTickResponse,
    summary="Step Simulation Tick",
    description="Steps physical and discrete simulation forward by specified seconds or step minutes."
)
async def control_tick(payload: TickControlRequest = TickControlRequest()):
    delta = payload.seconds if payload.step_minutes is None else payload.step_minutes * 60.0
    state = state_mgr.step(delta)
    return {
        "status": "OK",
        "timestamp": state["timestamp"],
        "current_time_min": state_mgr.current_time_min,
        "trains_count": len(state["trains"])
    }

@router.post(
    "/control/playback",
    summary="Control Playback Speed and Pause",
    description="Controls playback rate (1x, 5x, 20x) and pause state."
)
async def control_playback(payload: PlaybackControlRequest):
    state_mgr.playback_speed = payload.rate
    state_mgr.is_running = payload.is_running
    return {
        "status": "UPDATED",
        "rate": state_mgr.playback_speed,
        "is_running": state_mgr.is_running,
        "timestamp": state_mgr.current_time_sec
    }
