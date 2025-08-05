import os
from typing import Optional

class Settings:
    """Application settings"""
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./video_editor.db")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # File Storage
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")
    THUMBNAIL_DIR: str = os.getenv("THUMBNAIL_DIR", "./thumbnails")
    MAX_FILE_SIZE: int = 100 * 1024 * 1024  # 100MB
    
    # CORS
    ALLOWED_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173"
    ]
    
    # Cloud Storage (for future implementation)
    AWS_ACCESS_KEY_ID: Optional[str] = os.getenv("AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY: Optional[str] = os.getenv("AWS_SECRET_ACCESS_KEY")
    AWS_BUCKET_NAME: Optional[str] = os.getenv("AWS_BUCKET_NAME")
    AWS_REGION: Optional[str] = os.getenv("AWS_REGION", "us-east-1")

settings = Settings()