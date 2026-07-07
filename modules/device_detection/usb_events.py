import os
import sys
import logging
from datetime import datetime
from typing import Dict, Any

class USBEvents:
    """
    Subsystem hook listener which binds direct device plug-and-play notification triggers.
    """
    def __init__(self):
        self.logger = logging.getLogger("USBEvents")
        self.log_file = "usb_events_audit.log"

    def log_raw_usb_event(self, event_name: str, device_desc: Dict[str, Any]):
        """
        Appends entries into audit files for permanent chain of custody logs.
        """
        timestamp = datetime.utcnow().isoformat() + "Z"
        log_entry = {
            "timestamp": timestamp,
            "event": event_name,
            "manufacturer": device_desc.get("manufacturer", "Unknown"),
            "model": device_desc.get("model", "Unknown Device"),
            "serial_number": device_desc.get("serial_number", "N/A")
        }
        
        try:
            with open(self.log_file, "a") as f:
                f.write(f"[{timestamp}] EVENT: {event_name} | DEV: {log_entry['manufacturer']} {log_entry['model']} (S/N: {log_entry['serial_number']})\n")
        except Exception as e:
            self.logger.error(f"Failed to log raw USB kernel event: {e}")
