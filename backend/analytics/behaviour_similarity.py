"""Behavioral similarity and pattern modus operandi matching."""
from typing import List, Dict, Any

def analyze_behaviour_similarity(incident_types: List[str], descriptions: List[str]) -> Dict[str, Any]:
    """
    Evaluate similarity in behavior, modus operandi, and incident taxonomy.
    """
    if not incident_types:
        return {"mo_consistency": 0.0, "primary_threat_type": "None", "keywords": []}

    # Frequency of types
    type_counts = {}
    for t in incident_types:
        type_counts[t] = type_counts.get(t, 0) + 1

    primary_type = max(type_counts, key=type_counts.get)
    consistency = type_counts[primary_type] / len(incident_types)

    # Keywords from descriptions
    keywords = set()
    stop_words = {"the", "a", "an", "and", "or", "in", "on", "at", "to", "was", "is", "near", "by"}
    for desc in descriptions:
        if desc:
            words = desc.lower().replace(",", "").replace(".", "").split()
            for w in words:
                if len(w) > 3 and w not in stop_words:
                    keywords.add(w)

    return {
        "mo_consistency": round(consistency * 100.0, 1),
        "primary_threat_type": primary_type,
        "type_distribution": type_counts,
        "common_keywords": list(keywords)[:8]
    }
