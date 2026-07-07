import logging
from typing import List, Dict, Any
from .device_detector import DeviceDetector
from .device_cache import DeviceCache

class DeviceService:
    """
    Business layer managing connection records, battery updates, and cache state synchronization.
    """
    def __init__(self):
        self.detector = DeviceDetector()
        self.cache = DeviceCache()
        self.logger = logging.getLogger("DeviceService")

    def get_all_connected_devices(self) -> List[Dict[str, Any]]:
        """
        Gathers list of devices, populating cache attributes.
        """
        devices = self.detector.detect_adb_devices()
        
        # Save or update cache
        for dev in devices:
            self.cache.store_device(dev["id"], dev)

        # Merge in any offline/cached devices that are still preserved
        return list(self.cache.get_all_stored().values())

    def update_usb_mode(self, device_id: str, mode: str) -> bool:
        """
        Simulates configuring device interface modes (ADB, MTP, PTP, Fastboot).
        """
        device = self.cache.get_device(device_id)
        if device:
            device["usb_mode"] = mode
            self.cache.store_device(device_id, device)
            self.logger.info(f"Updated USB Mode on {device_id} to {mode}")
            return True
        return False
