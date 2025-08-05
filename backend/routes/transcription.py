from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import MediaFile, User
from schemas import TranscriptionRequest, TranscriptionResponse
from services.transcription import transcription_service
from auth import get_current_user
import os

router = APIRouter(prefix="/transcription", tags=["transcription"])

@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_media(
    request: TranscriptionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Transcribe audio/video file using Whisper AI
    
    Args:
        request: TranscriptionRequest containing media_file_id
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        TranscriptionResponse with transcription results
    """
    try:
        # Get the media file from database
        media_file = db.query(MediaFile).filter(
            MediaFile.id == request.media_file_id,
            MediaFile.owner_id == current_user.id
        ).first()
        
        if not media_file:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Media file not found"
            )
        
        # Check if file type supports transcription
        if media_file.file_type not in ['audio', 'video']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File type not supported for transcription. Only audio and video files are supported."
            )
        
        # Get the actual file path
        # Assuming file_url contains the relative path from uploads directory
        file_path = media_file.file_url
        if not file_path.startswith('/'):
            file_path = os.path.join('uploads', file_path)
        
        # Check if file exists
        if not os.path.exists(file_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Media file not found on disk"
            )
        
        # Perform transcription
        transcription_result = transcription_service.transcribe_file(
            file_path, 
            media_file.file_type
        )
        
        return TranscriptionResponse(
            success=True,
            message="Transcription completed successfully",
            transcription=transcription_result
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Transcription failed: {str(e)}"
        )