// API Response Types (matching backend schemas)
export interface UserResponse {
  id: string;
  email: string;
  created_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface MediaFileResponse {
  id: string;
  filename: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  duration?: number;
  file_url: string;
  thumbnail_url?: string;
  metadata?: Record<string, any>;
  owner_id: string;
  created_at: string;
}

export interface ProjectResponse {
  id: string;
  name: string;
  duration: number;
  fps: number;
  resolution_width: number;
  resolution_height: number;
  tracks_data?: Record<string, any>;
  owner_id: string;
  created_at: string;
  updated_at?: string;
}

export interface TranscriptionSegment {
  text: string;
  start: number;
  end: number;
  confidence: number;
}

export interface TranscriptionResult {
  segments: TranscriptionSegment[];
  language: string;
  duration: number;
}

export interface TranscriptionResponse {
  success: boolean;
  message: string;
  transcription?: TranscriptionResult;
}

export interface APIResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  file: MediaFileResponse;
}

// Frontend-specific types
export interface MediaFile {
  id: string;
  filename: string;
  type: 'video' | 'audio' | 'image';
  duration?: number;
  thumbnailUrl: string;
  fileUrl: string;
  size: number;
  metadata: {
    width?: number;
    height?: number;
    fps?: number;
    codec?: string;
  };
}

export interface Project {
  id: string;
  name: string;
  duration: number;
  fps: number;
  resolution: { width: number; height: number };
  tracks: Track[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Track {
  id: string;
  type: 'video' | 'audio' | 'captions';
  name: string;
  clips: Clip[];
  locked: boolean;
  visible: boolean;
  volume?: number;
}

export interface Clip {
  id: string;
  mediaId: string;
  startTime: number;
  endTime: number;
  trimStart: number;
  trimEnd: number;
  properties: ClipProperties;
}

export interface ClipProperties {
  transform: {
    x: number;
    y: number;
    scale: number;
    rotation: number;
  };
  filters: {
    brightness: number;
    contrast: number;
    saturation: number;
  };
  audio: {
    volume: number;
    muted: boolean;
  };
}

// WebSocket message types
export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

export interface ProcessingStatusMessage extends WebSocketMessage {
  type: 'processing_status';
  data: {
    taskId: string;
    status: 'started' | 'progress' | 'completed' | 'failed';
    progress?: number;
    message?: string;
    result?: any;
  };
}

export interface TranscriptionStatusMessage extends WebSocketMessage {
  type: 'transcription_status';
  data: {
    mediaFileId: string;
    status: 'started' | 'progress' | 'completed' | 'failed';
    progress?: number;
    transcription?: TranscriptionResult;
    error?: string;
  };
}

// Error types
export interface APIErrorResponse {
  detail: string;
  status_code?: number;
}

// Upload progress types
export interface UploadProgress {
  fileId: string;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
}

// Authentication context types
export interface AuthContextType {
  user: UserResponse | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

// Data transformation utilities
export function transformMediaFileResponse(response: MediaFileResponse): MediaFile {
  return {
    id: response.id,
    filename: response.filename,
    type: response.file_type as 'video' | 'audio' | 'image',
    duration: response.duration,
    thumbnailUrl: response.thumbnail_url || '',
    fileUrl: response.file_url,
    size: response.file_size,
    metadata: response.metadata || {},
  };
}

export function transformProjectResponse(response: ProjectResponse): Project {
  return {
    id: response.id,
    name: response.name,
    duration: response.duration,
    fps: response.fps,
    resolution: {
      width: response.resolution_width,
      height: response.resolution_height,
    },
    tracks: response.tracks_data?.tracks || [],
    createdAt: new Date(response.created_at),
    updatedAt: response.updated_at ? new Date(response.updated_at) : new Date(response.created_at),
  };
}

export function transformProjectToRequest(project: Project): {
  name: string;
  duration: number;
  fps: number;
  resolution_width: number;
  resolution_height: number;
  tracks_data: any;
} {
  return {
    name: project.name,
    duration: project.duration,
    fps: project.fps,
    resolution_width: project.resolution.width,
    resolution_height: project.resolution.height,
    tracks_data: {
      tracks: project.tracks,
    },
  };
}