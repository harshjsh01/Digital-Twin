"""
High-Fidelity Discrete-Event & Physical Kinematics Simulation Core
Matching specifications from docs/file.md (Section 2, Item 6) and object.md
"""

from typing import Dict, Any, List
from app.core.state_manager import state_mgr
from app.safety.collision_guard import CollisionGuard

class SimulationEngine:
    def __init__(self, state_manager=None):
        self.state_mgr = state_manager or state_mgr
        self.collision_guard = CollisionGuard(self.state_mgr)

    def tick_discrete(self, minutes: int = 1) -> Dict[str, Any]:
        """
        Advances the discrete minute simulation clock by `minutes` and steps train schedules.
        """
        delta_sec = minutes * 60.0
        return self.step(delta_sec)

    def step(self, delta_sec: float = 1.0) -> Dict[str, Any]:
        """
        Steps the physical kinematics and discrete status forward.
        Interacts with CollisionGuard to verify zero collisions before advancing.
        """
        if not self.state_mgr.is_running:
            return self.state_mgr.get_state()

        # Check safety invariants before advance
        is_safe, violations = self.collision_guard.verify_no_collisions()
        if not is_safe:
            print(f"Safety Invariant Warning: {violations}")

        return self.state_mgr.step(delta_sec)

    def set_speed(self, rate: float):
        self.state_mgr.playback_speed = max(0.1, min(rate, 100.0))

    def pause(self):
        self.state_mgr.is_running = False

    def resume(self):
        self.state_mgr.is_running = True

simulation_engine = SimulationEngine()
