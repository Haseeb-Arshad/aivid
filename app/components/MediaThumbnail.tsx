import { useState, useCallback } from 'react';
import type { MediaFile } from './MediaLibrary';

interface MediaThumbnailProps {
  media: MediaFile;
  onSelect: (media: MediaFile) => void;
}

export function MediaThumbnail({ media, onSelect }: MediaThumbnailProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleSelect = useCallback(() => {
    onSelect(media);
  }, [media, onSelect]);

  const handleAddToTimeline = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement add to timeline functionality
    console.log('Add to timeline:', media.filename);
  }, [media]);

  const handlePreview = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement preview functionality
    console.log('Preview:', media.filename);
  }, [media]);

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getResolutionText = (): string => {
    if (media.metadata.width && media.metadata.height) {
      if (media.metadata.height >= 1080) return '1080p';
      if (media.metadata.height >= 720) return '720p';
      if (media.metadata.height >= 480) return '480p';
      return `${media.metadata.width}×${media.metadata.height}`;
    }
    return '';
  };

  const getMediaIcon = () => {
    switch (media.type) {
      case 'video':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" 
            />
          </svg>
        );
      case 'audio':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" 
            />
          </svg>
        );
      case 'image':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className="aspect-video bg-gray-700 rounded-lg border border-gray-600 hover:border-blue-400 hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer group relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleSelect}
    >
      {/* Thumbnail Image/Background */}
      {media.thumbnailUrl && !imageError ? (
        <img
          src={media.thumbnailUrl}
          alt={media.filename}
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
          <div className="text-gray-400 group-hover:text-blue-400 transition-all duration-200 group-hover:scale-110">
            {getMediaIcon()}
          </div>
        </div>
      )}

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/30 group-hover:to-black/50 transition-all duration-200" />

      {/* Type indicator */}
      <div className="absolute top-2 left-2">
        <div className={`px-2 py-1 rounded text-xs font-medium ${
          media.type === 'video' ? 'bg-blue-500/80 text-white' :
          media.type === 'audio' ? 'bg-purple-500/80 text-white' :
          'bg-green-500/80 text-white'
        }`}>
          {media.type.toUpperCase()}
        </div>
      </div>

      {/* Duration indicator (for video/audio) */}
      {media.duration && (
        <div className="absolute top-2 right-2">
          <div className="px-2 py-1 bg-black/60 rounded text-xs text-white font-medium">
            {formatDuration(media.duration)}
          </div>
        </div>
      )}

      {/* Hover overlay with action buttons */}
      <div className={`absolute inset-0 bg-black/40 flex items-center justify-center space-x-3 transition-opacity duration-200 ${
        isHovered ? 'opacity-100' : 'opacity-0'
      }`}>
        {/* Preview button */}
        <button
          onClick={handlePreview}
          className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-400 transition-colors transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-black/40"
          title="Preview"
        >
          <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </button>

        {/* Add to timeline button */}
        <button
          onClick={handleAddToTimeline}
          className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-500 transition-colors transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-black/40"
          title="Add to Timeline"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>

      {/* File info overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 group-hover:from-black/90 transition-all">
        <p className="text-sm text-white font-medium truncate group-hover:text-blue-200 transition-colors">
          {media.filename}
        </p>
        <div className={`text-xs text-gray-300 mt-1 transition-opacity duration-200 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="flex items-center justify-between">
            <span>{formatFileSize(media.size)}</span>
            {getResolutionText() && <span>{getResolutionText()}</span>}
          </div>
        </div>
      </div>

      {/* Selection indicator */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-400/50 rounded-lg transition-colors pointer-events-none" />
    </div>
  );
}