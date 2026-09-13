from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
from app.core.state_manager import state_mgr
from app.safety.interlocking import InterlockingSupervisor
from app.services.recommendation_srv import RecommendationService
from app.schemas.station import (
    ApproachingRadarResponse,
    RecommendationsResponse,
    ActionApproveRequest,
    ActionApproveResponse,
    ActionOverrideRequest,
    ActionOverrideResponse,
    EmergencyAllRedResponse,
    InterlockingConflictDetail
)

router = APIRouter()
interlocking = InterlockingSupervisor(state_mgr)
rec_service = RecommendationService(state_mgr)

@router.get(
    "/radar",
    response_model=ApproachingRadarResponse,
    summary="Station Radar - Approaching Trains Queue",
    description="Approaching train queue within the 30-minute lookahead horizon."
)
async def get_radar():
    trains = state_mgr.get_radar_trains()
    return {
        "station_id": state_mgr.station_id,
        "timestamp": state_mgr.current_time_sec,
        "lookahead_horizon_min": 30,
        "approaching_trains": trains
    }

@router.get(
    "/recommendations",
    response_model=RecommendationsResponse,
    summary="AI Dispatcher Recommendations",
    description="AI-generated platform allocation and holding track suggestions from constraint solver."
)
async def get_recommendations():
    recs = rec_service.generate_recommendations()
    return {
        "generated_at": state_mgr.current_time_min,
        "recommendations": recs
    }

@router.post(
    "/action/approve",
    response_model=ActionApproveResponse,
    responses={
        409: {"model": InterlockingConflictDetail, "description": "Interlocking Safety Violation"}
    },
    summary="Approve AI Recommendation (HITL)",
    description="Human-in-the-Loop approval: locks route, throws switches, and sets Green signal aspect."
)
async def approve_recommendation(payload: ActionApproveRequest):
    # Safety Interlocking Check & Route Lock
    success, details, err_msg = interlocking.check_and_lock_route(
        train_id=payload.train_id,
        assigned_track=payload.assigned_track,
        dispatcher_id=payload.dispatcher_id
    )

    if not success:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={
                "status": "REJECTED_SAFETY_VIOLATION",
                "error_code": "INTERLOCKING_CONFLICT",
                "detail": err_msg,
                "signal_aspect": "RED"
            }
        )

    # Mark recommendation status as APPROVED
    for r in state_mgr.recommendations:
        if r["recommendation_id"] == payload.recommendation_id or r["train_id"] == payload.train_id:
            r["status"] = "APPROVED"

    return details

@router.post(
    "/action/override",
    response_model=ActionOverrideResponse,
    responses={
        409: {"model": InterlockingConflictDetail, "description": "Interlocking Safety Violation"}
    },
    summary="Manual Override Track Assignment",
    description="Manual override of platform/holding track assignment with safety interlocking check."
)
async def override_assignment(payload: ActionOverrideRequest):
    success, details, err_msg = interlocking.check_and_lock_route(
        train_id=payload.train_id,
        assigned_track=payload.assigned_track,
        dispatcher_id=payload.dispatcher_id
    )

    if not success:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={
                "status": "REJECTED_SAFETY_VIOLATION",
                "error_code": "INTERLOCKING_CONFLICT",
                "detail": err_msg,
                "signal_aspect": "RED"
            }
        )

    # Mark existing recommendations as OVERRIDDEN
    for r in state_mgr.recommendations:
        if r["train_id"] == payload.train_id:
            r["status"] = "OVERRIDDEN"

    return {
        "status": "OVERRIDE_APPROVED_AND_LOCKED",
        "train_id": payload.train_id,
        "assigned_track": payload.assigned_track,
        "route_id": details.get("route_id"),
        "signal_aspect": details.get("signal_aspect", "GREEN"),
        "switches_aligned": details.get("switches_aligned", []),
        "message": f"Manual override to {payload.assigned_track} verified by Safety Interlocking.",
        "timestamp": int(state_mgr.current_time_sec)
    }

@router.post(
    "/action/emergency-all-red",
    response_model=EmergencyAllRedResponse,
    summary="Emergency All-Red Stop",
    description="Failsafe emergency stop setting all station signals to Danger (Red) and halting trains."
)
async def emergency_all_red():
    result = interlocking.emergency_all_red()
    return result
