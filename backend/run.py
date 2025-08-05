#!/usr/bin/env python3
"""
Development server runner for the AI Video Editor backend
"""
import uvicorn
import os

if __name__ == "__main__":
    # Set environment variables for development
    os.environ.setdefault("SECRET_KEY", "dev-secret-key-change-in-production")
    os.environ.setdefault("DATABASE_URL", "sqlite:///./video_editor.db")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )