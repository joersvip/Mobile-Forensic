from typing import List, Dict, Any

class TimelineBuilder:
    """
    Consolidates location points from raw logs and builds a chronological trace sequence.
    """
    @staticmethod
    def build_chronological_sequence(points: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Sorts the location items in ascending order of their timestamp.
        Calculates delta times and basic path transition information.
        """
        if not points:
            return []

        # Sort based on timestamp key
        sorted_points = sorted(points, key=lambda x: x.get("timestamp", ""))

        # Inject sequential node identifier
        for idx, point in enumerate(sorted_points):
            point["sequence_id"] = idx + 1
            point["is_key_location"] = idx == 0 or idx == len(sorted_points) - 1 or point.get("accuracy", 100) < 10

        return sorted_points
