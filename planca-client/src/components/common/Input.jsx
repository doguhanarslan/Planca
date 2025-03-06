// src/components/common/Input.jsx
import React, { forwardRef } from 'react';

/**
 * Input component with various styles and states
 * 
 * @param {Object} props - Component props
 * @param {string} [props.type='text'] - Input type
 * @param {string} props.name - Input name
 * @param {string} [props.id] - Input id
 * @param {string} [props.label] - Input label
 * @param {string} [props.placeholder] - Input placeholder
 * @param {string|number} [props.value] - Input value
 * @param {Function} [props.onChange] - Change handler
 * @param {Function} [props.onBlur] - Blur handler
 * @param {string} [props.error] - Error message
 * @param {boolean} [props.touched] - Whether field was touched
 * @param {boolean} [props.required=false] - Whether field is required
 * @param {boolean} [props.disabled=false] - Whether field is disabled
 * @param {boolean} [props.readOnly=false] - Whether field is read-only
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {string} [props.containerClassName=''] - Container CSS classes
 * @param {string} [props.labelClassName=''] - Label CSS classes
 * @param {string} [props.helpText] - Help text
 * @param {React.ReactNode} [props.leftIcon] - Left icon
 * @param {React.ReactNode} [props.rightIcon] - Right icon
 */
const Input = forwardRef(({
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
  
  const inputClasses = `
    block w-full rounded-md border shadow-sm py-3
    transition-colors duration-200
    ${hasError 
      ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-300 focus:border-red-300' 
      : 'border-gray-300 focus:ring-red-300 focus:border-red-300'
    }
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
    ${readOnly ? 'bg-gray-50 cursor-default' : ''}
    ${leftIcon ? 'pl-10' : 'pl-4'}
    ${rightIcon ? 'pr-10' : 'pr-4'}
    ${className}
  `;

  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && (
        <label htmlFor={uniqueId} className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}>
          {label} {required && <span className="text-red-300">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
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
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
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
        <p className="mt-2 text-sm text-red-600" id={`${uniqueId}-error`}>
          {error}
        </p>
      )}
      
      {helpText && !hasError && (
        <p className="mt-2 text-sm text-gray-500" id={`${uniqueId}-description`}>
          {helpText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;