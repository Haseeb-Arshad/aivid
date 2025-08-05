import { Button } from '~/components/ui/Button';

export interface HeaderProps {
  projectTitle?: string;
  onExport?: () => void;
  onHelp?: () => void;
}

export function Header({ 
  projectTitle = "Untitled Project", 
  onExport, 
  onHelp 
}: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 transition-all duration-200">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 h-16">
        {/* Left section - Logo and Project Title */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            {/* Logo */}
            <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
              <svg 
                className="w-5 h-5 text-white" 
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
            
            {/* App Title */}
            <h1 className="text-lg font-semibold text-gray-100">
              AI Video Editor
            </h1>
          </div>
          
          {/* Project Title */}
          <div className="hidden sm:flex items-center">
            <span className="text-gray-400 mx-2">•</span>
            <span className="text-sm text-gray-300 font-medium">
              {projectTitle}
            </span>
          </div>
        </div>

        {/* Right section - Action buttons */}
        <div className="flex items-center space-x-3">
          {/* Help Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onHelp}
            className="hidden sm:inline-flex hover:bg-gray-800 transition-colors"
            title="Help & Documentation"
          >
            <svg 
              className="w-4 h-4 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            Help
          </Button>

          {/* Export Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={onExport}
            className="shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <svg 
              className="w-4 h-4 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
            Export
          </Button>
        </div>
      </div>
    </header>
  );
}