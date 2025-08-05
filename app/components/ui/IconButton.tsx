import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'solid';
  tooltip?: string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ children, size = 'md', variant = 'ghost', tooltip, className = '', ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-md transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const sizeClasses = {
      sm: 'w-8 h-8 text-sm',
      md: 'w-10 h-10 text-base',
      lg: 'w-12 h-12 text-lg',
    };
    
    const variantClasses = {
      ghost: 'text-gray-400 hover:text-gray-200 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900',
      solid: 'text-gray-200 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900',
    };
    
    const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;
    
    return (
      <button
        ref={ref}
        className={classes}
        title={tooltip}
        {...props}
      >
        {children}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';