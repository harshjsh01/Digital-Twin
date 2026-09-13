"""
MongoDB Collection: station_master_audit_log
Audit trail of Station Master approvals, overrides, and emergency stops.
"""

from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from database import db

audit_logs_collection = db["station_master_audit_log"]

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
    audit_logs_collection.insert_one(doc)
    doc["_id"] = str(doc.get("_id", ""))
    return doc

def get_recent_audits(limit: int = 50) -> List[Dict[str, Any]]:
    cursor = audit_logs_collection.find().sort("timestamp", -1).limit(limit)
    audits = []
    for doc in cursor:
        doc["_id"] = str(doc["_id"])
        audits.append(doc)
    return audits
