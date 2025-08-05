import { useState, useCallback, useEffect } from 'react';
import { Button } from './ui/Button';
import { Slider } from './ui/Slider';
import { componentStyles } from '~/lib/design-system';
import type { TimelineClip } from './Timeline';

// Property interfaces based on design document
interface TransformProperties {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

interface FilterProperties {
  brightness: number;
  contrast: number;
  saturation: number;
}

interface AudioProperties {
  volume: number;
  muted: boolean;
}

interface ClipProperties {
  transform: TransformProperties;
  filters: FilterProperties;
  audio: AudioProperties;
}

interface InspectorProps {
  selectedClip: TimelineClip | null;
  onPropertyChange: (clipId: string, properties: Partial<ClipProperties>) => void;
  onGenerateCaptions?: (clipId: string) => void;
  isGeneratingCaptions?: boolean;
}

// Collapsible section component
interface CollapsibleSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function CollapsibleSection({ title, isOpen, onToggle, children }: CollapsibleSectionProps) {
  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 transition-colors flex items-center justify-between text-left"
      >
        <span className="text-sm font-medium text-gray-100">{title}</span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-4 bg-gray-900 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}

// Color picker component
interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
}

function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-gray-200">{label}</label>
      <div className="flex items-center space-x-3">
        <div
          className="w-8 h-8 rounded border border-gray-600 cursor-pointer"
          style={{ backgroundColor: value }}
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'color';
            input.value = value;
            input.onchange = (e) => onChange((e.target as HTMLInputElement).value);
            input.click();
          }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={componentStyles.input.field + ' flex-1 font-mono text-xs'}
          placeholder="#000000"
        />
      </div>
    </div>
  );
}

