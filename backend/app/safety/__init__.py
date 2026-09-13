from app.safety.interlocking import InterlockingSupervisor
from app.safety.signal_system import SignalSystem
from app.safety.collision_guard import CollisionGuard
from app.core.state_manager import state_mgr

interlocking_supervisor = InterlockingSupervisor(state_mgr)
signal_system = SignalSystem(state_mgr)
collision_guard = CollisionGuard(state_mgr)

__all__ = [
    "InterlockingSupervisor",
    "SignalSystem",
    "CollisionGuard",
    "interlocking_supervisor",
    "signal_system",
    "collision_guard",
]
