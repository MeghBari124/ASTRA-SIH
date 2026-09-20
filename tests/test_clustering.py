import pytest
from backend.analytics.spatial_clustering import perform_spatial_clustering, compute_cluster_metrics

def test_spatial_clustering_dense():
    # Coords clustered tightly near Bangalore center
    coords = [
        (12.9716, 77.5946),
        (12.9717, 77.5947),
        (12.9715, 77.5945),
        (12.9850, 77.6300) # Far outlier
    ]
    labels = perform_spatial_clustering(coords, eps_km=0.5, min_samples=2)
    assert len(labels) == 4
    # The first 3 should share a cluster ID >= 0
    assert labels[0] == labels[1] == labels[2]
    # Outlier should be marked -1
    assert labels[3] == -1

def test_cluster_metrics():
    coords = [(12.9716, 77.5946), (12.9718, 77.5948)]
    metrics = compute_cluster_metrics(coords)
    assert "centroid" in metrics
    assert "radius_meters" in metrics
    assert metrics["radius_meters"] > 0
    assert metrics["spatial_score"] > 0
