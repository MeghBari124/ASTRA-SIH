"""Reporter diversity and independent corroboration analysis."""
from typing import List, Dict, Any

def analyze_reporter_diversity(reporter_ids: List[str], reporter_types: List[str]) -> Dict[str, Any]:
    """
    Evaluate credibility via multi-source independent corroboration.
    Computes diversity_score (0-100) and unique counts.
    """
    valid_ids = [r for r in reporter_ids if r]
    unique_reporters = len(set(valid_ids))
    unique_types = len(set(reporter_types))
    total_reports = len(reporter_types)

    if total_reports == 0:
        return {
            "unique_reporters": 0,
            "unique_types": 0,
            "diversity_score": 0.0,
            "is_single_source": True
        }

    # If only 1 reporter submitted all incidents, diversity is penalized (prevents lone bias)
    is_single_source = (unique_reporters == 1 and total_reports >= 2)

    # Multi-source corroboration: e.g. citizen report + CCTV AI flag + security patrol note
    base_score = 30.0
    if is_single_source:
        base_score = 25.0
    else:
        # Unique individual reporters boost confidence
        base_score += min(40.0, unique_reporters * 12.0)
        # Multiple distinct source types (e.g. citizen + camera_cv) strongly boost confidence
        base_score += min(30.0, unique_types * 15.0)

    diversity_score = min(100.0, max(15.0, base_score))

    return {
        "unique_reporters": unique_reporters,
        "unique_types": unique_types,
        "diversity_score": round(diversity_score, 2),
        "is_single_source": is_single_source,
        "types_breakdown": list(set(reporter_types))
    }
