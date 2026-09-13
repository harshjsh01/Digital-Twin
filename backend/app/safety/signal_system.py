from typing import Dict, List

class SignalSystem:
    ASPECTS = ["RED", "YELLOW", "DOUBLE_YELLOW", "GREEN"]

    def __init__(self, state_mgr):
        self.state_mgr = state_mgr

    def update_signal_aspect(self, signal_id: str, aspect: str) -> bool:
        if aspect not in self.ASPECTS:
            return False
        for sig in self.state_mgr.signals:
            if sig["id"] == signal_id:
                sig["aspect"] = aspect
                return True
        return False

    def get_signal_aspect(self, signal_id: str) -> str:
        for sig in self.state_mgr.signals:
            if sig["id"] == signal_id:
                return sig["aspect"]
        return "RED"