export function Inspector({ 
  selectedClip, 
  onPropertyChange, 
  onGenerateCaptions,
  isGeneratingCaptions = false 
}: InspectorProps) {
  // Section collapse states
  const [openSections, setOpenSections] = useState({
    transform: true,
    filters: true,
    audio: true,
  });

  // Default properties for new clips
  const defaultProperties: ClipProperties = {
    transform: { x: 0, y: 0, scale: 1, rotation: 0 },
    filters: { brightness: 100, contrast: 100, saturation: 100 },
    audio: { volume: 100, muted: false },
  };

  // Current properties (merge with defaults)
  const currentProperties: ClipProperties = selectedClip?.properties 
    ? { ...defaultProperties, ...selectedClip.properties }
    : defaultProperties;

  // Toggle section collapse
  const toggleSection = useCallback((section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  // Property change handlers with validation
  const handleTransformChange = useCallback((property: keyof TransformProperties, value: number) => {
    if (!selectedClip) return;

    // Validation
    let validatedValue = value;
    switch (property) {
      case 'scale':
        validatedValue = Math.max(0.1, Math.min(5, value)); // Scale between 0.1x and 5x
        break;
      case 'rotation':
        validatedValue = ((value % 360) + 360) % 360; // Keep rotation between 0-360
        break;
      case 'x':
      case 'y':
        validatedValue = Math.max(-1000, Math.min(1000, value)); // Position limits
        break;
    }

    const newTransform = { ...currentProperties.transform, [property]: validatedValue };
    onPropertyChange(selectedClip.id, { transform: newTransform });
  }, [selectedClip, currentProperties.transform, onPropertyChange]);

  const handleFilterChange = useCallback((property: keyof FilterProperties, value: number) => {
    if (!selectedClip) return;

    // Validation - filters typically range from 0-200%
    const validatedValue = Math.max(0, Math.min(200, value));
    
    const newFilters = { ...currentProperties.filters, [property]: validatedValue };
    onPropertyChange(selectedClip.id, { filters: newFilters });
  }, [selectedClip, currentProperties.filters, onPropertyChange]);

  const handleAudioChange = useCallback((property: keyof AudioProperties, value: number | boolean) => {
    if (!selectedClip) return;

    let validatedValue = value;
    if (property === 'volume' && typeof value === 'number') {
      validatedValue = Math.max(0, Math.min(200, value)); // Volume 0-200%
    }

    const newAudio = { ...currentProperties.audio, [property]: validatedValue };
    onPropertyChange(selectedClip.id, { audio: newAudio });
  }, [selectedClip, currentProperties.audio, onPropertyChange]);

  // Handle caption generation
  const handleGenerateCaptions = useCallback(() => {
    if (!selectedClip || !onGenerateCaptions) return;
    onGenerateCaptions(selectedClip.id);
  }, [selectedClip, onGenerateCaptions]);

  // Reset properties to defaults
  const handleResetProperties = useCallback(() => {
    if (!selectedClip) return;
    onPropertyChange(selectedClip.id, defaultProperties);
  }, [selectedClip, onPropertyChange]);

  // Smooth transition effect when switching clips
  useEffect(() => {
    // Force re-render with transition when clip changes
    const timer = setTimeout(() => {
      // This ensures smooth transitions between different property sets
    }, 50);
    
    return () => clearTimeout(timer);
  }, [selectedClip?.id]);

  // No selection state
  if (!selectedClip) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg 
              className="w-8 h-8 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" 
              />
            </svg>
          </div>
          <p className="text-sm text-gray-400">
            Select a clip to inspect its properties
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 transition-all duration-300 ease-in-out">
      {/* Clip Info Header */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-100 truncate">
            {selectedClip.name}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetProperties}
            title="Reset all properties to defaults"
          >
            Reset
          </Button>
        </div>
        <div className="text-xs text-gray-400 space-y-1">
          <div>Duration: {(selectedClip.endTime - selectedClip.startTime).toFixed(1)}s</div>
          <div>Start: {selectedClip.startTime.toFixed(1)}s</div>
        </div>
      </div>

      {/* AI Features Section */}
      {(selectedClip.name.toLowerCase().includes('video') || selectedClip.name.toLowerCase().includes('audio')) && onGenerateCaptions && (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h4 className="text-sm font-medium text-gray-100 mb-3">AI Features</h4>
          <Button
            variant="primary"
            size="sm"
            onClick={handleGenerateCaptions}
            loading={isGeneratingCaptions}
            disabled={isGeneratingCaptions}
            className="w-full"
          >
            {isGeneratingCaptions ? 'Generating...' : 'Generate Captions'}
          </Button>
        </div>
      )}

      {/* Transform Properties */}
      <CollapsibleSection
        title="Transform"
        isOpen={openSections.transform}
        onToggle={() => toggleSection('transform')}
      >
        <Slider
          label="Position X"
          value={currentProperties.transform.x}
          onChange={(value) => handleTransformChange('x', value)}
          min={-1000}
          max={1000}
          step={1}
          showValue
        />
        <Slider
          label="Position Y"
          value={currentProperties.transform.y}
          onChange={(value) => handleTransformChange('y', value)}
          min={-1000}
          max={1000}
          step={1}
          showValue
        />
        <Slider
          label="Scale"
          value={currentProperties.transform.scale}
          onChange={(value) => handleTransformChange('scale', value)}
          min={0.1}
          max={5}
          step={0.1}
          showValue
        />
        <Slider
          label="Rotation"
          value={currentProperties.transform.rotation}
          onChange={(value) => handleTransformChange('rotation', value)}
          min={0}
          max={360}
          step={1}
          showValue
        />
      </CollapsibleSection>

      {/* Filter Properties */}
      <CollapsibleSection
        title="Filters"
        isOpen={openSections.filters}
        onToggle={() => toggleSection('filters')}
      >
        <Slider
          label="Brightness"
          value={currentProperties.filters.brightness}
          onChange={(value) => handleFilterChange('brightness', value)}
          min={0}
          max={200}
          step={1}
          showValue
        />
        <Slider
          label="Contrast"
          value={currentProperties.filters.contrast}
          onChange={(value) => handleFilterChange('contrast', value)}
          min={0}
          max={200}
          step={1}
          showValue
        />
        <Slider
          label="Saturation"
          value={currentProperties.filters.saturation}
          onChange={(value) => handleFilterChange('saturation', value)}
          min={0}
          max={200}
          step={1}
          showValue
        />
      </CollapsibleSection>

      {/* Audio Properties */}
      <CollapsibleSection
        title="Audio"
        isOpen={openSections.audio}
        onToggle={() => toggleSection('audio')}
      >
        <Slider
          label="Volume"
          value={currentProperties.audio.volume}
          onChange={(value) => handleAudioChange('volume', value)}
          min={0}
          max={200}
          step={1}
          showValue
        />
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-200">Muted</label>
          <button
            onClick={() => handleAudioChange('muted', !currentProperties.audio.muted)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900 ${
              currentProperties.audio.muted ? 'bg-red-500' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                currentProperties.audio.muted ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </CollapsibleSection>
    </div>
  );
}