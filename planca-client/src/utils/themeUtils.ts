// src/utils/themeUtils.ts
import { ColorVariant, ButtonStyle } from '../types';

type ColorSet = {
  light: string;
  bg: string;
  bgHover: string;
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
 * Uygulama genelinde kullanılan tema konfigürasyonu
 */
export const theme: Theme = {
  colors: {
    primary: {
      light: 'text-primary-300',
      bg: 'bg-primary-600',
      bgHover: 'hover:bg-primary-700',
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
      bgLight: 'bg-gray-100',
      bgLightHover: 'hover:bg-gray-200', 
      text: 'text-gray-600',
      border: 'border-gray-300',
      ring: 'focus:ring-gray-500',
    }
  },
  
  // Ortak bileşen varyasyonları
  button: {
    base: 'inline-flex items-center justify-center font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ease-in-out shadow-sm',
    disabled: 'opacity-60 cursor-not-allowed',
    fullWidth: 'w-full',
    sizes: {
      xs: 'px-2.5 py-1.5 text-xs',
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-2.5 text-base',
      xl: 'px-8 py-3 text-lg'
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
      base: 'block w-full rounded-md border shadow-sm py-3 transition-colors duration-200',
      focus: 'focus:ring-primary-300 focus:border-primary-300',
      error: 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-300 focus:border-red-300',
      disabled: 'bg-gray-100 cursor-not-allowed',
      readOnly: 'bg-gray-50 cursor-default'
    }
  },
  
  card: {
    base: 'bg-white border border-gray-200',
    shadow: {
      none: '',
      sm: 'shadow-sm',
      md: 'shadow',
      lg: 'shadow-lg',
      xl: 'shadow-xl'
    },
    rounded: {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      full: 'rounded-3xl'
    },
    padding: {
      none: 'p-0',
      sm: 'p-2',
      normal: 'p-4',
      lg: 'p-6',
      xl: 'p-8'
    },
    hover: 'transition-shadow duration-300 hover:shadow-lg'
  }
};

interface ButtonClasses {
  [key: string]: string;
}

/**
 * Tema konfigürasyonuna göre bir varyasyon için tutarlı sınıflar oluşturur
 * @param variant - Varyasyon adı (primary, danger, vb.)
 * @param style - Stil tipi (solid, outline, ghost)
 * @returns Tailwind CSS sınıfları
 */
export function getVariantClasses(variant: ColorVariant = 'primary', style: ButtonStyle = 'solid'): string {
  const colorSet = theme.colors[variant] || theme.colors.primary;
  
  const styleClasses: ButtonClasses = {
    outline: `border ${colorSet.border} ${colorSet.text} bg-white hover:bg-gray-50 ${colorSet.ring}`,
    ghost: `${colorSet.text} hover:${colorSet.bgLight} ${colorSet.ring} shadow-none`,
    light: `${colorSet.bgLight} ${colorSet.text} ${colorSet.bgLightHover} ${colorSet.ring}`,
    solid: `${colorSet.bg} text-white ${colorSet.bgHover} ${colorSet.ring}`
  };
  
  return styleClasses[style] || styleClasses.solid;
}

interface AlertClasses {
  container: string;
  icon: string;
  text: string;
  ring: string;
  hover: string;
}

/**
 * Uyarı bileşeni için tipe göre sınıflar oluşturur
 * @param type - Uyarı tipi (info, success, vb.)
 * @returns Uyarı bileşeninin farklı elemanları için CSS sınıfları
 */
export function getAlertClasses(type: 'info' | 'success' | 'warning' | 'error' = 'info'): AlertClasses {
  const colorSet = theme.colors[type === 'error' ? 'danger' : type] || theme.colors.info;
  
  return {
    container: `bg-${type}-50 border-${type}-300 ${type === 'error' ? 'bg-red-200/50 border-red-300' : ''}`,
    icon: colorSet.light,
    text: type === 'error' ? 'text-red-700' : `text-${type}-800`,
    ring: colorSet.ring,
    hover: `hover:bg-${type}-100`
  };
}