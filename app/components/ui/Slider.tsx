import { useState, useCallback, type ChangeEvent } from 'react';
import { componentStyles } from '~/lib/design-system';

export interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  showValue = true,
  disabled = false,
  className = '',
}: SliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  
  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(event.target.value);
    onChange(newValue);
  }, [onChange]);
  
  const percentage = ((value - min) / (max - min)) * 100;
  
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-ui text-gray-200">{label}</label>
          {showValue && (
            <span className="text-meta text-gray-400 font-mono">
              {value.toFixed(step < 1 ? 2 : 0)}
            </span>
          )}
        </div>
      )}
      
      <div className="relative">
        <div className={componentStyles.slider.track}>
          {/* Progress fill */}
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all duration-150"
            style={{ width: `${percentage}%` }}
          />
          
          {/* Thumb */}
          <div
            className={`absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 ${componentStyles.slider.thumb} ${
              isDragging ? 'scale-110' : ''
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{ left: `${percentage}%` }}
          />
        </div>
        
        {/* Hidden input for accessibility and interaction */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          aria-label={label}
        />
      </div>
    </div>
  );
}