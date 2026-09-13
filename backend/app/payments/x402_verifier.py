"""
RFC HTTP 402 Payment Required Verifier
Matching specifications from docs/file.md (Section 2, Item 16) and object.md
"""

from fastapi import Request, HTTPException, status
from typing import Optional
from app.payments.subscription_db import subscription_db

TREASURY_ADDRESS = "AAHAVAAN7RAILX402TREASURYTESTNETWALLET"
EXPECTED_MICRO_ALGOS = 100000
PAYMENT_NETWORK = "algorand-testnet"
FACILITATOR = "GoPlausible-AVM-Facilitator"

class X402Verifier:
    @staticmethod
    def verify_x402_header(request: Request) -> bool:
        """
        Inspects request for Authorization: Bearer <TOKEN> or X-Payment-Proof: <TX_ID>.
        Raises HTTPException(status_code=402, detail="Payment Required") with Algorand payment headers if unauthorized.
        """
        auth_header = request.headers.get("Authorization")
        payment_proof = request.headers.get("X-Payment-Proof")

        # Check for bearer token or payment proof
        if payment_proof:
            return True

        if auth_header:
            if auth_header.startswith("Bearer ") and len(auth_header.split(" ")[1]) > 5:
                return True

        # Raise HTTP 402 with required RFC/x402 headers
        headers = {
            "X-Payment-Address": TREASURY_ADDRESS,
            "X-Payment-Amount": str(EXPECTED_MICRO_ALGOS),
            "X-Payment-Network": PAYMENT_NETWORK,
            "X-Payment-Facilitator": FACILITATOR,
        }
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Payment Required: Active ₹9/month Aahavaan Pass settled via x402 on Algorand required.",
            headers=headers
        )

x402_verifier = X402Verifier()
