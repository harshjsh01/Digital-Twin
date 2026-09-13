"""
Database Persistence Layer for Subscriptions, Station Master Audit Logs, and Passenger Wait Logs
Matching specs from docs/database_schema.md and docs/file.md
"""

import sqlite3
import os
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "rail_database.sqlite")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Subscriptions Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS subscriptions (
        wallet_address VARCHAR(58) PRIMARY KEY,
        tx_id VARCHAR(64) NOT NULL UNIQUE,
        amount_microalgos BIGINT NOT NULL,
        payment_network VARCHAR(20) DEFAULT 'algorand-testnet',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        is_active BOOLEAN DEFAULT TRUE
    );
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_sub_expires ON subscriptions(expires_at);")

    # 2. Station Master Audit Log Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS station_master_audit_log (
        audit_id VARCHAR(36) PRIMARY KEY,
        recommendation_id VARCHAR(36) NOT NULL,
        train_id VARCHAR(20) NOT NULL,
        recommended_track VARCHAR(20) NOT NULL,
        actual_assigned_track VARCHAR(20) NOT NULL,
        action_type VARCHAR(20) NOT NULL,
        dispatcher_id VARCHAR(50) NOT NULL,
        safety_check_passed BOOLEAN NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 3. Passenger Wait Logs Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS passenger_wait_logs (
        log_id VARCHAR(36) PRIMARY KEY,
        train_id VARCHAR(20) NOT NULL,
        station_or_outer_block VARCHAR(50) NOT NULL,
        started_at_min INT NOT NULL,
        cleared_at_min INT,
        conflicting_train_id VARCHAR(20),
        plain_english_reason TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_wait_train ON passenger_wait_logs(train_id);")

    conn.commit()
    conn.close()

# Initialize tables on import
init_db()

class SubscriptionDB:
    @staticmethod
    def save_subscription(
        wallet_address: str,
        tx_id: str,
        amount_microalgos: int,
        expires_at: str,
        network: str = "algorand-testnet"
    ):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
        INSERT OR REPLACE INTO subscriptions (wallet_address, tx_id, amount_microalgos, payment_network, expires_at, is_active)
        VALUES (?, ?, ?, ?, ?, 1)
        """, (wallet_address, tx_id, amount_microalgos, network, expires_at))
        conn.commit()
        conn.close()

    @staticmethod
    def get_subscription(wallet_address: str) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM subscriptions WHERE wallet_address = ?", (wallet_address,))
        row = cursor.fetchone()
        conn.close()
        if row:
            return dict(row)
        return None

    @staticmethod
    def log_station_master_action(
        audit_id: str,
        recommendation_id: str,
        train_id: str,
        recommended_track: str,
        actual_assigned_track: str,
        action_type: str,
        dispatcher_id: str,
        safety_check_passed: bool
    ):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO station_master_audit_log 
        (audit_id, recommendation_id, train_id, recommended_track, actual_assigned_track, action_type, dispatcher_id, safety_check_passed)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            audit_id, recommendation_id, train_id, recommended_track,
            actual_assigned_track, action_type, dispatcher_id, 1 if safety_check_passed else 0
        ))
        conn.commit()
        conn.close()

    @staticmethod
    def log_passenger_wait(
        log_id: str,
        train_id: str,
        station_or_outer_block: str,
        started_at_min: int,
        cleared_at_min: Optional[int],
        conflicting_train_id: Optional[str],
        plain_english_reason: str
    ):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO passenger_wait_logs 
        (log_id, train_id, station_or_outer_block, started_at_min, cleared_at_min, conflicting_train_id, plain_english_reason)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            log_id, train_id, station_or_outer_block, started_at_min,
            cleared_at_min, conflicting_train_id, plain_english_reason
        ))
        conn.commit()
        conn.close()

    @staticmethod
    def get_recent_audit_logs(limit: int = 50) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM station_master_audit_log ORDER BY timestamp DESC LIMIT ?", (limit,))
        rows = cursor.fetchall()
        conn.close()
        return [dict(r) for r in rows]

subscription_db = SubscriptionDB()
