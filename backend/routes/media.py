from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import os

from ..database import get_db
from ..models import User, MediaFile
from ..schemas import MediaFileResponse, UploadResponse, APIResponse
from ..auth import get_current_user
from ..storage import upload_file_to_storage, generate_thumbnail

router = APIRouter(prefix="/media", tags=["media"])

@router.post("/upload", response_model=UploadResponse)
async def upload_media_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a media file (video, audio, or image)"""
    try:
        # Upload file and extract metadata
        file_path, file_type, metadata = await upload_file_to_storage(file)
        
        # Generate thumbnail
        thumbnail_path = await generate_thumbnail(file_path, file_type)
        
        # Create database record
        db_media = MediaFile(
            filename=os.path.basename(file_path),
            original_filename=file.filename,
            file_type=file_type,
            file_size=file.size,
            duration=metadata.get('duration'),
            file_url=file_path,
            thumbnail_url=thumbnail_path,
            metadata=metadata,
            owner_id=current_user.id
        )
        
        db.add(db_media)
        db.commit()
        db.refresh(db_media)
        
        return UploadResponse(
            success=True,
            message="File uploaded successfully",
            file=db_media
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.get("/", response_model=List[MediaFileResponse])
async def get_media_files(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all media files for the current user"""
    media_files = db.query(MediaFile).filter(MediaFile.owner_id == current_user.id).all()
    return media_files

@router.get("/{media_id}", response_model=MediaFileResponse)
async def get_media_file(
    media_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific media file"""
    media_file = db.query(MediaFile).filter(
        MediaFile.id == media_id,
        MediaFile.owner_id == current_user.id
    ).first()
    
    if not media_file:
        raise HTTPException(status_code=404, detail="Media file not found")
    
    return media_file

@router.delete("/{media_id}", response_model=APIResponse)
async def delete_media_file(
    media_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a media file"""
    media_file = db.query(MediaFile).filter(
        MediaFile.id == media_id,
        MediaFile.owner_id == current_user.id
    ).first()
    
    if not media_file:
        raise HTTPException(status_code=404, detail="Media file not found")
    
    # Delete physical files
    try:
        if os.path.exists(media_file.file_url):
            os.remove(media_file.file_url)
        if media_file.thumbnail_url and os.path.exists(media_file.thumbnail_url):
            os.remove(media_file.thumbnail_url)
    except Exception as e:
        print(f"Error deleting files: {e}")
    
    # Delete database record
    db.delete(media_file)
    db.commit()
    
    return APIResponse(
        success=True,
        message="Media file deleted successfully"
    )