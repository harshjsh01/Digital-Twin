import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
import pymongo
import database

_IN_MEMORY_SUBSCRIPTIONS: Dict[str, Dict[str, Any]] = {}

subscriptions_collection = database.db["subscriptions"] if database.db is not None else None

if subscriptions_collection is not None:
    try:
        subscriptions_collection.create_index([("wallet_address", pymongo.ASCENDING)])
        subscriptions_collection.create_index([("tx_id", pymongo.ASCENDING)], unique=True, sparse=True)
    except Exception as e:
        print(f"Notice: Subscriptions indexes note: {e}")

def save_subscription(
    wallet_address: str,
    tx_id: str,
    amount_microalgos: int,
    expires_at: str,
    network: str = "algorand-testnet",
    username: Optional[str] = None
) -> Dict[str, Any]:
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "wallet_address": wallet_address,
        "tx_id": tx_id,
        "amount_microalgos": amount_microalgos,
        "payment_network": network,
        "username": username or "",
        "created_at": now,
        "expires_at": expires_at,
        "is_active": True
    }
    if subscriptions_collection is not None:
        try:
            subscriptions_collection.update_one(
                {"wallet_address": wallet_address},
                {"$set": doc},
                upsert=True
            )
            return doc
        except Exception:
            pass
    _IN_MEMORY_SUBSCRIPTIONS[wallet_address] = doc
    doc["_id"] = str(uuid.uuid4())
    return doc

def get_subscription_by_wallet(wallet_address: str) -> Optional[Dict[str, Any]]:
    if subscriptions_collection is not None:
        try:
            doc = subscriptions_collection.find_one({"wallet_address": wallet_address})
            if doc:
                doc["_id"] = str(doc["_id"])
            return doc
        except Exception:
            pass
    return _IN_MEMORY_SUBSCRIPTIONS.get(wallet_address)

def get_subscription_by_username(username: str) -> Optional[Dict[str, Any]]:
    clean_user = username.strip().lower()
    if subscriptions_collection is not None:
        try:
            doc = subscriptions_collection.find_one({"username": clean_user})
            if doc:
                doc["_id"] = str(doc["_id"])
            return doc
        except Exception:
            pass
    for s in _IN_MEMORY_SUBSCRIPTIONS.values():
        if s.get("username", "").strip().lower() == clean_user:
            return s
    return None
