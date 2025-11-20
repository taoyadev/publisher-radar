/**
 * Design Tokens
 * Centralized design system values for consistent UI
 */

// Brand Colors
export const colors = {
  // Primary Brand Colors
  brand: {
    primary: '#2563eb',      // blue-600
    secondary: '#7c3aed',    // purple-600
    accent: '#10b981',       // green-500
  },

  // Semantic Colors
  success: {
    light: '#d1fae5',        // green-100
    DEFAULT: '#10b981',      // green-500
    dark: '#047857',         // green-700
  },
  error: {
    light: '#fee2e2',        // red-100
    DEFAULT: '#ef4444',      // red-500
    dark: '#b91c1c',         // red-700
  },
  warning: {
    light: '#fef3c7',        // yellow-100
    DEFAULT: '#f59e0b',      // yellow-500
    dark: '#d97706',         // yellow-600
  },
  info: {
    light: '#dbeafe',        // blue-100
    DEFAULT: '#3b82f6',      // blue-500
    dark: '#1d4ed8',         // blue-700
  },

  // UI Colors
  background: {
    primary: '#ffffff',      // white
    secondary: '#f9fafb',    // gray-50
    tertiary: '#f3f4f6',     // gray-100
    dark: '#111827',         // gray-900
  },
  text: {
    primary: '#111827',      // gray-900
    secondary: '#6b7280',    // gray-500
    tertiary: '#9ca3af',     // gray-400
    inverse: '#ffffff',      // white
    link: '#2563eb',         // blue-600
  },
  border: {
    light: '#e5e7eb',        // gray-200
    DEFAULT: '#d1d5db',      // gray-300
    dark: '#9ca3af',         // gray-400
  },
} as const;

// Spacing Scale
export const spacing = {
  xs: '0.25rem',             // 4px
  sm: '0.5rem',              // 8px
  md: '1rem',                // 16px
  lg: '1.5rem',              // 24px
  xl: '2rem',                // 32px
  '2xl': '3rem',             // 48px
  '3xl': '4rem',             // 64px
  '4xl': '6rem',             // 96px
} as const;

// Border Radius
export const borderRadius = {
  none: '0',
  sm: '0.375rem',            // 6px
  md: '0.5rem',              // 8px
  lg: '0.75rem',             // 12px
  xl: '1rem',                // 16px
  '2xl': '1.5rem',           // 24px
  full: '9999px',
} as const;

// Shadows
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  card: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  cardHover: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
} as const;

// Typography
export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
    mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],        // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],    // 14px
    base: ['1rem', { lineHeight: '1.5rem' }],       // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }],    // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],     // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],      // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

// Transitions
export const transitions = {
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
  },
  timing: {
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// Z-Index Scale
export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
} as const;

// Breakpoints (Tailwind defaults)
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;
