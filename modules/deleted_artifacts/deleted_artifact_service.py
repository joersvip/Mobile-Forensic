import os
import json
import logging
from typing import List, Dict, Any
from .artifact_parser import ArtifactParser
from .artifact_statistics import ArtifactStatistics
from .timeline_builder import TimelineBuilder

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class DeletedArtifactService:
    """
    Forensic service for recovering and scanning deleted files, orphan DB records, 
    and residual thumbnail structures in legitimate file system images.
    """
    def __init__(self, mount_dir: str):
        self.mount_dir = mount_dir
        self.parser = ArtifactParser()
        self.logger = logging.getLogger("DeletedArtifactService")

    def perform_deleted_recovery_scan(self) -> Dict[str, Any]:
        """
        Scans block lists, journal logs, and unallocated clusters for deleted indices.
        """
        self.logger.info(f"Initiating deleted artifact carving on: {self.mount_dir}")
        
        # Parse available disk structures
        discovered_raw = self.parser.carve_unallocated_sectors(self.mount_dir)
        
        # Build timeline
        timeline = TimelineBuilder.build_chronology(discovered_raw)
        
        # Collect statistics
        stats = ArtifactStatistics.compile_dashboard_metrics(discovered_raw)

        return {
            "status": "success",
            "total_carved": len(discovered_raw),
            "statistics": stats,
            "timeline": timeline,
            "artifacts": discovered_raw
        }
