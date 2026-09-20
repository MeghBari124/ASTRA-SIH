# ASTRA — Context-Aware Safety Intelligence Platform
> **Project Code Sentinel — CX1001**  
> *"Connect the dots instead of counting incidents."*

ASTRA transforms passive incident recording and standalone computer vision into an active, multi-signal safety intelligence ecosystem. By synthesizing spatial clustering, temporal recurrence patterns, trend acceleration, and community corroboration, ASTRA identifies emerging safety risks **before** they escalate.

---

## 🌟 Core Architecture

```
                       ┌────────────────────────────────┐
                       │    Data & Telemetry Sources    │
                       │  Citizens • CCTV AI • Patrols  │
                       └───────────────┬────────────────┘
                                       │
                                       ▼
                       ┌────────────────────────────────┐
                       │     FastAPI Ingestion & RBAC   │
                       │   Deduplication & Anti-Gaming  │
                       └───────────────┬────────────────┘
                                       │
                                       ▼
     ┌──────────────────────────────────────────────────────────────────┐
     │                      ASTRA Analytics Engine                      │
     │  ┌────────────────────┐ ┌───────────────────┐ ┌───────────────┐  │
     │  │  Haversine DBSCAN  │ │  Temporal Windows │ │ Surge & Trend │  │
     │  │ Spatial Clustering │ │ Concentration     │ │ Acceleration  │  │
     │  └────────────────────┘ └───────────────────┘ └───────────────┘  │
     │  ┌────────────────────┐ ┌───────────────────┐ ┌───────────────┐  │
     │  │ Reporter Diversity │ │ MO & Behavior     │ │  Risk Engine  │  │
     │  │ Credibility Weight │ │ Similarity Match  │ │  (0-100 Score)│  │
     │  └────────────────────┘ └───────────────────┘ └───────────────┘  │
     └─────────────────────────────────┬────────────────────────────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         ▼                             ▼                             ▼
┌──────────────────┐         ┌──────────────────┐         ┌───────────────────┐
│ Citizen Portal   │         │ Security Monitor │         │ Authority Command │
│ SafeReport & GPS │         │ CCTV CV Stream   │         │ Explainable GIS   │
│ Port 8000        │         │ Port 8000 / 5000 │         │ Review & Dispatch │
└──────────────────┘         └──────────────────┘         └───────────────────┘
```

---

## 🚀 How to Run

### 1. Run the ASTRA Platform (FastAPI Backend + 3 Frontends)

```bash
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

Then open your browser at:
- **Unified Portal**: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
- **Citizen SafeReport**: [http://127.0.0.1:8000/citizen/report.html](http://127.0.0.1:8000/citizen/report.html)
- **Security & CCTV Monitor**: [http://127.0.0.1:8000/security/monitor.html](http://127.0.0.1:8000/security/monitor.html)
- **Authority Intelligence Command**: [http://127.0.0.1:8000/authority/dashboard.html](http://127.0.0.1:8000/authority/dashboard.html)
- **Interactive Swagger API Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 2. Run the Legacy CV Stream (Port 5000)

```bash
python complete.py
```
Provides live OpenCV, YOLOv8 pose, gender, violence, and emotion detection.

---

## 🧪 Running the Test Suite

```bash
python -m pytest tests/
```

---

## 📊 Default Test Accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@astra.safety` | `admin123` |
| Authority | `authority@astra.safety` | `auth123` |
| Security | `security@astra.safety` | `sec123` |
| Citizen | `pooja@example.com` | `pass123` |

---

## 🔒 Security & Privacy

- **Reporter Identity Protection**: Public and authority views conceal individual user identities.
- **Explainable Threat Scores**: Risk metrics are backed by transparent evidence breakdowns across 5 sub-engines.
- **Immutable Human Review**: Authority intervention decisions are logged with timestamped audit trails.
