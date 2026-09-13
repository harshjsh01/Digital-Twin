from pydantic import BaseModel, Field
from typing import List, Optional

class RadarTrain(BaseModel):
    train_id: str
    train_name: str
    train_type: str
    priority: int
    current_block: str
    eta_min: int
    speed_kmph: float
    delay_min: int
    status: str

class ApproachingRadarResponse(BaseModel):
    station_id: str
    timestamp: float
    lookahead_horizon_min: int = 30
    approaching_trains: List[RadarTrain]

class RecommendationItem(BaseModel):
    recommendation_id: str
    train_id: str
    train_name: str
    priority: int
    eta_min: int
    recommended_action: str  # e.g., "ASSIGN_PLATFORM" or "DIVERT_TO_OUTER_HOLDING"
    assigned_track: str      # e.g., "PLATFORM_2" or "OUTER_HOLD_1"
    alternative_track: str   # e.g., "OUTER_HOLD_1" or "PLATFORM_6"
    outer_wait_min: int = 0
    reasoning: str
    safety_interlock_approved: bool = True
    status: str = "PENDING_APPROVAL"  # "PENDING_APPROVAL", "APPROVED", "OVERRIDDEN"

class RecommendationsResponse(BaseModel):
    generated_at: int
    recommendations: List[RecommendationItem]

class ActionApproveRequest(BaseModel):
    recommendation_id: str
    train_id: str
    assigned_track: str
    dispatcher_id: str = "SM_OFFICER_01"

class ActionApproveResponse(BaseModel):
    status: str
    route_id: str
    signal_id: str
    signal_aspect: str
    switches_aligned: List[str]
    timestamp: int

class ActionOverrideRequest(BaseModel):
    train_id: str
    assigned_track: str
    dispatcher_id: str = "SM_OFFICER_01"
    reason: Optional[str] = "Manual operator reassignment"

class ActionOverrideResponse(BaseModel):
    status: str
    train_id: str
    assigned_track: str
    route_id: Optional[str] = None
    signal_aspect: str
    switches_aligned: List[str]
    message: str
    timestamp: int

class EmergencyAllRedResponse(BaseModel):
    status: str
    affected_signals: List[str]
    message: str
    timestamp: int

class InterlockingConflictDetail(BaseModel):
    status: str = "REJECTED_SAFETY_VIOLATION"
    error_code: str = "INTERLOCKING_CONFLICT"
    detail: str
    signal_aspect: str = "RED"
