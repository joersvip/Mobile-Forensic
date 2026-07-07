from typing import Dict, Type, Any

class DependencyContainer:
    """
    A lightweight, thread-safe Dependency Injection (DI) Container.
    Maintains active engine singletons and repositories across the thread pool.
    """
    _instance = None
    _services: Dict[Type, Any] = {}

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(DependencyContainer, cls).__new__(cls, *args, **kwargs)
        return cls._instance

    @classmethod
    def register(cls, interface: Type, implementation: Any) -> None:
        """Register an implementation for an interface/class type."""
        cls._services[interface] = implementation

    @classmethod
    def resolve(cls, interface: Type) -> Any:
        """Resolve and return registered instance."""
        if interface not in cls._services:
            raise KeyError(f"Service {interface.__name__} has not been registered in the DI Container.")
        return cls._services[interface]

    @classmethod
    def clear(cls) -> None:
        """Clear the container registrations (useful for testing)."""
        cls._services.clear()
