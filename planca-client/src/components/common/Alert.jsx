// src/components/common/Alert.jsx
import React, { useState, useEffect } from 'react';

/**
 * Alert component for notifications
 * 
 * @param {Object} props - Component props
 * @param {'info'|'success'|'warning'|'error'} [props.type='info'] - Alert type
 * @param {string} [props.title] - Alert title
 * @param {string|React.ReactNode} props.message - Alert message
 * @param {Function} [props.onClose] - Close handler
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {boolean} [props.autoClose=false] - Whether to auto-close
 * @param {number} [props.autoCloseTime=5000] - Auto-close time in ms
 */
const Alert = ({ 
  type = 'info', 
  title, 
  message, 
  onClose, 
  className = '',
  autoClose = false,
  autoCloseTime = 5000
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoClose && visible) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, autoCloseTime);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, visible, autoCloseTime, onClose]);

  if (!visible) return null;

  const alertClasses = {
    info: 'bg-blue-50 border-blue-300',
    success: 'bg-green-50 border-green-300',
    warning: 'bg-yellow-50 border-yellow-300',
    error: 'bg-red-200/50 border-red-300', // Güncellendi: Daha soluk kırmızı arka plan
  };

  const iconClasses = {
    info: 'text-blue-400',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    error: 'text-red-400',
  };

  const textClasses = {
    info: 'text-blue-800',
    success: 'text-green-800',
    warning: 'text-yellow-800',
    error: 'text-red-700', // Güncellendi: Metin rengi koyulaştırıldı
  };

  const ringClasses = {
    info: 'focus:ring-blue-500',
    success: 'focus:ring-green-500',
    warning: 'focus:ring-yellow-500',
    error: 'focus:ring-red-300', // Güncellendi: Focus ring daha soluk kırmızı
  };

  const hoverClasses = {
    info: 'hover:bg-blue-100',
    success: 'hover:bg-green-100',
    warning: 'hover:bg-yellow-100',
    error: 'hover:bg-red-100',
  };

  return (
    <div className={`rounded-md border-l-4 p-4 ${alertClasses[type]} ${textClasses[type]} ${className}`} role="alert">
      <div className="flex items-start">
        <div className="flex-shrink-0 pt-0.5">
          {type === 'info' && (
            <svg className={`h-5 w-5 ${iconClasses[type]}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          )}
          {type === 'success' && (
            <svg className={`h-5 w-5 ${iconClasses[type]}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
          {type === 'warning' && (
            <svg className={`h-5 w-5 ${iconClasses[type]}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
          {type === 'error' && (
            <svg className={`h-5 w-5 ${iconClasses[type]}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div className="ml-3">
          {title && <h3 className="text-sm font-medium">{title}</h3>}
          <div className={`text-sm ${title ? 'mt-1' : ''}`}>
            {message}
          </div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={() => {
                  setVisible(false);
                  onClose();
                }}
                className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${hoverClasses[type]} ${ringClasses[type]}`}
                aria-label="Kapat"
              >
                <span className="sr-only">Kapat</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;