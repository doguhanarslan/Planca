// src/utils/themeUtils.ts
import { ColorVariant, ButtonStyle } from '../../types';

type ColorSet = {
  light: string;
  bg: string;
  bgHover: string;
  bgActive: string;
  bgLight: string;
  bgLightHover: string;
  text: string;
  border: string;
  ring: string;
};

type ThemeColors = {
  [key in ColorVariant]: ColorSet;
};

interface ButtonTheme {
  base: string;
  disabled: string;
  fullWidth: string;
  sizes: {
    [key: string]: string;
  };
  rounded: {
    [key: string]: string;
  };
}

interface FormTheme {
  input: {
    base: string;
    focus: string;
    error: string;
    disabled: string;
    readOnly: string;
  };
}

interface CardTheme {
  base: string;
  shadow: {
    [key: string]: string;
  };
  rounded: {
    [key: string]: string;
  };
  padding: {
    [key: string]: string;
  };
  hover: string;
}

export interface Theme {
  colors: ThemeColors;
  button: ButtonTheme;
  form: FormTheme;
  card: CardTheme;
}

/**
 * Modernized theme configuration for the application
 */
export const theme: Theme = {
  colors: {
    primary: {
      light: 'text-primary-300',
      bg: 'bg-primary-600',
      bgHover: 'hover:bg-primary-700',
      bgActive: 'active:bg-primary-800',
      bgLight: 'bg-primary-100',
      bgLightHover: 'hover:bg-primary-200',
      text: 'text-primary-600',
      border: 'border-primary-300',
      ring: 'focus:ring-primary-500',
    },
    secondary: {
      light: 'text-emerald-300',
      bg: 'bg-emerald-600',
      bgHover: 'hover:bg-emerald-700',
      bgActive: 'active:bg-emerald-800',
      bgLight: 'bg-emerald-100',
      bgLightHover: 'hover:bg-emerald-200',
      text: 'text-emerald-600',
      border: 'border-emerald-300',
      ring: 'focus:ring-emerald-500',
    },
    danger: {
      light: 'text-red-300',
      bg: 'bg-red-600',
      bgHover: 'hover:bg-red-700',
      bgActive: 'active:bg-red-800',
      bgLight: 'bg-red-100',
      bgLightHover: 'hover:bg-red-200', 
      text: 'text-red-600',
      border: 'border-red-300',
      ring: 'focus:ring-red-500',
    },
    success: {
      light: 'text-green-300',
      bg: 'bg-green-600',
      bgHover: 'hover:bg-green-700',
      bgActive: 'active:bg-green-800',
      bgLight: 'bg-green-100',
      bgLightHover: 'hover:bg-green-200',
      text: 'text-green-600',
      border: 'border-green-300',
      ring: 'focus:ring-green-500',
    },
    warning: {
      light: 'text-yellow-300',
      bg: 'bg-yellow-500',
      bgHover: 'hover:bg-yellow-600',
      bgActive: 'active:bg-yellow-700',
      bgLight: 'bg-yellow-100',
      bgLightHover: 'hover:bg-yellow-200',
      text: 'text-yellow-500',
      border: 'border-yellow-300',
      ring: 'focus:ring-yellow-500',
    },
    info: {
      light: 'text-blue-300',
      bg: 'bg-blue-600',
      bgHover: 'hover:bg-blue-700',
      bgActive: 'active:bg-blue-800',
      bgLight: 'bg-blue-100/50',
      bgLightHover: 'hover:bg-blue-200',
      text: 'text-blue-600',
      border: 'border-blue-300',
      ring: 'focus:ring-blue-500',
    },
    neutral: {
      light: 'text-gray-300',
      bg: 'bg-gray-600',
      bgHover: 'hover:bg-gray-700',
      bgActive: 'active:bg-gray-800',
      bgLight: 'bg-gray-100',
      bgLightHover: 'hover:bg-gray-200', 
      text: 'text-gray-600',
      border: 'border-gray-300',
      ring: 'focus:ring-gray-500',
    }
  },
  
  // Enhanced component styling variants
  button: {
    base: 'inline-flex items-center justify-center font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 ease-in-out shadow-sm active:scale-98 transform-gpu',
    disabled: 'opacity-60 cursor-not-allowed',
    fullWidth: 'w-full',
    sizes: {
      xs: 'px-2.5 py-1.5 text-xs',
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base',
      xl: 'px-8 py-3.5 text-lg font-semibold'
    },
    rounded: {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      full: 'rounded-full'
    }
  },
  
  form: {
    input: {
      base: 'block w-full rounded-lg border shadow-sm py-3 px-4 transition-colors duration-200',
      focus: 'focus:ring-2 focus:ring-opacity-50 focus:ring-primary-500 focus:border-primary-500',
      error: 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500',
      disabled: 'bg-gray-100 cursor-not-allowed opacity-75',
      readOnly: 'bg-gray-50 cursor-default',
    }
  },
  
  card: {
    base: 'bg-white border border-gray-200 transition-all duration-200',
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
      full: 'rounded-3xl'
    },
    padding: {
      none: 'p-0',
      sm: 'p-3',
      normal: 'p-5',
      lg: 'p-6',
      xl: 'p-8'
    },
    hover: 'transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1',
  }
};

interface ButtonClasses {
  [key: string]: string;
}

/**
 * Get consistent classes for a variant based on theme configuration
 * @param variant - Color variant name (primary, danger, etc.)
 * @param style - Button style type (solid, outline, ghost, etc.)
 * @returns Tailwind CSS classes
 */
export function getVariantClasses(variant: ColorVariant = 'primary', style: ButtonStyle = 'solid'): string {
  const variantColors = theme.colors[variant];
  let classes = '';
  
  switch (style) {
    case 'solid':
      classes = `${variantColors.bg} ${variantColors.bgHover} ${variantColors.bgActive} text-white`;
      break;
    case 'outline':
      classes = `border ${variantColors.border} ${variantColors.text} ${variantColors.bgLightHover} bg-white hover:border-primary-400 hover:text-primary-600`;
      break;
    case 'ghost':
      classes = `${variantColors.text} ${variantColors.bgLightHover} bg-transparent`;
      break;
    case 'light':
      classes = `${variantColors.bgLight} ${variantColors.bgLightHover} ${variantColors.text}`;
      break;
    case 'link':
      classes = `${variantColors.text} hover:underline bg-transparent`;
      break;
    default:
      classes = `${variantColors.bg} ${variantColors.bgHover} ${variantColors.bgActive} text-white`;
  }
  
  return classes;
}

interface AlertClasses {
  container: string;
  icon: string;
  text: string;
  ring: string;
  hover: string;
}

/**
 * Get alert component classes based on alert type
 * @param type - Alert type (info, success, warning, error)
 * @returns CSS classes for different alert elements
 */
export function getAlertClasses(type: 'info' | 'success' | 'warning' | 'error' = 'info'): AlertClasses {
  const colorSet = theme.colors[type === 'error' ? 'danger' : type] || theme.colors.info;
  
  return {
    container: `bg-${type}-50 border-${type}-300 ${type === 'error' ? 'bg-red-50 border-red-300' : ''}`,
    icon: colorSet.light,
    text: type === 'error' ? 'text-red-700' : `text-${type}-800`,
    ring: colorSet.ring,
    hover: `hover:bg-${type}-100`
  };
}

