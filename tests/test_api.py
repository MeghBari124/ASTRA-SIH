import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.database.connection import Base, engine

Base.metadata.create_all(bind=engine)

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_dashboard_summary(client):
    response = client.get("/api/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    assert "total_incidents" in data
    assert "total_patterns" in data

def test_create_and_list_incident(client):
    payload = {
        "incident_type": "loitering",
        "description": "Test incident for verification",
        "latitude": 12.9716,
        "longitude": 77.5946,
        "severity": 2,
        "reporter_type": "citizen",
        "source": "manual"
    }
    post_res = client.post("/api/incidents/", json=payload)
    assert post_res.status_code == 200
    inc_data = post_res.json()
    assert inc_data["incident_type"] == "loitering"

    list_res = client.get("/api/incidents/")
    assert list_res.status_code == 200
    assert len(list_res.json()) > 0
