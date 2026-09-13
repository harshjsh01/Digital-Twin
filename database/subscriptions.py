"""
MongoDB Collection: subscriptions
Stores on-chain and passenger subscription passes.
"""

from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
import pymongo
from database import db

subscriptions_collection = db["subscriptions"]

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
    subscriptions_collection.update_one(
        {"wallet_address": wallet_address},
        {"$set": doc},
        upsert=True
    )
    return doc

def get_subscription_by_wallet(wallet_address: str) -> Optional[Dict[str, Any]]:
    doc = subscriptions_collection.find_one({"wallet_address": wallet_address})
    if doc:
        doc["_id"] = str(doc["_id"])
    return doc

def get_subscription_by_username(username: str) -> Optional[Dict[str, Any]]:
    doc = subscriptions_collection.find_one({"username": username.strip().lower()})
    if doc:
        doc["_id"] = str(doc["_id"])
    return doc
