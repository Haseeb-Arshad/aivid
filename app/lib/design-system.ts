/**
 * Design System Constants
 * Apple-inspired design tokens for the AI Video Editor
 */

export const colors = {
  // Primary Colors
  bg: {
    primary: '#111827',     // bg-gray-900
    secondary: '#1f2937',   // bg-gray-800
    tertiary: '#374151',    // bg-gray-700
  },
  
  // Text Colors
  text: {
    primary: '#f9fafb',     // text-gray-50
    secondary: '#d1d5db',   // text-gray-300
    muted: '#9ca3af',       // text-gray-400
  },
  
  // Accent Colors
  accent: {
    gradient: 'linear-gradient(135deg, #60a5fa, #a855f7)',
    blue: '#60a5fa',        // blue-400
    purple: '#a855f7',      // purple-500
  },
  
  // Status Colors
  status: {
    success: '#10b981',     // green-500
    warning: '#f59e0b',     // amber-500
    error: '#ef4444',       // red-500
  },
  
  // Interactive States
  border: {
    default: '#4b5563',     // border-gray-600
    active: '#60a5fa',      // border-blue-400
  },
  
  hover: {
    bg: '#4b5563',          // bg-gray-600
  },
} as const;

export const typography = {
  // Font Families
  fontFamily: {
    sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
  },
  
  // Font Sizes and Weights
  heading: {
    h1: 'text-4xl font-bold',
    h2: 'text-xl font-semibold',
  },
  
  body: {
    base: 'text-base font-normal',
    ui: 'text-sm font-medium',
    meta: 'text-xs font-light',
  },
} as const;

export const spacing = {
  // Common spacing values
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '0.75rem',    // 12px
  lg: '1rem',       // 16px
  xl: '1.5rem',     // 24px
  '2xl': '2rem',    // 32px
  '3xl': '3rem',    // 48px
} as const;

export const borderRadius = {
  sm: '0.25rem',    // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
} as const;

export const transitions = {
  fast: '150ms ease-in-out',
  normal: '300ms ease-in-out',
  slow: '500ms ease-in-out',
} as const;

// Component style patterns
export const componentStyles = {
  panel: 'bg-gray-800 rounded-lg border border-gray-700',
  
  button: {
    primary: 'px-4 py-2 rounded-md bg-gradient-to-r from-blue-400 to-purple-500 text-white font-medium transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900',
    secondary: 'px-4 py-2 rounded-md bg-gray-700 text-gray-100 font-medium hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900',
    ghost: 'px-4 py-2 rounded-md text-gray-300 font-medium hover:bg-gray-700 hover:text-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900',
  },
  
  input: {
    field: 'bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors',
  },
  
  slider: {
    track: 'w-full h-2 bg-gray-700 rounded-full',
    thumb: 'w-4 h-4 bg-gray-400 rounded-full cursor-pointer hover:bg-gray-300 transition-colors',
  },
} as const;