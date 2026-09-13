import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
import database

_IN_MEMORY_AUDITS: List[Dict[str, Any]] = []

audit_logs_collection = database.db["station_master_audit_log"] if database.db is not None else None

def log_audit(
    audit_id: str,
    recommendation_id: str,
    train_id: str,
    recommended_track: str,
    actual_assigned_track: str,
    action_type: str,
    dispatcher_id: str,
    safety_check_passed: bool
) -> Dict[str, Any]:
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "audit_id": audit_id,
        "recommendation_id": recommendation_id,
        "train_id": train_id,
        "recommended_track": recommended_track,
        "actual_assigned_track": actual_assigned_track,
        "action_type": action_type,
        "dispatcher_id": dispatcher_id,
        "safety_check_passed": safety_check_passed,
        "timestamp": now
    }
    if audit_logs_collection is not None:
        try:
            audit_logs_collection.insert_one(doc)
            doc["_id"] = str(doc.get("_id", ""))
            return doc
        except Exception:
            pass
    doc["_id"] = str(uuid.uuid4())
    _IN_MEMORY_AUDITS.insert(0, doc)
    return doc

def get_recent_audits(limit: int = 50) -> List[Dict[str, Any]]:
    if audit_logs_collection is not None:
        try:
            cursor = audit_logs_collection.find().sort("timestamp", -1).limit(limit)
            audits = []
            for doc in cursor:
                doc["_id"] = str(doc["_id"])
                audits.append(doc)
            return audits
        except Exception:
            pass
    return _IN_MEMORY_AUDITS[:limit]
