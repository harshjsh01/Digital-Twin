from pydantic import BaseModel, Field
from typing import Optional

class PricingResponse(BaseModel):
    plan_name: str = "Aahavaan Rail Pass - Monthly"
    price_inr: float = 9.0
    price_microalgos: int = 100000
    price_algo: float = 0.1
    network: str = "algorand-testnet"
    treasury_address: str = "AAHAVAAN7RAILX402TREASURYTESTNETWALLET"
    facilitator: str = "GoPlausible-AVM-Facilitator"
    description: str = "30-day unrestricted access to explainable real-time delay diagnostics and deep telemetry."

class VerifyProofRequest(BaseModel):
    tx_id: str = Field(..., description="Algorand Testnet transaction ID / hash")
    wallet_address: str = Field(..., description="Passenger Algorand wallet address")
    plan: Optional[str] = "MONTHLY_PASS_INR_9"

class VerifyProofResponse(BaseModel):
    status: str = "VERIFIED_ON_CHAIN"
    confirmed_round: int = 42109845
    amount_microalgos: int = 100000
    subscription_token: str
    valid_until: str
    message: str = "Subscription active. Welcome to Aahavaan Premium Rail Telemetry."

class SubscriptionStatusResponse(BaseModel):
    wallet_address: str
    is_active: bool
    expires_at: Optional[str] = None
    plan: Optional[str] = "MONTHLY_PASS_INR_9"
    days_remaining: Optional[int] = 30
    message: str
