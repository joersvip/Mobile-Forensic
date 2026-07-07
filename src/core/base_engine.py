from abc import ABC, abstractmethod
from typing import Any, Dict, List

class IForensicEngine(ABC):
    """
    Base Interface for all Forensic Engines in the suite.
    Enforces architectural discipline, modularity, and SOLID principles.
    """
    @abstractmethod
    def initialize(self) -> bool:
        """Initialize resources, connections, or database engines."""
        pass

    @abstractmethod
    def get_status(self) -> Dict[str, Any]:
        """Return engine execution and health status."""
        pass

    @abstractmethod
    def shutdown(self) -> bool:
        """Safely release locks, file systems, and resources."""
        pass
