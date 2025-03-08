/**
 * Planca Design System
 * 
 * This file contains the central design tokens and styling guidelines
 * to maintain visual consistency across the application.
 */

// Color Palette (matches Tailwind config)
export const colors = {
    primary: {
      50: '#fff1f1',
      100: '#ffe1e1', 
      200: '#ffc7c7',
      300: '#ff9e9e', 
      400: '#ff6b6b',
      500: '#ff3a3a',
      600: '#ff0000', // Main brand red
      700: '#cc0000', // Darker red for hover states
      800: '#990000',
      900: '#7a0000',
      950: '#4b0000',
    },
    secondary: {
      50: '#f0f0f0',
      100: '#d6d6d6',
      200: '#bdbdbd',
      300: '#9e9e9e', 
      400: '#757575',
      500: '#595959',
      600: '#3d3d3d',
      700: '#282828',
      800: '#181818',
      900: '#0c0c0c', // Main dark background
      950: '#050505',
    },
    // Success, warning, info and other semantic colors
    success: {
      100: '#dcfce7',
      500: '#22c55e',
      700: '#15803d',
    },
    warning: {
      100: '#fef9c3',
      500: '#eab308',
      700: '#a16207',
    },
    error: {
      100: '#fee2e2',
      500: '#ef4444',
      700: '#b91c1c',
    },
    info: {
      100: '#dbeafe',
      500: '#3b82f6',
      700: '#1d4ed8',
    },
  };
  
  // Typography Scale
  export const typography = {
    fontFamily: {
      primary: "'Inter', system-ui, -apple-system, sans-serif",
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
      '6xl': '3.75rem', // 60px
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
  };
  
  // Spacing Scale
  export const spacing = {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
    32: '8rem',     // 128px
    40: '10rem',    // 160px
    48: '12rem',    // 192px
    56: '14rem',    // 224px
    64: '16rem',    // 256px
  };
  
  // Border Radius
  export const borderRadius = {
    none: '0',
    sm: '0.125rem',    // 2px
    DEFAULT: '0.25rem', // 4px
    md: '0.375rem',    // 6px
    lg: '0.5rem',      // 8px
    xl: '0.75rem',     // 12px
    '2xl': '1rem',     // 16px
    '3xl': '1.5rem',   // 24px
    full: '9999px',
  };
  
  // Shadows
  export const shadows = {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    red: '0 4px 14px rgba(255, 0, 0, 0.25)',
    'red-lg': '0 8px 20px rgba(255, 0, 0, 0.3)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    none: 'none',
  };
  
  // Z-index
  export const zIndex = {
    0: '0',
    10: '10',
    20: '20',
    30: '30',
    40: '40',
    50: '50',
    auto: 'auto',
  };
  
  // Transitions
  export const transitions = {
    DEFAULT: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    fast: '100ms cubic-bezier(0.4, 0, 0.2, 1)',
  };
  
  // Component-specific theme configurations
  export const componentThemes = {
    button: {
      variants: {
        primary: {
          base: 'bg-primary-600 text-white',
          hover: 'hover:bg-primary-700',
          focus: 'focus:ring-primary-500',
          disabled: 'opacity-60 cursor-not-allowed',
        },
        secondary: {
          base: 'bg-emerald-600 text-white',
          hover: 'hover:bg-emerald-700',
          focus: 'focus:ring-emerald-500',
          disabled: 'opacity-60 cursor-not-allowed',
        },
        outline: {
          base: 'border border-gray-300 text-gray-700 bg-white',
          hover: 'hover:bg-gray-50',
          focus: 'focus:ring-primary-500',
          disabled: 'opacity-60 cursor-not-allowed',
        },
        danger: {
          base: 'bg-red-600 text-white',
          hover: 'hover:bg-red-700',
          focus: 'focus:ring-red-500',
          disabled: 'opacity-60 cursor-not-allowed',
        },
        success: {
          base: 'bg-green-600 text-white',
          hover: 'hover:bg-green-700',
          focus: 'focus:ring-green-500',
          disabled: 'opacity-60 cursor-not-allowed',
        },
        warning: {
          base: 'bg-yellow-500 text-white',
          hover: 'hover:bg-yellow-600',
          focus: 'focus:ring-yellow-500',
          disabled: 'opacity-60 cursor-not-allowed',
        },
        ghost: {
          base: 'text-gray-700',
          hover: 'hover:bg-gray-100',
          focus: 'focus:ring-gray-500',
          disabled: 'opacity-60 cursor-not-allowed',
        },
      },
      sizes: {
        xs: 'px-2.5 py-1.5 text-xs',
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-2.5 text-base',
        xl: 'px-8 py-3 text-lg',
      },
      rounded: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        full: 'rounded-full',
      },
    },
    
    card: {
      base: 'bg-white border border-gray-200',
      shadow: {
        none: '',
        sm: 'shadow-sm',
        md: 'shadow',
        lg: 'shadow-lg',
        xl: 'shadow-xl',
        '2xl': 'shadow-2xl',
      },
      rounded: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        full: 'rounded-3xl',
      },
      padding: {
        none: 'p-0',
        sm: 'p-2',
        normal: 'p-4',
        lg: 'p-6',
        xl: 'p-8',
      },
    },
    
    // Dark mode versions
    dark: {
      button: {
        variants: {
          primary: {
            base: 'bg-primary-600 text-white',
            hover: 'hover:bg-primary-700',
          },
          outline: {
            base: 'border border-gray-600 text-gray-300 bg-secondary-800',
            hover: 'hover:bg-secondary-700 hover:border-primary-500 hover:text-primary-400',
          },
        },
      },
      card: {
        base: 'bg-secondary-800 border border-secondary-700',
      },
    },
  };
  
  // Export the complete design system
  export default {
    colors,
    typography,
    spacing,
    borderRadius,
    shadows,
    zIndex,
    transitions,
    componentThemes,
  };