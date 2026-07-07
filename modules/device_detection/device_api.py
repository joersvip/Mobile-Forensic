import json
from typing import Dict, Any
from .device_service import DeviceService

class DeviceAPI:
    """
    Simulated API service for connected device management and state synchronization.
    """
    def __init__(self, service: DeviceService):
        self.service = service

    def get_connected_devices_endpoint(self) -> str:
        """
        GET /api/forensic/devices
        Returns current lists of auto-detected tablets and mobile handsets.
        """
        try:
            devices = self.service.get_all_connected_devices()
            return json.dumps({
                "status": "success",
                "code": 200,
                "count": len(devices),
                "data": devices
            }, indent=2)
        except Exception as e:
            return json.dumps({
                "status": "error",
                "code": 500,
                "message": f"Device detection failed: {str(e)}"
            }, indent=2)

    def change_mode_endpoint(self, device_id: str, mode: str) -> str:
        """
        POST /api/forensic/devices/mode
        Configures active USB subsystem layers.
        """
        try:
            success = self.service.update_usb_mode(device_id, mode)
            if success:
                return json.dumps({
                    "status": "success",
                    "code": 200,
                    "message": f"Successfully switched interface protocol of {device_id} to {mode}"
                })
            return json.dumps({
                "status": "error",
                "code": 404,
                "message": "Device not found in active system cache."
            })
        except Exception as e:
            return json.dumps({
                "status": "error",
                "code": 400,
                "message": f"Request processing error: {str(e)}"
            })
