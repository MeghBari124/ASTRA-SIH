"""ASTRA - Context-Aware Safety Intelligence Platform: Main FastAPI Application."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import settings
from backend.database.connection import engine, Base, SessionLocal
from backend.api import api_router
from data.synthetic_generator import seed_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application startup and shutdown lifecycle.
    """

    # ---------------------------------------------------------
    # STARTUP
    # ---------------------------------------------------------
    print("Initializing ASTRA Database & Intelligence Engine...")

    # Create database tables if they do not exist
    Base.metadata.create_all(bind=engine)

    # Seed demo data only when enabled
    if settings.SEED_DEMO_DATA:
        db = SessionLocal()

        try:
            seed_database(db)
            print("Demo data seeded successfully.")

        except Exception as e:
            print(f"Startup seeding notice: {e}")

        finally:
            db.close()

    else:
        print(
            "SEED_DEMO_DATA is False: "
            "Production mode active (skipping synthetic seeding)."
        )

    print("ASTRA Safety Intelligence Platform is online!")

    # Application is running
    yield

    # ---------------------------------------------------------
    # SHUTDOWN
    # ---------------------------------------------------------
    print("Shutting down ASTRA Platform...")


# =============================================================
# FASTAPI APPLICATION
# =============================================================

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "Connect the dots instead of counting incidents: "
        "Context-aware multi-signal safety intelligence."
    ),
    lifespan=lifespan,
)


# =============================================================
# CORS CONFIGURATION
# =============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=[
        "GET",
        "POST",
        "PATCH",
        "PUT",
        "DELETE",
        "OPTIONS",
    ],
    allow_headers=["*"],
)


# =============================================================
# API ROUTES
# =============================================================

app.include_router(
    api_router,
    prefix=settings.API_V1_STR,
)


# =============================================================
# HEALTH CHECK
# =============================================================

@app.get("/health")
def health_check():
    """
    Health check endpoint used by frontend and deployment services.
    """

    return {
        "status": "healthy",
        "service": "ASTRA Safety Intelligence Platform",
        "version": settings.VERSION,
        "database": "SQLite (Dev) / PostgreSQL compatible",
    }


# =============================================================
# LOCAL DEVELOPMENT
# =============================================================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "backend.main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
    )
