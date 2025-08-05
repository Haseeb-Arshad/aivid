from sqlalchemy import Column, Integer, String, DateTime, Float, Text, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
import uuid

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    projects = relationship("Project", back_populates="owner")
    media_files = relationship("MediaFile", back_populates="owner")

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    duration = Column(Float, default=0.0)
    fps = Column(Integer, default=30)
    resolution_width = Column(Integer, default=1920)
    resolution_height = Column(Integer, default=1080)
    tracks_data = Column(JSON)  # Store track and clip data as JSON
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    owner = relationship("User", back_populates="projects")

class MediaFile(Base):
    __tablename__ = "media_files"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # 'video', 'audio', 'image'
    file_size = Column(Integer, nullable=False)
    duration = Column(Float, nullable=True)  # For video/audio files
    file_url = Column(String, nullable=False)
    thumbnail_url = Column(String, nullable=True)
    metadata = Column(JSON)  # Store width, height, fps, codec, etc.
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    owner = relationship("User", back_populates="media_files")