from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any, List
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Project schemas
class ProjectBase(BaseModel):
    name: str
    duration: Optional[float] = 0.0
    fps: Optional[int] = 30
    resolution_width: Optional[int] = 1920
    resolution_height: Optional[int] = 1080

class ProjectCreate(ProjectBase):
    tracks_data: Optional[Dict[str, Any]] = None

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    duration: Optional[float] = None
    fps: Optional[int] = None
    resolution_width: Optional[int] = None
    resolution_height: Optional[int] = None
    tracks_data: Optional[Dict[str, Any]] = None

class ProjectResponse(ProjectBase):
    id: str
    tracks_data: Optional[Dict[str, Any]]
    owner_id: str
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True

# Media file schemas
class MediaFileBase(BaseModel):
    filename: str
    file_type: str

class MediaFileResponse(MediaFileBase):
    id: str
    original_filename: str
    file_size: int
    duration: Optional[float]
    file_url: str
    thumbnail_url: Optional[str]
    metadata: Optional[Dict[str, Any]]
    owner_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Authentication schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Transcription schemas
class TranscriptionSegment(BaseModel):
    text: str
    start: float
    end: float
    confidence: float

class TranscriptionResult(BaseModel):
    segments: List[TranscriptionSegment]
    language: str
    duration: float

class TranscriptionRequest(BaseModel):
    media_file_id: str

class TranscriptionResponse(BaseModel):
    success: bool
    message: str
    transcription: Optional[TranscriptionResult] = None

# API Response schemas
class APIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None

class UploadResponse(BaseModel):
    success: bool
    message: str
    file: MediaFileResponse