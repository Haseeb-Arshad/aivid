import { useState, useCallback } from 'react';
import { Timeline, TimelineTrack } from './Timeline';
import { PreviewPlayer } from './PreviewPlayer';

interface CenterPanelProps {
  tracks: TimelineTrack[];
  selectedClipId: string | null;
  onClipSelect: (clipId: string | null) => void;
  onClipMove: (clipId: string, newStartTime: number) => void;
  onClipTrim: (clipId: string, trimStart: number, trimEnd: number) => void;
}

export function CenterPanel({
  tracks,
  selectedClipId,
  onClipSelect,
  onClipMove,
  onClipTrim,
}: CenterPanelProps) {
  // Timeline state
  const [playheadPosition, setPlayheadPosition] = useState(15);
  const [zoom, setZoom] = useState(2);
  
  // Preview player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate duration from tracks
  const duration = Math.max(
    45, // Minimum duration
    ...tracks.flatMap(track => 
      track.clips.map(clip => clip.endTime)
    )
  );

  // Timeline event handlers
  const handlePlayheadChange = useCallback((position: number) => {
    setPlayheadPosition(position);
  }, []);

  const handleZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  // Preview player event handlers
  const handleTimeUpdate = useCallback((time: number) => {
    setPlayheadPosition(time);
  }, []);

  const handlePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const handleSeek = useCallback((time: number) => {
    setPlayheadPosition(time);
    setIsPlaying(false); // Pause when seeking
  }, []);

  // Get current video source from timeline clips
  const getCurrentVideoSrc = useCallback(() => {
    // Find the video clip at current playhead position
    const videoTrack = tracks.find(track => track.type === 'video');
    if (!videoTrack) return undefined;

    const currentClip = videoTrack.clips.find(clip => 
      playheadPosition >= clip.startTime && playheadPosition <= clip.endTime
    );

    // For now, return undefined since we don't have actual video files
    // In a real implementation, this would return the clip's video URL
    return currentClip ? undefined : undefined;
  }, [tracks, playheadPosition]);

  return (
    <div className="h-full flex flex-col">
      {/* Preview Player Section */}
      <div className="flex-1 p-6 flex items-center justify-center bg-black/20">
        <PreviewPlayer
          currentTime={playheadPosition}
          duration={duration}
          isPlaying={isPlaying}
          videoSrc={getCurrentVideoSrc()}
          onTimeUpdate={handleTimeUpdate}
          onPlayPause={handlePlayPause}
          onSeek={handleSeek}
          isLoading={isLoading}
          frameRate={30} // Standard frame rate
        />
      </div>

      {/* Timeline Section */}
      <Timeline
        tracks={tracks}
        playheadPosition={playheadPosition}
        duration={duration}
        zoom={zoom}
        onPlayheadChange={handlePlayheadChange}
        onZoomChange={handleZoomChange}
        onClipSelect={onClipSelect}
        onClipMove={onClipMove}
        onClipTrim={onClipTrim}
      />
    </div>
  );
}