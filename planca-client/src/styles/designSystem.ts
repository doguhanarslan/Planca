/**
 * Planca Design System
 * 
 * Modern ve tutarlı tasarım için merkezi tasarım token'ları ve stil yönergeleri
 */

// Color Palette (Red, White, Black theme)
export const colors = {
  primary: {
    50: '#fff5f5',
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
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db', 
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827', // Main dark background
    950: '#030712',
  },
  // Enhanced semantic colors for better contrast and accessibility
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
};

// Modern Typography Scale with enhanced options
export const typography = {
fontFamily: {
  primary: "'Inter', system-ui, -apple-system, sans-serif",
  heading: "'Inter', system-ui, -apple-system, sans-serif",
  mono: "'SF Mono', SFMono-Regular, ui-monospace, Menlo, Monaco, Consolas, monospace",
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
  '7xl': '4.5rem',  // 72px
  '8xl': '6rem',    // 96px
},
fontWeight: {
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
},
lineHeight: {
  none: 1,
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
},
letterSpacing: {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
},
};

// Enhanced Spacing Scale with additional values
export const spacing = {
0: '0',
px: '1px',
0.5: '0.125rem',  // 2px
1: '0.25rem',     // 4px
1.5: '0.375rem',  // 6px
2: '0.5rem',      // 8px
2.5: '0.625rem',  // 10px
3: '0.75rem',     // 12px
3.5: '0.875rem',  // 14px
4: '1rem',        // 16px
5: '1.25rem',     // 20px
6: '1.5rem',      // 24px
7: '1.75rem',     // 28px
8: '2rem',        // 32px
9: '2.25rem',     // 36px
10: '2.5rem',     // 40px
11: '2.75rem',    // 44px
12: '3rem',       // 48px
14: '3.5rem',     // 56px
16: '4rem',       // 64px
20: '5rem',       // 80px
24: '6rem',       // 96px
28: '7rem',       // 112px
32: '8rem',       // 128px
36: '9rem',       // 144px
40: '10rem',      // 160px
44: '11rem',      // 176px
48: '12rem',      // 192px
52: '13rem',      // 208px
56: '14rem',      // 224px
60: '15rem',      // 240px
64: '16rem',      // 256px
72: '18rem',      // 288px
80: '20rem',      // 320px
96: '24rem',      // 384px
};

// Enhanced Border Radius
export const borderRadius = {
none: '0',
sm: '0.125rem',     // 2px
DEFAULT: '0.25rem', // 4px
md: '0.375rem',     // 6px
lg: '0.5rem',       // 8px
xl: '0.75rem',      // 12px
'2xl': '1rem',      // 16px
'3xl': '1.5rem',    // 24px
full: '9999px',
};

// Enhanced Shadows with better depth perception
export const shadows = {
xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
DEFAULT: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
md: '0 6px 10px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
'2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
'red': '0 4px 14px rgba(255, 0, 0, 0.25)',
'red-lg': '0 8px 20px rgba(255, 0, 0, 0.3)',
'primary': '0 4px 14px rgba(255, 0, 0, 0.25)',
'primary-lg': '0 8px 20px rgba(255, 0, 0, 0.3)',
'none': 'none',
};

// Z-index Scale
export const zIndex = {
0: '0',
10: '10',
20: '20',
30: '30',
40: '40',
50: '50',
auto: 'auto',
dropdown: '1000',
sticky: '1020',
fixed: '1030',
modalBackdrop: '1040',
modal: '1050',
popover: '1060',
tooltip: '1070',
};

// Enhanced Transitions
export const transitions = {
DEFAULT: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
fast: '100ms cubic-bezier(0.4, 0, 0.2, 1)',
slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
slower: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
bounce: '150ms cubic-bezier(0.34, 1.56, 0.64, 1)',
ease: '300ms ease',
easeOut: '300ms ease-out',
easeIn: '300ms ease-in',
};

// Enhanced Animation Keyframes
export const keyframes = {
fadeIn: {
  from: { opacity: '0' },
  to: { opacity: '1' }
},
fadeOut: {
  from: { opacity: '1' },
  to: { opacity: '0' }
},
slideInBottom: {
  from: { transform: 'translateY(20px)', opacity: '0' },
  to: { transform: 'translateY(0)', opacity: '1' }
},
slideOutBottom: {
  from: { transform: 'translateY(0)', opacity: '1' },
  to: { transform: 'translateY(20px)', opacity: '0' }
},
pulse: {
  '0%, 100%': { opacity: '1' },
  '50%': { opacity: '0.5' }
},
spin: {
  from: { transform: 'rotate(0deg)' },
  to: { transform: 'rotate(360deg)' }
},
bounce: {
  '0%, 100%': { transform: 'translateY(0)' },
  '50%': { transform: 'translateY(-10px)' }
}
};

