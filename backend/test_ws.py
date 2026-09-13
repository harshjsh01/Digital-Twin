import sys
import os

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from starlette.testclient import TestClient
from main import app

client = TestClient(app)

def test_websockets():
    print("--- Testing WebSocket /ws/simulator ---")
    with client.websocket_connect("/ws/simulator") as websocket:
        data = websocket.receive_json()
        assert data["event"] == "TRACK_CIRCUIT_UPDATE"
        assert "trains" in data
        assert "signals" in data
        assert "switches" in data
        print(f"[PASS] /ws/simulator received TRACK_CIRCUIT_UPDATE with {len(data['trains'])} trains")
        
        websocket.send_text("ping")
        resp = websocket.receive_text()
        assert resp == "pong"
        print("[PASS] /ws/simulator ping-pong succeeded")

    print("\n--- Testing WebSocket /ws/station-master ---")
    with client.websocket_connect("/ws/station-master") as websocket:
        data = websocket.receive_json()
        assert data["event"] == "RECOMMENDATIONS_STREAM"
        assert "recommendations" in data
        print(f"[PASS] /ws/station-master received RECOMMENDATIONS_STREAM with {len(data['recommendations'])} items")

        # Test submit approval via WebSocket
        websocket.send_json({
            "action": "SUBMIT_APPROVAL",
            "recommendation_id": "REC_8841",
            "assigned_track": "PLATFORM_3",
            "train_id": "T_12301",
            "dispatcher_id": "SM_WS_DISPATCHER"
        })
        resp = websocket.receive_json()
        assert resp["event"] == "APPROVAL_SUCCESS"
        assert resp["details"]["status"] == "APPROVED_AND_LOCKED"
        print("[PASS] /ws/station-master SUBMIT_APPROVAL action verified")

    print("\n==========================================")
    print("ALL WEBSOCKET TESTS PASSED!")
    print("==========================================")

if __name__ == "__main__":
    test_websockets()
