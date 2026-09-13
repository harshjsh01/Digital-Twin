import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from bson import ObjectId
import pymongo
import database

# In-memory store fallback when MongoDB is offline
_IN_MEMORY_USERS: Dict[str, Dict[str, Any]] = {}

users_collection = database.db["users"] if database.db is not None else None

# Ensure unique index on username and email if connected
if users_collection is not None:
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
    clean_username = username.strip().lower()
    clean_email = email.strip().lower()
    doc = {
        "username": clean_username,
        "email": clean_email,
        "hashed_password": hashed_password,
        "full_name": full_name or "",
        "wallet_address": wallet_address or "",
        "is_premium": is_premium,
        "created_at": now,
        "updated_at": now
    }
    if users_collection is not None:
        try:
            result = users_collection.insert_one(doc)
            doc["_id"] = str(result.inserted_id)
            return doc
        except Exception:
            pass
    # In-memory fallback
    doc["_id"] = str(uuid.uuid4())
    _IN_MEMORY_USERS[clean_username] = doc
    return doc

def get_user_by_username(username: str) -> Optional[Dict[str, Any]]:
    clean_username = username.strip().lower()
    if users_collection is not None:
        try:
            user = users_collection.find_one({"username": clean_username})
            if user:
                user["_id"] = str(user["_id"])
            return user
        except Exception:
            pass
    return _IN_MEMORY_USERS.get(clean_username)

def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    clean_email = email.strip().lower()
    if users_collection is not None:
        try:
            user = users_collection.find_one({"email": clean_email})
            if user:
                user["_id"] = str(user["_id"])
            return user
        except Exception:
            pass
    for u in _IN_MEMORY_USERS.values():
        if u.get("email") == clean_email:
            return u
    return None

def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    if users_collection is not None:
        try:
            user = users_collection.find_one({"_id": ObjectId(user_id)})
            if user:
                user["_id"] = str(user["_id"])
            return user
        except Exception:
            pass
    for u in _IN_MEMORY_USERS.values():
        if u.get("_id") == user_id:
            return u
    return None

def set_user_premium_status(username_or_email: str, is_premium: bool = True) -> bool:
    identifier = username_or_email.strip().lower()
    now = datetime.now(timezone.utc).isoformat()
    if users_collection is not None:
        try:
            result = users_collection.update_one(
                {"$or": [{"username": identifier}, {"email": identifier}]},
                {"$set": {"is_premium": is_premium, "updated_at": now}}
            )
            return result.modified_count > 0 or result.matched_count > 0
        except Exception:
            pass
    for u in _IN_MEMORY_USERS.values():
        if u.get("username") == identifier or u.get("email") == identifier:
            u["is_premium"] = is_premium
            u["updated_at"] = now
            return True
    return False

def list_users(limit: int = 50) -> List[Dict[str, Any]]:
    if users_collection is not None:
        try:
            cursor = users_collection.find({}, {"hashed_password": 0}).limit(limit)
            users = []
            for doc in cursor:
                doc["_id"] = str(doc["_id"])
                users.append(doc)
            return users
        except Exception:
            pass
    safe_list = []
    for u in list(_IN_MEMORY_USERS.values())[:limit]:
        safe_copy = {k: v for k, v in u.items() if k != "hashed_password"}
        safe_list.append(safe_copy)
    return safe_list
