"""Anti-gaming safeguards to detect spamming and coordinated falsification."""
from datetime import datetime, timedelta
from typing import List, Dict, Any

def check_anti_gaming(
    user_incidents: List[Dict[str, Any]],
    max_reports_per_hour: int = 5
) -> Dict[str, Any]:
    """
    Detect suspicious velocity from a single reporter or identical coordinates bursts.
    """
    if not user_incidents:
        return {"flagged": False, "reason": None}

    now = datetime.now()
    one_hour_ago = now - timedelta(hours=1)
    
    recent_reports = [
        inc for inc in user_incidents 
        if inc.get("created_at") and inc["created_at"] >= one_hour_ago
    ]

    if len(recent_reports) > max_reports_per_hour:
        return {
            "flagged": True,
            "reason": f"High submission velocity ({len(recent_reports)} reports in 1 hour)",
            "action": "THROTTLE_AND_AUDIT"
        }

    # Check identical coordinate bursts
    coords = [(round(inc["latitude"], 5), round(inc["longitude"], 5)) for inc in user_incidents]
    if len(coords) >= 4 and len(set(coords)) == 1:
        return {
            "flagged": True,
            "reason": "Repeated identical coordinates in rapid sequence",
            "action": "MANUAL_VERIFICATION_REQUIRED"
        }

    return {"flagged": False, "reason": None}
