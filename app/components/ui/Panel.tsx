import { type ReactNode } from 'react';
import { componentStyles } from '~/lib/design-system';

export interface PanelProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  header?: ReactNode;
}

export function Panel({ children, className = '', padding = 'md', header }: PanelProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };
  
  const panelClasses = `${componentStyles.panel} ${paddingClasses[padding]} ${className}`;
  
  return (
    <div className={panelClasses}>
      {header && (
        <div className="mb-4 pb-3 border-b border-gray-700">
          {header}
        </div>
      )}
      {children}
    </div>
  );
}

export interface PanelHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PanelHeader({ title, subtitle, actions }: PanelHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-h2">{title}</h3>
        {subtitle && <p className="text-meta mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center space-x-2">{actions}</div>}
    </div>
  );
}