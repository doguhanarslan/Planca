import React from 'react';
import PropTypes from 'prop-types';

const Card = ({ 
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
  transparent = false, // Şeffaflık seçeneği eklendi
  ...props 
}) => {
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-2',
    normal: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };

  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-3xl',
  };

  // Arka plan için şeffaflık seçeneği
  const bgClasses = transparent ? 'bg-white/90 backdrop-blur-sm' : 'bg-white';

  const baseClasses = `
    ${bgClasses}
    ${border ? 'border border-gray-200' : ''}
    ${shadowClasses[shadow]}
    ${roundedClasses[rounded]}
    ${hover ? 'transition-shadow duration-300 hover:shadow-lg' : ''}
    ${className}
  `;

  return (
    <div className={baseClasses} {...props}>
      {(title || actions) && (
        <div className={`flex justify-between items-center ${padding !== 'none' ? paddingClasses[padding] : 'px-4 pt-4'} border-b border-gray-200 pb-3`}>
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
      
      <div className={padding !== 'none' ? paddingClasses[padding] : ''}>
        {children}
      </div>
      
      {footer && (
        <div className={`border-t border-gray-200 ${padding !== 'none' ? paddingClasses[padding] : 'px-4 pb-4'} pt-3`}>
          {footer}
        </div>
      )}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  title: PropTypes.node,
  titleClassName: PropTypes.string,
  subtitle: PropTypes.node,
  footer: PropTypes.node,
  actions: PropTypes.node,
  shadow: PropTypes.oneOf(['none', 'sm', 'md', 'lg', 'xl']),
  padding: PropTypes.oneOf(['none', 'sm', 'normal', 'lg', 'xl']),
  border: PropTypes.bool,
  rounded: PropTypes.oneOf(['none', 'sm', 'md', 'lg', 'xl', 'full']),
  hover: PropTypes.bool,
  transparent: PropTypes.bool, // Yeni prop tipini ekledik
};

export default Card;