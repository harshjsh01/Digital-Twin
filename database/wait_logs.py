import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
import database

_IN_MEMORY_WAIT_LOGS: List[Dict[str, Any]] = []

wait_logs_collection = database.db["passenger_wait_logs"] if database.db is not None else None

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
    if wait_logs_collection is not None:
        try:
            wait_logs_collection.insert_one(doc)
            doc["_id"] = str(doc.get("_id", ""))
            return doc
        except Exception:
            pass
    doc["_id"] = str(uuid.uuid4())
    _IN_MEMORY_WAIT_LOGS.insert(0, doc)
    return doc

def get_wait_logs_for_train(train_id: str, limit: int = 20) -> List[Dict[str, Any]]:
    if wait_logs_collection is not None:
        try:
            cursor = wait_logs_collection.find({"train_id": train_id}).sort("created_at", -1).limit(limit)
            logs = []
            for doc in cursor:
                doc["_id"] = str(doc["_id"])
                logs.append(doc)
            return logs
        except Exception:
            pass
    matching = [log for log in _IN_MEMORY_WAIT_LOGS if log.get("train_id") == train_id]
    return matching[:limit]
