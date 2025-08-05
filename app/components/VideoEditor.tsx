import { useState, useCallback } from 'react';
import { Header } from './Header';
import { MainLayout } from './MainLayout';
import { LeftPanel } from './LeftPanel';
import { CenterPanel } from './CenterPanel';
import type { TimelineClip, TimelineTrack } from './Timeline';

export function VideoEditor() {
  const [projectTitle, setProjectTitle] = useState('My Video Project');
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [isGeneratingCaptions, setIsGeneratingCaptions] = useState(false);
  
  // Mock timeline data for demonstration
  const [tracks, setTracks] = useState<TimelineTrack[]>([
    {
      id: 'video-1',
      name: 'Video',
      type: 'video',
      locked: false,
      visible: true,
      clips: [
        {
          id: 'clip-1',
          mediaId: 'media-1',
          startTime: 0,
          endTime: 10,
          trimStart: 0,
          trimEnd: 0,
          trackId: 'video-1',
          selected: false,
          color: '#3b82f6',
          name: 'Sample Video.mp4',
          properties: {
            transform: { x: 0, y: 0, scale: 1, rotation: 0 },
            filters: { brightness: 100, contrast: 100, saturation: 100 },
            audio: { volume: 100, muted: false },
          },
        },
      ],
    },
    {
      id: 'audio-1',
      name: 'Audio',
      type: 'audio',
      locked: false,
      visible: true,
      clips: [
        {
          id: 'clip-2',
          mediaId: 'media-2',
          startTime: 2,
          endTime: 8,
          trimStart: 0,
          trimEnd: 0,
          trackId: 'audio-1',
          selected: false,
          color: '#10b981',
          name: 'Background Music.mp3',
          properties: {
            transform: { x: 0, y: 0, scale: 1, rotation: 0 },
            filters: { brightness: 100, contrast: 100, saturation: 100 },
            audio: { volume: 80, muted: false },
          },
        },
      ],
    },
  ]);

  // Find the currently selected clip
  const selectedClip = tracks
    .flatMap(track => track.clips)
    .find(clip => clip.id === selectedClipId) || null;

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export clicked');
  };

  const handleHelp = () => {
    // TODO: Implement help functionality
    console.log('Help clicked');
  };

  // Handle clip selection
  const handleClipSelect = useCallback((clipId: string | null) => {
    setSelectedClipId(clipId);
    
    // Update clip selection state in tracks
    setTracks(prevTracks => 
      prevTracks.map(track => ({
        ...track,
        clips: track.clips.map(clip => ({
          ...clip,
          selected: clip.id === clipId,
        })),
      }))
    );
  }, []);

  // Handle property changes
  const handlePropertyChange = useCallback((clipId: string, properties: any) => {
    setTracks(prevTracks =>
      prevTracks.map(track => ({
        ...track,
        clips: track.clips.map(clip =>
          clip.id === clipId
            ? { ...clip, properties: { ...clip.properties, ...properties } }
            : clip
        ),
      }))
    );
  }, []);

  // Handle caption generation
  const handleGenerateCaptions = useCallback(async (clipId: string) => {
    setIsGeneratingCaptions(true);
    
    try {
      // Simulate AI caption generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add caption track if it doesn't exist
      const captionTrackExists = tracks.some(track => track.type === 'captions');
      if (!captionTrackExists) {
        const newCaptionTrack: TimelineTrack = {
          id: 'captions-1',
          name: 'Captions',
          type: 'captions',
          locked: false,
          visible: true,
          clips: [],
        };
        
        setTracks(prevTracks => [...prevTracks, newCaptionTrack]);
      }
      
      // Add caption clips (mock data)
      const captionClips = [
        {
          id: `caption-${Date.now()}-1`,
          mediaId: `caption-media-1`,
          startTime: 0,
          endTime: 3,
          trimStart: 0,
          trimEnd: 0,
          trackId: 'captions-1',
          selected: false,
          color: '#f59e0b',
          name: 'Hello, welcome to our video',
          properties: {
            transform: { x: 0, y: 0, scale: 1, rotation: 0 },
            filters: { brightness: 100, contrast: 100, saturation: 100 },
            audio: { volume: 100, muted: false },
          },
        },
        {
          id: `caption-${Date.now()}-2`,
          mediaId: `caption-media-2`,
          startTime: 3,
          endTime: 6,
          trimStart: 0,
          trimEnd: 0,
          trackId: 'captions-1',
          selected: false,
          color: '#f59e0b',
          name: 'This is an AI-generated caption',
          properties: {
            transform: { x: 0, y: 0, scale: 1, rotation: 0 },
            filters: { brightness: 100, contrast: 100, saturation: 100 },
            audio: { volume: 100, muted: false },
          },
        },
      ];
      
      setTracks(prevTracks =>
        prevTracks.map(track =>
          track.id === 'captions-1'
            ? { ...track, clips: [...track.clips, ...captionClips] }
            : track
        )
      );
      
      console.log('Captions generated successfully');
    } catch (error) {
      console.error('Failed to generate captions:', error);
    } finally {
      setIsGeneratingCaptions(false);
    }
  }, [tracks]);

  // Handle clip movement
  const handleClipMove = useCallback((clipId: string, newStartTime: number) => {
    setTracks(prevTracks =>
      prevTracks.map(track => ({
        ...track,
        clips: track.clips.map(clip => {
          if (clip.id === clipId) {
            const duration = clip.endTime - clip.startTime;
            return {
              ...clip,
              startTime: newStartTime,
              endTime: newStartTime + duration,
            };
          }
          return clip;
        }),
      }))
    );
  }, []);

  // Handle clip trimming
  const handleClipTrim = useCallback((clipId: string, trimStart: number, trimEnd: number) => {
    setTracks(prevTracks =>
      prevTracks.map(track => ({
        ...track,
        clips: track.clips.map(clip =>
          clip.id === clipId
            ? { ...clip, trimStart, trimEnd }
            : clip
        ),
      }))
    );
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-gray-50">
      <Header 
        projectTitle={projectTitle}
        onExport={handleExport}
        onHelp={handleHelp}
      />
      
      <MainLayout
        leftPanel={
          <LeftPanel 
            selectedClip={selectedClip}
            onPropertyChange={handlePropertyChange}
            onGenerateCaptions={handleGenerateCaptions}
            isGeneratingCaptions={isGeneratingCaptions}
          />
        }
        centerPanel={
          <CenterPanel 
            tracks={tracks}
            selectedClipId={selectedClipId}
            onClipSelect={handleClipSelect}
            onClipMove={handleClipMove}
            onClipTrim={handleClipTrim}
          />
        }
      />
    </div>
  );
}