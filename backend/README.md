# AI Video Editor Backend

FastAPI backend for the AI Video Editor application.

## Features

- **Authentication**: JWT-based user authentication and authorization
- **File Upload**: Secure media file upload with validation
- **Media Management**: CRUD operations for video, audio, and image files
- **Project Management**: Save and load video editing projects
- **Thumbnail Generation**: Automatic thumbnail creation for media files
- **Metadata Extraction**: Extract video/audio metadata using FFmpeg
- **CORS Support**: Configured for frontend communication

## Setup

### Prerequisites

- Python 3.8+
- FFmpeg (for video processing)

### Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Install FFmpeg:
   - **Windows**: Download from https://ffmpeg.org/download.html
   - **macOS**: `brew install ffmpeg`
   - **Linux**: `sudo apt-get install ffmpeg`

### Running the Server

#### Development Mode
```bash
python run.py
```

#### Production Mode
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Environment Variables

Create a `.env` file in the backend directory:

```env
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///./video_editor.db
UPLOAD_DIR=./uploads
THUMBNAIL_DIR=./thumbnails
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_BUCKET_NAME=your-bucket-name
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user info

### Media Management
- `POST /media/upload` - Upload media file
- `GET /media/` - Get all user media files
- `GET /media/{id}` - Get specific media file
- `DELETE /media/{id}` - Delete media file

### Project Management
- `POST /projects/` - Create new project
- `GET /projects/` - Get all user projects
- `GET /projects/{id}` - Get specific project
- `PUT /projects/{id}` - Update project
- `DELETE /projects/{id}` - Delete project

## File Structure

```
backend/
├── main.py              # FastAPI application entry point
├── run.py               # Development server runner
├── config.py            # Application configuration
├── database.py          # Database connection and setup
├── models.py            # SQLAlchemy database models
├── schemas.py           # Pydantic schemas for API
├── auth.py              # Authentication utilities
├── storage.py           # File storage and processing
├── routes/              # API route handlers
│   ├── auth.py          # Authentication routes
│   ├── media.py         # Media management routes
│   └── projects.py      # Project management routes
├── requirements.txt     # Python dependencies
└── README.md           # This file
```

## Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- File type validation
- File size limits
- User-specific data isolation
- CORS protection

## Supported File Types

### Video
- MP4, MOV, AVI, MKV, WebM

### Audio
- MP3, WAV, AAC, M4A, OGG

### Images
- JPG, JPEG, PNG, GIF, WebP