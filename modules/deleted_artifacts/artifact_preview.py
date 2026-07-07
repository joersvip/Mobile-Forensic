import mimetypes
from typing import Dict, Any

class ArtifactPreview:
    """
    Supplies read-only preview metadata, signatures, and structured stream blocks.
    Strictly forbids modifications to ensure chain of custody integrity.
    """
    def __init__(self):
        pass

    def get_preview_metadata(self, filename: str, mime_type: str) -> Dict[str, Any]:
        """
        Determines the appropriate viewer capabilities and magic bytes.
        """
        signature = "00 00 00 00"
        if mime_type == "application/x-sqlite3":
            signature = "53 51 4c 69 74 65 20 66 6f 72 6d 61 74 20 33 00" # SQLite format 3
        elif mime_type == "application/pdf":
            signature = "25 50 44 46" # %PDF
        elif mime_type.startswith("image/"):
            signature = "89 50 4e 47 0d 0a 1a 0a" if "png" in mime_type else "ff d8 ff e0"

        return {
            "filename": filename,
            "mime_type": mime_type,
            "signature": signature,
            "encoding": "UTF-8 / Binary",
            "read_only": True
        }
