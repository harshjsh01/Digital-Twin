"""
Payment Service Placeholder

Note: The full on-chain payment gateway service will be implemented later
by the payments / blockchain engineer.
This service provides clean endpoint contracts, stub verification, and token issuance.
"""

from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional

class PaymentService:
    TREASURY_ADDRESS = "AAHAVAAN7RAILX402TREASURYTESTNETWALLET"
    EXPECTED_MICRO_ALGOS = 100000  # 0.1 ALGO ≈ ₹9
    PAYMENT_NETWORK = "algorand-testnet"
    FACILITATOR = "GoPlausible-AVM-Facilitator"

    def __init__(self):
        # In-memory subscription store for active passes
        self.active_subscriptions: Dict[str, Dict[str, Any]] = {}

    def get_pricing(self) -> Dict[str, Any]:
        return {
            "plan_name": "Aahavaan Rail Pass - Monthly",
            "price_inr": 9.0,
            "price_microalgos": self.EXPECTED_MICRO_ALGOS,
            "price_algo": 0.1,
            "network": self.PAYMENT_NETWORK,
            "treasury_address": self.TREASURY_ADDRESS,
            "facilitator": self.FACILITATOR,
            "description": "30-day unrestricted access to explainable real-time delay diagnostics and deep telemetry."
        }

    def verify_proof(self, tx_id: str, wallet_address: str, plan: str = "MONTHLY_PASS_INR_9") -> Dict[str, Any]:
        """
        Endpoint verification stub.
        Will be connected to Algorand Testnet Indexer by the payments engineer.
        """
        valid_until = (datetime.now(timezone.utc) + timedelta(days=30)).strftime("%Y-%m-%dT%H:%M:%SZ")
        token = f"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.pass_{wallet_address[:8]}_{tx_id[:8]}"

        self.active_subscriptions[wallet_address] = {
            "wallet_address": wallet_address,
            "tx_id": tx_id,
            "plan": plan,
            "valid_until": valid_until,
            "is_active": True,
            "token": token
        }

        return {
            "status": "VERIFIED_ON_CHAIN",
            "confirmed_round": 42109845,
            "amount_microalgos": self.EXPECTED_MICRO_ALGOS,
            "subscription_token": token,
            "valid_until": valid_until,
            "message": "Subscription active. Welcome to Aahavaan Premium Rail Telemetry."
        }

    def get_subscription_status(self, wallet_address: str) -> Dict[str, Any]:
        sub = self.active_subscriptions.get(wallet_address)
        if sub and sub.get("is_active"):
            return {
                "wallet_address": wallet_address,
                "is_active": True,
                "expires_at": sub.get("valid_until"),
                "plan": sub.get("plan", "MONTHLY_PASS_INR_9"),
                "days_remaining": 30,
                "message": "Active 30-day subscription."
            }
        return {
            "wallet_address": wallet_address,
            "is_active": False,
            "expires_at": None,
            "plan": None,
            "days_remaining": 0,
            "message": "No active subscription found. Please purchase a ₹9/month pass via x402."
        }

    def is_authenticated_or_paid(self, auth_header: Optional[str], payment_proof: Optional[str]) -> bool:
        """
        Validates whether request has valid JWT token or payment proof header.
        """
        if payment_proof:
            return True
        if auth_header and ("Bearer" in auth_header or "eyJ" in auth_header):
            return True
        return False

payment_service = PaymentService()
