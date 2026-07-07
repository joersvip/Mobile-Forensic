import os
import json
import logging
from typing import List, Dict, Any
from .location_parser import LocationParser
from .location_statistics import LocationStatistics
from .timeline_builder import TimelineBuilder
from .geo_export import GeoExport

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class LocationService:
    """
    Main orchestrator for Mobile Forensic Location History Analyzer.
    Coordinates extraction of coordinate artifacts (EXIF, SQLite DBs, Cache logs),
    statistics computation, timeline consolidation, and reports generation.
    """
    def __init__(self, case_dir: str):
        self.case_dir = case_dir
        self.parser = LocationParser()
        self.logger = logging.getLogger("LocationService")

    def process_case_location_artifacts(self) -> Dict[str, Any]:
        """
        Scans the case directory for mobile forensic artifacts containing GPS metadata.
        Consolidates the locations, builds timeline, computes stats and prepares outputs.
        """
        self.logger.info(f"Scanning for location-bearing artifacts in: {self.case_dir}")
        raw_points = []

        # 1. Scan and parse various artifacts
        if os.path.exists(self.case_dir):
            for root, _, files in os.walk(self.case_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    # Parse based on file type
                    if file.lower().endswith(('.jpg', '.jpeg', '.heic')):
                        raw_points.extend(self.parser.extract_exif_gps(file_path))
                    elif file.lower().endswith('.db') or file == 'gservices.db' or file == 'history.db':
                        raw_points.extend(self.parser.extract_sqlite_locations(file_path))
                    elif file.lower().endswith(('.gpx', '.kml')):
                        raw_points.extend(self.parser.extract_gpx_kml(file_path))

        # 2. Consolidate & Sort Chronologically
        timeline = TimelineBuilder.build_chronological_sequence(raw_points)

        # 3. Calculate statistics
        stats = LocationStatistics.calculate_metrics(timeline)

        # 4. Save results internally for index validation
        output_data = {
            "case_id": os.path.basename(os.path.normpath(self.case_dir)),
            "statistics": stats,
            "timeline": timeline,
            "integrity_signature": self.parser.generate_integrity_report(timeline)
        }

        self.logger.info(f"Completed processing. Total GPS coordinate clusters mapped: {len(timeline)}")
        return output_data

    def export_data(self, timeline: List[Dict[str, Any]], output_path: str, format_type: str) -> str:
        """
        Exports location timelines into requested formats: GeoJSON, KML, CSV, or XLSX.
        """
        if format_type.lower() == 'geojson':
            return GeoExport.to_geojson(timeline, output_path)
        elif format_type.lower() == 'csv':
            return GeoExport.to_csv(timeline, output_path)
        elif format_type.lower() == 'xlsx':
            return GeoExport.to_xlsx(timeline, output_path)
        else:
            raise ValueError(f"Unsupported forensic export format: {format_type}")
