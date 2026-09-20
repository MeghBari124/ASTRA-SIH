"""Duplicate report identification within spatio-temporal thresholds."""
from datetime import datetime
from typing import List, Dict, Any, Tuple
from backend.analytics.spatial_clustering import haversine_distance_km

def detect_duplicates(
    incidents: List[Dict[str, Any]],
    distance_threshold_km: float = 0.05,  # 50 meters
    time_window_minutes: int = 30
) -> List[Tuple[str, str]]:
    """
    Detect pairs of incidents that likely represent the exact same physical event.
    Returns list of (incident_id_1, incident_id_2).
    """
    duplicates = []
    n = len(incidents)
    for i in range(n):
        for j in range(i + 1, n):
            inc1 = incidents[i]
            inc2 = incidents[j]

            # Compare type similarity
            if inc1.get("incident_type") == inc2.get("incident_type"):
                dist = haversine_distance_km(
                    inc1["latitude"], inc1["longitude"],
                    inc2["latitude"], inc2["longitude"]
                )
                if dist <= distance_threshold_km:
                    t1 = inc1["timestamp"]
                    t2 = inc2["timestamp"]
                    time_diff = abs((t1 - t2).total_seconds()) / 60.0
                    if time_diff <= time_window_minutes:
                        duplicates.append((inc1["id"], inc2["id"]))
                        
    return duplicates
