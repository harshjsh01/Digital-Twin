import json
from typing import Dict, Set
from fastapi import WebSocket

class WebSocketManager:
    def __init__(self):
        # Channels: "simulator", "station_master"
        self.active_connections: Dict[str, Set[WebSocket]] = {
            "simulator": set(),
            "station_master": set(),
        }

    async def connect(self, websocket: WebSocket, channel: str):
        await websocket.accept()
        if channel not in self.active_connections:
            self.active_connections[channel] = set()
        self.active_connections[channel].add(websocket)

    def disconnect(self, websocket: WebSocket, channel: str):
        if channel in self.active_connections and websocket in self.active_connections[channel]:
            self.active_connections[channel].remove(websocket)

    async def broadcast(self, channel: str, message: dict):
        if channel not in self.active_connections:
            return
        dead_sockets = set()
        for connection in list(self.active_connections[channel]):
            try:
                await connection.send_json(message)
            except Exception:
                dead_sockets.add(connection)
        for dead in dead_sockets:
            if dead in self.active_connections[channel]:
                self.active_connections[channel].remove(dead)

ws_manager = WebSocketManager()
