"""
MongoDB Collection: passenger_wait_logs
Maintains explainable AI train halt reason history for passenger inquiries.
"""

from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from database import db

wait_logs_collection = db["passenger_wait_logs"]

def log_wait_reason(
    log_id: str,
    train_id: str,
    station_or_outer_block: str,
    started_at_min: int,
    cleared_at_min: Optional[int],
    conflicting_train_id: Optional[str],
    plain_english_reason: str
) -> Dict[str, Any]:
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "log_id": log_id,
        "train_id": train_id,
        "station_or_outer_block": station_or_outer_block,
        "started_at_min": started_at_min,
        "cleared_at_min": cleared_at_min,
        "conflicting_train_id": conflicting_train_id,
        "plain_english_reason": plain_english_reason,
        "created_at": now
    }
    wait_logs_collection.insert_one(doc)
    doc["_id"] = str(doc.get("_id", ""))
    return doc

def get_wait_logs_for_train(train_id: str, limit: int = 20) -> List[Dict[str, Any]]:
    cursor = wait_logs_collection.find({"train_id": train_id}).sort("created_at", -1).limit(limit)
    logs = []
    for doc in cursor:
        doc["_id"] = str(doc["_id"])
        logs.append(doc)
    return logs
