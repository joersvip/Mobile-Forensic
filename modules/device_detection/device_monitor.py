import asyncio
import logging
from typing import Callable, List, Dict, Any
from .device_detector import DeviceDetector

class DeviceMonitor:
    """
    Real-time loop monitoring the system's USB bus topology and ADB descriptors.
    Dispatches notifications on target connection/disconnection event states.
    """
    def __init__(self, poll_interval_sec: float = 2.0):
        self.poll_interval = poll_interval_sec
        self.detector = DeviceDetector()
        self.logger = logging.getLogger("DeviceMonitor")
        self.active_devices = {}
        self.callbacks = []

    def register_event_listener(self, cb: Callable[[str, Dict[str, Any]], None]):
        """
        Registers callback triggers for real-time notification streams.
        """
        self.callbacks.append(cb)

    async def start_monitoring_loop(self):
        """
        Monitors connected hardware devices synchronously within an async loop.
        """
        self.logger.info("Initializing Device Auto Detection Monitor Daemon...")
        while True:
            try:
                current_devices = self.detector.detect_adb_devices()
                current_ids = {d["id"]: d for d in current_devices}

                # Check for disconnections
                for dev_id in list(self.active_devices.keys()):
                    if dev_id not in current_ids:
                        disconnected_device = self.active_devices.pop(dev_id)
                        self._trigger_event("Device Disconnected", disconnected_device)

                # Check for connections
                for dev_id, dev_data in current_ids.items():
                    if dev_id not in self.active_devices:
                        self.active_devices[dev_id] = dev_data
                        self._trigger_event("Device Connected", dev_data)

            except Exception as e:
                self.logger.error(f"Error checking USB subsystem state: {e}")
            
            await asyncio.sleep(self.poll_interval)

    def _trigger_event(self, event_type: str, device: Dict[str, Any]):
        for callback in self.callbacks:
            try:
                callback(event_type, device)
            except Exception:
                pass
