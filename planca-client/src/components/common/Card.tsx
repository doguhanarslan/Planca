import React from 'react';
import { CardProps } from '@/types';

/**
 * Modern Card component with enhanced visual effects and customization options
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
  ...props 
}) => {
  // Enhanced shadow classes with more depth and dimension
  const shadowClasses: Record<string, string> = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow',
    lg: 'shadow-lg',
    xl: 'shadow-xl dark:shadow-gray-900/30',
    '2xl': 'shadow-2xl dark:shadow-gray-900/40',
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

  // Improved background and border styles with dark mode support
  const bgClasses = transparent 
    ? 'bg-white/90 backdrop-blur-sm dark:bg-secondary-800/90' 
    : 'bg-white dark:bg-secondary-800';
  
  const borderClasses = border 
    ? 'border border-gray-200 dark:border-gray-700' 
    : '';

  // Enhanced hover effects with smooth transitions
  const hoverClasses = hover 
    ? 'transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 dark:hover:shadow-gray-900/30' 
    : 'transition-all duration-200';

  const baseClasses = [
    bgClasses,
    borderClasses,
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
                        ${subtitle ? 'pb-2' : 'pb-4'} ${subtitle || (children && padding !== 'none') ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}>
          <div>
            {title && (
              <h3 className={`text-lg font-medium text-gray-900 dark:text-white ${titleClassName}`}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
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
        <div className={`border-t border-gray-200 dark:border-gray-700 ${padding !== 'none' ? paddingClasses[padding] : 'px-5 pb-5'} pt-4 mt-auto`}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;