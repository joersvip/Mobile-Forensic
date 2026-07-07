from typing import Dict, Any

class DeviceCache:
    """
    In-memory safe cache representing the currently resolved device network state topology.
    """
    def __init__(self):
        self._store: Dict[str, Dict[str, Any]] = {}

    def store_device(self, device_id: str, device_data: Dict[str, Any]):
        self._store[device_id] = device_data

    def get_device(self, device_id: str) -> Dict[str, Any]:
        return self._store.get(device_id)

    def remove_device(self, device_id: str):
        if device_id in self._store:
            del self._store[device_id]

    def get_all_stored(self) -> Dict[str, Dict[str, Any]]:
        return self._store
