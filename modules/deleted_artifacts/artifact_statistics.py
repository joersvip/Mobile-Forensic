from typing import List, Dict, Any

class ArtifactStatistics:
    """
    Compiles distribution metrics, status charts data, and volume indexes 
    for visual presentation inside dashboards.
    """
    def __init__(self):
        pass

    @staticmethod
    def compile_dashboard_metrics(artifacts: List[Dict[str, Any]]) -> Dict[str, Any]:
        types_count = {}
        status_count = {}
        total_size = 0
        
        for art in artifacts:
            t = art.get("type", "Lainnya")
            types_count[t] = types_count.get(t, 0) + 1
            
            s = art.get("status", "Unknown")
            status_count[s] = status_count.get(s, 0) + 1
            
            total_size += art.get("size_bytes", 0)

        return {
            "total_artifacts": len(artifacts),
            "total_carved_size_bytes": total_size,
            "type_distribution": types_count,
            "status_distribution": status_count
        }
