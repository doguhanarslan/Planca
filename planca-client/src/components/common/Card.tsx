import React from 'react';
import { CardProps } from '@/types';

/**
 * Card component for containing content with clean red and white styling
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
  const shadowClasses: Record<string, string> = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };

  const paddingClasses: Record<string, string> = {
    none: 'p-0',
    sm: 'p-2',
    normal: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };

  const roundedClasses: Record<string, string> = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-3xl',
  };

  // Background and border styles
  const bgClasses = transparent 
    ? 'bg-white/90 backdrop-blur-sm' 
    : 'bg-white';
  
  const borderClasses = border 
    ? 'border border-gray-200' 
    : '';

  // Hover effect
  const hoverClasses = hover 
    ? 'transition-all duration-300 hover:shadow-lg hover:-translate-y-1' 
    : '';

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
        <div className={`flex justify-between items-center ${padding !== 'none' ? paddingClasses[padding] : 'px-4 pt-4'} 
                        border-b border-gray-200 pb-3`}>
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
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
      )}
      
      {/* Card Body Content */}
      <div className={padding !== 'none' ? paddingClasses[padding] : ''}>
        {children}
      </div>
      
      {/* Card Footer */}
      {footer && (
        <div className={`border-t border-gray-200 ${padding !== 'none' ? paddingClasses[padding] : 'px-4 pb-4'} pt-3`}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;