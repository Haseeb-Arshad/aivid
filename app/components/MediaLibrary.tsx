import { useState, useRef, useCallback } from 'react';
import { MediaThumbnail } from './MediaThumbnail';

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

interface UploadProgress {
  fileId: string;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
}

interface MediaLibraryProps {
  onMediaSelect?: (media: MediaFile) => void;
}

const SUPPORTED_FORMATS = {
  video: ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
  audio: ['.mp3', '.wav', '.aac', '.m4a', '.ogg'],
  image: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
};

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

export function MediaLibrary({ onMediaSelect }: MediaLibraryProps) {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): { isValid: boolean; error?: string } => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return { isValid: false, error: `File size exceeds 500MB limit` };
    }

    // Check file type
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    const allSupportedFormats = [
      ...SUPPORTED_FORMATS.video,
      ...SUPPORTED_FORMATS.audio,
      ...SUPPORTED_FORMATS.image
    ];

    if (!allSupportedFormats.includes(extension)) {
      return { isValid: false, error: `Unsupported file format: ${extension}` };
    }

    return { isValid: true };
  }, []);

  const getFileType = (filename: string): 'video' | 'audio' | 'image' => {
    const extension = '.' + filename.split('.').pop()?.toLowerCase();
    
    if (SUPPORTED_FORMATS.video.includes(extension)) return 'video';
    if (SUPPORTED_FORMATS.audio.includes(extension)) return 'audio';
    if (SUPPORTED_FORMATS.image.includes(extension)) return 'image';
    
    return 'video'; // fallback
  };

  const processFiles = useCallback(async (files: FileList) => {
    setError(null);
    const fileArray = Array.from(files);
    
    // Validate all files first
    const validationResults = fileArray.map(file => ({
      file,
      validation: validateFile(file)
    }));

    const invalidFiles = validationResults.filter(result => !result.validation.isValid);
    if (invalidFiles.length > 0) {
      setError(`Invalid files: ${invalidFiles.map(f => f.validation.error).join(', ')}`);
      return;
    }

    // Process valid files
    const validFiles = validationResults.filter(result => result.validation.isValid);
    
    for (const { file } of validFiles) {
      const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Add to upload progress
      setUploadProgress(prev => [...prev, {
        fileId,
        progress: 0,
        status: 'uploading'
      }]);

      try {
        // Simulate file upload with progress
        await simulateUpload(fileId, file);
        
        // Create media file object
        const metadata = await extractMetadata(file);
        const mediaFile: MediaFile = {
          id: fileId,
          filename: file.name,
          type: getFileType(file.name),
          size: file.size,
          duration: metadata.duration,
          thumbnailUrl: await generateThumbnail(file),
          fileUrl: URL.createObjectURL(file), // In real app, this would be the uploaded URL
          metadata
        };

        // Add to media files
        setMediaFiles(prev => [...prev, mediaFile]);
        
        // Update progress to complete
        setUploadProgress(prev => 
          prev.map(p => p.fileId === fileId 
            ? { ...p, status: 'complete', progress: 100 }
            : p
          )
        );

        // Remove from progress after delay
        setTimeout(() => {
          setUploadProgress(prev => prev.filter(p => p.fileId !== fileId));
        }, 2000);

      } catch (error) {
        setUploadProgress(prev => 
          prev.map(p => p.fileId === fileId 
            ? { ...p, status: 'error', error: 'Upload failed' }
            : p
          )
        );
      }
    }
  }, [validateFile]);

  const simulateUpload = (fileId: string, file: File): Promise<void> => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          resolve();
        }
        
        setUploadProgress(prev => 
          prev.map(p => p.fileId === fileId 
            ? { ...p, progress: Math.min(progress, 100) }
            : p
          )
        );
      }, 200);
    });
  };

  const generateThumbnail = async (file: File): Promise<string> => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    
    if (file.type.startsWith('video/')) {
      return new Promise((resolve) => {
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        video.onloadedmetadata = () => {
          canvas.width = 160;
          canvas.height = 90;
          video.currentTime = Math.min(1, video.duration / 2);
        };
        
        video.onseeked = () => {
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL());
          }
        };
        
        video.src = URL.createObjectURL(file);
      });
    }
    
    // Default thumbnail for audio files
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjkwIiB2aWV3Qm94PSIwIDAgMTYwIDkwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxNjAiIGhlaWdodD0iOTAiIGZpbGw9IiM0QjU1NjMiLz48cGF0aCBkPSJNNjAgMzVIMTAwVjU1SDYwVjM1WiIgZmlsbD0iIzlDQTNBRiIvPjwvc3ZnPg==';
  };

  const extractMetadata = async (file: File): Promise<MediaFile['metadata'] & { duration?: number }> => {
    if (file.type.startsWith('video/')) {
      return new Promise((resolve) => {
        const video = document.createElement('video');
        video.onloadedmetadata = () => {
          resolve({
            width: video.videoWidth,
            height: video.videoHeight,
            duration: video.duration,
            fps: 30 // Default, would need more complex detection in real app
          });
        };
        video.onerror = () => {
          resolve({
            fps: 30
          });
        };
        video.src = URL.createObjectURL(file);
      });
    }
    
    if (file.type.startsWith('audio/')) {
      return new Promise((resolve) => {
        const audio = document.createElement('audio');
        audio.onloadedmetadata = () => {
          resolve({
            duration: audio.duration
          });
        };
        audio.onerror = () => {
          resolve({});
        };
        audio.src = URL.createObjectURL(file);
      });
    }
    
    if (file.type.startsWith('image/')) {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          resolve({
            width: img.width,
            height: img.height
          });
        };
        img.onerror = () => {
          resolve({});
        };
        img.src = URL.createObjectURL(file);
      });
    }
    
    return {};
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  }, [processFiles]);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleMediaSelect = useCallback((media: MediaFile) => {
    onMediaSelect?.(media);
  }, [onMediaSelect]);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-100 mb-3">Media Library</h2>
        
        {/* Upload Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer group ${
            isDragOver
              ? 'border-blue-400 bg-blue-400/10'
              : 'border-gray-600 hover:border-blue-400 hover:bg-gray-800/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleUploadClick}
        >
          <div className="flex flex-col items-center space-y-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              isDragOver 
                ? 'bg-blue-500' 
                : 'bg-gray-700 group-hover:bg-gray-600'
            }`}>
              <svg 
                className={`w-6 h-6 transition-colors ${
                  isDragOver 
                    ? 'text-white' 
                    : 'text-gray-400 group-hover:text-blue-400'
                }`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
                />
              </svg>
            </div>
            <div>
              <p className={`text-sm font-medium transition-colors ${
                isDragOver 
                  ? 'text-blue-200' 
                  : 'text-gray-300 group-hover:text-gray-200'
              }`}>
                {isDragOver ? 'Drop files here' : 'Drop files here or click to upload'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Video, audio, and image files (max 500MB)
              </p>
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={[...SUPPORTED_FORMATS.video, ...SUPPORTED_FORMATS.audio, ...SUPPORTED_FORMATS.image].join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Error Display */}
        {error && (
          <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-xs text-red-300 hover:text-red-200 mt-1 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Upload Progress */}
        {uploadProgress.length > 0 && (
          <div className="mt-4 space-y-2">
            {uploadProgress.map((progress) => (
              <div key={progress.fileId} className="bg-gray-800 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300">
                    {progress.status === 'uploading' && 'Uploading...'}
                    {progress.status === 'processing' && 'Processing...'}
                    {progress.status === 'complete' && 'Complete!'}
                    {progress.status === 'error' && 'Error'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {progress.progress.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      progress.status === 'error' 
                        ? 'bg-red-500' 
                        : progress.status === 'complete'
                        ? 'bg-green-500'
                        : 'bg-blue-500'
                    }`}
                    style={{ width: `${progress.progress}%` }}
                  />
                </div>
                {progress.error && (
                  <p className="text-xs text-red-400 mt-1">{progress.error}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Media Grid */}
        {mediaFiles.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {mediaFiles.map((media) => (
              <MediaThumbnail
                key={media.id}
                media={media}
                onSelect={handleMediaSelect}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {mediaFiles.length === 0 && uploadProgress.length === 0 && !error && (
          <div className="mt-6 text-center py-4">
            <p className="text-sm text-gray-400">
              No media files yet. Upload some files to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}