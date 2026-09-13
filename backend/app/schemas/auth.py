from pydantic import BaseModel, Field, EmailStr
from typing import Optional

class UserRegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, description="Unique username")
    email: str = Field(..., description="Valid user email address")
    password: str = Field(..., min_length=6, description="Account password (min 6 characters)")
    full_name: Optional[str] = Field(default="", description="Passenger full name")
    wallet_address: Optional[str] = Field(default="", description="Optional linked Algorand wallet address")
    is_premium: Optional[bool] = Field(default=False, description="Initial premium status (default False)")

class UserLoginRequest(BaseModel):
    username: str = Field(..., description="Username or email address")
    password: str = Field(..., description="Account password")

class UserProfileResponse(BaseModel):
    id: str
    username: str
    email: str
    full_name: Optional[str] = ""
    is_premium: bool
    wallet_address: Optional[str] = ""
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    is_premium: bool
    user: UserProfileResponse
    message: str = "Authentication successful"

class UpgradePremiumRequest(BaseModel):
    wallet_address: Optional[str] = None
    is_premium: bool = True

class PremiumStatusResponse(BaseModel):
    username: str
    is_premium: bool
    message: str
