import React from 'react';
import { CardProps } from '@/shared/types';

/**
 * Modern Card component with enhanced visual effects including glass morphism
 */
const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  title, 
  titleClassName = '',
  subtitle,
  footer,
  actions,
  shadow = 'md',
  padding = 'normal',
  border = true,
  rounded = 'md',
  hover = false,
  transparent = false,
  variant = 'solid', // New: 'solid', 'glass', or 'gradient'
  ...props 
}) => {
  // Enhanced shadow classes with more depth and dimension
  const shadowClasses: Record<string, string> = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
    'glow': 'shadow-lg shadow-primary-500/20',
  };

  // Refined padding options
  const paddingClasses: Record<string, string> = {
    none: 'p-0',
    sm: 'p-3',
    normal: 'p-5',
    lg: 'p-6',
    xl: 'p-8',
  };

  // Smoother rounded corners
  const roundedClasses: Record<string, string> = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    xl: 'rounded-2xl',
    full: 'rounded-3xl',
  };

  // Card variants
  const variantClasses: Record<string, string> = {
    solid: 'bg-white border-gray-200 text-gray-800',
    glass: 'bg-white/50 backdrop-blur-md border-gray-200/50 text-gray-800',
    gradient: 'bg-gradient-to-br from-gray-50 to-white border-gray-200/30 text-gray-800',
  };

  // Hover effects with smooth transitions
  const hoverClasses = hover 
    ? (typeof hover === 'string' ? 
        (hover === 'glow' ? 'transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-primary-500/20' : 
         hover === 'lift' ? 'transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 transform-gpu' : 
         'transition-all duration-200 hover:shadow-md')
      : 'transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 transform-gpu')
    : 'transition-all duration-200';

  const borderClass = border ? 'border' : '';

  const baseClasses = [
    variantClasses[variant],
    borderClass,
    shadowClasses[shadow],
    roundedClasses[rounded],
    hoverClasses,
    className
  ].join(' ');

  return (
    <div className={baseClasses} {...props}>
      {/* Card Header with Title and Actions */}
      {(title || actions) && (
        <div className={`flex justify-between items-center ${padding !== 'none' ? paddingClasses[padding] : 'px-5 pt-5'} 
                        ${subtitle ? 'pb-2' : 'pb-4'} ${subtitle || (children && padding !== 'none') ? 'border-b border-gray-200' : ''}`}>
          <div>
            {title && (
              <h3 className={`text-lg font-medium text-gray-900 ${titleClassName}`}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-gray-500">
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center space-x-2 ml-4">
              {actions}
            </div>
          )}
        </div>
      )}
      
      {/* Card Body Content */}
      <div className={`${(title || actions) && subtitle ? 'pt-3' : ''} ${padding !== 'none' ? paddingClasses[padding] : ''} ${title && padding !== 'none' ? 'pt-0' : ''}`}>
        {children}
      </div>
      
      {/* Card Footer with enhanced styling */}
      {footer && (
        <div className={`border-t border-gray-200 ${padding !== 'none' ? paddingClasses[padding] : 'px-5 pb-5'} pt-4 mt-auto`}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;