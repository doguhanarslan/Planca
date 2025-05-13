import React from 'react';
import { ButtonProps } from '@/types';
import { componentThemes } from '@/styles/designSystem';

/**
 * Modern Button component with enhanced visual effects and glass morphism
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
  // Get variant classes from component themes
  const getVariantClasses = (variantName: string): string => {
    const availableVariants = componentThemes.button.variants;
    const selectedVariant = availableVariants[variantName as keyof typeof availableVariants];
    if (selectedVariant) {
      return `${selectedVariant.base} ${selectedVariant.hover} ${selectedVariant.active} ${selectedVariant.focus}`;
    }
    
    // Fallback to primary if variant not found
    const primaryTheme = availableVariants.primary;
    return `${primaryTheme.base} ${primaryTheme.hover} ${primaryTheme.active} ${primaryTheme.focus}`;
  };
  
  // Base classes using component themes
  const baseClasses = componentThemes.button.interactions.base;
  const redClasses = componentThemes.button.variants.red;
  // Get size classes from component themes
  const sizes = componentThemes.button.sizes;
  const sizeClass = sizes[size as keyof typeof sizes] || sizes.md;
  
  // Get border radius from component themes
  const roundedSizes = componentThemes.button.rounded;
  const roundedClass = roundedSizes[rounded as keyof typeof roundedSizes] || roundedSizes.md;
  
  // Get disabled classes
  const variants = componentThemes.button.variants;
  const selectedVariant = variants[variant as keyof typeof variants];
  const disabledClass = disabled || isLoading ? 
    (selectedVariant?.disabled || variants.primary.disabled) : '';
  
  // Combine all classes
  const classes = [
    baseClasses,
    getVariantClasses(variant),
    sizeClass,
    roundedClass,
    disabledClass,
    fullWidth ? 'w-full' : '',
    'cursor-pointer',
    className,redClasses
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
          <svg 
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{loadingText || 'Yükleniyor...'}</span>
        </>
      ) : (
        <>
          {icon && (
            <span className={`flex-shrink-0 ${children ? 'mr-2' : ''}`}>
              {icon}
            </span>
          )}
          {children && <span className="flex-shrink-0 font-medium">{children}</span>}
        </>
      )}
    </button>
  );
};

export default Button;