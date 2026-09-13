from fastapi import APIRouter, Query, Header
from typing import Optional
from app.payments.service import payment_service
from app.core.security import decode_access_token
from app.schemas.payment import (
    PricingResponse,
    VerifyProofRequest,
    VerifyProofResponse,
    SubscriptionStatusResponse,
)
import database

router = APIRouter()

@router.get(
    "/pricing",
    response_model=PricingResponse,
    summary="Get Subscription Pricing Terms",
    description="Returns ₹9 subscription terms and equivalent microAlgos on Algorand Testnet."
)
async def get_pricing():
    return payment_service.get_pricing()

@router.post(
    "/verify-proof",
    response_model=VerifyProofResponse,
    summary="Verify Algorand Transaction Proof",
    description="Validates an on-chain transaction hash submitted by @x402-avm client or Pera Wallet, stores subscription in MongoDB, upgrades user to premium, and issues a 30-day JWT pass."
)
async def verify_proof(
    payload: VerifyProofRequest,
    authorization: Optional[str] = Header(None)
):
    result = payment_service.verify_proof(
        tx_id=payload.tx_id,
        wallet_address=payload.wallet_address,
        plan=payload.plan or "MONTHLY_PASS_INR_9"
    )

    # Save to MongoDB subscriptions
    username = None
    if authorization:
        token_payload = decode_access_token(authorization)
        if token_payload:
            username = token_payload.get("sub")
            if username:
                database.set_user_premium_status(username, True)

    database.save_subscription(
        wallet_address=payload.wallet_address,
        tx_id=payload.tx_id,
        amount_microalgos=result["amount_microalgos"],
        expires_at=result["valid_until"],
        network="algorand-testnet",
        username=username
    )

    return result

@router.get(
    "/subscription-status",
    response_model=SubscriptionStatusResponse,
    summary="Check Active Subscription Status",
    description="Checks active 30-day pass status for a given Algorand wallet address from MongoDB."
)
async def get_subscription_status(wallet: str = Query(..., description="Algorand wallet address to check")):
    # Check MongoDB first
    mongo_sub = database.get_subscription_by_wallet(wallet)
    if mongo_sub and mongo_sub.get("is_active"):
        return {
            "wallet_address": wallet,
            "is_active": True,
            "expires_at": mongo_sub.get("expires_at"),
            "plan": "MONTHLY_PASS_INR_9",
            "days_remaining": 30,
            "message": "Active 30-day subscription verified in MongoDB."
        }
    result = payment_service.get_subscription_status(wallet)
    return result
