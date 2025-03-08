import React from 'react';
import { ButtonProps } from '@/types';

/**
 * Button component with various styles and states
 */
const Button: React.FC<ButtonProps> = ({
  type = 'button',
  className = '',
  disabled = false,
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  isLoading = false,
  loadingText,
  icon,
  fullWidth = false,
  rounded = 'md',
  ...props
}) => {
  // Base classes for all buttons
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  // Variant-specific styling
  const variantClasses: Record<string, string> = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-sm dark:bg-primary-700 dark:hover:bg-primary-600 dark:focus:ring-primary-400',
    secondary: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 shadow-sm dark:bg-emerald-700 dark:hover:bg-emerald-600',
    outline: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-primary-500 dark:border-gray-600 dark:text-gray-200 dark:bg-secondary-800 dark:hover:bg-secondary-700',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm dark:bg-red-700 dark:hover:bg-red-600',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-sm dark:bg-green-700 dark:hover:bg-green-600',
    warning: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500 shadow-sm dark:bg-yellow-600 dark:hover:bg-yellow-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500 dark:text-gray-300 dark:hover:bg-secondary-700',
  };
  
  // Size-specific styling
  const sizeClasses: Record<string, string> = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-base',
    xl: 'px-8 py-3 text-lg',
  };
  
  // Border radius options
  const roundedClasses: Record<string, string> = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };
  
  // Classes for disabled state
  const disabledClasses = 'opacity-60 cursor-not-allowed';
  
  // Combine all classes
  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    roundedClasses[rounded],
    (disabled || isLoading) ? disabledClasses : '',
    fullWidth ? 'w-full' : '',
    className
  ].join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {loadingText || 'Yükleniyor...'}
        </>
      ) : (
        <>
          {icon && <span className={children ? 'mr-2' : ''}>{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;