// Component-specific theme configurations
export const componentThemes = {
button: {
  variants: {
    primary: {
      base: 'bg-primary-600 text-white',
      hover: 'hover:bg-primary-700',
      active: 'active:bg-primary-800',
      focus: 'focus:ring-primary-500',
      disabled: 'opacity-60 cursor-not-allowed',
    },
    secondary: {
      base: 'bg-emerald-600 text-white',
      hover: 'hover:bg-emerald-700',
      active: 'active:bg-emerald-800',
      focus: 'focus:ring-emerald-500',
      disabled: 'opacity-60 cursor-not-allowed',
    },
    outline: {
      base: 'border border-gray-300 text-gray-800 bg-white',
      hover: 'hover:bg-gray-50 hover:border-primary-400 hover:text-primary-600',
      active: 'active:bg-gray-100',
      focus: 'focus:ring-primary-500',
      disabled: 'opacity-60 cursor-not-allowed',
    },
    danger: {
      base: 'bg-red-600 text-white',
      hover: 'hover:bg-red-700',
      active: 'active:bg-red-800',
      focus: 'focus:ring-red-500',
      disabled: 'opacity-60 cursor-not-allowed',
    },
    success: {
      base: 'bg-green-600 text-white',
      hover: 'hover:bg-green-700',
      active: 'active:bg-green-800',
      focus: 'focus:ring-green-500',
      disabled: 'opacity-60 cursor-not-allowed',
    },
    warning: {
      base: 'bg-yellow-500 text-white',
      hover: 'hover:bg-yellow-600',
      active: 'active:bg-yellow-700',
      focus: 'focus:ring-yellow-500',
      disabled: 'opacity-60 cursor-not-allowed',
    },
    ghost: {
      base: 'text-gray-800 bg-transparent',
      hover: 'hover:bg-gray-100',
      active: 'active:bg-gray-200',
      focus: 'focus:ring-gray-500',
      disabled: 'opacity-60 cursor-not-allowed',
    },
    link: {
      base: 'text-primary-600 underline bg-transparent',
      hover: 'hover:text-primary-800',
      active: 'active:text-primary-900',
      focus: 'focus:ring-primary-500',
      disabled: 'opacity-60 cursor-not-allowed',
    },
    glass: {
      base: 'bg-white/10 backdrop-blur-md text-white border border-white/20',
      hover: 'hover:bg-white/20',
      active: 'active:bg-white/30',
      focus: 'focus:ring-white/30',
      disabled: 'opacity-60 cursor-not-allowed',
    },
    red:{
      base: 'bg-red-500 text-white',
      hover: 'hover:bg-red-900',
      active: 'active:bg-red-900',
      focus: 'focus:ring-red-500',
      disabled: 'opacity-60 cursor-not-allowed',
    }
  },
  sizes: {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-3.5 text-lg font-semibold',
  },
  rounded: {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  },
  interactions: {
    base: 'transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-98 transform-gpu',
  }
},

card: {
  base: 'bg-white border',
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
    md: 'rounded-lg',
    lg: 'rounded-xl',
    xl: 'rounded-2xl',
    full: 'rounded-3xl',
  },
  padding: {
    none: 'p-0',
    sm: 'p-3',
    normal: 'p-5',
    lg: 'p-6',
    xl: 'p-8',
  },
  hover: {
    none: '',
    subtle: 'transition-all duration-200 hover:shadow-md',
    lift: 'transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 transform-gpu',
    glow: 'transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-primary-500/20',
  },
  variants: {
    glass: 'bg-white/10 backdrop-blur-md border border-white/20',
    solid: 'bg-white border border-gray-200',
    gradient: 'bg-gradient-to-br from-primary-500/10 to-primary-600/10 border border-primary-100',
  }
},

input: {
  base: 'block w-full rounded-lg shadow-sm py-3 px-4 transition-all duration-200 ease-in-out bg-white text-gray-700 border border-gray-300',
  focus: 'focus:ring-2 focus:ring-opacity-50 focus:ring-primary-500 focus:border-primary-500',
  error: 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500',
  disabled: 'bg-gray-100 cursor-not-allowed opacity-75',
  readOnly: 'bg-gray-50 cursor-default',
  variants: {
    outline: 'border border-gray-300',
    filled: 'bg-gray-100 border-transparent',
    underlined: 'border-0 border-b-2 border-gray-300 rounded-none px-0 focus:ring-0',
  }
},

alert: {
  base: 'rounded-lg p-4 shadow-md transition-all duration-300 ease-in-out',
  types: {
    info: {
      container: 'bg-blue-50 border-l-4 border-blue-400',
      icon: 'text-blue-400',
      text: 'text-blue-800',
    },
    success: {
      container: 'bg-green-50 border-l-4 border-green-400',
      icon: 'text-green-400',
      text: 'text-green-800',
    },
    warning: {
      container: 'bg-yellow-50 border-l-4 border-yellow-400',
      icon: 'text-yellow-400',
      text: 'text-yellow-800',
    },
    error: {
      container: 'bg-red-50 border-l-4 border-red-400',
      icon: 'text-red-400',
      text: 'text-red-800',
    },
  },
  transitions: {
    enter: 'transform opacity-0 scale-95',
    enterActive: 'transform opacity-100 scale-100 duration-300',
    exit: 'transform opacity-100 scale-100',
    exitActive: 'transform opacity-0 scale-95 duration-200',
  },
},
};

// Export the complete enhanced design system
export default {
colors,
typography,
spacing,
borderRadius,
shadows,
zIndex,
transitions,
keyframes,
componentThemes,
};