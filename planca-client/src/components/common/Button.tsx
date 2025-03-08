import React from 'react';
import { ButtonProps } from '@/types';
import { colors, componentThemes } from '@/styles/designSystem';

/**
 * Modern Button component with enhanced visual effects and transitions
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
  // Tailwind ile doğrudan CSS değişkenleri yerine colors nesnesini kullanma örnekleri
  // Bu örneklerde inline styles kullanarak colors nesnesinden değerleri alıyoruz
  const getButtonStyle = () => {
    // Tailwind sınıflarına ek olarak inline stil nesnesi oluştur
    const buttonStyle: React.CSSProperties = {};
    
    // Buton varyantına göre arka plan ve hover renklerini ayarla
    if (variant === 'primary') {
      buttonStyle.backgroundColor = colors.primary[600]; // Normal durumda
      // Hover stil için CSS değişkenlerini kullanabiliriz 
      buttonStyle['--hover-bg'] = colors.primary[700]; // Hover durumunda
    } 
    else if (variant === 'secondary') {
      buttonStyle.backgroundColor = colors.success[600]; // Emerald yerine success kullandım
    }
    else if (variant === 'outline') {
      buttonStyle.borderColor = colors.secondary[300];
      buttonStyle.color = colors.secondary[700];
    }
    
    return buttonStyle;
  };

  // Base classes using component themes
  const baseClasses = componentThemes.button.interactions.base;
  
  // Get variant classes from component themes
  const getVariantClasses = (variant: string): string => {
    if (componentThemes.button.variants[variant]) {
      const variantTheme = componentThemes.button.variants[variant];
      return `${variantTheme.base} ${variantTheme.hover} ${variantTheme.active} ${variantTheme.focus}`;
    }
    
    // Fallback to primary if variant not found
    const primaryTheme = componentThemes.button.variants.primary;
    return `${primaryTheme.base} ${primaryTheme.hover} ${primaryTheme.active} ${primaryTheme.focus}`;
  };
  
  // Get size classes from component themes
  const sizeClass = componentThemes.button.sizes[size] || componentThemes.button.sizes.md;
  
  // Get border radius from component themes
  const roundedClass = componentThemes.button.rounded[rounded] || componentThemes.button.rounded.md;
  
  // Get disabled classes
  const disabledClass = disabled || isLoading ? 
    (variant && componentThemes.button.variants[variant].disabled) || 
    componentThemes.button.variants.primary.disabled : '';
  
  // Combine all classes
  const classes = [
    baseClasses,
    getVariantClasses(variant),
    sizeClass,
    roundedClass,
    disabledClass,
    fullWidth ? 'w-full' : '',
    className
  ].join(' ');

  // İsteğe bağlı olarak custom renkleri ve stilleri uygula
  // Farklı yaklaşım olarak doğrudan css style nesnesi ile styles={{}} şeklinde de kullanabilirsiniz
  const customButtonStyle = props.style || {};
  const buttonStyle = {
    ...getButtonStyle(),
    ...customButtonStyle
  };

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || isLoading}
      onClick={onClick}
      style={buttonStyle} // Stil nesnesini buraya ekledik
      {...props}
    >
      {isLoading ? (
        <>
          <svg 
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
            style={{ color: colors.secondary[100] }} // Loading ikon rengini colors nesnesinden alıyoruz
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{loadingText || 'Yükleniyor...'}</span>
        </>
      ) : (
        <>
          {icon && (
            <span 
              className={`flex-shrink-0 ${children ? 'mr-2' : ''}`}
              style={{ color: variant === 'outline' ? colors.primary[600] : 'inherit' }} // İkon rengini ayarla
            >
              {icon}
            </span>
          )}
          {children && <span className="flex-shrink-0">{children}</span>}
        </>
      )}
    </button>
  );
};

export default Button;