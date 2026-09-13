from pydantic import BaseModel
from typing import List, Optional, Any, Dict

class TrainSearchResultItem(BaseModel):
    id: str
    name: str
    type: str
    priority: int
    origin: str
    destination: str
    current_status: str
    delay_min: int

class TrainSearchResponse(BaseModel):
    results: List[TrainSearchResultItem]

class TrainStatusResponse(BaseModel):
    id: str
    name: str
    type: str
    priority: int
    speed_kmph: float
    current_track: str
    next_station: str
    delay_min: int
    status: str
    x: float = 0.0
    y: float = 0.0
    last_updated: float

class TechnicalConflict(BaseModel):
    conflicting_train: str
    conflict_section: str
    priority_comparison: str

class WhyStoppedResponse(BaseModel):
    train_id: str
    train_name: str
    is_stopped: bool
    stopped_at_location: str
    duration_stopped_min: int
    expected_clearance_min: int
    plain_english_reason: str
    technical_conflict: Optional[TechnicalConflict] = None

class PaymentRequiredResponse(BaseModel):
    error: str = "Payment Required"
    message: str = "Access to explainable real-time delay diagnostics requires an active ₹9/month Aahavaan Pass settled via x402 on Algorand."
    price_inr: float = 9.0
    price_microalgos: int = 100000
    currency: str = "ALGO"
    network: str = "testnet"
