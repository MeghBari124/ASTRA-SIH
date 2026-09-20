"""ASTRA Risk and Intelligence Engine Configuration (zero-dependency on pydantic_settings)."""
import os
from typing import Dict, Any

class Settings:
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "ASTRA - Safety Intelligence Platform")
    VERSION: str = os.getenv("VERSION", "1.0.0")
    API_V1_STR: str = os.getenv("API_V1_STR", "/api")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "astra-secret-key-change-in-production-cx1001")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", str(60 * 24)))
    ALGORITHM: str = "HS256"
    
    # Database: Default to SQLite for zero-configuration, supports Postgres via env
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./astra.db")
    
    # Risk Engine Weights (Sum to 1.0)
    WEIGHT_FREQUENCY: float = float(os.getenv("WEIGHT_FREQUENCY", "0.20"))
    WEIGHT_SPATIAL: float = float(os.getenv("WEIGHT_SPATIAL", "0.25"))
    WEIGHT_TEMPORAL: float = float(os.getenv("WEIGHT_TEMPORAL", "0.20"))
    WEIGHT_DIVERSITY: float = float(os.getenv("WEIGHT_DIVERSITY", "0.15"))
    WEIGHT_TREND: float = float(os.getenv("WEIGHT_TREND", "0.20"))
    
    # Clustering Parameters
    DBSCAN_EPS_KM: float = float(os.getenv("DBSCAN_EPS_KM", "0.5"))  # 500 meters
    DBSCAN_MIN_SAMPLES: int = int(os.getenv("DBSCAN_MIN_SAMPLES", "2"))
    
    # Duplicate Detection
    DUP_DISTANCE_THRESHOLD_KM: float = float(os.getenv("DUP_DISTANCE_THRESHOLD_KM", "0.05"))
    DUP_TIME_WINDOW_MINUTES: int = int(os.getenv("DUP_TIME_WINDOW_MINUTES", "30"))
    
    # Anti-gaming Thresholds
    MAX_REPORTS_PER_USER_PER_HOUR: int = int(os.getenv("MAX_REPORTS_PER_USER_PER_HOUR", "5"))
    
    # Risk Level Categorization
    THRESHOLD_EMERGING: float = float(os.getenv("THRESHOLD_EMERGING", "25.0"))
    THRESHOLD_CONCERNING: float = float(os.getenv("THRESHOLD_CONCERNING", "50.0"))
    THRESHOLD_ESCALATING: float = float(os.getenv("THRESHOLD_ESCALATING", "75.0"))

settings = Settings()
