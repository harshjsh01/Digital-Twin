"""
Authentication & User Management Router
"""

from fastapi import APIRouter, HTTPException, Depends, status
from typing import Dict, Any
from app.core.security import hash_password, verify_password, create_access_token
from app.core.auth import get_current_user
from app.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    UserProfileResponse,
    TokenResponse,
    UpgradePremiumRequest,
    PremiumStatusResponse,
)
import database

router = APIRouter()

@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register New Passenger Account",
    description="Registers a new user account in the MongoDB database and returns a JWT access token."
)
async def register(payload: UserRegisterRequest):
    # Check if username exists
    if database.get_user_by_username(payload.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Username '{payload.username}' is already registered."
        )

    # Check if email exists
    if database.get_user_by_email(payload.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Email '{payload.email}' is already registered."
        )

    # Hash password with bcrypt
    hashed = hash_password(payload.password)

    # Store user in MongoDB
    user = database.create_user(
        username=payload.username,
        email=payload.email,
        hashed_password=hashed,
        full_name=payload.full_name,
        wallet_address=payload.wallet_address,
        is_premium=payload.is_premium or False
    )

    # Generate access token
    token_data = {
        "sub": user["username"],
        "user_id": user["_id"],
        "is_premium": user["is_premium"]
    }
    token = create_access_token(token_data)

    user_profile = UserProfileResponse(
        id=user["_id"],
        username=user["username"],
        email=user["email"],
        full_name=user.get("full_name", ""),
        is_premium=user.get("is_premium", False),
        wallet_address=user.get("wallet_address", ""),
        created_at=user.get("created_at", "")
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        is_premium=user_profile.is_premium,
        user=user_profile,
        message="User registered successfully."
    )

@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Passenger Account Login",
    description="Authenticates with username/email and password, issuing a JWT access token containing premium status."
)
async def login(payload: UserLoginRequest):
    # Check by username first, then email
    user = database.get_user_by_username(payload.username)
    if not user:
        user = database.get_user_by_email(payload.username)

    if not user or not verify_password(payload.password, user.get("hashed_password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # Generate access token
    token_data = {
        "sub": user["username"],
        "user_id": user["_id"],
        "is_premium": user.get("is_premium", False)
    }
    token = create_access_token(token_data)

    user_profile = UserProfileResponse(
        id=user["_id"],
        username=user["username"],
        email=user["email"],
        full_name=user.get("full_name", ""),
        is_premium=user.get("is_premium", False),
        wallet_address=user.get("wallet_address", ""),
        created_at=user.get("created_at", "")
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        is_premium=user_profile.is_premium,
        user=user_profile,
        message="Login successful."
    )

@router.get(
    "/me",
    response_model=UserProfileResponse,
    summary="Get Current User Profile",
    description="Fetches the authenticated user profile and live premium status from MongoDB."
)
async def get_me(current_user: Dict[str, Any] = Depends(get_current_user)):
    return UserProfileResponse(
        id=current_user["_id"],
        username=current_user["username"],
        email=current_user["email"],
        full_name=current_user.get("full_name", ""),
        is_premium=current_user.get("is_premium", False),
        wallet_address=current_user.get("wallet_address", ""),
        created_at=current_user.get("created_at", "")
    )

@router.post(
    "/upgrade-premium",
    response_model=PremiumStatusResponse,
    summary="Upgrade or Toggle User Premium Status",
    description="Updates the user's premium status in MongoDB (unlocked via x402 payment settlement or promotion)."
)
async def upgrade_premium(
    payload: UpgradePremiumRequest = UpgradePremiumRequest(),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    database.set_user_premium_status(current_user["username"], payload.is_premium)
    return PremiumStatusResponse(
        username=current_user["username"],
        is_premium=payload.is_premium,
        message="Premium status updated successfully."
    )
