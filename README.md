# ASTRA — Context-Aware Safety Intelligence Platform
> **Project Code Sentinel — CX1001**  
> *"Connect the dots instead of counting incidents."*

ASTRA transforms passive incident recording and standalone computer vision into an active, multi-signal safety intelligence ecosystem. By synthesizing spatial clustering, temporal recurrence patterns, trend acceleration, community corroboration, and behavioural MO matching, ASTRA identifies emerging safety risks **before** they escalate.

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
     │  │ Human vs Automated │ │ TF-IDF + Taxonomy │ │  (0-100 Score)│  │
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

### 1. Configure Environment

Copy `.env.example` to `.env` and set values:

```bash
cp .env.example .env
```

Key variables:
- `SEED_DEMO_DATA=true` — Seeds synthetic demo data on first startup (set to `false` for real deployments)
- `DATABASE_URL` — SQLite by default for development; configure PostgreSQL for production
- `ALLOWED_ORIGINS` — Comma-separated list of allowed frontend origins

### 2. Run the ASTRA Platform (FastAPI Backend + 3 Frontends)

```bash
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

Then open your browser at:
- **Unified Portal**: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
- **Citizen SafeReport**: [http://127.0.0.1:8000/citizen/report.html](http://127.0.0.1:8000/citizen/report.html)
- **Security & CCTV Monitor**: [http://127.0.0.1:8000/security/monitor.html](http://127.0.0.1:8000/security/monitor.html)
- **Authority Intelligence Command**: [http://127.0.0.1:8000/authority/dashboard.html](http://127.0.0.1:8000/authority/dashboard.html)
- **Interactive Swagger API Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 3. Run the Legacy CV Stream (Port 5000)

```bash
python complete.py
```
Provides live OpenCV, YOLOv8 pose, gender, violence, and emotion detection.

---

## 🗄️ Database

| Environment | Backend |
|---|---|
| Development (default) | SQLite (`./astra.db`) |
| Production / deployment | PostgreSQL + PostGIS (configure via `DATABASE_URL` in `.env`) |

> **Note:** The default demo uses SQLite for zero-setup convenience.  
> Production deployments should use PostgreSQL with Alembic migrations.

---

## 🧪 Running the Test Suite

```bash
python -m pytest tests/ -v
```

> **Note:** The test suite validates core prototype logic with 6 automated unit tests.  
> This confirms that specific synthetic scenarios produce expected outputs — it is not a measure of real-world detection accuracy.

---

## 📊 Demo Accounts

> ⚠️ **These are demo-only accounts for local development and evaluation.**  
> **Never use these credentials in any staging or production deployment.**  
> Rotate all secrets and create proper accounts before any real-world use.

| Role | Email | Password |
|---|---|---|
| Admin | `admin@astra.safety` | `admin123` |
| Authority | `authority@astra.safety` | `auth123` |
| Security | `security@astra.safety` | `sec123` |
| Citizen | `pooja@example.com` | `pass123` |

---

## 🔒 Security & Privacy

- **Reporter Identity Protection**: Public and authority views conceal individual user identities.
- **Explainable Threat Scores**: Risk metrics are backed by transparent evidence breakdowns across 6 analytical pillars (Spatial, Temporal, Frequency, Trend, Reporter Diversity, Behaviour/MO).
- **Append-Only Audit Trail**: Authority intervention decisions are logged with SHA-256 hash-chained, timestamped audit records for tamper-evident review history.
- **CORS Policy**: Requests are restricted to explicitly configured allowed origins (no wildcard in credentialed requests).

---

## 🏗️ 6-Pillar Risk Engine

| Pillar | Weight | What it measures |
|---|---|---|
| Spatial Clustering | 20% | Geographic proximity of incidents (Haversine DBSCAN) |
| Temporal Patterns | 15% | Time-of-day concentration, night ratio |
| Frequency / Surge | 15% | Incident velocity and rate of occurrence |
| Trend & Escalation | 15% | Increasing/decreasing severity acceleration |
| Reporter Diversity | 20% | Independent human witnesses vs automated sensors |
| Behaviour / MO | 15% | TF-IDF cosine similarity + threat taxonomy + keyword MO |

> **Reporter Diversity** separately counts:
> - `unique_human_reporters` — independent citizens, students, security patrol officers
> - `unique_system_sources` — CCTV AI detectors, sensors (corroborating signals, not human witnesses)
