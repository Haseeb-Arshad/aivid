import { useState, useRef, useCallback, useEffect } from 'react';
import type { TimelineClip } from './Timeline';

interface TimelineClipProps {
  clip: TimelineClip;
  pixelsPerSecond: number;
  onSelect: (clipId: string | null) => void;
  onMove: (clipId: string, newStartTime: number) => void;
  onTrim: (clipId: string, trimStart: number, trimEnd: number) => void;
}

type DragMode = 'none' | 'move' | 'trim-start' | 'trim-end';

export function TimelineClip({
  clip,
  pixelsPerSecond,
  onSelect,
  onMove,
  onTrim,
}: TimelineClipProps) {
  const clipRef = useRef<HTMLDivElement>(null);
  const [dragMode, setDragMode] = useState<DragMode>('none');
  const [dragStart, setDragStart] = useState({ x: 0, startTime: 0, trimStart: 0, trimEnd: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Calculate clip dimensions
  const clipDuration = clip.endTime - clip.startTime;
  const clipWidth = clipDuration * pixelsPerSecond;
  const clipLeft = clip.startTime * pixelsPerSecond;

  // Handle clip selection
  const handleClipClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(clip.id);
  }, [clip.id, onSelect]);

  // Handle drag start
  const handleMouseDown = useCallback((e: React.MouseEvent, mode: DragMode) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDragMode(mode);
    setDragStart({
      x: e.clientX,
      startTime: clip.startTime,
      trimStart: clip.trimStart,
      trimEnd: clip.trimEnd,
    });

    // Select clip when starting to drag
    onSelect(clip.id);
  }, [clip.startTime, clip.trimStart, clip.trimEnd, clip.id, onSelect]);

  // Handle mouse move during drag
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (dragMode === 'none') return;

    const deltaX = e.clientX - dragStart.x;
    const deltaTime = deltaX / pixelsPerSecond;

    switch (dragMode) {
      case 'move': {
        const newStartTime = Math.max(0, dragStart.startTime + deltaTime);
        onMove(clip.id, newStartTime);
        break;
      }
      case 'trim-start': {
        const newTrimStart = Math.max(0, Math.min(
          dragStart.trimStart + deltaTime,
          clipDuration - 0.1 // Minimum clip duration
        ));
        onTrim(clip.id, newTrimStart, clip.trimEnd);
        break;
      }
      case 'trim-end': {
        const newTrimEnd = Math.max(0, Math.min(
          dragStart.trimEnd - deltaTime,
          clipDuration - 0.1 // Minimum clip duration
        ));
        onTrim(clip.id, clip.trimStart, newTrimEnd);
        break;
      }
    }
  }, [dragMode, dragStart, pixelsPerSecond, clipDuration, clip.id, clip.trimStart, clip.trimEnd, onMove, onTrim]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setDragMode('none');
  }, []);

  // Mouse event listeners
  useEffect(() => {
    if (dragMode !== 'none') {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragMode, handleMouseMove, handleMouseUp]);

  // Get cursor style based on hover area
  const getCursorStyle = (area: 'start' | 'middle' | 'end') => {
    switch (area) {
      case 'start':
      case 'end':
        return 'cursor-ew-resize';
      case 'middle':
        return 'cursor-move';
      default:
        return 'cursor-pointer';
    }
  };

  return (
    <div
      ref={clipRef}
      className={`absolute top-2 h-12 rounded border-2 transition-all duration-200 group ${
        clip.selected 
          ? 'border-blue-400 shadow-lg shadow-blue-400/25 scale-105' 
          : 'border-transparent hover:border-gray-400'
      } ${isHovered ? 'shadow-md' : ''}`}
      style={{
        left: clipLeft,
        width: clipWidth,
        backgroundColor: clip.color,
        minWidth: '20px', // Minimum clip width
      }}
      onClick={handleClipClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Clip content */}
      <div 
        className="h-full flex items-center justify-center px-2 cursor-move"
        onMouseDown={(e) => handleMouseDown(e, 'move')}
      >
        <span className="text-xs text-white font-medium truncate select-none">
          {clip.name}
        </span>
      </div>

      {/* Trim handles */}
      {(clip.selected || isHovered) && (
        <>
          {/* Left trim handle */}
          <div
            className="absolute left-0 top-0 w-2 h-full bg-blue-400 opacity-0 group-hover:opacity-100 cursor-ew-resize transition-opacity flex items-center justify-center"
            onMouseDown={(e) => handleMouseDown(e, 'trim-start')}
            title="Trim start"
          >
            <div className="w-0.5 h-6 bg-white rounded-full"></div>
          </div>

          {/* Right trim handle */}
          <div
            className="absolute right-0 top-0 w-2 h-full bg-blue-400 opacity-0 group-hover:opacity-100 cursor-ew-resize transition-opacity flex items-center justify-center"
            onMouseDown={(e) => handleMouseDown(e, 'trim-end')}
            title="Trim end"
          >
            <div className="w-0.5 h-6 bg-white rounded-full"></div>
          </div>
        </>
      )}

      {/* Selection indicator */}
      {clip.selected && (
        <div className="absolute -top-1 -left-1 -right-1 -bottom-1 border-2 border-blue-400 rounded pointer-events-none">
          {/* Corner indicators */}
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-400 rounded-full"></div>
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full"></div>
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-400 rounded-full"></div>
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-400 rounded-full"></div>
        </div>
      )}

      {/* Waveform visualization for audio clips */}
      {clip.name.toLowerCase().includes('audio') && (
        <div className="absolute inset-1 flex items-center justify-center opacity-30">
          <div className="flex items-end space-x-px h-6">
            {Array.from({ length: Math.floor(clipWidth / 4) }).map((_, i) => (
              <div
                key={i}
                className="w-px bg-white"
                style={{ height: `${Math.random() * 100}%` }}
              ></div>
            ))}
          </div>
        </div>
      )}

      {/* Clip duration indicator */}
      {clip.selected && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-xs text-gray-300 px-2 py-1 rounded border border-gray-600 font-mono whitespace-nowrap">
          {clipDuration.toFixed(1)}s
        </div>
      )}
    </div>
  );
}