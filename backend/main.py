"""ASTRA - Context-Aware Safety Intelligence Platform: Main FastAPI Application."""
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.config import settings
from backend.database.connection import engine, Base, SessionLocal
from backend.api import api_router
from data.synthetic_generator import seed_database

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure database tables are created & seeded
    print("Initializing ASTRA Database & Intelligence Engine...")
    Base.metadata.create_all(bind=engine)
    
    # Auto-seed realistic ground-truth patterns if empty
    db = SessionLocal()
    try:
        seed_database(db)
    except Exception as e:
        print(f"Startup seeding notice: {e}")
    finally:
        db.close()
        
    print("ASTRA Safety Intelligence Platform is online!")
    yield
    print("Shutting down ASTRA Platform...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Connect the dots instead of counting incidents: Context-aware multi-signal safety intelligence.",
    lifespan=lifespan
)

# Enable CORS for local dashboards
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(api_router, prefix=settings.API_V1_STR)

# Mount frontend interfaces
frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend"))

if os.path.exists(frontend_dir):
    # Mount sub-directories
    app.mount("/citizen", StaticFiles(directory=os.path.join(frontend_dir, "citizen")), name="citizen")
    app.mount("/security", StaticFiles(directory=os.path.join(frontend_dir, "security")), name="security")
    app.mount("/authority", StaticFiles(directory=os.path.join(frontend_dir, "authority")), name="authority")

@app.get("/")
def serve_portal():
    portal_path = os.path.join(frontend_dir, "index.html")
    if os.path.exists(portal_path):
        return FileResponse(portal_path)
    return {"status": "ASTRA Intelligence Engine Active"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "ASTRA Safety Intelligence Platform"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
