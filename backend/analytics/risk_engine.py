"""ASTRA Core Risk Engine: Connects the dots instead of counting incidents."""
from datetime import datetime, timezone
from typing import List, Dict, Any
from backend.config import settings
from backend.analytics.spatial_clustering import (
    perform_spatial_clustering,
    compute_cluster_metrics
)
from backend.analytics.time_patterns import analyze_time_patterns
from backend.analytics.frequency import analyze_frequency
from backend.analytics.trend_detection import analyze_trend
from backend.analytics.reporter_diversity import analyze_reporter_diversity
from backend.analytics.behaviour_similarity import analyze_behaviour_similarity

def calculate_cluster_risk(incidents: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Synthesize multi-signal analysis for a group of clustered incidents into an
    explainable safety pattern and risk assessment.
    """
    if not incidents:
        return {
            "risk_score": 0.0,
            "pattern_level": "NORMAL",
            "explanation": "No incidents provided.",
            "evidence": {}
        }

    # Extract signals
    coords = [(inc["latitude"], inc["longitude"]) for inc in incidents]
    timestamps = [inc["timestamp"] for inc in incidents]
    severities = [inc.get("severity", 3) for inc in incidents]
    reporter_ids = [inc.get("reporter_id") for inc in incidents]
    reporter_types = [inc.get("reporter_type", "citizen") for inc in incidents]
    incident_types = [inc.get("incident_type", "unknown") for inc in incidents]
    descriptions = [inc.get("description", "") for inc in incidents]

    # Run signal analytics
    spatial_res = compute_cluster_metrics(coords)
    time_res = analyze_time_patterns(timestamps)
    freq_res = analyze_frequency(timestamps)
    trend_res = analyze_trend(timestamps, severities)
    div_res = analyze_reporter_diversity(reporter_ids, reporter_types)
    mo_res = analyze_behaviour_similarity(incident_types, descriptions)

    # Weighted Composite Risk Score
    score = (
        spatial_res["spatial_score"] * settings.WEIGHT_SPATIAL +
        time_res["temporal_score"] * settings.WEIGHT_TEMPORAL +
        freq_res["frequency_score"] * settings.WEIGHT_FREQUENCY +
        trend_res["trend_score"] * settings.WEIGHT_TREND +
        div_res["diversity_score"] * settings.WEIGHT_DIVERSITY
    )
    risk_score = round(min(100.0, max(0.0, score)), 1)

    # Determine Pattern Level based on configured thresholds
    if risk_score >= settings.THRESHOLD_ESCALATING:
        pattern_level = "ESCALATING"
    elif risk_score >= settings.THRESHOLD_CONCERNING:
        pattern_level = "CONCERNING"
    elif risk_score >= settings.THRESHOLD_EMERGING:
        pattern_level = "EMERGING"
    else:
        pattern_level = "NORMAL"

    # Generate Explainable Narrative
    sorted_ts = sorted(timestamps)
    first_seen = sorted_ts[0]
    last_seen = sorted_ts[-1]
    
    explanation_parts = [
        f"{pattern_level} pattern identified across {len(incidents)} incidents within a {spatial_res['radius_meters']}m radius.",
        f"Dominant threat type: {mo_res['primary_threat_type']} ({mo_res['mo_consistency']}% consistency).",
        f"Primary temporal concentration: {time_res['time_window']} (Night ratio: {int(time_res['night_ratio']*100)}%).",
        f"Corroboration: {div_res['unique_reporters']} independent reporters across sources [{', '.join(div_res['types_breakdown'])}].",
        f"Trend: {trend_res['trend_direction']} ({trend_res['acceleration']}) with incident rate {freq_res['incident_rate_per_day']} /day."
    ]
    explanation = " ".join(explanation_parts)

    evidence = {
        "spatial": spatial_res,
        "temporal": time_res,
        "frequency": freq_res,
        "trend": trend_res,
        "diversity": div_res,
        "behaviour": mo_res,
        "weights": {
            "spatial": settings.WEIGHT_SPATIAL,
            "temporal": settings.WEIGHT_TEMPORAL,
            "frequency": settings.WEIGHT_FREQUENCY,
            "trend": settings.WEIGHT_TREND,
            "diversity": settings.WEIGHT_DIVERSITY
        }
    }

    return {
        "risk_score": risk_score,
        "pattern_level": pattern_level,
        "explanation": explanation,
        "evidence": evidence,
        "centroid": spatial_res["centroid"],
        "radius_meters": spatial_res["radius_meters"],
        "time_window": time_res["time_window"],
        "reporter_diversity": div_res["unique_reporters"],
        "trend_score": trend_res["trend_score"],
        "first_seen": first_seen,
        "last_seen": last_seen,
        "incident_types": list(set(incident_types)),
        "incident_ids": [inc["id"] for inc in incidents if "id" in inc]
    }
