from datetime import datetime, timedelta, timezone
from backend.analytics.risk_engine import calculate_cluster_risk

def test_risk_engine_escalating_pattern():
    now = datetime.now(timezone.utc)
    # High threat incidents concentrated in time and space with diverse reporters
    incidents = [
        {
            "id": "1",
            "latitude": 12.9716,
            "longitude": 77.5946,
            "timestamp": now - timedelta(hours=3),
            "severity": 4,
            "reporter_id": "rep1",
            "reporter_type": "citizen",
            "incident_type": "stalking",
            "description": "Followed down dark alley"
        },
        {
            "id": "2",
            "latitude": 12.9717,
            "longitude": 77.5947,
            "timestamp": now - timedelta(hours=2),
            "severity": 5,
            "reporter_id": "rep2",
            "reporter_type": "citizen",
            "incident_type": "intimidation",
            "description": "Confronted aggressively near alley"
        },
        {
            "id": "3",
            "latitude": 12.9715,
            "longitude": 77.5945,
            "timestamp": now - timedelta(hours=1),
            "severity": 4,
            "reporter_id": "rep3",
            "reporter_type": "camera_cv",
            "incident_type": "aggressive_posture",
            "description": "CV alert: Confrontation stance detected"
        }
    ]

    analysis = calculate_cluster_risk(incidents)
    assert analysis["risk_score"] > 50.0
    assert analysis["pattern_level"] in ("CONCERNING", "ESCALATING")
    assert "explanation" in analysis
    assert analysis["reporter_diversity"] == 3
