import { MediaLibrary } from './MediaLibrary';
import { Inspector } from './Inspector';
import type { MediaFile } from './MediaLibrary';
import type { TimelineClip } from './Timeline';

interface LeftPanelProps {
  selectedClip?: TimelineClip | null;
  onPropertyChange?: (clipId: string, properties: any) => void;
  onGenerateCaptions?: (clipId: string) => void;
  isGeneratingCaptions?: boolean;
}

export function LeftPanel({ 
  selectedClip = null, 
  onPropertyChange,
  onGenerateCaptions,
  isGeneratingCaptions = false 
}: LeftPanelProps) {
  const handleMediaSelect = (media: MediaFile) => {
    console.log('Media selected:', media.filename);
    // TODO: Implement media selection logic
  };

  const handlePropertyChange = (clipId: string, properties: any) => {
    console.log('Property change:', clipId, properties);
    onPropertyChange?.(clipId, properties);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Media Library Section */}
      <div className="flex-1 p-4 border-b border-gray-700">
        <MediaLibrary onMediaSelect={handleMediaSelect} />
      </div>

      {/* Inspector Section */}
      <div className="flex-1 p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold text-gray-100 mb-3">Inspector</h2>
        
        <Inspector
          selectedClip={selectedClip}
          onPropertyChange={handlePropertyChange}
          onGenerateCaptions={onGenerateCaptions}
          isGeneratingCaptions={isGeneratingCaptions}
        />
      </div>
    </div>
  );
}