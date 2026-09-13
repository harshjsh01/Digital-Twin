from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any

class PlatformSchema(BaseModel):
    id: str
    track_id: str
    length_m: int
    max_speed_kmph: int
    is_occupied: bool = False
    occupant_train_id: Optional[str] = None

class OuterWaitingTrackSchema(BaseModel):
    id: str
    track_id: str
    capacity: int = 1
    description: str
    is_occupied: bool = False
    occupant_train_id: Optional[str] = None

class SwitchPointSchema(BaseModel):
    id: str
    location_km: float
    state: str = "NORMAL"  # "NORMAL" or "REVERSE"
    locked_for_route_id: Optional[str] = None

class SignalHeadSchema(BaseModel):
    id: str
    type: str = "4_ASPECT"
    aspect: str = "RED"  # "RED", "YELLOW", "DOUBLE_YELLOW", "GREEN"
    protecting_block_id: Optional[str] = None

class StationLayoutResponse(BaseModel):
    station_id: str
    name: str
    platforms: List[PlatformSchema]
    outer_waiting_tracks: List[OuterWaitingTrackSchema]
    switch_points: List[SwitchPointSchema]
    signals: List[SignalHeadSchema]

class SimulatorTrainTelemetry(BaseModel):
    id: str
    name: Optional[str] = None
    type: Optional[str] = None
    priority: Optional[int] = None
    x: float = 0.0
    y: float = 0.0
    speed_kmph: float = 0.0
    status: str = "MOVING"  # "MOVING", "WAITING_OUTER", "DWELLING_PLATFORM", "STOPPED"
    block_id: str
    current_delay_min: int = 0
    assigned_track: Optional[str] = None

class SimulatorStateResponse(BaseModel):
    timestamp: float
    is_running: bool
    playback_speed: float
    trains: List[SimulatorTrainTelemetry]
    signals: Dict[str, str]
    switches: Dict[str, str]
    occupied_circuits: List[str]

class TickControlRequest(BaseModel):
    seconds: float = Field(default=1.0, description="Number of seconds to advance simulation")
    step_minutes: Optional[int] = Field(default=None, description="Number of minutes to advance discrete sim")

class PlaybackControlRequest(BaseModel):
    rate: float = Field(default=1.0, description="Playback multiplier: 1.0, 5.0, 20.0")
    is_running: bool = Field(default=True, description="Whether simulation is currently running")

class SimulationTickResponse(BaseModel):
    status: str = "OK"
    timestamp: float
    current_time_min: int
    trains_count: int
