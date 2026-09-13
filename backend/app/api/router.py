from fastapi import APIRouter
from app.api.v1.simulator import router as simulator_router
from app.api.v1.station_master import router as station_master_router
from app.api.v1.passenger import router as passenger_router
from app.api.v1.payments import router as payments_router
from app.api.v1.auth import router as auth_router

api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(
    auth_router,
    prefix="/auth",
    tags=["Authentication & Users"]
)

api_v1_router.include_router(
    simulator_router,
    prefix="/simulator",
    tags=["Physical Simulator"]
)

api_v1_router.include_router(
    station_master_router,
    prefix="/station-master",
    tags=["Station Master & HITL"]
)

api_v1_router.include_router(
    passenger_router,
    prefix="/passenger",
    tags=["Passenger & Explainability"]
)

api_v1_router.include_router(
    payments_router,
    prefix="/payments",
    tags=["x402 Algorand Payments"]
)
