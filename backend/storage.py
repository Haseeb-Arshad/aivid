import os
import uuid
import shutil
from typing import Optional
from fastapi import UploadFile, HTTPException
from PIL import Image
import ffmpeg
import tempfile

# Storage configuration
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
THUMBNAIL_DIR = os.getenv("THUMBNAIL_DIR", "./thumbnails")
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB

# Ensure directories exist
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(THUMBNAIL_DIR, exist_ok=True)

# Supported file types
SUPPORTED_VIDEO_TYPES = {".mp4", ".mov", ".avi", ".mkv", ".webm"}
SUPPORTED_AUDIO_TYPES = {".mp3", ".wav", ".aac", ".m4a", ".ogg"}
SUPPORTED_IMAGE_TYPES = {".jpg", ".jpeg", ".png", ".gif", ".webp"}

def get_file_type(filename: str) -> str:
    """Determine file type based on extension"""
    ext = os.path.splitext(filename)[1].lower()
    
    if ext in SUPPORTED_VIDEO_TYPES:
        return "video"
    elif ext in SUPPORTED_AUDIO_TYPES:
        return "audio"
    elif ext in SUPPORTED_IMAGE_TYPES:
        return "image"
    else:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {ext}"
        )

def validate_file(file: UploadFile) -> None:
    """Validate uploaded file"""
    if file.size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB"
        )
    
    # Validate file type
    get_file_type(file.filename)

async def upload_file_to_storage(file: UploadFile) -> tuple[str, str, dict]:
    """
    Upload file to storage and return file path, file type, and metadata
    """
    validate_file(file)
    
    # Generate unique filename
    file_ext = os.path.splitext(file.filename)[1].lower()
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    file_type = get_file_type(file.filename)
    metadata = {}
    
    # Extract metadata based on file type
    if file_type == "video":
        metadata = extract_video_metadata(file_path)
    elif file_type == "audio":
        metadata = extract_audio_metadata(file_path)
    elif file_type == "image":
        metadata = extract_image_metadata(file_path)
    
    return file_path, file_type, metadata

def extract_video_metadata(file_path: str) -> dict:
    """Extract metadata from video file"""
    try:
        probe = ffmpeg.probe(file_path)
        video_stream = next((stream for stream in probe['streams'] if stream['codec_type'] == 'video'), None)
        
        if video_stream:
            return {
                "width": int(video_stream.get('width', 0)),
                "height": int(video_stream.get('height', 0)),
                "duration": float(probe['format'].get('duration', 0)),
                "fps": eval(video_stream.get('r_frame_rate', '30/1')),
                "codec": video_stream.get('codec_name', 'unknown')
            }
    except Exception as e:
        print(f"Error extracting video metadata: {e}")
    
    return {}

def extract_audio_metadata(file_path: str) -> dict:
    """Extract metadata from audio file"""
    try:
        probe = ffmpeg.probe(file_path)
        audio_stream = next((stream for stream in probe['streams'] if stream['codec_type'] == 'audio'), None)
        
        if audio_stream:
            return {
                "duration": float(probe['format'].get('duration', 0)),
                "codec": audio_stream.get('codec_name', 'unknown'),
                "sample_rate": int(audio_stream.get('sample_rate', 0)),
                "channels": int(audio_stream.get('channels', 0))
            }
    except Exception as e:
        print(f"Error extracting audio metadata: {e}")
    
    return {}

def extract_image_metadata(file_path: str) -> dict:
    """Extract metadata from image file"""
    try:
        with Image.open(file_path) as img:
            return {
                "width": img.width,
                "height": img.height,
                "format": img.format
            }
    except Exception as e:
        print(f"Error extracting image metadata: {e}")
    
    return {}

async def generate_thumbnail(file_path: str, file_type: str) -> Optional[str]:
    """Generate thumbnail for media file"""
    try:
        thumbnail_filename = f"{uuid.uuid4()}.jpg"
        thumbnail_path = os.path.join(THUMBNAIL_DIR, thumbnail_filename)
        
        if file_type == "video":
            # Generate video thumbnail using ffmpeg
            (
                ffmpeg
                .input(file_path, ss=1)  # Take frame at 1 second
                .output(thumbnail_path, vframes=1, s='320x240')
                .overwrite_output()
                .run(quiet=True)
            )
        elif file_type == "image":
            # Generate image thumbnail using PIL
            with Image.open(file_path) as img:
                img.thumbnail((320, 240))
                img.save(thumbnail_path, "JPEG")
        else:
            # For audio files, return None (no thumbnail)
            return None
        
        return thumbnail_path
    except Exception as e:
        print(f"Error generating thumbnail: {e}")
        return None