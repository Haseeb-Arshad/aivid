from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from .database import create_tables
from .routes import auth, media, projects

app = FastAPI(
    title="AI Video Editor API",
    description="Backend API for AI-powered video editing application",
    version="1.0.0"
)

# CORS configuration for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Remix dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(media.router)
app.include_router(projects.router)

@app.on_event("startup")
async def startup_event():
    """Initialize database tables on startup"""
    create_tables()

@app.get("/")
async def root():
    return {"message": "AI Video Editor API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    from datetime import datetime
    return {"status": "healthy", "timestamp": datetime.utcnow()}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)