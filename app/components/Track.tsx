import { useCallback } from 'react';
import { TimelineClip as TimelineClipComponent } from './TimelineClip';
import { TimelineTrack, TimelineClip } from './Timeline';

interface TrackProps {
  track: TimelineTrack;
  pixelsPerSecond: number;
  onClipSelect: (clipId: string | null) => void;
  onClipMove: (clipId: string, newStartTime: number) => void;
  onClipTrim: (clipId: string, trimStart: number, trimEnd: number) => void;
}

export function Track({
  track,
  pixelsPerSecond,
  onClipSelect,
  onClipMove,
  onClipTrim,
}: TrackProps) {
  // Handle clip drop from media library (future implementation)
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    // TODO: Implement clip drop functionality
    console.log('Clip dropped on track:', track.id);
  }, [track.id]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Handle track click (deselect clips)
  const handleTrackClick = useCallback((e: React.MouseEvent) => {
    // Only deselect if clicking on empty track area
    if (e.target === e.currentTarget) {
      onClipSelect(null);
    }
  }, [onClipSelect]);

  // Magnetic snapping helper
  const getSnapPosition = useCallback((position: number, clipId: string): number => {
    const snapTolerance = 10 / pixelsPerSecond; // 10 pixels tolerance
    const otherClips = track.clips.filter(clip => clip.id !== clipId);
    
    // Check snapping to other clips
    for (const clip of otherClips) {
      // Snap to start of other clips
      if (Math.abs(position - clip.startTime) < snapTolerance) {
        return clip.startTime;
      }
      // Snap to end of other clips
      if (Math.abs(position - clip.endTime) < snapTolerance) {
        return clip.endTime;
      }
    }
    
    // Snap to timeline start
    if (Math.abs(position) < snapTolerance) {
      return 0;
    }
    
    return position;
  }, [track.clips, pixelsPerSecond]);

  // Handle clip move with magnetic snapping
  const handleClipMove = useCallback((clipId: string, newStartTime: number) => {
    const snappedPosition = getSnapPosition(newStartTime, clipId);
    onClipMove(clipId, snappedPosition);
  }, [getSnapPosition, onClipMove]);

  return (
    <div 
      className={`h-16 border-b border-gray-700 last:border-b-0 relative transition-colors ${
        track.visible ? 'hover:bg-gray-800/50' : 'opacity-50'
      } ${track.locked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={handleTrackClick}
    >
      {/* Track background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="h-full bg-gradient-to-r from-transparent via-gray-600 to-transparent bg-repeat-x" 
             style={{ backgroundSize: `${pixelsPerSecond}px 100%` }}>
        </div>
      </div>

      {/* Track clips */}
      {track.visible && !track.locked && track.clips.map((clip) => (
        <TimelineClipComponent
          key={clip.id}
          clip={clip}
          pixelsPerSecond={pixelsPerSecond}
          onSelect={onClipSelect}
          onMove={handleClipMove}
          onTrim={onClipTrim}
        />
      ))}

      {/* Drop zone indicator */}
      <div className="absolute inset-0 border-2 border-dashed border-transparent hover:border-blue-400/50 transition-colors pointer-events-none">
      </div>
    </div>
  );
}