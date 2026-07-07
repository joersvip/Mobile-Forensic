from typing import List, Dict, Any

class TimelineBuilder:
    """
    Sorts and consolidates file-system event milestones (MACB timestamps) 
    into a chronologically aligned list of evidentiary entries.
    """
    def __init__(self):
        pass

    @staticmethod
    def build_chronology(artifacts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        timeline_events = []
        for art in artifacts:
            filename = art.get("filename", "Unknown")
            
            if art.get("created_time"):
                timeline_events.append({
                    "timestamp": art["created_time"],
                    "filename": filename,
                    "event_type": "Created",
                    "details": f"File created in active directories: {art.get('location')}"
                })
            if art.get("modified_time"):
                timeline_events.append({
                    "timestamp": art["modified_time"],
                    "filename": filename,
                    "event_type": "Modified",
                    "details": "File modification detected."
                })
            if art.get("access_time"):
                timeline_events.append({
                    "timestamp": art["access_time"],
                    "filename": filename,
                    "event_type": "Accessed",
                    "details": "Last recorded data cluster read/access milestone."
                })
            if art.get("deleted_time"):
                timeline_events.append({
                    "timestamp": art["deleted_time"],
                    "filename": filename,
                    "event_type": "Deleted",
                    "details": "Evidence indicates node was deleted/unlinked."
                })

        # Sort chronologically by timestamp string
        timeline_events.sort(key=lambda x: x["timestamp"])
        return timeline_events
