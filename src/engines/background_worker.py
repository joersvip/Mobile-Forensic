try:
    from PySide6.QtCore import QThread, Signal, QObject, QRunnable, QThreadPool
except ImportError:
    # Fallback mock for non-GUI headless setups
    class QThread: pass
    class QObject: pass
    class Signal:
        def __init__(self, *args, **kwargs): pass
    class QRunnable: pass
    class QThreadPool:
        @staticmethod
        def globalInstance(): return QThreadPool()
        def start(self, runnable): pass

import time
from typing import Callable, Any, Tuple

class ForensicTaskWorker(QRunnable):
    """
    Background worker class designed to execute complex operations in the QThreadPool.
    Prevents the PySide6 UI thread from freezing.
    """
    def __init__(self, fn_to_run: Callable[..., Any], *args, **kwargs):
        super().__init__()
        self.fn = fn_to_run
        self.args = args
        self.kwargs = kwargs
        # Set up standard custom callback parameters
        self.on_success: Optional[Callable[[Any], None]] = kwargs.pop("on_success", None)
        self.on_failure: Optional[Callable[[Exception], None]] = kwargs.pop("on_failure", None)

    def run(self):
        try:
            result = self.fn(*self.args, **self.kwargs)
            if self.on_success:
                self.on_success(result)
        except Exception as e:
            if self.on_failure:
                self.on_failure(e)


class DeviceMonitoringThread(QThread):
    """
    Continuous ADB/USB polling thread for hardware hotplug events.
    Fires Qt signals when connection topology changes.
    """
    # Define custom Qt signal
    device_connected = Signal(dict)
    device_disconnected = Signal(str)

    def __init__(self, detect_fn: Callable[[], list]):
        super().__init__()
        self.detect_fn = detect_fn
        self._running = True

    def run(self):
        known_devices = set()
        while self._running:
            try:
                current_devices = self.detect_fn()
                current_ids = {d["id"] for d in current_devices}
                
                # Check for connections
                for dev in current_devices:
                    if dev["id"] not in known_devices:
                        known_devices.add(dev["id"])
                        self.device_connected.emit(dev)
                        
                # Check for disconnections
                for dev_id in list(known_devices):
                    if dev_id not in current_ids:
                        known_devices.remove(dev_id)
                        self.device_disconnected.emit(dev_id)
            except Exception:
                pass
            time.sleep(2)  # Poll every 2 seconds

    def stop(self):
        self._running = False
        self.wait()
