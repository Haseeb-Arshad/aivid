import { useState } from 'react';
import { Button, Input, Panel, PanelHeader, Slider, IconButton, Tooltip } from './ui';

export function DesignSystemDemo() {
  const [sliderValue, setSliderValue] = useState(50);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoadingTest = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-h1 mb-2">AI Video Editor Design System</h1>
        <p className="text-body text-gray-300">Apple-inspired UI components for video editing</p>
      </div>

      {/* Buttons */}
      <Panel header={<PanelHeader title="Buttons" subtitle="Primary, secondary, and ghost variants" />}>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="ghost">Ghost Button</Button>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="primary" size="md">Medium</Button>
            <Button variant="primary" size="lg">Large</Button>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="primary" loading={loading} onClick={handleLoadingTest}>
              {loading ? 'Loading...' : 'Test Loading'}
            </Button>
            <Button variant="secondary" disabled>Disabled</Button>
          </div>
        </div>
      </Panel>

      {/* Inputs */}
      <Panel header={<PanelHeader title="Form Controls" subtitle="Inputs and sliders" />}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Project Name"
              placeholder="Enter project name"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              helperText="This will be the name of your video project"
            />
            <Input
              label="Duration (seconds)"
              type="number"
              placeholder="60"
              error="Duration must be greater than 0"
            />
          </div>
          
          <Slider
            label="Volume"
            value={sliderValue}
            onChange={setSliderValue}
            min={0}
            max={100}
            step={1}
          />
          
          <Slider
            label="Opacity"
            value={75}
            onChange={() => {}}
            min={0}
            max={100}
            step={5}
            showValue={true}
          />
        </div>
      </Panel>

      {/* Icon Buttons */}
      <Panel header={<PanelHeader title="Icon Buttons" subtitle="Toolbar and action buttons" />}>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Tooltip content="Play video">
              <IconButton variant="ghost">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </IconButton>
            </Tooltip>
            
            <Tooltip content="Pause video">
              <IconButton variant="ghost">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </IconButton>
            </Tooltip>
            
            <Tooltip content="Stop video">
              <IconButton variant="solid">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                </svg>
              </IconButton>
            </Tooltip>
          </div>
          
          <div className="flex items-center space-x-2">
            <IconButton size="sm" variant="ghost">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </IconButton>
            
            <IconButton size="md" variant="ghost">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </IconButton>
            
            <IconButton size="lg" variant="ghost">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </IconButton>
          </div>
        </div>
      </Panel>

      {/* Typography */}
      <Panel header={<PanelHeader title="Typography" subtitle="Text styles and hierarchy" />}>
        <div className="space-y-4">
          <div>
            <h1 className="text-h1">Heading 1 - Main Title</h1>
            <h2 className="text-h2 mt-2">Heading 2 - Section Title</h2>
          </div>
          
          <div className="space-y-2">
            <p className="text-body">Body text - This is the main content text used throughout the application.</p>
            <p className="text-ui">UI text - Used for labels, buttons, and interface elements.</p>
            <p className="text-meta">Meta text - Used for timestamps, file sizes, and secondary information.</p>
          </div>
        </div>
      </Panel>

      {/* Color Palette */}
      <Panel header={<PanelHeader title="Color Palette" subtitle="Design system colors" />}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="w-full h-12 bg-gray-900 rounded border border-gray-700"></div>
            <p className="text-meta">Primary BG</p>
          </div>
          <div className="space-y-2">
            <div className="w-full h-12 bg-gray-800 rounded border border-gray-700"></div>
            <p className="text-meta">Secondary BG</p>
          </div>
          <div className="space-y-2">
            <div className="w-full h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded"></div>
            <p className="text-meta">Accent Gradient</p>
          </div>
          <div className="space-y-2">
            <div className="w-full h-12 bg-green-500 rounded"></div>
            <p className="text-meta">Success</p>
          </div>
        </div>
      </Panel>
    </div>
  );
}