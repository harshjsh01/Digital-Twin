import sys
import os
import uuid

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(CURRENT_DIR)
# Ensure CURRENT_DIR takes precedence over ROOT_DIR for main.py
if CURRENT_DIR in sys.path:
    sys.path.remove(CURRENT_DIR)
sys.path.insert(0, CURRENT_DIR)

if ROOT_DIR not in sys.path:
    sys.path.append(ROOT_DIR)

import importlib.util
main_spec = importlib.util.spec_from_file_location("backend_main", os.path.join(CURRENT_DIR, "main.py"))
backend_main = importlib.util.module_from_spec(main_spec)
main_spec.loader.exec_module(backend_main)
app = backend_main.app
from starlette.testclient import TestClient

client = TestClient(app, raise_server_exceptions=False)

def run_tests():
    print("--- 1. Testing User Authentication & MongoDB Storage ---")
    test_user = f"user_{uuid.uuid4().hex[:6]}"
    test_email = f"{test_user}@test.com"
    test_password = "password123"

    # Register standard user (is_premium=False)
    reg_res = client.post("/api/v1/auth/register", json={
        "username": test_user,
        "email": test_email,
        "password": test_password,
        "full_name": "Test Commuter",
        "wallet_address": "TESTALGORANDWALLET123"
    })
    assert reg_res.status_code == 201, f"Registration failed: {reg_res.text}"
    reg_data = reg_res.json()
    assert reg_data["user"]["username"] == test_user
    assert reg_data["user"]["is_premium"] is False
    print(f"[PASS] POST /api/v1/auth/register created user '{test_user}' in MongoDB with is_premium=False")

    # Login
    login_res = client.post("/api/v1/auth/login", json={
        "username": test_user,
        "password": test_password
    })
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    login_data = login_res.json()
    standard_token = login_data["access_token"]
    assert login_data["is_premium"] is False
    print("[PASS] POST /api/v1/auth/login verified credentials and issued JWT")

    # Get /me
    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {standard_token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == test_email
    print("[PASS] GET /api/v1/auth/me retrieved user profile from MongoDB")

    # Why-Stopped with standard user (non-premium) -> Expect HTTP 402
    unpaid_why = client.get(
        "/api/v1/passenger/train/T_12301/why-stopped",
        headers={"Authorization": f"Bearer {standard_token}"}
    )
    assert unpaid_why.status_code == 402, f"Expected 402 for non-premium user, got {unpaid_why.status_code}"
    assert "X-Payment-Address" in unpaid_why.headers
    print("[PASS] Non-premium authenticated user correctly received HTTP 402 on /why-stopped")

    # Upgrade to Premium via endpoint
    upgrade_res = client.post(
        "/api/v1/auth/upgrade-premium",
        headers={"Authorization": f"Bearer {standard_token}"},
        json={"is_premium": True}
    )
    assert upgrade_res.status_code == 200
    assert upgrade_res.json()["is_premium"] is True
    print("[PASS] POST /api/v1/auth/upgrade-premium updated is_premium=True in MongoDB")

    # Why-Stopped with now-premium user -> Expect HTTP 200
    paid_why = client.get(
        "/api/v1/passenger/train/T_12301/why-stopped",
        headers={"Authorization": f"Bearer {standard_token}"}
    )
    assert paid_why.status_code == 200, f"Expected 200 for premium user, got {paid_why.status_code}: {paid_why.text}"
    assert paid_why.json()["train_id"] == "T_12301"
    print("[PASS] Premium user granted immediate access (HTTP 200) to /why-stopped explainability diagnostics")

    print("\n--- 2. Testing Physical Simulator Endpoints ---")
    res = client.get("/api/v1/simulator/layout")
    assert res.status_code == 200, f"Layout failed: {res.text}"
    layout = res.json()
    assert len(layout["platforms"]) == 6, f"Expected 6 platforms, got {len(layout['platforms'])}"
    assert len(layout["outer_waiting_tracks"]) == 4, f"Expected 4 outer tracks, got {len(layout['outer_waiting_tracks'])}"
    print("[PASS] GET /api/v1/simulator/layout passed (6 platforms, 4 outer sidings)")

    res = client.get("/api/v1/simulator/state")
    assert res.status_code == 200, f"State failed: {res.text}"
    state = res.json()
    assert "trains" in state and "signals" in state and "switches" in state
    print(f"[PASS] GET /api/v1/simulator/state passed ({len(state['trains'])} trains)")

    res = client.post("/api/v1/simulator/control/tick", json={"seconds": 2.0})
    assert res.status_code == 200
    print("[PASS] POST /api/v1/simulator/control/tick passed")

    res = client.post("/api/v1/simulator/control/playback", json={"rate": 5.0, "is_running": True})
    assert res.status_code == 200
    assert res.json()["rate"] == 5.0
    print("[PASS] POST /api/v1/simulator/control/playback passed")

    print("\n--- 3. Testing Station Master Endpoints ---")
    res = client.get("/api/v1/station-master/radar")
    assert res.status_code == 200
    radar = res.json()
    assert len(radar["approaching_trains"]) > 0
    print(f"[PASS] GET /api/v1/station-master/radar passed ({len(radar['approaching_trains'])} approaching)")

    res = client.get("/api/v1/station-master/recommendations")
    assert res.status_code == 200
    recs = res.json()["recommendations"]
    assert len(recs) > 0
    print(f"[PASS] GET /api/v1/station-master/recommendations passed ({len(recs)} recommendations)")

    # Conflict check
    res = client.post("/api/v1/station-master/action/approve", json={
        "recommendation_id": "REC_8841",
        "train_id": "T_12301",
        "assigned_track": "PLATFORM_2",
        "dispatcher_id": "SM_OFFICER_04"
    })
    assert res.status_code == 409
    print("[PASS] POST /api/v1/station-master/action/approve 409 Interlocking Conflict passed")

    # Clear platform approval
    res = client.post("/api/v1/station-master/action/approve", json={
        "recommendation_id": "REC_8841",
        "train_id": "T_12301",
        "assigned_track": "PLATFORM_1",
        "dispatcher_id": "SM_OFFICER_04"
    })
    assert res.status_code == 200
    print("[PASS] POST /api/v1/station-master/action/approve 200 OK Route Locked passed")

    # Override
    res = client.post("/api/v1/station-master/action/override", json={
        "train_id": "T_12301",
        "assigned_track": "PLATFORM_3",
        "dispatcher_id": "SM_OFFICER_04",
        "reason": "Manual operator reassignment"
    })
    assert res.status_code == 200
    print("[PASS] POST /api/v1/station-master/action/override passed")

    # Emergency All Red
    res = client.post("/api/v1/station-master/action/emergency-all-red")
    assert res.status_code == 200
    print("[PASS] POST /api/v1/station-master/action/emergency-all-red passed")

    print("\n--- 4. Testing Passenger Portal & Telemetry ---")
    res = client.get("/api/v1/passenger/train/search?q=12301")
    assert res.status_code == 200
    assert len(res.json()["results"]) > 0
    print("[PASS] GET /api/v1/passenger/train/search passed")

    res = client.get("/api/v1/passenger/train/T_12301/status")
    assert res.status_code == 200
    print("[PASS] GET /api/v1/passenger/train/{id}/status passed")

    print("\n--- 5. Testing Payments & MongoDB Sync ---")
    res = client.get("/api/v1/payments/pricing")
    assert res.status_code == 200
    print("[PASS] GET /api/v1/payments/pricing passed")

    res = client.post("/api/v1/payments/verify-proof", json={
        "tx_id": f"TX_{uuid.uuid4().hex[:12]}",
        "wallet_address": "USER_MONGO_ALGO_WALLET",
        "plan": "MONTHLY_PASS_INR_9"
    })
    assert res.status_code == 200
    assert res.json()["status"] == "VERIFIED_ON_CHAIN"
    print("[PASS] POST /api/v1/payments/verify-proof stored in MongoDB")

    res = client.get("/api/v1/payments/subscription-status?wallet=USER_MONGO_ALGO_WALLET")
    assert res.status_code == 200
    assert res.json()["is_active"] is True
    print("[PASS] GET /api/v1/payments/subscription-status retrieved active pass from MongoDB")

    print("\n--- 6. Testing Baseline Compatibility ---")
    assert client.get("/api/network").status_code == 200
    assert client.get("/api/state").status_code == 200
    assert client.put("/api/mode?mode=AI_OPTIMIZED").status_code == 200
    assert client.post("/api/simulate/tick").status_code == 200
    print("[PASS] Baseline compatibility endpoints passed")

    print("\n--- 7. Testing Global Uncaught Exception Handler ---")
    @app.get("/api/test-uncaught-error")
    async def trigger_uncaught_error():
        raise RuntimeError("Simulated unhandled runtime failure in test")

    err_res = client.get("/api/test-uncaught-error")
    assert err_res.status_code == 500, f"Expected 500, got {err_res.status_code}"
    err_json = err_res.json()
    assert err_json["error"] == "Internal Server Error"
    assert "Simulated unhandled runtime failure" in err_json["detail"]
    assert err_json["path"] == "/api/test-uncaught-error"
    assert err_json["method"] == "GET"
    print("[PASS] Global exception handler successfully caught unhandled exception and returned structured 500 JSON")

    print("\n--- 8. Testing Root & Healthcheck Endpoints ---")
    root_res = client.get("/")
    assert root_res.status_code == 200
    root_data = root_res.json()
    assert "service" in root_data
    assert root_data["status"] == "ONLINE"
    assert "healthcheck" in root_data["endpoints"]
    print(f"[PASS] GET / returned service metadata: {root_data['service']} (version {root_data['version']})")

    health_res = client.get("/healthcheck")
    assert health_res.status_code == 200
    health_data = health_res.json()
    assert health_data["status"] in ["healthy", "degraded"]
    assert "latency_ms" in health_data
    assert isinstance(health_data["latency_ms"], (int, float))
    assert "database" in health_data
    assert "simulation" in health_data
    print(f"[PASS] GET /healthcheck returned status '{health_data['status']}' with latency: {health_data['latency_ms']} ms")

    # Verify alias /health
    health_alias_res = client.get("/health")
    assert health_alias_res.status_code == 200
    assert "latency_ms" in health_alias_res.json()
    print(f"[PASS] GET /health alias passed with latency: {health_alias_res.json()['latency_ms']} ms")

    print("\n=======================================================")
    print("ALL TESTS (AUTH + MONGODB + APIS + HEALTHCHECK) PASSED!")
    print("=======================================================")

if __name__ == "__main__":
    run_tests()

