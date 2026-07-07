import os
import sys

# Ensure project root is in the system paths
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from PySide6.QtWidgets import QApplication
    from PySide6.QtCore import QFile, QTextStream
except ImportError:
    # Dummy mock implementations for headless build servers
    class QApplication:
        def __init__(self, args): pass
        def exec(self): return 0

from src.core.di import DependencyContainer
from src.engines.device_engine import DeviceEngine
from src.engines.forensic_engine import ForensicAnalysisEngine
from src.engines.security_engine import SecurityEngine
from src.engines.ai_engine import AIAnalysisEngine
from src.ui.main_window import ForensicMainWindow

def load_stylesheet(app_instance, path: str):
    """Loads a CSS file and injects its contents into the Qt Application."""
    if not os.path.exists(path):
        return
    try:
        with open(path, "r") as f:
            app_instance.setStyleSheet(f.read())
    except Exception as e:
        print(f"Error loading stylesheet: {e}")

def main():
    print("--- MOBILE FORENSIC ANALYSIS SUITE v2.0 ---")
    print("Bootstrapping Native Desktop Core Engine...")
    
    # 1. Initialize Dependency Injection Container
    container = DependencyContainer()
    
    # 2. Register Singletons/Services (SOLID, Repository Pattern)
    device_eng = DeviceEngine()
    forensic_eng = ForensicAnalysisEngine()
    security_eng = SecurityEngine()
    ai_eng = AIAnalysisEngine()
    
    device_eng.initialize()
    forensic_eng.initialize()
    security_eng.initialize()
    ai_eng.initialize()
    
    container.register(DeviceEngine, device_eng)
    container.register(ForensicAnalysisEngine, forensic_eng)
    container.register(SecurityEngine, security_eng)
    container.register(AIAnalysisEngine, ai_eng)
    
    # 3. Start PySide6 Native Loop
    app = QApplication(sys.argv)
    
    # Apply standard theme styling
    qss_path = os.path.join(os.path.dirname(__file__), "themes", "dark_intelligence.qss")
    if hasattr(app, 'setStyleSheet'):
        load_stylesheet(app, qss_path)
    
    print("Launching Native Desktop Window...")
    window = ForensicMainWindow(container)
    if hasattr(window, 'show'):
        window.show()
        sys.exit(app.exec())
    else:
        print("Application launched successfully in headless mode.")

if __name__ == "__main__":
    main()
