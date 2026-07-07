import math
from typing import List, Dict, Any

class LocationStatistics:
    """
    Computes statistical and analytical metrics from collected chronological GPS lines.
    """
    @staticmethod
    def calculate_metrics(points: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calculates location density, date ranges, bounding coordinates, and travel details.
        """
        if not points:
            return {
                "total_points": 0,
                "date_range": "N/A",
                "bounding_box": None,
                "estimated_distance_km": 0.0,
                "source_breakdown": {}
            }

        # Date Range
        timestamps = [p["timestamp"] for p in points if p.get("timestamp")]
        date_range = "N/A"
        if timestamps:
            timestamps.sort()
            date_range = f"{timestamps[0]} to {timestamps[-1]}"

        # Bounding box
        lats = [p["latitude"] for p in points]
        lngs = [p["longitude"] for p in points]
        bounding_box = {
            "min_lat": min(lats),
            "max_lat": max(lats),
            "min_lng": min(lngs),
            "max_lng": max(lngs)
        }

        # Source breakdown count
        source_breakdown = {}
        for p in points:
            src = p["source"]
            source_breakdown[src] = source_breakdown.get(src, 0) + 1

        # Estimated travel distance using Haversine formula
        total_dist = 0.0
        for i in range(len(points) - 1):
            total_dist += LocationStatistics.haversine(
                points[i]["latitude"], points[i]["longitude"],
                points[i+1]["latitude"], points[i+1]["longitude"]
            )

        return {
            "total_points": len(points),
            "date_range": date_range,
            "bounding_box": bounding_box,
            "estimated_distance_km": round(total_dist, 2),
            "source_breakdown": source_breakdown
        }

    @staticmethod
    def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Calculates circle distance between two geo coordinates in km.
        """
        # distance between latitudes and longitudes
        dLat = (lat2 - lat1) * math.pi / 180.0
        dLon = (lon2 - lon1) * math.pi / 180.0

        # convert to radians
        lat1 = (lat1) * math.pi / 180.0
        lat2 = (lat2) * math.pi / 180.0

        # apply formulae
        a = (pow(math.sin(dLat / 2), 2) +
             pow(math.sin(dLon / 2), 2) *
             math.cos(lat1) * math.cos(lat2))
        rad = 6371  # Earth radius in kilometers
        c = 2 * math.asin(math.sqrt(a))
        return rad * c
