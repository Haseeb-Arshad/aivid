import { useState, useRef, useEffect, useCallback } from 'react';
import { componentStyles } from '~/lib/design-system';

interface PreviewPlayerProps {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  videoSrc?: string;
  onTimeUpdate: (time: number) => void;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  isLoading?: boolean;
  frameRate?: number; // Allow configurable frame rate
}

export function PreviewPlayer({
  currentTime,
  duration,
  isPlaying,
  videoSrc,
  onTimeUpdate,
  onPlayPause,
  onSeek,
  isLoading = false,
  frameRate = 30,
}: PreviewPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [buffering, setBuffering] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number>(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(true); // Start muted for better UX

  // Sync video element with props - Real-time preview updates (Requirement 6.2)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideoLoaded) return;

    // Seek to current time if there's a significant difference
    if (Math.abs(video.currentTime - currentTime) > 0.1) {
      video.currentTime = currentTime;
    }

    // Handle play/pause state
    if (isPlaying && video.paused) {
      video.play().catch((error) => {
        console.error('Video play error:', error);
        setVideoError('Failed to play video');
      });
    } else if (!isPlaying && !video.paused) {
      video.pause();
    }
  }, [currentTime, isPlaying, isVideoLoaded]);

  // Sync volume with video element
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.volume = volume;
      video.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Handle video time updates
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || isDragging) return;
    
    onTimeUpdate(video.currentTime);
  }, [onTimeUpdate, isDragging]);

  // Handle video loaded - Display current frame at playhead position (Requirement 6.1)
  const handleLoadedData = useCallback(() => {
    setIsVideoLoaded(true);
    setVideoError(null);
    const video = videoRef.current;
    if (video) {
      video.currentTime = currentTime;
    }
  }, [currentTime]);

  // Handle video error
  const handleVideoError = useCallback(() => {
    setVideoError('Failed to load video');
    setIsVideoLoaded(false);
  }, []);

  // Handle video waiting (buffering)
  const handleWaiting = useCallback(() => {
    setBuffering(true);
  }, []);

  // Handle video can play (buffering complete)
  const handleCanPlay = useCallback(() => {
    setBuffering(false);
  }, []);

  // Handle scrubbing
  const handleProgressClick = useCallback((e: React.MouseEvent) => {
    const progressBar = progressBarRef.current;
    if (!progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = Math.max(0, Math.min(duration, percentage * duration));
    
    onSeek(newTime);
  }, [duration, onSeek]);

  // Handle progress bar hover for time preview
  const handleProgressHover = useCallback((e: React.MouseEvent) => {
    const progressBar = progressBarRef.current;
    if (!progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const hoverX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, hoverX / rect.width));
    const time = percentage * duration;
    
    setHoverTime(time);
    setHoverPosition(hoverX);
  }, [duration]);

  const handleProgressLeave = useCallback(() => {
    setHoverTime(null);
  }, []);

  // Volume control
  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    const video = videoRef.current;
    if (video) {
      video.volume = newVolume;
      video.muted = newVolume === 0;
    }
  }, []);

  const handleMuteToggle = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    video.muted = newMuted;
    
    if (!newMuted && volume === 0) {
      setVolume(0.5);
      video.volume = 0.5;
    }
  }, [isMuted, volume]);

  // Fullscreen functionality
  const handleFullscreen = useCallback(() => {
    const container = videoRef.current?.parentElement;
    if (!container) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen().catch(console.error);
    }
  }, []);

  // Handle scrubbing drag - Enhanced precision for frame-by-frame navigation
  const handleProgressMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    handleProgressClick(e);

    const handleMouseMove = (e: MouseEvent) => {
      const progressBar = progressBarRef.current;
      if (!progressBar) return;

      const rect = progressBar.getBoundingClientRect();
      const clickX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      const percentage = clickX / rect.width;
      const newTime = percentage * duration;
      
      // Snap to frame boundaries for precise editing
      const frameTime = 1 / frameRate;
      const snappedTime = Math.round(newTime / frameTime) * frameTime;
      
      onSeek(Math.max(0, Math.min(duration, snappedTime)));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [duration, onSeek, handleProgressClick, frameRate]);

  // Frame-by-frame navigation (Requirement 6.4)
  const handleFrameStep = useCallback((direction: 'forward' | 'backward') => {
    const frameTime = 1 / frameRate;
    const newTime = direction === 'forward' 
      ? Math.min(duration, currentTime + frameTime)
      : Math.max(0, currentTime - frameTime);
    
    onSeek(newTime);
  }, [currentTime, duration, onSeek, frameRate]);

  // Enhanced keyboard shortcuts for professional editing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when not typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          onPlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (e.shiftKey) {
            // Shift + Left: Jump 10 frames backward
            const jumpTime = (10 / frameRate);
            onSeek(Math.max(0, currentTime - jumpTime));
          } else {
            // Left: Single frame backward
            handleFrameStep('backward');
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (e.shiftKey) {
            // Shift + Right: Jump 10 frames forward
            const jumpTime = (10 / frameRate);
            onSeek(Math.min(duration, currentTime + jumpTime));
          } else {
            // Right: Single frame forward
            handleFrameStep('forward');
          }
          break;
        case 'Home':
          e.preventDefault();
          onSeek(0);
          break;
        case 'End':
          e.preventDefault();
          onSeek(duration);
          break;
        case 'j':
        case 'J':
          e.preventDefault();
          // J: Jump backward 1 second
          onSeek(Math.max(0, currentTime - 1));
          break;
        case 'l':
        case 'L':
          e.preventDefault();
          // L: Jump forward 1 second
          onSeek(Math.min(duration, currentTime + 1));
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onPlayPause, handleFrameStep, currentTime, duration, onSeek, frameRate]);

  // Format time display
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className="w-full max-w-4xl aspect-video bg-black rounded-lg border border-gray-700 relative overflow-hidden group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Loading Indicators (Requirement 6.5) */}
      {(isLoading || buffering) && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
            <span className="text-white font-medium">
              {isLoading ? 'Processing video...' : 'Buffering...'}
            </span>
          </div>
        </div>
      )}

      {/* Error State */}
      {videoError && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-red-400 font-medium mb-2">Video Error</p>
            <p className="text-sm text-gray-400">{videoError}</p>
          </div>
        </div>
      )}

      {/* Video Element - Smooth, high-quality playback (Requirement 6.3) */}
      {videoSrc ? (
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          onTimeUpdate={handleTimeUpdate}
          onLoadedData={handleLoadedData}
          onError={handleVideoError}
          onWaiting={handleWaiting}
          onCanPlay={handleCanPlay}
          preload="metadata"
          playsInline
          muted={isMuted}
        >
          <source src={videoSrc} type="video/mp4" />
          <source src={videoSrc} type="video/webm" />
          <source src={videoSrc} type="video/ogg" />
          Your browser does not support the video tag.
        </video>
      ) : (
        /* Placeholder when no video */
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-600 transition-colors">
              <svg 
                className="w-10 h-10 text-gray-400 group-hover:text-gray-300 transition-colors" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" 
                />
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-300 mb-2">Preview Player</p>
            <p className="text-sm text-gray-500">
              Add clips to timeline to see preview
            </p>
          </div>
        </div>
      )}

      {/* Play Button Overlay */}
      {!isPlaying && videoSrc && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button 
            onClick={onPlayPause}
            className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <svg 
              className="w-8 h-8 text-white ml-1" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
        </div>
      )}

      {/* Video Controls */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
        showControls || isDragging ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="flex items-center space-x-4">
          {/* Play/Pause Button */}
          <button 
            onClick={onPlayPause}
            className="text-white hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
            disabled={!videoSrc}
          >
            {isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>

          {/* Frame Step Backward */}
          <button
            onClick={() => handleFrameStep('backward')}
            className="text-white hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
            disabled={!videoSrc}
            title="Previous frame (←)"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/>
            </svg>
          </button>

          {/* Enhanced Progress Bar with Hover Preview */}
          <div 
            className="flex-1 h-2 bg-gray-600 rounded-full cursor-pointer relative group"
            ref={progressBarRef}
            onMouseDown={handleProgressMouseDown}
            onClick={handleProgressClick}
            onMouseMove={handleProgressHover}
            onMouseLeave={handleProgressLeave}
          >
            {/* Progress Fill */}
            <div 
              className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all duration-200 relative"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            >
              {/* Scrub Handle */}
              <div className={`absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg transition-all duration-200 ${
                isDragging ? 'opacity-100 scale-125' : 'opacity-0 group-hover:opacity-100'
              }`}></div>
            </div>
            
            {/* Buffered Progress (if applicable) */}
            {videoRef.current?.buffered && videoRef.current.buffered.length > 0 && (
              <div 
                className="absolute top-0 left-0 h-full bg-gray-500 rounded-full opacity-50"
                style={{ 
                  width: `${duration > 0 ? (videoRef.current.buffered.end(videoRef.current.buffered.length - 1) / duration) * 100 : 0}%` 
                }}
              />
            )}
            
            {/* Time Tooltip on Hover */}
            {hoverTime !== null && (
              <div 
                className="absolute bottom-full mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded whitespace-nowrap transform -translate-x-1/2 pointer-events-none"
                style={{ left: `${hoverPosition}px` }}
              >
                {formatTime(hoverTime)}
              </div>
            )}
          </div>

          {/* Frame Step Forward */}
          <button
            onClick={() => handleFrameStep('forward')}
            className="text-white hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
            disabled={!videoSrc}
            title="Next frame (→)"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/>
            </svg>
          </button>

          {/* Volume Control */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleMuteToggle}
              className="text-white hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted || volume === 0 ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
              )}
            </button>
            
            <div className="w-16 h-1 bg-gray-600 rounded-full cursor-pointer group">
              <div 
                className="h-full bg-white rounded-full transition-all duration-200"
                style={{ width: `${isMuted ? 0 : volume * 100}%` }}
                onClick={(e) => {
                  const rect = e.currentTarget.parentElement!.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const newVolume = Math.max(0, Math.min(1, clickX / rect.width));
                  handleVolumeChange(newVolume);
                }}
              />
            </div>
          </div>

          {/* Time Display */}
          <span className="text-sm text-white font-mono min-w-[80px] text-right">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          {/* Fullscreen Button */}
          <button
            onClick={handleFullscreen}
            className="text-white hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
            title="Fullscreen"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}