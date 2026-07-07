import json
from typing import Dict, Any

class LocationAPI:
    """
    Simulation interface representing the Location module's secure local API.
    Used by front-end clients to dispatch extraction parameters and fetch compiled geo-history.
    """
    def __init__(self, service):
        self.service = service

    def get_locations(self) -> str:
        """
        GET /api/forensic/locations
        Returns JSON-encoded case coordinates array, statistics, and integrity logs.
        """
        try:
            data = self.service.process_case_location_artifacts()
            return json.dumps({
                "status": "success",
                "code": 200,
                "data": data
            }, indent=2)
        except Exception as e:
            return json.dumps({
                "status": "error",
                "code": 500,
                "message": f"Forensic extraction failed: {str(e)}"
            }, indent=2)

    def trigger_export(self, format_type: str, destination: str) -> str:
        """
        POST /api/forensic/locations/export
        Generates physical file containing GeoJSON, CSV or Excel data.
        """
        try:
            data = self.service.process_case_location_artifacts()
            timeline = data.get("timeline", [])
            saved_path = self.service.export_data(timeline, destination, format_type)
            return json.dumps({
                "status": "success",
                "code": 201,
                "exported_path": saved_path,
                "format": format_type,
                "integrity_hash": data.get("integrity_signature")
            }, indent=2)
        except Exception as e:
            return json.dumps({
                "status": "error",
                "code": 400,
                "message": f"Export process failed: {str(e)}"
            }, indent=2)
