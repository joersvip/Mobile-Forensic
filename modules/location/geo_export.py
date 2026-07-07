import json
import csv
from typing import List, Dict, Any

class GeoExport:
    """
    Forensic export handler for Location history timelines.
    """
    @staticmethod
    def to_geojson(points: List[Dict[str, Any]], file_path: str) -> str:
        """
        Converts the sequence of GPS points into standard GeoJSON FeatureCollection.
        """
        features = []
        for p in points:
            feature = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [p["longitude"], p["latitude"]]
                },
                "properties": {
                    "timestamp": p["timestamp"],
                    "accuracy": p.get("accuracy", 0.0),
                    "source": p["source"],
                    "details": p.get("details", ""),
                    "file_name": p["file_name"],
                    "sha256": p["sha256"]
                }
            }
            features.append(feature)

        geojson_obj = {
            "type": "FeatureCollection",
            "metadata": {
                "exporter": "Mobile Forensic Location History Suite",
                "total_points": len(points)
            },
            "features": features
        }

        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(geojson_obj, f, indent=2)

        return file_path

    @staticmethod
    def to_csv(points: List[Dict[str, Any]], file_path: str) -> str:
        """
        Dumps the forensic coordinates log to standard CSV.
        """
        headers = ["sequence_id", "timestamp", "latitude", "longitude", "accuracy", "source", "details", "file_name", "sha256", "extraction_time"]
        with open(file_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=headers, extrasaction="ignore")
            writer.writeheader()
            for p in points:
                writer.writerow(p)

        return file_path

    @staticmethod
    def to_xlsx(points: List[Dict[str, Any]], file_path: str) -> str:
        """
        Fallback implementation to CSV for XLSX requests, as XLSX would require openpyxl.
        """
        # Stand-in implementation, usually we would write CSV-compatible formats
        return GeoExport.to_csv(points, file_path)
