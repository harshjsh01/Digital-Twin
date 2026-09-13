"""
MongoDB Collection: users
Manages user accounts, authentication credentials, and premium subscription status.
"""

from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from bson import ObjectId
import pymongo
from database import db

users_collection = db["users"]

# Ensure unique index on username and email
try:
    users_collection.create_index([("username", pymongo.ASCENDING)], unique=True)
    users_collection.create_index([("email", pymongo.ASCENDING)], unique=True)
except Exception as e:
    print(f"Notice: User indexes note: {e}")

def create_user(
    username: str,
    email: str,
    hashed_password: str,
    full_name: Optional[str] = None,
    wallet_address: Optional[str] = None,
    is_premium: bool = False
) -> Dict[str, Any]:
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "username": username.strip().lower(),
        "email": email.strip().lower(),
        "hashed_password": hashed_password,
        "full_name": full_name or "",
        "wallet_address": wallet_address or "",
        "is_premium": is_premium,
        "created_at": now,
        "updated_at": now
    }
    result = users_collection.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return doc

def get_user_by_username(username: str) -> Optional[Dict[str, Any]]:
    user = users_collection.find_one({"username": username.strip().lower()})
    if user:
        user["_id"] = str(user["_id"])
    return user

def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    user = users_collection.find_one({"email": email.strip().lower()})
    if user:
        user["_id"] = str(user["_id"])
    return user

def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    try:
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if user:
            user["_id"] = str(user["_id"])
        return user
    except Exception:
        return None

def set_user_premium_status(username_or_email: str, is_premium: bool = True) -> bool:
    identifier = username_or_email.strip().lower()
    now = datetime.now(timezone.utc).isoformat()
    result = users_collection.update_one(
        {"$or": [{"username": identifier}, {"email": identifier}]},
        {"$set": {"is_premium": is_premium, "updated_at": now}}
    )
    return result.modified_count > 0 or result.matched_count > 0

def list_users(limit: int = 50) -> List[Dict[str, Any]]:
    cursor = users_collection.find({}, {"hashed_password": 0}).limit(limit)
    users = []
    for doc in cursor:
        doc["_id"] = str(doc["_id"])
        users.append(doc)
    return users
