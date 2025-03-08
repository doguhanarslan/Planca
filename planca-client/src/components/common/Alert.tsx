import React, { useState, useEffect } from 'react';
import { AlertProps } from '@/types';

/**
 * Alert component for notifications
 */
const Alert: React.FC<AlertProps> = ({ 
  type = 'info', 
  title, 
  message, 
  onClose, 
  className = '',
  autoClose = false,
  autoCloseTime = 5000
}) => {
  const [visible, setVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (autoClose && visible) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseTime);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, visible, autoCloseTime]);

  const handleClose = () => {
    setIsExiting(true);
    // Add a small delay before completely removing the alert for animation
    setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, 300);
  };

  if (!visible) return null;

  // Style mappings with dark mode support
  const alertStyles: Record<string, {
    container: string,
    icon: string,
    border: string,
    text: string,
    ring: string,
    button: string
  }> = {
    info: {
      container: 'bg-blue-50 dark:bg-blue-900/20',
      icon: 'text-blue-400 dark:text-blue-300',
      border: 'border-blue-300 dark:border-blue-700',
      text: 'text-blue-800 dark:text-blue-200',
      ring: 'focus:ring-blue-500 dark:focus:ring-blue-400',
      button: 'hover:bg-blue-100 dark:hover:bg-blue-800/50',
    },
    success: {
      container: 'bg-green-50 dark:bg-green-900/20',
      icon: 'text-green-400 dark:text-green-300',
      border: 'border-green-300 dark:border-green-700',
      text: 'text-green-800 dark:text-green-200',
      ring: 'focus:ring-green-500 dark:focus:ring-green-400',
      button: 'hover:bg-green-100 dark:hover:bg-green-800/50',
    },
    warning: {
      container: 'bg-yellow-50 dark:bg-yellow-900/20',
      icon: 'text-yellow-400 dark:text-yellow-300',
      border: 'border-yellow-300 dark:border-yellow-700',
      text: 'text-yellow-800 dark:text-yellow-200',
      ring: 'focus:ring-yellow-500 dark:focus:ring-yellow-400',
      button: 'hover:bg-yellow-100 dark:hover:bg-yellow-800/50',
    },
    error: {
      container: 'bg-red-100 dark:bg-red-900/20',
      icon: 'text-red-400 dark:text-red-300',
      border: 'border-red-300 dark:border-red-700',
      text: 'text-red-800 dark:text-red-200',
      ring: 'focus:ring-red-500 dark:focus:ring-red-400',
      button: 'hover:bg-red-100 dark:hover:bg-red-800/50',
    },
  };

  const currentStyle = alertStyles[type];

  return (
    <div 
      className={`rounded-md border-l-4 p-4 
        ${currentStyle.border} ${currentStyle.container} ${currentStyle.text} ${className}
        transition-all duration-300 ease-in-out transform
        ${isExiting ? 'opacity-0 -translate-y-2' : 'opacity-100'}`} 
      role="alert">
      <div className="flex items-start">
        <div className="flex-shrink-0 pt-0.5">
          {type === 'info' && (
            <svg className={`h-5 w-5 ${currentStyle.icon}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          )}
          {type === 'success' && (
            <svg className={`h-5 w-5 ${currentStyle.icon}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
          {type === 'warning' && (
            <svg className={`h-5 w-5 ${currentStyle.icon}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
          {type === 'error' && (
            <svg className={`h-5 w-5 ${currentStyle.icon}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div className="ml-3 flex-1">
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
                onClick={handleClose}
                className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 
                  ${currentStyle.button} ${currentStyle.ring}`}
                aria-label="Close"
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