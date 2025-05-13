import { forwardRef } from 'react';
import { InputProps } from '@/types';

/**
 * Modern Input component with enhanced visual effects and interactions
 */
const Input = forwardRef<HTMLInputElement, InputProps>(({
  type = 'text',
  name,
  id,
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  touched,
  required = false,
  disabled = false,
  readOnly = false,
  className = '',
  containerClassName = '',
  labelClassName = '',
  helpText,
  leftIcon,
  rightIcon,
  ...props
}, ref) => {
  const hasError = error && touched;
  const uniqueId = id || name;
  
  // Enhanced base input classes with improved transitions and states
  const baseInputClasses = `
    block w-full rounded-lg shadow-sm py-3 
    transition-all duration-200 ease-in-out
     focus:ring-opacity-50 text-gray-600
    
    ${disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-75' : ''}
    ${readOnly ? 'bg-gray-50 text-gray-400 cursor-default ' : ''}
    ${leftIcon ? 'pl-10' : 'pl-4'}
    ${rightIcon ? 'pr-10' : 'pr-4'}
  `;
  
  const inputClasses = `${baseInputClasses} ${className}`;

  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && (
        <label 
          htmlFor={uniqueId} 
          className={`block text-sm font-medium mb-2 transition-colors duration-200
            text-gray-400
            ${labelClassName}`
          }
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          id={uniqueId}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          readOnly={readOnly}
          className={inputClasses}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={hasError ? `${uniqueId}-error` : helpText ? `${uniqueId}-description` : undefined}
          {...props}
        />
        
        {rightIcon && !hasError && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-800">
            {rightIcon}
          </div>
        )}
        
        {hasError && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      
      {hasError && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400 animate-fadeIn" id={`${uniqueId}-error`}>
          {error}
        </p>
      )}
      
      {helpText && !hasError && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400" id={`${uniqueId}-description`}>
          {helpText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;