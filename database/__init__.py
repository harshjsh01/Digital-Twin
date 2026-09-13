"""
MongoDB Database Initialization & Collection Registry
Project Aahavaan - Rail
"""

import os
from pymongo import MongoClient

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("MONGODB_DB_NAME", "aahavaan_rail")

try:
    client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=1000)
    client.server_info()
    db = client[DB_NAME]
    IS_CONNECTED = True
    print(f"Connected to MongoDB at {MONGODB_URI}, Database: '{DB_NAME}'")
except Exception as e:
    IS_CONNECTED = False
    client = None
    db = None
    print(f"Notice: MongoDB offline ({e}). Activating in-memory fallback store.")

from database.users import (
    create_user,
    get_user_by_username,
    get_user_by_email,
    get_user_by_id,
    set_user_premium_status,
    list_users
)
from database.subscriptions import (
    save_subscription,
    get_subscription_by_wallet,
    get_subscription_by_username
)
from database.audit_logs import (
    log_audit,
    get_recent_audits
)
from database.wait_logs import (
    log_wait_reason,
    get_wait_logs_for_train
)

__all__ = [
    "client",
    "db",
    "DB_NAME",
    "create_user",
    "get_user_by_username",
    "get_user_by_email",
    "get_user_by_id",
    "set_user_premium_status",
    "list_users",
    "save_subscription",
    "get_subscription_by_wallet",
    "get_subscription_by_username",
    "log_audit",
    "get_recent_audits",
    "log_wait_reason",
    "get_wait_logs_for_train"
]
