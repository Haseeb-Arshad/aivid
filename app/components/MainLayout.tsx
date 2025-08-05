import { type ReactNode } from 'react';

export interface MainLayoutProps {
  leftPanel: ReactNode;
  centerPanel: ReactNode;
  rightPanel?: ReactNode;
}

export function MainLayout({ leftPanel, centerPanel, rightPanel }: MainLayoutProps) {
  return (
    <div className="flex-1 flex overflow-hidden pt-16">
      {/* Left Panel - Media Library & Inspector */}
      <div className="w-72 lg:w-80 flex-shrink-0 bg-gray-800 border-r border-gray-700 flex flex-col transition-all duration-300 hover:shadow-lg">
        <div className="flex-1 overflow-hidden">
          {leftPanel}
        </div>
      </div>

      {/* Center Panel - Preview & Timeline */}
      <div className="flex-1 flex flex-col bg-gray-900 min-w-0 transition-all duration-300">
        {centerPanel}
      </div>

      {/* Right Panel - Future: Effects Library (Optional) */}
      {rightPanel && (
        <div className="w-72 lg:w-80 flex-shrink-0 bg-gray-800 border-l border-gray-700 flex flex-col transition-all duration-300 hover:shadow-lg">
          <div className="flex-1 overflow-hidden">
            {rightPanel}
          </div>
        </div>
      )}
    </div>
  );
}