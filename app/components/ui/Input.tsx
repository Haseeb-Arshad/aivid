import { forwardRef, type InputHTMLAttributes } from 'react';
import { componentStyles } from '~/lib/design-system';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    const inputClasses = `${componentStyles.input.field} ${error ? 'border-red-500 focus:ring-red-400' : ''} ${className}`;
    
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-ui text-gray-200">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={inputClasses}
          {...props}
        />
        {error && (
          <p className="text-meta text-red-400">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-meta text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';