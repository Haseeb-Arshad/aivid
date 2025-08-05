import { useState, useRef, useCallback, useEffect } from 'react';
import { Track } from './Track';
import { componentStyles } from '../lib/design-system';

export interface TimelineClip {
  id: string;
  mediaId: string;
  startTime: number;
  endTime: number;
  trimStart: number;
  trimEnd: number;
  trackId: string;
  selected: boolean;
  color: string;
  name: string;
  properties?: {
    transform?: {
      x: number;
      y: number;
      scale: number;
      rotation: number;
    };
    filters?: {
      brightness: number;
      contrast: number;
      saturation: number;
    };
    audio?: {
      volume: number;
      muted: boolean;
    };
  };
}

export interface TimelineTrack {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'captions';
  clips: TimelineClip[];
  locked: boolean;
  visible: boolean;
}

interface TimelineProps {
  tracks: TimelineTrack[];
  playheadPosition: number;
  duration: number;
  zoom: number;
  onPlayheadChange: (position: number) => void;
  onZoomChange: (zoom: number) => void;
  onClipSelect: (clipId: string | null) => void;
  onClipMove: (clipId: string, newStartTime: number) => void;
  onClipTrim: (clipId: string, trimStart: number, trimEnd: number) => void;
}

export function Timeline({
  tracks,
  playheadPosition,
  duration,
  zoom,
  onPlayheadChange,
  onZoomChange,
  onClipSelect,
  onClipMove,
  onClipTrim,
}: TimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  // Calculate timeline width based on zoom and duration
  const timelineWidth = Math.max(800, duration * zoom * 10);
  const pixelsPerSecond = zoom * 10;

  // Generate time markers
  const generateTimeMarkers = () => {
    const markers = [];
    const interval = zoom < 2 ? 10 : zoom < 5 ? 5 : zoom < 10 ? 2 : 1;
    
    for (let time = 0; time <= duration; time += interval) {
      markers.push(time);
    }
    return markers;
  };

  // Handle playhead dragging
  const handlePlayheadMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingPlayhead(true);
    
    const rect = timelineRef.current?.getBoundingClientRect();
    if (rect) {
      const clickX = e.clientX - rect.left - 96; // Account for track labels width
      setDragOffset(clickX - (playheadPosition * pixelsPerSecond));
    }
  }, [playheadPosition, pixelsPerSecond]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingPlayhead || !timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - 96; // Account for track labels width
    const newPosition = Math.max(0, Math.min(duration, (mouseX - dragOffset) / pixelsPerSecond));
    
    onPlayheadChange(newPosition);
  }, [isDraggingPlayhead, duration, pixelsPerSecond, dragOffset, onPlayheadChange]);

  const handleMouseUp = useCallback(() => {
    setIsDraggingPlayhead(false);
    setDragOffset(0);
  }, []);

  // Handle timeline click (move playhead)
  const handleTimelineClick = useCallback((e: React.MouseEvent) => {
    if (isDraggingPlayhead) return;
    
    const rect = timelineRef.current?.getBoundingClientRect();
    if (rect) {
      const clickX = e.clientX - rect.left - 96; // Account for track labels width
      const newPosition = Math.max(0, Math.min(duration, clickX / pixelsPerSecond));
      onPlayheadChange(newPosition);
    }
  }, [isDraggingPlayhead, duration, pixelsPerSecond, onPlayheadChange]);

  // Handle zoom slider
  const handleZoomChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newZoom = parseFloat(e.target.value);
    onZoomChange(newZoom);
  }, [onZoomChange]);

  // Fit timeline to view
  const handleFitToView = useCallback(() => {
    if (timelineRef.current) {
      const availableWidth = timelineRef.current.clientWidth - 96; // Account for track labels
      const optimalZoom = Math.max(0.1, availableWidth / (duration * 10));
      onZoomChange(optimalZoom);
    }
  }, [duration, onZoomChange]);

  // Mouse event listeners
  useEffect(() => {
    if (isDraggingPlayhead) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDraggingPlayhead, handleMouseMove, handleMouseUp]);

  const timeMarkers = generateTimeMarkers();

  return (
    <div className="h-80 bg-gray-800 border-t border-gray-700 p-4">
      <div className="h-full flex flex-col">
        {/* Timeline Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-100">Timeline</h3>
          
          {/* Timeline Controls */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Zoom:</span>
              <input
                type="range"
                min="0.1"
                max="10"
                step="0.1"
                value={zoom}
                onChange={handleZoomChange}
                className="w-20 h-2 bg-gray-700 rounded-full appearance-none cursor-pointer slider-thumb:w-3 slider-thumb:h-3 slider-thumb:bg-gray-400 slider-thumb:rounded-full slider-thumb:cursor-pointer hover:bg-gray-600 transition-colors"
              />
              <span className="text-xs text-gray-500 font-mono min-w-[3rem]">
                {zoom.toFixed(1)}x
              </span>
            </div>
            
            <button 
              onClick={handleFitToView}
              className={componentStyles.button.ghost}
            >
              Fit
            </button>
          </div>
        </div>

        {/* Timeline Container */}
        <div 
          ref={timelineRef}
          className="flex-1 bg-gray-900 rounded-lg border border-gray-700 overflow-hidden relative"
        >
          <div className="h-full flex">
            {/* Track Labels */}
            <div className="w-24 bg-gray-800 border-r border-gray-700 flex flex-col flex-shrink-0">
              {tracks.map((track) => (
                <div 
                  key={track.id}
                  className="h-16 flex items-center justify-center border-b border-gray-700 last:border-b-0 text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors cursor-pointer relative"
                >
                  <span className="truncate px-2">{track.name}</span>
                  
                  {/* Track controls */}
                  <div className="absolute right-1 flex flex-col space-y-1">
                    <button 
                      className={`w-3 h-3 rounded-sm text-xs flex items-center justify-center transition-colors ${
                        track.visible ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-400'
                      }`}
                      title={track.visible ? 'Hide track' : 'Show track'}
                    >
                      👁
                    </button>
                    <button 
                      className={`w-3 h-3 rounded-sm text-xs flex items-center justify-center transition-colors ${
                        track.locked ? 'bg-red-500 text-white' : 'bg-gray-600 text-gray-400'
                      }`}
                      title={track.locked ? 'Unlock track' : 'Lock track'}
                    >
                      🔒
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Timeline Content */}
            <div className="flex-1 relative overflow-x-auto">
              <div style={{ width: timelineWidth }}>
                {/* Time Ruler */}
                <div className="h-8 bg-gray-800 border-b border-gray-700 flex items-center relative">
                  {timeMarkers.map((time) => (
                    <div 
                      key={time}
                      className="absolute flex flex-col items-center"
                      style={{ left: time * pixelsPerSecond }}
                    >
                      <div className="w-px h-2 bg-gray-600"></div>
                      <span className="text-xs text-gray-400 font-mono mt-1">
                        {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Playhead */}
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-blue-400 z-20 cursor-ew-resize"
                  style={{ left: playheadPosition * pixelsPerSecond }}
                  onMouseDown={handlePlayheadMouseDown}
                >
                  <div className="absolute -top-1 -left-2 w-4 h-4 bg-blue-400 rounded-full cursor-ew-resize hover:bg-blue-300 transition-colors"></div>
                </div>

                {/* Track Areas */}
                <div 
                  className="pt-0 h-full cursor-pointer"
                  onClick={handleTimelineClick}
                >
                  {tracks.map((track, index) => (
                    <Track
                      key={track.id}
                      track={track}
                      pixelsPerSecond={pixelsPerSecond}
                      onClipSelect={onClipSelect}
                      onClipMove={onClipMove}
                      onClipTrim={onClipTrim}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}